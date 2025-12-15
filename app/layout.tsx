import type { Metadata } from 'next'
import { Oswald, Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import SessionProvider from '@/components/SessionProvider'
import AuthNav from '@/components/AuthNav'
import ThemeProvider from '@/components/ThemeProvider'
import SmartSearch from '@/components/SmartSearch'
import Logo from '@/components/Logo'
import MobileNav from '@/components/MobileNav'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GoKart Part Picker',
  description: 'Build and customize your go-kart engine with the right parts',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#1a1a1a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <header className="bg-garage-dark dark:bg-gray-900 text-white relative overflow-visible">
              {/* Top Bar: Logo + User Actions */}
              <div className="bg-garage-dark dark:bg-gray-900 px-4 py-2 border-b border-gray-700">
                <div className="container mx-auto flex justify-between items-center min-h-[70px]">
                  <div className="relative z-20 -mt-8 -mb-8">
                    <Logo priority width={560} height={224} />
                  </div>
                  <div className="flex gap-2 sm:gap-4 items-center relative z-10 ml-auto">
                    <AuthNav />
                    <MobileNav />
                  </div>
                </div>
              </div>
              
              {/* Bottom Bar: Main Navigation (Desktop Only) */}
              <nav className="hidden lg:block bg-garage-dark dark:bg-gray-900 px-4 py-3">
                <div className="container mx-auto flex justify-between items-center">
                  <div className="flex gap-6 items-center">
                    <Link href="/build" className="flex items-center gap-2 hover:text-garage-orange transition">
                      <span>🔧</span>
                      <span>Builder</span>
                    </Link>
                    <Link href="/parts" className="flex items-center gap-2 hover:text-garage-orange transition">
                      <span>⚙️</span>
                      <span>Products</span>
                    </Link>
                    <Link href="/guides" className="flex items-center gap-2 hover:text-garage-orange transition">
                      <span>📖</span>
                      <span>Guides</span>
                    </Link>
                    <Link href="/engines" className="flex items-center gap-2 hover:text-garage-orange transition">
                      <span>🏁</span>
                      <span>Engines</span>
                    </Link>
                    <Link href="/store" className="flex items-center gap-2 hover:text-garage-orange transition">
                      <span>🛒</span>
                      <span>Store</span>
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <SmartSearch />
                  </div>
                </div>
              </nav>
            </header>
            <main className="min-h-screen bg-garage-cream dark:bg-gray-800">{children}</main>
            <footer className="bg-garage-dark dark:bg-gray-900 text-white p-8 mt-12">
              <div className="container mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <h3 className="font-heading font-bold text-garage-orange mb-4">Engines</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/engines" className="hover:text-garage-orange transition">
                          Browse All
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/engines/predator-212-hemi"
                          className="hover:text-garage-orange transition"
                        >
                          Predator 212 Hemi
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/engines/predator-212-ghost"
                          className="hover:text-garage-orange transition"
                        >
                          Predator 212 Ghost
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-garage-orange mb-4">Learn</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/learn" className="hover:text-garage-orange transition">
                          All Topics
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/learn/ignition-timing"
                          className="hover:text-garage-orange transition"
                        >
                          Ignition Timing
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/learn/ignition-timing/calculator"
                          className="hover:text-garage-orange transition"
                        >
                          Timing Calculator
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-garage-orange mb-4">Tools</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/build" className="hover:text-garage-orange transition">
                          Build Planner
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/learn/ignition-timing/calculator"
                          className="hover:text-garage-orange transition"
                        >
                          Timing Calculator
                        </Link>
                      </li>
                      <li>
                        <Link href="/parts" className="hover:text-garage-orange transition">
                          Parts Catalog
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-garage-orange mb-4">Company</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/store" className="hover:text-garage-orange transition">
                          Store
                        </Link>
                      </li>
                      <li>
                        <Link href="/guides" className="hover:text-garage-orange transition">
                          Guides
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="hover:text-garage-orange transition">
                          About
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className="hover:text-garage-orange transition">
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Logo width={360} height={144} className="opacity-80 hover:opacity-100 transition" />
                    <p className="text-gray-400 text-sm">&copy; 2024 GoKart Part Picker. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </footer>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

