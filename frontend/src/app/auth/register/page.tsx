'use client';

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Mail, Lock, User, ArrowRight, Check, Loader2, RefreshCw } from 'lucide-react';
import { resendVerificationEmail } from '@/actions/auth';
import {
  HCaptchaWidget,
  useCaptchaEnabled,
  type HCaptchaRef,
} from '@/components/auth/HCaptchaWidget';

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const captchaEnabled = useCaptchaEnabled();
  const captchaRef = useRef<HCaptchaRef>(null);

  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Strong password validation (12+ chars, complexity)
    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    
    // Check password complexity
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>\[\]\\\/_\-+=~`]/.test(password);
    
    if (!hasUpper) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!hasLower) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!hasNumber) {
      setError('Password must contain at least one number');
      return;
    }
    if (!hasSpecial) {
      setError('Password must contain at least one special character (!@#$%^&*, etc.)');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setError('Please complete the verification challenge before signing up.');
      return;
    }

    try {
      await signUp(email, password, username, captchaToken ?? undefined);
      setSuccess(true);
    } catch (err) {
      if (captchaEnabled) {
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      }
      // Don't log full error with PII - use sanitized logging
      let errorMessage = 'An error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const supabaseError = err as { message?: string; error?: string };
        errorMessage = supabaseError.message || supabaseError.error || errorMessage;
      }
      if (
        errorMessage.toLowerCase().includes('database error saving new user')
      ) {
        errorMessage =
          'Account creation failed (database trigger). Run migration 20260124000001_fix_handle_new_user_registration.sql in Supabase SQL Editor. See HOW-TO-RUN-MIGRATIONS.md.';
      }
      setError(errorMessage);
    }
  };
  
  const handleResendEmail = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setResendSuccess(false);
    setError('');
    
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        setResendSuccess(true);
      } else {
        setError(result.error || 'Failed to resend email');
      }
    } catch (err) {
      setError('An error occurred while sending the email');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-[rgba(74,124,89,0.2)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-display text-2xl text-cream-100 mb-2">Check Your Email!</h2>
            <p className="text-cream-400 mb-4">
              We've sent a verification email to:
            </p>
            <p className="text-orange-400 font-medium mb-6 break-all px-4">
              {email}
            </p>
            <div className="bg-olive-800/50 border border-olive-600 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-cream-300 mb-2 font-medium">Next steps:</p>
              <ol className="text-sm text-cream-400 space-y-1 list-decimal list-inside">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here to log in</li>
              </ol>
            </div>
            
            {resendSuccess && (
              <div className="mb-4 p-3 bg-[rgba(74,124,89,0.2)] border border-[rgba(74,124,89,0.4)] rounded-lg">
                <p className="text-sm text-[#6fa87e]">
                  <Check className="w-4 h-4 inline mr-1" />
                  Verification email sent! Check your inbox.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                {resendLoading ? 'Sending...' : "Didn't receive the email? Resend"}
              </button>
              
              <Link href="/auth/login" className="block">
                <Button variant="primary" className="w-full">
                  Go to Login
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            {error && (
              <p className="mt-4 text-sm text-[var(--error)] bg-[rgba(166,61,64,0.1)] p-3 rounded-md">
                {error}
              </p>
            )}
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
          <h1 className="text-display text-3xl text-cream-100">Create Account</h1>
          <p className="text-cream-400 mt-2">Join the community and save your builds</p>
        </div>
        
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="gokart_builder"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              
              <div className="text-xs text-cream-400 space-y-1">
                <p className="font-medium">Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>At least 12 characters</li>
                  <li>One uppercase letter (A-Z)</li>
                  <li>One lowercase letter (a-z)</li>
                  <li>One number (0-9)</li>
                  <li>One special character (!@#$%^&*, etc.)</li>
                </ul>
              </div>

              {captchaEnabled && (
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
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-cream-400">
                Already have an account?{' '}
                <Link 
                  href={`/auth/login${redirectTo !== '/dashboard' ? `?redirect=${redirectTo}` : ''}`}
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
            
            <p className="mt-6 text-xs text-cream-400/60 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-cream-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-cream-300">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
