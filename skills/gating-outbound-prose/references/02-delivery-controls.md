# Delivery controls

## Find and enforce the boundary

Inventory the first disclosure for each route, not just the nominal publish action. Include connectors, shell and browser tools, synced folders, sharing changes, and alternate credentials. Stage in a genuinely private location that does not inherit public or team access. Processing by a third-party model, grammar checker, or draft host can itself be a separate transfer; verify its authorization before uploading.

Give the writer access to approved inputs and private staging only. Keep dispatch policy, approved sources, clearance records, the outbox, and publisher credentials outside the writer’s control. Make the publisher the only identity with delivery permissions for the routes you control; telling the writer not to use a credential does not revoke it.

Run the gate in a trusted release controller, not in the writer’s hook. Use the protected release job as the controller for Git-backed releases. Let hooks submit drafts or return findings; keep the retry budget on the durable job. For Pi, let the host collect the private candidate and own the attempt loop. Verify any optional hook in the deployed runner, including interruptions.

| Route | First boundary and final check |
| --- | --- |
| Email or messaging | Review subject, body, recipients, reply/mention context, links, and attachments. Use an authorized private preview of provider formatting or hold if the rendered message cannot be checked. |
| Shared document or PDF | Editing a visible document is disclosure. Work on a private copy. Verify final render and structure, comments and tracked changes, inherited and link-sharing visibility, and required accessibility properties. |
| Git and PRs | Gate the first externally visible push or PR, including visible metadata and comments. Run deployment checks separately on the actual release tree; a merge check can't undo earlier exposure. |
| CMS or website | Gate the private preview before sharing its link. Verify service-rendered body, title and preview card, templates, rewritten links, assets, and actual target and audience. |
| Upload or release bundle | Stage outside synced directories; reject added, removed, or changed files. Verify the approved bundle, target, and access settings. |

**Example: Link a CMS article from a PR comment.** Check the pinned CMS render for template changes and verify who can open it. Separately check the PR comment’s text, link preview, mentions, and repository audience. Bind clearance to each delivery packet; a clear article does not clear the comment or authorize sharing the link.

## Apply checks to what will leave

Use format-aware, narrowly scoped checks. Block a known-invalid condition (e.g. a missing parser field or wrong approved value), not a proxy such as long sentences. Scope exemptions to the actual spans, files, and locale; preserve quoted text and code. Separate blocking findings from tool failure, verify the checker inspected the expected artifacts, and use known-good and known-bad fixtures. Check what templating, format conversion, or a branch merge adds or changes, including generated links, assets, and structure. Verify the preview revision is the one the publisher will use; a staging render that only resembles production is not sufficient.

## Bind clearance and deliver safely

- Store an immutable packet and a trusted clearance record naming its digest or revision, evidence and policy versions, and each required result. A digest verifies identity against a trusted record, not approval. A model-generated verdict string alone does not grant dispatch authority.
- Have the publisher verify the issuer, exact packet, current permission, policy, evidence freshness, and destination before using the verified bytes or pinned revision. A changed recipient or attachment is a different packet even if the prose is unchanged. Stop on a mismatch and check the new packet before issuing fresh clearance; do not substitute the target in the old record. Reuse earlier check results only when policy permits and all inputs to those checks are unchanged. For example, the same bytes can have a different meaning or omit needed context for a broader audience.
- Claim the outbox entry by a durable job ID. Record submission and provider results durably. Use the provider’s idempotency mechanism with a stable identity for the authorized delivery when supported. Deduplicating enqueue does not deduplicate sends. If a timeout or crash leaves acceptance uncertain, reconcile against provider or send records before retrying; quarantine the job if it remains ambiguous. Don’t infer failure from an absent success record.
- An exception requires an authorized decision on the exact current revision and does not erase other required checks. Hold unsupported formats and unavailable evidence privately. Retry transient infrastructure at the service layer, not by rewriting the prose.
