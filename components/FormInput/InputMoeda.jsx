'use client';

import { DollarSign } from 'lucide-react';
import { maskCurrency } from '@/utils/masks';
import { validateCurrencyField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';

export default function InputMoeda({
  label = 'Valor',
  value = '',
  onChange,
  required = false,
  disabled,
  name,
  className,
}) {
  const field = useMaskedField({
    value,
    onChange,
    maskFn: maskCurrency,
    maxDigits: 12,
    validate: validateCurrencyField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={DollarSign}
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
