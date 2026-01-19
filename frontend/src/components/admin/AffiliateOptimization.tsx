'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Link as LinkIcon,
  BarChart3
} from 'lucide-react';

export function AffiliateOptimization() {
  const bestPractices = [
    {
      title: 'Maximize Link Coverage',
      description: 'Aim for 100% coverage - every product should have an affiliate link',
      icon: Target,
      priority: 'high',
      tips: [
        'Add links to all engines and parts',
        'Use bulk import for efficiency',
        'Regularly audit for missing links',
      ],
    },
    {
      title: 'Optimize Link Placement',
      description: 'Place affiliate links in high-visibility areas',
      icon: LinkIcon,
      priority: 'high',
      tips: [
        'Add "Buy Now" buttons on product pages',
        'Include links in shopping lists',
        'Feature links in build comparisons',
      ],
    },
    {
      title: 'Track Performance',
      description: 'Monitor which products generate the most clicks',
      icon: BarChart3,
      priority: 'medium',
      tips: [
        'Use UTM parameters for tracking',
        'Monitor Amazon Associates dashboard',
        'Focus on high-performing categories',
      ],
    },
    {
      title: 'Maintain Link Health',
      description: 'Regularly check for broken or expired links',
      icon: CheckCircle,
      priority: 'high',
      tips: [
        'Run link health checks monthly',
        'Update expired product links',
        'Remove discontinued products',
      ],
    },
    {
      title: 'Diversify Programs',
      description: 'Don\'t rely on a single affiliate program',
      icon: DollarSign,
      priority: 'medium',
      tips: [
        'Use both Amazon and eBay',
        'Consider manufacturer affiliate programs',
        'Test different programs for best rates',
      ],
    },
    {
      title: 'Content Strategy',
      description: 'Create content that naturally includes affiliate links',
      icon: Lightbulb,
      priority: 'medium',
      tips: [
        'Write product comparison guides',
        'Create "best of" lists',
        'Include links in how-to articles',
      ],
    },
  ];

  const revenueTips = [
    {
      category: 'Conversion Optimization',
      items: [
        'Place affiliate links above the fold on product pages',
        'Use clear call-to-action buttons',
        'Show price comparisons to encourage clicks',
        'Add urgency with "Limited Time" messaging',
      ],
    },
    {
      category: 'SEO & Discovery',
      items: [
        'Optimize product pages for search engines',
        'Use long-tail keywords in product descriptions',
        'Create category landing pages with multiple links',
        'Build internal links between related products',
      ],
    },
    {
      category: 'User Experience',
      items: [
        'Make affiliate links clearly identifiable',
        'Provide value before asking for clicks',
        'Show product images and specifications',
        'Include user reviews and ratings',
      ],
    },
    {
      category: 'Compliance',
      items: [
        'Always include affiliate disclosures',
        'Use rel="sponsored" on affiliate links',
        'Follow Amazon Associates Operating Agreement',
        'Keep privacy policy and terms updated',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Best Practices */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-cream-100">Best Practices</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestPractices.map((practice, idx) => (
              <div
                key={idx}
                className="p-4 bg-olive-800/50 rounded-lg border border-olive-600"
              >
                <div className="flex items-start gap-3 mb-2">
                  <practice.icon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-cream-100">{practice.title}</h4>
                      <Badge
                        variant={practice.priority === 'high' ? 'error' : 'warning'}
                        className="text-xs"
                      >
                        {practice.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-cream-400 mb-2">{practice.description}</p>
                    <ul className="space-y-1">
                      {practice.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="text-xs text-cream-300 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-400" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Optimization Tips */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-cream-100">Revenue Optimization Tips</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {revenueTips.map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-cream-100 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  {section.category}
                </h4>
                <ul className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-cream-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-cream-100">Quick Actions</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-olive-800/50 rounded-lg border border-olive-600">
              <h4 className="font-semibold text-cream-100 mb-2">Fix Missing Links</h4>
              <p className="text-sm text-cream-400 mb-3">
                Use the filter to find items without affiliate links and add them in bulk
              </p>
              <Badge variant="warning">Priority: High</Badge>
            </div>
            <div className="p-4 bg-olive-800/50 rounded-lg border border-olive-600">
              <h4 className="font-semibold text-cream-100 mb-2">Check Link Health</h4>
              <p className="text-sm text-cream-400 mb-3">
                Regularly verify that all affiliate links are working and not broken
              </p>
              <Badge variant="default">Monthly Task</Badge>
            </div>
            <div className="p-4 bg-olive-800/50 rounded-lg border border-olive-600">
              <h4 className="font-semibold text-cream-100 mb-2">Review Performance</h4>
              <p className="text-sm text-cream-400 mb-3">
                Check your affiliate dashboard to see which products generate the most revenue
              </p>
              <Badge variant="info">Weekly Review</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Reminder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-cream-100">Compliance Checklist</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-cream-300">Affiliate disclosures on all pages with links</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-cream-300">rel="sponsored" attribute on all affiliate links</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-cream-300">Privacy Policy includes affiliate disclosure</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-cream-300">Terms of Service includes affiliate terms</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-cream-300">Footer includes affiliate disclosure</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
