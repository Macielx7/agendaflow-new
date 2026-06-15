'use client';

import { IdCard } from 'lucide-react';
import { maskCPF } from '@/utils/masks';
import { validateCPFField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';

export default function InputCPF({ label = 'CPF', value = '', onChange, required = true, disabled, name, className }) {
  const field = useMaskedField({
    value,
    onChange,
    maskFn: maskCPF,
    maxDigits: 11,
    validate: validateCPFField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={IdCard}
      value={field.display}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      onPaste={field.handlePaste}
      error={field.error}
      required={required}
      disabled={disabled}
      name={name}
      className={className}
      inputMode="numeric"
      autoComplete="off"
    />
  );
}
