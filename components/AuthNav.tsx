'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AuthNav() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex gap-4">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex gap-4">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="flex gap-4 items-center">
        <Link href="/my-builds" className="hover:text-garage-orange text-sm">
          My Builds
        </Link>
        <span className="text-sm text-gray-400">{session.user.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm hover:text-garage-orange"
        >
          Log Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <Link href="/login" className="hover:text-garage-orange text-sm">
        Log In
      </Link>
      <Link
        href="/signup"
        className="bg-garage-orange text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition"
      >
        Sign Up
      </Link>
    </div>
  )
}


