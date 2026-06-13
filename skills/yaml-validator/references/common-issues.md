# YAML Best Practices

Source: [YAML Spec 1.2](https://yaml.org/spec/1.2.2/), [yamllint rules](https://yamllint.readthedocs.io/), and community conventions.

## Indentation

- **Use 2-space indentation** consistently. This is the de facto standard (used by GitHub, Docker, Kubernetes, etc.).
- **Never use tabs.** YAML parsers treat tabs as syntax errors or unpredictable behavior.
- **Align within a block.** Do not mix 2-space and 4-space indentation in the same file.

```yaml
# ✅ Good
server:
  host: localhost
  port: 8080
  ssl:
    enabled: true
    cert: /path/to/cert.pem

# ❌ Bad — mixed indentation
server:
  host: localhost
    port: 8080
      ssl:
        enabled: true
```

## Quoting

### When to Quote

| Situation | Example | Quoted |
|-----------|---------|--------|
| Strings with special chars (`:`, `#`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `` ` ``) | `message: Hello: world` | `message: "Hello: world"` |
| Strings that look like numbers | `version: 010` | `version: "010"` |
| Strings that look like dates | `date: 2024-01-01` | `date: "2024-01-01"` |
| Strings that look like booleans | `status: yes` | `status: "yes"` |
| Strings that look like null | `value: ~` | `value: "~"` |
| Strings that look like floats | `score: .inf` | `score: ".inf"` |
| URLs with colons | `url: http://example.com` | `url: "http://example.com"` |
| Empty strings | `message: ` (null) | `message: ""` |

### When Not to Quote

```yaml
# ✅ These are fine unquoted
name: John Smith
count: 42
enabled: true
path: /usr/local/bin
description: >
  A multi-line
  description that wraps
```

### Single vs Double Quotes

| Type | Escaping | Variable Interpolation |
|------|----------|----------------------|
| `'single'` | Escape `'` as `''` | No |
| `"double"` | Escape `"` as `\"`, `\n`, `\t` | No (YAML doesn't support interpolation) |

Prefer **single quotes** for simple strings. Use **double quotes** when you need `\n` or `\"` inside the value.

```yaml
# ✅ Simple string
name: 'hello world'

# ✅ String with a single quote inside
greeting: "it's a test"

# ✅ String with a newline
multiline: "line one\nline two"
```

## Block Scalars

Use block scalars for multi-line text:

| Indicator | Behavior | Example |
|-----------|----------|---------|
| `|` (literal) | Preserves all newlines | `|\nline1\nline2` → `line1\nline2\n` |
| `>` (folded) | Folds newlines into spaces | `>\nline1\nline2` → `line1 line2\n` |
| `|-` (literal, no trailing newline) | Same as `\|` but strips final newline | `|\nline1\n` → `line1` |
| `>-` (folded, no trailing newline) | Same as `\>` but strips final newline | `>\nline1\n` → `line1` |

```yaml
# ✅ Literal block — preserves formatting
readme: |
  Line 1
  Line 2
  Line 3

# ✅ Folded block — reads as a paragraph
summary: >
  This is a long summary
  that spans multiple lines
  but reads as one paragraph.

# ✅ Literal block, no trailing newline
script: |-
  #!/bin/bash
  echo "hello"
```

## Booleans (YAML 1.2)

YAML 1.2 (the current standard) defines these as booleans:

```yaml
# ✅ YAML 1.2 booleans
enabled: true
disabled: false

# ⚠️ YAML 1.1 booleans (deprecated but still parsed by some tools)
enabled: yes
disabled: no
on: on
off: off
```

**Recommendation:** Always use `true`/`false`. Set `yaml.dump(default_flow_style=None, default_style='|', canonical=False, allow_unicode=True)` in Python to avoid `yes`/`no` output.

## Null Values

| Syntax | Parsed As | Use When |
|--------|-----------|----------|
| `key:` | `None` / `null` | Key intentionally absent or null |
| `key: ~` | `None` / `null` | Explicit null (same as above) |
| `key: null` | `None` / `null` | Explicit null (same as above) |
| `key: ""` | `""` (empty string) | Key should exist with empty string value |

**Important:** `yaml.dump()` omits null values by default. Use `yaml.dump(data, default_flow_style=None, allow_unicode=True, default_style=None)` for predictable output.

## Anchor and Alias

```yaml
# ✅ Define anchor, then reference it
defaults: &defaults
  timeout: 30
  retries: 3

service_a:
  <<: *defaults
  name: service-a

service_b:
  <<: *defaults
  name: service-b
```

**Rules:**
- Anchors (`&name`) must be defined **before** they are used (`*name`).
- Merge keys (`<<: *name`) merge the anchored mapping into the current mapping.
- Avoid deep nesting of anchors — it makes the document hard to read.

## Duplicate Keys

YAML technically allows duplicate keys (last value wins), but this is a **source of bugs**:

```yaml
# ❌ Duplicate key — last value wins silently
database:
  host: localhost
  host: remote-host   # ⚠️ silently overrides above

# ✅ FIX — unique keys
database:
  primary_host: localhost
  replica_host: remote-host
```

## Line Length

- Keep lines **under 80 characters** when possible.
- Use block scalars (`|` or `>`) for long values.
- Use flow style (`{key: value}`) sparingly for simple inline mappings.

```yaml
# ❌ Long line
description: "This is a very long description that goes on and on and exceeds eighty characters in total length"

# ✅ FIX — block scalar
description: >
  This is a very long description that
  goes on and on and exceeds eighty
  characters in total length.
```

## File Organization

1. **Document start:** Use `---` at the top of multi-document YAML files. For single-document files, `---` is optional but recommended for consistency.
2. **Top-level keys:** Sort alphabetically for large files, or group by logical section.
3. **Sections:** Separate logical groups with comments:

```yaml
# --- Server Configuration ---
server:
  host: localhost
  port: 8080

# --- Database Configuration ---
database:
  host: localhost
  port: 5432
```

## Common Pitfalls Checklist

- [ ] No tabs used for indentation
- [ ] Strings with special characters are quoted
- [ ] No implicit type coercion surprises (leading zeros, dates, booleans)
- [ ] No duplicate keys
- [ ] Consistent 2-space indentation throughout
- [ ] URLs and emails are quoted if they cause parsing issues
- [ ] Multi-line text uses `|` or `>` appropriately
- [ ] File ends with a newline
- [ ] No trailing whitespace on any line
- [ ] Boolean values use `true`/`false` (YAML 1.2)
- [ ] Null values are intentional and clear
- [ ] Anchor/alias definitions precede their uses
