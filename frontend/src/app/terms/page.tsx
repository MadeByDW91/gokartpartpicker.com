import { Metadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { FileText, Scale, AlertTriangle, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for GoKartPartPicker.com - Rules and guidelines for using our platform.',
};

export default function TermsOfServicePage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-olive-900">
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-8 h-8 text-orange-400" />
            <h1 className="text-display text-3xl sm:text-4xl text-cream-100">
              Terms of Service
            </h1>
          </div>
          <p className="text-cream-400">
            Last Updated: {currentDate}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Agreement to Terms</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300">
                By accessing or using GoKartPartPicker.com ("the Service"), you agree to be bound by 
                these Terms of Service. If you disagree with any part of these terms, you may not 
                access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Use of Service */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h2 className="text-display text-xl text-cream-100">Use of Service</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Permitted Use</h3>
                <p className="text-cream-300 mb-2">
                  You may use our Service to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-cream-300 ml-4">
                  <li>Browse engines and parts catalogs</li>
                  <li>Create and save build configurations</li>
                  <li>Share your builds with others</li>
                  <li>Access compatibility information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Prohibited Use</h3>
                <p className="text-cream-300 mb-2">
                  You may not:
                </p>
                <ul className="list-disc list-inside space-y-1 text-cream-300 ml-4">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Scrape or harvest data from the Service</li>
                  <li>Use automated systems to access the Service</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Affiliate Disclosure */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <h2 className="text-display text-xl text-cream-100">Affiliate Relationships</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-cream-300">
                GoKartPartPicker.com participates in affiliate marketing programs, including the 
                Amazon Associates Program. This means we may earn commissions from qualifying purchases 
                made through affiliate links on our site.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Amazon Associates Program</h3>
                <p className="text-cream-300 mb-2">
                  As an Amazon Associate, we earn from qualifying purchases. When you click on links 
                  to Amazon products and make a purchase, we may receive a commission at no additional 
                  cost to you.
                </p>
                <p className="text-cream-300">
                  <strong className="text-cream-100">Important:</strong> Product prices and availability 
                  are accurate as of the date/time indicated and are subject to change. Any price and 
                  availability information displayed on our site at the time of purchase will apply to 
                  the purchase of the product.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Disclosure</h3>
                <p className="text-cream-300">
                  All affiliate links are clearly disclosed. We only recommend products we believe will 
                  be valuable to our users. Your use of affiliate links is voluntary, and you are not 
                  obligated to make purchases through our links.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h2 className="text-display text-xl text-cream-100">Disclaimers</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Product Information</h3>
                <p className="text-cream-300">
                  We strive to provide accurate product information, specifications, and compatibility 
                  data. However, we do not warrant that product descriptions, prices, or other content 
                  on the Service is accurate, complete, reliable, current, or error-free.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Compatibility Information</h3>
                <p className="text-cream-300">
                  Compatibility information is provided as a guide based on technical specifications. 
                  We recommend verifying compatibility with manufacturers before making purchases. We 
                  are not responsible for compatibility issues that may arise.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Third-Party Links</h3>
                <p className="text-cream-300">
                  Our Service may contain links to third-party websites or services that are not owned 
                  or controlled by us. We have no control over, and assume no responsibility for, the 
                  content, privacy policies, or practices of any third-party websites or services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Limitation of Liability</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300">
                In no event shall GoKartPartPicker.com, its directors, employees, partners, agents, 
                suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from your use of the Service.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Changes to Terms</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any 
                time. If a revision is material, we will provide at least 30 days notice prior to any 
                new terms taking effect.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Contact Information</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300 mb-2">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <p className="text-cream-300">
                Email: <a href="mailto:legal@gokartpartpicker.com" className="text-orange-400 hover:text-orange-300">legal@gokartpartpicker.com</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
