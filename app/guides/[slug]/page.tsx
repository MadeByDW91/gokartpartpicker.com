import Link from 'next/link'
import AddGuidePartsToBuild from '@/components/AddGuidePartsToBuild'

async function getGuide(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/guides/${slug}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch guide')
  }
  return res.json()
}

export default async function GuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = await getGuide(params.slug)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/guides" className="text-garage-orange hover:underline mb-4 inline-block">
        ← Back to Guides
      </Link>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-4xl font-heading font-bold text-garage-dark mb-4">{guide.title}</h1>
        <p className="text-lg text-garage-gray mb-6">{guide.description}</p>
        
        <div className="flex gap-4 mb-8">
          {guide.difficulty && (
            <span className="px-4 py-2 bg-garage-cream rounded-full capitalize">
              {guide.difficulty}
            </span>
          )}
          {guide.estimatedTimeMinutes && (
            <span className="px-4 py-2 bg-garage-cream rounded-full">
              ~{guide.estimatedTimeMinutes} minutes
            </span>
          )}
        </div>

        <h2 className="text-2xl font-heading mb-4 mt-8">Steps</h2>
        <div className="space-y-4">
          {guide.steps.map((step: any) => (
            <div
              key={step.id}
              className={`border rounded-lg p-4 ${
                step.warning ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-garage-orange text-white rounded-full flex items-center justify-center font-heading font-bold">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading mb-2">{step.title}</h3>
                  <p className="text-garage-gray whitespace-pre-line">{step.content}</p>
                  {step.warning && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                      <p className="text-red-800 font-semibold">⚠️ Warning: {step.warning}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {guide.parts.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading">Required Parts & Tools</h2>
              <AddGuidePartsToBuild parts={guide.parts.map((gp: any) => gp.part)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {guide.parts.map((gp: any) => (
                <Link
                  key={gp.part.id}
                  href={`/parts/${gp.part.slug}`}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-garage-cream transition"
                >
                  <p className="font-semibold">{gp.part.name}</p>
                  <p className="text-sm text-garage-gray capitalize mt-1">{gp.part.category.replace('_', ' ')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

