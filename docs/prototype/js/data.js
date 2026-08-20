/* ==========================================================================
   Litmus prototype — seed data
   Content mirrors docs/ui-design.pen so the demo reads exactly like the design.
   State lives in memory: reloading the page restores this pristine dataset,
   which keeps repeat demos predictable.
   ========================================================================== */

const WEEK = {
  label: "August 10 – 16, 2026",
  todayIso: "2026-08-13",
  days: [
    { iso: "2026-08-10", name: "Mon", num: 10, long: "Monday, Aug 10" },
    { iso: "2026-08-11", name: "Tue", num: 11, long: "Tuesday, Aug 11" },
    { iso: "2026-08-12", name: "Wed", num: 12, long: "Wednesday, Aug 12" },
    { iso: "2026-08-13", name: "Thu", num: 13, long: "Thursday, Aug 13" },
    { iso: "2026-08-14", name: "Fri", num: 14, long: "Friday, Aug 14" },
    { iso: "2026-08-15", name: "Sat", num: 15, long: "Saturday, Aug 15" },
    { iso: "2026-08-16", name: "Sun", num: 16, long: "Sunday, Aug 16" }
  ]
};

/* Task categories → pastel family from the design tokens */
const CATEGORIES = {
  Design: "lav",
  Dev: "blue",
  Marketing: "peach",
  Meeting: "yellow",
  Research: "mint",
  Personal: "pink",
  QA: "peach",
  Docs: "blue"
};

const PEOPLE = {
  NK: { name: "Nuwan K.", role: "Owner", color: "peach" },
  AL: { name: "Alex L.", role: "Designer", color: "blue" },
  JS: { name: "Jordan S.", role: "Engineer", color: "pink" },
  ML: { name: "Mia L.", role: "Product", color: "mint" }
};

const SEED_PROJECTS = [
  {
    id: "p1",
    name: "Design System",
    color: "mint",
    taskCount: 12,
    done: 8,
    progress: 68,
    due: 3,
    updated: "2h ago",
    team: ["NK", "AL"],
    desc: "Component library, tokens, and documentation for the pastel UI kit.",
    about:
      "A unified pastel design system powering the weekly planner across web and mobile — tokens, components, and usage docs.",
    status: "Active",
    priority: "High",
    dueDate: "Aug 30, 2026",
    created: "Jul 28, 2026",
    members: ["NK", "AL", "JS", "ML"],
    notes: ["n-components", "n-tokens", "n-guidelines"]
  },
  {
    id: "p2",
    name: "Mobile App",
    color: "blue",
    taskCount: 18,
    done: 7,
    progress: 42,
    due: 5,
    updated: "1d ago",
    team: ["NK", "JS", "ML"],
    desc: "iOS and Android build of the weekly planner with offline sync.",
    about: "Native clients that stay in sync with the web workspace, including an offline-first task queue.",
    status: "Active",
    priority: "High",
    dueDate: "Sep 12, 2026",
    created: "Jun 02, 2026",
    members: ["NK", "JS", "ML"],
    notes: ["n-mobile"]
  },
  {
    id: "p3",
    name: "Q3 Marketing",
    color: "peach",
    taskCount: 9,
    done: 7,
    progress: 80,
    due: 2,
    updated: "3h ago",
    team: ["AL"],
    desc: "Launch newsletter, social campaign, and landing page refresh.",
    about: "Everything shipping for the Q3 push: newsletter, social, and the refreshed landing page.",
    status: "Active",
    priority: "Medium",
    dueDate: "Sep 30, 2026",
    created: "Jul 01, 2026",
    members: ["AL", "NK"],
    notes: []
  },
  {
    id: "p4",
    name: "Product Launch",
    color: "lav",
    taskCount: 24,
    done: 7,
    progress: 30,
    due: 6,
    updated: "5h ago",
    team: ["NK", "JS"],
    desc: "Coordinate release across design, engineering, and marketing teams.",
    about: "The cross-functional plan for launch week — comms, release gates, and day-one support.",
    status: "Active",
    priority: "High",
    dueDate: "Oct 05, 2026",
    created: "May 19, 2026",
    members: ["NK", "JS", "AL"],
    notes: ["n-roadmap"]
  },
  {
    id: "p5",
    name: "User Research",
    color: "pink",
    taskCount: 7,
    done: 4,
    progress: 55,
    due: 1,
    updated: "1d ago",
    team: ["ML"],
    desc: "Interviews, surveys, and usability testing for the onboarding flow.",
    about: "Discovery work feeding the onboarding redesign: interviews, surveys, and usability sessions.",
    status: "Active",
    priority: "Medium",
    dueDate: "Aug 29, 2026",
    created: "Jul 14, 2026",
    members: ["ML", "AL"],
    notes: []
  },
  {
    id: "p6",
    name: "Website Redesign",
    color: "yellow",
    taskCount: 15,
    done: 3,
    progress: 20,
    due: 4,
    updated: "2d ago",
    team: ["JS", "AL"],
    desc: "Marketing site rebuild with refreshed brand and CMS migration.",
    about: "Rebuilding litmus.so on the new brand, with a CMS migration and a faster publishing flow.",
    status: "Active",
    priority: "Low",
    dueDate: "Nov 01, 2026",
    created: "Jun 21, 2026",
    members: ["JS", "AL"],
    notes: []
  }
];

/* Tasks on the Week board. subtasks: [label, done] */
const SEED_TASKS = [
  {
    id: "t1", title: "Finalize onboarding flow wireframes", day: "2026-08-10",
    category: "Design", project: "p1", time: "2:00 PM", timeEnd: "3:30 PM",
    status: "progress", priority: "High", assignee: "NK",
    desc: "Wireframe the five-step onboarding, including the empty week state and the first-project nudge.",
    notes: ["n-components"],
    subtasks: [["Map the current flow", true], ["Sketch step 1–3", true], ["Sketch step 4–5", false], ["Review with Alex", false], ["Hand off to build", false]]
  },
  {
    id: "t2", title: "Weekly sync with product team", day: "2026-08-10",
    category: "Meeting", project: null, time: "10:00 AM", timeEnd: "10:45 AM",
    status: "todo", priority: "Medium", assignee: "NK",
    desc: "Standing Monday sync — review last week's ship list and lock this week's priorities.",
    notes: [],
    subtasks: [["Prep agenda", false], ["Share notes", false], ["File follow-ups", false]]
  },
  {
    id: "t3", title: "Set up authentication endpoints", day: "2026-08-11",
    category: "Dev", project: "p2", time: "All day", timeEnd: "",
    status: "progress", priority: "High", assignee: "JS",
    desc: "Sign-in, sign-up, refresh, and password reset endpoints behind the new session service.",
    notes: [],
    subtasks: [["Scaffold routes", true], ["Session storage", true], ["Password reset", true], ["Rate limiting", true], ["OAuth: Google", false], ["OAuth: Apple", false], ["Integration tests", false], ["Docs", false]]
  },
  {
    id: "t4", title: "Review competitor pricing pages", day: "2026-08-11",
    category: "Research", project: null, time: "4:30 PM", timeEnd: "5:30 PM",
    status: "todo", priority: "Low", assignee: "ML",
    desc: "Pull apart how five comparable tools frame their free tier and annual discount.",
    notes: [],
    subtasks: [["Collect screenshots", true], ["Write the summary", false]]
  },
  {
    id: "t5", title: "Draft newsletter for launch week", day: "2026-08-12",
    category: "Marketing", project: "p3", time: "11:00 AM", timeEnd: "12:30 PM",
    status: "progress", priority: "Medium", assignee: "AL",
    desc: "Three-section newsletter: what shipped, what's next, and the invite to the live demo.",
    notes: [],
    subtasks: [["Outline sections", true], ["Draft copy", true], ["Pick screenshots", true], ["Internal review", false], ["Schedule send", false], ["Prep follow-up", false]]
  },
  {
    id: "t6", title: "Polish empty states & illustrations", day: "2026-08-13",
    category: "Design", project: "p1", time: "9:30 AM", timeEnd: "11:00 AM",
    status: "progress", priority: "High", assignee: "NK",
    desc: "Refine the illustrations for empty dashboard, search, and inbox states. Keep the pastel palette consistent and export at 2x for retina displays.",
    notes: ["n-components", "n-guidelines"],
    subtasks: [["Audit current empty state screens", true], ["Sketch three illustration concepts", false], ["Design final illustrations in pastel", false], ["Export assets at 2x", false]]
  },
  {
    id: "t7", title: "Fix drag-and-drop card bug", day: "2026-08-13",
    category: "Dev", project: "p2", time: "1:00 PM", timeEnd: "2:00 PM",
    status: "todo", priority: "High", assignee: "JS",
    desc: "Cards dropped on the last column snap back when the board is horizontally scrolled.",
    notes: [],
    subtasks: [["Reproduce on iPad", false], ["Fix drop target maths", false]]
  },
  {
    id: "t8", title: "Dentist appointment", day: "2026-08-13",
    category: "Personal", project: null, time: "5:15 PM", timeEnd: "6:00 PM",
    status: "todo", priority: "Low", assignee: "NK",
    desc: "",
    notes: [],
    subtasks: [["Leave by 4:45", false]]
  },
  {
    id: "t9", title: "Sprint retro & planning", day: "2026-08-14",
    category: "Meeting", project: "p4", time: "3:00 PM", timeEnd: "4:30 PM",
    status: "todo", priority: "Medium", assignee: "NK",
    desc: "Close out sprint 14 and shape the launch-week sprint.",
    notes: [],
    subtasks: [["Collect retro notes", false], ["Groom the backlog", false], ["Set sprint goal", false], ["Book the room", false]]
  },
  {
    id: "t10", title: "Schedule social posts", day: "2026-08-14",
    category: "Marketing", project: "p3", time: "Noon", timeEnd: "1:00 PM",
    status: "progress", priority: "Low", assignee: "AL",
    desc: "Queue the launch-week thread and two teaser posts.",
    notes: [],
    subtasks: [["Write the thread", true], ["Design the cards", true], ["Queue in Buffer", false]]
  },
  {
    id: "t11", title: "Grocery run & meal prep", day: "2026-08-15",
    category: "Personal", project: null, time: "Morning", timeEnd: "",
    status: "todo", priority: "Low", assignee: "NK",
    desc: "",
    notes: [],
    subtasks: [["Write the list", false]]
  },
  {
    id: "t12", title: "Read design systems article", day: "2026-08-16",
    category: "Research", project: null, time: "Evening", timeEnd: "",
    status: "todo", priority: "Low", assignee: "NK",
    desc: "The long piece on token naming that Alex shared in #design.",
    notes: ["n-tokens"],
    subtasks: [["Read and highlight", false]]
  }
];

/* Tasks that belong to a project board (Project → Detail → Board) */
const SEED_PROJECT_TASKS = [
  { id: "pt1", project: "p1", title: "Define spacing scale tokens", category: "Design", status: "todo", due: "Aug 15", assignee: "NK" },
  { id: "pt2", project: "p1", title: "Audit color contrast ratios", category: "QA", status: "todo", due: "", assignee: "AL" },
  { id: "pt3", project: "p1", title: "Design elevation & shadows", category: "Design", status: "todo", due: "Aug 18", assignee: "NK" },
  { id: "pt4", project: "p1", title: "Build Button component", category: "Dev", status: "progress", due: "Aug 13", assignee: "NK" },
  { id: "pt5", project: "p1", title: "Document form patterns", category: "Docs", status: "progress", due: "", assignee: "AL" },
  { id: "pt6", project: "p1", title: "Set up component library", category: "Design", status: "done", due: "", assignee: "NK" },
  { id: "pt7", project: "p1", title: "Define type ramp", category: "Design", status: "done", due: "", assignee: "AL" },
  { id: "pt8", project: "p2", title: "Offline sync queue", category: "Dev", status: "progress", due: "Aug 20", assignee: "JS" },
  { id: "pt9", project: "p2", title: "Push notification setup", category: "Dev", status: "todo", due: "", assignee: "JS" },
  { id: "pt10", project: "p2", title: "Design phone day view", category: "Design", status: "done", due: "", assignee: "AL" },
  { id: "pt11", project: "p3", title: "Write launch newsletter", category: "Marketing", status: "progress", due: "Aug 18", assignee: "AL" },
  { id: "pt12", project: "p3", title: "Refresh landing hero", category: "Design", status: "done", due: "", assignee: "AL" },
  { id: "pt13", project: "p4", title: "Lock release checklist", category: "Docs", status: "todo", due: "Aug 25", assignee: "NK" },
  { id: "pt14", project: "p5", title: "Recruit five participants", category: "Research", status: "progress", due: "Aug 19", assignee: "ML" },
  { id: "pt15", project: "p6", title: "Migrate blog to new CMS", category: "Dev", status: "todo", due: "Sep 02", assignee: "JS" }
];

/* Notes tree. Folders hold children; notes hold body HTML. */
const SEED_NOTES = [
  {
    id: "f-start", type: "folder", name: "Getting Started", open: true,
    children: [
      {
        id: "n-welcome", type: "note", name: "Welcome", edited: "Edited 3d ago",
        project: null, tags: ["#start"], updated: "Updated Aug 10, 2026",
        body: `<p>Litmus keeps three things in one place: the <strong>week</strong> you are actually working, the <strong>projects</strong> that work belongs to, and the <strong>notes</strong> that explain it.</p>
<h2>Start here</h2>
<ul><li>Open the <strong>Week</strong> board and drag a card to another day.</li><li>Create a project, then link a note to it.</li><li>Press <kbd>⌘</kbd><kbd>K</kbd> to jump anywhere.</li></ul>
<p>Nothing here is precious — this is a demo workspace, so poke at it.</p>`
      },
      {
        id: "n-shortcuts", type: "note", name: "Keyboard Shortcuts", edited: "Edited 3d ago",
        project: null, tags: ["#reference"], updated: "Updated Aug 10, 2026",
        body: `<h2>Everywhere</h2>
<ul><li><strong>⌘K</strong> — command palette</li><li><strong>1 / 2 / 3</strong> — Week, Projects, Notes</li><li><strong>D</strong> — toggle dark mode</li></ul>
<h2>Week board</h2>
<ul><li><strong>N</strong> — new task on today</li><li><strong>← / →</strong> — previous or next week</li><li><strong>Esc</strong> — close the task panel</li></ul>`
      }
    ]
  },
  {
    id: "f-projects", type: "folder", name: "Projects", open: true,
    children: [
      {
        id: "f-ds", type: "folder", name: "Design System", open: true,
        children: [
          {
            id: "n-tokens", type: "note", name: "Tokens", edited: "Edited 1d ago",
            project: "p1", tags: ["#design-system", "#tokens"], updated: "Updated Aug 12, 2026",
            body: `<p>Tokens are the contract between design and code. Rename one here and it changes everywhere.</p>
<h2>Colour</h2>
<ul><li>Six pastel families — lavender, mint, peach, blue, yellow, pink.</li><li>Each family has a soft fill and a saturated dot.</li><li>Dark mode swaps the ramp, never the family.</li></ul>
<pre>--pastel-mint: #D6EFE4;
--dot-mint:    #8ED3B5;</pre>`
          },
          {
            id: "n-components", type: "note", name: "Components", edited: "Edited 2h ago",
            project: "p1", task: "Build Button component",
            tags: ["#design-system", "#ui", "#components"], updated: "Updated Aug 13, 2026",
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
<p>See also: <a href="#" data-note="n-tokens">Design Tokens</a> · <a href="#" data-note="n-guidelines">Guidelines</a></p>`
          },
          {
            id: "n-guidelines", type: "note", name: "Guidelines", edited: "Edited 3d ago",
            project: "p1", tags: ["#design-system"], updated: "Updated Aug 10, 2026",
            body: `<p>How to use the kit without fighting it.</p>
<h2>Rules of thumb</h2>
<ul><li>One accent per screen. The blue is for the primary action, nothing else.</li><li>Pastels carry meaning — category and project, never decoration.</li><li>Prefer a border over a shadow. Prefer nothing over a border.</li></ul>
<div data-callout><b>Before you add a card</b><p>If a container has no structural or functional job, delete the container and keep the content.</p></div>`
          }
        ]
      },
      {
        id: "f-mobile", type: "folder", name: "Mobile App", open: false,
        children: [
          {
            id: "n-mobile", type: "note", name: "Offline sync", edited: "Edited 4d ago",
            project: "p2", tags: ["#mobile", "#sync"], updated: "Updated Aug 09, 2026",
            body: `<p>Every mutation goes into a local queue first and replays on reconnect. Conflicts resolve last-write-wins, except for subtask completion which merges.</p>
<ol><li>Write to the local store.</li><li>Enqueue the mutation.</li><li>Replay on reconnect, oldest first.</li></ol>`
          }
        ]
      },
      {
        id: "n-roadmap", type: "note", name: "Roadmap 2026", edited: "Edited 1w ago",
        project: "p4", tags: ["#planning"], updated: "Updated Aug 04, 2026",
        body: `<h2>Q3</h2>
<ul><li>Notes module — nested folders, backlinks, live markdown.</li><li>Command palette everywhere.</li></ul>
<h2>Q4</h2>
<ul><li>Mobile apps out of beta.</li><li>Shared workspaces and per-project permissions.</li></ul>`
      }
    ]
  },
  {
    id: "f-daily", type: "folder", name: "Daily Notes", open: true,
    children: [
      {
        id: "n-0813", type: "note", name: "2026-08-13", edited: "Edited 2h ago",
        project: null, tags: ["#daily"], updated: "Updated Aug 13, 2026",
        body: `<p>Three things today: empty states, the drag bug, and the dentist.</p>
[[checklist]]
- [x] Audit current empty state screens
- [ ] Sketch three illustration concepts
- [ ] Reproduce the drag bug on iPad
[[/checklist]]
<p>Alex raised that the mint and blue dots read almost identically at 7px. Worth widening the gap.</p>`
      },
      {
        id: "n-0812", type: "note", name: "2026-08-12", edited: "Edited 1d ago",
        project: null, tags: ["#daily"], updated: "Updated Aug 12, 2026",
        body: `<p>Newsletter draft is done through section two. Pricing research came back thinner than hoped — only two of the five publish an annual discount.</p>`
      }
    ]
  },
  {
    id: "n-ideas", type: "note", name: "Ideas", edited: "Edited 5d ago",
    project: null, tags: ["#someday"], updated: "Updated Aug 08, 2026",
    body: `<ul><li>Week review email on Sunday evening — what moved, what slipped.</li><li>Drag a note onto a day to turn it into a task.</li><li>Focus mode: one day, nothing else on screen.</li></ul>`
  },
  {
    id: "n-reading", type: "note", name: "Reading List", edited: "Edited 1w ago",
    project: null, tags: ["#reading"], updated: "Updated Aug 06, 2026",
    body: `[[checklist]]
- [x] Naming tokens without going mad
- [ ] The cost of a design system nobody uses
- [ ] Calm software, revisited
[[/checklist]]`
  }
];
