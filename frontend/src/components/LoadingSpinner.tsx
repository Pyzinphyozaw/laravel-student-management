import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export default function LoadingSpinner({
  label = 'Loading...',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 text-slate-500 ${className}`}>
      <Loader2 className="animate-spin" size={18} />
      <span className="text-sm">{label}</span>
    </div>
  );
}