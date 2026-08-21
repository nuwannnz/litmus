import { Icon } from '../icons';

export interface StepperProps {
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}

export function Stepper({ onPrev, onNext, prevLabel, nextLabel }: StepperProps) {
  return (
    <div className="stepper">
      <button type="button" title={prevLabel} aria-label={prevLabel} onClick={onPrev}>
        <Icon name="left" size="sm" />
      </button>
      <button type="button" title={nextLabel} aria-label={nextLabel} onClick={onNext}>
        <Icon name="right" size="sm" />
      </button>
    </div>
  );
}
