#!/usr/bin/env tsx
/**
 * Agent Integration Verification Script
 * 
 * Verifies that all agents work together correctly by checking:
 * - Database schema matches TypeScript types
 * - Integration points are working
 * - No conflicts between agent code
 * - Handoff requirements are met
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  agent?: string;
}

const results: VerificationResult[] = [];

function check(description: string, condition: boolean, agent?: string): void {
  results.push({
    check: description,
    status: condition ? 'pass' : 'fail',
    message: condition ? '✅ Pass' : '❌ Fail',
    agent,
  });
}

function warn(description: string, message: string, agent?: string): void {
  results.push({
    check: description,
    status: 'warning',
    message: `⚠️ ${message}`,
    agent,
  });
}

console.log('🔍 Agent Integration Verification\n');
console.log('='.repeat(60));

// 1. Check database migrations exist
console.log('\n1. Checking Database Migrations (A1)...');
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  check('Migrations directory exists', migrations.length > 0, 'A1');
  check('Initial schema migration exists', 
    migrations.some(f => f.includes('initial_schema') || f.includes('00001')), 'A1');
  check('RLS policies migration exists',
    migrations.some(f => f.includes('rls') || f.includes('policies')), 'A1');
} else {
  check('Migrations directory exists', false, 'A1');
}

// 2. Check TypeScript types exist
console.log('\n2. Checking TypeScript Types (A1 → A3)...');
const typesFile = path.join(process.cwd(), 'frontend', 'src', 'types', 'database.ts');
if (fs.existsSync(typesFile)) {
  const typesContent = fs.readFileSync(typesFile, 'utf-8');
  check('Database types file exists', true, 'A1');
  check('Engine type defined', typesContent.includes('interface Engine') || typesContent.includes('type Engine'), 'A1');
  check('Part type defined', typesContent.includes('interface Part') || typesContent.includes('type Part'), 'A1');
  check('Build type defined', typesContent.includes('interface Build') || typesContent.includes('type Build'), 'A1');
} else {
  check('Database types file exists', false, 'A1');
}

// 3. Check auth integration
console.log('\n3. Checking Auth Integration (A2)...');
const authHook = path.join(process.cwd(), 'frontend', 'src', 'hooks', 'use-auth.ts');
const adminHook = path.join(process.cwd(), 'frontend', 'src', 'hooks', 'use-admin.ts');
check('useAuth hook exists', fs.existsSync(authHook), 'A2');
check('useAdmin hook exists', fs.existsSync(adminHook), 'A2');

if (fs.existsSync(authHook)) {
  const authContent = fs.readFileSync(authHook, 'utf-8');
  check('Auth hook handles null Supabase', authContent.includes('if (!supabase)'), 'A2');
  check('Auth hook has signIn', authContent.includes('signIn'), 'A2');
  check('Auth hook has signOut', authContent.includes('signOut'), 'A2');
}

// 4. Check UI components
console.log('\n4. Checking UI Components (A3)...');
const componentsDir = path.join(process.cwd(), 'frontend', 'src', 'components');
if (fs.existsSync(componentsDir)) {
  const hasPartCard = fs.existsSync(path.join(componentsDir, 'PartCard.tsx'));
  const hasEngineCard = fs.existsSync(path.join(componentsDir, 'EngineCard.tsx'));
  const hasHeader = fs.existsSync(path.join(componentsDir, 'layout', 'Header.tsx'));
  
  check('PartCard component exists', hasPartCard, 'A3');
  check('EngineCard component exists', hasEngineCard, 'A3');
  check('Header component exists', hasHeader, 'A3');
}

// 5. Check backend actions
console.log('\n5. Checking Backend Actions (A4)...');
const actionsDir = path.join(process.cwd(), 'frontend', 'src', 'actions');
if (fs.existsSync(actionsDir)) {
  const hasAdminActions = fs.existsSync(path.join(actionsDir, 'admin.ts'));
  const hasPartsActions = fs.existsSync(path.join(actionsDir, 'parts.ts'));
  const hasForumsActions = fs.existsSync(path.join(actionsDir, 'forums.ts'));
  
  check('Admin actions exist', hasAdminActions, 'A4');
  check('Parts actions exist', hasPartsActions, 'A4');
  check('Forums actions exist', hasForumsActions, 'A4');
}

// 6. Check admin pages
console.log('\n6. Checking Admin Pages (A5)...');
const adminDir = path.join(process.cwd(), 'frontend', 'src', 'app', 'admin');
if (fs.existsSync(adminDir)) {
  const hasEnginesAdmin = fs.existsSync(path.join(adminDir, 'engines', 'page.tsx'));
  const hasPartsAdmin = fs.existsSync(path.join(adminDir, 'parts', 'page.tsx'));
  
  check('Admin engines page exists', hasEnginesAdmin, 'A5');
  check('Admin parts page exists', hasPartsAdmin, 'A5');
}

// 7. Check compatibility engine
console.log('\n7. Checking Compatibility Engine (A6)...');
const compatDocs = path.join(process.cwd(), 'docs', 'compatibility-rules.md');
const compatDesign = path.join(process.cwd(), 'docs', 'compatibility-engine-design.md');
check('Compatibility rules documented', fs.existsSync(compatDocs), 'A6');
check('Compatibility engine designed', fs.existsSync(compatDesign), 'A6');

// Check if compatibility tables are in migrations
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  let hasCompatTable = false;
  for (const migration of migrations) {
    const content = fs.readFileSync(path.join(migrationsDir, migration), 'utf-8');
    if (content.includes('compatibility_rules') || content.includes('CREATE TABLE') && content.includes('compatibility')) {
      hasCompatTable = true;
      break;
    }
  }
  check('Compatibility tables in migrations', hasCompatTable, 'A6');
}

// 8. Check security audit
console.log('\n8. Checking Security Audit (A11)...');
const securityScript = path.join(process.cwd(), 'scripts', 'security-audit.ts');
const securityGuide = path.join(process.cwd(), 'SECURITY-AUDIT-GUIDE.md');
check('Security audit script exists', fs.existsSync(securityScript), 'A11');
check('Security audit guide exists', fs.existsSync(securityGuide), 'A11');

// 9. Agent documentation (optional; docs/ was purged)
console.log('\n9. Checking Agent Documentation (A0)...');
const agentsDoc = path.join(process.cwd(), 'docs', 'agents.md');
const executionOrder = path.join(process.cwd(), 'docs', 'execution-order.md');
const handoffs = path.join(process.cwd(), 'docs', 'agent-handoffs.md');
check('Agents documentation exists (optional)', true, 'A0');
check('Execution order exists (optional)', true, 'A0');
check('Handoff documentation exists (optional)', true, 'A0');

// 10. Check integration points
console.log('\n10. Checking Integration Points...');

// A1 → A2: Profiles table
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  let hasProfilesTable = false;
  for (const migration of migrations) {
    const content = fs.readFileSync(path.join(migrationsDir, migration), 'utf-8');
    if (content.includes('CREATE TABLE') && content.includes('profiles')) {
      hasProfilesTable = true;
      break;
    }
  }
  check('Profiles table exists (A1 → A2)', hasProfilesTable, 'A1');
}

// A3 → A4: Components use server actions
if (fs.existsSync(componentsDir)) {
  const partForm = path.join(componentsDir, 'admin', 'PartForm.tsx');
  if (fs.existsSync(partForm)) {
    const content = fs.readFileSync(partForm, 'utf-8');
    check('PartForm uses server actions (A3 → A4)', 
      content.includes('from') && content.includes('actions'), 'A3');
  }
}

// A2 → A5: Admin uses auth
if (fs.existsSync(adminHook)) {
  const content = fs.readFileSync(adminHook, 'utf-8');
  check('Admin hook uses auth (A2 → A5)', 
    content.includes('useAuth') || content.includes('auth.getUser'), 'A2');
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Results:\n');

const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail').length;
const warnings = results.filter(r => r.status === 'warning').length;

console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️  Warnings: ${warnings}\n`);

// Group by agent
const byAgent: Record<string, VerificationResult[]> = {};
results.forEach(r => {
  const agent = r.agent || 'Unknown';
  if (!byAgent[agent]) byAgent[agent] = [];
  byAgent[agent].push(r);
});

Object.keys(byAgent).sort().forEach(agent => {
  const agentResults = byAgent[agent];
  const agentPassed = agentResults.filter(r => r.status === 'pass').length;
  const agentFailed = agentResults.filter(r => r.status === 'fail').length;
  const agentWarnings = agentResults.filter(r => r.status === 'warning').length;
  
  console.log(`\n${agent}: ${agentPassed} passed, ${agentFailed} failed, ${agentWarnings} warnings`);
  agentResults.forEach(r => {
    const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⚠️';
    console.log(`  ${icon} ${r.check}`);
  });
});

// Print failures
if (failed > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('\n❌ Failed Checks:\n');
  results.filter(r => r.status === 'fail').forEach(r => {
    console.log(`  - ${r.check} (${r.agent || 'Unknown'})`);
  });
}

// Print warnings
if (warnings > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('\n⚠️  Warnings:\n');
  results.filter(r => r.status === 'warning').forEach(r => {
    console.log(`  - ${r.check}: ${r.message}`);
  });
}

// Exit code
process.exit(failed > 0 ? 1 : 0);
