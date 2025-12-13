import { CardSkeleton, BuildSummarySkeleton } from '@/components/Skeleton'

export default function BuildPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8" />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <BuildSummarySkeleton />
        </div>
      </div>
    </div>
  )
}

