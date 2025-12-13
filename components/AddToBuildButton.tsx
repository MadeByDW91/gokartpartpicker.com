'use client'

import { useBuildStore } from '@/lib/buildStore'
import { useRouter } from 'next/navigation'

interface AddToBuildButtonProps {
  type: 'engine' | 'part'
  item: any
  offer?: any
}

export default function AddToBuildButton({ type, item, offer }: AddToBuildButtonProps) {
  const router = useRouter()
  const addEngine = useBuildStore((state) => state.addEngine)
  const addPart = useBuildStore((state) => state.addPart)

  const handleClick = () => {
    if (type === 'engine') {
      addEngine(item)
      router.push('/build')
    } else {
      addPart(item, offer)
      router.push('/build')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
    >
      {type === 'engine' ? 'Start Build with This Engine' : 'Add to Build'}
    </button>
  )
}

