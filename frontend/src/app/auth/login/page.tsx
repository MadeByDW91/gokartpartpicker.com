'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Wrench, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/builds';
  
  const { signIn, signInWithMagicLink, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Wrench className="w-10 h-10 text-orange-400" />
            <div>
              <span className="text-display text-2xl text-cream-100">GoKart</span>
              <span className="text-display text-2xl text-orange-500">PartPicker</span>
            </div>
          </Link>
          <h1 className="text-display text-3xl text-cream-100">Welcome Back</h1>
          <p className="text-cream-400 mt-2">Sign in to access your saved builds</p>
        </div>
        
        <Card className="animate-fade-in">
          <CardHeader>
            {/* Mode Tabs */}
            <div className="flex bg-olive-600 rounded-lg p-1">
              <button
                onClick={() => setMode('password')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'password' 
                    ? 'bg-olive-700 text-cream-100' 
                    : 'text-cream-400 hover:text-cream-200'
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setMode('magic')}
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
                  href={`/auth/register${redirectTo !== '/builds' ? `?redirect=${redirectTo}` : ''}`}
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
