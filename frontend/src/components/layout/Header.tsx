'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Search,
  MoreHorizontal,
  FileText,
  UserCog,
  UserX,
  LayoutDashboard
} from 'lucide-react';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { SearchModal } from '@/components/search/SearchModal';
import { useImpersonation } from '@/hooks/use-impersonation';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Engines', href: '/engines', icon: Cog },
  { name: 'Parts', href: '/parts', icon: Package },
  { name: 'Builder', href: '/builder', icon: Wrench },
  { name: 'Forums', href: '/forums', icon: MessageSquare },
  { name: 'Tools', href: '/tools', icon: Calculator },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const { isAdmin, loading: adminLoading, profile } = useAdmin();
  const { active: impersonating, exit: exitImpersonation } = useImpersonation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [viewAsLoading, setViewAsLoading] = useState(false);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuPosition = useRef<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  
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

  // Client-side mounting check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position immediately when button is clicked
  const calculateMenuPosition = () => {
    if (userMenuButtonRef.current) {
      const rect = userMenuButtonRef.current.getBoundingClientRect();
      userMenuPosition.current = {
        top: rect.bottom + 8, // mt-2 = 8px
        right: window.innerWidth - rect.right,
      };
    }
  };

  // Update dropdown position when opened (fallback)
  useEffect(() => {
    if (userMenuOpen && userMenuButtonRef.current && mounted) {
      calculateMenuPosition();
    }
  }, [userMenuOpen, mounted]);

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

  // Close more menu when clicking outside
  useEffect(() => {
    if (!moreMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-more-menu]')) {
        setMoreMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [moreMenuOpen]);

  const handleViewAsNormalUser = async () => {
    setViewAsLoading(true);
    setUserMenuOpen(false);
    try {
      const res = await fetch('/api/impersonation/start', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = (await res.json()) as { success?: boolean; redirect?: string; error?: string };
      if (data?.success && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (!data?.success) {
        alert(data?.error ?? 'Failed to start view-as');
      }
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'digest' in e) return;
      alert(e instanceof Error ? e.message : 'Failed to start view-as');
    } finally {
      setViewAsLoading(false);
    }
  };

  const handleExitViewAs = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await exitImpersonation();
  };

  return (
    <header className="sticky top-0 z-50 bg-olive-900/95 backdrop-blur-sm border-b border-olive-700/50 w-full safe-area-top overflow-x-hidden max-w-full">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden max-w-full">
        <div className="flex items-center h-16 sm:h-18 gap-2 sm:gap-3 lg:gap-6 w-full min-w-0 max-w-full overflow-hidden">
          {/* Logo - Icon only on mobile, text on tablet+ */}
          <Link 
            href="/" 
            className="flex items-center gap-1 sm:gap-3 group flex-shrink-0 min-h-[44px] min-w-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 overflow-hidden rounded-lg border-2 border-orange-500 group-hover:border-orange-400 transition-colors flex-shrink-0">
              <Image
                src="/brand/brand-iconmark-v1.svg"
                alt="GoKartPartPicker"
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>
            {/* Hide text on mobile, show on md+ */}
            <div className="hidden md:block">
              <span className="text-display text-lg md:text-xl text-cream-100 group-hover:text-orange-400 transition-colors">
                GoKart
              </span>
              <span className="text-display text-lg md:text-xl text-orange-500">PartPicker</span>
            </div>
          </Link>

          {/* Desktop Navigation - Responsive with More Menu */}
          <div className="hidden md:flex lg:hidden items-center gap-1 flex-1 min-w-0 overflow-hidden justify-center max-w-none">
            {/* Show first 4 items on medium screens */}
            {navigation.slice(0, 4).map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap flex-shrink-0',
                    isActive 
                      ? 'text-orange-400' 
                      : 'text-cream-300 hover:text-orange-400'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* More Menu for remaining items */}
            <div className="relative flex-shrink-0" data-more-menu>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreMenuOpen(!moreMenuOpen);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap',
                  moreMenuOpen
                    ? 'text-orange-400'
                    : 'text-cream-300 hover:text-orange-400'
                )}
              >
                <MoreHorizontal className="w-4 h-4 flex-shrink-0" />
                <span>More</span>
              </button>
              
              {moreMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setMoreMenuOpen(false)} 
                  />
                  <div className="absolute left-0 top-full mt-2 w-48 bg-olive-800 border border-olive-600 rounded-lg shadow-xl z-20 overflow-hidden">
                    {navigation.slice(4).map((item) => {
                      const isActive = pathname === item.href || 
                        (item.href !== '/' && pathname.startsWith(item.href));
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors touch-manipulation',
                            isActive && 'text-orange-400 bg-olive-700'
                          )}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Large Desktop Navigation - Show all items */}
          <div className="hidden lg:flex items-center gap-1 flex-1 min-w-0 overflow-hidden justify-center max-w-none">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap flex-shrink-0',
                    isActive 
                      ? 'text-orange-400' 
                      : 'text-cream-300 hover:text-orange-400'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile Actions - Minimal: Only essential buttons */}
          <div className="flex md:hidden items-center gap-0.5 flex-shrink-0 ml-auto min-w-0 max-w-none">
            {/* Search Icon Button - Mobile (compact) */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center justify-center w-9 h-9 text-cream-200 hover:text-orange-400 rounded-lg hover:bg-olive-800 active:bg-olive-700 transition-colors touch-manipulation flex-shrink-0"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            
            {/* User Profile - Mobile (shares same ref and dropdown as desktop) */}
            {!isActuallyLoading && isAuthenticated && (
              <div className="relative flex-shrink-0">
                <button
                  ref={userMenuButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Calculate position immediately before toggling
                    calculateMenuPosition();
                    setUserMenuOpen((prev) => !prev);
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500 text-cream-100 font-bold text-xs hover:bg-orange-400 active:bg-orange-600 transition-colors touch-manipulation cursor-pointer"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user?.email?.[0].toUpperCase()}
                </button>
              </div>
            )}
          </div>

          {/* Search & Auth Section - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
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
                  ref={userMenuButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Calculate position immediately before toggling
                    calculateMenuPosition();
                    setUserMenuOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cream-200 hover:text-orange-400 rounded-md hover:bg-olive-800 transition-colors whitespace-nowrap cursor-pointer"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-cream-100 font-bold flex-shrink-0">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform flex-shrink-0',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>
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
          
          {/* Mobile Menu Button - Compact */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 text-cream-200 hover:text-orange-400 rounded-lg hover:bg-olive-800 active:bg-olive-700 transition-colors touch-manipulation flex-shrink-0"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Search Modal */}
        <SearchModal 
          isOpen={searchModalOpen} 
          onClose={() => setSearchModalOpen(false)} 
        />
        
        {/* User Menu Dropdown - Rendered as Portal (works for both desktop and mobile) */}
        {mounted && userMenuOpen && isAuthenticated && userMenuPosition.current && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUserMenuOpen(false);
              }} 
              aria-hidden="true"
            />
            <div 
              className="fixed bg-olive-800 border border-olive-600 rounded-lg shadow-xl z-[9999] overflow-hidden"
              style={{
                top: `${userMenuPosition.current.top}px`,
                right: `${userMenuPosition.current.right}px`,
                width: '14rem',
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                // Prevent the backdrop click from closing when clicking inside
                e.stopPropagation();
              }}
            >
              {/* User email header - only on mobile */}
              <div className="md:hidden px-4 py-3 border-b border-olive-600">
                <p className="text-sm font-medium text-cream-100 truncate">{user?.email}</p>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors touch-manipulation"
                onClick={() => setUserMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
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
              {!adminLoading && isAdmin && (
                impersonating ? (
                  <button
                    onClick={handleExitViewAs}
                    className="flex items-center gap-2 w-full px-4 py-3 min-h-[44px] text-sm text-amber-400 hover:bg-olive-700 hover:text-amber-300 transition-colors border-t border-olive-600 touch-manipulation text-left"
                  >
                    <UserX className="w-4 h-4" />
                    Exit view-as
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleViewAsNormalUser}
                    disabled={viewAsLoading}
                    className="flex items-center gap-2 w-full px-4 py-3 min-h-[44px] text-sm text-orange-400 hover:bg-olive-700 hover:text-orange-300 transition-colors border-t border-olive-600 touch-manipulation text-left disabled:opacity-50"
                  >
                    <UserCog className="w-4 h-4" />
                    {viewAsLoading ? '…' : 'View as normal user'}
                  </button>
                )
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
          </>,
          document.body
        )}
        
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {/* Search Button in Menu - For easy access */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-olive-800 hover:bg-olive-700 rounded-lg transition-colors touch-manipulation min-h-[48px]"
              >
                <Search className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span className="text-cream-200 font-medium">Search engines, parts...</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 text-base font-medium uppercase tracking-wide rounded-lg transition-colors touch-manipulation min-h-[48px]',
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
              <div className="space-y-1.5">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 text-base font-medium uppercase tracking-wide text-cream-200 hover:text-orange-400 hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[48px] active:bg-olive-700"
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/builds"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 text-base font-medium uppercase tracking-wide text-cream-200 hover:text-orange-400 hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[48px] active:bg-olive-700"
                >
                  <Bookmark className="w-5 h-5 flex-shrink-0" />
                  <span>Saved Builds</span>
                </Link>
                {!adminLoading && isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-base font-medium uppercase tracking-wide text-orange-400 hover:text-orange-300 hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[48px] active:bg-olive-700"
                  >
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                {!adminLoading && isAdmin && (impersonating ? (
                  <button
                    type="button"
                    onClick={handleExitViewAs}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-base font-medium uppercase tracking-wide text-amber-400 hover:text-amber-300 hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[48px] active:bg-olive-700 text-left"
                  >
                    <UserX className="w-5 h-5 flex-shrink-0" />
                    <span>Exit view-as</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); void handleViewAsNormalUser(); }}
                    disabled={viewAsLoading}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-base font-medium uppercase tracking-wide text-orange-400 hover:text-orange-300 hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[48px] active:bg-olive-700 text-left disabled:opacity-50"
                    >
                      <UserCog className="w-5 h-5 flex-shrink-0" />
                      <span>{viewAsLoading ? '…' : 'View as normal user'}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-base font-medium uppercase tracking-wide text-cream-200 hover:text-[var(--error)] hover:bg-olive-800 rounded-lg transition-colors touch-manipulation min-h-[48px] active:bg-olive-700"
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
                  <Button variant="secondary" size="lg" className="w-full touch-manipulation min-h-[48px]">
                    Login
                  </Button>
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="lg" className="w-full touch-manipulation min-h-[48px]">
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
