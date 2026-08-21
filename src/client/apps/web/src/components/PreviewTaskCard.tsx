import type { ColorName } from '@litmus/domain';
import { Chip } from '@litmus/ui';

export interface PreviewTaskCardProps {
  title: string;
  category: string;
  color: ColorName;
  meta: string;
  className?: string;
}

/** The little static task card used in marketing and auth artwork. */
export function PreviewTaskCard({
  title,
  category,
  color,
  meta,
  className,
}: PreviewTaskCardProps) {
  return (
    <div className={className}>
      <b>{title}</b>
      <span className="row">
        <Chip color={color} dot>
          {category}
        </Chip>
        <span>{meta}</span>
      </span>
    </div>
  );
}
