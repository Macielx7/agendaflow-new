'use client';

import { Building2 } from 'lucide-react';
import { maskCNPJ } from '@/utils/masks';
import { validateCNPJField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';

export default function InputCNPJ({ label = 'CNPJ', value = '', onChange, required = true, disabled, name, className }) {
  const field = useMaskedField({
    value,
    onChange,
    maskFn: maskCNPJ,
    maxDigits: 14,
    validate: validateCNPJField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={Building2}
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
