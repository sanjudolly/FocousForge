export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background:'rgba(255,255,255,0.7)', border:'1.5px solid rgba(255,255,255,0.9)' }}>
      <div className="flex justify-between">
        <div className="h-6 w-24 rounded-xl shimmer" />
        <div className="h-5 w-16 rounded-full shimmer" />
      </div>
      <div className="h-5 w-4/5 rounded-lg shimmer" />
      <div className="h-3 w-full rounded-lg shimmer" />
      <div className="h-2 w-full rounded-full shimmer" />
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-xl shimmer" />
        <div className="h-8 w-9 rounded-xl shimmer" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background:'rgba(255,255,255,0.7)', border:'1.5px solid rgba(255,255,255,0.9)' }}>
      <div className="flex justify-between items-center">
        <div className="h-3 w-20 rounded shimmer" />
        <div className="h-6 w-6 rounded-lg shimmer" />
      </div>
      <div className="h-8 w-16 rounded shimmer" />
      <div className="h-1.5 w-full rounded-full shimmer" />
    </div>
  );
}

export function SkeletonLine({ w = 'full' }: { w?: string }) {
  return <div className={`h-4 w-${w} rounded shimmer`} />;
}
