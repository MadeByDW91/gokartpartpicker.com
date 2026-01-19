'use client';

import { useState } from 'react';
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
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <Card className="absolute right-0 mt-2 w-56 z-50">
        <CardHeader className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-semibold text-cream-100">Share</h3>
          <button onClick={onClose} className="text-cream-400 hover:text-cream-100">
            <X className="w-4 h-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Native Share (if available) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={() => onShare('native')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 rounded-md transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share...
            </button>
          )}

          {/* Twitter */}
          <button
            onClick={() => onShare('twitter')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-blue-400 rounded-md transition-colors"
          >
            <Twitter className="w-4 h-4" />
            Twitter/X
          </button>

          {/* Facebook */}
          <button
            onClick={() => onShare('facebook')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-blue-500 rounded-md transition-colors"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </button>

          {/* Email */}
          <button
            onClick={() => onShare('email')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 rounded-md transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>

          {/* Copy Link */}
          <button
            onClick={onCopy}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 rounded-md transition-colors border-t border-olive-600"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </CardContent>
      </Card>
    </>
  );
}
