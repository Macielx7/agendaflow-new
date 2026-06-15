'use client';

import { Clock } from 'lucide-react';
import { maskTime, onlyDigits } from '@/utils/masks';
import { validateTimeField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';
import { useEffect, useRef } from 'react';

export default function InputHora({
  label = 'Horário',
  value = '',
  onChange,
  required = true,
  disabled,
  name,
  className,
  timeValue,
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && timeValue && !value) {
      onChange(onlyDigits(timeValue, 4));
      initialized.current = true;
    }
  }, [timeValue, value, onChange]);

  const field = useMaskedField({
    value,
    onChange,
    maskFn: maskTime,
    maxDigits: 4,
    validate: validateTimeField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={Clock}
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
      placeholder="hh:mm"
    />
  );
}
