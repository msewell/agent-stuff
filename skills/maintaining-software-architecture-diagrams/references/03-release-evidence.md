# Release evidence

Apply only the controls that protect the stated decision. Record the view or relationship ID, release or configuration revision, scope, result, and evidence link. A passing pre-activation check supports a candidate decision; it does not confirm deployment.

## Version compatibility and fallback

For independently deployed integrations, keep immutable provider and consumer revisions per verification. Record the contract ID, direction in the view, verified pair, environment, time, and result. For every required counterpart version, distinguish **pass**, **failure**, and **missing verification**; a missing required pair holds further activation even if all other pairs passed. Recheck immediately before activation; if concurrent changes could each pass against the soon-to-be-replaced version, verify the candidate pair or coordinate activation. Record a deployment only after confirmation and keep records for every version while it serves. Test delivery, replay, or duplicate handling independently when the contract doesn't cover them.

Verify the healthy path with synthetic traffic first. Exercise the fallback in a controlled environment and confirm the intended fault happened on the same test run. Check the user-visible result against its deadline and any required durable or idempotent outcome, not just a successful HTTP response. Verify recovery. A harness that didn't exercise the fault or couldn't observe the required outcome leaves the claim unverified. Prove the assertion detects a deliberately broken fallback in an isolated fixture; rerun on relevant route, timeout, retry, or fallback changes.

## Migration and staged rollout

Keep a labeled model snapshot and explicit transition criteria for each milestone. Review the candidate's semantic diff by stable ID and verify the expected stage against independent evidence. Record coexistence by region, rollout cohort, or revision. A candidate's new-only configuration does not imply that every running version is new-only. Verify removal using complete effective routing or other evidence that can establish absence. If dual publishing, verify both publishes produce one business outcome for the same test input.

Authorize further exposure only after required compatibility and candidate checks pass. Confirm the active state and a successful new-path journey after deployment; a producer publish by itself is not a downstream outcome. Before closing or retiring the old consumer, get the accountable owner's verified backlog disposition. Keep rollback selectable through the agreed recovery window and clear decommissioning obligations before removing legacy infrastructure. Record rollback as an actual deployment; update the deployed pointer only to a verified revision.

## Bundle and published page

For an audit or release where bytes matter, package the rendered artifact with a machine-readable manifest: view ID and state, environment, source and deployed revisions, render recipe, evidence references and digests. Attest the exact bundle from the trusted workflow. Verify provenance before extraction against the authorized repository, signer workflow, and reviewed source; publish the same bytes. Provenance does not make the manifest's deployment claims true. Check those claims against the release records and required evidence separately, and keep restricted evidence behind appropriate access controls.

Use the actual built documentation page, supported widths/themes, and a pinned browser, OS, fonts, and renderer for approved visual baselines. Review expected/actual/diff artifacts; don't auto-accept a new screenshot in CI. Assert critical labels, keyboard controls, or scrolling separately where needed. Pixel equality isn't semantic correctness and doesn't substitute for an independent comparison or a reader task.
