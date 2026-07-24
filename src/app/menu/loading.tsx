import { MenuCardSkeleton } from "@/components/shared";

export default function MenuLoading() {
  return (
    <div className="pt-20 pb-24">
      {/* Hero skeleton */}
      <div className="bg-muted h-48 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Filter bar skeleton */}
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
