import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    name: { type: 'string', short: 'n' },
    description: { type: 'string', short: 'd' },
    model: { type: 'string', short: 'm' },
    category: { type: 'string', short: 'c' }
  }
});

if (!values.name || !values.description) {
  console.log('Usage: npm run create:agent -- --name <agent-name> --description <description> [--model <model>] [--category <category>]');
  console.log('');
  console.log('Options:');
  console.log('  -n, --name        Human-readable agent name');
  console.log('  -d, --description What this agent does');
  console.log('  -m, --model       Recommended model (qwen-max, qwen-plus, qwen-turbo, qwen-coder)');
  console.log('  -c, --category    Category (development, debugging, testing, devops, security, documentation, data, frontend, backend, mobile)');
  process.exit(1);
}

const name = values.name;
const description = values.description;
const model = values.model || 'qwen-plus';
const category = values.category || 'general';

const fileName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.agent.md';
const filePath = join(process.cwd(), 'agents', fileName);

if (existsSync(filePath)) {
  console.error(`❌ Agent "${name}" already exists at ${filePath}`);
  process.exit(1);
}

const content = `---
name: ${name}
description: ${description}
model: ${model}
category: ${category}
tools: []
---

# ${name}

## Role
Describe the agent's role and expertise focus.

## Behavior
- How should this agent approach problems?
- What communication style should it use?

## Tools
List the tools this agent has access to and how it should use them.

## Examples
Show example interactions or workflows this agent should handle.
`;

writeFileSync(filePath, content);
console.log(`✅ Agent created: agents/${fileName}`);
