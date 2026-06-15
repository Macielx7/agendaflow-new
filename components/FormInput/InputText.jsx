'use client';

import { useState } from 'react';
import { validateNameField } from '@/utils/fieldValidators';
import FormField from './FormField';

export default function InputText({
  label,
  value = '',
  onChange,
  required = false,
  disabled,
  name,
  className,
  icon,
  validate,
  type = 'text',
  autoComplete,
  multiline,
  rows,
  placeholder,
}) {
  const [touched, setTouched] = useState(false);
  const validator = validate || (required ? validateNameField : () => null);
  const error = touched ? validator(value, required) : null;

  return (
    <FormField
      label={label}
      icon={icon}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setTouched(true)}
      error={error}
      required={required}
      disabled={disabled}
      name={name}
      className={className}
      type={type}
      autoComplete={autoComplete}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
    />
  );
}
