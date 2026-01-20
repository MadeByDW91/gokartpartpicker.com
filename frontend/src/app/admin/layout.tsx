'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { GlobalSearch } from '@/components/admin/GlobalSearch';
import { getPendingApprovalsCount } from '@/actions/admin/approvals';
import { 
  LayoutDashboard, 
  Cog, 
  Package, 
  GitCompare, 
  FileText, 
  ClipboardList,
  Shield,
  ChevronLeft,
  Loader2,
  DollarSign,
  BarChart3,
  Users,
  Wrench,
  TrendingDown,
  Wand2,
  Key,
  Image as ImageIcon,
  Video,
  ChevronDown,
  ChevronRight,
  Settings,
  BookOpen,
  Activity,
  MessageSquare,
  Pin,
  Lock,
  Flag,
  FolderTree,
  Share2,
  Clock
} from 'lucide-react';

// Navigation groups
interface NavGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean; // If true, show pending count badge
}

const navigationGroups: NavGroup[] = [
  {
    name: 'Catalog',
    icon: Package,
    defaultOpen: true,
    items: [
      { name: 'Engines', href: '/admin/engines', icon: Cog },
      { name: 'Parts', href: '/admin/parts', icon: Package },
      { name: 'Templates', href: '/admin/templates', icon: FileText },
      { name: 'Guides', href: '/admin/guides', icon: BookOpen },
      { name: 'Compatibility', href: '/admin/compatibility', icon: GitCompare },
    ],
  },
  {
    name: 'Content',
    icon: FileText,
    defaultOpen: false,
    items: [
      { name: 'Videos', href: '/admin/videos', icon: Video },
      { name: 'Image Review', href: '/admin/images/review', icon: ImageIcon },
      { name: 'Social Media', href: '/admin/social', icon: Share2 },
      { name: 'Content Automation', href: '/admin/content/automation', icon: Wand2 },
    ],
  },
  {
    name: 'Analytics & Reports',
    icon: BarChart3,
    defaultOpen: false,
    items: [
      { name: 'Approvals', href: '/admin/approvals', icon: Clock, badge: true },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Reports', href: '/admin/reports/missing-data', icon: ClipboardList },
      { name: 'Audit Log', href: '/admin/audit', icon: ClipboardList },
    ],
  },
  {
    name: 'Revenue & Pricing',
    icon: DollarSign,
    defaultOpen: false,
    items: [
      { name: 'Affiliate Links', href: '/admin/affiliate', icon: DollarSign },
      { name: 'Price Monitor', href: '/admin/pricing/monitor', icon: TrendingDown },
    ],
  },
  {
    name: 'Users & Builds',
    icon: Users,
    defaultOpen: false,
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Builds', href: '/admin/builds', icon: Wrench },
    ],
  },
  {
    name: 'Forums',
    icon: MessageSquare,
    defaultOpen: false,
    items: [
      { name: 'Dashboard', href: '/admin/forums', icon: LayoutDashboard },
      { name: 'Topics', href: '/admin/forums/topics', icon: MessageSquare },
      { name: 'Posts', href: '/admin/forums/posts', icon: FileText },
      { name: 'Categories', href: '/admin/forums/categories', icon: FolderTree },
      { name: 'Flagged Content', href: '/admin/forums/flagged', icon: Flag },
    ],
  },
  {
    name: 'Security',
    icon: Shield,
    defaultOpen: false,
    items: [
      { name: 'Security Dashboard', href: '/admin/security', icon: Shield },
      { name: 'Ban Management', href: '/admin/security/bans', icon: Users },
      { name: 'Rate Limits', href: '/admin/security/rate-limits', icon: Activity },
      { name: 'Audit Logs', href: '/admin/security/audit-logs', icon: ClipboardList },
    ],
  },
  {
    name: 'System',
    icon: Settings,
    defaultOpen: false,
    items: [
      { name: 'Deployment Status', href: '/admin/deployment', icon: Activity },
      { name: 'API Keys', href: '/admin/api', icon: Key },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, isAdmin, isSuperAdmin } = useAdmin();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(navigationGroups.filter(g => g.defaultOpen).map(g => g.name))
  );
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  // Debug logging
  useEffect(() => {
    if (!loading) {
      console.log('🔍 Admin Layout Check:', {
        hasProfile: !!profile,
        username: profile?.username,
        email: profile?.email,
        role: profile?.role,
        roleType: typeof profile?.role,
        isAdmin,
        isSuperAdmin,
        willRedirect: !isAdmin,
        fullProfile: profile
      });
      
      if (!isAdmin && profile) {
        console.error('🚫 Access Denied - User is not admin:', {
          username: profile.username,
          role: profile.role,
          expectedRoles: ['admin', 'super_admin']
        });
      }
    }
  }, [loading, profile, isAdmin, isSuperAdmin]);

  // Redirect non-admins
  useEffect(() => {
    if (!loading && !isAdmin) {
      console.log('Redirecting non-admin user');
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  // Auto-open group if current path matches
  useEffect(() => {
    navigationGroups.forEach(group => {
      const hasActiveItem = group.items.some(item => 
        item.href === '/admin' 
          ? pathname === '/admin'
          : pathname.startsWith(item.href)
      );
      if (hasActiveItem) {
        setOpenGroups(prev => new Set(prev).add(group.name));
      }
    });
  }, [pathname]);

  // Fetch pending approvals count
  useEffect(() => {
    if (isAdmin) {
      const fetchCount = async () => {
        try {
          const result = await getPendingApprovalsCount();
          if (result.success && result.data) {
            setPendingApprovalsCount(result.data.total);
          }
        } catch (err) {
          console.error('Error fetching pending approvals count:', err);
        }
      };

      fetchCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-cream-200 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render for non-admins
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-olive-900 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-olive-800 border-r border-olive-600 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-olive-600">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 overflow-hidden rounded border border-orange-500">
              <Image
                src="/brand/brand-iconmark-v1.svg"
                alt="GoKartPartPicker Admin"
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <span className="text-display text-sm text-cream-100">Admin</span>
              <span className="text-display text-sm text-orange-500">Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Dashboard - Always visible */}
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-2',
              pathname === '/admin'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                : 'text-cream-200 hover:bg-olive-700 hover:text-cream-100'
            )}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            Dashboard
          </Link>

          {/* Navigation Groups */}
          {navigationGroups.map((group) => {
            const isOpen = openGroups.has(group.name);
            const hasActiveItem = group.items.some(item => 
              item.href === '/admin' 
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            );

            return (
              <div key={group.name} className="mb-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    hasActiveItem
                      ? 'text-orange-400 bg-orange-500/5'
                      : 'text-cream-300 hover:bg-olive-700 hover:text-cream-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{group.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>

                {/* Group Items */}
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-olive-600 pl-2">
                    {group.items.map((item) => {
                      const isActive = 
                        item.href === '/admin' 
                          ? pathname === '/admin'
                          : pathname.startsWith(item.href);
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
                            isActive
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                              : 'text-cream-200 hover:bg-olive-700 hover:text-cream-100'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.name}
                          </div>
                          {item.badge && pendingApprovalsCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-cream-100">
                              {pendingApprovalsCount > 99 ? '99+' : pendingApprovalsCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User & Back to Site */}
        <div className="border-t border-olive-600 p-3 space-y-2">
          {/* Current User */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-olive-700/50">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-cream-100 font-bold text-sm">
              {profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream-100 truncate">
                {profile?.username || profile?.email || 'Admin'}
              </p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-orange-400 uppercase">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Back to Site */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-cream-300 hover:text-cream-100 hover:bg-olive-700 rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header Bar with Search */}
        <div className="sticky top-0 z-40 bg-olive-900/95 backdrop-blur-sm border-b border-olive-600 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            <GlobalSearch />
          </div>
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
