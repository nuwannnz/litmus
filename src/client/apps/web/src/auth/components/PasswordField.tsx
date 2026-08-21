import { useState } from 'react';
import { Icon } from '@litmus/ui';

export interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function PasswordField({ value, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="input-wrap">
      <input
        className="input"
        type={visible ? 'text' : 'password'}
        name="password"
        value={value}
        placeholder="••••••••"
        required
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="peek"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((v) => !v)}
      >
        <Icon name={visible ? 'lock' : 'eye'} size="sm" />
      </button>
    </span>
  );
}
