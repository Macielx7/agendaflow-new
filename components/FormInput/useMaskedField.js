'use client';

import { useState, useCallback } from 'react';

export function useMaskedField({ value, onChange, maskFn, maxDigits, validate, required }) {
  const [touched, setTouched] = useState(false);

  const display = maskFn(value);
  const error = touched ? validate?.(value, required) : null;

  const handleChange = useCallback(
    (e) => {
      const raw = e.target.value;
      const digits = raw.replace(/\D/g, '').slice(0, maxDigits);
      onChange(digits);
    },
    [onChange, maxDigits],
  );

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, maxDigits);
      onChange(pasted);
    },
    [onChange, maxDigits],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const touch = useCallback(() => setTouched(true), []);

  return { display, error, touched, handleChange, handlePaste, handleBlur, touch, setTouched };
}
