---
description: Enforce Python PEP 8 conventions, type hints, and modern Python patterns
applyTo: "**/*.py"
tags: ["python", "pep8", "type-hints", "best-practices"]
priority: 10
---

# Python Code Conventions

## Rules

1. **Follow PEP 8**: 4-space indentation, 79-char line limit, snake_case naming
2. **Use type hints** on all function signatures (arguments and return type)
3. **Prefer `pathlib`** over `os.path` for file path operations
4. **Use f-strings** for string formatting (Python 3.6+)
5. **Use dataclasses** for data-holding classes instead of plain `__init__`
6. **Prefer context managers** (`with`) for resource management
7. **Use `match`/`case`** for pattern matching (Python 3.10+) instead of long `if`/`elif` chains
8. **Avoid mutable default arguments** - use `None` and initialize inside function
9. **Use `logging` module** instead of `print` for application logging
10. **Use list/dict comprehensions** where readable, generator expressions for large datasets

## Examples

```python
# ❌ Bad
def get_users(list):
    result = []
    for u in list:
        if u.active == True:
            result.append(u.name)
    return result

# ✅ Good
def get_active_users(users: list[User]) -> list[str]:
    return [user.name for user in users if user.is_active]
```

```python
# ❌ Bad
def process(data={}):
    data["key"] = "value"
    return data

# ✅ Good
def process(data: dict[str, str] | None = None) -> dict[str, str]:
    result = data or {}
    result["key"] = "value"
    return result
```
