import { useId } from 'react';
import { Icon } from '../icons';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const id = useId();
  return (
    <label className={['search', className].filter(Boolean).join(' ')} htmlFor={id}>
      <Icon name="search" size="sm" />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
