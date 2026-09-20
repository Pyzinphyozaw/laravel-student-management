import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import StudentForm from '../components/StudentForm';
import { useCreateStudent } from '../hooks/useCreateStudent';
import { applyApiErrors } from '../lib/errorMapping';
import type { StudentFormValues } from '../lib/validators';

export default function StudentCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateStudent();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (
    values: StudentFormValues,
    setError: Parameters<typeof applyApiErrors<StudentFormValues>>[1],
  ) => {
    setServerError(null);
    try {
      await createMutation.mutateAsync({
        class_id: Number(values.class_id),
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() ? values.phone.trim() : null,
      });
      toast.success('Student created successfully');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Student</h1>
        <p className="text-sm text-slate-500">Create a new student record.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <StudentForm
          submitLabel="Create Student"
          submitting={createMutation.isPending}
          serverError={serverError}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}