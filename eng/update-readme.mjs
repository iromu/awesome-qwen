import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import yaml from 'js-yaml';
import { globSync } from 'glob';

const parseYaml = yaml.load;

const rootDir = join(process.cwd());

// Extract frontmatter from markdown content
function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  try {
    return parseYaml(match[1]);
  } catch {
    return null;
  }
}

// Read all agents
function readAgents() {
  const agentsDir = join(rootDir, 'agents');
  if (!existsSync(agentsDir)) return [];
  
  const files = globSync('*.agent.md', { cwd: agentsDir });
  return files.map(file => {
    const content = readFileSync(join(agentsDir, file), 'utf-8');
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) return null;
    
    return {
      name: frontmatter.name || file.replace('.agent.md', ''),
      description: frontmatter.description || '',
      category: frontmatter.category || 'general',
      model: frontmatter.model || '',
      tags: frontmatter.tags || [],
      file: `agents/${file}`
    };
  }).filter(Boolean);
}

// Read all instructions
function readInstructions() {
  const instructionsDir = join(rootDir, 'instructions');
  if (!existsSync(instructionsDir)) return [];
  
  const files = globSync('*.instructions.md', { cwd: instructionsDir });
  return files.map(file => {
    const content = readFileSync(join(instructionsDir, file), 'utf-8');
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) return null;
    
    return {
      description: frontmatter.description || '',
      applyTo: frontmatter.applyTo || '**',
      tags: frontmatter.tags || [],
      file: `instructions/${file}`
    };
  }).filter(Boolean);
}

// Read all skills
function readSkills() {
  const skillsDir = join(rootDir, 'skills');
  if (!existsSync(skillsDir)) return [];
  
  const entries = readdirSync(skillsDir, { withFileTypes: true });
  return entries
    .filter(dirent => dirent.isDirectory())
    .map(dir => {
      const skillFile = join(skillsDir, dir.name, 'SKILL.md');
      if (!existsSync(skillFile)) return null;
      
      const content = readFileSync(skillFile, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      if (!frontmatter) return null;
      
      return {
        name: frontmatter.name || dir.name,
        description: frontmatter.description || '',
        version: frontmatter.version || '1.0.0',
        category: frontmatter.category || 'general',
        tags: frontmatter.tags || [],
        file: `skills/${dir.name}`
      };
    }).filter(Boolean);
}

// Read all hooks
function readHooks() {
  const hooksDir = join(rootDir, 'hooks');
  if (!existsSync(hooksDir)) return [];
  
  const entries = readdirSync(hooksDir, { withFileTypes: true });
  return entries
    .filter(dirent => dirent.isDirectory())
    .map(dir => {
      const readmeFile = join(hooksDir, dir.name, 'README.md');
      if (!existsSync(readmeFile)) return null;
      
      const content = readFileSync(readmeFile, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      if (!frontmatter) return null;
      
      return {
        name: frontmatter.name || dir.name,
        description: frontmatter.description || '',
        event: frontmatter.event || '',
        tags: frontmatter.tags || [],
        file: `hooks/${dir.name}`
      };
    }).filter(Boolean);
}

// Read all workflows
function readWorkflows() {
  const workflowsDir = join(rootDir, 'workflows');
  if (!existsSync(workflowsDir)) return [];
  
  const files = globSync('*.md', { cwd: workflowsDir });
  return files.map(file => {
    const content = readFileSync(join(workflowsDir, file), 'utf-8');
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) return null;
    
    return {
      name: frontmatter.name || file.replace('.md', ''),
      description: frontmatter.description || '',
      category: frontmatter.category || 'general',
      tags: frontmatter.tags || [],
      file: `workflows/${file}`
    };
  }).filter(Boolean);
}

// Generate markdown table for agents
function generateAgentsTable(agents) {
  if (agents.length === 0) return '_No agents yet. [Contribute one](CONTRIBUTING.md)_';
  
  const rows = agents.map(a => {
    const modelBadge = a.model ? ` <code>${a.model}</code>` : '';
    return `| [${a.name}](${a.file}) | ${a.description} |${modelBadge} |`;
  }).join('\n');
  
  return `| Agent | Description | Model |\n|-------|-------------|--------|\n${rows}`;
}

// Generate markdown table for instructions
function generateInstructionsTable(instructions) {
  if (instructions.length === 0) return '_No instructions yet. [Contribute one](CONTRIBUTING.md)_';
  
  const rows = instructions.map(i => {
    return `| [${i.file.split('/').pop()}](${i.file}) | ${i.description} | \`${i.applyTo}\` |`;
  }).join('\n');
  
  return `| Instruction | Description | Applies To |\n|-------------|-------------|------------|\n${rows}`;
}

// Generate markdown table for skills
function generateSkillsTable(skills) {
  if (skills.length === 0) return '_No skills yet. [Contribute one](CONTRIBUTING.md)_';
  
  const rows = skills.map(s => {
    const tags = s.tags.slice(0, 3).map(t => `![${t}](https://img.shields.io/badge/${encodeURIComponent(t)}-blue)`).join(' ');
    return `| [${s.name}](${s.file}) | ${s.description} | \`${s.version}\` | ${tags} |`;
  }).join('\n');
  
  return `| Skill | Description | Version | Tags |\n|-------|-------------|---------|------|\n${rows}`;
}

// Generate markdown table for hooks
function generateHooksTable(hooks) {
  if (hooks.length === 0) return '_No hooks yet. [Contribute one](CONTRIBUTING.md)_';
  
  const rows = hooks.map(h => {
    return `| [${h.name}](${h.file}) | ${h.description} | \`${h.event}\` |`;
  }).join('\n');
  
  return `| Hook | Description | Trigger |\n|------|-------------|---------|\n${rows}`;
}

// Generate markdown table for workflows
function generateWorkflowsTable(workflows) {
  if (workflows.length === 0) return '_No workflows yet. [Contribute one](CONTRIBUTING.md)_';
  
  const rows = workflows.map(w => {
    return `| [${w.name}](${w.file}) | ${w.description} |`;
  }).join('\n');
  
  return `| Workflow | Description |\n|----------|-------------|\n${rows}`;
}

// Main: generate README
function main() {
  console.log('🔨 Generating README...');
  
  const agents = readAgents();
  const instructions = readInstructions();
  const skills = readSkills();
  const hooks = readHooks();
  const workflows = readWorkflows();
  
  const agentsTable = generateAgentsTable(agents);
  const instructionsTable = generateInstructionsTable(instructions);
  const skillsTable = generateSkillsTable(skills);
  const hooksTable = generateHooksTable(hooks);
  const workflowsTable = generateWorkflowsTable(workflows);
  
  const readme = `# Awesome Qwen

> A curated collection of extensions, skills, agents, and workflows for [Qwen Code](https://github.com/QwenLM/Qwen).

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Contents

- [Agents](#agents)
- [Instructions](#instructions)
- [Skills](#skills)
- [Hooks](#hooks)
- [Workflows](#workflows)
- [Cookbook](#cookbook)

## Agents

Specialized AI personas with specific tool access and expertise.

${agentsTable}

## Instructions

Automated coding standards and guidelines applied by file pattern.

${instructionsTable}

## Skills

Self-contained capabilities for specific tasks, bundling instructions and assets.

${skillsTable}

## Hooks

Automated actions triggered during Qwen Code sessions.

${hooksTable}

## Workflows

AI-powered automation sequences for repetitive development tasks.

${workflowsTable}

## Cookbook

Copy-paste-ready recipes and examples for working with Qwen Code APIs.

- [JavaScript/TypeScript](cookbook/javascript/)
- [Python](cookbook/python/)
- [Java](cookbook/java/)
- [Go](cookbook/go/)
- [Rust](cookbook/rust/)

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## License

[MIT](LICENSE) © [iromu](https://github.com/iromu)
`;
  
  writeFileSync(join(rootDir, 'README.md'), readme);
  console.log('✅ README generated successfully');
  console.log(`   - ${agents.length} agents`);
  console.log(`   - ${instructions.length} instructions`);
  console.log(`   - ${skills.length} skills`);
  console.log(`   - ${hooks.length} hooks`);
  console.log(`   - ${workflows.length} workflows`);
}

main();
