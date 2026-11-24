# Evidence by change type

Use the row that matches the review question, not a checklist of every possible check. Keep inputs and environments comparable across revisions.

| Change | Evidence to collect or request |
| --- | --- |
| API or protocol | Paste a copyable request and abbreviated old/new responses or contract diff. State consumer impact; propose a runtime contract check with an old client when compatibility matters. A spec diff is not runtime proof. |
| CLI, worker, or scheduled job | Give command or event fixture, exit code or final state, and decisive output. Show interruption, retry, or duplicate delivery where relevant. |
| Database migration or backfill | Report fresh-install and upgrade results on the real target engine and identify the tested revision. When these are required on the merge candidate, report whether that exact candidate has results. Prefer an isolated rehearsal with representative, scrubbed data. Record locking or runtime, counts or parity, and old/new compatibility where versions overlap. Distinguish a measured result from an estimate. |
| Infrastructure or configuration | Summarize a sanitized plan; call out replacements, deletions, and scope. Name the environment and plan revision. State the recovery path; use a plan, not an apply, as review evidence. |
| Performance | Match workload, concurrency, warmup, and environment; report sample count and before/after distributions. Compare the relevant percentile or throughput to a budget and note run-to-run variation and limits. |
| Refactor or dependency update | Name preserved behavior, link targeted tests or compatibility checks, and account for changed defaults or generated output. |
| Documentation or developer workflow | Show the rendered result for layout and a clean-run transcript for copyable instructions; use a realistic fresh environment when onboarding is the claim. |
| Cross-repository or release change | Name the rollout order, versions, and owners. Show what happens if only one side lands and how to pause or recover. |

Put commands, errors, and short transcripts in text rather than screenshots. Quote only decisive lines and link to bulky logs or traces with suitable access. For example, an empty-database migration pass doesn't establish safe locks on a populated database or compatibility with old writers. Keep those gaps explicit; don't fill in a rollback boundary by guessing.
