'use client';

import { useState, useId } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './FormField.module.css';

export default function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  onPaste,
  error,
  required,
  disabled,
  name,
  type = 'text',
  inputMode,
  autoComplete,
  className,
  multiline,
  rows = 3,
  inputClassName,
  maxLength,
  placeholder,
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasValue = value != null && String(value).length > 0;
  const showError = touched && error;
  const showSuccess = touched && !error && hasValue && !focused;

  const handleBlur = (e) => {
    setFocused(false);
    setTouched(true);
    onBlur?.(e);
  };

  const Tag = multiline ? 'textarea' : 'input';
  const inputClasses = [
    styles.input,
    Icon && !multiline ? styles.inputWithIcon : '',
    multiline ? styles.textarea : '',
    inputClassName || '',
  ]
    .filter(Boolean)
    .join(' ');

  const fieldClasses = [
    styles.field,
    focused ? styles.focused : '',
    showError ? styles.error : '',
    showSuccess ? styles.success : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [styles.label, showError ? styles.labelError : ''].filter(Boolean).join(' ');

  return (
    <div className={fieldClasses}>
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required ? ' *' : ''}
      </label>
      <div className={styles.inputWrap}>
        {Icon && !multiline && <Icon className={styles.icon} size={18} />}
        <Tag
          id={id}
          name={name}
          type={multiline ? undefined : type}
          className={inputClasses}
          value={value ?? ''}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onPaste={onPaste}
          disabled={disabled}
          required={required}
          inputMode={inputMode}
          autoComplete={autoComplete}
          rows={multiline ? rows : undefined}
          maxLength={maxLength}
          placeholder={placeholder}
        />
        {showSuccess && <CheckCircle2 className={styles.statusIcon} size={18} />}
        {showError && <AlertCircle className={styles.statusIcon} size={18} />}
      </div>
      {showError && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}
