// AI TOEFL Coach - Study Calendar

const CALENDAR_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let calendarViewDate = null;
let selectedCalendarDateKey = null;

function calendarEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function calendarStartOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function calendarAddDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function calendarSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function calendarDayDiff(a, b) {
  return Math.round((calendarStartOfDay(a) - calendarStartOfDay(b)) / 86400000);
}

function calendarMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function calendarFormatShort(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function calendarFormatLong(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function calendarDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calendarDateFromKey(key) {
  const [year, month, day] = String(key || "").split("-").map(Number);
  if (!year || !month || !day) return null;
  return calendarStartOfDay(new Date(year, month - 1, day));
}

function getCalendarAnchors() {
  const currentProfile = loadProfile();
  const start = calendarStartOfDay(currentProfile.startDate ? new Date(currentProfile.startDate) : new Date());
  const prepDays = Number(currentProfile.preparationDays) || 60;
  const exam = calendarAddDays(start, prepDays);
  const today = calendarStartOfDay(new Date());
  return { start, exam, today, prepDays };
}

function initCalendar() {
  const prev = document.getElementById("calPrev");
  const next = document.getElementById("calNext");
  const todayBtn = document.getElementById("calToday");
  if (!prev || !next || prev.dataset.bound === "true") return;

  prev.dataset.bound = "true";
  next.dataset.bound = "true";
  prev.addEventListener("click", () => shiftCalendarMonth(-1));
  next.addEventListener("click", () => shiftCalendarMonth(1));
  todayBtn?.addEventListener("click", () => {
    calendarViewDate = null;
    selectedCalendarDateKey = calendarDateKey(new Date());
    renderCalendar();
  });

  document.getElementById("calGrid")?.addEventListener("click", event => {
    const dayButton = event.target.closest("[data-cal-date]");
    if (!dayButton) return;
    selectedCalendarDateKey = dayButton.dataset.calDate;
    renderCalendar();
  });
}

function shiftCalendarMonth(delta) {
  const base = calendarViewDate || calendarMonthStart(new Date());
  calendarViewDate = new Date(base.getFullYear(), base.getMonth() + delta, 1);
  renderCalendar();
}

function renderCalendar() {
  if (!document.getElementById("calGrid")) return;
  const anchors = getCalendarAnchors();
  selectedCalendarDateKey = selectedCalendarDateKey || calendarDateKey(anchors.today);
  renderCalendarCountdown(anchors);
  renderCalendarMonth(anchors);
  renderCalendarRoadmap(anchors);
  renderCalendarSelectedDay(anchors);
}

function renderCalendarCountdown({ start, exam, today, prepDays }) {
  const el = document.getElementById("calCountdown");
  if (!el) return;

  const daysLeft = Math.max(0, calendarDayDiff(exam, today));
  const elapsed = Math.min(prepDays, Math.max(0, calendarDayDiff(today, start)));
  const pct = prepDays > 0 ? Math.min(100, Math.round((elapsed / prepDays) * 100)) : 0;
  const finished = today >= exam;

  el.innerHTML = `
    <div class="cal-count-main">
      <div class="cal-count-num">${daysLeft}</div>
      <div class="cal-count-unit">days<br>to exam</div>
    </div>
    <div class="cal-count-meta">
      <div class="cal-count-row">
        <span class="cal-count-label">Exam day</span>
        <span class="cal-count-val">${calendarFormatLong(exam)}</span>
      </div>
      <div class="cal-count-row">
        <span class="cal-count-label">Started</span>
        <span class="cal-count-val">${calendarFormatLong(start)}</span>
      </div>
      <div class="cal-count-row">
        <span class="cal-count-label">Prep window</span>
        <span class="cal-count-val">${prepDays} days, ${elapsed} elapsed</span>
      </div>
      <div class="cal-progress-track">
        <div class="cal-progress-fill ${percentClass("w", pct)}"></div>
      </div>
      <div class="cal-count-note">
        ${finished ? "Exam window reached. Keep this week for final review." : `${pct}% of your preparation time has passed.`}
      </div>
    </div>`;
}

function renderCalendarMonth({ start, exam, today }) {
  const grid = document.getElementById("calGrid");
  const weekdays = document.getElementById("calWeekdays");
  const title = document.getElementById("calMonthTitle");
  const legend = document.getElementById("calLegend");
  if (!grid || !weekdays || !title) return;

  const view = calendarViewDate || calendarMonthStart(today);
  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [];

  title.textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  weekdays.innerHTML = CALENDAR_WEEKDAYS.map(day => `<div class="cal-wd">${day}</div>`).join("");

  for (let i = 0; i < leadBlanks; i += 1) {
    cells.push(`<div class="cal-cell blank"></div>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const inWindow = date >= start && date <= exam;
    const isToday = calendarSameDay(date, today);
    const isExam = calendarSameDay(date, exam);
    const isStart = calendarSameDay(date, start);
    const isSelected = calendarDateKey(date) === selectedCalendarDateKey;
    const isPast = date < today;
    const cls = ["cal-cell"];

    if (inWindow) cls.push("in-window");
    if (isPast && inWindow && !isToday) cls.push("past");
    if (isStart) cls.push("start");
    if (isExam) cls.push("exam");
    if (isToday) cls.push("today");
    if (isSelected) cls.push("selected");

    const marker = isExam ? `<span class="cal-flag">Exam</span>`
      : isStart ? `<span class="cal-flag">Start</span>`
      : inWindow && !isToday ? `<span class="cal-dot"></span>` : "";

    cells.push(`
      <button class="${cls.join(" ")}" type="button" data-cal-date="${calendarDateKey(date)}" aria-pressed="${isSelected}" aria-label="${calendarEscape(calendarFormatLong(date))}">
        <span class="cal-day-num">${day}</span>${marker}
      </button>`);
  }

  while (cells.length % 7 !== 0) {
    cells.push(`<div class="cal-cell blank"></div>`);
  }
  grid.innerHTML = cells.join("");

  if (legend) {
    legend.innerHTML = `
      <span class="cal-leg"><span class="cal-leg-swatch today"></span> Today</span>
      <span class="cal-leg"><span class="cal-leg-swatch start"></span> Start</span>
      <span class="cal-leg"><span class="cal-leg-swatch exam"></span> Exam</span>
      <span class="cal-leg"><span class="cal-leg-swatch window"></span> Study window</span>`;
  }
}

function getCalendarWeekForDate(date, { start, prepDays }) {
  const weeks = Array.isArray(TOEFL_REFERENCE_DB?.studyCalendar) ? TOEFL_REFERENCE_DB.studyCalendar : [];
  if (!weeks.length) return null;
  const dayIndex = Math.max(0, Math.min(prepDays - 1, calendarDayDiff(date, start)));
  const phaseLen = prepDays / weeks.length;
  const index = Math.max(0, Math.min(weeks.length - 1, Math.floor(dayIndex / Math.max(1, phaseLen))));
  return weeks[index];
}

function renderCalendarSelectedDay({ start, exam, today, prepDays }) {
  const el = document.getElementById("calSelectedDay");
  if (!el) return;

  const selected = calendarDateFromKey(selectedCalendarDateKey) || today;
  const inWindow = selected >= start && selected <= exam;
  const isToday = calendarSameDay(selected, today);
  const isStart = calendarSameDay(selected, start);
  const isExam = calendarSameDay(selected, exam);
  const dayNumber = Math.max(1, Math.min(prepDays, calendarDayDiff(selected, start) + 1));
  const week = inWindow ? getCalendarWeekForDate(selected, { start, prepDays }) : null;
  const tasks = week?.tasks?.length ? week.tasks : [
    "Complete one focused practice set",
    "Review mistakes",
    "Update notes"
  ];

  const status = isExam ? "Exam day"
    : isStart ? "Start day"
    : isToday ? "Today"
    : inWindow ? `Day ${dayNumber} of ${prepDays}`
    : selected < start ? "Before prep window"
    : "After exam window";
  const focus = week?.focus || (inWindow ? "Keep the daily practice loop active." : "Use this day for planning or review.");

  el.innerHTML = `
    <div class="cal-selected-head">
      <span>${calendarEscape(status)}</span>
      <strong>${calendarEscape(calendarFormatLong(selected))}</strong>
    </div>
    <p>${calendarEscape(focus)}</p>
    <div class="cal-selected-tasks">
      ${tasks.slice(0, 3).map(task => `<span>${calendarEscape(task)}</span>`).join("")}
    </div>`;
}

function renderCalendarRoadmap({ start, today, prepDays }) {
  const el = document.getElementById("calRoadmap");
  if (!el) return;

  const weeks = Array.isArray(TOEFL_REFERENCE_DB?.studyCalendar) ? TOEFL_REFERENCE_DB.studyCalendar : [];
  if (!weeks.length) {
    el.innerHTML = `<p class="placeholder-text">No study roadmap available.</p>`;
    return;
  }

  const phaseLen = prepDays / weeks.length;
  el.innerHTML = weeks.map((week, index) => {
    const phaseStart = calendarAddDays(start, Math.round(index * phaseLen));
    const phaseEnd = calendarAddDays(start, Math.round((index + 1) * phaseLen) - 1);
    const status = today > phaseEnd ? "done" : today >= phaseStart ? "active" : "upcoming";
    const label = status === "done" ? "Done" : status === "active" ? "In progress" : "Upcoming";

    return `
      <div class="cal-phase ${status}">
        <div class="cal-phase-rail"><span class="cal-phase-bullet"></span></div>
        <div class="cal-phase-body">
          <div class="cal-phase-head">
            <span class="cal-phase-week">Week ${calendarEscape(week.week)}</span>
            <span class="cal-phase-dates">${calendarFormatShort(phaseStart)} - ${calendarFormatShort(phaseEnd)}</span>
            <span class="cal-phase-status ${status}">${label}</span>
          </div>
          <div class="cal-phase-focus">${calendarEscape(week.focus)}</div>
          <div class="cal-phase-tasks">
            ${(week.tasks || []).map(task => `<span class="cal-task-chip">${calendarEscape(task)}</span>`).join("")}
          </div>
        </div>
      </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", initCalendar);
