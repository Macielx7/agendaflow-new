'use client';

import { MessageCircle } from 'lucide-react';
import { maskPhone } from '@/utils/masks';
import { validateWhatsAppField } from '@/utils/fieldValidators';
import FormField from './FormField';
import { useMaskedField } from './useMaskedField';

export default function InputWhatsApp({ label = 'WhatsApp', value = '', onChange, required = true, disabled, name, className }) {
  const field = useMaskedField({
    value,
    onChange,
    maskFn: (v) => maskPhone(v, true),
    maxDigits: 11,
    validate: validateWhatsAppField,
    required,
  });

  return (
    <FormField
      label={label}
      icon={MessageCircle}
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
