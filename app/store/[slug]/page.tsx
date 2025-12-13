import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import AddToCartButton from '@/components/AddToCartButton'

export const dynamic = 'force-dynamic'

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  return product
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  const images = (product.images as string[] | null) || []
  const mainImage = images[0] || '/images/placeholder-product.png'
  const price = (product.priceCents / 100).toFixed(2)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/store" className="text-garage-orange hover:underline mb-4 inline-block">
        ← Back to Store
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden mb-4">
            <ProductImage
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded relative overflow-hidden">
                  <ProductImage src={img} alt={`${product.name} ${idx + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-heading font-bold text-garage-dark flex-1">
              {product.name}
            </h1>
            <span
              className={`ml-4 text-sm px-3 py-1 rounded ${
                product.type === 'DIGITAL'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {product.type}
            </span>
          </div>

          <p className="text-3xl font-bold text-garage-orange mb-6">${price}</p>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-heading mb-2">Description</h2>
              <p className="text-garage-gray whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.type === 'DIGITAL' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Digital Product:</strong> After purchase, you&apos;ll receive an instant download link.
              </p>
            </div>
          )}

          {product.type === 'PHYSICAL' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Physical Product:</strong> Made to order. Ships in 5-7 business days.
              </p>
            </div>
          )}

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}

