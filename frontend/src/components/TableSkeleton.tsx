export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0"
        >
          <div className="h-4 bg-slate-200 rounded col-span-1" />
          <div className="h-4 bg-slate-200 rounded col-span-1" />
          <div className="h-4 bg-slate-200 rounded col-span-1" />
          <div className="h-4 bg-slate-200 rounded col-span-1" />
          <div className="h-4 bg-slate-200 rounded col-span-1" />
        </div>
      ))}
    </div>
  );
}