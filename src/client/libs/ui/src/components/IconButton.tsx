import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName, type IconSize } from '../icons';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required — the button has no visible text. */
  label: string;
  iconSize?: IconSize;
}

export function IconButton({
  icon,
  label,
  iconSize = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={['btn--icon', className].filter(Boolean).join(' ')}
      title={label}
      aria-label={label}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
