---
name: yaml-validator
description: Validate, lint, and fix YAML files. Use this skill whenever the user asks to validate YAML, check YAML syntax, find YAML errors, fix YAML formatting, lint YAML files, or verify YAML structure. Also use when the user encounters YAML parse errors, wants to check for common YAML pitfalls (indentation issues, special characters, ambiguous types), or needs to convert between YAML formats (flow/block style). Trigger on any mention of YAML validation, YAML linting, YAML schema validation, YAML anchors, YAML aliases, or YAML type coercion issues.
---

# YAML Validator

Validate and fix YAML files by checking syntax, structure, common pitfalls, and best practices.

## When to Use

- User asks to validate, lint, or check a YAML file
- User encounters a YAML parse error and needs help diagnosing it
- User wants to ensure YAML follows best practices (consistent indentation, no tabs, etc.)
- User needs to verify YAML structure against a schema
- User is converting between YAML formats or styles
- User reports issues with YAML parsing, type coercion, or anchor/alias resolution

## Prerequisites

Ensure `yamllint` and/or `pyyaml` are available:

```bash
pip install pyyaml yamllint
```

If unavailable, fall back to Python's built-in `yaml.safe_load()` for basic syntax validation.

## Workflow

### Step 1: Identify Target Files

Ask the user which YAML file(s) to validate if not specified. Accept:
- A single file path
- A directory (recursively find all `.yaml` / `.yml` files)
- Multiple file paths

If the user provides a directory, validate all YAML files within it.

### Step 2: Validate Syntax

Run syntax validation on each file:

```bash
# Using yamllint (preferred)
yamllint <file.yaml>

# Using Python YAML parser (fallback)
python -c "import yaml; yaml.safe_load(open('<file.yaml>'))"
```

Record all syntax errors with file name, line number, and description.

### Step 3: Check Common Pitfalls

Manually inspect for these common YAML issues (yamllint catches many, but not all):

| Pitfall | Example | Fix |
|---------|---------|-----|
| Tabs used for indentation | `	key: value` | Replace tabs with 2 spaces |
| Unquoted special characters | `message: Hello: world` | Quote: `message: "Hello: world"` |
| Implicit type coercion | `count: 010` (becomes 8, not 10) | Quote: `count: "010"` |
| Duplicate keys | `key: a\nkey: b` | Remove duplicate |
| Mixed indentation | Inconsistent 2-space vs 4-space | Standardize to 2 spaces |
| Unquoted URLs/emails | `url: https://example.com` | Quote if it causes issues |
| Anchor/alias misuse | `&anchor` used before definition | Define anchor before use |
| Trailing spaces | `key: value   ` | Remove trailing whitespace |
| Empty values | `key: ` (empty string) | Clarify intent: `key: ""` or `key: null` |
| Block scalar indicators | `|` vs `>` confusion | Use `|` for literal, `>` for folded |

Read the reference file `references/common-issues.md` for detailed examples and fixes.

### Step 4: Validate Against Schema (Optional)

If the user provides or requests a JSON Schema:

```bash
pip install jsonschema
```

```python
import yaml
import jsonschema

with open("schema.json") as f:
    schema = json.load(f)

with open("data.yaml") as f:
    data = yaml.safe_load(f)

jsonschema.validate(instance=data, schema=schema)
```

If no schema is provided, ask the user whether they want one generated based on the YAML structure.

### Step 5: Report Results

Present findings in this format:

```
## YAML Validation Report

**Files validated:** 3
**Errors:** 2
**Warnings:** 5
**Passed:** 1

### Errors

#### `config.yaml` (Line 15)
- **Issue:** Duplicate key `database`
- **Fix:** Remove the duplicate entry

#### `config.yaml` (Line 42)
- **Issue:** Tab character used for indentation
- **Fix:** Replace tab with 2 spaces

### Warnings

#### `data.yaml` (Line 8)
- **Issue:** Unquoted special character `:` in value
- **Suggestion:** Wrap in quotes: `message: "Hello: world"`

#### `data.yaml` (Line 23)
- **Issue:** Implicit octal number `010`
- **Suggestion:** Quote if decimal: `count: "010"`
```

### Step 6: Fix Issues (If Requested)

If the user asks you to fix the issues:

1. Apply fixes automatically for simple issues (tabs → spaces, add quotes)
2. For structural issues (duplicate keys, schema violations), present the fix and ask for confirmation
3. Re-validate after fixes to confirm resolution

## Best Practices to Enforce

- Use 2-space indentation consistently
- Quote strings that contain special characters (`:`, `#`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `` ` ``)
- Quote strings that look like numbers but should be strings (e.g., `"010"`, `"2024-01-01"`)
- Avoid duplicate keys
- Use block style (`key: value`) for readability; use flow style (`{key: value}`) only for simple inline mappings
- Use `|` for multi-line literal text, `>` for folded text
- Keep lines under 80 characters when possible
- Use YAML 1.2 semantics (true/false, not yes/no/on/off for booleans)

## Reference Files

- `references/common-issues.md` — Detailed catalog of common YAML pitfalls with examples
- `references/best-practices.md` — Style guide and conventions for YAML files
