---
name: json-formatting
description: Format, pretty-print, minify, validate, transform, and convert JSON data. Use this skill whenever the user needs to format JSON output, minify JSON, validate JSON structure, convert between JSON and other formats (YAML, XML, CSV, TOML), restructure JSON keys, extract nested values, or generate JSON schemas. Trigger on any request involving JSON formatting, JSON beautification, JSON validation, JSON-to-other-format conversion, or JSON schema generation. Also trigger when the user asks to compact, indent, sort, or reformat JSON data.
version: 1.1.0
category: data
tags: [json, formatting, validation, conversion, schema, transformation, jq]
---

# JSON Formatting

## When to Use
- User pastes raw/minified JSON and asks to format or pretty-print it
- User needs to validate JSON syntax or structure
- User wants to convert JSON to/from YAML, XML, CSV, or TOML
- User needs to restructure JSON (rename keys, flatten, nest, sort)
- User wants to extract specific values from nested JSON
- User needs to generate a JSON schema from example data
- User wants to minify or compact formatted JSON
- User needs to merge, diff, or compare two JSON documents
- User needs JSON Patch (RFC 6902) or JSON Merge Patch (RFC 7396) operations
- User wants CLI one-liners for JSON processing (jq, python -m json.tool)

## Procedure

### Step 1: Identify the Task

Match the user's request to the operation table below. When ambiguous, ask a clarifying question before proceeding.

| Operation | What it does |
|-----------|-------------|
| **Format / Pretty-Print** | Add consistent indentation and line breaks to minified JSON |
| **Minify / Compact** | Remove all whitespace and newlines from formatted JSON |
| **Validate** | Check JSON syntax and report errors with line/column info |
| **Transform** | Rename keys, flatten nested objects, extract fields, sort keys |
| **Convert** | Convert JSON ↔ YAML, XML, CSV, or TOML |
| **Schema** | Generate a JSON Schema draft from example JSON data |
| **Diff / Compare** | Find structural differences between two JSON documents |
| **Merge** | Deep-merge two JSON objects or arrays |
| **Patch** | Apply JSON Patch (RFC 6902) or JSON Merge Patch (RFC 7396) |
| **Query** | Extract values using JSONPath or JMESPath expressions |

---

### Step 2: Format / Pretty-Print

Add consistent indentation and line breaks. Default: **2 spaces**.

```json
{
  "name": "Awesome Qwen",
  "version": "1.0.0",
  "description": "A curated collection of extensions, skills, agents, and workflows",
  "repository": {
    "type": "git",
    "url": "https://github.com/iromu/awesome-qwen"
  }
}
```

**Options to present to the user:**
| Option | Choices | Default |
|--------|---------|---------|
| Indent size | 2 spaces, 4 spaces, tab | 2 spaces |
| Sort keys | Alphabetical, insertion order | insertion order |
| Trailing commas | Allow (non-RFC), disallow (RFC 8259) | disallow |

**jq one-liner:**
```bash
jq '.' input.json                    # 2-space indent
jq '.  ' input.json                  # 4-space indent
jq -S '.' input.json                 # sorted keys
```

---

### Step 3: Minify / Compact

Remove all unnecessary whitespace, newlines, and formatting:

```json
{"name":"Awesome Qwen","version":"1.0.0","description":"A curated collection","repository":{"type":"git","url":"https://github.com/iromu/awesome-qwen"}}
```

**jq one-liner:**
```bash
jq -c '.' input.json
```

---

### Step 4: Validate

Parse the JSON and report errors precisely. Common errors:

| Error | Example | Fix |
|-------|---------|-----|
| Missing closing bracket | `{"key": "value"` | Add `}` |
| Trailing comma | `{"a": 1,}` | Remove `,` |
| Unquoted key | `{key: "value"}` | Use `"key": "value"` |
| Single quotes | `{'key': 'value'}` | Use `"key": "value"` |
| Unescaped special chars | `{"text": "hello\nworld"}` | Escape: `"hello\\nworld"` |
| Duplicate keys | `{"a": 1, "a": 2}` | Keep only one |
| Invalid escape | `{"text": "hello\d"}` | Use valid escapes: `\n`, `\t`, `\\`, `\"`, `\/`, `\b`, `\f`, `\uXXXX` |
| Infinity / NaN | `{"val": Infinity}` | Use numbers or strings only |

**Validation commands:**
```bash
python -m json.tool input.json      # validates + pretty-prints
jq '.' input.json                    # validates (exits non-zero on error)
node -e "JSON.parse(require('fs').readFileSync('input.json'))"   # Node.js validation
```

---

### Step 5: Transform

**Rename keys (map old → new):**

```json
// Before
{"first_name": "John", "last_name": "Doe", "emailAddr": "john@example.com"}

// After (snake_case → camelCase)
{"firstName": "John", "lastName": "Doe", "email": "john@example.com"}
```

**jq:**
```bash
jq '{firstName: .first_name, lastName: .last_name, email: .emailAddr}' input.json
```

**Flatten nested objects (dot-separated keys):**

```json
// Before
{"user": {"name": "John", "address": {"city": "NYC", "zip": "10001"}}}

// After
{"user.name": "John", "user.address.city": "NYC", "user.address.zip": "10001"}
```

**jq (recursive descent):**
```bash
jq '.. | objects | to_entries | map([.key, .value] | join(".")) | from_entries' input.json
```

**Extract nested values (JSONPath-style):**

```json
// Query: $.users[*].name
// From: {"users": [{"name": "Alice"}, {"name": "Bob"}]}
// Result: ["Alice", "Bob"]
```

**jq:**
```bash
jq '.users[].name' input.json       # → ["Alice", "Bob"]
jq '.users[0].name' input.json      # → "Alice"
jq '[.users[] | select(.age > 25)]' input.json   # filter
```

**Sort keys alphabetically:**

```json
// Before
{"zebra": 1, "apple": 2, "mango": 3}

// After
{"apple": 2, "mango": 3, "zebra": 1}
```

---

### Step 6: Convert

#### JSON ↔ YAML

```json
// Input (JSON)
{"name": "Awesome Qwen", "version": "1.0.0", "tags": ["awesome", "json"]}

// Output (YAML)
name: Awesome Qwen
version: "1.0.0"
tags:
  - awesome
  - json
```

**jq → yaml:**
```bash
jq -r 'to_entries | map("\(.key): \(.value | tostring)") | join("\n")' input.json
# Or use:  yq -p json -o yaml input.json
```

#### JSON ↔ XML

```json
// Input (JSON)
{"person": {"name": "John", "age": 30}}

// Output (XML)
<?xml version="1.0"?>
<root>
  <person>
    <name>John</name>
    <age>30</age>
  </person>
</root>
```

> ⚠️ **Caveat:** JSON → XML with arrays needs a strategy — repeated elements (`<item>`, `<item>`) or wrapped elements (`<items><item/></items>`). Ask the user which they prefer.

#### JSON ↔ CSV

```json
// Input (JSON array of objects)
[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]

// Output (CSV)
name,age
Alice,30
Bob,25
```

**jq → CSV:**
```bash
jq -r '.[] | [.name, .age] | @csv' input.json
```

> ⚠️ **Caveat:** Nested objects/arrays become stringified JSON strings in CSV cells. For deeply nested data, flatten first.

#### JSON ↔ TOML

```json
// Input (JSON)
{"database": {"server": "192.168.1.1", "ports": [5432, 5433]}}

// Output (TOML)
[database]
server = "192.168.1.1"
ports = [5432, 5433]
```

---

### Step 7: Generate JSON Schema

From example data, produce a JSON Schema draft:

```json
// Example input
{"id": 1, "name": "Widget", "active": true, "tags": ["new", "featured"], "meta": null}

// Generated schema
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "active": { "type": "boolean" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "meta": { "type": ["null", "string", "number", "boolean", "object", "array"] }
  },
  "required": ["id", "name", "active", "tags", "meta"],
  "additionalProperties": false
}
```

> **Tip:** Use multiple examples to improve schema accuracy (e.g., show `id` as both `1` and `42` to infer `integer` rather than a specific value).

---

### Step 8: Diff / Compare

Show structural differences between two JSON documents:

```json
// Before
{"name": "Alice", "age": 30, "role": "admin"}

// After
{"name": "Alice", "age": 31, "email": "alice@example.com"}

// Diff
- "role": "admin"
+ "email": "alice@example.com"
~ "age": 30 → 31
```

**jq diff:**
```bash
# Pretty-print both and use diff
diff <(jq -S '.' before.json) <(jq -S '.' after.json)

# jq-based deep diff (requires jq 1.6+)
jq -n --slurpfile a before.json --slurpfile b after.json '$a[0] | paths as $p | {path: $p, before: ($a[0] | getpath($p)), after: ($b[0] | getpath($p))} | select(.before != .after)'
```

---

### Step 9: Merge

**Deep-merge two JSON objects (recursively):**

```json
// Object A
{"name": "App", "config": {"debug": true, "port": 3000}}

// Object B
{"config": {"port": 8080, "logLevel": "warn"}}

// Deep-merged
{"name": "App", "config": {"debug": true, "port": 8080, "logLevel": "warn"}}
```

**jq:**
```bash
jq -s 'reduce .[] as $item ({}; . * $item)' a.json b.json
```

---

### Step 10: Patch

#### JSON Patch (RFC 6902)

Operations: `add`, `remove`, `replace`, `move`, `copy`, `test`.

```json
// Original
{"name": "Alice", "age": 30}

// Patch
[
  { "op": "replace", "path": "/age", "value": 31 },
  { "op": "add", "path": "/email", "value": "alice@example.com" },
  { "op": "remove", "path": "/age" }
]
```

**jq:**
```bash
jq 'del(.age) | .email = "alice@example.com"' original.json
```

#### JSON Merge Patch (RFC 7396)

Use `null` to remove a key, omit to keep, provide value to set/replace.

```json
// Original
{"name": "Alice", "age": 30, "role": "admin"}

// Merge Patch
{"age": null, "email": "alice@example.com"}

// Result
{"name": "Alice", "email": "alice@example.com"}
```

---

### Step 11: Query with JSONPath or JMESPath

**JSONPath** (Goessner syntax):

| Expression | Meaning |
|------------|---------|
| `$.store.book[*].author` | All book authors |
| `$..price` | All price fields (recursive descent) |
| `$.store.book[?@.price < 10]` | Books under $10 (JSONPath 2.0) |

**JMESPath** (more readable, supports transformations):

| Expression | Meaning |
|------------|---------|
| `store.book[*].author` | All book authors |
| `prices[*].price` | All price values |
| `book[?price < 10].title` | Books under $10, return titles |
| `sort_by(book, &price)` | Books sorted by price |

**jq equivalents:**
```bash
jq '.store.book[].author' input.json              # JSONPath-like
jq '[.book[] | select(.price < 10) | .title]' input.json   # JMESPath-like filter
jq 'sort_by(.price)' input.json                   # JMESPath-like sort
```

---

## Pitfalls

- ❌ JSON requires **double quotes** for all keys and string values — single quotes are invalid
- ❌ JSON does **not** support trailing commas in objects or arrays
- ❌ JSON does **not** support comments (`//` or `/* */`) — unlike JavaScript
- ❌ JSON does **not** support `Infinity`, `-Infinity`, or `NaN` — use strings or omit
- ❌ JSON does **not** support duplicate keys — behavior is undefined (parsers may keep first or last)
- ⚠️ Large JSON files (>10MB) may need streaming/parsing tools rather than in-memory formatting — use `jq` or a streaming parser
- ⚠️ Converting JSON → XML with arrays: decide between repeated elements or wrapping elements
- ⚠️ Converting JSON → CSV: nested objects/arrays become stringified JSON strings in cells — flatten first
- ⚠️ Preserving numeric precision: very large integers may lose precision in some parsers (use strings for IDs)
- ⚠️ UTF-8 encoding: ensure output is properly encoded, especially for non-ASCII characters
- ⚠️ JSON Schema inference from a single example is inherently limited — the schema captures observed types, not intended types

## Verification Checklist

- [ ] JSON parses without errors (validate before and after transformation)
- [ ] All keys are double-quoted strings
- [ ] No trailing commas (unless user explicitly allows non-RFC mode)
- [ ] No single quotes in string values or keys
- [ ] Special characters are properly escaped (`\n`, `\t`, `\\`, `\"`, `\/`, `\b`, `\f`, `\uXXXX`)
- [ ] Indentation is consistent throughout the document
- [ ] Converted output matches the original data (no data loss)
- [ ] Schema generated covers all observed types and structures
- [ ] jq commands tested and return expected output
- [ ] For large files (>10MB), recommended streaming tools (jq, streaming parsers)

## Quick Reference — Common jq Commands

| Task | jq command |
|------|-----------|
| Pretty-print | `jq '.' file.json` |
| Minify | `jq -c '.' file.json` |
| Sorted keys | `jq -S '.' file.json` |
| Access field | `jq '.key' file.json` |
| Access nested | `jq '.a.b.c' file.json` |
| Array length | `jq '.arr | length' file.json` |
| Filter array | `jq '[.arr[] | select(.x > 10)]' file.json` |
| Rename key | `jq '{new: .old}' file.json` |
| Delete key | `jq 'del(.key)' file.json` |
| Add key | `jq '.key = "value"' file.json` |
| Sort array | `jq 'sort_by(.field)' file.json` |
| Group by | `jq 'group_by(.field)' file.json` |
| Unique | `jq '[.arr | unique[]]' file.json` |
| Flatten | `jq '[.arr[] | .nested[]]' file.json` |
| Merge objects | `jq -s 'add' a.json b.json` |
| Validate | `jq '.' file.json && echo valid` |

## References

- JSON specification (RFC 8259): https://www.rfc-editor.org/rfc/rfc8259
- JSON Schema (draft 2020-12): https://json-schema.org/draft/2020-12/json-schema-core
- JSONPath syntax: https://goessner.net/articles/JsonPath/
- JMESPath tutorial: https://jmespath.org/tutorial.html
- JSON Patch (RFC 6902): https://www.rfc-editor.org/rfc/rfc6902
- JSON Merge Patch (RFC 7396): https://www.rfc-editor.org/rfc/rfc7396
- jq manual: https://stedolan.github.io/jq/manual/
- YAML specification: https://yaml.org/spec/
