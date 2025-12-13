'use client'

import { useCartStore } from '@/lib/cartStore'
import { useState } from 'react'
import type { Product } from '@prisma/client'

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    const images = (product.images as string[] | null) || []
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      type: product.type,
      priceCents: product.priceCents,
      imageUrl: images[0] || null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleAddToCart}
        disabled={!product.isActive}
        className={`w-full py-3 rounded-lg font-heading font-semibold transition ${
          added
            ? 'bg-success-green text-white'
            : product.isActive
            ? 'bg-garage-orange text-white hover:bg-opacity-90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {added ? '✓ Added to Cart!' : product.isActive ? 'Add to Cart' : 'Out of Stock'}
      </button>
      {added && (
        <p className="text-sm text-center text-success-green">
          <a href="/cart" className="underline">
            View Cart
          </a>
        </p>
      )}
    </div>
  )
}


