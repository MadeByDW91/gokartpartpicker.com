import Link from 'next/link'

async function getGuides() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/guides`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch guides')
  }
  return res.json()
}

export default async function GuidesPage() {
  const guides = await getGuides()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark mb-8">Installation Guides</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide: any) => (
          <div key={guide.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-heading mb-2 text-garage-dark">{guide.title}</h2>
            <p className="text-garage-gray mb-4 line-clamp-2">{guide.description}</p>
            <div className="flex justify-between items-center mb-4">
              {guide.difficulty && (
                <span className="text-sm px-3 py-1 bg-garage-cream rounded-full capitalize">
                  {guide.difficulty}
                </span>
              )}
              {guide.estimatedTimeMinutes && (
                <span className="text-sm text-garage-gray">
                  ~{guide.estimatedTimeMinutes} min
                </span>
              )}
            </div>
            <Link
              href={`/guides/${guide.slug}`}
              className="block text-center bg-garage-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              View Guide
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

