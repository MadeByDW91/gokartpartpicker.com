'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from '@/components/ui/Button';
import { 
  Menu, 
  X, 
  Wrench, 
  Cog, 
  Package, 
  Bookmark, 
  LogOut, 
  User,
  ChevronDown,
  Shield,
  BookOpen,
  Home,
  Calculator,
  MessageSquare,
  Command
} from 'lucide-react';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Engines', href: '/engines', icon: Cog },
  { name: 'Parts', href: '/parts', icon: Package },
  { name: 'Builder', href: '/builder', icon: Wrench },
  { name: 'Forums', href: '/forums', icon: MessageSquare },
  { name: 'Tools', href: '/tools', icon: Calculator },
  { name: 'Guides', href: '/guides', icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const { isAdmin, loading: adminLoading, profile } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Debug: Log admin status
  if (isAuthenticated && !adminLoading) {
    console.log('Header - Admin check:', { isAdmin, role: profile?.role, username: profile?.username });
  }
  
  return (
    <header className="sticky top-0 z-50 bg-olive-900/95 backdrop-blur-sm border-b border-olive-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg border-2 border-orange-500 group-hover:border-orange-400 transition-colors flex-shrink-0">
              <Image
                src="/brand/brand-iconmark-v1.svg"
                alt="GoKartPartPicker"
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-display text-xl text-cream-100 group-hover:text-orange-400 transition-colors">
                GoKart
              </span>
              <span className="text-display text-xl text-orange-500">PartPicker</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-all duration-200',
                    isActive 
                      ? 'text-orange-400 bg-olive-800' 
                      : 'text-cream-200 hover:text-orange-400 hover:bg-olive-800'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Search Bar & Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Bar - Desktop */}
            <div className="w-72">
              <AdvancedSearch placeholder="Search engines, parts..." />
            </div>
            {loading ? (
              <div className="w-24 h-9 bg-olive-700 rounded-md animate-pulse" />
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cream-200 hover:text-orange-400 rounded-md hover:bg-olive-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-cream-100 font-bold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>
                
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-olive-800 border border-olive-600 rounded-lg shadow-lg z-20 overflow-hidden">
                      <Link
                        href="/builds"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bookmark className="w-4 h-4" />
                        Saved Builds
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      {!adminLoading && isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-3 text-sm text-orange-400 hover:bg-olive-700 hover:text-orange-300 transition-colors border-t border-olive-600"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-cream-200 hover:bg-olive-700 hover:text-[var(--error)] transition-colors border-t border-olive-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-cream-200 hover:text-orange-400 rounded-md hover:bg-olive-800 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-olive-700">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <AdvancedSearch placeholder="Search..." />
            </div>
            
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wide rounded-md transition-colors',
                      isActive 
                        ? 'text-orange-400 bg-olive-800' 
                        : 'text-cream-200 hover:text-orange-400 hover:bg-olive-800'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              
              {isAuthenticated ? (
                <>
                  <Link
                    href="/builds"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wide text-cream-200 hover:text-orange-400 hover:bg-olive-800 rounded-md transition-colors"
                  >
                    <Bookmark className="w-5 h-5" />
                    Saved Builds
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wide text-orange-400 hover:text-orange-300 hover:bg-olive-800 rounded-md transition-colors border-t border-olive-600"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium uppercase tracking-wide text-cream-200 hover:text-[var(--error)] hover:bg-olive-800 rounded-md transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4 pt-3">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
