# YAML Best Practices — Style Guide

> Guidelines for writing clean, consistent, and unambiguous YAML files.

---

## 1. Indentation

- **Use 2-space indentation** consistently. This is the de facto standard.
- **Never use tabs.** YAML 1.2 explicitly forbids them.
- **Be consistent within a file.** Mixing 2-space and 4-space indentation is an error.

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

---

## 2. Quoting Strings

### Quote These

| Case | Example | Why |
|------|---------|-----|
| Strings that look like numbers | `"010"`, `"2024-01-15"` | Prevents type coercion |
| Strings with special chars | `"Hello: world"`, `"# comment"` | `:`, `#`, `{`, `}`, etc. are reserved |
| URLs and emails (for safety) | `"https://example.com"` | Usually works unquoted, but quoting is consistent |
| Empty strings | `""` | Distinguishes from null |
| Values with leading/trailing spaces | `" hello "` | Preserves whitespace |

### Don't Quote These

| Case | Example | Why |
|------|---------|-----|
| Plain strings | `name: hello` | No ambiguity |
| Numbers | `count: 42` | Intentional integer |
| Booleans | `enabled: true` | YAML 1.2 style |
| Null | `value: null` | Explicit null |

```yaml
# ✅ Good
name: hello
count: 42
enabled: true
version: "0.9.3"
date: "2024-01-15"
message: "Hello: world"
empty: ""
null_val: null

# ❌ Bad — over-quoting
name: "hello"
count: "42"
enabled: "true"
```

---

## 3. Block Scalars

Use block scalars for multi-line text. Choose the right indicator:

| Indicator | Behavior | Use Case |
|-----------|----------|----------|
| `|` (literal) | Preserves all newlines | Code snippets, logs, addresses |
| `\|` (literal, strip) | Removes final newline | When you don't want trailing newline |
| `|+` (literal, keep) | Preserves final newline (explicit) | When clarity matters |
| `>` (folded) | Folds newlines into spaces | Long paragraphs, descriptions |
| `>` (folded, strip) | Folds + removes final newline | When you don't want trailing newline |
| `>+` (folded, keep) | Folds + preserves final newline | When clarity matters |

```yaml
# ✅ Literal block — preserves newlines
description: |
  Line 1
  Line 2
  Line 3
# Result: "Line 1\nLine 2\nLine 3\n"

# ✅ Folded block — folds into paragraph
summary: >
  This is a long paragraph that should be
  folded into a single line for readability.
# Result: "This is a long paragraph that should be folded into a single line for readability.\n"

# ✅ Literal with chomp — no trailing newline
code: |-
  def hello():
      print("world")
# Result: "def hello():\n    print(\"world\")"
```

---

## 4. Collections

### Sequences (Lists)

Use block sequence style for readability:

```yaml
# ✅ Good — block style
tags:
  - web
  - api
  - production

# ❌ Less readable — flow style (use only for short lists)
tags: [web, api, production]
```

### Mappings (Dictionaries)

Use block mapping style:

```yaml
# ✅ Good — block style
server:
  host: localhost
  port: 8080

# ❌ Less readable — flow style (use only for simple, short mappings)
server: {host: localhost, port: 8080}
```

---

## 5. Boolean Values

Use `true` / `false` (YAML 1.2), not `yes` / `no` / `on` / `off` (YAML 1.1).

```yaml
# ✅ YAML 1.2 style
enabled: true
debug: false

# ❌ YAML 1.1 style — may cause confusion
enabled: yes
debug: no
```

---

## 6. Null Values

Be explicit about null:

```yaml
# ✅ Clear
value: null
optional: ~
empty_string: ""

# ❌ Ambiguous — is this null or empty string?
value:
```

---

## 7. Anchor and Alias Usage

- Define anchors **before** using aliases.
- Ensure type compatibility between anchor and alias.
- Avoid deep nesting of aliases — it hurts readability.

```yaml
# ✅ Good
defaults: &defaults
  timeout: 30
  retries: 3
  retry_delay: 5

production:
  <<: *defaults
  timeout: 60   # override

staging:
  <<: *defaults   # use all defaults
```

---

## 8. File Organization

### Document Start

Use `---` at the top of multi-document YAML files:

```yaml
# ✅ Multi-document YAML
---
apiVersion: v1
kind: Service
---
apiVersion: v1
kind: ConfigMap
```

For single-document files, `---` is optional but recommended for consistency.

### Section Comments

Group related keys with comments:

```yaml
# --- Server Configuration ---
server:
  host: localhost
  port: 8080

# --- Database Configuration ---
database:
  host: localhost
  port: 5432
  name: myapp
```

### Key Ordering

- **Alphabetical** for flat configs (simple key-value files).
- **Logical grouping** for complex configs (server, database, logging, etc.).
- **Consistent ordering** across similar files (e.g., all `config.yaml` files in a project).

---

## 9. Line Length

- **Keep lines under 80 characters** when possible.
- Use block scalars (`|` or `>`) for long values.
- Break long lists into multiple lines.

```yaml
# ❌ Long line
description: "This is a very long description that exceeds eighty characters in total length and should be broken up"

# ✅ Good — block scalar
description: >
  This is a very long description that
  exceeds eighty characters in total
  length and should be broken up.
```

---

## 10. Trailing Whitespace and Newlines

- **Remove trailing whitespace** from every line.
- **End the file with a newline.** Many tools and parsers expect this.

```yaml
# ❌ Trailing spaces
key: value   

# ❌ No trailing newline
key: value
```
*(no newline after `value`)*

```yaml
# ✅ Good
key: value
```
*(with trailing newline)*

---

## 11. YAML Version

Prefer **YAML 1.2** semantics:

- `true` / `false` for booleans (not `yes` / `no`)
- No implicit octal conversion for leading-zero numbers
- More predictable type coercion

Most modern parsers default to YAML 1.2. If using an older parser, specify the version:

```python
import yaml
data = yaml.safe_load(text, Loader=yaml.SafeLoader)  # YAML 1.2 compliant
```

---

## Quick Reference Checklist

- [ ] 2-space indentation, no tabs
- [ ] Quote strings with special characters
- [ ] Quote strings that look like numbers or dates
- [ ] Use `true`/`false` for booleans
- [ ] No duplicate keys
- [ ] Use `|` for literal multi-line, `>` for folded
- [ ] No trailing whitespace
- [ ] File ends with newline
- [ ] Consistent style within a file
- [ ] Lines under 80 characters when possible
- [ ] Anchors defined before aliases
