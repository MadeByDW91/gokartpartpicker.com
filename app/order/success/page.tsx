import { Suspense } from 'react'
import OrderSuccessClient from '@/components/OrderSuccessClient'

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center py-12">Loading order...</div>}>
        <OrderSuccessWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function OrderSuccessWrapper({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-heading font-bold text-garage-dark mb-4">Order Not Found</h1>
        <p className="text-garage-gray mb-6">No session ID provided.</p>
        <a
          href="/store"
          className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
        >
          Continue Shopping
        </a>
      </div>
    )
  }

  return <OrderSuccessClient sessionId={sessionId} />
}


