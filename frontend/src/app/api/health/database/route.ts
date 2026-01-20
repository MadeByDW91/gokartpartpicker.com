import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Database health check endpoint
 * Tests Supabase connection and verifies tables/data exist
 * 
 * Usage: GET /api/health/database
 */
export async function GET() {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase environment variables not configured',
        details: {
          hasUrl,
          hasKey,
          env: process.env.NODE_ENV,
        },
      }, { status: 500 });
    }

    const supabase = await createClient();
    
    // Test connection by querying each table
    const checks = {
      engines: { exists: false, count: 0, error: null as string | null },
      parts: { exists: false, count: 0, error: null as string | null },
      build_templates: { exists: false, count: 0, error: null as string | null },
    };

    // Check engines
    try {
      const { data: engines, error: enginesError } = await supabase
        .from('engines')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (enginesError) {
        checks.engines.error = enginesError.message;
        if (enginesError.message?.includes('does not exist')) {
          checks.engines.exists = false;
        }
      } else {
        checks.engines.exists = true;
        checks.engines.count = engines?.length || 0;
      }
    } catch (err) {
      checks.engines.error = err instanceof Error ? err.message : String(err);
    }

    // Check parts
    try {
      const { data: parts, error: partsError } = await supabase
        .from('parts')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (partsError) {
        checks.parts.error = partsError.message;
        if (partsError.message?.includes('does not exist')) {
          checks.parts.exists = false;
        }
      } else {
        checks.parts.exists = true;
        checks.parts.count = parts?.length || 0;
      }
    } catch (err) {
      checks.parts.error = err instanceof Error ? err.message : String(err);
    }

    // Check templates
    try {
      const { data: templates, error: templatesError } = await supabase
        .from('build_templates')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true)
        .eq('is_active', true)
        .eq('approval_status', 'approved');
      
      if (templatesError) {
        checks.build_templates.error = templatesError.message;
        if (templatesError.message?.includes('does not exist')) {
          checks.build_templates.exists = false;
        }
      } else {
        checks.build_templates.exists = true;
        checks.build_templates.count = templates?.length || 0;
      }
    } catch (err) {
      checks.build_templates.error = err instanceof Error ? err.message : String(err);
    }

    // Determine overall status
    const allTablesExist = checks.engines.exists && checks.parts.exists && checks.build_templates.exists;
    const hasData = checks.engines.count > 0 || checks.parts.count > 0 || checks.build_templates.count > 0;
    
    const status = allTablesExist && hasData ? 'healthy' : 
                   allTablesExist ? 'warning' : 'error';

    return NextResponse.json({
      status,
      message: allTablesExist 
        ? (hasData ? 'Database is healthy' : 'Tables exist but no data found')
        : 'Some tables are missing - run migrations',
      environment: {
        hasUrl,
        hasKey,
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      },
      checks,
      recommendations: [
        !hasUrl || !hasKey ? 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel' : null,
        !checks.engines.exists ? 'Run migrations: engines table does not exist' : null,
        !checks.parts.exists ? 'Run migrations: parts table does not exist' : null,
        !checks.build_templates.exists ? 'Run migrations: build_templates table does not exist' : null,
        checks.engines.count === 0 ? 'Run seed migration: 20260116000004_seed_engines.sql' : null,
        checks.parts.count === 0 ? 'Run seed migration: 20260116000006_seed_parts.sql' : null,
      ].filter(Boolean),
    }, { 
      status: status === 'healthy' ? 200 : status === 'warning' ? 200 : 500 
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check database health',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
