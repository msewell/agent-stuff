---
name: maintaining-software-architecture-diagrams
description: Reviews software architecture diagrams against independent evidence and verifies requested local fixes. Use when auditing C4 or other architecture views for accuracy or freshness, reviewing architecture impact in a pull request, defining a view contract or conformance check, or reconciling diagram drift after a rollout or migration. Reports whether the evidence supports handoff, merge, or promotion. Not for diagram syntax, layout, or design decisions alone.
category: Diagramming & Visualization
---

# Maintaining Software Architecture Diagrams

Review the architecture claims that someone will rely on, not just the drawing. A successful render is not evidence that a dependency exists; a current publication date is not a verification date.

## Workflow

1. **Anchor the decision.** Name the decision the view supports: handoff, merge, promotion, or another stated use. Inspect the view source and the applicable change or release records. Record the view's ID, owner, audience, question, scope, lifecycle state, and source revision. If a contract is absent, propose the smallest one that answers the question; don't mark unsupported claims verified.

   Read the one reference that addresses the main question. Load another only if a separate claim needs it. Resolve paths relative to this `SKILL.md`, not the repository under review:
   - Select views, define or assess a view contract, or test reader interpretation → [View contracts and interpretation](references/01-view-contracts.md).
   - For any pull-request or merge-gate review, or to set up ongoing conformance or drift detection → [Delivery checks and drift](references/02-delivery-and-drift.md).
   - Decide a compatibility, fallback, rollout, migration, or critical publication claim → [Release evidence](references/03-release-evidence.md).

2. **Compare claims with independent evidence.**
   - Match the claim's environment, revision, abstraction, and evidence window. Keep proposed, approved target, deployed, observed, and historical states distinct. Retain coexisting rollout versions and say *as of* when reporting from a snapshot. Don't infer traffic, fallback behavior, or customer impact from configuration alone.
   - Compare both directions and material edge attributes. Require evidence that can establish absence before calling something missing; require complete evidence for exact equality. A verified counterexample within scope can contradict a claim even if the whole inventory is incomplete.
   - Prefer the repository's checker or direct inspection for small sets. If using a new extractor, verify it recognizes a known-good case. Don't treat data it can't extract as a missing edge. Sampled silence cannot establish absence.

3. **Verify the view and gate separately.**
   - Render with the project's existing publication tooling. Check cross-view identity and inspect the actual page where available. For consequential views, test a representative reader task; state explicitly if nobody performed it. If a rendering prerequisite is missing, report the check as blocked or not run. Don't download or install tools without permission.
   - Check implementation and configuration changes even if diagram files were untouched. For a required merge check, inspect three cases: a relevant configuration-only change, a queued merge when a merge queue is enabled, and an out-of-scope change that must still report a successful no-op. Verify what the gate tests on the actual merge candidate. A local render or workflow definition doesn't show the gate ran; treat enforcement you can't inspect as unverified, not absent.

4. **Record the disposition.** Apply the repository's approved policy; label these as recommended defaults where none is documented:
   - **Block the applicable gate** for a required view or schema failure, or a confirmed mismatch in comparable evidence.
   - **Require accountable approval** for a material semantic change or sensitive “no impact” claim. Ask affected owners to confirm cross-boundary claims.
   - **Warn and triage** ambiguous or probabilistic observations. Name what would resolve them; don't adopt inferred edges as fact.
   - **Mark the claim unverified** when available evidence cannot establish it. Distinguish missing evidence from a test that ran and failed. If verification is required, hold the decision and retain the last verified snapshot with its scope and age.
   - **Accept for the stated decision only** when evidence supports it, required checks pass, and approvals cover the reviewed revision.

5. **Resolve, recheck, and report.** Review without editing unless asked to make a fix; keep fixes local and within the requested scope. Fix the view, implementation, or extractor at the source of the discrepancy; don't alter both sides to manufacture agreement. Rerun the independent comparison and relevant view checks, then inspect the final diff. If a check still fails or cannot run, keep the corresponding finding open. Get explicit authorization before accessing live systems, running live tests, or publishing. If the deployed pointer names an unconfirmed candidate, recommend pointing to the verified serving revision now, as of the available evidence. Keep the approved target separate and don't advance the pointer until rollout evidence supports it. Retain historical snapshots.

   Lead with the decision and its scope. For each finding, give the **exact view ID and claimed state → finding and disposition → evidence path/revision/window → owner and next action**. For releases, group actions under **Before activation**, **After activation**, and **Before closeout** as applicable. Do not recommend further activation while a required pre-activation check is failing or unverified. List edits and checks actually run; distinguish blocked verification from a confirmed defect. When asked for a handoff, give one paste-ready note, not a second copy of the analysis.

## Example

**Input:** Inventory Platform owns `reservation-publishes`, a candidate configuration view with a required conformance gate. The complete route input, `deploy/routes.json` at `abc123`, replaces `Reserve.v1 → reservations-old` with `Reserve.v2 → reservations-next`. The view still shows the old edge; rendering passes.

**Output:** Block merge on diagram conformance. `Reserve.v2 → reservations-next` is missing from `reservation-publishes`; `Reserve.v1 → reservations-old` is unsupported by `deploy/routes.json` at `abc123`. Inventory Platform: confirm the replacement, update the view, and rerun the comparison. This finding concerns candidate configuration, not deployed traffic.

Based on [Keeping software architecture diagrams trustworthy](https://gist.githubusercontent.com/msewell/618004cef09bf75b66a1f4040a59038b/raw/ede66e0471b257fe70de184254bc3c7e955d636b/maintaining-software-architecture-diagrams.md). The original is background, not required input.
