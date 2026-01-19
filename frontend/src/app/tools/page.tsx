import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Calculator, 
  Wrench, 
  FileSpreadsheet, 
  Zap, 
  Gauge, 
  TrendingUp,
  Ruler,
  Settings,
  ArrowRight,
  BookOpen,
  Film
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Tools & Calculators - GoKartPartPicker',
  description: 'Useful tools and calculators to help you plan and build your ultimate go-kart. HP calculators, torque specs, ignition timing, and more.',
};

const tools = [
  {
    id: 'torque-specs',
    title: 'Torque Specs',
    description: 'View complete torque specifications for all engine fasteners, organized by category. Export to spreadsheet for your build.',
    icon: FileSpreadsheet,
    href: '/tools/torque-specs',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'build-planner',
    title: 'Build Planner',
    description: 'Plan your complete build with live HP calculations, compatibility checks, and cost estimates.',
    icon: Calculator,
    href: '/tools/build-planner',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'ignition-timing',
    title: 'Ignition Timing Calculator',
    description: 'Calculate optimal ignition timing with advanced timing keys. See HP impact and safety warnings.',
    icon: Gauge,
    href: '/tools/ignition-timing',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'hp-contribution',
    title: 'HP Contribution Calculator',
    description: 'See how much HP each part individually adds to your build. Compare parts side-by-side.',
    icon: Zap,
    href: '/tools/hp-contribution',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  {
    id: 'gear-ratio',
    title: 'Gear Ratio Calculator',
    description: 'Calculate optimal sprocket combinations for your desired top speed and acceleration.',
    icon: Settings,
    href: '/tools/gear-ratio',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'weight-calculator',
    title: 'Weight Calculator',
    description: 'Calculate total build weight and power-to-weight ratio. Optimize for performance.',
    icon: TrendingUp,
    href: '/tools/weight-calculator',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 'guides',
    title: 'Installation Guides',
    description: 'Step-by-step guides for installing parts, maintenance, and performance upgrades.',
    icon: BookOpen,
    href: '/guides',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'videos',
    title: 'Useful Videos',
    description: 'Browse our complete library of go-kart videos. Installation guides, tutorials, reviews, and more.',
    icon: Film,
    href: '/tools/videos',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-olive-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display text-4xl md:text-5xl text-cream-100 mb-4">
            Tools & Calculators
          </h1>
          <p className="text-lg text-cream-300 max-w-2xl mx-auto">
            Powerful tools to help you plan, build, and optimize your go-kart. 
            Make informed decisions with our calculators and guides.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.href}>
              <Card className="h-full hover:border-orange-500 transition-all cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 ${tool.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <h2 className="text-xl font-bold text-cream-100 mb-2">
                    {tool.title}
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-cream-300 text-sm mb-4">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors">
                    <span className="text-sm font-medium">Try Tool</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-12 border-t border-olive-700">
          <h2 className="text-2xl font-bold text-cream-100 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/builder"
              className="p-4 bg-olive-800 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-semibold text-cream-100">Build Configurator</h3>
                  <p className="text-sm text-cream-400">Start building your kart</p>
                </div>
              </div>
            </Link>
            <Link
              href="/engines"
              className="p-4 bg-olive-800 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-semibold text-cream-100">Browse Engines</h3>
                  <p className="text-sm text-cream-400">Find the ultimate engine</p>
                </div>
              </div>
            </Link>
            <Link
              href="/parts"
              className="p-4 bg-olive-800 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-semibold text-cream-100">Browse Parts</h3>
                  <p className="text-sm text-cream-400">Explore all parts</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
