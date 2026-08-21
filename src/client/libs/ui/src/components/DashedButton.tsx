import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../icons';

export interface DashedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconName;
  children: ReactNode;
}

export function DashedButton({
  icon = 'plus',
  children,
  className,
  type = 'button',
  ...rest
}: DashedButtonProps) {
  return (
    <button type={type} className={['dashed', className].filter(Boolean).join(' ')} {...rest}>
      <Icon name={icon} size="sm" />
      {children}
    </button>
  );
}
