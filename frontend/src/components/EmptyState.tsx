import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showAction?: boolean;
}

export default function EmptyState({
  title = 'No students yet',
  description = 'Get started by adding your first student.',
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
        <Users size={22} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {showAction && (
        <Link
          to="/students/create"
          className="mt-4 inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add Student
        </Link>
      )}
    </div>
  );
}
//uysash