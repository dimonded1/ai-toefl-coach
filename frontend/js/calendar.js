// ═══════════════════════════════════════════════
//  AI TOEFL Coach — Study Calendar
//  Month grid + exam countdown + 8-week roadmap,
//  anchored to the user's start date and prep window.
// ═══════════════════════════════════════════════

const CAL_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let calViewDate = null; // first day of the month currently shown

// ─── Date helpers ────────────────────────────────
function calStartOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function calAddDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function calSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
function calDayDiff(a, b) {
  return Math.round((calStartOfDay(a) - calStartOfDay(b)) / 86400000);
}
const calFmtShort = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const calFmtLong  = d => d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });

// ─── Anchors (start / exam / today) ──────────────
function calAnchors() {
  const profile = loadProfile();
  const start = calStartOfDay(profile.startDate ? new Date(profile.startDate) : new Date());
  const prepDays = profile.preparationDays || 60;
  const exam = calAddDays(start, prepDays);
  const today = calStartOfDay(new Date());
  return { start, exam, today, prepDays };
}

// ─── Init (wire month nav once) ──────────────────
function initCalendar() {
  const prev = document.getElementById("calPrev");
  const next = document.getElementById("calNext");
  const todayBtn = document.getElementById("calToday");
  if (!prev || !next) return;

  prev.addEventListener("click", () => { calShiftMonth(-1); });
  next.addEventListener("click", () => { calShiftMonth(1); });
  if (todayBtn) todayBtn.addEventListener("click", () => { calViewDate = null; renderCalendar(); });
}

function calShiftMonth(delta) {
  const base = calViewDate || calMonthStart(new Date());
  calViewDate = new Date(base.getFullYear(), base.getMonth() + delta, 1);
  renderCalendar();
}
function calMonthStart(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// ─── Main render ─────────────────────────────────
function renderCalendar() {
  const a = calAnchors();
  renderCalCountdown(a);
  renderCalMonth(a);
  renderCalRoadmap(a);
}

// ── Countdown header ──
function renderCalCountdown({ start, exam, today, prepDays }) {
  const el = document.getElementById("calCountdown");
  if (!el) return;

  const daysLeft = Math.max(0, calDayDiff(exam, today));
  const elapsed  = Math.min(prepDays, Math.max(0, calDayDiff(today, start)));
  const pct      = prepDays > 0 ? Math.min(100, Math.round((elapsed / prepDays) * 100)) : 0;
  const started  = today >= start;
  const finished = today >= exam;

  el.innerHTML = `
    <div class="cal-count-main">
      <div class="cal-count-num">${daysLeft}</div>
      <div class="cal-count-unit">days<br>to exam</div>
    </div>
    <div class="cal-count-meta">
      <div class="cal-count-row">
        <span class="cal-count-label">🎯 Exam day</span>
        <span class="cal-count-val">${calFmtLong(exam)}</span>
      </div>
      <div class="cal-count-row">
        <span class="cal-count-label">🚀 Started</span>
        <span class="cal-count-val">${calFmtLong(start)}</span>
      </div>
      <div class="cal-count-row">
        <span class="cal-count-label">📆 Prep window</span>
        <span class="cal-count-val">${prepDays} days · ${elapsed} elapsed</span>
      </div>
      <div class="cal-progress-track">
        <div class="cal-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="cal-count-note">
        ${finished ? "🏁 Exam window reached — final review time."
          : started ? `${pct}% of your preparation time has passed.`
          : "Your preparation starts on the date above."}
      </div>
    </div>`;
}

// ── Month grid ──
function renderCalMonth({ start, exam, today }) {
  const grid = document.getElementById("calGrid");
  const wd   = document.getElementById("calWeekdays");
  const title = document.getElementById("calMonthTitle");
  const legend = document.getElementById("calLegend");
  if (!grid) return;

  const view = calViewDate || calMonthStart(today);
  const y = view.getFullYear();
  const m = view.getMonth();

  title.textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  wd.innerHTML = CAL_WEEKDAYS.map(d => `<div class="cal-wd">${d}</div>`).join("");

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const leadBlanks = (new Date(y, m, 1).getDay() + 6) % 7; // Mon-first
  const cells = [];

  for (let i = 0; i < leadBlanks; i++) cells.push(`<div class="cal-cell blank"></div>`);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const inWindow = date >= start && date <= exam;
    const isToday  = calSameDay(date, today);
    const isExam   = calSameDay(date, exam);
    const isStart  = calSameDay(date, start);
    const isPast   = date < today;

    const cls = ["cal-cell"];
    if (inWindow) cls.push("in-window");
    if (isPast && inWindow && !isToday) cls.push("past");
    if (isStart) cls.push("start");
    if (isExam) cls.push("exam");
    if (isToday) cls.push("today");

    const marker = isExam ? `<span class="cal-flag">🎯</span>`
      : isStart ? `<span class="cal-flag">🚀</span>`
      : (inWindow && !isToday) ? `<span class="cal-dot"></span>` : "";

    cells.push(`<div class="${cls.join(" ")}"><span class="cal-day-num">${d}</span>${marker}</div>`);
  }

  while (cells.length % 7 !== 0) cells.push(`<div class="cal-cell blank"></div>`);
  grid.innerHTML = cells.join("");

  if (legend) {
    legend.innerHTML = `
      <span class="cal-leg"><span class="cal-leg-swatch today"></span> Today</span>
      <span class="cal-leg"><span class="cal-leg-swatch start"></span> Start 🚀</span>
      <span class="cal-leg"><span class="cal-leg-swatch exam"></span> Exam 🎯</span>
      <span class="cal-leg"><span class="cal-leg-swatch window"></span> Study window</span>`;
  }
}

// ── 8-week roadmap ──
function renderCalRoadmap({ start, today, prepDays }) {
  const el = document.getElementById("calRoadmap");
  if (!el) return;

  const weeks = (typeof TOEFL_REFERENCE_DB !== "undefined" && Array.isArray(TOEFL_REFERENCE_DB.studyCalendar))
    ? TOEFL_REFERENCE_DB.studyCalendar : [];
  if (!weeks.length) {
    el.innerHTML = `<p class="placeholder-text">No study roadmap available.</p>`;
    return;
  }

  const phaseLen = prepDays / weeks.length; // adapt the 8 phases to the prep window
  el.innerHTML = weeks.map((wk, i) => {
    const pStart = calAddDays(start, Math.round(i * phaseLen));
    const pEnd   = calAddDays(start, Math.round((i + 1) * phaseLen) - 1);
    const status = today > pEnd ? "done" : (today >= pStart ? "active" : "upcoming");
    const badge  = status === "done" ? "✅ Done" : status === "active" ? "🔵 In progress" : "⚪ Upcoming";

    return `
      <div class="cal-phase ${status}">
        <div class="cal-phase-rail"><span class="cal-phase-bullet"></span></div>
        <div class="cal-phase-body">
          <div class="cal-phase-head">
            <span class="cal-phase-week">Week ${wk.week}</span>
            <span class="cal-phase-dates">${calFmtShort(pStart)} – ${calFmtShort(pEnd)}</span>
            <span class="cal-phase-status ${status}">${badge}</span>
          </div>
          <div class="cal-phase-focus">${escapeHtml(wk.focus)}</div>
          <div class="cal-phase-tasks">
            ${(wk.tasks || []).map(t => `<span class="cal-task-chip">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
      </div>`;
  }).join("");
}

// Self-init once the DOM is ready (independent of app.js init order).
document.addEventListener("DOMContentLoaded", initCalendar);
