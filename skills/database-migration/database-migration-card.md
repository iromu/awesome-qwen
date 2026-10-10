## Description: <br>
Write forward and rollback database migrations for PostgreSQL, MySQL and SQLite, covering zero-downtime schema changes, lock-free index creation, column renames and migration versioning strategy. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: Author email in the frontmatter is a personal non-NVIDIA address and the repo is a third-party awesome list; card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: There is no LICENSE file anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Backend developers and database administrators who must evolve a live schema safely: drafting forward and down migration SQL, choosing per-database lock-free index and column operations, planning expand-migrate-contract column renames, and reviewing a migration for table locks, data-loss risk and idempotency. <br>

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
- [cross-database.md](references/cross-database.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Configuration instructions] <br>
**Output Format:** [Markdown with inline PostgreSQL, MySQL and SQLite migration and rollback SQL plus migration-tooling selection guidance] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
No `evals/evals.json` exists for this skill, so there are zero eval cases and nothing checks the migration SQL it emits. The score comes from static analysis only: 9 automated validator checks (frontmatter, folder and naming convention, line limit, required sections, semantic version, license, code risk, secrets, dead links, Unicode smuggling, quality heuristics), all passing. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the migration and rollback SQL is real, dialect-correct DDL - CREATE INDEX CONCURRENTLY outside a PostgreSQL transaction, MySQL 8.0 ALGORITHM=INPLACE and INSTANT options, SQLite's lack of DROP COLUMN - rather than invented syntax or behaviour that would actually take a write lock. <br>
- Discoverability: Whether the skill triggers on schema-evolution work (forward and down migrations, index and column changes, migration tooling choice) even when the user does not say zero-downtime or rollback, and stays out of ORM auto-migration, data seeding and database provisioning. <br>
- Reliability: Whether the zero-downtime recipes behave consistently across runs; the report docked this dimension for undocumented prerequisites, limitations and troubleshooting, which matters because the lock and rebuild behaviour differs per database engine and version. <br>
- Efficiency: Whether a migration plan is produced without unnecessary steps, redundant migration files or avoidable table rebuilds. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 92.0 | A | guide-only |
| Correctness | 95.0 | - | - |
| Discoverability | 90.0 | - | - |
| Reliability | 85.0 | - | - |
| Efficiency | 100.0 | - | - |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>


