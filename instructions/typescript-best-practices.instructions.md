---
description: Enforce TypeScript best practices including strict mode, no-explicit-any avoidance, and proper type inference
applyTo: "**/*.ts"
tags: ["typescript", "best-practices", "type-safety"]
priority: 10
---

# TypeScript Best Practices

## Rules

1. **Always use `strict: true`** in tsconfig.json
2. **Avoid `any`** - use `unknown` when type is truly unknown, then narrow
3. **Prefer `interface` for object shapes**, `type` for unions/intersections
4. **Use type inference** where obvious, explicit annotations at function boundaries
5. **Prefer `readonly`** for immutable data structures
6. **Use discriminated unions** instead of optional properties for variant types
7. **Avoid type assertions** (`as Type`) unless absolutely necessary
8. **Use nullish coalescing** (`??`) instead of `||` for default values
9. **Prefer optional chaining** (`?.`) for safe property access
10. **Use `const` assertions** for literal type inference

## Examples

```typescript
// ❌ Bad
function process(data: any) {
  return data.value || "default";
}

// ✅ Good
function process(data: { value?: string }) {
  return data.value ?? "default";
}
```

```typescript
// ❌ Bad
type Result = { success: boolean; data?: any; error?: string };

// ✅ Good
type Result = 
  | { success: true; data: unknown }
  | { success: false; error: string };
```
