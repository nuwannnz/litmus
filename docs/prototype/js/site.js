/* Marketing + auth pages: theme toggle, password peek, and demo form submits
   that simply drop you into the workspace. */

const root = document.documentElement;

document.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-theme-toggle]");
  if (toggle) {
    const dark = root.dataset.theme === "dark";
    root.dataset.theme = dark ? "light" : "dark";
    document
      .querySelectorAll("[data-theme-toggle] use")
      .forEach((u) => u.setAttribute("href", dark ? "#i-moon" : "#i-sun"));
    return;
  }

  const peek = e.target.closest("[data-peek]");
  if (peek) {
    const input = peek.parentElement.querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
    peek.querySelector("use").setAttribute("href", input.type === "password" ? "#i-eye" : "#i-lock");
  }
});

/* Any auth form in the prototype signs you straight in. */
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const go = e.target.dataset.go || "app.html";
  const btn = e.target.querySelector('button[type="submit"], .btn--primary');
  if (btn) btn.textContent = "One moment…";
  setTimeout(() => (location.href = go), 350);
});
