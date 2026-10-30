#!/usr/bin/env bash
# Starter template — the executable harness: ground truth to answer surface in
# one command. Copy into the realm's tests/ directory and adapt.
#
# Run it after every change to producers, views or types. Scope the view
# sweep to THIS realm's own views — a world carries other realms' and the
# host's too, and a harness that fails on a neighbour's defect is a harness
# people learn to ignore.
#
# Call the host's own endpoints — never re-implement them:
#   GET  /api/v1/admin/kg/views                      discover views + params
#   POST /api/v1/admin/kg/views/{name}/run           run one view (rows + warnings)
#   POST /api/v1/admin/kg/views/{name}/invocation    the Cypher a view would run
#   POST /api/v1/admin/kg/execute                    verbatim Cypher through the engine
#   POST /api/v1/realms/{name}/update               reload the realm's YAML (no restart)
#   GET  /api/v1/admin/kg/schema                     live schema (fabrication checks)
set -euo pipefail

HOST="${1:-127.0.0.1:8046}"
REALM="${REALM:?set REALM to the realm name under test}"
BASE="http://${HOST}/api/v1"

fail=0

# 1) Every view of THIS realm must return non-zero rows with real params.
#    Read the WARNINGS, not just the rows: a 0-row result with a
#    PRODUCER_ERROR / FIELDS_WITHHELD / UNPUSHED_FILTER note is a broken
#    realm, not an empty source.
# for view in $(list this realm's view names); do
#   rows=$(curl -sf -X POST "$BASE/admin/kg/views/$view/run" \
#            -H 'content-type: application/json' -d '{"args": {}}')
#   ... assert non-zero rows and no error-class warnings ...
# done

# 2) Prove the cross-realm join with a test that would fail: run the
#    two-realm question against live sources and assert a NON-ZERO count for
#    an entity you know is in both. A broken cross-realm join is an empty
#    result, not an error.
# count=$(curl -sf -X POST "$BASE/admin/kg/execute" -d '{"cypher": "…"}')
# [ "$count" -gt 0 ] || { echo "cross-realm join returned 0"; fail=1; }

# 3) Replay the natural-language battery (tests/questions.yml), running the
#    adversarial questions several times each.

exit "$fail"
