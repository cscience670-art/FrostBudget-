import React from 'react';
import { Input } from '@/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface ClientInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
}

const ClientInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: ClientInputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <Input
                placeholder={placeholder}
                className="input-class"
                type={name === 'password' || name === 'passwordHash' ? 'password' : 'text'}
                {...field}
              />
            </FormControl>
            <FormMessage className="form-message mt-2" />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ClientInput;
