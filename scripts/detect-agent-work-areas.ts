#!/usr/bin/env tsx

/**
 * Agent Work Area Detection Script
 * 
 * Automatically analyzes the codebase to detect which agents are active
 * and what files/areas they likely work on based on:
 * - File path patterns
 * - Directory structure
 * - Recent modifications
 * - Code patterns and imports
 * 
 * Usage:
 *   cd frontend && NODE_PATH=$PWD/node_modules npx tsx ../scripts/detect-agent-work-areas.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AgentWorkArea {
  agentId: string;
  agentName: string;
  files: string[];
  directories: string[];
  recentFiles: string[];
  patterns: string[];
  estimatedLastActive?: string;
}

// Agent definitions based on known patterns
const AGENT_PATTERNS: Record<string, {
  name: string;
  filePatterns: RegExp[];
  directoryPatterns: string[];
  keywords: string[];
}> = {
  A0: {
    name: 'Architect/Orchestrator',
    filePatterns: [
      /master-agent\.md$/,
      /AGENT-COORDINATION-AUDIT\.md$/,
      /ACTIVE-AGENTS-REGISTRY\.md$/,
      /NEXT-PROMPT\.md$/,
      /\.cursor\/rules/,
      /docs\/.*\.md$/,
    ],
    directoryPatterns: ['docs/', '.cursor/'],
    keywords: ['master-agent', 'agent', 'coordination', 'architecture'],
  },
  A1: {
    name: 'Database Agent',
    filePatterns: [
      /supabase\/migrations\/.*\.sql$/,
      /db-spec\.md$/,
      /schema\.ts$/,
      /migrations\//,
    ],
    directoryPatterns: ['supabase/migrations/', 'supabase/'],
    keywords: ['migration', 'schema', 'table', 'rls', 'trigger', 'function'],
  },
  A2: {
    name: 'Auth Agent',
    filePatterns: [
      /use-auth\.ts$/,
      /use-admin\.ts$/,
      /middleware\.ts$/,
      /auth\/.*\.tsx?$/,
      /impersonation/,
    ],
    directoryPatterns: ['frontend/src/hooks/use-auth.ts', 'frontend/src/app/auth/'],
    keywords: ['auth', 'login', 'register', 'session', 'user', 'profile', 'role'],
  },
  A3: {
    name: 'UI Agent',
    filePatterns: [
      /components\/.*\.tsx$/,
      /app\/.*\/page\.tsx$/,
      /app\/.*\/layout\.tsx$/,
      /\.css$/,
    ],
    directoryPatterns: ['frontend/src/components/', 'frontend/src/app/'],
    keywords: ['component', 'page', 'ui', 'card', 'button', 'layout'],
  },
  A4: {
    name: 'Backend Agent',
    filePatterns: [
      /actions\/.*\.ts$/,
      /app\/api\/.*\/route\.ts$/,
      /validation\/schemas\.ts$/,
      /lib\/.*\.ts$/,
    ],
    directoryPatterns: ['frontend/src/actions/', 'frontend/src/app/api/'],
    keywords: ['action', 'server', 'api', 'route', 'validation', 'zod'],
  },
  A5: {
    name: 'Admin Agent',
    filePatterns: [
      /app\/admin\/.*\.tsx$/,
      /components\/admin\/.*\.tsx$/,
      /actions\/admin\/.*\.ts$/,
    ],
    directoryPatterns: ['frontend/src/app/admin/', 'frontend/src/components/admin/'],
    keywords: ['admin', 'crud', 'management', 'dashboard'],
  },
  A6: {
    name: 'Compatibility Agent',
    filePatterns: [
      /use-compatibility\.ts$/,
      /compatibility/,
      /BuilderTable\.tsx$/,
    ],
    directoryPatterns: ['frontend/src/hooks/use-compatibility.ts'],
    keywords: ['compatibility', 'rules', 'conflict', 'warning'],
  },
  A7: {
    name: 'Content Agent',
    filePatterns: [
      /guides\/.*\.md$/,
      /content/,
      /docs\/guides/,
    ],
    directoryPatterns: ['docs/guides/'],
    keywords: ['guide', 'content', 'tutorial', 'documentation'],
  },
  A8: {
    name: 'QA Agent',
    filePatterns: [
      /security-audit\.ts$/,
      /test.*\.ts$/,
      /\.test\./,
      /\.spec\./,
    ],
    directoryPatterns: ['scripts/security-audit.ts'],
    keywords: ['test', 'audit', 'security', 'validation'],
  },
  A9: {
    name: 'Video Content Agent',
    filePatterns: [
      /videos\/.*\.tsx?$/,
      /video-utils\.ts$/,
      /youtube-api\.ts$/,
      /actions\/.*videos?\.ts$/,
      /migrations\/.*video.*\.sql$/,
    ],
    directoryPatterns: ['frontend/src/components/videos/', 'frontend/src/actions/videos.ts'],
    keywords: ['video', 'youtube', 'thumbnail', 'embed'],
  },
  A10: {
    name: 'Admin Tools Audit',
    filePatterns: [
      /admin.*audit/,
      /tools.*audit/,
    ],
    directoryPatterns: [],
    keywords: ['audit', 'admin tools'],
  },
  A11: {
    name: 'Security Audit',
    filePatterns: [
      /security-audit\.ts$/,
      /SECURITY.*\.md$/,
    ],
    directoryPatterns: ['scripts/security-audit.ts'],
    keywords: ['security', 'audit', 'xss', 'sql injection'],
  },
  A12: {
    name: 'Mobile Experience',
    filePatterns: [
      /use-infinite-scroll\.ts$/,
      /use-pull-to-refresh\.ts$/,
      /use-swipe\.ts$/,
      /responsive/,
    ],
    directoryPatterns: ['frontend/src/hooks/use-infinite-scroll.ts'],
    keywords: ['mobile', 'responsive', 'touch', 'infinite scroll', 'pull to refresh'],
  },
  A13: {
    name: 'EV Implementation',
    filePatterns: [
      /motor/,
      /electric/,
      /ev/,
      /battery/,
      /controller/,
    ],
    directoryPatterns: ['frontend/src/app/motors/', 'frontend/src/components/MotorCard.tsx'],
    keywords: ['motor', 'electric', 'ev', 'battery', 'voltage'],
  },
  A14: {
    name: 'SEO Architect',
    filePatterns: [
      /seo\/.*\.md$/,
      /schema-plan/,
      /keyword-map/,
      /StructuredData\.tsx$/,
    ],
    directoryPatterns: ['docs/seo/'],
    keywords: ['seo', 'schema', 'metadata', 'sitemap', 'keyword'],
  },
};

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function getFileModificationTime(filePath: string): Date | null {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  } catch {
    return null;
  }
}

function getRecentFiles(files: string[], days: number = 30): string[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return files
    .map((file) => ({
      file,
      mtime: getFileModificationTime(file),
    }))
    .filter(({ mtime }) => mtime && mtime > cutoff)
    .sort((a, b) => (b.mtime?.getTime() || 0) - (a.mtime?.getTime() || 0))
    .map(({ file }) => file);
}

function detectAgentForFile(filePath: string): string[] {
  const detectedAgents: string[] = [];
  const relativePath = filePath.replace(process.cwd() + '/', '');

  for (const [agentId, pattern] of Object.entries(AGENT_PATTERNS)) {
    // Check file patterns
    if (pattern.filePatterns.some((regex) => regex.test(filePath))) {
      detectedAgents.push(agentId);
      continue;
    }

    // Check directory patterns
    if (pattern.directoryPatterns.some((dir) => relativePath.startsWith(dir))) {
      detectedAgents.push(agentId);
      continue;
    }

    // Check keywords in path
    if (pattern.keywords.some((keyword) => relativePath.toLowerCase().includes(keyword.toLowerCase()))) {
      detectedAgents.push(agentId);
    }
  }

  return detectedAgents;
}

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function detectAgentFromContent(filePath: string, content: string): string[] {
  const detectedAgents: string[] = [];

  for (const [agentId, pattern] of Object.entries(AGENT_PATTERNS)) {
    // Check for agent-specific keywords in content
    const keywordMatches = pattern.keywords.filter((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    // If multiple keywords match, likely this agent's file
    if (keywordMatches.length >= 2) {
      detectedAgents.push(agentId);
    }
  }

  return detectedAgents;
}

function main() {
  console.log('🔍 Detecting agent work areas...\n');

  // Determine workspace root (could be in scripts/ or root)
  let workspaceRoot = process.cwd();
  if (workspaceRoot.endsWith('scripts')) {
    workspaceRoot = path.join(workspaceRoot, '..');
  }
  
  const frontendRoot = path.join(workspaceRoot, 'frontend');
  const supabaseRoot = path.join(workspaceRoot, 'supabase');
  const docsRoot = path.join(workspaceRoot, 'docs');
  const scriptsRoot = path.join(workspaceRoot, 'scripts');

  // Collect all files
  const allFiles: string[] = [];
  
  if (fs.existsSync(frontendRoot)) {
    allFiles.push(...getAllFiles(frontendRoot));
  }
  if (fs.existsSync(supabaseRoot)) {
    allFiles.push(...getAllFiles(supabaseRoot));
  }
  if (fs.existsSync(docsRoot)) {
    allFiles.push(...getAllFiles(docsRoot));
  }
  if (fs.existsSync(scriptsRoot)) {
    allFiles.push(...getAllFiles(scriptsRoot));
  }

  console.log(`📁 Found ${allFiles.length} files to analyze\n`);

  // Detect agent work areas
  const agentWork: Record<string, AgentWorkArea> = {};

  for (const file of allFiles) {
    // Skip certain file types
    if (
      file.includes('node_modules') ||
      file.includes('.next') ||
      file.includes('.git') ||
      file.endsWith('.log') ||
      file.endsWith('.lock')
    ) {
      continue;
    }

    // Detect from file path
    const pathAgents = detectAgentForFile(file);
    
    // Detect from content (for key files)
    let contentAgents: string[] = [];
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
      const content = readFileContent(file);
      contentAgents = detectAgentFromContent(file, content);
    }

    const allAgents = [...new Set([...pathAgents, ...contentAgents])];

    for (const agentId of allAgents) {
      if (!agentWork[agentId]) {
        agentWork[agentId] = {
          agentId,
          agentName: AGENT_PATTERNS[agentId]?.name || 'Unknown',
          files: [],
          directories: [],
          recentFiles: [],
          patterns: [],
        };
      }

      agentWork[agentId].files.push(file);
    }
  }

  // Process results
  for (const agentId in agentWork) {
    const work = agentWork[agentId];
    
    // Get unique directories
    const dirs = new Set<string>();
    work.files.forEach((file) => {
      const dir = path.dirname(file);
      dirs.add(dir);
    });
    work.directories = Array.from(dirs).sort();

    // Get recent files (last 30 days)
    work.recentFiles = getRecentFiles(work.files, 30);

    // Estimate last active date
    if (work.recentFiles.length > 0) {
      const mostRecent = work.recentFiles[0];
      const mtime = getFileModificationTime(mostRecent);
      if (mtime) {
        work.estimatedLastActive = mtime.toISOString().split('T')[0];
      }
    }

    // Get patterns
    work.patterns = AGENT_PATTERNS[agentId]?.filePatterns.map((p) => p.toString()) || [];
  }

  // Output results
  console.log('📊 Agent Work Area Detection Results\n');
  console.log('=' .repeat(80) + '\n');

  for (const agentId of Object.keys(agentWork).sort()) {
    const work = agentWork[agentId];
    
    console.log(`## ${agentId}: ${work.agentName}`);
    console.log(`\n**Status:** ${work.files.length > 0 ? '✅ Active' : '❌ Inactive'}`);
    if (work.estimatedLastActive) {
      console.log(`**Last Active:** ${work.estimatedLastActive}`);
    }
    console.log(`**Files Found:** ${work.files.length}`);
    console.log(`**Directories:** ${work.directories.length}`);
    console.log(`**Recent Files (30 days):** ${work.recentFiles.length}\n`);

    if (work.directories.length > 0) {
      console.log('**Key Directories:**');
      work.directories.slice(0, 10).forEach((dir) => {
        const relativeDir = dir.replace(workspaceRoot + '/', '');
        console.log(`  - \`${relativeDir}\``);
      });
      if (work.directories.length > 10) {
        console.log(`  ... and ${work.directories.length - 10} more`);
      }
      console.log();
    }

    if (work.recentFiles.length > 0) {
      console.log('**Recent Files:**');
      work.recentFiles.slice(0, 5).forEach((file) => {
        const relativeFile = file.replace(workspaceRoot + '/', '');
        const mtime = getFileModificationTime(file);
        const dateStr = mtime ? mtime.toISOString().split('T')[0] : 'unknown';
        console.log(`  - \`${relativeFile}\` (${dateStr})`);
      });
      if (work.recentFiles.length > 5) {
        console.log(`  ... and ${work.recentFiles.length - 5} more`);
      }
      console.log();
    }

    console.log('---\n');
  }

  // Generate markdown report
  const reportPath = path.join(workspaceRoot, 'docs', 'AGENT-DETECTION-REPORT.md');
  let markdown = `# Agent Work Area Detection Report\n\n`;
  markdown += `> **Generated:** ${new Date().toISOString().split('T')[0]}\n`;
  markdown += `> **Script:** \`scripts/detect-agent-work-areas.ts\`\n\n`;
  markdown += `This report was automatically generated by analyzing the codebase for agent work patterns.\n\n`;
  markdown += `---\n\n`;

  for (const agentId of Object.keys(agentWork).sort()) {
    const work = agentWork[agentId];
    
    markdown += `## ${agentId}: ${work.agentName}\n\n`;
    markdown += `- **Status:** ${work.files.length > 0 ? '✅ Active' : '❌ Inactive'}\n`;
    if (work.estimatedLastActive) {
      markdown += `- **Last Active:** ${work.estimatedLastActive}\n`;
    }
    markdown += `- **Files Found:** ${work.files.length}\n`;
    markdown += `- **Directories:** ${work.directories.length}\n`;
    markdown += `- **Recent Files (30 days):** ${work.recentFiles.length}\n\n`;

    if (work.directories.length > 0) {
      markdown += `### Key Directories\n\n`;
      work.directories.slice(0, 15).forEach((dir) => {
        const relativeDir = dir.replace(workspaceRoot + '/', '');
        markdown += `- \`${relativeDir}\`\n`;
      });
      if (work.directories.length > 15) {
        markdown += `\n*... and ${work.directories.length - 15} more directories*\n`;
      }
      markdown += `\n`;
    }

    if (work.recentFiles.length > 0) {
      markdown += `### Recent Files (Last 30 Days)\n\n`;
      work.recentFiles.slice(0, 10).forEach((file) => {
        const relativeFile = file.replace(workspaceRoot + '/', '');
        const mtime = getFileModificationTime(file);
        const dateStr = mtime ? mtime.toISOString().split('T')[0] : 'unknown';
        markdown += `- \`${relativeFile}\` (${dateStr})\n`;
      });
      if (work.recentFiles.length > 10) {
        markdown += `\n*... and ${work.recentFiles.length - 10} more recent files*\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  // Summary
  markdown += `## Summary\n\n`;
  markdown += `| Agent | Status | Files | Recent Activity |\n`;
  markdown += `|-------|--------|-------|-----------------|\n`;
  for (const agentId of Object.keys(agentWork).sort()) {
    const work = agentWork[agentId];
    const status = work.files.length > 0 ? '✅ Active' : '❌ Inactive';
    const recent = work.recentFiles.length > 0 ? `✅ ${work.recentFiles.length} files` : '❌ None';
    markdown += `| ${agentId} | ${status} | ${work.files.length} | ${recent} |\n`;
  }

  fs.writeFileSync(reportPath, markdown);
  console.log(`\n✅ Report saved to: ${reportPath}\n`);

  // Generate JSON for programmatic use
  const jsonPath = path.join(workspaceRoot, 'docs', 'AGENT-DETECTION-REPORT.json');
  fs.writeFileSync(jsonPath, JSON.stringify(agentWork, null, 2));
  console.log(`✅ JSON data saved to: ${jsonPath}\n`);
}

if (require.main === module) {
  main();
}

export { main };
