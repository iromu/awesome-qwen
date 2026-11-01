## Description: <br>
Proofread AI-generated text for conversational meta-comments — first-person AI voice, references to the user's prompt, and presentational phrases that don't belong in standalone documentation. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in frontmatter is a personal non-NVIDIA address; the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
Apache 2.0 <br>
## Use Case: <br>
Developers, engineers, and technical writers who publish AI-generated documentation, reports, READMEs, or code comments and need a pass to strip conversational AI meta-comments so the text reads as a standalone piece rather than a chat reply. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Not Specified] <br>
**Credential Type(s):** [None identified] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [scripts/scan_meta_comments.py (bundled meta-comment candidate-finder: strips code blocks, runs the pattern set, reports file:line [category] "phrase")](scripts/scan_meta_comments.py) <br>
- [evals/evals.json (three-case assertion eval set: clear meta-comments, false-positive resistance, mixed categorization)](evals/evals.json) <br>


## Skill Output: <br>
**Output Type(s):** [Analysis, Files] <br>
**Output Format:** [A categorized meta-comment report (Clear / Borderline / False positive) listing, per finding, the file, line number, matching phrase, and a suggested replacement or 'delete', grouped Clear-first; optionally a cleaned rewrite of the document. The bundled script emits a human 'file:line [category] "phrase"' candidate list, or machine-readable JSON with --json.] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
Three eval cases in evals/evals.json — clear meta-comments in a technical doc, false-positive resistance (the I/O acronym, my-agent/my-model identifiers, standard Note:/Warning: labels, a methodology statement, and a generic 'the user' reference), and mixed categorization plus report format — each graded by a per-case assertion set (flag the clear items, give concrete replacements, and — critically — not over-flag technical terms and standard labels); alongside the 9 automated SkillEvaluator validator checks, which is where the 92.2/100 A-grade score comes from. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether findings are correctly categorized into Clear / Borderline / False positive and each carries a concrete replacement, with the bundled script doing the deterministic candidate-finding (code-block stripping, case-sensitivity on the 'I' pronoun) so technical acronyms and identifiers are not flagged. <br>
- Discoverability: Whether the skill triggers on any request to review, proofread, or clean up AI-generated docs, reports, READMEs, or comments — including 'remove AI smell' — and stays out of grammar/spelling proofreading and conversational text where meta-comments are correct. <br>
- Reliability: Whether the same document yields the same categorized report across runs, and whether the 'Fine (leave alone)' bucket keeps the reviewer from over-flagging standard doc labels, methodology statements, and generic 'the user' references. <br>
- Efficiency: Whether the candidate-finder plus a manual prose pass avoids a full re-read of code-heavy or long documents, and whether the report is grouped so the reader can act without re-scanning. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 92.2 | A | script-based |
| Correctness | 85.0 | — | — |
| Discoverability | 95.0 | — | — |
| Reliability | 90.0 | — | — |
| Efficiency | 100.0 | — | — |

Assertion eval (3 cases, with-skill vs baseline, model Qwen-thinking):

| Eval | With skill | Baseline |
|---|---:|---:|
| Clear meta-comments | 100% | 83% |
| False-positive resistance | 100% | 50% |
| Mixed categorization | 100% | 100% |
| Average | 100% | 77.8% |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>


