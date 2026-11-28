# Editorial review

Use a trusted brief and cited source excerpts, not the model’s memory. For a consequential claim, compare actor, polarity, quantity, unit, date or time, scope, modality, and conditions. A reachable link or a matching string is not evidence that it supports the surrounding claim. Check for lost requirements in rewrites as well as unsupported additions.

## Review contract

| Axis | A pass looks like this | Example of a material finding |
| --- | --- | --- |
| Fidelity | Important assertions stay within the evidence; required facts, qualifications, and protected content survive | “Will reopen at 09:00” upgrades a forecast to a commitment |
| Reader task | Readers can find what happened, decide whether it applies, and take the next step | A maintenance notice omits the affected action |
| Idiom and register | The copy reads naturally in the requested locale and relationship; terms match the audience | A formal German notice switches from Sie to du |
| Copyedit and proof | The delivered structure, spelling, typography, and channel-specific presentation work | The PDF displays bullets that are not marked as a list |

For an automated reviewer, supply the exact frozen artifact, trusted brief, relevant source excerpts, rubric, and locale-matched examples in a fresh context. Keep reviewer tools limited to reading evidence and validating findings. Use the full document to check structure and coverage; use passages with surrounding context for line findings.

Record `pass`, `repair`, or `uncertain` for each axis the reviewer evaluated. Mark unchecked axes as incomplete in the caller’s report; don’t invent a verdict. Give automated findings fields for axis, severity, passage ID, verbatim span (or insertion point for an omission), evidence ID when applicable, defect, and minimal fix or unblocker. Parse the result independently and verify that spans exist at the claimed locations and evidence IDs belong to the current packet. Valid JSON is not a semantic pass.

Preserve exact literals and approved wording unless the brief permits changing them. Keep legitimate long sentences, passive voice, qualifications, and warmth where they help the reader. A readability score, suspected “AI tell,” or reviewer preference is not a blocker by itself.

## English and German defaults

Use the specified profile. Use en-US and de-DE as worked defaults if only the language is named and the regional choice is inconsequential; ask if the choice affects wording, policy, or interpretation.

| Field | en-US default | de-DE default |
| --- | --- | --- |
| Address | Direct “you” when the reader acts | Formal Sie/Ihnen/Ihr for customer notices unless the brief says otherwise |
| Time and number display | Use a 12-hour clock in customer notices: “2:30 p.m. CEST”; 2.5 | Use a 24-hour clock in customer notices: „14:30 Uhr (MESZ)“; 2,5. Display CET as MEZ and CEST as MESZ. |
| Terminology | Use established product terms | Use terminology native to the audience; avoid English calques |
| Quotation typography | “…” | „…“; use the actual locale and house rules |

Render timestamps, amounts, and units from typed facts; verify equivalence rather than applying punctuation replacements to the prose. Keep identifiers, commands, product names, and exact UI labels outside that transform. Check where daylight saving applies. Review German compounds, clause structure, obligation scope, and the capitalization of formal address in context. Don't run an indiscriminate comma-before-*zu* rule. Treat professional German, *Einfache Sprache*, and *Leichte Sprache* as distinct targets. A language detector cannot establish the intended locale from short copy.

## Worked edits

**Scheduled maintenance, en-US.** Approved facts: Orders are unavailable April 12 from 14:30 to 15:00 CEST during scheduled maintenance; existing orders are not affected. Use “You won’t be able to place an order on April 12 from 2:30 to 3:00 p.m. CEST while we perform scheduled maintenance. Existing orders aren’t affected.” Replace ornamental framing with the affected action, but keep the condition.

**Same job, de-DE.** Use „Sie können am 12. April von 14:30 bis 15:00 Uhr (MESZ) wegen geplanter Wartungsarbeiten keine Bestellungen aufgeben. Bestehende Bestellungen sind nicht betroffen.“ Verify it against the approved facts, not against the English syntax.

**Restoration forecast, de-DE.** If the only approved evidence is a forecast, change “Kundenportal wieder verfügbar” in the subject to a subject about the forecast, and change „garantiert“ to „voraussichtlich“ in the body. If two sources disagree on the time, hold instead of choosing one, adding a promise, or inventing a fallback explanation. Return safe independent edits (such as formal address) and ask the source owner for the current approved statement. Confirming which time is the forecast is not confirmation of actual restoration; keep the approved level of certainty.
