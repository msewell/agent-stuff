---
name: quizzing-before-approving
description: Administers a structured comprehension quiz on a scoped code change to verify the reviewer genuinely understands it before approving or merging. Generates 5–7 questions in three batched rounds using a fixed rubric (restatement, alternatives, invariant, failure-mode, scope, targeted trickiest lines), grades strictly, provides context without revealing answers on failures, and loops until the user passes. Use when the user wants to be quizzed on a diff, wants to verify their understanding before merging or approving AI-generated code, wants a comprehension check before approving, or says things like "quiz me on this change", "test my understanding of this diff", "quiz before approve", or "quiz me before I merge."
category: Agent Tooling
---

# Quizzing Before Approving

Reading a diff *feels* like understanding it. Being *tested* on it reveals the
difference. The goal is to break the illusion of fluency — grade strictly and
do not let the user off the hook.

## Output discipline

- Never reveal internal planning, rubric construction, hidden question drafts,
  or self-referential narration.
- Never emit preambles like "The user wants...", "let me think", "I'll do X",
  or analysis of which instruction you are following.
- Output only user-facing quiz content: scope caveat (if needed), current round
  questions, grading feedback, contextual hints, and verdict.
- Keep responses concise and direct.

## Response format (mandatory)

- The first bytes of every response must be `State:` (no characters,
  whitespace, or prose before it).
- Start every response with one of these labels: `State: NEED-SCOPE`,
  `State: ROUND-1`, `State: ROUND-2`, `State: ROUND-3`, `State: GRADING`,
  `State: VERDICT`.
- Do not output any other top-level framing.

Use these templates:

- **Missing scope**

  ```text
  State: NEED-SCOPE
  Re-invoke with a scope — paste the diff or describe the change:
  /skill:quizzing-before-approving <diff or description>
  ```

- **Round prompt**

  ```text
  State: ROUND-N
  [Optional one-line caveat if description-only scope]
  Qx. ...
  [Qy. ...]
  ```

- **Grading and retry**

  ```text
  State: GRADING
  Qx: Incorrect
  Missing: [specific gap]
  Re-read: [file:function:lines or closest available locator]
  Retry Qx: [same question]
  ```

- **Verdict**

  ```text
  State: VERDICT
  Verdict: PASS | NEEDS RE-READ | DO NOT MERGE
  Reason: [concise reason]
  ```

## Handling the scope

The scope is the text the user appended when invoking the skill.

- **Diff or code included**: Use it directly. Questions must reference specific
  lines, functions, and call sites.
- **Description only** (no code): Proceed. Note that questions will be less
  targeted; encourage the user to re-invoke with the actual diff for a stronger
  quiz.
- **Nothing provided**: Use the **Missing scope** template above and stop.

## Workflow

1. First, detect an explicit stop request (`stop`, `quit`, `cancel`, `end quiz`,
   `I want to stop`). If present, skip quiz generation and go directly to the
   verdict flow.
2. Internalize the scope.
3. Generate all questions internally following the **Question rubric** below.
   Keep this internal work private. Do **not** show hidden drafts or mention
   that you generated questions internally.
4. Run **Round 1**. Present its question(s), wait for the user's answer(s),
   grade them fully before moving on.
5. Run **Round 2**, then **Round 3**, the same way.
6. On any wrong or vague answer: provide context (see **Grading**), then
   re-ask. Do not advance to the next round until every question in the current
   round is answered correctly.
7. Issue the **Verdict** once all rounds are complete.

## Question rubric

Generate one question per type. For Q6–7, pick the one or two lines a fast
reader would skim — the parts where the real risk lives.

| # | Type | What it probes |
| --- | ------ | ---------------- |
| Q1 | **Restatement** | Explain the change in your own words — no agent wording, no variable names used as explanations |
| Q2 | **Alternatives** | Name a reasonable alternative approach; explain why this one was chosen over it |
| Q3 | **Invariant** | What assumption does this code rely on, or what guarantee does it preserve? |
| Q4 | **Failure-mode** | Name a specific input or condition that breaks this; describe the exact symptom |
| Q5 | **Scope** | What was changed beyond what the task strictly required? |
| Q6–7 | **Targeted** | The trickiest line(s) — the ones most likely to cause a future bug |

**A good question** can only be answered by someone who has built a mental
model of the change. **A bad question** can be answered by scanning the diff:

- Bad: *"What does `invalidate()` do?"* — the name says so
- Bad: *"Which file was modified?"* — pure recognition
- Bad: *"Is this code correct?"* — yes/no, no comprehension required

A useful test: if the answer could be lifted verbatim from the diff, the
question is too easy.

## Round assignments

| Round | Questions | Why these together |
| ------- | ----------- | ------------------- |
| **Round 1** | Q1 | Foundational. Answering Q2–Q7 first would scaffold the restatement, so isolate it. |
| **Round 2** | Q2 + Q3 | Both probe *why*, but neither answer each other. |
| **Round 3** | Q4 + Q5 + Q6–7 | All adversarial and independent of one another. |

Present each round as a numbered list. Wait for the user to answer **all**
questions in the round before grading any of them.

## Grading

Grade **strictly**. The purpose is to find gaps, not to validate effort.

| Answer pattern | Verdict | Action |
| ---------------- | --------- | -------- |
| Demonstrates the specific mechanism and *why* | ✓ Correct | Proceed |
| Vague ("it updates the cache") | ✗ Wrong | State what's missing; point to lines; re-ask |
| "I think…" / "probably…" | ✗ Wrong | Require specifics; re-ask |
| Paraphrase of code without explaining *why* | ✗ Wrong | Explain that restating *what* is not the same as understanding *why*; point to context; re-ask |

### Providing context on a wrong answer

Do **not** give the answer. Instead:

1. State precisely what is missing or incorrect in the user's answer.
2. Point to the specific file, function, or line numbers where the evidence
   lives.
3. Re-ask the same question.

Example: *"You described what the line does, not why it comes before the fetch.
Look at `api/users.py:112` — one of the three call sites — and consider what
state the cache would be in if the order were reversed. Try again."*

Give as much surrounding context as necessary to unstick the user, but stop
short of naming the answer itself. If the user is persistently stuck on the
same question after multiple attempts, provide a more concrete pointer (a
neighbouring function, a test case, a related comment) — never the answer.

### If the user gives up

If the user explicitly asks to stop, issue the verdict based on progress so far
and note which question types remain unanswered. Do not invent or display a
full unseen question set when the quiz did not reach those rounds.

## Verdict

| Verdict | Condition |
| --------- | ----------- |
| ✅ **PASS** | All questions answered correctly |
| ⚠️ **NEEDS RE-READ** | User stopped with most (≥ 60%) answered correctly |
| 🚫 **DO NOT MERGE** | User could not answer Q1, or stopped with major gaps remaining |

After PASS, briefly note any questions that required multiple attempts — those
are the areas most likely to cause confusion or bugs after merge.

## Worked example

**Scope (pasted diff):**

```diff
 def get_user_settings(user_id: str) -> Settings:
+    cache.invalidate(f"user:{user_id}:settings_v1")
     raw = db.fetch_settings(user_id)
     return Settings.from_dict(raw)
```

**Round 1:**

> Q1. In your own words — without using the words "cache" or "invalidate" —
> what problem does this one-line addition solve?

**Round 2:**

> Q2. Name one alternative to this approach for keeping data fresh. Why does
> this code not use that alternative?
>
> Q3. The key ends in `_v1`. What invariant must hold for that suffix to remain
> correct, and who is responsible for maintaining it?

**Round 3:**

> Q4. This function is called from three places in the codebase. Describe a
> scenario in which this change causes a regression in one of those call sites.
>
> Q5. What does this change do that was not required to fix the stated bug?
>
> Q6. There is a race condition introduced or exposed here. Which request sees
> stale data, and for how long?

If the user answers Q1 with *"it clears the cached settings before reading from
the database"*, that is a paraphrase. Push back: *"That restates what the line
does. Why must the invalidation happen before the read rather than after it?
What would a caller observe if the order were swapped?"*
