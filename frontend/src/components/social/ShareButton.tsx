'use client';

import { useState, useEffect } from 'react';
import { useSwipe } from '@/hooks/use-swipe';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Share2,
  Twitter,
  Facebook,
  Mail,
  Link as LinkIcon,
  Copy,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  shareContent,
  shareToTwitter,
  shareToFacebook,
  shareViaEmail,
  type ShareOptions,
} from '@/lib/social-sharing';

interface ShareButtonProps {
  options: ShareOptions;
  variant?: 'default' | 'icon' | 'dropdown';
  className?: string;
}

export function ShareButton({ options, variant = 'default', className }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Prevent body scroll when mobile bottom sheet is open
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMenu]);

  const handleNativeShare = async () => {
    const success = await shareContent(options);
    if (success) {
      setShowMenu(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(options.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = (platform: string) => {
    switch (platform) {
      case 'twitter':
        shareToTwitter(options);
        break;
      case 'facebook':
        shareToFacebook(options);
        break;
      case 'email':
        shareViaEmail(options);
        break;
      case 'native':
        handleNativeShare();
        break;
    }
    setShowMenu(false);
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          icon={<Share2 className="w-4 h-4" />}
          className={className}
        />
        {showMenu && <ShareMenu options={options} onClose={() => setShowMenu(false)} onShare={handleShare} onCopy={handleCopyLink} copied={copied} />}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <Button
          variant="secondary"
          onClick={() => setShowMenu(!showMenu)}
          icon={<Share2 className="w-4 h-4" />}
          className={className}
        >
          Share
        </Button>
        {showMenu && <ShareMenu options={options} onClose={() => setShowMenu(false)} onShare={handleShare} onCopy={handleCopyLink} copied={copied} />}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="primary"
        onClick={() => setShowMenu(!showMenu)}
        icon={<Share2 className="w-4 h-4" />}
        className={className}
      >
        Share
      </Button>
      {showMenu && <ShareMenu options={options} onClose={() => setShowMenu(false)} onShare={handleShare} onCopy={handleCopyLink} copied={copied} />}
    </div>
  );
}

interface ShareMenuProps {
  options: ShareOptions;
  onClose: () => void;
  onShare: (platform: string) => void;
  onCopy: () => void;
  copied: boolean;
}

function ShareMenu({ options, onClose, onShare, onCopy, copied }: ShareMenuProps) {
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
  
  // Swipe down to dismiss bottom sheet on mobile
  const { ref: swipeRef } = useSwipe({
    onSwipeDown: () => {
      if (window.innerWidth < 768) {
        onClose();
      }
    },
    threshold: 100,
  });
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Desktop: Dropdown Menu */}
      <Card className="hidden md:block absolute right-0 mt-2 w-56 z-50">
        <CardHeader className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-semibold text-cream-100">Share</h3>
          <button 
            onClick={onClose} 
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded-md transition-colors touch-manipulation"
            aria-label="Close share menu"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Native Share (if available) */}
          {hasNativeShare && (
            <button
              onClick={() => onShare('native')}
              className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 rounded-md transition-colors touch-manipulation"
            >
              <Share2 className="w-4 h-4" />
              Share...
            </button>
          )}

          {/* Twitter */}
          <button
            onClick={() => onShare('twitter')}
            className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-blue-400 rounded-md transition-colors touch-manipulation"
          >
            <Twitter className="w-4 h-4" />
            Twitter/X
          </button>

          {/* Facebook */}
          <button
            onClick={() => onShare('facebook')}
            className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-blue-500 rounded-md transition-colors touch-manipulation"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </button>

          {/* Email */}
          <button
            onClick={() => onShare('email')}
            className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 rounded-md transition-colors touch-manipulation"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>

          {/* Copy Link */}
          <button
            onClick={onCopy}
            className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 rounded-md transition-colors border-t border-olive-600 touch-manipulation"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </CardContent>
      </Card>

      {/* Mobile: Bottom Sheet */}
      <div 
        ref={swipeRef as React.RefObject<HTMLDivElement>}
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-olive-800 border-t border-olive-600 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out safe-area-bottom touch-pan-y"
      >
        <div className="p-4">
          {/* Handle Bar */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-olive-600 rounded-full" />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cream-100">Share</h3>
            <button 
              onClick={onClose} 
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 hover:bg-olive-700 rounded-md transition-colors touch-manipulation"
              aria-label="Close share menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Share Options */}
          <div className="space-y-2 pb-4">
            {/* Native Share (prioritized on mobile) */}
            {hasNativeShare && (
              <button
                onClick={() => onShare('native')}
                className="w-full flex items-center gap-4 px-4 py-4 min-h-[56px] text-base font-medium text-cream-100 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-colors touch-manipulation active:bg-orange-500/30"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-orange-400" />
                </div>
                <span className="flex-1 text-left">Share via...</span>
                <ChevronRight className="w-5 h-5 text-cream-400" />
              </button>
            )}

            {/* Social Platforms Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {/* Twitter */}
              <button
                onClick={() => onShare('twitter')}
                className="flex flex-col items-center justify-center gap-2 px-3 py-4 min-h-[80px] bg-olive-700/50 hover:bg-olive-700 border border-olive-600 rounded-xl transition-colors touch-manipulation active:bg-olive-600"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs text-cream-300">Twitter</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => onShare('facebook')}
                className="flex flex-col items-center justify-center gap-2 px-3 py-4 min-h-[80px] bg-olive-700/50 hover:bg-olive-700 border border-olive-600 rounded-xl transition-colors touch-manipulation active:bg-olive-600"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs text-cream-300">Facebook</span>
              </button>

              {/* Email */}
              <button
                onClick={() => onShare('email')}
                className="flex flex-col items-center justify-center gap-2 px-3 py-4 min-h-[80px] bg-olive-700/50 hover:bg-olive-700 border border-olive-600 rounded-xl transition-colors touch-manipulation active:bg-olive-600"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-xs text-cream-300">Email</span>
              </button>
            </div>

            {/* Copy Link - Full Width */}
            <button
              onClick={onCopy}
              className="w-full flex items-center gap-4 px-4 py-4 min-h-[56px] text-base font-medium text-cream-100 bg-olive-700/50 hover:bg-olive-700 border border-olive-600 rounded-xl transition-colors touch-manipulation active:bg-olive-600 mt-2"
            >
              <div className="w-10 h-10 rounded-lg bg-olive-600 flex items-center justify-center">
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-cream-300" />
                )}
              </div>
              <span className="flex-1 text-left">{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
