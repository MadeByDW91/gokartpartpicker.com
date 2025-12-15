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
      <div className="flex gap-2 sm:gap-4 items-center">
        <Link href="/my-builds" className="hover:text-garage-orange text-xs sm:text-sm whitespace-nowrap">
          <span className="hidden sm:inline">My Builds</span>
          <span className="sm:hidden">Builds</span>
        </Link>
        <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline truncate max-w-[120px]">
          {session.user.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-xs sm:text-sm hover:text-garage-orange whitespace-nowrap"
        >
          Log Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 sm:gap-4">
      <Link
        href="/login"
        className="bg-garage-orange text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-opacity-90 transition whitespace-nowrap"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="bg-garage-orange text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-opacity-90 transition whitespace-nowrap"
      >
        Sign Up
      </Link>
    </div>
  )
}


