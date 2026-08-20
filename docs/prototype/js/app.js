/* ==========================================================================
   Litmus prototype — application logic
   Small hand-rolled renderer: mutate `state`, call render(), diff-free.
   Everything is in memory; a reload restores the seed data in js/data.js.
   ========================================================================== */

/* ------------------------------------------------------------------ utils */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const icon = (name, cls = "icon") => `<svg class="${cls}"><use href="#i-${name}"/></svg>`;
const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const catColor = (c) => CATEGORIES[c] || "lav";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS = { todo: "To Do", progress: "In Progress", done: "Done" };

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseIso = (s) => new Date(s + "T00:00:00");
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

/* ------------------------------------------------------------------ state */
const state = {
  view: "week",
  weekOffset: 0,
  tasks: structuredClone(SEED_TASKS),
  projects: structuredClone(SEED_PROJECTS),
  projectTasks: structuredClone(SEED_PROJECT_TASKS),
  notes: structuredClone(SEED_NOTES),
  taskQuery: "",
  projectQuery: "",
  noteQuery: "",
  projectsLayout: "grid",
  openTask: null,
  openProject: null,
  projectTab: "list",
  activeNote: "n-components",
  mobileDay: WEEK.todayIso,
  composerDay: null,
  modal: null,
  palette: false,
  paletteQuery: "",
  paletteIndex: 0
};

/* Week model for the current offset. Offset 0 is the designed week. */
function weekDays() {
  const start = addDays(parseIso(WEEK.days[0].iso), state.weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    return {
      iso: iso(d),
      name: DAY_SHORT[d.getDay()],
      long: `${DAY_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`,
      num: d.getDate(),
      isToday: iso(d) === WEEK.todayIso
    };
  });
}

function weekLabel(days) {
  const a = parseIso(days[0].iso);
  const b = parseIso(days[6].iso);
  const left = `${MONTHS[a.getMonth()]} ${a.getDate()}`;
  const right =
    a.getMonth() === b.getMonth() ? `${b.getDate()}` : `${MONTHS[b.getMonth()]} ${b.getDate()}`;
  return `${left} – ${right}, ${b.getFullYear()}`;
}

/* ------------------------------------------------------------ note lookup */
function walkNotes(nodes, fn, parent = null) {
  for (const n of nodes) {
    fn(n, parent);
    if (n.children) walkNotes(n.children, fn, n);
  }
}
function findNote(id) {
  let hit = null;
  walkNotes(state.notes, (n) => { if (n.id === id) hit = n; });
  return hit;
}
function allNotes() {
  const out = [];
  walkNotes(state.notes, (n) => { if (n.type === "note") out.push(n); });
  return out;
}
const projectById = (id) => state.projects.find((p) => p.id === id);
const taskById = (id) => state.tasks.find((t) => t.id === id);

/* ================================================================ RENDER == */
function render() {
  $$(".rail-item").forEach((b) => {
    const on = b.dataset.nav === (state.view === "project" ? "projects" : state.view);
    b.setAttribute("aria-current", on ? "page" : "false");
    if (!on) b.removeAttribute("aria-current");
  });

  document.querySelector(".app").classList.toggle("panel-open", !!state.openTask);
  $("#view-week").hidden = state.view !== "week";
  $("#view-projects").hidden = state.view !== "projects";
  $("#view-project").hidden = state.view !== "project";
  $("#view-notes").hidden = state.view !== "notes";

  if (state.view === "week") renderWeek();
  if (state.view === "projects") renderProjects();
  if (state.view === "project") renderProjectDetail();
  if (state.view === "notes") renderNotes();

  renderPanel();
  renderModal();
  renderPalette();
}

/* ------------------------------------------------------------------- week */
function visibleTasks() {
  const q = state.taskQuery.trim().toLowerCase();
  if (!q) return state.tasks;
  return state.tasks.filter((t) => {
    const p = t.project ? projectById(t.project)?.name : "";
    return (t.title + " " + t.category + " " + (p || "")).toLowerCase().includes(q);
  });
}

function taskCard(t) {
  const p = t.project ? projectById(t.project) : null;
  const doneSubs = t.subtasks.filter((s) => s[1]).length;
  return `
    <button class="task ${t.status === "done" ? "is-done" : ""} ${state.openTask === t.id ? "is-selected" : ""}"
            draggable="true" data-task="${t.id}">
      <div class="task-top">
        <span class="task-title">${esc(t.title)}</span>
        <span class="muted" style="opacity:.5">${icon("more", "icon icon-sm")}</span>
      </div>
      ${p ? `<span class="task-project">${icon("folder", "icon icon-sm")}${esc(p.name)}</span>` : ""}
      <div class="task-foot">
        <span class="chip" data-color="${catColor(t.category)}"><i class="dot"></i>${esc(t.category)}</span>
        <span class="task-meta">
          ${t.time ? `<span>${icon("clock", "icon icon-sm")}${esc(t.time)}</span>` : ""}
          ${t.subtasks.length ? `<span>${icon("checkbox", "icon icon-sm")}${doneSubs}/${t.subtasks.length}</span>` : ""}
        </span>
      </div>
    </button>`;
}

function renderWeek() {
  const days = weekDays();
  const tasks = visibleTasks();
  const inWeek = tasks.filter((t) => days.some((d) => d.iso === t.day));
  $("#week-sub").textContent = `${weekLabel(days)} · ${inWeek.length} ${inWeek.length === 1 ? "task" : "tasks"}`;

  if (!days.some((d) => d.iso === state.mobileDay)) state.mobileDay = days[3].iso;

  $("#day-pills").innerHTML = days
    .map(
      (d) => `<button class="day-pill ${d.iso === state.mobileDay ? "is-selected" : ""}" data-day-pill="${d.iso}">
        ${d.name[0]}<b>${d.num}</b></button>`
    )
    .join("");

  $("#board").innerHTML = days
    .map((d) => {
      const list = tasks.filter((t) => t.day === d.iso);
      return `
      <section class="day ${d.isToday ? "is-today" : ""} ${d.iso === state.mobileDay ? "is-selected" : ""}"
               data-day="${d.iso}">
        <header class="day-head">
          <span class="day-name">${d.name}</span>
          <span class="day-num">${d.num}</span>
          <span class="day-count">${list.length}</span>
        </header>
        <div class="day-list" data-drop="${d.iso}">
          ${list.map(taskCard).join("")}
          ${
            state.composerDay === d.iso
              ? `<form class="composer" data-composer="${d.iso}">
                   <input name="title" placeholder="What needs doing?" autocomplete="off" />
                   <div class="composer-row">
                     <select name="category">${Object.keys(CATEGORIES)
                       .map((c) => `<option>${c}</option>`)
                       .join("")}</select>
                     <button class="btn btn--primary" style="height:28px;padding:0 12px;font-size:12px">Add</button>
                     <button type="button" class="btn--icon" data-action="close-composer">${icon("x", "icon icon-sm")}</button>
                   </div>
                 </form>`
              : `<button class="add-task" data-add-day="${d.iso}">${icon("plus", "icon icon-sm")} Add a task</button>`
          }
        </div>
      </section>`;
    })
    .join("");

  if (state.composerDay) $(`[data-composer="${state.composerDay}"] input`)?.focus();
}

/* --------------------------------------------------------------- projects */
function projectCard(p) {
  return `
    <button class="project-card" data-project="${p.id}" data-color="${p.color}">
      <div class="project-head">
        <span class="project-icon">${icon("folder", "icon icon-lg")}</span>
        <span style="flex:1;text-align:left">
          <span class="project-name" style="display:block">${esc(p.name)}</span>
          <span class="project-count">${p.taskCount} tasks</span>
        </span>
        <span class="muted" style="opacity:.5">${icon("more", "icon icon-sm")}</span>
      </div>
      <p class="project-desc">${esc(p.desc)}</p>
      <div>
        <div class="progress-row"><span>Progress</span><b>${p.progress}%</b></div>
        <div class="progress"><span style="width:${p.progress}%"></span></div>
      </div>
      <div class="project-foot">
        <span class="row gap-6">${icon("calendar", "icon icon-sm")} ${p.due} due this week</span>
        <span class="avatar-stack">${p.team
          .map((k) => `<span class="avatar" data-color="${PEOPLE[k].color}">${k}</span>`)
          .join("")}</span>
      </div>
    </button>`;
}

function renderProjects() {
  const q = state.projectQuery.trim().toLowerCase();
  const list = state.projects.filter((p) => (p.name + " " + p.desc).toLowerCase().includes(q));
  const total = state.projects.reduce((n, p) => n + p.taskCount, 0);
  $("#projects-sub").textContent = state.projects.length
    ? `${state.projects.length} active projects · ${total} tasks`
    : "0 active projects";

  $$("#layout-switch button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.layout === state.projectsLayout))
  );

  const body = $("#projects-body");

  if (!state.projects.length) {
    body.innerHTML = emptyState(
      "folder",
      "No projects yet",
      "Create a project to group related tasks, track progress, and plan them into your week.",
      `<button class="btn btn--primary" data-action="new-project">${icon("plus", "icon icon-sm")} New Project</button>`
    );
    return;
  }
  if (!list.length) {
    body.innerHTML = emptyState("search", "No matches", `Nothing matches “${esc(state.projectQuery)}”.`);
    return;
  }

  if (state.projectsLayout === "grid") {
    body.innerHTML = `<div class="project-grid">${list.map(projectCard).join("")}</div>`;
  } else {
    body.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr><th>Project</th><th>Progress</th><th>Tasks</th><th>Due</th><th>Team</th></tr></thead>
      <tbody>${list
        .map(
          (p) => `<tr data-project="${p.id}">
        <td><span class="cell-name" data-color="${p.color}">
          <span class="dot" style="width:10px;height:10px"></span>
          <span><b>${esc(p.name)}</b><small>Updated ${p.updated}</small></span></span></td>
        <td data-color="${p.color}"><div class="row gap-10"><div class="progress" style="flex:1"><span style="width:${p.progress}%"></span></div><b style="font-size:12px">${p.progress}%</b></div></td>
        <td class="muted">${p.taskCount} tasks</td>
        <td class="muted">${p.due} due</td>
        <td><span class="avatar-stack">${p.team
          .map((k) => `<span class="avatar" data-color="${PEOPLE[k].color}">${k}</span>`)
          .join("")}</span></td>
      </tr>`
        )
        .join("")}</tbody></table></div>`;
  }
}

function emptyState(ic, title, body, action = "") {
  return `<div class="empty">
    <span class="empty-art">${icon(ic, "icon icon-lg")}</span>
    <h3>${title}</h3><p>${body}</p>${action ? `<div style="margin-top:10px">${action}</div>` : ""}
  </div>`;
}

/* --------------------------------------------------------- project detail */
function renderProjectDetail() {
  const p = projectById(state.openProject);
  if (!p) { state.view = "projects"; return render(); }

  const tasks = state.projectTasks.filter((t) => t.project === p.id);
  const groups = ["todo", "progress", "done"];

  const taskRow = (t) => `
    <button class="ptask ${t.status === "done" ? "is-done" : ""}" data-ptask="${t.id}">
      <span class="check" aria-checked="${t.status === "done"}" data-ptoggle="${t.id}">${icon("check")}</span>
      <span class="t">${esc(t.title)}</span>
      <span class="chip" data-color="${catColor(t.category)}"><i class="dot"></i>${esc(t.category)}</span>
      ${t.due ? `<span class="chip chip--plain">${icon("calendar", "icon icon-sm")} ${esc(t.due)}</span>` : ""}
      <span class="avatar" data-color="${PEOPLE[t.assignee].color}">${t.assignee}</span>
    </button>`;

  const boardCard = (t) => `
    <div class="task" draggable="true" data-ptask-drag="${t.id}">
      <div class="task-top"><span class="task-title">${esc(t.title)}</span></div>
      <div class="task-foot">
        <span class="chip" data-color="${catColor(t.category)}"><i class="dot"></i>${esc(t.category)}</span>
        <span class="task-meta">${t.due ? `<span>${icon("calendar", "icon icon-sm")}${esc(t.due)}</span>` : ""}
          <span class="avatar" data-color="${PEOPLE[t.assignee].color}">${t.assignee}</span></span>
      </div>
    </div>`;

  $("#view-project").innerHTML = `
    <header class="topbar">
      <div style="min-width:0">
        <div class="crumbs">
          <button data-action="back-projects">Projects</button><span>/</span><b>${esc(p.name)}</b>
        </div>
        <h1>${esc(p.name)}</h1>
      </div>
      <div class="topbar-tools">
        <div class="segmented" id="project-tabs">
          <button data-tab="list" aria-pressed="${state.projectTab === "list"}">${icon("rows", "icon icon-sm")} List</button>
          <button data-tab="board" aria-pressed="${state.projectTab === "board"}">${icon("kanban", "icon icon-sm")} Board</button>
        </div>
        <button class="btn desktop-only">${icon("share", "icon icon-sm")} Share</button>
        <button class="btn btn--primary" data-action="new-project-task">${icon("plus", "icon icon-sm")} New Task</button>
      </div>
    </header>

    <div class="detail">
      <div class="detail-main" data-color="${p.color}">
        <p class="project-desc" style="min-height:0;font-size:13px">${esc(p.desc)}</p>
        <div style="margin:16px 0 4px">
          <div class="progress-row"><span>Progress</span><b>${p.progress}% · ${p.done} of ${p.taskCount} tasks done</b></div>
          <div class="progress"><span style="width:${p.progress}%"></span></div>
        </div>
        <div class="stat-row">
          <span class="stat"><b>${p.taskCount}</b><span>Tasks</span></span>
          <span class="stat"><b>${p.due}</b><span>Due this week</span></span>
          <span class="stat"><b>${p.members.length}</b><span>Members</span></span>
          <span class="stat"><b>${p.priority}</b><span>Priority</span></span>
        </div>
        <p class="hint">${icon("bulb", "icon icon-sm")} Tasks with a due date automatically appear on your Week board.</p>

        ${
          state.projectTab === "list"
            ? groups
                .map((g) => {
                  const items = tasks.filter((t) => t.status === g);
                  if (!items.length) return "";
                  return `<div class="group">
                    <div class="group-head">${STATUS[g]}<span class="day-count">${items.length}</span></div>
                    ${items.map(taskRow).join("")}</div>`;
                })
                .join("")
            : `<div class="kanban">${groups
                .map(
                  (g) => `<div class="kanban-col" data-pdrop="${g}">
                    <div class="group-head">${STATUS[g]}<span class="day-count">${
                    tasks.filter((t) => t.status === g).length
                  }</span></div>
                    <div class="stack" style="gap:8px">${tasks
                      .filter((t) => t.status === g)
                      .map(boardCard)
                      .join("")}</div></div>`
                )
                .join("")}</div>`
        }
      </div>

      <aside class="detail-side">
        <div class="side-card">
          <span class="label--caps">About</span>
          <p>${esc(p.about)}</p>
        </div>
        <div class="side-card">
          <span class="label--caps">Details</span>
          <div class="kv"><span class="k">Status</span><span class="v">${p.status}</span></div>
          <div class="kv"><span class="k">Priority</span><span class="v">${p.priority}</span></div>
          <div class="kv"><span class="k">Colour</span><span class="v" data-color="${p.color}"><i class="dot"></i> ${p.color}</span></div>
          <div class="kv"><span class="k">Due date</span><span class="v">${p.dueDate}</span></div>
          <div class="kv"><span class="k">Created</span><span class="v">${p.created}</span></div>
        </div>
        <div class="side-card">
          <span class="label--caps">Members · ${p.members.length}</span>
          ${p.members
            .map(
              (k) => `<div class="member"><span class="avatar" data-color="${PEOPLE[k].color}">${k}</span>
              <span><span class="n" style="display:block">${PEOPLE[k].name}</span><span class="r">${PEOPLE[k].role}</span></span></div>`
            )
            .join("")}
          <button class="dashed" style="margin-top:10px">${icon("plus", "icon icon-sm")} Invite member</button>
        </div>
        <div class="side-card">
          <span class="label--caps">Linked notes · ${p.notes.length}</span>
          ${
            p.notes.length
              ? p.notes
                  .map((id) => {
                    const n = findNote(id);
                    return n
                      ? `<button class="linked-note" data-open-note="${id}">${icon("file", "icon icon-sm")}
                        <span><span class="t" style="display:block">${esc(n.name)}</span><span class="s">${n.edited}</span></span>
                        ${icon("out", "icon icon-sm")}</button>`
                      : "";
                  })
                  .join("")
              : `<p class="muted" style="font-size:12.5px">No notes linked yet.</p>`
          }
          <button class="dashed" style="margin-top:10px" data-action="link-note">${icon("plus", "icon icon-sm")} Link a note</button>
        </div>
      </aside>
    </div>`;
}

/* ------------------------------------------------------------------ notes */
function renderNotes() {
  const q = state.noteQuery.trim().toLowerCase();

  const branch = (nodes, depth = 0) =>
    nodes
      .map((n) => {
        if (n.type === "folder") {
          const kids = branch(n.children, depth + 1);
          if (q && !kids.trim() && !n.name.toLowerCase().includes(q)) return "";
          return `<div>
            <button class="tree-row is-folder ${n.open ? "is-open" : ""}" data-folder="${n.id}">
              ${icon("right", "icon icon-sm caret")}${icon("folder", "icon icon-sm")}<span>${esc(n.name)}</span>
            </button>
            ${n.open || q ? `<div class="tree-children">${kids}</div>` : ""}
          </div>`;
        }
        if (q && !n.name.toLowerCase().includes(q)) return "";
        return `<button class="tree-row ${state.activeNote === n.id ? "is-active" : ""}" data-note="${n.id}">
          <span style="width:14px"></span>${icon("file", "icon icon-sm")}<span>${esc(n.name)}</span>
        </button>`;
      })
      .join("");

  $("#tree").innerHTML = branch(state.notes) || `<p class="muted" style="padding:12px;font-size:12.5px">No notes found.</p>`;

  const n = findNote(state.activeNote);
  const editor = $("#editor");

  if (!n || n.type !== "note") {
    editor.innerHTML = emptyState(
      "note",
      "No note open",
      "Select a note from the sidebar to start reading, or create a new one to begin writing.",
      `<div class="row gap-10"><button class="btn btn--primary" data-action="new-note">${icon("plus", "icon icon-sm")} New Note</button>
       <button class="btn" data-action="new-folder">${icon("folder", "icon icon-sm")} New Folder</button></div>`
    );
    return;
  }

  const p = n.project ? projectById(n.project) : null;
  editor.innerHTML = `
    <div class="editor-bar">
      <button class="btn--icon mobile-only" data-action="notes-list">${icon("left")}</button>
      <div class="crumbs" style="margin:0;flex:1;min-width:0">
        ${p ? `<button data-open-project="${p.id}">${esc(p.name)}</button><span>/</span>` : ""}
        <b>${esc(n.name)}</b>
      </div>
      <span class="muted" style="font-size:11.5px">${n.edited}</span>
      <button class="btn--icon" title="Favourite">${icon("star")}</button>
      <button class="btn--icon" title="More">${icon("more")}</button>
    </div>
    <div class="editor-scroll">
      <article class="doc">
        <h1 contenteditable="true" spellcheck="false" data-edit="name">${esc(n.name)}</h1>
        <div class="doc-meta">
          ${
            p
              ? `<span class="muted" style="font-size:12px">Part of</span>
                 <span class="chip" data-color="${p.color}"><i class="dot"></i>${esc(p.name)}</span>`
              : ""
          }
          ${n.task ? `<span class="muted">·</span><span class="chip" data-color="lav">${icon("checkbox", "icon icon-sm")}${esc(n.task)}</span>` : ""}
          <button class="chip chip--plain" data-action="link-note-to" style="color:var(--accent);font-weight:600">
            ${icon("plus", "icon icon-sm")} ${p ? "Link" : "Link project or task"}
          </button>
        </div>
        <div class="doc-tags">
          ${n.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
          <span>· ${esc(n.updated)}</span>
        </div>
        <div class="note-body" contenteditable="true" spellcheck="false" data-edit="body">${noteBody(n)}</div>
      </article>
    </div>`;
}

/* Expand the shorthand blocks in seed note bodies into real markup */
function noteBody(n) {
  let k = 0;
  return n.body
    .replace(/\[\[checklist\]\]\n([\s\S]*?)\n\[\[\/checklist\]\]/g, (_, inner) =>
      `<div class="checklist">${inner
        .split("\n")
        .map((line) => {
          const m = line.match(/^- \[([ x])\] (.*)$/);
          if (!m) return "";
          const done = m[1] === "x";
          return `<div class="note-check ${done ? "is-done" : ""}" contenteditable="false">
            <span class="check" aria-checked="${done}" data-note-check="${n.id}:${k++}">${icon("check")}</span>
            <span>${m[2]}</span></div>`;
        })
        .join("")}</div>`
    )
    .replace(
      /<div data-callout><b>([\s\S]*?)<\/b><p>([\s\S]*?)<\/p><\/div>/g,
      (_, t, b) => `<div class="callout" contenteditable="false">${icon("bulb")}<div><b>${t}</b><p>${b}</p></div></div>`
    );
}

/* ================================================================ PANEL === */
function renderPanel() {
  const root = $("#panel-root");
  const t = state.openTask ? taskById(state.openTask) : null;
  if (!t) { root.innerHTML = ""; return; }

  const p = t.project ? projectById(t.project) : null;
  const day = parseIso(t.day);
  const doneSubs = t.subtasks.filter((s) => s[1]).length;
  const pct = t.subtasks.length ? (doneSubs / t.subtasks.length) * 100 : 0;

  root.innerHTML = `
  <aside class="panel" role="dialog" aria-label="Task detail">
    <header class="panel-head">
      <button class="btn--icon" data-action="close-panel" title="Close (Esc)">${icon("arrow-right")}</button>
      <span class="spacer"></span>
      <button class="btn--icon" title="Favourite">${icon("star")}</button>
      <button class="btn--icon" title="More">${icon("more")}</button>
    </header>

    <div class="panel-body">
      <h2 class="panel-title" contenteditable="true" spellcheck="false" data-edit="task-title">${esc(t.title)}</h2>

      <div class="panel-section">
        <span class="label--caps">Status</span>
        <div class="status-switch">
          ${Object.entries(STATUS)
            .map(
              ([k, v]) => `<button data-status="${k}" aria-pressed="${t.status === k}">
                <i class="dot" style="background:${
                  k === "todo" ? "var(--text-muted)" : k === "progress" ? "var(--accent)" : "var(--dot-mint)"
                }"></i>${v}</button>`
            )
            .join("")}
        </div>
      </div>

      <div class="meta-list">
        <div class="meta-row">${icon("tag")}<span class="k">Category</span>
          <span class="v"><span class="chip" data-color="${catColor(t.category)}"><i class="dot"></i>
          <select data-field="category" style="font-size:11px;font-weight:600">${Object.keys(CATEGORIES)
            .map((c) => `<option ${c === t.category ? "selected" : ""}>${c}</option>`)
            .join("")}</select></span></span>
        </div>
        <div class="meta-row">${icon("folder")}<span class="k">Project</span>
          <span class="v"><select data-field="project">
            <option value="">None</option>
            ${state.projects
              .map((pr) => `<option value="${pr.id}" ${pr.id === t.project ? "selected" : ""}>${esc(pr.name)}</option>`)
              .join("")}
          </select>${p ? `<i class="dot" data-color="${p.color}"></i>` : ""}</span>
        </div>
        <div class="meta-row">${icon("calendar")}<span class="k">Date</span>
          <span class="v"><input type="date" data-field="day" value="${t.day}" /></span>
        </div>
        <div class="meta-row">${icon("clock")}<span class="k">Time</span>
          <span class="v">${esc(t.time)}${t.timeEnd ? " – " + esc(t.timeEnd) : ""}</span>
        </div>
        <div class="meta-row">${icon("flag")}<span class="k">Priority</span>
          <span class="v"><select data-field="priority">${["High", "Medium", "Low"]
            .map((x) => `<option ${x === t.priority ? "selected" : ""}>${x}</option>`)
            .join("")}</select></span>
        </div>
        <div class="meta-row">${icon("user")}<span class="k">Assignee</span>
          <span class="v"><span class="avatar" data-color="${PEOPLE[t.assignee].color}">${t.assignee}</span>
          ${PEOPLE[t.assignee].name}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="panel-section">
        <span class="label--caps">Description</span>
        <p class="panel-desc" contenteditable="true" spellcheck="false" data-edit="task-desc">${
          esc(t.desc) || "<span class='muted'>Add a description…</span>"
        }</p>
      </div>

      <div class="panel-section">
        <span class="label--caps">Linked notes</span>
        ${t.notes
          .map((id) => {
            const n = findNote(id);
            return n
              ? `<button class="linked-note" data-open-note="${id}">${icon("file", "icon icon-sm")}
                 <span><span class="t" style="display:block">${esc(n.name)}</span><span class="s">${n.edited}</span></span>
                 ${icon("out", "icon icon-sm")}</button>`
              : "";
          })
          .join("")}
        <button class="dashed" style="margin-top:8px" data-action="link-task-note">${icon("plus", "icon icon-sm")} Link a note</button>
      </div>

      <div class="panel-section">
        <div class="row" style="justify-content:space-between;margin-bottom:9px">
          <span class="label--caps">Subtasks</span>
          <span class="muted" style="font-size:11.5px;font-weight:600">${doneSubs} of ${t.subtasks.length}</span>
        </div>
        <div class="progress" style="margin-bottom:8px"><span style="width:${pct}%"></span></div>
        ${t.subtasks
          .map(
            (s, i) => `<div class="subtask ${s[1] ? "is-done" : ""}">
              <span class="check" aria-checked="${s[1]}" data-subtask="${i}">${icon("check")}</span>
              <span>${esc(s[0])}</span>
              <button class="subtask-del" data-subtask-del="${i}" title="Delete">${icon("trash", "icon icon-sm")}</button>
            </div>`
          )
          .join("")}
        <form data-subtask-add style="margin-top:6px">
          <input class="input" name="label" placeholder="Add subtask…" autocomplete="off" style="padding:9px 12px;font-size:13px" />
        </form>
      </div>
    </div>

    <footer class="panel-foot">
      <button class="btn btn--primary btn--block" data-action="toggle-done">
        ${icon("check-circle", "icon icon-sm")} ${t.status === "done" ? "Mark Incomplete" : "Mark Complete"}
      </button>
      <button class="btn btn--icon" style="width:38px;height:38px" data-action="delete-task" title="Delete task">
        ${icon("trash")}
      </button>
    </footer>
  </aside>`;
}

/* =============================================================== MODALS == */
function renderModal() {
  const root = $("#modal-root");
  if (!state.modal) { root.innerHTML = ""; return; }

  if (state.modal.type === "new-project") {
    const colors = ["mint", "blue", "peach", "lav", "pink", "yellow"];
    const m = state.modal;
    root.innerHTML = `
    <div class="scrim" data-scrim>
      <form class="modal modal--wide" data-form="new-project">
        <header class="modal-head"><h2>New Project</h2>
          <button type="button" class="btn--icon" data-action="close-modal">${icon("x")}</button></header>
        <div class="modal-body">
          <label class="field"><span class="label label--caps">Project name</span>
            <input class="input" name="name" placeholder="e.g. Website Redesign" autocomplete="off"
                   value="${esc(m.name || "")}" required /></label>
          <div class="field"><span class="label label--caps">Colour</span>
            <div class="row gap-10">${colors
              .map(
                (c) => `<button type="button" data-pick-color="${c}" data-color="${c}"
                  style="width:26px;height:26px;border-radius:50%;background:var(--c-solid);display:grid;place-items:center;
                  box-shadow:${c === m.color ? "0 0 0 2px var(--surface),0 0 0 4px var(--c-solid)" : "none"}">
                  ${c === m.color ? `<svg class="icon icon-sm" style="color:#fff;stroke-width:3"><use href="#i-check"/></svg>` : ""}
                </button>`
              )
              .join("")}</div>
          </div>
          <label class="field"><span class="label label--caps">Description</span>
            <textarea class="textarea" name="desc" placeholder="What is this project about?">${esc(m.desc || "")}</textarea></label>
          <div class="field"><span class="label label--caps">Tasks</span>
            ${m.tasks
              .map(
                (t, i) => `<div class="ptask" style="margin-bottom:6px">
                  <span class="check" aria-checked="false"></span>
                  <span class="t">${esc(t)}</span>
                  <button type="button" class="subtask-del" style="opacity:1" data-modal-task-del="${i}">${icon("x", "icon icon-sm")}</button>
                </div>`
              )
              .join("")}
            <input class="input" name="newtask" placeholder="Add a task and press Enter" autocomplete="off"
                   data-modal-task style="padding:9px 12px" />
          </div>
        </div>
        <footer class="modal-foot">
          <button type="button" class="btn" data-action="close-modal">Cancel</button>
          <button class="btn btn--primary">${icon("check", "icon icon-sm")} Create Project</button>
        </footer>
      </form>
    </div>`;
    const nameField = $('[name="name"]', root);
    if (nameField && !nameField.value) nameField.focus();
    return;
  }

  if (state.modal.type === "link-note") {
    const q = (state.modal.query || "").toLowerCase();
    const list = allNotes().filter((n) => n.name.toLowerCase().includes(q));
    root.innerHTML = `
    <div class="scrim" data-scrim>
      <div class="modal modal--wide">
        <div class="palette-input">
          ${icon("search")}
          <input placeholder="Search notes to link…" data-link-search value="${esc(state.modal.query || "")}" />
          <kbd>esc</kbd>
        </div>
        <div class="palette-list">
          <div class="palette-group">Recent notes</div>
          ${
            list.length
              ? list
                  .map((n) => {
                    const p = n.project ? projectById(n.project) : null;
                    return `<button class="palette-item" data-link-pick="${n.id}">
                      ${icon("file")}<span>${esc(n.name)}</span>
                      <span class="s">${p ? esc(p.name) : "Notes"}</span></button>`;
                  })
                  .join("")
              : `<p class="muted" style="padding:14px">No notes match.</p>`
          }
        </div>
        <div class="palette-foot"><kbd>↵</kbd> Select <kbd>esc</kbd> Close</div>
      </div>
    </div>`;
    $("[data-link-search]", root)?.focus();
  }
}

/* ======================================================= COMMAND PALETTE = */
function paletteItems() {
  const q = state.paletteQuery.trim().toLowerCase();
  const items = [
    { g: "Go to", label: "Week", ic: "calendar", run: () => go("week") },
    { g: "Go to", label: "Projects", ic: "folder", run: () => go("projects") },
    { g: "Go to", label: "Notes", ic: "note", run: () => go("notes") },
    { g: "Actions", label: "New task", ic: "plus", run: () => { go("week"); openComposer(WEEK.todayIso); } },
    { g: "Actions", label: "New project", ic: "plus", run: () => { go("projects"); state.modal = { type: "new-project", color: "mint", tasks: [] }; } },
    { g: "Actions", label: "New note", ic: "note", run: () => { go("notes"); newNote(); } },
    { g: "Actions", label: "Toggle dark mode", ic: "moon", run: toggleTheme },
    ...state.projects.map((p) => ({ g: "Projects", label: p.name, ic: "folder", sub: `${p.taskCount} tasks`, run: () => openProject(p.id) })),
    ...allNotes().map((n) => ({ g: "Notes", label: n.name, ic: "file", sub: n.edited, run: () => openNote(n.id) })),
    ...state.tasks.map((t) => ({ g: "Tasks", label: t.title, ic: "checkbox", sub: t.time, run: () => { go("week"); state.openTask = t.id; } }))
  ];
  return q ? items.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 12) : items.slice(0, 12);
}

function renderPalette() {
  const root = $("#modal-root");
  if (!state.palette) { if (!state.modal) root.innerHTML = ""; return; }

  const items = paletteItems();
  state.paletteIndex = Math.max(0, Math.min(state.paletteIndex, items.length - 1));
  let lastGroup = "";

  root.innerHTML = `
  <div class="scrim" data-scrim style="align-items:flex-start">
    <div class="palette">
      <div class="palette-input">
        ${icon("search")}
        <input placeholder="Search tasks, projects, notes or type a command…" data-palette-input
               value="${esc(state.paletteQuery)}" />
        <kbd>esc</kbd>
      </div>
      <div class="palette-list">
        ${
          items.length
            ? items
                .map((it, i) => {
                  const head = it.g !== lastGroup ? ((lastGroup = it.g), `<div class="palette-group">${it.g}</div>`) : "";
                  return `${head}<button class="palette-item ${i === state.paletteIndex ? "is-active" : ""}"
                    data-palette-run="${i}">${icon(it.ic)}<span>${esc(it.label)}</span>
                    ${it.sub ? `<span class="s">${esc(it.sub)}</span>` : ""}</button>`;
                })
                .join("")
            : `<p class="muted" style="padding:16px">No results.</p>`
        }
      </div>
      <div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Select</span><span><kbd>esc</kbd> Close</span></div>
    </div>
  </div>`;

  const input = $("[data-palette-input]", root);
  input?.focus();
  input?.setSelectionRange(input.value.length, input.value.length);
}

/* ================================================================ ACTIONS */
function toast(msg, ic = "check-circle") {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${icon(ic, "icon icon-sm")} ${esc(msg)}`;
  $("#toasts").append(el);
  setTimeout(() => el.remove(), 2400);
}

function go(view) {
  state.view = view;
  state.palette = false;
  render();
}

function openProject(id) {
  state.openProject = id;
  state.view = "project";
  state.palette = false;
  render();
}

function openNote(id) {
  state.activeNote = id;
  state.view = "notes";
  state.palette = false;
  // make sure every ancestor folder is open
  walkNotes(state.notes, (n) => {
    if (n.children && JSON.stringify(n).includes(`"${id}"`)) n.open = true;
  });
  $("#notes-root")?.classList.remove("show-list");
  render();
}

function openComposer(day) {
  state.composerDay = day;
  render();
}

function newNote() {
  const n = {
    id: uid("n-"), type: "note", name: "Untitled note", edited: "Edited just now",
    project: null, tags: ["#new"], updated: "Updated today",
    body: "<p>Start writing…</p>"
  };
  state.notes.push(n);
  state.activeNote = n.id;
  toast("Note created", "note");
  render();
}

function toggleTheme() {
  const root = document.documentElement;
  const dark = root.dataset.theme === "dark";
  root.dataset.theme = dark ? "light" : "dark";
  $$('[data-action="theme"] use').forEach((u) => u.setAttribute("href", dark ? "#i-moon" : "#i-sun"));
  toast(dark ? "Light mode" : "Dark mode", dark ? "sun" : "moon");
}

function recountProject(id, delta) {
  const p = projectById(id);
  if (!p) return;
  p.done = Math.max(0, Math.min(p.taskCount, p.done + delta));
  p.progress = p.taskCount ? Math.round((p.done / p.taskCount) * 100) : 0;
}

/* ================================================================ EVENTS = */
document.addEventListener("click", (e) => {
  const hit = (sel) => e.target.closest(sel);

  /* --- navigation ---------------------------------------------------- */
  const nav = hit("[data-nav]");
  if (nav) return go(nav.dataset.nav);

  const action = hit("[data-action]")?.dataset.action;

  if (action === "theme") return toggleTheme();
  if (action === "palette") { state.palette = true; state.paletteQuery = ""; state.paletteIndex = 0; return render(); }

  /* --- week ----------------------------------------------------------- */
  if (action === "week-prev") { state.weekOffset--; return render(); }
  if (action === "week-next") { state.weekOffset++; return render(); }
  if (action === "week-today") { state.weekOffset = 0; state.mobileDay = WEEK.todayIso; return render(); }
  if (action === "new-task") return openComposer(weekDays().find((d) => d.isToday)?.iso || weekDays()[0].iso);
  if (action === "close-composer") { state.composerDay = null; return render(); }

  const pill = hit("[data-day-pill]");
  if (pill) { state.mobileDay = pill.dataset.dayPill; return render(); }

  const addDay = hit("[data-add-day]");
  if (addDay) return openComposer(addDay.dataset.addDay);

  const card = hit("[data-task]");
  if (card) { state.openTask = card.dataset.task; return render(); }

  /* --- task panel ------------------------------------------------------ */
  if (action === "close-panel") { state.openTask = null; return render(); }

  const status = hit("[data-status]");
  if (status && state.openTask) {
    taskById(state.openTask).status = status.dataset.status;
    return render();
  }

  const sub = hit("[data-subtask]");
  if (sub && state.openTask) {
    const t = taskById(state.openTask);
    const i = +sub.dataset.subtask;
    t.subtasks[i][1] = !t.subtasks[i][1];
    return render();
  }

  const subDel = hit("[data-subtask-del]");
  if (subDel && state.openTask) {
    taskById(state.openTask).subtasks.splice(+subDel.dataset.subtaskDel, 1);
    return render();
  }

  if (action === "toggle-done") {
    const t = taskById(state.openTask);
    t.status = t.status === "done" ? "todo" : "done";
    if (t.status === "done") t.subtasks.forEach((s) => (s[1] = true));
    toast(t.status === "done" ? "Task completed" : "Task reopened");
    return render();
  }

  if (action === "delete-task") {
    state.tasks = state.tasks.filter((t) => t.id !== state.openTask);
    state.openTask = null;
    toast("Task deleted", "trash");
    return render();
  }

  /* --- projects -------------------------------------------------------- */
  const layout = hit("[data-layout]");
  if (layout) { state.projectsLayout = layout.dataset.layout; return render(); }

  if (action === "new-project") { state.modal = { type: "new-project", color: "mint", tasks: [] }; return render(); }
  if (action === "close-modal") { state.modal = null; return render(); }

  const pick = hit("[data-pick-color]");
  if (pick) { state.modal.color = pick.dataset.pickColor; return render(); }

  const mtd = hit("[data-modal-task-del]");
  if (mtd) { state.modal.tasks.splice(+mtd.dataset.modalTaskDel, 1); return render(); }

  const openP = hit("[data-project]");
  if (openP) return openProject(openP.dataset.project);

  const openPr = hit("[data-open-project]");
  if (openPr) return openProject(openPr.dataset.openProject);

  if (action === "back-projects") { state.view = "projects"; return render(); }

  const tab = hit("[data-tab]");
  if (tab) { state.projectTab = tab.dataset.tab; return render(); }

  const ptoggle = hit("[data-ptoggle]");
  if (ptoggle) {
    const t = state.projectTasks.find((x) => x.id === ptoggle.dataset.ptoggle);
    t.status = t.status === "done" ? "todo" : "done";
    recountProject(t.project, t.status === "done" ? 1 : -1);
    return render();
  }

  if (action === "new-project-task") {
    const p = projectById(state.openProject);
    state.projectTasks.push({
      id: uid("pt"), project: p.id, title: "New task", category: "Design",
      status: "todo", due: "", assignee: p.members[0]
    });
    p.taskCount++;
    recountProject(p.id, 0);
    toast("Task added to " + p.name, "plus");
    return render();
  }

  /* --- linking notes --------------------------------------------------- */
  if (action === "link-note" || action === "link-task-note" || action === "link-note-to") {
    state.modal = { type: "link-note", query: "", target: action };
    return render();
  }

  const linkPick = hit("[data-link-pick]");
  if (linkPick) {
    const id = linkPick.dataset.linkPick;
    const target = state.modal.target;
    if (target === "link-note" && state.openProject) {
      const p = projectById(state.openProject);
      if (!p.notes.includes(id)) p.notes.push(id);
    } else if (target === "link-task-note" && state.openTask) {
      const t = taskById(state.openTask);
      if (!t.notes.includes(id)) t.notes.push(id);
    } else if (target === "link-note-to") {
      toast("Linked to " + findNote(id).name, "link");
    }
    state.modal = null;
    toast("Note linked", "link");
    return render();
  }

  const openNoteBtn = hit("[data-open-note]");
  if (openNoteBtn) return openNote(openNoteBtn.dataset.openNote);

  /* --- notes ----------------------------------------------------------- */
  const folder = hit("[data-folder]");
  if (folder) {
    const f = findNote(folder.dataset.folder);
    f.open = !f.open;
    return render();
  }

  const noteBtn = hit("[data-note]");
  if (noteBtn) {
    state.activeNote = noteBtn.dataset.note;
    $("#notes-root")?.classList.remove("show-list");
    return render();
  }

  if (action === "notes-list") return $("#notes-root").classList.add("show-list");
  if (action === "new-note") return newNote();
  if (action === "new-folder") {
    state.notes.push({ id: uid("f-"), type: "folder", name: "New folder", open: true, children: [] });
    toast("Folder created", "folder");
    return render();
  }

  const noteCheck = hit("[data-note-check]");
  if (noteCheck) {
    const [id, i] = noteCheck.dataset.noteCheck.split(":");
    const n = findNote(id);
    let k = 0;
    n.body = n.body.replace(/^- \[([ x])\] /gm, (m, v) => (k++ === +i ? `- [${v === "x" ? " " : "x"}] ` : m));
    return render();
  }

  const inlineNote = hit(".note-body a[data-note]");
  if (inlineNote) { e.preventDefault(); return openNote(inlineNote.dataset.note); }

  /* --- palette --------------------------------------------------------- */
  const run = hit("[data-palette-run]");
  if (run) {
    const it = paletteItems()[+run.dataset.paletteRun];
    state.palette = false;
    it.run();
    return render();
  }

  /* --- dismiss --------------------------------------------------------- */
  if (e.target.matches?.("[data-scrim]")) {
    state.modal = null;
    state.palette = false;
    return render();
  }
});

/* ------------------------------------------------------------ form submit */
document.addEventListener("submit", (e) => {
  const f = e.target;

  if (f.matches?.("[data-composer]")) {
    e.preventDefault();
    const title = f.elements.title.value.trim();
    if (!title) return;
    state.tasks.push({
      id: uid("t"), title, day: f.dataset.composer, category: f.elements.category.value,
      project: null, time: "", timeEnd: "", status: "todo", priority: "Medium",
      assignee: "NK", desc: "", notes: [], subtasks: []
    });
    state.composerDay = null;
    toast("Task added", "plus");
    return render();
  }

  if (f.matches?.("[data-subtask-add]")) {
    e.preventDefault();
    const v = f.elements.label.value.trim();
    if (!v) return;
    taskById(state.openTask).subtasks.push([v, false]);
    return render();
  }

  if (f.matches?.('[data-form="new-project"]')) {
    e.preventDefault();
    const name = f.elements.name.value.trim();
    if (!name) return;
    const p = {
      id: uid("p"), name, color: state.modal.color, taskCount: state.modal.tasks.length,
      done: 0, progress: 0, due: 0, updated: "just now", team: ["NK"],
      desc: f.elements.desc.value.trim() || "No description yet.",
      about: f.elements.desc.value.trim() || "No description yet.",
      status: "Active", priority: "Medium", dueDate: "—", created: "Today",
      members: ["NK"], notes: []
    };
    state.projects.unshift(p);
    state.modal.tasks.forEach((title) =>
      state.projectTasks.push({ id: uid("pt"), project: p.id, title, category: "Design", status: "todo", due: "", assignee: "NK" })
    );
    state.modal = null;
    toast(`“${name}” created`, "folder");
    return render();
  }
});

/* --------------------------------------------------------------- keyboard */
document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    state.palette = !state.palette;
    state.paletteQuery = "";
    state.paletteIndex = 0;
    return render();
  }

  if (state.palette) {
    const items = paletteItems();
    if (e.key === "ArrowDown") { e.preventDefault(); state.paletteIndex = (state.paletteIndex + 1) % items.length; return render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); state.paletteIndex = (state.paletteIndex - 1 + items.length) % items.length; return render(); }
    if (e.key === "Enter") {
      e.preventDefault();
      const it = items[state.paletteIndex];
      state.palette = false;
      if (it) it.run();
      return render();
    }
  }

  if (e.key === "Escape") {
    if (state.palette) { state.palette = false; return render(); }
    if (state.modal) { state.modal = null; return render(); }
    if (state.composerDay) { state.composerDay = null; return render(); }
    if (state.openTask) { state.openTask = null; return render(); }
    return;
  }

  if (typing) return;

  if (e.key === "1") return go("week");
  if (e.key === "2") return go("projects");
  if (e.key === "3") return go("notes");
  if (e.key.toLowerCase() === "d") return toggleTheme();
  if (e.key.toLowerCase() === "n" && state.view === "week") return openComposer(WEEK.todayIso);
  if (state.view === "week" && e.key === "ArrowLeft") { state.weekOffset--; return render(); }
  if (state.view === "week" && e.key === "ArrowRight") { state.weekOffset++; return render(); }
});

/* ------------------------------------------------------- panel meta fields */
document.addEventListener("change", (e) => {
  const field = e.target.dataset.field;
  if (!field || !state.openTask) return;
  const t = taskById(state.openTask);
  t[field] = field === "project" ? e.target.value || null : e.target.value;
  if (field === "day") toast("Task rescheduled", "calendar");
  render();
});

/* ------------------------------------------------------------------ input */
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.id === "task-search") { state.taskQuery = t.value; renderWeek(); return; }
  if (t.id === "project-search") { state.projectQuery = t.value; renderProjects(); return; }
  if (t.id === "note-search") { state.noteQuery = t.value; renderNotes(); return; }

  if (t.matches?.("[data-palette-input]")) {
    state.paletteQuery = t.value;
    state.paletteIndex = 0;
    return renderPalette();
  }
  if (t.closest('[data-form="new-project"]') && (t.name === "name" || t.name === "desc")) {
    state.modal[t.name] = t.value;
    return;
  }
  if (t.matches?.("[data-link-search]")) {
    state.modal.query = t.value;
    return renderModal();
  }
});

/* Enter inside the "add a task" field of the New Project modal */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || !e.target.matches?.("[data-modal-task]")) return;
  e.preventDefault();
  const v = e.target.value.trim();
  if (!v) return;
  state.modal.tasks.push(v);
  render();
  $("[data-modal-task]")?.focus();
});

/* ------------------------------------------------------- inline editing */
document.addEventListener("focusout", (e) => {
  const f = e.target.dataset?.edit;
  if (!f) return;

  if (f === "task-title" && state.openTask) taskById(state.openTask).title = e.target.textContent.trim();
  if (f === "task-desc" && state.openTask) taskById(state.openTask).desc = e.target.textContent.trim();

  if (f === "name") {
    const n = findNote(state.activeNote);
    n.name = e.target.textContent.trim() || "Untitled";
    n.edited = "Edited just now";
  }
  if (f === "body") {
    const n = findNote(state.activeNote);
    n.body = e.target.innerHTML;
    n.edited = "Edited just now";
  }
  render();
});

/* --------------------------------------------- selection formatting bar */
document.addEventListener("selectionchange", () => {
  const bar = $(".format-bar");
  const sel = document.getSelection();
  const inNote = sel?.anchorNode && $("#editor")?.contains(sel.anchorNode);

  if (!sel || sel.isCollapsed || !inNote) { bar?.remove(); return; }

  const rect = sel.getRangeAt(0).getBoundingClientRect();
  const el = bar || Object.assign(document.createElement("div"), {
    className: "format-bar",
    innerHTML:
      [["bold", "bold"], ["italic", "italic"], ["strike", "strikeThrough"], ["underline", "underline"]]
        .map(([i, c]) => `<button data-cmd="${c}">${icon(i, "icon icon-sm")}</button>`)
        .join("") +
      `<span class="sep"></span><button data-cmd="createLink">${icon("link", "icon icon-sm")}</button>
       <button data-cmd="formatBlock:pre">${icon("code", "icon icon-sm")}</button>`
  });

  if (!bar) document.body.append(el);
  el.style.left = `${Math.max(12, rect.left + rect.width / 2 - 100)}px`;
  el.style.top = `${rect.top + window.scrollY - 46}px`;
});

document.addEventListener("mousedown", (e) => {
  const cmd = e.target.closest("[data-cmd]")?.dataset.cmd;
  if (!cmd) return;
  e.preventDefault();
  const [name, arg] = cmd.split(":");
  if (name === "createLink") document.execCommand("createLink", false, "#");
  else document.execCommand(name, false, arg);
});

/* ------------------------------------------------------------ drag & drop */
let dragged = null;

document.addEventListener("dragstart", (e) => {
  const card = e.target.closest("[data-task], [data-ptask-drag]");
  if (!card) return;
  dragged = card;
  card.classList.add("is-dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", card.dataset.task || card.dataset.ptaskDrag);
});

document.addEventListener("dragend", () => {
  dragged?.classList.remove("is-dragging");
  $$(".is-over").forEach((n) => n.classList.remove("is-over"));
  dragged = null;
});

document.addEventListener("dragover", (e) => {
  const zone = e.target.closest("[data-drop], [data-pdrop]");
  if (!zone) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  $$(".is-over").forEach((n) => n.classList.remove("is-over"));
  (zone.closest(".day") || zone).classList.add("is-over");
});

document.addEventListener("drop", (e) => {
  const zone = e.target.closest("[data-drop], [data-pdrop]");
  if (!zone || !dragged) return;
  e.preventDefault();

  if (zone.dataset.drop && dragged.dataset.task) {
    const t = taskById(dragged.dataset.task);
    if (t.day !== zone.dataset.drop) {
      t.day = zone.dataset.drop;
      const d = parseIso(t.day);
      toast(`Moved to ${DAY_LONG[d.getDay()]}`, "arrow-right");
    }
  }

  if (zone.dataset.pdrop && dragged.dataset.ptaskDrag) {
    const t = state.projectTasks.find((x) => x.id === dragged.dataset.ptaskDrag);
    const was = t.status;
    t.status = zone.dataset.pdrop;
    if (was !== t.status) recountProject(t.project, t.status === "done" ? 1 : was === "done" ? -1 : 0);
    toast(`Moved to ${STATUS[t.status]}`, "arrow-right");
  }

  dragged = null;
  render();
});

/* ------------------------------------------------------------------ boot */
if (location.hash.slice(1)) state.view = location.hash.slice(1);
render();
