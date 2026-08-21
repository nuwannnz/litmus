import type { NoteNode } from '../types';

/**
 * Note bodies use the prototype's shorthand: HTML, plus `[[checklist]]` blocks
 * and `<div data-callout>` blocks that `parseNoteBody` turns into components.
 */
export const SEED_NOTES: NoteNode[] = [
  {
    id: 'f-start',
    type: 'folder',
    name: 'Getting Started',
    open: true,
    children: [
      {
        id: 'n-welcome',
        type: 'note',
        name: 'Welcome',
        edited: 'Edited 3d ago',
        projectId: null,
        tags: ['#start'],
        updated: 'Updated Aug 10, 2026',
        body: `<p>Litmus keeps three things in one place: the <strong>week</strong> you are actually working, the <strong>projects</strong> that work belongs to, and the <strong>notes</strong> that explain it.</p>
<h2>Start here</h2>
<ul><li>Open the <strong>Week</strong> board and drag a card to another day.</li><li>Create a project, then link a note to it.</li><li>Press <kbd>⌘</kbd><kbd>K</kbd> to jump anywhere.</li></ul>
<p>Nothing here is precious — this is a demo workspace, so poke at it.</p>`,
      },
      {
        id: 'n-shortcuts',
        type: 'note',
        name: 'Keyboard Shortcuts',
        edited: 'Edited 3d ago',
        projectId: null,
        tags: ['#reference'],
        updated: 'Updated Aug 10, 2026',
        body: `<h2>Everywhere</h2>
<ul><li><strong>⌘K</strong> — command palette</li><li><strong>1 / 2 / 3</strong> — Week, Projects, Notes</li><li><strong>D</strong> — toggle dark mode</li></ul>
<h2>Week board</h2>
<ul><li><strong>N</strong> — new task on today</li><li><strong>← / →</strong> — previous or next week</li><li><strong>Esc</strong> — close the task panel</li></ul>`,
      },
    ],
  },
  {
    id: 'f-projects',
    type: 'folder',
    name: 'Projects',
    open: true,
    children: [
      {
        id: 'f-ds',
        type: 'folder',
        name: 'Design System',
        open: true,
        children: [
          {
            id: 'n-tokens',
            type: 'note',
            name: 'Tokens',
            edited: 'Edited 1d ago',
            projectId: 'p1',
            tags: ['#design-system', '#tokens'],
            updated: 'Updated Aug 12, 2026',
            body: `<p>Tokens are the contract between design and code. Rename one here and it changes everywhere.</p>
<h2>Colour</h2>
<ul><li>Six pastel families — lavender, mint, peach, blue, yellow, pink.</li><li>Each family has a soft fill and a saturated dot.</li><li>Dark mode swaps the ramp, never the family.</li></ul>
<pre>--pastel-mint: #D6EFE4;
--dot-mint:    #8ED3B5;</pre>`,
          },
          {
            id: 'n-components',
            type: 'note',
            name: 'Components',
            edited: 'Edited 2h ago',
            projectId: 'p1',
            task: 'Build Button component',
            tags: ['#design-system', '#ui', '#components'],
            updated: 'Updated Aug 13, 2026',
            body: `<p>Reusable building blocks of the pastel design system. Every component ships with design tokens, sensible variants, and clear usage guidance so teams can move fast without breaking consistency.</p>
<ul><li><strong>Consistency</strong> — shared tokens keep color, spacing, and type uniform across web and mobile.</li><li><strong>Accessibility</strong> — every component meets WCAG AA contrast out of the box.</li><li><strong>Simplicity</strong> — sensible defaults with minimal configuration.</li></ul>
[[checklist]]
- [x] Define color &amp; spacing tokens
- [x] Build Button component
- [ ] Document form patterns
- [ ] Audit contrast ratios
[[/checklist]]
<div data-callout><b>Tip</b><p>Type “/” to insert a block, or select text to format it inline — markdown shortcuts like **bold**, *italic*, and # heading render live as you type.</p></div>
<ol><li>Import the component from the shared library.</li><li>Compose it with tokens and the available variants.</li><li>Theme it via the pastel palette — light and dark are both supported.</li></ol>
<pre>&lt;Button variant="primary" size="md"&gt;
  Save changes
&lt;/Button&gt;</pre>
<p>See also: <a href="#" data-note="n-tokens">Design Tokens</a> · <a href="#" data-note="n-guidelines">Guidelines</a></p>`,
          },
          {
            id: 'n-guidelines',
            type: 'note',
            name: 'Guidelines',
            edited: 'Edited 3d ago',
            projectId: 'p1',
            tags: ['#design-system'],
            updated: 'Updated Aug 10, 2026',
            body: `<p>How to use the kit without fighting it.</p>
<h2>Rules of thumb</h2>
<ul><li>One accent per screen. The blue is for the primary action, nothing else.</li><li>Pastels carry meaning — category and project, never decoration.</li><li>Prefer a border over a shadow. Prefer nothing over a border.</li></ul>
<div data-callout><b>Before you add a card</b><p>If a container has no structural or functional job, delete the container and keep the content.</p></div>`,
          },
        ],
      },
      {
        id: 'f-mobile',
        type: 'folder',
        name: 'Mobile App',
        open: false,
        children: [
          {
            id: 'n-mobile',
            type: 'note',
            name: 'Offline sync',
            edited: 'Edited 4d ago',
            projectId: 'p2',
            tags: ['#mobile', '#sync'],
            updated: 'Updated Aug 09, 2026',
            body: `<p>Every mutation goes into a local queue first and replays on reconnect. Conflicts resolve last-write-wins, except for subtask completion which merges.</p>
<ol><li>Write to the local store.</li><li>Enqueue the mutation.</li><li>Replay on reconnect, oldest first.</li></ol>`,
          },
        ],
      },
      {
        id: 'n-roadmap',
        type: 'note',
        name: 'Roadmap 2026',
        edited: 'Edited 1w ago',
        projectId: 'p4',
        tags: ['#planning'],
        updated: 'Updated Aug 04, 2026',
        body: `<h2>Q3</h2>
<ul><li>Notes module — nested folders, backlinks, live markdown.</li><li>Command palette everywhere.</li></ul>
<h2>Q4</h2>
<ul><li>Mobile apps out of beta.</li><li>Shared workspaces and per-project permissions.</li></ul>`,
      },
    ],
  },
  {
    id: 'f-daily',
    type: 'folder',
    name: 'Daily Notes',
    open: true,
    children: [
      {
        id: 'n-0813',
        type: 'note',
        name: '2026-08-13',
        edited: 'Edited 2h ago',
        projectId: null,
        tags: ['#daily'],
        updated: 'Updated Aug 13, 2026',
        body: `<p>Three things today: empty states, the drag bug, and the dentist.</p>
[[checklist]]
- [x] Audit current empty state screens
- [ ] Sketch three illustration concepts
- [ ] Reproduce the drag bug on iPad
[[/checklist]]
<p>Alex raised that the mint and blue dots read almost identically at 7px. Worth widening the gap.</p>`,
      },
      {
        id: 'n-0812',
        type: 'note',
        name: '2026-08-12',
        edited: 'Edited 1d ago',
        projectId: null,
        tags: ['#daily'],
        updated: 'Updated Aug 12, 2026',
        body: `<p>Newsletter draft is done through section two. Pricing research came back thinner than hoped — only two of the five publish an annual discount.</p>`,
      },
    ],
  },
  {
    id: 'n-ideas',
    type: 'note',
    name: 'Ideas',
    edited: 'Edited 5d ago',
    projectId: null,
    tags: ['#someday'],
    updated: 'Updated Aug 08, 2026',
    body: `<ul><li>Week review email on Sunday evening — what moved, what slipped.</li><li>Drag a note onto a day to turn it into a task.</li><li>Focus mode: one day, nothing else on screen.</li></ul>`,
  },
  {
    id: 'n-reading',
    type: 'note',
    name: 'Reading List',
    edited: 'Edited 1w ago',
    projectId: null,
    tags: ['#reading'],
    updated: 'Updated Aug 06, 2026',
    body: `[[checklist]]
- [x] Naming tokens without going mad
- [ ] The cost of a design system nobody uses
- [ ] Calm software, revisited
[[/checklist]]`,
  },
];
