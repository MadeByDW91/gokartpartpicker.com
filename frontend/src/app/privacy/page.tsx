import { Metadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for GoKartPartPicker.com - How we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-8 h-8 text-orange-400" />
            <h1 className="text-display text-3xl sm:text-4xl text-cream-100">
              Privacy Policy
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
              <h2 className="text-display text-xl text-cream-100">Introduction</h2>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-cream-300">
                GoKartPartPicker.com ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-400" />
                <h2 className="text-display text-xl text-cream-100">Information We Collect</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Information You Provide</h3>
                <ul className="list-disc list-inside space-y-1 text-cream-300 ml-4">
                  <li>Account information (username, email address) when you register</li>
                  <li>Build data and saved configurations</li>
                  <li>Communication data when you contact us</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-1 text-cream-300 ml-4">
                  <li>IP address and browser information</li>
                  <li>Usage data and page views</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-400" />
                <h2 className="text-display text-xl text-cream-100">How We Use Your Information</h2>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-cream-300 ml-4">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </CardContent>
          </Card>

          {/* Affiliate Relationships */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <h2 className="text-display text-xl text-cream-100">Affiliate Relationships</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-cream-300">
                GoKartPartPicker.com participates in various affiliate marketing programs, including the 
                Amazon Associates Program. This means we may earn commissions from qualifying purchases 
                made through affiliate links on our site.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Amazon Associates Program</h3>
                <p className="text-cream-300 mb-2">
                  As an Amazon Associate, we earn from qualifying purchases. When you click on links 
                  to Amazon products on our site and make a purchase, we may receive a commission at 
                  no additional cost to you.
                </p>
                <p className="text-cream-300">
                  Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Other Affiliate Programs</h3>
                <p className="text-cream-300">
                  We may also participate in other affiliate programs. All affiliate links are clearly 
                  disclosed, and we only recommend products we believe will be valuable to our users.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Cookies and Tracking Technologies</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our service and 
                hold certain information. Cookies are files with a small amount of data which may include 
                an anonymous unique identifier.
              </p>
              <p className="text-cream-300">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being 
                sent. However, if you do not accept cookies, you may not be able to use some portions of 
                our service.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Data Security</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300">
                We use commercially reasonable security measures to protect your information. However, 
                no method of transmission over the Internet or electronic storage is 100% secure. While 
                we strive to use commercially acceptable means to protect your personal information, we 
                cannot guarantee its absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Your Privacy Rights</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300 mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-cream-300 ml-4">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to delete your personal information</li>
                <li>The right to opt-out of certain data processing activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Changes to This Privacy Policy</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300">
                We may update our Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <h2 className="text-display text-xl text-cream-100">Contact Us</h2>
            </CardHeader>
            <CardContent>
              <p className="text-cream-300 mb-2">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-cream-300">
                Email: <a href="mailto:privacy@gokartpartpicker.com" className="text-orange-400 hover:text-orange-300">privacy@gokartpartpicker.com</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
