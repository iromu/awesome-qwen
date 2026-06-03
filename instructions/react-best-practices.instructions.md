---
description: Enforce React functional component patterns, hooks usage, and performance optimization
applyTo: "**/*.{jsx,tsx}"
tags: ["react", "hooks", "performance", "best-practices"]
priority: 10
---

# React Best Practices

## Rules

1. **Use functional components** with TypeScript interfaces for props
2. **Prefer Composition over Inheritance** - break large components into smaller ones
3. **Memoize expensive computations** with `useMemo`, callbacks with `useCallback`
4. **Lift state up** only when shared; keep state as close to usage as possible
5. **Use custom hooks** to extract and reuse stateful logic
6. **Avoid inline object/array creation** in JSX props (causes re-renders)
7. **Use `React.lazy` + `Suspense`** for code splitting large bundles
8. **Prefer `key` prop with stable IDs** (not array index) for lists
9. **Handle errors with Error Boundaries** - don't let uncaught errors crash the UI
10. **Use `startTransition`** for non-urgent state updates (React 18+)

## Examples

```tsx
// ❌ Bad
function UserList({ users }: Props) {
  return (
    <div>
      {users.map((user, index) => (
        <UserCard key={index} user={user} onClick={() => console.log(user)} />
      ))}
    </div>
  );
}

// ✅ Good
function UserList({ users }: Props) {
  const handleUserClick = useCallback((user: User) => {
    console.log(user);
  }, []);

  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} onClick={handleUserClick} />
      ))}
    </div>
  );
}
```

```tsx
// ❌ Bad - expensive computation on every render
function Component({ items }) {
  const sorted = items.sort((a, b) => a.value - b.value);
  return <List items={sorted} />;
}

// ✅ Good - memoized
function Component({ items }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.value - b.value),
    [items]
  );
  return <List items={sorted} />;
}
```
