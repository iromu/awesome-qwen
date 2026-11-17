---
description: Enforce Jinja2 template best practices for safe output (autoescaping), documenting templates with header and block comments, whitespace control, reuse, and minimal logic
paths:
  - "**/*.{jinja,jinja2,j2}"
---

# Jinja Template Best Practices

## Rules

1. **Always enable autoescape** for HTML/XML output (`autoescape=True` on the Environment, or `{% autoescape true %}`) to prevent XSS
2. **Use the `tojson` filter** when embedding values inside `<script>` blocks — never hand-roll JSON into JS
3. **Provide defaults for optional values** with `{{ value | default("fallback") }}` (add `true` as the second arg to also catch empty/falsy values)
4. **Keep logic in the view, presentation in the template** — no business logic, DB queries, or complex arithmetic; templates render, they don't compute
5. **Prefer `{%- ... -%}` whitespace control** on block tags so generated markup stays clean and diff-friendly
6. **Reuse with `extends`/`block` for layout, `include` for fragments, and `macro` for parameterized snippets** — don't copy-paste markup
7. **Add a header comment at the top of every template** documenting what it renders, its expected variables (name, type, default), and where it is maintained — use `{# #}` so it stays out of the output
8. **Comment non-obvious blocks** with `{# #}` — data-structure shapes, conditional sections, and `| default(...)` values — but do not narrate obvious syntax (no `{# Loop over servers #}` above a plain `for`)
9. **Pick the right comment kind:** `{# #}` is stripped and is for template maintainers; a native output comment (`#`, `//`, `<!-- -->`) is for whoever reads the *generated* file. Use `{# ... -#}` to strip the blank line a comment would otherwise leave, and `{# #}` to temporarily disable a block during development
10. **Wrap literal braces in `{% raw %}`** when the output (not Jinja) needs `{{ }}` or `{% %}` (e.g. client-side template engines)
11. **Use `strictundefined` in development** so a typo'd or missing variable fails loudly instead of rendering silently
12. **Loop with `{% for %}`/`{% else %}`** for empty-state handling, and expose the loop context (`loop.index`, `loop.first`, `loop.last`) rather than manual counters

## Examples

```jinja
{# ❌ Bad — unescaped interpolation inside a script tag; XSS risk #}
<script>
  var user = { name: "{{ user.name }}", id: {{ user.id }} };
</script>

{# ✅ Good — tojson handles escaping and quoting for JS context #}
<script>
  var user = {{ user | tojson }};
</script>
```

```jinja
{# ❌ Bad — blank page if the key is missing; messy whitespace #}
<div>
{% for item in items %}
  <li>{{ item.title }} - {{ item.author.name }}</li>
{% endfor %}
</div>

{# ✅ Good — whitespace-controlled, safe attribute access, empty-state branch #}
<ul>
{%- for item in items %}
  <li>{{ item.title }} — {{ item.author.name | default("Unknown") }}</li>
{%- else %}
  <li>No items yet.</li>
{%- endfor %}
</ul>
```

```jinja
{# ✅ Reuse: a base layout a child fills in #}
{# base.html #}
<!doctype html>
<html>
  <body>{% block content %}{% endblock %}</body>
</html>

{# page.html #}
{% extends "base.html" %}
{% block content %}<h1>{{ title }}</h1>{% endblock %}
```

```jinja
{# ✅ Documented template: header states what it renders, its inputs, and owner #}
{#
  Template: nginx_vhost.conf.j2
  Generates: Virtual host configuration for Nginx
  Expected variables:
    - vhost_name (string): the server name
    - vhost_port (int): listen port, defaults to 80
    - vhost_locations (list): location block definitions
  Maintained in: roles/nginx/templates/
#}
server {
    listen {{ vhost_port | default(80) }};
    server_name {{ vhost_name }};

    {# upstreams is a dict: key = pool name, value = list of {host, port}; weight defaults to 1 #}
    {%- for pool, servers in upstreams.items() %}
    upstream {{ pool }} {
        {%- for s in servers %}
        server {{ s.host }}:{{ s.port }} weight={{ s.weight | default(1) }};
        {%- endfor %}
    }
    {%- endfor %}

    {# 10m cap supports file uploads up to 10MB #}
    client_max_body_size {{ nginx_max_body_size | default('10m') }};
}
```

```jinja
{# ❌ Bad — narrates the obvious, and a Jinja comment where the note belongs in the output #}
{# Loop over servers #}
{% for s in servers %}
{# This is a comment about the server #}
server {{ s.host }};
{% endfor %}

{# ✅ Good — no narration; use a native comment when the reader of the GENERATED file needs the note #}
{% for s in servers %}
# Managed by Ansible — do not edit on the host; edit the template instead.
server {{ s.host }};
{% endfor %}
```
