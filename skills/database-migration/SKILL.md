---
name: database-migration
description: Create and manage database migrations with rollback support for SQL databases
version: 1.0.0
category: backend
tags: ["database", "migration", "sql", "schema"]
---

# Database Migration

## When to Use
- Adding/modifying database tables or columns
- Creating indexes, constraints, or foreign keys
- Managing schema changes across environments
- Need rollback capability for failed migrations

## Procedure

### 1. Migration File Naming
```
{timestamp}_{description}.sql
# Examples:
# 20260407120000_create_users_table.sql
# 20260407120100_add_email_index.sql
```

### 2. Forward Migration
```sql
-- Create table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_users_email ON users(email);

-- Add column to existing table
ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
```

### 3. Rollback Migration
```sql
-- Drop column
ALTER TABLE orders DROP COLUMN IF EXISTS status;

-- Drop index
DROP INDEX IF EXISTS idx_users_email;

-- Drop table
DROP TABLE IF EXISTS users;
```

### 4. Safe Migration Patterns
```sql
-- Adding a nullable column (safe - no downtime)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Adding a column with default (can lock table - use in maintenance window)
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';

-- Creating index concurrently (PostgreSQL - no lock)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Renaming column (two-step process for zero downtime)
-- Step 1: Add new column, dual-write
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
-- Step 2: Backfill, then rename in next migration
```

## Pitfalls
- ❌ Never drop columns in production without data migration first
- ⚠️ `ALTER TABLE` with default value can lock large tables
- ⚠️ Creating indexes on large tables without `CONCURRENTLY` blocks writes
- ❌ Don't change column types without a data migration strategy
- ⚠️ Test rollback before deploying forward migration

## Verification
- [ ] Migration runs successfully on staging
- [ ] Rollback works without data loss
- [ ] No table locks or long-running queries on production-sized data
- [ ] Migration is idempotent (running twice doesn't fail)
- [ ] Schema changes are backward-compatible with running code

## References
- PostgreSQL: https://www.postgresql.org/docs/current/sql-altertable.html
- Zero-downtime migrations: https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql
