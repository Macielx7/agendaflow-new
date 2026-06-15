'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';
import { validateEmailField } from '@/utils/fieldValidators';
import FormField from './FormField';

export default function InputEmail({ label = 'E-mail', value = '', onChange, required = false, disabled, name, className }) {
  const [touched, setTouched] = useState(false);
  const error = touched ? validateEmailField(value, required) : null;

  return (
    <FormField
      label={label}
      icon={Mail}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setTouched(true)}
      error={error}
      required={required}
      disabled={disabled}
      name={name}
      className={className}
      type="email"
      autoComplete="email"
    />
  );
}
