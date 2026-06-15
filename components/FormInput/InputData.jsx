'use client';

import { Calendar } from 'lucide-react';
import { maskDateBR, dateBRDigitsFromISO } from '@/utils/masks';
import { validateDateField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';
import { useEffect, useRef } from 'react';

export default function InputData({
  label = 'Data',
  value = '',
  onChange,
  required = true,
  disabled,
  name,
  className,
  isoValue,
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && isoValue && !value) {
      onChange(dateBRDigitsFromISO(isoValue));
      initialized.current = true;
    }
  }, [isoValue, value, onChange]);

  const field = useMaskedField({
    value,
    onChange,
    maskFn: maskDateBR,
    maxDigits: 8,
    validate: validateDateField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={Calendar}
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
      placeholder="dd/mm/aaaa"
    />
  );
}
