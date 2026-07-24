export default function ReserveLoading() {
  return (
    <div className="pt-20 pb-24">
      <div className="bg-muted h-48 animate-pulse" />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
