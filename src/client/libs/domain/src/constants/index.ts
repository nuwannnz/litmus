import type { CategoryName, ColorName, Person, PersonId, Priority, TaskStatus } from '../types';

/** Task categories mapped onto their pastel family from the design tokens. */
export const CATEGORY_COLORS: Record<CategoryName, ColorName> = {
  Design: 'lav',
  Dev: 'blue',
  Marketing: 'peach',
  Meeting: 'yellow',
  Research: 'mint',
  Personal: 'pink',
  QA: 'peach',
  Docs: 'blue',
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS) as CategoryName[];

export const categoryColor = (category: CategoryName): ColorName =>
  CATEGORY_COLORS[category] ?? 'lav';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  progress: 'In Progress',
  done: 'Done',
};

export const STATUSES = Object.keys(STATUS_LABELS) as TaskStatus[];

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export const COLORS: ColorName[] = ['mint', 'blue', 'peach', 'lav', 'pink', 'yellow'];

export const PEOPLE: Record<PersonId, Person> = {
  NK: { id: 'NK', name: 'Nuwan K.', role: 'Owner', color: 'peach' },
  AL: { id: 'AL', name: 'Alex L.', role: 'Designer', color: 'blue' },
  JS: { id: 'JS', name: 'Jordan S.', role: 'Engineer', color: 'pink' },
  ML: { id: 'ML', name: 'Mia L.', role: 'Product', color: 'mint' },
};

/** The signed-in user for this UI-only build. Replaced by the auth API later. */
export const CURRENT_USER: PersonId = 'NK';
