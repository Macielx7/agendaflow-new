'use client';

import { MapPin } from 'lucide-react';
import { maskCEP } from '@/utils/masks';
import { validateCEPField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';

export default function InputCEP({ label = 'CEP', value = '', onChange, required = true, disabled, name, className }) {
  const field = useMaskedField({
    value,
    onChange,
    maskFn: maskCEP,
    maxDigits: 8,
    validate: validateCEPField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={MapPin}
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
      autoComplete="postal-code"
    />
  );
}
