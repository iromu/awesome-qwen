# JavaScript/TypeScript Cookbook

Quick reference recipes for common Qwen Code tasks in JavaScript and TypeScript projects.

## Table of Contents
- [Scaffold a New Project](#scaffold-a-new-project)
- [Add TypeScript to Existing JS Project](#add-typescript-to-existing-js-project)
- [Set Up ESLint + Prettier](#set-up-eslint--prettier)
- [Create a Reusable NPM Script](#create-a-reusable-npm-script)
- [Debug a Failing Test](#debug-a-failing-test)

---

## Scaffold a New Project

**Prompt**: "Scaffold a new TypeScript library project"

```bash
# What Qwen will do:
npm init -y
npm install -D typescript @types/node
npx tsc --init

# package.json additions:
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest"
  }
}
```

## Add TypeScript to Existing JS Project

**Prompt**: "Add TypeScript to this JavaScript project"

```bash
# Step 1: Install TypeScript
npm install -D typescript @types/node

# Step 2: Create tsconfig.json
npx tsc --init --sourceMap true --outDir dist --rootDir src

# Step 3: Rename files
# .js → .ts, .jsx → .tsx

# Step 4: Add build script
npm pkg set scripts.build="tsc"
```

## Set Up ESLint + Prettier

**Prompt**: "Set up ESLint and Prettier for this project"

```bash
npm install -D eslint prettier eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}

# .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80
}
```

## Create a Reusable NPM Script

**Prompt**: "Create an npm script that does X"

```json
{
  "scripts": {
    "clean": "rm -rf dist && mkdir dist",
    "build": "npm run clean && tsc",
    "lint": "eslint 'src/**/*.{ts,tsx}' --fix",
    "format": "prettier --write 'src/**/*.{ts,tsx,json}'",
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

## Debug a Failing Test

**Prompt**: "Debug why this test is failing"

```bash
# Run test with verbose output
npm test -- --reporter=verbose

# Run single test file
npx vitest run tests/auth.test.ts

# Run with debugger
node --inspect-brk node_modules/.bin/vitest run tests/auth.test.ts

# Check for common issues:
# 1. Import paths correct?
# 2. Mock setup accurate?
# 3. Async/await missing?
# 4. Wrong assertion library?
```
