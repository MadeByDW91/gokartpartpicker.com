'use client';

import { useState, useEffect } from 'react';
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
  Command,
  Search
} from 'lucide-react';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { SearchModal } from '@/components/search/SearchModal';

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
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
  // Safety timeout: if loading takes too long, assume not authenticated
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || adminLoading) {
        console.warn('[Header] Loading timeout - assuming not authenticated');
        setLoadingTimeout(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [loading, adminLoading]);
  
  // Use timeout state to prevent infinite loading
  const isActuallyLoading = !loadingTimeout && (loading || adminLoading);
  
  // Keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  
  // Debug: Log admin status
  if (isAuthenticated && !adminLoading) {
    console.log('Header - Admin check:', { isAdmin, role: profile?.role, username: profile?.username });
  }
  
  return (
    <header className="sticky top-0 z-50 bg-olive-900/95 backdrop-blur-sm border-b border-olive-700 w-full safe-area-top">
      <nav className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8">
        <div className="flex items-center h-14 sm:h-16 gap-2 lg:gap-4">
          {/* Logo - min 44px touch target */}
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 min-w-0 min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-lg border-2 border-orange-500 group-hover:border-orange-400 transition-colors flex-shrink-0">
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
          <div className="hidden lg:flex items-center gap-1 flex-1 min-w-0 overflow-hidden justify-center">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0',
                    isActive 
                      ? 'text-orange-400 bg-olive-800' 
                      : 'text-cream-200 hover:text-orange-400 hover:bg-olive-800'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile Search & User - Visible on mobile */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0 ml-auto">
            {/* Search Icon Button - Mobile */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] text-cream-200 hover:text-orange-400 rounded-md hover:bg-olive-800 transition-colors flex-shrink-0 touch-manipulation"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* User Profile - Mobile */}
            {!isActuallyLoading && isAuthenticated && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full bg-orange-500 text-cream-100 font-bold touch-manipulation"
                  aria-label="User menu"
                >
                  {user?.email?.[0].toUpperCase()}
                </button>
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-olive-800 border border-olive-600 rounded-lg shadow-lg z-20 overflow-hidden">
                      <Link
                        href="/builds"
                        className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors touch-manipulation"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bookmark className="w-4 h-4" />
                        Saved Builds
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors touch-manipulation"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      {!adminLoading && isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-orange-400 hover:bg-olive-700 hover:text-orange-300 transition-colors border-t border-olive-600 touch-manipulation"
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
                        className="flex items-center gap-2 w-full px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-[var(--error)] transition-colors border-t border-olive-600 touch-manipulation"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search & Auth Section - Desktop (ml-auto when < lg so nav + menu align right) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0 ml-auto lg:ml-0">
            {/* Search Icon Button - 44px touch target */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="relative flex items-center justify-center min-w-[44px] min-h-[44px] text-cream-200 hover:text-orange-400 rounded-md hover:bg-olive-800 transition-colors flex-shrink-0 touch-manipulation"
              aria-label="Search"
              title="Search (Ctrl+K or Cmd+K)"
            >
              <Search className="w-5 h-5" />
            </button>
            {isActuallyLoading ? (
              <div className="w-24 h-9 bg-olive-700 rounded-md animate-pulse flex-shrink-0" />
            ) : isAuthenticated ? (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cream-200 hover:text-orange-400 rounded-md hover:bg-olive-800 transition-colors whitespace-nowrap"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-cream-100 font-bold flex-shrink-0">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform flex-shrink-0',
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
                        className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors touch-manipulation"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bookmark className="w-4 h-4" />
                        Saved Builds
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors touch-manipulation"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      {!adminLoading && isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-orange-400 hover:bg-olive-700 hover:text-orange-300 transition-colors border-t border-olive-600 touch-manipulation"
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
                        className="flex items-center gap-2 w-full px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-[var(--error)] transition-colors border-t border-olive-600 touch-manipulation"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm" className="whitespace-nowrap">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button - 44px touch target, show below lg so tablet can open nav */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] text-cream-200 hover:text-orange-400 rounded-md hover:bg-olive-800 transition-colors touch-manipulation"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Search Modal */}
        <SearchModal 
          isOpen={searchModalOpen} 
          onClose={() => setSearchModalOpen(false)} 
        />
        
        {/* Mobile Menu - Slide Animation */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop - lg:hidden so tablet can use the menu too */}
            <div 
              className="lg:hidden fixed inset-0 top-14 sm:top-16 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu Panel - lg:hidden so tablet can use the menu too */}
            <div 
              className={cn(
                'lg:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 bg-olive-900 border-t border-olive-700 overflow-y-auto overscroll-contain z-40 safe-area-bottom',
                'transition-transform duration-300 ease-in-out',
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              )}
            >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Navigation Links */}
            <nav className="space-y-1 sm:space-y-2 mb-6 sm:mb-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg font-medium uppercase tracking-wide rounded-lg transition-colors touch-manipulation min-h-[52px] sm:min-h-[56px]',
                      isActive 
                        ? 'text-orange-400 bg-olive-800' 
                        : 'text-cream-200 hover:text-orange-400 hover:bg-olive-800 active:bg-olive-700'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="border-t border-olive-700 my-6" />

            {/* User Actions */}
            {isActuallyLoading ? (
              <div className="space-y-2">
                <div className="h-12 bg-olive-700 rounded-lg animate-pulse" />
                <div className="h-12 bg-olive-700 rounded-lg animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/builds"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 text-base font-medium uppercase tracking-wide text-cream-200 hover:text-orange-400 hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[44px] active:bg-olive-700"
                >
                  <Bookmark className="w-5 h-5 flex-shrink-0" />
                  <span>Saved Builds</span>
                </Link>
                {!adminLoading && isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 text-base font-medium uppercase tracking-wide text-orange-400 hover:text-orange-300 hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[44px] active:bg-olive-700"
                  >
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-4 text-base font-medium uppercase tracking-wide text-cream-200 hover:text-[var(--error)] hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[44px] active:bg-olive-700"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  href="/auth/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="secondary" size="lg" className="w-full touch-manipulation min-h-[44px]">
                    Login
                  </Button>
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="lg" className="w-full touch-manipulation min-h-[44px]">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
