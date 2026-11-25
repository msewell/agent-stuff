# Reporting and corrections

## Define a decision-specific product

State the question, owner, grain, eligible population, exclusions, time basis, source authority, and reconciliation. For a delivery count, one row per eligible deal is not one row per vehicle or stock movement. If the measure counts deliveries by local business date, derive it in the declared time zone rather than bucketing by ingestion date. A shared warehouse or shared metric does not imply a shared operational entity. Keep source keys and provenance visible.

## Preserve issued results when retroactive corrections matter

Distinguish **business time** (when the fact or mapping was effective) from **knowledge time** (when this reporting context accepted it). Producer recording time may differ from the latter. Keep both axes when users need both the originally known and later corrected view; otherwise don’t introduce bitemporal storage just for completeness. An immutable issued artifact preserves what was published; reproducibility also requires the inputs and policy used.

**Fixture:** A branch’s region changes effective April 1. Reporting accepts the evidence April 10. An April 5 transaction belongs to the old region at the April 8 cutoff and to the new region at the April 12 cutoff. Test both lookups, including exact boundaries when relevant. If one result per key is promised, reject intervals that overlap on both axes.

For each published run, retain the issued artifact, input snapshot or positions, versions of transformations and crosswalks, the business-date rule, and the knowledge cutoff. Reconcile at business grain. Publish a restatement as a new edition instead of overwriting the original; route discrepancies to the reporting owner.
