import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { useStudents } from '../hooks/useStudents';
import { useClasses } from '../hooks/useClasses';
import { useDeleteStudent } from '../hooks/useDeleteStudent';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { getErrorMessage } from '../api/axios';
import type { Student } from '../types';

import StudentTable from '../components/StudentTable';
import Pagination from '../components/Pagination';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

export default function StudentListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState<number | ''>('');
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useMemo(
    () => ({
      page,
      search: debouncedSearch.trim() || undefined,
      class_id: classId === '' ? undefined : Number(classId),
    }),
    [page, debouncedSearch, classId],
  );

  const { data, isLoading, isFetching, isError, error } = useStudents(query);
  const { data: classes = [] } = useClasses();
  const deleteMutation = useDeleteStudent();

  const students = data?.data ?? [];
  const meta = data?.meta;

  const hasFilters = debouncedSearch.trim().length > 0 || classId !== '';

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleClassChange = (value: string) => {
    setClassId(value === '' ? '' : Number(value));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setClassId('');
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success('Student deleted successfully');
      setPendingDelete(null);

      // If we just removed the last row on this page, step back a page.
      if (students.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500">
            Manage student records, classes, and contact details.
          </p>
        </div>
        <Link
          to="/students/create"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} />
          Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <select
          value={classId}
          onChange={(e) => handleClassChange(e.target.value)}
          className="rounded-md border border-slate-200 bg-white py-2 px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:w-56"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-red-600">Failed to load students</p>
            <p className="mt-1 text-xs text-slate-500">{getErrorMessage(error)}</p>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No students match your filters' : 'No students yet'}
            description={
              hasFilters
                ? 'Try adjusting your search or clearing the filters.'
                : 'Get started by adding your first student.'
            }
            showAction={!hasFilters}
          />
        ) : (
          <>
            <StudentTable students={students} onDelete={setPendingDelete} />
            {meta && (
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                perPage={meta.per_page}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Background refetch indicator */}
      {isFetching && !isLoading && (
        <p className="text-center text-xs text-slate-400">Refreshing…</p>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete student"
        description={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
      />
    </div>
  );
}