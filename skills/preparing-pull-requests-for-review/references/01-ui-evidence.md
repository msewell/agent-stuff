# UI evidence

## Pick evidence for the claim

| Claim under review | Default evidence |
| --- | --- |
| Settled layout, copy, styling, or visual parity | Use labeled, inline before/after stills for the same scenario. For a new component, show it in context and say what makes it appear. |
| Sequence, timing, or transient behavior | Use a brief, controllable clip. For a regression, show the same interaction before and after. State the action and expected outcome in text; label the relevant moment. |
| Behavior across routes, roles, inputs, or data flow | Deep-link a revision-identified preview with steps and expected outcome. Put the key observation inline as a still or clip. If the preview can't exercise the scenario, give a branch build or local path instead. |
| Many component states or variants | Show one representative pair inline and link directly to the changed cases in the full report. Name the tested states and material gaps. |

Pair visual evidence with a check for what it cannot establish. A smaller radio circle can look right while its pointer target shrinks: click within the intended target just outside the visible circle, then verify selection. An image of a focus ring doesn't verify focus order or restoration; exercise the keyboard path. Use semantic inspection or screen-reader checks for names, roles, or announcements. Run applicable automated accessibility checks on the materially changed states, not just the default state. For persistence or deduplication, link an assertion about stored state even if a clip shows the interaction.

## Capture comparable results

1. **Pin the comparison.** Label base and head commit or build. Keep the same route, seeded fixture, role, flags, and appearance settings for both sides. Freeze time and randomness when they affect the result. Wait for render readiness; preserve realistic timing if timing is the claim.
2. **Fix the geometry.** Use the same browser or device, viewport, zoom, pixel ratio, and crop. Keep surrounding context when reflow matters; add a separate, matched pair for another breakpoint. Prioritize failure, recovery, and state variants that could affect the decision.
3. **Make it legible.** Write meaningful image alt text and a caption explaining what to watch. Start the clip shortly before the action and end once the result is clear; show critical inputs and provide timestamps if needed. Don't autoplay. Describe key visual events in text and caption meaningful audio. When a browser test already verifies the behavior, prefer capturing that run and link to the assertion and revision.
4. **Verify preview and artifact usability.** Supply the route, role, fixture, short steps, and expected result. If authorized, check access as the intended reviewer; check logged-out access only if the preview is meant to be public. State expiration and access limitations; preserve a durable, revision-labeled result. A moving branch URL is not proof of a particular build. Use synthetic or scrubbed data; check screen contents, browser chrome, traces, and filenames before sharing.
