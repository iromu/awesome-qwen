# Validation, CI, installation, conventions

## Validating a realm

`realm_validate` answers "would this load?" inside a running appliance. The same
checks run with **no appliance at all**, so a realm repository can make them a
required check — including on pull requests from forks. They cover: `realm.yml`,
types and their parents, joins, producers and the governance their source can
honour, views, rules, apps, side files, and the handler build.

The validator ships in the appliance server image, `ghcr.io/embabel/assistant`, as a
second command. The image you validate with is the appliance whose verdict you get,
so pin the tag your users run when it matters; `latest` follows releases.

**A realm that builds on other realms names them.** A realm that extends another
realm's types or joins through its producers does not load alone: each realm given as
a dependency counts as installed beside it — its types and producers, not its own
problems. The default world's types are always known.

### The reusable CI workflow

```yaml
# .github/workflows/validate.yml
name: Validate
on: [push, pull_request]
jobs:
  realm:
    uses: embabel-worlds/realm-spec/.github/workflows/validate-realm.yml@main
    with:
      with: embabel-worlds/realm-code-model embabel-worlds/realm-java-code
      # path: .            the realm's directory in this repository
      # image: ghcr.io/embabel/assistant:<tag>
      # strict: true       fail on warnings too
```

Then mark **`realm / validate`** required under the repository's branch protection.
`with` takes `owner/repo`, `owner/repo@ref`, or `./dir` in the same repository,
separated by spaces or newlines. The workflow needs no secret and only
`contents: read`.

### The same check anywhere else

```bash
docker run --rm --entrypoint realm-validate \
  -v "$PWD:/realms/my-realm:ro" \
  -v "$PWD/../realm-code-model:/with/realm-code-model:ro" \
  ghcr.io/embabel/assistant:latest /realms/my-realm --with /with/realm-code-model
```

With the appliance CLI installed, `embabel realm validate . --with
../realm-code-model` runs the same image at the appliance's own version, with
nothing running.

| Option | Meaning |
|---|---|
| `--with <dir>` | a realm installed beside this one; repeatable |
| `--json` | the report as JSON: `realm`, `ok`, `passed`, `errors`, `warnings`, `notes`, `problems[]` with `severity`, `message`, `suggestion`, `location` |
| `--strict` | fail on warnings as well as errors |

Exit status `0` passes, `1` does not (an error, or a warning under `--strict`), `2`
could not validate. A note never fails.

## Installation

Realms are installed as git repos cloned into the world's `config/realms/`
directory. Default realms are listed in the world's `config/realms.yml` and cloned
automatically on first world provisioning:

```yaml
# config/realms.yml
- name: research
  repo: https://github.com/embabel/realm-research.git
```

Realms are discoverable via the host's directory system: GitHub organizations/users
configured in `realm-sources`, repos matching `realm-*`, searchable and installable
via chat or the host UI.

## Conventions

- **Naming**: lowercase-hyphenated for ids (realm name, action name, command name);
  UpperCamelCase for type names.
- **YAML**: prefer multi-doc files only when the entries are tightly related;
  otherwise one file per item.
- **Descriptions are LLM-readable**: write descriptions assuming an LLM planner is
  the primary reader.
- **Stable ids**: changing a `name` is a breaking change for any installed world that
  wired against it.

## Versioning

Realms follow semantic versioning in `realm.yml`. The `version` is informational;
hosts may track it to detect upgrades, but the contract is at the
directory-and-field level — adding a new optional field is a minor change, removing
or renaming a required field is a major one.

## Licence (know before publishing)

The specification **text** is CC BY-ND 4.0; the embedded code, YAML and Cypher
**samples** are Apache 2.0. **Authoring realms, and building software that uses them,
is free** — publicly, privately or commercially, without permission. Realms you
author are yours and are not derivative works of the spec. **Implementing the
specifications in a competing engine or platform requires a separate written
agreement with Embabel.**
