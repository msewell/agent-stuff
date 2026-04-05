# TCR Foundations and Autonomy Levels

## Table of Contents

- [What Is TCR?](#what-is-tcr)
- [How It Works](#how-it-works)
- [What TCR Teaches](#what-tcr-teaches)
- [Why TCR and AI Agents Are a Natural Fit](#why-tcr-and-ai-agents-are-a-natural-fit)
- [Autonomy Levels](#autonomy-levels)

---

## What Is TCR?

**test && commit || revert** (TCR) is a programming workflow invented in 2018
by Kent Beck, Lars Barlindhaug, Oddmund Strømme, and Ole Johannessen. After
every change, if the tests pass the code is automatically committed — and if
they fail, the code is automatically reverted to the last green state.

The core command:

```bash
test && git commit -am "working" || git checkout .
```

## How It Works

1. Make a change (code, tests, or both).
2. The test suite runs.
3. **Tests pass** → changes are committed automatically.
4. **Tests fail** → changes are reverted automatically. Code snaps back to
   the last known-good state.

There is no "red" phase. Every change that persists must leave the system green.

## What TCR Teaches

- **Smaller steps.** Decompose work into the smallest possible increments
  that can pass tests.
- **Less sunk-cost attachment.** After repeated reverts, you start planning
  changes that survive.
- **YAGNI and KISS enforcement.** Large speculative changes get reverted.
  Small, targeted ones survive.
- **Fatigue detection.** Reverts increase as energy drops — bigger steps get
  attempted and fail more often.

---

## Why TCR and AI Agents Are a Natural Fit

### LLMs perform best on small, well-defined tasks

The bigger and less defined a task, the more likely an LLM is to drift. TCR
enforces small batch sizes by design — any change too large or too risky to
pass tests gets reverted.

### Broken code pollutes context

When an LLM generates a breaking change, that broken code enters the context
window. The model cannot distinguish working code from broken code. Subsequent
generations build on a polluted foundation, compounding errors. TCR prevents
this by snapping back to green immediately on failure.

### Agents lack sunk-cost bias

Agents have no attachment to reverted code. They simply try again from a clean
state — making them ideal TCR practitioners.

### Tests become executable specifications

In a TCR workflow, tests verify correctness *and* specify intent. Writing a
test and generating code to make it pass is the most precise form of AI
prompting available.

### Automatic safety net

Any agent-generated modification that breaks existing tests gets automatically
reverted. All surviving changes keep the system green. This is a hard
mechanical constraint — not a prompt asking the agent to be careful.

---

## Autonomy Levels

TCR applies differently depending on how much autonomy the agent has.

### Level 1: Human Writes Code, Agent Assists (Copilot-Style)

The human is the primary author. The AI provides completions and suggestions.
TCR runs as a file-watcher or on-save hook.

**Recommended variant:** Relaxed (revert production code only, preserve tests).

**Value:** Catches cases where an AI suggestion looks plausible but subtly
breaks something.

### Level 2: Human Directs, Agent Implements (Chat-Based)

The human writes tests or specifications. The agent generates implementation.
After the agent proposes changes, TCR runs before changes are finalized.

**Recommended variant:** Relaxed with stash-based recovery.

**Value:** Tight feedback loop. Human focuses on *what* (tests), agent focuses
on *how* (implementation), TCR mediates the handoff.

### Level 3: Agent Loops Autonomously, Human Reviews Output

The agent runs in a loop — generating code, running tests, iterating on
failures, committing on success. The human reviews after the fact.

**Recommended variant:** Hard revert (classic TCR). The agent has no emotional
attachment to code and benefits from the strongest possible reset on failure.

**Value:** Prevents the fix→break→fix→revert death spiral. A hard revert
forces the agent back to known-good state, breaking the spiral.

### Level 4: Multi-Agent Systems

Multiple agents work in parallel on different features, merging into a shared
codebase. Each agent runs its own TCR loop on its own branch or worktree.

**Recommended variant:** Hard revert at the individual agent level. The
Collaborator variant (automatic push/pull synchronization) at the integration
level.

**Value:** Closest to Beck's original Limbo vision — each agent's TCR loop
ensures its own changes are green; integration TCR ensures the combined result
is green.
