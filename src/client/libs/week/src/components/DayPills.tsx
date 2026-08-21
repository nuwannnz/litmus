import type { WeekDay } from '@litmus/domain';

export interface DayPillsProps {
  days: WeekDay[];
  selected: string;
  onSelect: (iso: string) => void;
}

/** Phone-only day picker that swaps which single column the board shows. */
export function DayPills({ days, selected, onSelect }: DayPillsProps) {
  return (
    <div className="day-pills" role="tablist" aria-label="Day">
      {days.map((day) => (
        <button
          key={day.iso}
          type="button"
          role="tab"
          aria-selected={day.iso === selected}
          aria-label={day.long}
          className={['day-pill', day.iso === selected ? 'is-selected' : ''].filter(Boolean).join(' ')}
          onClick={() => onSelect(day.iso)}
        >
          {day.name.charAt(0)}
          <b>{day.num}</b>
        </button>
      ))}
    </div>
  );
}
