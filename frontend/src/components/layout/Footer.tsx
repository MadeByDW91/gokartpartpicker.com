import Link from 'next/link';
import { Cog, Package, Wrench, Github, Mail } from 'lucide-react';

const footerLinks = {
  browse: [
    { name: 'Engines', href: '/engines', icon: Cog },
    { name: 'Parts', href: '/parts', icon: Package },
    { name: 'Builder', href: '/builder', icon: Wrench },
  ],
  categories: [
    { name: 'Clutches', href: '/parts?category=clutch' },
    { name: 'Torque Converters', href: '/parts?category=torque_converter' },
    { name: 'Chains & Sprockets', href: '/parts?category=chain' },
    { name: 'Wheels & Tires', href: '/parts?category=wheel' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-olive-900 border-t border-olive-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-display text-2xl text-cream-100">GoKart</span>
              <span className="text-display text-2xl text-orange-500">PartPicker</span>
            </Link>
            <p className="text-cream-400 text-sm leading-relaxed mb-4">
              Build your ultimate go-kart with compatible parts. Our compatibility checker ensures every part works together.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-800 rounded-md transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@gokartpartpicker.com"
                className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-800 rounded-md transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Browse */}
          <div>
            <h3 className="text-display text-sm text-cream-100 mb-4">Browse</h3>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-cream-400 hover:text-orange-400 transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-display text-sm text-cream-100 mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-400 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-display text-sm text-cream-100 mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-400 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-olive-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-sm text-cream-400">
              © {currentYear} GoKartPartPicker.com. All rights reserved.
            </p>
            <Link href="/privacy" className="text-xs text-cream-400/60 hover:text-orange-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-cream-400/60 hover:text-orange-400 transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="text-center">
            <p className="text-xs text-cream-400/60">
              <strong className="text-cream-300">Affiliate Disclosure:</strong> As an Amazon Associate, 
              we earn from qualifying purchases. When you click on affiliate links and make a purchase, 
              we may receive a commission at no additional cost to you.{' '}
              <Link href="/privacy#affiliate" className="underline hover:text-orange-400">
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
