import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    name: { type: 'string', short: 'n' },
    description: { type: 'string', short: 'd' },
    category: { type: 'string', short: 'c' }
  }
});

if (!values.name || !values.description) {
  console.log('Usage: npm run create:skill -- --name <skill-name> --description <description> [--category <category>]');
  console.log('');
  console.log('Options:');
  console.log('  -n, --name        Skill identifier (lowercase, hyphens allowed)');
  console.log('  -d, --description What this skill does');
  console.log('  -c, --category    Category (development, debugging, testing, devops, security, documentation, data, frontend, backend, mobile, ai-ml)');
  process.exit(1);
}

const name = values.name.toLowerCase().replace(/\s+/g, '-');
const description = values.description;
const category = values.category || 'general';

const skillDir = join(process.cwd(), 'skills', name);
const skillFile = join(skillDir, 'SKILL.md');

if (existsSync(skillFile)) {
  console.error(`❌ Skill "${name}" already exists at ${skillFile}`);
  process.exit(1);
}

mkdirSync(skillDir, { recursive: true });

const content = `---
name: ${name}
description: ${description}
version: 1.0.0
category: ${category}
---

# ${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}

## When to Use
- When the user asks to...
- When working with...

## Procedure
1. Step one
2. Step two
3. Step three

## Pitfalls
- ⚠️ Common issue or edge case
- ❌ What not to do

## Verification
- [ ] Check 1
- [ ] Check 2

## References
- Link to relevant documentation
`;

writeFileSync(skillFile, content);
console.log(`✅ Skill created: skills/${name}/SKILL.md`);
