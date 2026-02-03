'use client';

import { useCallback, useState, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY?.trim() || '';

export function useCaptchaEnabled(): boolean {
  return !!SITEKEY;
}

export type HCaptchaRef = HCaptcha | null;

export interface HCaptchaWidgetProps {
  captchaRef: React.RefObject<HCaptchaRef>;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  /** Optional: force size. If not set, uses "compact" on mobile for better visibility. */
  size?: 'normal' | 'compact' | 'invisible';
}

const MOBILE_BREAKPOINT = 640;

export function HCaptchaWidget({
  captchaRef,
  onVerify,
  onExpire,
  theme = 'dark',
  size: sizeProp,
}: HCaptchaWidgetProps) {
  // Default to compact so mobile and SSR/first paint match; switch to normal on desktop after mount
  const [size, setSize] = useState<'normal' | 'compact'>('compact');

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`);
    const handler = () => setSize(mq.matches ? 'normal' : 'compact');
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleVerify = useCallback(
    (token: string) => {
      onVerify(token);
    },
    [onVerify]
  );

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  if (!SITEKEY) return null;

  const effectiveSize = sizeProp ?? size;

  return (
    <div
      className="flex flex-col items-center justify-center overflow-visible min-h-[84px] w-full"
      role="group"
      aria-label="Security verification"
    >
      <p className="text-xs text-cream-400 mb-2 text-center">
        Complete the security check below
      </p>
      <div className="flex justify-center overflow-visible w-full min-h-[60px] [&_iframe]:max-w-full [&_iframe]:!min-w-0">
        <HCaptcha
          ref={captchaRef}
          sitekey={SITEKEY}
          onVerify={handleVerify}
          onExpire={handleExpire}
          theme={theme}
          size={effectiveSize}
        />
      </div>
    </div>
  );
}
