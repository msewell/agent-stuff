# Supplier REST evidence and caching

## Bind and translate

Keep a reviewed entry per distinct supplier contract. Record approved capability, market, key grammar, endpoint and method, grant semantics, pinned contract revision, representation, evidence rules, cache permission and budgets. Derive the route from trusted configuration; a caller-supplied key is a value within that route. Set deadlines across connection and body, and bound concurrency and response size before decoding.

Classify the exact route’s documented status and payload together, including error envelopes inside successful HTTP responses. Decode at runtime and verify the response identity and representation; map external codes explicitly. Reject an unrecognized required code or a valid response for the wrong key as unusable evidence (`outage` if no eligible positive is available). Keep raw supplier errors and types private.

| Observation | Boundary action |
| --- | --- |
| Valid payload for the exact authorized request | Return the timestamped allowlisted projection. |
| Documented, authoritative absence of this key under the exact grant and route | Return `unknown-key`; consider scoped negative caching only if permitted. |
| Documented denial for this grant and capability | Return `not-entitled`; apply outward disclosure separately. |
| Ambiguous 404, unexpected route retirement, shared credential failure, invalid payload, timeout or throttle | Use an otherwise eligible cached positive if policy permits; otherwise return `outage`. A retired endpoint is not `no-api` unless trusted capability configuration confirms the capability is unsupported. Never write a key negative from this evidence. |
| HTTP 304 on a valid conditional request | Revalidate the matching scoped projected entry. A 304 carries no fresh representation. If the request or matching entry is missing, fetch the full representation or return `outage`. |

Use one retry owner, a small transient GET retry budget with backoff and jitter, and honor applicable `Retry-After` within the overall deadline. Separate health, circuit and call-suppression state from key evidence. An open circuit cannot prove absence.

## Constrain cache reuse

- Cache eligible projected positives by default when caching is permitted; never cache raw bodies, denials, or outages as key evidence. Share an entry only across equivalent effective grants derived from authenticated context. Include the cache epoch, route and contract revision, canonical key, and representation (such as market, locale, or upstream account). Tenant ID alone is insufficient; do not put credentials in keys.
- Use the strictest applicable vendor terms, HTTP directives, business freshness, and grant limits. `no-store` prohibits storage; `no-cache` requires validation before reuse. If validation is not implemented, do not retain a `no-cache` response for reuse. Validate conditionally under the same scope and representation. Keep observation time separate from revalidation time. Inspect directive handling at the HTTP binding; a unit test with a preclassified zero TTL does not verify it.
- Enable negative caching only with authoritative per-key absence evidence under the documented route contract and an explicit policy allowing reuse. Use a separate, shorter TTL and keep it off when key presence is sensitive. An expired negative is no evidence. For stale positives, default to no stale serving without an approved finite stale-if-error window for this class of data. If enabled, recheck entitlement and policy, label staleness, and keep the original observation time. Definitive denial, verified removal, and privacy changes override stale reuse.
- Bound physical retention and refresh load. Coalesce by complete cache key, budget for cache loss, and fence refresh so an older response cannot overwrite a newer or invalidated entry.

## Verify the pinned contract

Use a route-specific evidence matrix. Test wrong route, ambiguous 404, shared credential failure, documented absence/denial, mismatched identity, malformed successful payload and 304 with no matching entry; assert the projected outcome, cache effect, and outward disclosure. Use sanitized fixtures for unsafe or unsupported live cases. If status semantics are undocumented, keep negative caching disabled until the supplier contract defines them. Probes detect drift or confirm a documented case; passing probes do not lift that gate. For approved live or sandbox semantic probes, use low-privilege test grants, vendor-approved keys, actual application binding/decoder/classifier and a separate budget. Bypass the cache. A known-present key must produce `found` with matching identity and expected fields; HTTP success alone does not pass. Keep probe data out of application caches and sensitive details out of telemetry.
