#!/usr/bin/env tsx
/**
 * Database Health Check Script
 * 
 * Run this script to check database health and performance metrics
 * 
 * Usage:
 *   npx tsx scripts/database-health-check.ts
 * 
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('🔍 Database Health Check\n');
  console.log('=' .repeat(60));

  try {
    // 1. Table Sizes
    console.log('\n📊 Table Sizes:');
    const { data: tableSizes, error: tableError } = await supabase.rpc('get_table_sizes');
    if (tableError) {
      console.warn('⚠️  Function not available, using direct query...');
      // Fallback query
      const { data: fallback } = await supabase
        .from('pg_tables')
        .select('*')
        .limit(0);
      console.log('   (Run migration 20260117000004_database_health_checks.sql to enable)');
    } else {
      tableSizes?.slice(0, 10).forEach((table: any) => {
        console.log(`   ${table.tablename.padEnd(30)} ${table.size}`);
      });
    }

    // 2. Connection Status
    console.log('\n🔌 Connection Status:');
    const { data: connStatus, error: connError } = await supabase.rpc('get_connection_status');
    if (connError) {
      console.warn('⚠️  Function not available');
    } else if (connStatus && connStatus[0]) {
      const status = connStatus[0];
      const percent = parseFloat(status.percent_used as any);
      const emoji = percent > 80 ? '🔴' : percent > 60 ? '🟡' : '🟢';
      console.log(`   ${emoji} Active: ${status.active_connections}/${status.max_connections} (${percent}%)`);
      console.log(`   Idle: ${status.idle_connections}, Active Queries: ${status.active_queries}`);
    }

    // 3. Index Usage
    console.log('\n📇 Index Usage (Top 10 Unused):');
    const { data: indexUsage, error: indexError } = await supabase.rpc('get_index_usage');
    if (indexError) {
      console.warn('⚠️  Function not available');
    } else {
      indexUsage
        ?.filter((idx: any) => idx.times_used === 0)
        .slice(0, 10)
        .forEach((idx: any) => {
          console.log(`   ${idx.indexname.padEnd(40)} ${idx.index_size} (never used)`);
        });
    }

    // 4. Table Statistics
    console.log('\n📈 Table Statistics:');
    const { data: tableStats, error: statsError } = await supabase.rpc('get_table_statistics');
    if (statsError) {
      console.warn('⚠️  Function not available');
    } else {
      tableStats?.slice(0, 10).forEach((table: any) => {
        console.log(`   ${table.tablename.padEnd(30)} ${table.row_count.toLocaleString().padStart(10)} rows`);
      });
    }

    // 5. Check if pg_stat_statements is enabled
    console.log('\n⚡ Query Performance:');
    const { data: slowQueries, error: slowError } = await supabase.rpc('get_slow_queries', { limit_count: 5 });
    if (slowError) {
      if (slowError.message?.includes('does not exist')) {
        console.log('   ⚠️  pg_stat_statements not enabled');
        console.log('   Run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
      } else {
        console.warn(`   ⚠️  Error: ${slowError.message}`);
      }
    } else if (slowQueries && slowQueries.length > 0) {
      console.log('   Top 5 slow queries:');
      slowQueries.forEach((q: any, i: number) => {
        console.log(`   ${i + 1}. ${q.query_preview.substring(0, 60)}... (${q.mean_exec_time}ms avg)`);
      });
    } else {
      console.log('   ✅ No slow queries found');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Health check complete!\n');

  } catch (error) {
    console.error('❌ Error running health check:', error);
    process.exit(1);
  }
}

main();
