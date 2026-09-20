import { z } from 'zod';

export const studentSchema = z.object({
  class_id: z.coerce
    .number({ error : 'Class is required' })
    .int()
    .positive('Class is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or fewer'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  phone: z
    .string()
    .max(20, 'Phone must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
});

// Output type used by your app after parsing (class_id is number).
export type StudentFormValues = z.output<typeof studentSchema>;

// Input type — what the form fields actually hold before parsing.
export type StudentFormInput = z.input<typeof studentSchema>;