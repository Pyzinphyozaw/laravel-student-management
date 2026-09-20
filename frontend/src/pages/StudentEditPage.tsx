import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import StudentForm from '../components/StudentForm';
import { studentToFormValues } from '../lib/studentForm';
import { useStudent } from '../hooks/useStudent';
import { useUpdateStudent } from '../hooks/useUpdateStudent';
import { applyApiErrors } from '../lib/errorMapping';
import type { StudentFormValues } from '../lib/validators';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StudentEditPage() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);
  const navigate = useNavigate();

  const { data: student, isLoading, isError, error } = useStudent(studentId);
  const updateMutation = useUpdateStudent(studentId);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => studentToFormValues(student),
    [student],
  );


  const handleSubmit = async (
    values: StudentFormValues,
    setError: Parameters<typeof applyApiErrors<StudentFormValues>>[1],
  ) => {
    setServerError(null);
    try {
      await updateMutation.mutateAsync({
        class_id: Number(values.class_id),
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() ? values.phone.trim() : null,
      });
      toast.success('Student updated successfully');
      navigate('/students');
    } catch (err) {
      const message = applyApiErrors<StudentFormValues>(
        err,
        setError,
        ['class_id', 'name', 'email', 'phone'],
      );
      if (message) {
        setServerError(message);
        toast.error(message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
        <LoadingSpinner label="Loading student…" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-700">Failed to load student</p>
        <p className="mt-1 text-xs text-red-600">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-100"
        >
          Back to students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit Student</h1>
        <p className="text-sm text-slate-500">
          Update the details for <span className="font-medium text-slate-700">{student.name}</span>.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <StudentForm
          defaultValues={defaultValues}
          submitLabel="Save Changes"
          submitting={updateMutation.isPending}
          serverError={serverError}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}