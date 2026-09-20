import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { studentSchema, type StudentFormValues, type StudentFormInput } from '../lib/validators';
import { emptyStudentFormValues } from '../lib/studentForm';
import { useClasses } from '../hooks/useClasses';
import FormField from './FormField';
import type { ApiErrorSetter } from '../lib/errorMapping';

interface StudentFormProps {
  defaultValues?: Partial<StudentFormValues>;
  submitting?: boolean;
  submitLabel?: string;
  serverError?: string | null;
  onSubmit: (
    values: StudentFormValues,
    setError: ApiErrorSetter<StudentFormValues>,
  ) => void | Promise<void>;
  cancelTo?: string;
}


export default function StudentForm({
  defaultValues,
  submitting = false,
  submitLabel = 'Save',
  serverError,
  onSubmit,
  cancelTo = '/students',
}: StudentFormProps) {
  const { data: classes = [], isLoading: loadingClasses } = useClasses();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormInput, unknown, StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: defaultValues ?? emptyStudentFormValues,
    mode: 'onBlur',
  });
  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const busy = submitting || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, setError))}
      className="space-y-6"
      noValidate
    >
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Class" htmlFor="class_id" required error={errors.class_id?.message}>
            <select
              id="class_id"
              {...register('class_id')}
              disabled={loadingClasses}
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
            >
              <option value={0}>
                {loadingClasses ? 'Loading classes…' : 'Select a class'}
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              placeholder="e.g. Aung Aung"
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="student@example.com"
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField
            label="Phone"
            htmlFor="phone"
            error={errors.phone?.message}
            hint="Optional"
          >
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              placeholder="e.g. 09123456789"
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <Link
          to={cancelTo}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <X size={16} />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}