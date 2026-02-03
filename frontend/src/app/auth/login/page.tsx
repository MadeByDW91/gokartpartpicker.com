'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { secureSignIn, getIsAdmin } from '@/actions/auth-secure';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  HCaptchaWidget,
  useCaptchaEnabled,
  type HCaptchaRef,
} from '@/components/auth/HCaptchaWidget';
import { createClient } from '@/lib/supabase/client';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const router = useRouter();
  const captchaEnabled = useCaptchaEnabled();
  const captchaRef = useRef<HCaptchaRef>(null);
  const supabase = createClient();

  const { signInWithMagicLink, user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  // Redirect if user is already logged in: admins → /admin, others → redirectTo
  useEffect(() => {
    if (authLoading || adminLoading || !user) return;
    router.replace(isAdmin ? '/admin' : redirectTo);
  }, [user, authLoading, adminLoading, isAdmin, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
        setLoading(false);
      } else {
        if (captchaEnabled && !captchaToken) {
          setError('Please complete the verification challenge before signing in.');
          setLoading(false);
          return;
        }

        // Phase 1 Security: Use secure login with lockout protection
        const result = await secureSignIn(
          email,
          password,
          captchaToken ?? undefined
        );

        if (!result.success) {
          if (captchaEnabled) {
            setCaptchaToken(null);
            captchaRef.current?.resetCaptcha();
          }
          setError(result.error || 'Login failed');
          setLoading(false);
          return;
        }

        // If email verification required, show message
        if (result.data?.requiresEmailVerification) {
          setError(
            'Please verify your email address before logging in. Check your inbox for the verification link.'
          );
          setLoading(false);
          return;
        }

        // Success - session cookies are set by Supabase server action
        // The server action sets cookies via the server client, but the client-side
        // browser client needs to read those cookies. A full page reload ensures
        // all cookies are read and all hooks re-initialize with the new session.
        setLoading(false);
        
        // Small delay to ensure server response and cookies are fully set
        // Then force a full page reload to ensure session cookies are read
        // This is necessary because server actions set cookies server-side,
        // and the client-side Supabase client needs to read them on page load
        await new Promise(resolve => setTimeout(resolve, 150));
        window.location.href = redirectTo;
      }
    } catch (err) {
      if (mode === 'password' && captchaEnabled) {
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };
  
  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-[rgba(74,124,89,0.2)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[var(--success)]" />
            </div>
            <h2 className="text-display text-2xl text-cream-100 mb-2">Check Your Email</h2>
            <p className="text-cream-400 mb-6">
              We&apos;ve sent a magic link to <span className="text-cream-200">{email}</span>. 
              Click the link to sign in.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setMagicLinkSent(false);
                setEmail('');
              }}
            >
              Try Different Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-olive-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo - canonical brand iconmark */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="relative w-10 h-10 rounded-lg border-2 border-orange-500 flex-shrink-0 overflow-hidden">
              <Image
                src="/brand/brand-iconmark-v1.svg"
                alt=""
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <span className="text-display text-2xl text-cream-100">GoKart</span>
              <span className="text-display text-2xl text-orange-500">PartPicker</span>
            </div>
          </Link>
          <h1 className="text-display text-3xl text-cream-100">Welcome Back</h1>
          <p className="text-cream-400 mt-2">Sign in to access your dashboard</p>
        </div>
        
        <Card className="animate-fade-in">
          <CardHeader>
            {/* Mode Tabs */}
            <div className="flex bg-olive-600 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('password');
                  setError('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'password'
                    ? 'bg-olive-700 text-cream-100'
                    : 'text-cream-400 hover:text-cream-200'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('magic');
                  setCaptchaToken(null);
                  setError('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'magic'
                    ? 'bg-olive-700 text-cream-100'
                    : 'text-cream-400 hover:text-cream-200'
                }`}
              >
                Magic Link
              </button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              
              {mode === 'password' && (
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
              )}

              {mode === 'password' && captchaEnabled && (
                <div>
                  <HCaptchaWidget
                    captchaRef={captchaRef}
                    onVerify={setCaptchaToken}
                    onExpire={() => setCaptchaToken(null)}
                    theme="dark"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-[var(--error)] bg-[rgba(166,61,64,0.1)] p-3 rounded-md">
                  {error}
                </p>
              )}
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {mode === 'magic' ? 'Send Magic Link' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-cream-400">
                Don&apos;t have an account?{' '}
                <Link 
                  href={`/auth/register${redirectTo !== '/dashboard' ? `?redirect=${redirectTo}` : ''}`}
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
