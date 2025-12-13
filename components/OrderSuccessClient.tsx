'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order, OrderItem, DigitalDownloadToken } from '@prisma/client'

interface OrderWithRelations extends Order {
  items: (OrderItem & {
    product: {
      id: string
      slug: string
      name: string
      type: 'DIGITAL' | 'PHYSICAL'
    }
  })[]
  digitalDownloads: DigitalDownloadToken[]
}

export default function OrderSuccessClient({ sessionId }: { sessionId: string }) {
  const [order, setOrder] = useState<OrderWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/orders/verify?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setOrder(data.order)
        }
      })
      .catch((err) => {
        setError('Failed to load order')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-garage-gray">Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-heading font-bold text-garage-dark mb-4">Order Not Found</h1>
        <p className="text-garage-gray mb-6">{error || 'Could not find your order.'}</p>
        <Link
          href="/store"
          className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const digitalItems = order.items.filter((item) => item.typeSnapshot === 'DIGITAL')
  const physicalItems = order.items.filter((item) => item.typeSnapshot === 'PHYSICAL')
  const total = (order.totalCents / 100).toFixed(2)

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-success-green rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-heading font-bold text-garage-dark mb-2">Order Confirmed!</h1>
        <p className="text-garage-gray">Thank you for your purchase.</p>
      </div>

      <div className="border-t border-gray-200 pt-6 mb-6">
        <h2 className="text-xl font-heading mb-4">Order Details</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-garage-gray">Order ID</span>
            <span className="font-mono text-sm">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-garage-gray">Total</span>
            <span className="font-bold text-garage-orange">${total}</span>
          </div>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-semibold">{item.nameSnapshot}</p>
                <p className="text-sm text-garage-gray">
                  Qty: {item.quantity} × ${((item.unitPriceCentsSnapshot * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {digitalItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-heading mb-4">Digital Downloads</h2>
          <p className="text-sm text-blue-800 mb-4">
            Your digital products are ready to download. Links expire in 7 days.
          </p>
          <div className="space-y-3">
            {digitalItems.map((item) => {
              const token = order.digitalDownloads.find((t) => t.productId === item.productId)
              if (!token) return null

              return (
                <div key={item.id} className="bg-white rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.nameSnapshot}</p>
                    <p className="text-xs text-garage-gray">
                      Downloads remaining: {token.maxDownloads - token.downloadCount} / {token.maxDownloads}
                    </p>
                  </div>
                  <a
                    href={`/download/${token.token}`}
                    className="bg-garage-orange text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition text-sm font-heading"
                  >
                    Download
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {physicalItems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-heading mb-4">Physical Products</h2>
          <p className="text-sm text-green-800">
            Your order is being prepared. Made-to-order items ship in 5-7 business days. You&apos;ll receive a
            shipping confirmation email when your order ships.
          </p>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/store"
          className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}


