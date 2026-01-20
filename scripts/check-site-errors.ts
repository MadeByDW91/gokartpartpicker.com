#!/usr/bin/env tsx
/**
 * Site Error Diagnostic Script
 * 
 * Checks for common issues that cause site errors
 * 
 * Usage:
 *   npx tsx scripts/check-site-errors.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
for (const p of [
  join(process.cwd(), '.env.local'),
  join(process.cwd(), 'frontend', '.env.local'),
]) {
  if (existsSync(p)) {
    readFileSync(p, 'utf8')
      .split('\n')
      .forEach((l) => {
        const m = l.match(/^([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
      });
    break;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const checks: CheckResult[] = [];

async function checkSupabaseConnection() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    checks.push({
      name: 'Supabase Credentials',
      status: 'fail',
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY',
    });
    return;
  }

  checks.push({
    name: 'Supabase Credentials',
    status: 'pass',
    message: 'Credentials configured',
  });

  // Check connection pooling
  if (SUPABASE_URL.includes(':6543')) {
    checks.push({
      name: 'Connection Pooling',
      status: 'pass',
      message: 'Using pooled connections (port 6543)',
    });
  } else {
    checks.push({
      name: 'Connection Pooling',
      status: 'warning',
      message: 'Not using connection pooling. Add :6543 to URL for better performance.',
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Test basic connection
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      checks.push({
        name: 'Database Tables',
        status: 'fail',
        message: 'Tables do not exist. Run migrations first.',
      });
    } else if (error) {
      checks.push({
        name: 'Database Connection',
        status: 'fail',
        message: `Connection error: ${error.message}`,
      });
    } else {
      checks.push({
        name: 'Database Connection',
        status: 'pass',
        message: 'Connected successfully',
      });
    }

    // Check if forum tables exist
    const { error: forumError } = await supabase.from('forum_categories').select('count').limit(1);
    if (forumError && forumError.message.includes('does not exist')) {
      checks.push({
        name: 'Forum Tables',
        status: 'warning',
        message: 'Forum tables not found. Run migration 20260116000021_forums_schema.sql',
      });
    } else {
      checks.push({
        name: 'Forum Tables',
        status: 'pass',
        message: 'Forum tables exist',
      });
    }

    // Check if optimization function exists
    const { error: funcError } = await supabase.rpc('get_forum_categories_with_counts');
    if (funcError && (funcError.message.includes('does not exist') || funcError.message.includes('function'))) {
      checks.push({
        name: 'Optimization Function',
        status: 'warning',
        message: 'get_forum_categories_with_counts function not found. Run migration 20260117000002_optimize_forum_category_counts.sql',
      });
    } else if (funcError) {
      checks.push({
        name: 'Optimization Function',
        status: 'warning',
        message: `Function error: ${funcError.message}`,
      });
    } else {
      checks.push({
        name: 'Optimization Function',
        status: 'pass',
        message: 'Function exists and works',
      });
    }

    // Check if rate limit function exists
    const { error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_user_id: null,
      p_ip_address: '127.0.0.1',
      p_action_type: 'test',
      p_max_attempts: 1,
      p_window_seconds: 1,
    });
    if (rateLimitError && rateLimitError.message.includes('does not exist')) {
      checks.push({
        name: 'Rate Limit Function',
        status: 'warning',
        message: 'check_rate_limit function not found. Run migration 20260116000021_forums_schema.sql',
      });
    } else {
      checks.push({
        name: 'Rate Limit Function',
        status: 'pass',
        message: 'Function exists',
      });
    }

  } catch (err) {
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
  }
}

async function main() {
  console.log('🔍 Site Error Diagnostic Check\n');
  console.log('='.repeat(60));

  await checkSupabaseConnection();

  // Print results
  console.log('\n📊 Check Results:\n');
  
  const passed = checks.filter(c => c.status === 'pass').length;
  const warnings = checks.filter(c => c.status === 'warning').length;
  const failed = checks.filter(c => c.status === 'fail').length;

  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
    const color = check.status === 'pass' ? '\x1b[32m' : check.status === 'warning' ? '\x1b[33m' : '\x1b[31m';
    console.log(`${icon} ${color}${check.name}\x1b[0m`);
    console.log(`   ${check.message}\n`);
  });

  console.log('='.repeat(60));
  console.log(`\nSummary: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);

  if (failed > 0) {
    console.log('❌ Critical issues found. Fix these first.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Some warnings found. Review and fix when possible.\n');
  } else {
    console.log('✅ All checks passed!\n');
  }
}

main();
