import type { Metadata } from 'next'
import { Oswald, Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body>
        <nav className="bg-garage-dark text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-heading font-bold text-garage-orange">
              GoKart Part Picker
            </Link>
            <div className="flex gap-6">
              <Link href="/engines" className="hover:text-garage-orange">Engines</Link>
              <Link href="/parts" className="hover:text-garage-orange">Parts</Link>
              <Link href="/guides" className="hover:text-garage-orange">Guides</Link>
              <Link href="/build" className="hover:text-garage-orange">Build</Link>
              <Link href="/search" className="hover:text-garage-orange">Search</Link>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-garage-dark text-white p-8 mt-12">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 GoKart Part Picker. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

