# Cross-Database Migration Patterns

Detailed migration strategies for PostgreSQL, MySQL, and SQLite. Use this reference when performing schema changes that behave differently across databases.

---

## Table of Contents

- [Column Operations](#column-operations)
- [Index Operations](#index-operations)
- [Rename Operations](#rename-operations)
- [Type Changes](#type-changes)
- [Constraint Operations](#constraint-operations)
- [Migration Tooling Comparison](#migration-tooling-comparison)

---

## Column Operations

### ADD COLUMN

| Database | Nullable | Non-NULL with default | Notes |
|----------|----------|----------------------|-------|
| PostgreSQL | ✅ Instant | ⚠️ Table lock (VACUUM) | Use two-step: add nullable → backfill → set NOT NULL |
| MySQL 8.0.12+ | ✅ Instant | ✅ Instant (with default) | `ALGORITHM=INSTANT` supported |
| MySQL 5.7 | ✅ Instant | ⚠️ Table rebuild | Set default, then alter |
| SQLite 3.35.0+ | ✅ Instant | ⚠️ Table rebuild | SQLite only supports `ADD COLUMN` — no `DROP COLUMN` |

**PostgreSQL — safe non-NULL column:**

```sql
-- Step 1: Add nullable column
ALTER TABLE orders ADD COLUMN priority INT;

-- Step 2: Backfill
UPDATE orders SET priority = 0 WHERE priority IS NULL;

-- Step 3: Set NOT NULL and default
ALTER TABLE orders ALTER COLUMN priority SET NOT NULL;
ALTER TABLE orders ALTER COLUMN priority SET DEFAULT 0;
```

**MySQL 8.0+ — safe non-NULL column:**

```sql
-- MySQL 8.0.12+ supports INSTANT ADD COLUMN with NOT NULL + DEFAULT
ALTER TABLE orders ADD COLUMN priority INT NOT NULL DEFAULT 0;
```

### DROP COLUMN

| Database | Support | Notes |
|----------|---------|-------|
| PostgreSQL | ✅ `DROP COLUMN` | Instant, no rebuild |
| MySQL 8.0.12+ | ✅ `DROP COLUMN` | INSTANT if no index depends on it |
| SQLite | ❌ Not supported | Must use rename-recreate pattern |

**SQLite — drop column workaround:**

```sql
BEGIN TRANSACTION;

-- 1. Create new table without the column
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- 2. Copy data (excluding the dropped column)
INSERT INTO users_new (id, email, name) SELECT id, email, name FROM users;

-- 3. Drop old table
DROP TABLE users;

-- 4. Rename new table
ALTER TABLE users_new RENAME TO users;

COMMIT;
```

---

## Index Operations

### CREATE INDEX

| Database | Concurrent / Online | Lock behavior | Notes |
|----------|--------------------|---------------|-------|
| PostgreSQL | ✅ `CONCURRENTLY` | No lock | Slower but non-blocking |
| MySQL 5.6+ | ✅ `ALGORITHM=INPLACE` | Minimal lock | `LOCK=NONE` for truly online |
| SQLite | ❌ No | Full table lock | Schedule during low traffic |

**PostgreSQL — concurrent index:**

```sql
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
```

**MySQL — online index creation:**

```sql
ALTER TABLE orders ADD INDEX idx_orders_status (status),
    ALGORITHM=INPLACE, LOCK=NONE;
```

### DROP INDEX

| Database | Support | Concurrent? |
|----------|---------|-------------|
| PostgreSQL | ✅ `DROP INDEX` | No concurrent option (drop is fast) |
| MySQL | ✅ `DROP INDEX` | Fast for most cases |
| SQLite | ✅ `DROP INDEX` | Fast |

```sql
-- All databases
DROP INDEX IF EXISTS idx_orders_status;
```

---

## Rename Operations

### RENAME COLUMN

| Database | Support | Notes |
|----------|---------|-------|
| PostgreSQL 15+ | ✅ `RENAME COLUMN` | Instant, no rebuild |
| MySQL | ❌ Not supported | Use rename-recreate |
| SQLite 3.35.0+ | ✅ `RENAME COLUMN` | Instant, no rebuild |

**MySQL — rename column (rename-recreate):**

```sql
-- Step 1: Create new table with new schema
CREATE TABLE users_new (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Copy data
INSERT INTO users_new (id, email, full_name, created_at, updated_at)
SELECT id, email, name, created_at, updated_at FROM users;

-- Step 3: Verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users_new;

-- Step 4: Swap tables (atomic in MySQL)
RENAME TABLE users TO users_old, users_new TO users;

-- Step 5: Drop old table (after verification period)
DROP TABLE users_old;
```

### RENAME TABLE

All databases support `RENAME TABLE`:

```sql
-- PostgreSQL / MySQL
ALTER TABLE old_name RENAME TO new_name;

-- SQLite
ALTER TABLE old_name RENAME TO new_name;
```

---

## Type Changes

### Changing column types

| Database | Safe Changes | Risky Changes |
|----------|-------------|---------------|
| PostgreSQL | `INT` → `BIGINT`, `VARCHAR` → `TEXT` | `TEXT` → `VARCHAR(n)`, adding constraints that fail existing data |
| MySQL | `TINYINT` → `SMALLINT`, `VARCHAR` → `TEXT` | `TEXT` → `VARCHAR`, adding `NOT NULL` to nullable column |
| SQLite | `TEXT` → `INTEGER` (if data is numeric) | Most changes require rebuild |

**PostgreSQL — safe type change:**

```sql
ALTER TABLE users ALTER COLUMN age TYPE BIGINT;
```

**PostgreSQL — risky type change (two-step):**

```sql
-- Change TEXT → VARCHAR(255) — must verify no values exceed 255
-- Step 1: Check for violations
SELECT email, LENGTH(email) FROM users WHERE LENGTH(email) > 255;

-- Step 2: If clean, proceed
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);
```

**SQLite — type change (requires rebuild):**

```sql
BEGIN TRANSACTION;

CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age BIGINT  -- changed from INTEGER to BIGINT
);

INSERT INTO users_new (id, email, name, age)
SELECT id, email, name, CAST(age AS BIGINT) FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

COMMIT;
```

---

## Constraint Operations

### ADD / DROP CONSTRAINT

```sql
-- PostgreSQL
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_user;

-- MySQL
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE orders DROP FOREIGN KEY fk_orders_user;

-- SQLite (3.6.19+)
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id);
```

### UNIQUE constraint

```sql
-- All databases
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
```

---

## Migration Tooling Comparison

| Tool | Language | Databases | Features |
|------|----------|-----------|----------|
| **Flyway** | Java/CLI | 30+ | Schema-first, version control, CI/CD integration |
| **Liquibase** | Java/CLI | 30+ | XML/YAML/SQL, rollback scripts, change logs |
| **Prisma Migrate** | TypeScript | PostgreSQL, MySQL, SQLite, SQL Server | Schema-driven, auto-generates migrations |
| **Hibernate ddl-auto** | Java (JPA) | Any (via dialect) | Auto-generates from entity classes |
| **Django Migrations** | Python | PostgreSQL, MySQL, SQLite, Oracle | Auto-generates from models |
| **Rails ActiveRecord** | Ruby | PostgreSQL, MySQL, SQLite | Auto-generates from schema changes |

### When to use raw SQL vs. tooling

| Scenario | Recommendation |
|----------|---------------|
| Small team, simple schema | Raw SQL files with timestamp naming |
| Enterprise, multiple databases | Flyway or Liquibase |
| TypeScript/Node.js project | Prisma Migrate |
| Java/Spring project | Flyway (standard integration) |
| Django project | Django's built-in migrations |
| Rails project | ActiveRecord migrations |

---

## Quick Reference: Safe Migration Checklist

1. **Always test on a copy of production data** before deploying
2. **Write the rollback (down) migration** alongside the forward migration
3. **Check for table locks** — use `CONCURRENTLY` (PostgreSQL), `ALGORITHM=INPLACE` (MySQL)
4. **Add nullable columns first**, backfill in a second migration
5. **Verify backward compatibility** — can you deploy the migration before the code change?
6. **Use `IF EXISTS` / `IF NOT EXISTS`** for idempotency
7. **Monitor `pg_stat_activity`** (PostgreSQL) or `SHOW PROCESSLIST` (MySQL) during migration
8. **Schedule heavy operations** during low-traffic windows
9. **Keep migrations small** — one logical change per migration file
10. **Never edit a migration** that has been applied to production — create a new one instead
