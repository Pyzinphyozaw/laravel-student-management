import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import type { Student } from '../types';

interface StudentTableProps {
  students: Student[];
  onDelete: (student: Student) => void;
}

export default function StudentTable({ students, onDelete }: StudentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Phone</th>
            <th className="px-6 py-3 font-medium">Class</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-slate-50/60">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-slate-800">{student.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-600">{student.email}</td>
              <td className="px-6 py-4 text-slate-600">
                {student.phone?.trim() ? student.phone : <span className="text-slate-400">—</span>}
              </td>
              <td className="px-6 py-4">
                {student.class ? (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {student.class.name}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/students/${student.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(student)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}