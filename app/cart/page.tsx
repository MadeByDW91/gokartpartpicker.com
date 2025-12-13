'use client'

import { useCartStore } from '@/lib/cartStore'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore()
  const [checkingOut, setCheckingOut] = useState(false)

  const total = getTotal()
  const itemCount = getItemCount()
  const hasPhysicalItems = items.some((item) => item.type === 'PHYSICAL')

  const handleCheckout = async () => {
    if (items.length === 0) return

    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to start checkout')
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      alert('An error occurred. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h1 className="text-3xl font-heading font-bold text-garage-dark mb-4">Your Cart is Empty</h1>
          <p className="text-garage-gray mb-6">Add some products to get started!</p>
          <Link
            href="/store"
            className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
          >
            Browse Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-lg border border-gray-200 p-6 flex gap-4"
            >
              <Link href={`/store/${item.slug}`} className="flex-shrink-0">
                <div className="w-24 h-24 bg-gray-100 rounded relative overflow-hidden">
                  {item.imageUrl ? (
                    <ProductImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1">
                <Link href={`/store/${item.slug}`}>
                  <h3 className="text-xl font-heading font-semibold text-garage-dark mb-1 hover:text-garage-orange">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-garage-gray mb-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      item.type === 'DIGITAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </p>
                <p className="text-lg font-semibold text-garage-orange mb-4">
                  ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-garage-gray">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1
                        updateQuantity(item.productId, qty)
                      }}
                      className="w-16 p-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Clear Cart
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h2 className="text-2xl font-heading mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-garage-gray">
                <span>Items ({itemCount})</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
              {hasPhysicalItems && (
                <div className="flex justify-between text-garage-gray">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-garage-orange">${(total / 100).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut || items.length === 0}
              className="w-full bg-garage-orange text-white py-3 rounded-lg font-heading hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>

            <p className="text-xs text-garage-gray mt-4 text-center">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

