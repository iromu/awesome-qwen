---
name: database-migration
description: >
  Create database migrations, write rollback scripts, perform zero-downtime schema
  changes, rename columns without locking, add nullable columns, or need safe migration
  patterns for PostgreSQL, MySQL, or SQLite. Use this skill when the user is designing a
  migration strategy, writing forward and backward migration SQL, planning a schema
  change that must not cause downtime, or needs best practices for versioning database
  changes. Don't hesitate to suggest this skill when the user is working on database
  schema evolution, column additions or renames, index management, or migration tooling,
  even if they don't explicitly mention zero-downtime or rollback.
version: 1.0.0
category: backend
tags: [database, migration, sql, schema, postgresql, mysql, sqlite]
---

# Database Migration

## When to Use

Use this skill when the user asks about any of the following:

1. **Writing forward migrations** — creating tables, adding columns, adding indexes
2. **Writing rollback (down) migrations** — dropping columns, removing indexes, dropping tables
3. **Zero-downtime schema changes** — renaming columns, changing column types, adding NOT NULL columns
4. **Migration file naming and organization** — timestamp-based naming, migration ordering
5. **Safe migration patterns** — concurrent index creation, dual-write for renames, safe defaults
6. **Cross-database migration strategies** — PostgreSQL, MySQL, SQLite differences
7. **Migration tooling** — choosing and configuring Flyway, Liquibase, Prisma, or raw SQL
8. **Reviewing migration scripts** — checking for table locks, data loss risk, idempotency

## When NOT to Use

| Situation | Better Alternative |
|-----------|-------------------|
| ORM auto-migration (Hibernate `ddl-auto`, Prisma `migrate`, Django `migrate`) | Use the ORM's built-in migration system; these tools generate migrations automatically |
| One-off local development schema changes | Direct SQL in a local console is fine; reserve migration files for shared/production environments |
| Data-only changes (no schema change) | Use a data-seed or ETL script instead; migrations are for schema evolution |
| Database provisioning (creating the database itself) | Use infrastructure-as-code (Terraform, Pulumi) or a setup script; migrations assume the DB exists |
| Real-time schema sync across clusters | Use logical replication, Debezium, or a CDC tool; migrations are sequential and manual |

## Procedure

### 1. Migration File Naming

Use a timestamp prefix to guarantee ordering across developers and environments:

```
{timestamp}_{description}.sql
# Examples:
# 20260613120000_create_users_table.sql
# 20260613120100_add_email_index.sql
# 20260613120200_rename_user_name_to_full_name.sql
```

### 2. Forward Migration

#### PostgreSQL

```sql
-- Create table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index (concurrent — no lock)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Add nullable column (safe — no downtime)
ALTER TABLE orders ADD COLUMN status VARCHAR(50);
```

#### MySQL 8.0+

```sql
-- Create table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add index (MySQL 8.0 supports INSTANT ADD COLUMN)
CREATE INDEX idx_users_email ON users(email);

-- Add nullable column (MySQL 8.0.12+ is INSTANT — no table rebuild)
ALTER TABLE orders ADD COLUMN status VARCHAR(50);

-- Add NOT NULL column with default (MySQL 8.0.12+ is INSTANT with default)
ALTER TABLE orders ADD COLUMN priority INT NOT NULL DEFAULT 0;
```

#### SQLite

```sql
-- SQLite has limited ALTER TABLE — use the rename-recreate pattern
-- SQLite 3.35.0+ supports ALTER TABLE ... RENAME COLUMN

-- Create table (SQLite does not support CONCURRENTLY or many DDL options)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Add column (SQLite supports this directly)
ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';

-- Renaming a column requires: rename table, create new table, copy data, drop old
-- See references/cross-database.md for the full rename pattern
```

### 3. Rollback Migration

Always write the down migration alongside the up migration:

```sql
-- Drop column
ALTER TABLE orders DROP COLUMN IF EXISTS status;

-- Drop index
DROP INDEX IF EXISTS idx_users_email;

-- Drop table
DROP TABLE IF EXISTS users;
```

### 4. Safe Migration Patterns

#### Adding a nullable column (safe — no downtime)

```sql
-- All databases: instant, no lock
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

#### Adding a column with a default value

| Database | Behavior | Recommendation |
|----------|----------|----------------|
| PostgreSQL | Table lock (VACUUM), blocks writes | Use in maintenance window or set default on constraint only |
| MySQL 8.0.12+ | INSTANT — no rebuild | Safe to run online |
| SQLite | Table rebuild | Schedule during low-traffic period |

```sql
-- PostgreSQL: add column without blocking (set default later)
ALTER TABLE users ADD COLUMN role VARCHAR(50);
-- Then in a follow-up migration:
UPDATE users SET role = 'user' WHERE role IS NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
```

#### Creating an index without locking (PostgreSQL)

```sql
-- PostgreSQL: CONCURRENTLY — does not block writes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- MySQL: Online DDL (MySQL 5.6+)
ALTER TABLE users ADD INDEX idx_users_email (email), ALGORITHM=INPLACE, LOCK=NONE;

-- SQLite: CREATE INDEX rebuilds the table — schedule carefully
CREATE INDEX idx_users_email ON users(email);
```

#### Renaming a column (zero-downtime, two-step)

```sql
-- Step 1: Add new column, start dual-writing from application code
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Backfill existing data, verify application writes to both columns
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Step 3: In a future migration, drop the old column once dual-write is confirmed
ALTER TABLE users DROP COLUMN name;
```

## Pitfalls

- ❌ Never drop columns in production without first confirming no code path reads them
- ⚠️ `ALTER TABLE ... ADD COLUMN ... DEFAULT ...` can lock large tables in PostgreSQL
- ⚠️ Creating indexes on large tables without `CONCURRENTLY` (PostgreSQL) or `ALGORITHM=INPLACE` (MySQL) blocks writes
- ❌ Don't change column types (e.g., `VARCHAR` → `TEXT`) without a data migration strategy
- ⚠️ SQLite's limited DDL means renames and drops require table recreation — plan accordingly
- ❌ Don't assume idempotency — test running a migration twice (use `IF EXISTS` / `IF NOT EXISTS`)
- ⚠️ Always test rollback before deploying forward migration — a broken rollback blocks rollbacks

## Verification

- [ ] Migration runs successfully on a staging environment with production-sized data
- [ ] Rollback works without data loss
- [ ] No table locks or long-running queries on production-sized data
- [ ] Migration is idempotent (running twice doesn't fail)
- [ ] Schema changes are backward-compatible with running code (can deploy migration before code change)
- [ ] Rollback migration is tested and works in the opposite direction

## References

- **Cross-database patterns** — See `references/cross-database.md` for detailed migration strategies covering PostgreSQL, MySQL, and SQLite, including rename/recreate patterns, index creation, and column type changes.
