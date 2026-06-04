export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="bg-gray-200 aspect-square w-full" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}
