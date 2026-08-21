import type { SVGProps } from 'react';
import { ICON_SPRITE, type IconName } from './sprite';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: IconSize;
}

const SIZE_CLASS: Record<IconSize, string> = {
  sm: 'icon icon-sm',
  md: 'icon',
  lg: 'icon icon-lg',
};

export function Icon({ name, size = 'md', className, ...rest }: IconProps) {
  return (
    <svg className={[SIZE_CLASS[size], className].filter(Boolean).join(' ')} {...rest}>
      <use href={`#i-${name}`} />
    </svg>
  );
}

/** Mount once, near the root, so `<use>` references resolve on first paint. */
export function IconSprite() {
  return (
    <svg
      width={0}
      height={0}
      aria-hidden="true"
      style={{ position: 'absolute' }}
      dangerouslySetInnerHTML={{ __html: `<defs>${ICON_SPRITE}</defs>` }}
    />
  );
}
