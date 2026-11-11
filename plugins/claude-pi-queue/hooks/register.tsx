import { atom, read, update } from 'claude-code'
import type { EngineInterface, PromptSubmitInput, Register } from 'claude-code'

import type { Held } from '../types'

const TAKE_BACK = 'pi-queue-take-back'

// In `$.state`, so a reload of the mod keeps what is held.
const held = atom({ plugin: 'pi-queue', key: 'held' } as const, [] as Held)

// Module variables, not state: a reload resets them, which at worst skips a
// pending clear or lets the next follow-up go before the in-flight one started.
let isClearArmed = false
// One marker per resend, so a resend from before a `/clear` that settles late
// can't clear the marker of the one that replaced it.
let inFlight: object | undefined
// Claude Code admits a handed-over prompt through `prompt.submit` only as its
// turn starts, which can be after a `/clear`. Each resend remembers the
// conversation it was handed over in; Claude Code admits them in order.
const awaitingAdmission: Array<{ sessionId: string }> = []

/** The person's own Option+Enter while a turn runs; everything else passes through. */
function isFollowUp(e: PromptSubmitInput): boolean {
  return e.wait === true && e.turnId !== undefined && e.origin.kind === 'composer' && e.command === undefined
}

/** Puts `texts` ahead of the draft, oldest first; false when the box refused. */
async function putBack($: EngineInterface, texts: Held): Promise<boolean> {
  isClearArmed = false
  if (texts.length === 0) return true
  const box = await $.prompt.read()
  const text = [...texts, box.text].filter(part => part.trim() !== '').join('\n\n')
  const { isFilled } = await $.prompt.fill({ text })
  if (!isFilled) $.ui.toast('pi-queue: the input box is busy; follow-ups stay held')

  return isFilled
}

/** Takes the oldest `count` out of `held` in one write, so no concurrent hook takes them too. */
async function takeFromHeld($: EngineInterface, count: number): Promise<Held> {
  let taken: Held = []
  await update($, held, list => {
    taken = list.slice(0, count)

    return list.slice(count)
  })

  return taken
}

/** Puts `texts` back into the box, or back at the front of `held` when the box refused. */
async function restore($: EngineInterface, texts: Held): Promise<boolean> {
  const isBack = await putBack($, texts)
  if (!isBack) await update($, held, list => [...texts, ...list])

  return isBack
}

async function takeBackAll($: EngineInterface): Promise<void> {
  await restore($, await takeFromHeld($, Infinity))
}

async function returnDropped($: EngineInterface, text: string): Promise<void> {
  if (await restore($, [text])) $.ui.toast('pi-queue: a follow-up was not sent; it is back in the input box')
}

/**
 * Hands the oldest held follow-up to Claude Code, unless one is still waiting
 * for its turn. Not awaited: `$.prompt.submit` resolves only once that turn starts.
 */
async function release($: EngineInterface): Promise<void> {
  if (inFlight !== undefined) return
  const mine = {}
  inFlight = mine
  const done = () => {
    if (inFlight === mine) inFlight = undefined
  }
  let sessionId: string
  let text: string | undefined
  try {
    sessionId = await $.session.id()
    ;[text] = await takeFromHeld($, 1)
  } catch (error) {
    done()
    throw error
  }
  if (text === undefined) return done()
  awaitingAdmission.push({ sessionId })
  void $.prompt
    .submit({ text, asUser: true })
    .then(
      sent => (sent.drop === undefined ? undefined : returnDropped($, text)),
      () => returnDropped($, text),
    )
    .finally(done)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: TAKE_BACK,
      description: 'Put held follow-ups back into the input box (Option+Up)',
      immediate: true,
    })

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind === 'plugin' && e.origin.name === 'pi-queue') {
      const handedOver = awaitingAdmission.shift()
      const isStale = handedOver !== undefined && handedOver.sessionId !== (await $.session.id())

      return isStale ? { drop: 'Follow-up from before /clear not sent' } : next(e)
    }
    if (!isFollowUp(e)) return next(e)
    if (e.attachments !== undefined && e.attachments.length > 0) {
      return { drop: "Follow-ups can't carry attachments. Press Enter to send it as steering, or send it after the turn." }
    }
    await update($, held, list => [...list, e.text])
    isClearArmed = true

    return { drop: 'Follow-up held' }
  })

  // The engine puts a dropped prompt's text back into the box after the hook;
  // clear that put-back, unless the person typed first. Only the engine's own
  // write counts, so the mod's fills and history recalls are never wiped.
  on('prompt.change', async ($, e, next) => {
    if (isClearArmed && e.origin.kind === 'engine' && e.text !== '') {
      isClearArmed = false
      await $.prompt.fill({ text: '' })
    }

    return next(e)
  })

  on('prompt.edit', ($, e, next) => {
    isClearArmed = false

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined) return result
    if (e.reason === 'answer') await release($)
    if (e.reason === 'aborted') await takeBackAll($)

    return result
  })

  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear' || e.reason === 'resume') {
      // A resend still queued belongs to the conversation that ended.
      inFlight = undefined
      await takeBackAll($)
    }

    return next(e)
  })

  on('command.run', { command: TAKE_BACK }, async $ => {
    await takeBackAll($)

    return {}
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, held)
    if (e.props.hasSurvey || list.length === 0) return next(e)
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {list.map(text => (
          <Text dimColor wrap="truncate-end">
            Follow-up: {text.split('\n')[0]}
          </Text>
        ))}
        <Text dimColor>↳ option+up to edit all queued messages</Text>
      </Box>
    )
  })
}
