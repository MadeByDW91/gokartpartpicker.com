import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn - Go-Kart Engine Guides & Resources | GoKartPartPicker',
  description:
    'Learn about go-kart engine upgrades, ignition timing, installation techniques, and best practices.',
}

const topics = [
  {
    slug: 'ignition-timing',
    title: 'Ignition Timing',
    description:
      'Learn about ignition timing, advanced timing keys, and how to optimize timing for your build.',
    icon: '⚡',
  },
  // Add more topics here as they're created
]

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-heading font-bold text-garage-dark mb-4">Learn</h1>
        <p className="text-xl text-garage-gray max-w-2xl mx-auto">
          Comprehensive guides and resources to help you build and tune go-kart engines safely and
          effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/learn/${topic.slug}`}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">{topic.icon}</div>
            <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-2">
              {topic.title}
            </h2>
            <p className="text-garage-gray">{topic.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

