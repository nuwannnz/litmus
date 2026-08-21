import { Icon, type IconName } from '../icons';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
  /** Hide the label and rely on the icon + title. */
  iconOnly?: boolean;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div className={['segmented', className].filter(Boolean).join(' ')}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={opt.value === value}
          title={opt.label}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon && <Icon name={opt.icon} size="sm" />}
          {!opt.iconOnly && opt.label}
        </button>
      ))}
    </div>
  );
}
