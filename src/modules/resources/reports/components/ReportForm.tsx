import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReportSchema, updateReportSchema } from '../validation/reports.validation';
import type { CreateReportFormValues, UpdateReportFormValues } from '../validation/reports.validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ReportFormProps {
  initialData?: UpdateReportFormValues;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  isUpdate?: boolean;
}

export function ReportForm({ initialData, onSubmit, isSubmitting, isUpdate }: ReportFormProps) {
  const schema = isUpdate ? updateReportSchema : createReportSchema;
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReportFormValues | UpdateReportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      title: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Report Title"
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Report Description"
          disabled={isSubmitting}
          aria-invalid={!!errors.description}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Input
          id="status"
          placeholder="ACTIVE, DRAFT, etc."
          disabled={isSubmitting}
          aria-invalid={!!errors.status}
          {...register('status')}
        />
        {errors.status && (
          <p className="text-xs text-red-500 font-medium">{errors.status.message}</p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUpdate ? 'Update Report' : 'Create Report'}
        </Button>
      </div>
    </form>
  );
}
