'use client';

import { Phone } from 'lucide-react';
import { maskPhone } from '@/utils/masks';
import { validatePhoneField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';

export default function InputTelefone({ label = 'Telefone', value = '', onChange, required = true, disabled, name, className }) {
  const field = useMaskedField({
    value,
    onChange,
    maskFn: (v) => maskPhone(v, false),
    maxDigits: 10,
    validate: (v, req) => validatePhoneField(v, req, false),
    required,
  });

  return (
    <FormField
      label={label}
      icon={Phone}
      value={field.display}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      onPaste={field.handlePaste}
      error={field.error}
      required={required}
      disabled={disabled}
      name={name}
      className={className}
      inputMode="tel"
      autoComplete="tel"
    />
  );
}
