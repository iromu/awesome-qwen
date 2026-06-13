---
name: yaml-validator
description: Validate, lint, and fix YAML files. Use this skill whenever the user asks to validate YAML, check YAML syntax, find YAML errors, fix YAML formatting, lint YAML files, or verify YAML structure. Also use when the user encounters YAML parse errors, wants to check for common YAML pitfalls (indentation issues, special characters, implicit type coercion), or needs to convert between YAML formats. Trigger on any mention of YAML validation, YAML linting, YAML schema validation, YAML anchors, YAML aliases, or YAML type coercion issues.
version: 1.0.0
category: validation
tags: [yaml, linting, validation, syntax, formatting]
---

# YAML Validator

Validate and fix YAML files by checking syntax, structure, common pitfalls, and best practices.

## When to Use

- User asks to validate, lint, or check a YAML file
- User encounters a YAML parse error and needs help diagnosing it
- User wants to ensure YAML follows best practices (consistent indentation, no tabs, etc.)
- User needs to verify YAML structure against a JSON Schema
- User reports issues with YAML parsing, type coercion, or anchor/alias resolution
- User wants a YAML schema generated from existing data

## Prerequisites

Ensure `yamllint` and `pyyaml` are available:

```bash
pip install pyyaml yamllint
```

If unavailable, fall back to Python's built-in `yaml.safe_load()` for basic syntax validation.

## Procedure

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

Run yamllint with strict rules to catch the most common issues:

```bash
yamllint -d '{rules: {indentation: {spaces: 2}, trailing-spaces: {level: error}, new-line-at-end-of-file: {level: error}, octal-values: {severity: error}, key-duplicates: {severity: error}, truthy: {severity: warning}}}' <file.yaml>
```

Manually inspect for issues yamllint may miss:
- Anchor/alias type mismatches
- Unquoted URLs/emails in contexts where they cause ambiguity
- Empty values that should be explicit strings vs nulls

Read `references/common-issues.md` for a detailed catalog with examples and fixes.

### Step 4: Validate Against Schema (Optional)

If the user provides or requests a JSON Schema:

```bash
pip install jsonschema
```

```python
import yaml
import json

with open("schema.json") as f:
    schema = json.load(f)

with open("data.yaml") as f:
    data = yaml.safe_load(f)

jsonschema.validate(instance=data, schema=schema)
```

**No schema provided?** Offer to generate one from the YAML structure (see [Schema Generation](#schema-generation)).

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

1. Apply fixes automatically for simple issues (tabs → spaces, add quotes, trim trailing whitespace)
2. For structural issues (duplicate keys, schema violations), present the fix and ask for confirmation
3. Re-validate after fixes to confirm resolution

## Schema Generation

Offer to generate a JSON Schema from the YAML structure when the user requests validation but has no schema:

```python
import yaml
import json

def generate_schema(yaml_path, name="Root"):
    """Generate a basic JSON Schema from a YAML file."""
    with open(yaml_path) as f:
        data = yaml.safe_load(f)

    def _type_schema(value):
        if isinstance(value, dict):
            properties = {}
            required = []
            for k, v in value.items():
                properties[k] = _type_schema(v)
                # Consider all keys required for strict validation
                required.append(k)
            return {"type": "object", "properties": properties, "required": required}
        elif isinstance(value, list):
            if value:
                return {"type": "array", "items": _type_schema(value[0])}
            return {"type": "array", "items": {}}
        elif isinstance(value, bool):
            return {"type": "boolean"}
        elif isinstance(value, int):
            return {"type": "integer"}
        elif isinstance(value, float):
            return {"type": "number"}
        elif value is None:
            return {"type": ["string", "null"]}
        else:
            return {"type": "string"}

    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": name,
        "type": "object",
    }
    schema.update(_type_schema(data))
    return schema

schema = generate_schema("data.yaml", "MyConfig")
print(json.dumps(schema, indent=2))
```

Save the generated schema as a `.json` file and use it for validation in Step 4.

## Pitfalls

⚠️ **`yaml.safe_load()` only reads the first document** in multi-document YAML files. Use `yaml.safe_load_all()` to iterate all documents:

```python
with open("multi.yaml") as f:
    for doc in yaml.safe_load_all(f):
        print(doc)
```

⚠️ **YAML 1.1 vs 1.2 booleans differ.** `yaml.safe_load()` uses YAML 1.1 semantics by default in older PyYAML versions (`yes`/`no` are booleans). Newer versions default to 1.2. Specify explicitly:

```python
data = yaml.safe_load(text, Loader=yaml.SafeLoader)  # YAML 1.2 compliant
```

❌ **Never use tabs for indentation.** YAML parsers will either reject the file or produce unpredictable results.

❌ **Duplicate keys silently overwrite.** The last value wins — this is a common source of hard-to-find bugs.

## Verification

After completing validation and fixes, confirm:

- [ ] All YAML files parse without errors
- [ ] No tab characters remain
- [ ] No duplicate keys exist
- [ ] Special characters are properly quoted
- [ ] Implicit type coercion is handled (octals, dates, booleans)
- [ ] Trailing whitespace is removed
- [ ] Files end with a newline
- [ ] Indentation is consistent (2 spaces)
- [ ] Schema validation passes (if applicable)

## Reference Files

- `references/common-issues.md` — Detailed catalog of common YAML pitfalls with examples and fixes
- `references/best-practices.md` — Style guide and conventions for writing clean YAML

## External Resources

- [YAML Spec 1.2](https://yaml.org/spec/1.2.2/) — Official specification
- [yamllint Documentation](https://yamllint.readthedocs.io/) — Linter rules and configuration
- [JSON Schema](https://json-schema.org/) — Schema validation standard
