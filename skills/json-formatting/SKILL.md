---
name: json-formatting
description: Format, pretty-print, minify, validate, transform, and convert JSON data. Use this skill whenever the user needs to format JSON output, minify JSON, validate JSON structure, convert between JSON and other formats (YAML, XML, CSV, TOML), restructure JSON keys, extract nested values, or generate JSON schemas. Trigger on any request involving JSON formatting, JSON beautification, JSON validation, JSON-to-other-format conversion, or JSON schema generation. Also trigger when the user asks to compact, indent, sort, or reformat JSON data.
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

## Procedure

### 1. Determine the Task

Ask the user (or infer from context) which operation they need:

| Task | Description |
|------|-------------|
| **Format / Pretty-Print** | Add consistent indentation and line breaks to minified JSON |
| **Minify / Compact** | Remove all whitespace and newlines from formatted JSON |
| **Validate** | Check JSON syntax and report errors with line/column info |
| **Transform** | Rename keys, flatten nested objects, extract fields, sort keys |
| **Convert** | Convert JSON to YAML, XML, CSV, or TOML (and vice versa) |
| **Schema** | Generate a JSON Schema draft from example JSON data |
| **Diff / Compare** | Find differences between two JSON documents |
| **Merge** | Deep-merge two JSON objects or arrays |

### 2. Format / Pretty-Print

**Standard indentation (2 spaces):**

```json
{
  "name": "Awesome Qwen",
  "version": "1.0.0",
  "description": "A curated collection of extensions, skills, agents, and workflows",
  "repository": {
    "type": "git",
    "url": "https://github.com/iromu/awesome-qwen"
  },
  "scripts": {
    "build": "npm run build",
    "test": "npm run test"
  }
}
```

**Options to offer:**
- Indent size: 2 spaces (default, most common), 4 spaces (Python/Go style), or tabs
- Trailing commas: allow or disallow (RFC 8259 says no, but many parsers allow it)
- Sort keys: alphabetically or by insertion order

### 3. Minify / Compact

Remove all unnecessary whitespace, newlines, and formatting:

```json
{"name":"Awesome Qwen","version":"1.0.0","description":"A curated collection","repository":{"type":"git","url":"https://github.com/iromu/awesome-qwen"}}
```

### 4. Validate

Check for common JSON errors and report them precisely:

| Error | Example | Fix |
|-------|---------|-----|
| Missing closing bracket | `{"key": "value"` | Add `}` |
| Trailing comma | `{"a": 1,}` | Remove `,` |
| Unquoted key | `{key: "value"}` | Use `"key": "value"` |
| Single quotes | `{'key': 'value'}` | Use double quotes: `{"key": "value"}` |
| Unescaped special chars | `{"text": "hello\nworld"}` | Escape: `"hello\\nworld"` |
| Duplicate keys | `{"a": 1, "a": 2}` | Keep only one |
| Invalid escape | `{"text": "hello\d"}` | Use valid escapes: `\n`, `\t`, `\\`, `\"`, `\/`, `\b`, `\f`, `\uXXXX` |
| Infinity / NaN | `{"val": Infinity}` | Use numbers or strings only |

### 5. Transform

**Rename keys (map old → new):**

```json
// Before
{"first_name": "John", "last_name": "Doe", "emailAddr": "john@example.com"}

// After (rename first_name → firstName, last_name → lastName, emailAddr → email)
{"firstName": "John", "lastName": "Doe", "email": "john@example.com"}
```

**Flatten nested objects (dot-separated keys):**

```json
// Before
{"user": {"name": "John", "address": {"city": "NYC", "zip": "10001"}}}

// After
{"user.name": "John", "user.address.city": "NYC", "user.address.zip": "10001"}
```

**Extract nested values (JSONPath-style):**

```json
// Query: $.users[*].name
// From: {"users": [{"name": "Alice"}, {"name": "Bob"}]}
// Result: ["Alice", "Bob"]
```

**Sort keys alphabetically:**

```json
// Before
{"zebra": 1, "apple": 2, "mango": 3}

// After
{"apple": 2, "mango": 3, "zebra": 1}
```

### 6. Convert

**JSON → YAML:**

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

**JSON → XML:**

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

**JSON → CSV:**

```json
// Input (JSON array of objects)
[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]

// Output (CSV)
name,age
Alice,30
Bob,25
```

**JSON → TOML:**

```json
// Input (JSON)
{"database": {"server": "192.168.1.1", "ports": [5432, 5433]}}

// Output (TOML)
[database]
server = "192.168.1.1"
ports = [5432, 5433]
```

### 7. Generate JSON Schema

From example data, produce a draft JSON Schema:

```json
// Example input
{"id": 1, "name": "Widget", "active": true, "tags": ["new", "featured"], "meta": null}

// Generated schema
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "number" },
    "name": { "type": "string" },
    "active": { "type": "boolean" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "meta": { "nullable": true }
  },
  "required": ["id", "name", "active", "tags", "meta"]
}
```

### 8. Diff / Compare

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

## Pitfalls
- ❌ JSON requires **double quotes** for all keys and string values — single quotes are invalid
- ❌ JSON does **not** support trailing commas in objects or arrays
- ❌ JSON does **not** support comments (`//` or `/* */`) — unlike JavaScript
- ❌ JSON does **not** support `Infinity`, `-Infinity`, or `NaN` — use strings or omit
- ❌ JSON does **not** support duplicate keys — behavior is undefined (parsers may keep first or last)
- ⚠️ Large JSON files (>10MB) may need streaming/parsing tools rather than in-memory formatting
- ⚠️ Converting JSON → XML with arrays: decide between repeated elements or wrapping elements
- ⚠️ Converting JSON → CSV: nested objects/arrays become stringified JSON strings in cells
- ⚠️ Preserving numeric precision: very large integers may lose precision in some parsers (use strings for IDs)
- ⚠️ UTF-8 encoding: ensure output is properly encoded, especially for non-ASCII characters

## Verification Checklist
- [ ] JSON parses without errors (validate before and after transformation)
- [ ] All keys are double-quoted strings
- [ ] No trailing commas
- [ ] No single quotes in string values or keys
- [ ] Special characters are properly escaped (`\n`, `\t`, `\\`, `\"`, `\/`)
- [ ] Indentation is consistent throughout the document
- [ ] Converted output matches the original data (no data loss)
- [ ] Schema generated covers all observed types and structures

## References
- JSON specification (RFC 8259): https://www.rfc-editor.org/rfc/rfc8259
- JSON Schema (draft 2020-12): https://json-schema.org/draft/2020-12/json-schema-core
- JSONPath syntax: https://goessner.net/articles/JsonPath/
- YAML specification: https://yaml.org/spec/
