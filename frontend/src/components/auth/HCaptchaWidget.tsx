'use client';

import { useCallback } from 'react';
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
}

export function HCaptchaWidget({
  captchaRef,
  onVerify,
  onExpire,
  theme = 'dark',
}: HCaptchaWidgetProps) {
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

  return (
    <div className="flex justify-center [&_iframe]:max-w-full">
      <HCaptcha
        ref={captchaRef}
        sitekey={SITEKEY}
        onVerify={handleVerify}
        onExpire={handleExpire}
        theme={theme}
      />
    </div>
  );
}
