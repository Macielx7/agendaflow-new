'use client';

import { Percent } from 'lucide-react';
import { maskPercent } from '@/utils/masks';
import { validatePercentField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';

export default function InputPercentual({ label = 'Porcentagem', value = '', onChange, required = false, disabled, name, className }) {
  const field = useMaskedField({
    value,
    onChange,
    maskFn: maskPercent,
    maxDigits: 5,
    validate: validatePercentField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={Percent}
      value={field.display}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
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
