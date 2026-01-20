#!/usr/bin/env tsx
/**
 * Security Audit Script
 * 
 * Runs comprehensive security checks on the codebase
 * 
 * Usage:
 *   npx tsx scripts/security-audit.ts
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  location: string;
  description: string;
  recommendation: string;
}

const findings: SecurityFinding[] = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(severity: SecurityFinding['severity'], message: string) {
  const color = severity === 'critical' ? colors.red : 
                severity === 'high' ? colors.red :
                severity === 'medium' ? colors.yellow : colors.blue;
  console.log(`${color}[${severity.toUpperCase()}]${colors.reset} ${message}`);
}

function checkDependencies() {
  console.log('\n📦 Checking Dependencies...\n');
  
  try {
    const packageJsonPath = join(process.cwd(), 'frontend', 'package.json');
    if (!existsSync(packageJsonPath)) {
      log('medium', 'package.json not found');
      return;
    }

    // Check for npm audit
    try {
      const auditOutput = execSync('cd frontend && npm audit --json', { encoding: 'utf-8' });
      const audit = JSON.parse(auditOutput);
      
      if (audit.vulnerabilities) {
        const critical = audit.vulnerabilities.critical || 0;
        const high = audit.vulnerabilities.high || 0;
        const moderate = audit.vulnerabilities.moderate || 0;
        
        if (critical > 0 || high > 0) {
          findings.push({
            severity: critical > 0 ? 'critical' : 'high',
            type: 'Dependency Vulnerability',
            location: 'package.json',
            description: `${critical} critical, ${high} high, ${moderate} moderate vulnerabilities found`,
            recommendation: 'Run `npm audit fix` to fix vulnerabilities',
          });
          log(critical > 0 ? 'critical' : 'high', 
            `Found ${critical} critical, ${high} high, ${moderate} moderate vulnerabilities`);
        } else {
          console.log(`${colors.green}✓${colors.reset} No critical or high vulnerabilities found`);
        }
      }
    } catch (error) {
      log('medium', 'Could not run npm audit');
    }
  } catch (error) {
    log('medium', 'Error checking dependencies');
  }
}

function checkForSecrets(filePath: string, content: string) {
  const secretPatterns = [
    { pattern: /(api[_-]?key|apikey)\s*[=:]\s*['"]([^'"]+)['"]/gi, name: 'API Key' },
    { pattern: /(secret|password|pwd|passwd)\s*[=:]\s*['"]([^'"]+)['"]/gi, name: 'Secret' },
    { pattern: /(token|access[_-]?token)\s*[=:]\s*['"]([^'"]+)['"]/gi, name: 'Token' },
    { pattern: /(private[_-]?key|privatekey)\s*[=:]\s*['"]([^'"]+)['"]/gi, name: 'Private Key' },
    { pattern: /(supabase[_-]?service[_-]?role[_-]?key)\s*[=:]\s*['"]([^'"]+)['"]/gi, name: 'Service Role Key' },
  ];

  secretPatterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      // Check if it's in an environment variable or comment
      const lines = content.split('\n');
      matches.forEach(match => {
        const lineIndex = content.substring(0, content.indexOf(match)).split('\n').length - 1;
        const line = lines[lineIndex];
        
        // Skip if it's in a comment or environment variable reference
        if (!line.includes('process.env') && 
            !line.trim().startsWith('//') && 
            !line.trim().startsWith('*') &&
            !line.trim().startsWith('#')) {
          findings.push({
            severity: 'critical',
            type: 'Exposed Secret',
            location: `${filePath}:${lineIndex + 1}`,
            description: `Potential ${name} found: ${match.substring(0, 50)}...`,
            recommendation: 'Move to environment variables or remove from code',
          });
          log('critical', `Found potential ${name} in ${filePath}:${lineIndex + 1}`);
        }
      });
    }
  });
}

function checkForSQLInjection(filePath: string, content: string) {
  // Check for raw SQL with string interpolation
  const sqlPatterns = [
    /`SELECT.*\$\{.*\}.*FROM/i,
    /`INSERT.*\$\{.*\}.*INTO/i,
    /`UPDATE.*\$\{.*\}.*SET/i,
    /`DELETE.*\$\{.*\}.*FROM/i,
    /query\(`.*\$\{.*\}.*`\)/i,
    /execute\(`.*\$\{.*\}.*`\)/i,
  ];

  sqlPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      findings.push({
        severity: 'critical',
        type: 'SQL Injection Risk',
        location: filePath,
        description: 'Raw SQL with string interpolation detected',
        recommendation: 'Use parameterized queries or Supabase query builder',
      });
      log('critical', `Potential SQL injection risk in ${filePath}`);
    }
  });
}

function checkForXSS(filePath: string, content: string) {
  // Check for dangerouslySetInnerHTML without sanitization
  if (content.includes('dangerouslySetInnerHTML')) {
    if (!content.includes('DOMPurify') && !content.includes('sanitize')) {
      findings.push({
        severity: 'high',
        type: 'XSS Risk',
        location: filePath,
        description: 'dangerouslySetInnerHTML used without sanitization',
        recommendation: 'Use DOMPurify or React\'s built-in escaping',
      });
      log('high', `XSS risk in ${filePath}: dangerouslySetInnerHTML without sanitization`);
    }
  }
}

function checkForMissingValidation(filePath: string, content: string) {
  // Check server actions for missing validation
  if (filePath.includes('/actions/') && content.includes('use server')) {
    // Check if Zod is imported
    if (!content.includes('zod') && !content.includes('Zod') && 
        (content.includes('formData') || content.includes('input'))) {
      findings.push({
        severity: 'high',
        type: 'Missing Input Validation',
        location: filePath,
        description: 'Server action may be missing input validation',
        recommendation: 'Add Zod validation schemas for all inputs',
      });
      log('high', `Missing validation in ${filePath}`);
    }
  }
}

function scanFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Skip node_modules and .next
    if (filePath.includes('node_modules') || filePath.includes('.next')) {
      return;
    }

    checkForSecrets(filePath, content);
    checkForSQLInjection(filePath, content);
    checkForXSS(filePath, content);
    checkForMissingValidation(filePath, content);
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir: string, extensions: string[] = ['.ts', '.tsx', '.js', '.jsx']) {
  try {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
          scanDirectory(filePath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = extname(file);
        if (extensions.includes(ext)) {
          scanFile(filePath);
        }
      }
    });
  } catch (error) {
    // Skip directories that can't be read
  }
}

function checkRLSPolicies() {
  console.log('\n🔒 Checking RLS Policies...\n');
  
  // This would require database connection
  // For now, just check migration files
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  if (existsSync(migrationsDir)) {
    const migrations = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .map(f => readFileSync(join(migrationsDir, f), 'utf-8'));
    
    const allMigrations = migrations.join('\n');
    
    // Check for RLS enable statements
    const rlsEnabled = (allMigrations.match(/ENABLE ROW LEVEL SECURITY/gi) || []).length;
    const createTable = (allMigrations.match(/CREATE TABLE/gi) || []).length;
    
    if (rlsEnabled < createTable) {
      findings.push({
        severity: 'high',
        type: 'Missing RLS',
        location: 'Database migrations',
        description: `Found ${createTable} tables but only ${rlsEnabled} with RLS enabled`,
        recommendation: 'Enable RLS on all tables with user data',
      });
      log('high', `Potential missing RLS policies: ${createTable} tables, ${rlsEnabled} with RLS`);
    } else {
      console.log(`${colors.green}✓${colors.reset} RLS appears to be enabled on tables`);
    }
  }
}

function checkEnvironmentVariables() {
  console.log('\n🔐 Checking Environment Variables...\n');
  
  const envExample = join(process.cwd(), 'frontend', '.env.example');
  const envLocal = join(process.cwd(), 'frontend', '.env.local');
  
  if (!existsSync(envExample)) {
    log('medium', '.env.example file not found - consider creating one');
  }
  
  if (existsSync(envLocal)) {
    const content = readFileSync(envLocal, 'utf-8');
    
    // Check for actual values (not just placeholders)
    if (content.includes('your-') || content.includes('example.com')) {
      log('low', '.env.local may contain placeholder values');
    }
    
    // Check if service role key is exposed
    if (content.includes('SUPABASE_SERVICE_ROLE_KEY') && 
        !content.includes('your-service-role-key')) {
      console.log(`${colors.green}✓${colors.reset} Service role key is configured`);
    }
  } else {
    log('medium', '.env.local not found - make sure environment variables are set');
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Security Audit Report');
  console.log('='.repeat(60) + '\n');
  
  const critical = findings.filter(f => f.severity === 'critical').length;
  const high = findings.filter(f => f.severity === 'high').length;
  const medium = findings.filter(f => f.severity === 'medium').length;
  const low = findings.filter(f => f.severity === 'low').length;
  
  console.log(`Total Findings: ${findings.length}`);
  console.log(`${colors.red}Critical: ${critical}${colors.reset}`);
  console.log(`${colors.red}High: ${high}${colors.reset}`);
  console.log(`${colors.yellow}Medium: ${medium}${colors.reset}`);
  console.log(`${colors.blue}Low: ${low}${colors.reset}\n`);
  
  if (findings.length > 0) {
    console.log('Detailed Findings:\n');
    findings.forEach((finding, index) => {
      const color = finding.severity === 'critical' ? colors.red :
                    finding.severity === 'high' ? colors.red :
                    finding.severity === 'medium' ? colors.yellow : colors.blue;
      
      console.log(`${index + 1}. [${color}${finding.severity.toUpperCase()}${colors.reset}] ${finding.type}`);
      console.log(`   Location: ${finding.location}`);
      console.log(`   Description: ${finding.description}`);
      console.log(`   Recommendation: ${finding.recommendation}\n`);
    });
  } else {
    console.log(`${colors.green}✓${colors.reset} No security issues found!`);
  }
  
  // Security score
  const score = findings.length === 0 ? 5 :
                critical > 0 ? 1 :
                high > 0 ? 2 :
                medium > 0 ? 3 : 4;
  
  console.log('\n' + '='.repeat(60));
  console.log(`Security Score: ${score}/5`);
  console.log('='.repeat(60) + '\n');
  
  if (score < 4) {
    console.log(`${colors.red}⚠️  Security issues found. Please review and fix before production.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✓${colors.reset} Security audit passed!\n`);
  }
}

async function main() {
  console.log(`${colors.cyan}🔒 Starting Security Audit...${colors.reset}\n`);
  
  // Run checks
  checkDependencies();
  checkRLSPolicies();
  checkEnvironmentVariables();
  
  // Scan codebase
  console.log('\n🔍 Scanning Codebase...\n');
  const frontendDir = join(process.cwd(), 'frontend', 'src');
  if (existsSync(frontendDir)) {
    scanDirectory(frontendDir);
  }
  
  // Generate report
  generateReport();
}

main();
