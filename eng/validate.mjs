import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import agentSchema from '../.schemas/agent.schema.json' with { type: 'json' };
import skillSchema from '../.schemas/skill.schema.json' with { type: 'json' };
import instructionSchema from '../.schemas/instruction.schema.json' with { type: 'json' };
import pluginSchema from '../.schemas/plugin.schema.json' with { type: 'json' };
import hookSchema from '../.schemas/hook.schema.json' with { type: 'json' };
import workflowSchema from '../.schemas/workflow.schema.json' with { type: 'json' };

const parseYaml = yaml.load;

const rootDir = process.cwd();
const ajv = new Ajv({ allErrors: true });

let errors = 0;
let warnings = 0;

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  try {
    return parseYaml(match[1]);
  } catch {
    return null;
  }
}

function validate(type, schema, data, file) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    errors++;
    console.error(`❌ ${type} validation failed for ${file}:`);
    validate.errors.forEach(err => {
      console.error(`   ${err.instancePath || '/'} ${err.message}`);
    });
  }
  return valid;
}

function validateAgents() {
  console.log('\n🔍 Validating agents...');
  const agentsDir = join(rootDir, 'agents');
  if (!existsSync(agentsDir)) { console.log('   ⚠️ agents/ directory not found'); return; }
  
  const files = readdirSync(agentsDir).filter(f => f.endsWith('.agent.md'));
  if (files.length === 0) { console.log('   ℹ️ No agents found'); return; }
  
  files.forEach(file => {
    const content = readFileSync(join(agentsDir, file), 'utf-8');
    const fm = extractFrontmatter(content);
    if (!fm) {
      errors++;
      console.error(`❌ ${file}: Missing or invalid frontmatter`);
      return;
    }
    validate('Agent', agentSchema, fm, file);
  });
  console.log(`   ✅ ${files.length} agent(s) checked`);
}

function validateSkills() {
  console.log('\n🔍 Validating skills...');
  const skillsDir = join(rootDir, 'skills');
  if (!existsSync(skillsDir)) { console.log('   ⚠️ skills/ directory not found'); return; }
  
  const dirs = readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  if (dirs.length === 0) { console.log('   ℹ️ No skills found'); return; }
  
  dirs.forEach(dir => {
    const skillFile = join(skillsDir, dir.name, 'SKILL.md');
    if (!existsSync(skillFile)) {
      errors++;
      console.error(`❌ skills/${dir.name}: Missing SKILL.md`);
      return;
    }
    const content = readFileSync(skillFile, 'utf-8');
    const fm = extractFrontmatter(content);
    if (!fm) {
      errors++;
      console.error(`❌ skills/${dir.name}: Missing or invalid frontmatter`);
      return;
    }
    if (fm.name && fm.name !== dir.name) {
      warnings++;
      console.warn(`⚠️ skills/${dir.name}: name "${fm.name}" doesn't match folder name "${dir.name}"`);
    }
    validate('Skill', skillSchema, fm, `skills/${dir.name}`);
  });
  console.log(`   ✅ ${dirs.length} skill(s) checked`);
}

function validateInstructions() {
  console.log('\n🔍 Validating instructions...');
  const instructionsDir = join(rootDir, 'instructions');
  if (!existsSync(instructionsDir)) { console.log('   ⚠️ instructions/ directory not found'); return; }
  
  const files = readdirSync(instructionsDir).filter(f => f.endsWith('.instructions.md'));
  if (files.length === 0) { console.log('   ℹ️ No instructions found'); return; }
  
  files.forEach(file => {
    const content = readFileSync(join(instructionsDir, file), 'utf-8');
    const fm = extractFrontmatter(content);
    if (!fm) {
      errors++;
      console.error(`❌ ${file}: Missing or invalid frontmatter`);
      return;
    }
    validate('Instruction', instructionSchema, fm, file);
  });
  console.log(`   ✅ ${files.length} instruction(s) checked`);
}

function validatePlugins() {
  console.log('\n🔍 Validating plugins...');
  const pluginsDir = join(rootDir, 'plugins');
  if (!existsSync(pluginsDir)) { console.log('   ⚠️ plugins/ directory not found'); return; }
  
  const dirs = readdirSync(pluginsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  if (dirs.length === 0) { console.log('   ℹ️ No plugins found'); return; }
  
  dirs.forEach(dir => {
    const pluginFile = join(pluginsDir, dir.name, 'plugin.json');
    if (!existsSync(pluginFile)) {
      errors++;
      console.error(`❌ plugins/${dir.name}: Missing plugin.json`);
      return;
    }
    const content = readFileSync(pluginFile, 'utf-8');
    let plugin;
    try {
      plugin = JSON.parse(content);
    } catch {
      errors++;
      console.error(`❌ plugins/${dir.name}: Invalid JSON in plugin.json`);
      return;
    }
    validate('Plugin', pluginSchema, plugin, `plugins/${dir.name}`);
  });
  console.log(`   ✅ ${dirs.length} plugin(s) checked`);
}

function validateHooks() {
  console.log('\n🔍 Validating hooks...');
  const hooksDir = join(rootDir, 'hooks');
  if (!existsSync(hooksDir)) { console.log('   ⚠️ hooks/ directory not found'); return; }
  
  const dirs = readdirSync(hooksDir, { withFileTypes: true }).filter(d => d.isDirectory());
  if (dirs.length === 0) { console.log('   ℹ️ No hooks found'); return; }
  
  dirs.forEach(dir => {
    const hooksJsonFile = join(hooksDir, dir.name, 'hooks.json');
    if (!existsSync(hooksJsonFile)) {
      errors++;
      console.error(`❌ hooks/${dir.name}: Missing hooks.json`);
      return;
    }
    const content = readFileSync(hooksJsonFile, 'utf-8');
    let hook;
    try {
      hook = JSON.parse(content);
    } catch {
      errors++;
      console.error(`❌ hooks/${dir.name}: Invalid JSON in hooks.json`);
      return;
    }
    validate('Hook', hookSchema, hook, `hooks/${dir.name}`);
  });
  console.log(`   ✅ ${dirs.length} hook(s) checked`);
}

function validateWorkflows() {
  console.log('\n🔍 Validating workflows...');
  const workflowsDir = join(rootDir, 'workflows');
  if (!existsSync(workflowsDir)) { console.log('   ⚠️ workflows/ directory not found'); return; }
  
  const files = readdirSync(workflowsDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) { console.log('   ℹ️ No workflows found'); return; }
  
  files.forEach(file => {
    const content = readFileSync(join(workflowsDir, file), 'utf-8');
    const fm = extractFrontmatter(content);
    if (!fm) {
      errors++;
      console.error(`❌ ${file}: Missing or invalid frontmatter`);
      return;
    }
    validate('Workflow', workflowSchema, fm, file);
  });
  console.log(`   ✅ ${files.length} workflow(s) checked`);
}

// Main
console.log('🔨 Validating awesome-qwen contents...');

validateAgents();
validateSkills();
validateInstructions();
validatePlugins();
validateHooks();
validateWorkflows();

console.log('\n' + '='.repeat(50));
if (errors > 0) {
  console.error(`❌ Validation failed with ${errors} error(s) and ${warnings} warning(s)`);
  process.exit(1);
} else {
  console.log(`✅ All validations passed (${warnings} warning(s))`);
}
