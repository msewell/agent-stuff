# Acceptance and rollout

## Start with one authorized slice

Choose one recurring artifact in each target locale with well-defined evidence, an eligible destination, and private staging. Use the same briefs and facts to compare prompt-only drafting, mechanical checks, and grounded review with bounded repair. Pin the policy for the comparison. Keep acceptance cases out of the reviewer’s examples.

Use native professional readers to label material defects and expected dispositions per locale. Include clean prose and acceptable unconventional choices as well as realistic defects such as a lost deadline, unsupported certainty, an awkward calque, or inaccessible structure. Include ordinary jobs under their access and retention policy. Resolve disagreements explicitly rather than treating judge agreement as ground truth.

Run the production path in shadow mode without dispatch. Include good en-US and de-DE packets. Submit a known-bad packet through each permitted route. Disable only the edit-time feedback hook and repeat; leave the authoritative checks enabled and require the expected independent blocker, not just any refusal. Exercise a changed recipient, changed attachment, post-review edit, checker or renderer outage, and ambiguous provider acceptance. Verify the gate fails closed, reports why, and does not retry an uncertain send blindly. A local simulation is useful but does not prove how the real renderer, visibility settings, and release adapter behave.

## Test the reviewer separately

Construct its input with an allowlist: reader-visible content and structure, brief and rules, locale, genre, and relevant evidence. Omit incidental staging paths, draft or model labels, prior grades, and extraneous editor comments. Retain them in protected provenance when useful. Preserve visible titles, meaningful filenames, bylines, and attributions when needed for the reader task or verification.

Through the production reviewer adapter, present identical bytes under different incidental filenames, holding model, prompt, evidence, settings, and examples fixed. Verify what data the model actually receives; an observed difference is a reason to pause, not proof of the cause. Repeat the identical request in fresh sessions to estimate ordinary verdict variation; mix test order and compare effects against that baseline. More passes under one filename do not tell you whether they are false clears or whether the other filename caused unnecessary holds. Use the labels to distinguish them. Test example-set bias separately by varying only the examples, using multiple comparable draws and holding the labeled acceptance set apart. Blind pairwise comparisons, allow ties, and reverse order in a sample; relative preference is not evidence of absolute release fitness.

## Decide with the right denominators

| Signal | Measure |
| --- | --- |
| Blocker recall | Known-defective candidates caught / all known-defective candidates |
| False clears | Known-defective candidates cleared / all known-defective candidates |
| Unnecessary holds | Clean candidates unnecessarily withheld / all clean candidates |
| Hold precision | Genuine holds / reviewed holds |
| Material defect escape | Releases with at least one material defect / reviewed releases |
| Straight-through release | Correct releases without human intervention / eligible jobs |
| Repair effect | Attempts that clear the issue and retain required content / attempted repairs |

Split by locale, genre, and destination risk. Sample both clears and holds; log critical defects separately, and track exception minutes, cost, and latency. Report sample sizes; zero observed failures in a small or highly correlated sample is weak evidence.

Set tolerances before running the tests, emphasizing costly false clears. Keep the last validated configuration during a reviewer change. If a cue inflates false clears beyond tolerance, remove the cue or revise the configuration and rerun tests. After a no-dispatch trial passes, enable only the authorized, validated slice; sample releases and exceptions, roll back if tolerances are exceeded, and rerun cases after changes to model, prompt, reviewer examples, adapter, linter, parser, template, or policy.
