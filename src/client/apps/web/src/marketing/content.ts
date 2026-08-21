import type { ColorName } from '@litmus/domain';
import type { IconName } from '@litmus/ui';

export interface ModuleHighlight {
  icon: IconName;
  color: ColorName;
  title: string;
  body: string;
  href: string;
}

export const MODULE_HIGHLIGHTS: ModuleHighlight[] = [
  {
    icon: 'calendar',
    color: 'lav',
    title: 'Week',
    body: "Plan every day on a simple kanban board. Drag tasks between days, set a due date, and always know what's next.",
    href: '/app/week',
  },
  {
    icon: 'folder',
    color: 'mint',
    title: 'Projects',
    body: 'Group related work, track progress at a glance, and schedule project tasks straight into your week.',
    href: '/app/projects',
  },
  {
    icon: 'note',
    color: 'peach',
    title: 'Notes',
    body: 'A WYSIWYG markdown editor with nested folders, backlinks, and links to any project or task.',
    href: '/app/notes',
  },
];

export interface Feature {
  icon: IconName;
  title: string;
  body: string;
}

export const FEATURES: Feature[] = [
  {
    icon: 'moon',
    title: 'Dark mode',
    body: "A calm dark theme that's easy on the eyes, day or night.",
  },
  {
    icon: 'bolt',
    title: 'Fast & light',
    body: 'Instant load, keyboard-first, and buttery drag-and-drop.',
  },
  {
    icon: 'link',
    title: 'Everything links',
    body: 'Connect notes to projects and tasks — context always follows.',
  },
  {
    icon: 'command',
    title: 'Command palette',
    body: 'Jump anywhere and link anything in a couple of keystrokes.',
  },
  {
    icon: 'phone',
    title: 'Web & mobile',
    body: 'A layout tuned for desktop and a focused view on your phone.',
  },
  {
    icon: 'lock',
    title: 'Your data, yours',
    body: 'Private by default. Export anytime, no lock-in.',
  },
];

export interface PreviewColumn {
  name: string;
  num: number;
  isToday?: boolean;
  cards: { title: string; category: string; color: ColorName; meta: string }[];
}

export const PREVIEW_COLUMNS: PreviewColumn[] = [
  {
    name: 'Mon',
    num: 10,
    cards: [
      { title: 'Onboarding wireframes', category: 'Design', color: 'lav', meta: '2:00 PM · 2/5' },
      { title: 'Team sync', category: 'Meeting', color: 'yellow', meta: '10:00 AM · 0/3' },
    ],
  },
  {
    name: 'Tue',
    num: 11,
    cards: [{ title: 'Auth endpoints', category: 'Dev', color: 'blue', meta: 'All day · 4/8' }],
  },
  {
    name: 'Wed',
    num: 12,
    cards: [
      { title: 'Launch newsletter', category: 'Marketing', color: 'peach', meta: '11:00 AM · 3/6' },
    ],
  },
  {
    name: 'Thu',
    num: 13,
    isToday: true,
    cards: [
      { title: 'Polish empty states', category: 'Design', color: 'lav', meta: '9:30 AM · 1/4' },
      { title: 'Dentist', category: 'Personal', color: 'pink', meta: '5:15 PM · 0/1' },
    ],
  },
  {
    name: 'Fri',
    num: 14,
    cards: [
      {
        title: 'Sprint retro & planning',
        category: 'Meeting',
        color: 'yellow',
        meta: '3:00 PM · 0/4',
      },
    ],
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Week', href: '/app/week' },
      { label: 'Projects', href: '/app/projects' },
      { label: 'Notes', href: '/app/notes' },
      { label: 'Pricing', href: '#why' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '#docs' },
      { label: 'Changelog', href: '#changelog' },
      { label: 'Support', href: '#support' },
    ],
  },
];
