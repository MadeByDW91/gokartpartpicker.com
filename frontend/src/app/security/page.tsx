import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security & Responsible Disclosure',
  description: 'Rules of engagement for security testing and how to report vulnerabilities.',
};

export default function SecurityPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gokartpartpicker.com';

  return (
    <main className="min-h-screen bg-olive-950 text-cream-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100">
          Security & Responsible Disclosure
        </h1>
        <p className="mt-2 text-cream-300">
          Rules of engagement for security testing. We appreciate researchers who help us improve.
        </p>

        <section className="mt-10 space-y-6">
          <h2 className="font-display text-xl font-semibold text-cream-100">In scope</h2>
          <ul className="list-inside list-disc space-y-2 text-cream-300">
            <li>Web application: {baseUrl}</li>
            <li>Authentication and authorization (login, signup, password reset, sessions)</li>
            <li>Public and authenticated API routes</li>
            <li>Forums, builds, and user-generated content</li>
            <li>Admin interface access controls</li>
          </ul>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="font-display text-xl font-semibold text-cream-100">Out of scope</h2>
          <ul className="list-inside list-disc space-y-2 text-cream-300">
            <li>Denial of service (DoS / DDoS) or resource exhaustion</li>
            <li>Attacks against real users (e.g. social engineering, phishing)</li>
            <li>Physical attacks or attempts to access hosting/infra outside the app</li>
            <li>Third-party services (Supabase, Vercel, Amazon, etc.) outside our configuration</li>
            <li>Automated mass scanning without prior coordination</li>
          </ul>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="font-display text-xl font-semibold text-cream-100">How to report</h2>
          <p className="text-cream-300">
            Please report vulnerabilities to{' '}
            <a
              href="mailto:security@gokartpartpicker.com"
              className="text-orange-400 underline hover:text-orange-300"
            >
              security@gokartpartpicker.com
            </a>
            . Include steps to reproduce, impact, and any proof-of-concept. We will respond
            and work with you before any public disclosure.
          </p>
        </section>

        <section className="mt-10">
          <p className="text-sm text-cream-400">
            Machine-readable policy:{' '}
            <a
              href="/.well-known/security.txt"
              className="text-orange-400 underline hover:text-orange-300"
            >
              /.well-known/security.txt
            </a>
          </p>
        </section>

        <div className="mt-12">
          <Link
            href="/"
            className="text-orange-400 underline hover:text-orange-300"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
