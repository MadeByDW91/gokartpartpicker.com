'use server';

import { createClient } from '@/lib/supabase/server';

export interface DeploymentInfo {
  github: {
    commit?: string;
    branch?: string;
    lastCommitDate?: string;
    repository?: string;
    status: 'connected' | 'unknown';
  };
  vercel: {
    deploymentUrl?: string;
    deploymentId?: string;
    deploymentTime?: string;
    environment?: string;
    status: 'connected' | 'unknown';
  };
  supabase: {
    projectUrl?: string;
    connected: boolean;
    version?: string;
    lastChecked?: string;
    tablesCount?: number;
  };
  application: {
    version: string;
    nodeVersion?: string;
    nextVersion?: string;
    buildTime?: string;
    environment: string;
  };
}

/**
 * Get deployment and system information
 */
export async function getDeploymentInfo(): Promise<DeploymentInfo> {
  const info: DeploymentInfo = {
    github: {
      status: 'unknown',
    },
    vercel: {
      status: 'unknown',
    },
    supabase: {
      connected: false,
    },
    application: {
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    },
  };

  // GitHub Info
  try {
    // Try to get from environment variables (set by Vercel)
    const vercelGitCommitSha = process.env.VERCEL_GIT_COMMIT_SHA;
    const vercelGitCommitRef = process.env.VERCEL_GIT_COMMIT_REF;
    const vercelGitRepo = process.env.VERCEL_GIT_REPO_SLUG;
    
    if (vercelGitCommitSha) {
      info.github.commit = vercelGitCommitSha.substring(0, 7);
      info.github.branch = vercelGitCommitRef || 'main';
      info.github.repository = vercelGitRepo || 'gokartpartpicker.com';
      info.github.status = 'connected';
      
      // Try to get commit date from GitHub API if we have the full SHA
      // (This would require a GitHub token, so we'll skip for now)
    }
  } catch (error) {
    console.error('Error fetching GitHub info:', error);
  }

  // Vercel Info
  try {
    const vercelUrl = process.env.VERCEL_URL;
    const vercelEnv = process.env.VERCEL_ENV;
    const vercelDeploymentId = process.env.VERCEL_DEPLOYMENT_ID;
    
    if (vercelUrl) {
      info.vercel.deploymentUrl = `https://${vercelUrl}`;
      info.vercel.environment = vercelEnv || 'production';
      info.vercel.deploymentId = vercelDeploymentId;
      info.vercel.status = 'connected';
    }
    
    // Build time from environment (set during build)
    if (process.env.BUILD_TIME) {
      info.vercel.deploymentTime = process.env.BUILD_TIME;
    }
  } catch (error) {
    console.error('Error fetching Vercel info:', error);
  }

  // Supabase Info
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase = await createClient();
    
    if (supabaseUrl) {
      info.supabase.projectUrl = supabaseUrl;
      info.supabase.connected = !!supabase;
      info.supabase.lastChecked = new Date().toISOString();
      
      // Test connection by querying a known table
      if (supabase) {
        try {
          const { count, error } = await supabase
            .from('engines')
            .select('*', { count: 'exact', head: true });
          
          if (!error && count !== null) {
            info.supabase.connected = true;
          }
        } catch (err) {
          // Connection test failed
          console.error('Supabase connection test failed:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Supabase info:', error);
  }

  // Application Info
  try {
    info.application.nodeVersion = process.version;
    // Next.js version is available at build time
    info.application.nextVersion = '16.1.2'; // From package.json
    
    // Build time
    if (process.env.BUILD_TIME) {
      info.application.buildTime = process.env.BUILD_TIME;
    }
  } catch (error) {
    console.error('Error fetching application info:', error);
  }

  return info;
}

/**
 * Get database health check
 */
export async function getDatabaseHealth() {
  const supabase = await createClient();
  
  if (!supabase) {
    return {
      status: 'error',
      message: 'Supabase client not available',
    };
  }

  try {
    const checks = {
      engines: { exists: false, count: 0, error: null as string | null },
      parts: { exists: false, count: 0, error: null as string | null },
      build_templates: { exists: false, count: 0, error: null as string | null },
    };

    // Check engines
    const { count: enginesCount, error: enginesError } = await supabase
      .from('engines')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (enginesError) {
      checks.engines.error = enginesError.message;
    } else {
      checks.engines.exists = true;
      checks.engines.count = enginesCount || 0;
    }

    // Check parts
    const { count: partsCount, error: partsError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (partsError) {
      checks.parts.error = partsError.message;
    } else {
      checks.parts.exists = true;
      checks.parts.count = partsCount || 0;
    }

    // Check templates
    const { count: templatesCount, error: templatesError } = await supabase
      .from('build_templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)
      .eq('is_active', true)
      .eq('approval_status', 'approved');
    
    if (templatesError) {
      checks.build_templates.error = templatesError.message;
    } else {
      checks.build_templates.exists = true;
      checks.build_templates.count = templatesCount || 0;
    }

    const allHealthy = checks.engines.exists && checks.parts.exists && checks.build_templates.exists;
    
    return {
      status: allHealthy ? 'healthy' : 'warning',
      checks,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
