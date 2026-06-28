import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alertSchema, type AlertFormData } from '../validation/alerts.validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AlertFormProps {
  defaultValues?: Partial<AlertFormData>;
  onSubmit: (data: AlertFormData) => void;
  isSubmitting?: boolean;
}

export function AlertForm({ defaultValues, onSubmit, isSubmitting }: AlertFormProps) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="E.g., High CPU Usage"
          {...register('title')}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Detailed alert message..."
          {...register('message')}
          disabled={isSubmitting}
          rows={4}
        />
        {errors.message && (
          <p className="text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Severity</Label>
        <Select 
          value={currentSeverity} 
          onValueChange={(val) => setValue('severity', val)} 
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
          <p className="text-sm text-red-500">{errors.severity.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {defaultValues ? 'Update Alert' : 'Create Alert'}
      </Button>
    </form>
  );
}
