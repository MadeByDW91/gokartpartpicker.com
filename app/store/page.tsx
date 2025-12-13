import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'

export const dynamic = 'force-dynamic'

async function getProducts() {
  return await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function StorePage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-garage-dark">Store</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-garage-gray text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const images = (product.images as string[] | null) || []
            const mainImage = images[0] || '/images/placeholder-product.png'
            const price = (product.priceCents / 100).toFixed(2)

            return (
              <Link
                key={product.id}
                href={`/store/${product.slug}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                  <ProductImage
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-heading font-semibold text-garage-dark flex-1">
                    {product.name}
                  </h2>
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded ${
                      product.type === 'DIGITAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {product.type}
                  </span>
                </div>
                <p className="text-garage-gray text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-2xl font-bold text-garage-orange">${price}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

