import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type {
  On,
  PromptChangeInput,
  PromptChangeResult,
  PromptEditInput,
  PromptEditResult,
  PromptSubmitInput,
  TurnCompleteInput,
} from 'claude-code'

const BAND = {
  plugin: 'pi-queue',
  component: 'AbovePrompt',
  surface: 'terminal',
  props: { hasSurvey: false, isCollapsed: false, isWorking: true, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

// The kit raises these at runtime, but its `Engine` type doesn't list them.
type BoxEvents = {
  change: (e: PromptChangeInput) => Promise<PromptChangeResult>
  edit: (e: PromptEditInput) => Promise<PromptEditResult>
}
const boxEvents = ($: Engine) => $.prompt as Engine['prompt'] & BoxEvents

/** Stands in for the engine beneath the mod: the input box and what the mod sends. */
function engine(on: On) {
  const box = { text: '', isBusy: false }
  const sent: string[] = []
  const pending: Array<{ resolve: (result: { text: string } | { drop: string }) => void; reject: (error: Error) => void }> = []
  const fillWaiters: Array<() => void> = []
  const writeWaiters: Array<() => void> = []
  const sendWaiters: Array<() => void> = []
  // The conversation each `$.session.id()` call sees, in order; the last one stays.
  const conversations = ['s1']
  on('session.id', () => ({ value: conversations.length > 1 ? (conversations.shift() ?? '') : (conversations[0] ?? '') }))
  on('command.register', () => ({ value: { command: 'pi-queue-take-back' } }))
  on('prompt.read', () => ({ value: { text: box.text, cursor: 0 } }))
  on('prompt.fill', (_, e) => {
    fillWaiters.splice(0).forEach(resolve => resolve())
    if (box.isBusy) return { isFilled: false, refusal: 'dialog', text: box.text, cursor: 0 }
    box.text = e.text

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })
  on('prompt.submit', (_, e) => {
    if (e.origin.kind !== 'plugin') return { text: e.text }
    sent.push(e.text)
    sendWaiters.splice(0).forEach(resolve => resolve())

    // Settles when the test says the follow-up's turn has started, or was dropped.
    return new Promise((resolve, reject) => pending.push({ resolve, reject }))
  })
  on('state.set', async (_, e, next) => {
    const written = await next(e)
    writeWaiters.splice(0).forEach(resolve => resolve())

    return written
  })
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('prompt.change', (_, e) => ({ text: e.text }))
  on('prompt.edit', (_, e) => ({ text: e.text, cursor: e.cursor }))
  on('session.end', (_, e) => ({ sessionId: e.sessionId }))

  const nextFill = () => new Promise<void>(resolve => fillWaiters.push(resolve))
  const nextWrite = () => new Promise<void>(resolve => writeWaiters.push(resolve))
  const nextSend = () => new Promise<void>(resolve => sendWaiters.push(resolve))

  return { box, sent, pending, nextFill, nextWrite, nextSend, conversations }
}

/** One dispatch through the mod's worker, so continuations it already received have run. */
const settle = ($: Engine) => boxEvents($).change({ text: '', cursor: 0, origin: { kind: 'engine' } })

const typed = (text: string, fields: Partial<PromptSubmitInput> = {}): PromptSubmitInput => ({
  text,
  wait: true,
  turnId: 't1',
  origin: { kind: 'composer' },
  ...fields,
})

function ended(reason: TurnCompleteInput['reason'], agentId?: string): TurnCompleteInput {
  const fields = { answer: '', durationMs: 1, isAborted: reason === 'aborted', turnId: 't1', agentId }

  return reason === 'refusal'
    ? { ...fields, reason, refusal: { category: null, explanation: null } }
    : { ...fields, reason }
}

/** An answered main turn that hands a follow-up over; resolves once it reached the engine. */
async function answeredWithSend($: Engine, nextSend: () => Promise<void>): Promise<void> {
  const sending = nextSend()
  await $.turn.complete(ended('answer'))
  await sending
}

async function band($: Engine): Promise<string[]> {
  const ui = await $.ui.mount(BAND)
  const rows = (await ui.findAll({ type: 'Text' })).map(row => row.text)
  await ui.unmount()

  return rows
}

test('follow-ups go out oldest first, one per answered main turn, never two in flight', async ($, on) => {
  const { sent, pending, nextSend } = engine(on)
  expect(await $.prompt.submit(typed('first'))).toEqual({ drop: 'Follow-up held' })
  await $.prompt.submit(typed('second'))

  await answeredWithSend($, nextSend)
  expect(sent).toEqual(['first'])

  await $.turn.complete(ended('answer'))
  expect(sent).toEqual(['first'])

  pending[0]?.resolve({ text: 'first' })
  await settle($)
  await answeredWithSend($, nextSend)
  expect(sent).toEqual(['first', 'second'])
  expect(await band($)).toEqual([])
})

test('steering, idle prompts and slash commands pass through; subagents, errors and refusals release nothing', async ($, on) => {
  const { sent } = engine(on)
  expect(await $.prompt.submit(typed('steer', { wait: false }))).toEqual({ text: 'steer' })
  expect(await $.prompt.submit(typed('idle', { turnId: undefined }))).toEqual({ text: 'idle' })
  expect(await $.prompt.submit(typed('/compact', { command: { name: 'compact', args: '' } }))).toEqual({ text: '/compact' })

  await $.prompt.submit(typed('held'))
  await $.turn.complete(ended('answer', 'agent-1'))
  await $.turn.complete(ended('error'))
  await $.turn.complete(ended('refusal'))

  expect(sent).toEqual([])
  expect(await band($)).toEqual(['Follow-up: held', '↳ option+up to edit all queued messages'])
})

test('a prompt with an attachment is never held', async ($, on) => {
  engine(on)
  const result = await $.prompt.submit(typed('look[Image #1]', { attachments: [{ type: 'image' }] }))

  expect(result.drop).toMatch(/can't carry attachments/)
  expect(await band($)).toEqual([])
})

test('the engine\'s put-back after a hold is cleared, unless the person typed first', async ($, on) => {
  const { box } = engine(on)
  await $.prompt.submit(typed('one'))
  box.text = 'one'
  await boxEvents($).change({ text: 'one', cursor: 3, origin: { kind: 'engine' } })
  expect(box.text).toBe('')

  await $.prompt.submit(typed('two'))
  await boxEvents($).edit({ text: '', cursor: 0, start: 0, end: 0, inputText: 'x', origin: { kind: 'composer' } })
  box.text = 'x'
  await boxEvents($).change({ text: 'x', cursor: 1, origin: { kind: 'engine' } })
  expect(box.text).toBe('x')
})

test('a history recall is never cleared, and a take-back cancels the pending clear', async ($, on) => {
  const { box } = engine(on)
  await $.prompt.submit(typed('held'))
  await boxEvents($).change({ text: 'recalled', cursor: 8, origin: { kind: 'history' } })
  await $.command.run({ command: 'pi-queue-take-back', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })
  await boxEvents($).change({ text: box.text, cursor: 0, origin: { kind: 'engine' } })
  expect(box.text).toBe('held')
})

test('an interrupt puts follow-ups back oldest first, ahead of the draft; a busy box keeps them held', async ($, on) => {
  const { box, sent } = engine(on)
  await $.prompt.submit(typed('a'))
  await $.prompt.submit(typed('b'))

  box.isBusy = true
  await $.turn.complete(ended('aborted'))
  expect(await band($)).toEqual(['Follow-up: a', 'Follow-up: b', '↳ option+up to edit all queued messages'])

  box.isBusy = false
  box.text = 'draft'
  await $.turn.complete(ended('aborted'))
  expect(box.text).toBe('a\n\nb\n\ndraft')
  expect(sent).toEqual([])
  expect(await band($)).toEqual([])
})

test('take-back and /clear put follow-ups back', async ($, on) => {
  const { box } = engine(on)
  await $.prompt.submit(typed('a'))
  expect(await $.command.run({ command: 'pi-queue-take-back', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })).toEqual({})
  expect(box.text).toBe('a')

  box.text = ''
  await $.prompt.submit(typed('b'))
  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } })
  expect(box.text).toBe('b')
})

test('a dropped resend goes back into the box, ahead of follow-ups already there', async ($, on) => {
  const { box, pending, nextFill, nextSend } = engine(on)
  await $.prompt.submit(typed('older'))
  await $.prompt.submit(typed('newer'))
  await answeredWithSend($, nextSend)
  await $.turn.complete(ended('aborted'))
  expect(box.text).toBe('newer')

  const filled = nextFill()
  pending[0]?.resolve({ drop: 'removed from the queue' })
  await filled
  expect(box.text).toBe('older\n\nnewer')
})

test('a reload keeps the held list', async ($, on) => {
  engine(on)
  // What the mod stored before the reload stays in `$.state`.
  on('state.get', () => ({ value: { value: ['kept'], version: 1 } }))

  expect(await band($)).toEqual(['Follow-up: kept', '↳ option+up to edit all queued messages'])
})

test('a dropped resend stays held, oldest first, when the box is busy', async ($, on) => {
  const { box, pending, nextWrite, nextSend } = engine(on)
  await $.prompt.submit(typed('older'))
  await $.prompt.submit(typed('newer'))
  await answeredWithSend($, nextSend)

  box.isBusy = true
  const written = nextWrite()
  pending[0]?.resolve({ drop: 'removed from the queue' })
  await written
  expect(await band($)).toEqual(['Follow-up: older', 'Follow-up: newer', '↳ option+up to edit all queued messages'])
})

test('a rejected resend goes back into the box', async ($, on) => {
  const { box, pending, nextFill, nextSend } = engine(on)
  await $.prompt.submit(typed('lost?'))
  await answeredWithSend($, nextSend)

  const filled = nextFill()
  pending[0]?.reject(new Error('the engine refused the call'))
  await filled
  expect(box.text).toBe('lost?')
})

test('a resend from before /clear that settles late does not free the next one\'s slot', async ($, on) => {
  const { sent, pending, nextSend } = engine(on)
  await $.prompt.submit(typed('old'))
  await answeredWithSend($, nextSend)
  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } })

  await $.prompt.submit(typed('new1'))
  await $.prompt.submit(typed('new2'))
  await answeredWithSend($, nextSend)
  pending[0]?.resolve({ text: 'old' })
  await settle($)
  await $.turn.complete(ended('answer'))

  expect(sent).toEqual(['old', 'new1'])
})

test('a follow-up admitted after /clear switched conversations is refused and goes back into the box', async ($, on) => {
  const { box, sent, nextFill, conversations } = engine(on)
  await $.prompt.submit(typed('before clear'))
  // Handed over in s1; by the time Claude Code admits it, /clear has switched to s2.
  conversations.splice(0, conversations.length, 's1', 's2')

  const filled = nextFill()
  await $.turn.complete(ended('answer'))
  await filled
  expect(sent).toEqual([])
  expect(box.text).toBe('before clear')
})
