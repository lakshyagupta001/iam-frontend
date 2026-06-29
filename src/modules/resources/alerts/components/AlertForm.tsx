import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alertSchema, type AlertFormData } from '../validation/alerts.validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AlertFormProps {
  defaultValues?: Partial<AlertFormData>;
  onSubmit: (data: AlertFormData) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function AlertForm({ defaultValues, onSubmit, isSubmitting, onCancel }: AlertFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      message: defaultValues?.message || '',
      severity: defaultValues?.severity || 'LOW',
    }
  });

  const currentSeverity = watch('severity');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col xl:flex-row items-start xl:items-end gap-4">
        <div className="space-y-1.5 flex-1 w-full xl:w-auto">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="E.g., High CPU Usage"
            {...register('title')}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-sm text-red-500 font-medium">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5 flex-[2] w-full xl:w-auto">
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            placeholder="Detailed alert message..."
            {...register('message')}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="text-sm text-red-500 font-medium">{errors.message.message}</p>
          )}
        </div>

        <div className="space-y-1.5 flex-1 w-full xl:w-auto">
          <Label htmlFor="severity">Severity</Label>
          <Select 
            value={currentSeverity} 
            onValueChange={(val: any) => setValue('severity', val)} 
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          {errors.severity && (
            <p className="text-sm text-red-500 font-medium">{errors.severity.message}</p>
          )}
        </div>

        <div className="flex gap-2 w-full xl:w-auto pt-2 xl:pt-0 justify-end">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  );
}
