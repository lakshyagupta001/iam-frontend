import { z } from 'zod';

export const alertSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message is too long'),
  severity: z.string().min(1, 'Severity is required').max(50, 'Severity is too long'),
});

export type AlertFormData = z.infer<typeof alertSchema>;
