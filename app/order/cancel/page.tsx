import Link from 'next/link'

export default function OrderCancelPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-heading font-bold text-garage-dark mb-4">Order Canceled</h1>
        <p className="text-garage-gray mb-6">
          Your checkout was canceled. No charges were made. You can continue shopping or return to your cart.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/store"
            className="bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/cart"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-heading hover:bg-gray-300 transition"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  )
}


