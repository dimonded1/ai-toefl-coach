// AI TOEFL Coach - Main Application

// ─── State ───────────────────────────────────────
let profile = loadProfile();
let accountSyncState = { state: "signed-out", message: "Sign-in required" };
let authGateMode = "register";
let onboardingStepIndex = 0;
const onboardingAnswers = {};
let coachChatHistory = [];
let subscriptionPanelOpen = false;
const THEME_STORAGE_KEY = "toefl_coach_theme";
const LANGUAGE_STORAGE_KEY = "toefl_coach_language";
const SUBSCRIPTION_PROMO_CODE = "Egor_Eagle_228";
const SUBSCRIPTION_TRIAL_DAYS = 3;
const SUBSCRIPTION_WEEK_DAYS = 7;

const AVATAR_TONES = ["teal", "blue", "violet", "rose", "amber", "mint", "indigo", "sky", "green", "pink", "slate", "cyan"];
const AVATAR_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
const AVATAR_IMAGE_SIZE = 256;

const AVATAR_PRESETS = [
  { id: "lion", name: "Lion", emoji: "🦁", bg1: "#ffb703", bg2: "#fb5607", face: "#ffe08a" },
  { id: "elephant", name: "Elephant", emoji: "🐘", bg1: "#8ecae6", bg2: "#5e60ce", face: "#cbd5e1" },
  { id: "monkey", name: "Monkey", emoji: "🐵", bg1: "#f59e0b", bg2: "#92400e", face: "#f8c471" },
  { id: "tiger", name: "Tiger", emoji: "🐯", bg1: "#ff9f1c", bg2: "#ef476f", face: "#ffd166" },
  { id: "panda", name: "Panda", emoji: "🐼", bg1: "#e0f2fe", bg2: "#111827", face: "#ffffff" },
  { id: "giraffe", name: "Giraffe", emoji: "🦒", bg1: "#facc15", bg2: "#ea580c", face: "#fde68a" },
  { id: "zebra", name: "Zebra", emoji: "🦓", bg1: "#f8fafc", bg2: "#334155", face: "#ffffff" },
  { id: "rhino", name: "Rhino", emoji: "🦏", bg1: "#cbd5e1", bg2: "#64748b", face: "#d1d5db" },
  { id: "hippo", name: "Hippo", emoji: "🦛", bg1: "#c4b5fd", bg2: "#7c3aed", face: "#d8b4fe" },
  { id: "bear", name: "Bear", emoji: "🐻", bg1: "#fbbf24", bg2: "#78350f", face: "#d97706" },
  { id: "koala", name: "Koala", emoji: "🐨", bg1: "#dbeafe", bg2: "#64748b", face: "#e2e8f0" },
  { id: "fox", name: "Fox", emoji: "🦊", bg1: "#fb7185", bg2: "#f97316", face: "#fdba74" },
  { id: "wolf", name: "Wolf", emoji: "🐺", bg1: "#93c5fd", bg2: "#1e3a8a", face: "#cbd5e1" },
  { id: "kangaroo", name: "Kangaroo", emoji: "🦘", bg1: "#fca5a5", bg2: "#b45309", face: "#fed7aa" },
  { id: "camel", name: "Camel", emoji: "🐫", bg1: "#fde68a", bg2: "#ca8a04", face: "#fcd34d" },
  { id: "llama", name: "Llama", emoji: "🦙", bg1: "#f5d0fe", bg2: "#a21caf", face: "#fce7f3" },
  { id: "sloth", name: "Sloth", emoji: "🦥", bg1: "#bbf7d0", bg2: "#15803d", face: "#d9f99d" },
  { id: "otter", name: "Otter", emoji: "🦦", bg1: "#67e8f9", bg2: "#0e7490", face: "#a16207" },
  { id: "penguin", name: "Penguin", emoji: "🐧", bg1: "#bae6fd", bg2: "#0f172a", face: "#f8fafc" },
  { id: "flamingo", name: "Flamingo", emoji: "🦩", bg1: "#f9a8d4", bg2: "#db2777", face: "#fbcfe8" },
  { id: "parrot", name: "Parrot", emoji: "🦜", bg1: "#86efac", bg2: "#2563eb", face: "#bbf7d0" },
  { id: "crocodile", name: "Crocodile", emoji: "🐊", bg1: "#a7f3d0", bg2: "#047857", face: "#86efac" },
  { id: "turtle", name: "Turtle", emoji: "🐢", bg1: "#bef264", bg2: "#166534", face: "#bbf7d0" },
  { id: "snake", name: "Snake", emoji: "🐍", bg1: "#fde047", bg2: "#16a34a", face: "#d9f99d" },
  { id: "frog", name: "Frog", emoji: "🐸", bg1: "#bbf7d0", bg2: "#22c55e", face: "#86efac" },
  { id: "owl", name: "Owl", emoji: "🦉", bg1: "#fed7aa", bg2: "#7c2d12", face: "#fdba74" },
  { id: "eagle", name: "Eagle", emoji: "🦅", bg1: "#bfdbfe", bg2: "#1d4ed8", face: "#fef3c7" },
  { id: "peacock", name: "Peacock", emoji: "🦚", bg1: "#5eead4", bg2: "#4f46e5", face: "#99f6e4" },
  { id: "horse", name: "Horse", emoji: "🐴", bg1: "#fdba74", bg2: "#92400e", face: "#fed7aa" },
  { id: "deer", name: "Deer", emoji: "🦌", bg1: "#fef08a", bg2: "#854d0e", face: "#fde68a" }
];

const ONBOARDING_STEPS = [
  {
    key: "targetScore",
    title: "Let's build your TOEFL plan",
    copy: "First, choose the score you want the coach to plan around.",
    options: [
      { value: 70, label: "70", note: "Foundation target" },
      { value: 80, label: "80", note: "Common university minimum" },
      { value: 95, label: "95", note: "Strong academic target" },
      { value: 100, label: "100", note: "Competitive programs" },
      { value: 110, label: "110", note: "Top-score goal" }
    ]
  },
  {
    key: "preparationDays",
    title: "How much time do you have?",
    copy: "Your deadline changes the weekly pace and daily practice load.",
    options: [
      { value: 30, label: "30 days", note: "Fast review" },
      { value: 60, label: "60 days", note: "Balanced plan" },
      { value: 90, label: "90 days", note: "Steady preparation" }
    ]
  },
  {
    key: "level",
    title: "What is your current level?",
    copy: "This helps us estimate your starting point before the diagnostic.",
    options: [
      { value: "beginner", label: "Beginner", note: "I need the basics" },
      { value: "intermediate", label: "Intermediate", note: "I can handle mixed practice" },
      { value: "advanced", label: "Advanced", note: "I need exam polish" }
    ]
  },
  {
    key: "goal",
    title: "Why are you studying?",
    copy: "This context shapes examples, priorities, and the first study focus.",
    options: [
      { value: "study abroad", label: "Study abroad", note: "University admission" },
      { value: "work", label: "Work", note: "Career or relocation" },
      { value: "immigration", label: "Immigration", note: "Documents and requirements" }
    ]
  }
];

const PAGE_TITLES = {
  dashboard: "Dashboard",
  learn: "Learn",
  lesson: "Lesson",
  practice: "Practice",
  aiplan: "Study Plan",
  analytics: "Analytics",
  goal: "Profile"
};

const LANGUAGES = {
  en: { flag: "🇬🇧", label: "English" },
  ru: { flag: "🇷🇺", label: "Русский" },
  fr: { flag: "🇫🇷", label: "Français" },
  es: { flag: "🇪🇸", label: "Español" }
};

const I18N = {
  en: {
    "common.skip": "Skip to content",
    "common.target": "Target",
    "common.day": "Day",
    "common.current": "Current",
    "common.gap": "Gap",
    "common.daysLeft": "Days left",
    "common.level": "Level",
    "common.goal": "Goal",
    "common.today": "Today",
    "common.close": "Close",
    "common.dark": "Dark",
    "common.light": "Light",
    "common.task": "task",
    "common.tasks": "tasks",
    "common.taskCount": "{total} tasks",
    "common.days": "days",
    "common.questions10": "10 questions",
    "brand.subtitle": "Score cockpit",
    "nav.primary": "Primary navigation",
    "nav.openDashboard": "Open dashboard",
    "page.dashboard": "Dashboard",
    "page.learn": "Learn",
    "page.lesson": "Lesson",
    "page.practice": "Practice",
    "page.aiplan": "Study Plan",
    "page.analytics": "Analytics",
    "page.goal": "Profile",
    "theme.toggle": "Toggle color theme",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "language.button": "Language",
    "language.select": "Select language",
    "language.options": "Language options",
    "sidebar.studyStreak": "Study streak",
    "sidebar.reset": "Reset Progress",
    "sidebar.currentToGoal": "Current {current} to Goal {target}",
    "sidebar.dayCount": "{current} / {total}",
    "dashboard.heroTitle": "What should I do right now?",
    "dashboard.defaultInsight": "Run one focused action, then let the coach update your next step.",
    "dashboard.atTarget": "You are at or above target. Keep the rhythm and protect your strongest sections.",
    "dashboard.runDiagnosticInsight": "Run the diagnostic first. The coach will turn your answers into a focused plan.",
    "dashboard.gapInsight": "{gap} points to close over {days} days. Prioritize the weakest skill before adding volume.",
    "dashboard.nextBestAction": "Next best action",
    "dashboard.runDiagnostic": "Run a 10-question diagnostic",
    "dashboard.diagnosticReason": "Start with a mixed mini test so the coach can find your first weak zones.",
    "dashboard.choosePractice": "Choose a focused practice set",
    "dashboard.practiceReason": "Keep daily practice moving while your data builds up.",
    "dashboard.mixedSkills": "Mixed skills",
    "dashboard.diagnostic": "Diagnostic",
    "dashboard.dailyLoop": "Daily loop",
    "dashboard.startFocus": "Start focus session",
    "dashboard.refreshAI": "Refresh AI Plan",
    "dashboard.generating": "Generating...",
    "dashboard.todayFocus": "Today's focus",
    "dashboard.twoActions": "Two actions for today",
    "dashboard.skillsSnapshot": "Skills snapshot",
    "dashboard.effortTitle": "Where to spend effort",
    "dashboard.weakPreview": "Weak zones preview",
    "dashboard.repairAreas": "Top repair areas",
    "dashboard.fullAnalysis": "Full analysis",
    "dashboard.priority": "Priority",
    "dashboard.needsPractice": "Needs practice",
    "dashboard.stable": "Stable",
    "dashboard.highPriority": "High priority",
    "dashboard.mediumPriority": "Medium priority",
    "dashboard.errorRate": "{pct}% error rate across {total} tasks.",
    "dashboard.readingInference": "Reading inference",
    "dashboard.readingCopy": "Train evidence matching before timed passages.",
    "dashboard.listeningDetails": "Listening details",
    "dashboard.listeningCopy": "Catch speaker intent, examples, and lecture turns.",
    "dashboard.writingStructure": "Writing structure",
    "dashboard.writingCopy": "Build claim, support, and paragraph flow.",
    "learn.title": "What should I learn next?",
    "learn.copy": "Short TOEFL lessons, modules, study path, vocabulary, and personal notes.",
    "learn.search": "Search topics",
    "learn.searchPlaceholder": "inference, lecture notes, academic discussion",
    "learn.level": "Level",
    "learn.level.all": "All levels",
    "learn.time": "Time",
    "learn.time.all": "Any time",
    "learn.time.short": "Under 5 min",
    "learn.time.medium": "5-6 min",
    "learn.filter.all": "All",
    "learn.studyPath": "Study path",
    "learn.map": "8-week preparation map",
    "learn.mistakeLessons": "Mistake lessons",
    "learn.repairErrors": "Repair repeated errors",
    "learn.modules": "Modules",
    "learn.courses": "Preparation courses",
    "learn.topicLibrary": "Topic library",
    "learn.shortLessons": "Short lessons",
    "learn.vocabSystem": "Vocabulary system",
    "learn.academicWords": "Academic words",
    "profile.title": "Who is preparing?",
    "profile.copy": "Keep your name, TOEFL goal, and avatar accurate.",
    "profile.settings": "Profile settings",
    "profile.setupTitle": "Your TOEFL setup",
    "profile.settingsCopy": "Change your name, target score, timeline, level, or study goal. The dashboard and AI plan update from these settings.",
    "profile.name": "Your Name",
    "profile.examType": "Exam Type",
    "profile.targetScore": "Target Score",
    "profile.prepTime": "Preparation Time",
    "profile.days30": "30 days",
    "profile.days60": "60 days",
    "profile.days90": "90 days",
    "profile.daysLabel": "{days} days",
    "profile.currentLevel": "Current Level",
    "profile.studyGoal": "Study Goal",
    "profile.saveStart": "Save & Start Preparation",
    "profile.saveSettings": "Save profile settings",
    "profile.saved": "Profile saved. Go to Dashboard to start.",
    "profile.savedUpdated": "Profile saved. Dashboard and study plan are updated.",
    "profile.summary": "Personal summary",
    "profile.setup": "Your study setup",
    "profile.currentToefl": "current TOEFL",
    "profile.timeline": "Timeline",
    "avatar.change": "Change avatar",
    "avatar.kicker": "Avatar",
    "avatar.title": "Choose your profile avatar",
    "avatar.copy": "Pick a bright zoo-style avatar or upload your own image.",
    "avatar.choosePreset": "Generated animal avatars",
    "avatar.uploadTitle": "Your own image",
    "avatar.uploadCopy": "Upload a square photo or picture. It will be saved with your profile.",
    "avatar.upload": "Upload from device",
    "avatar.useInitials": "Use initials",
    "avatar.saved": "Avatar saved.",
    "avatar.uploadTooLarge": "Image is too large. Use a file up to 4 MB.",
    "avatar.uploadFailed": "Could not read this image.",
    "level.beginner": "Beginner",
    "level.intermediate": "Intermediate",
    "level.advanced": "Advanced",
    "goal.studyAbroad": "Study Abroad",
    "goal.work": "Work",
    "goal.immigration": "Immigration",
    "account.kicker": "Account Sync",
    "account.saveProgress": "Save progress",
    "account.copy": "Create an account to save your TOEFL progress and profile.",
    "account.name": "Name",
    "account.email": "Email",
    "account.password": "Password",
    "account.passwordPlaceholder": "At least 6 characters",
    "account.create": "Create account",
    "account.signIn": "Sign in",
    "account.syncedCopy": "Progress is synced.",
    "account.syncNow": "Sync now",
    "account.logout": "Log out",
    "account.localMode": "Sign-in required",
    "account.local": "Sign in",
    "account.synced": "Synced",
    "account.saving": "Saving",
    "account.syncFailed": "Sync failed",
    "account.localTitle": "Open the sign-in screen.",
    "account.failedTitle": "Sync failed. Open Profile to try again.",
    "account.savingTitle": "Saving your profile.",
    "account.syncedTitle": "Your progress is saved.",
    "subscription.topbar": "Subscription",
    "subscription.kicker": "TOEFL access",
    "subscription.title": "Start your study access",
    "subscription.copy": "Open the full workspace with a 3-day trial, then keep studying with a weekly plan.",
    "subscription.benefit.ai": "AI coach",
    "subscription.benefit.plan": "Study plan",
    "subscription.benefit.analytics": "Analytics",
    "subscription.trialBadge": "Best start",
    "subscription.trialTitle": "3-day free trial",
    "subscription.trialCopy": "Try dashboard, practice, calendar, notes, and AI coach before the paid period.",
    "subscription.trialPrice": "0 RUB",
    "subscription.startTrial": "Start free trial",
    "subscription.weekBadge": "Weekly access",
    "subscription.weekTitle": "7 days of TOEFL Coach",
    "subscription.weekCopy": "Demo paid access for a study sprint with all product sections unlocked.",
    "subscription.activateWeek": "Activate 7 days",
    "subscription.promoLabel": "Promo code",
    "subscription.promoPlaceholder": "Enter promo code",
    "subscription.applyPromo": "Apply",
    "subscription.status.locked": "Access required",
    "subscription.status.trial": "Trial: {days}d",
    "subscription.status.week": "7 days: {days}d",
    "subscription.status.promo": "Lifetime",
    "subscription.message.required": "Choose a trial, weekly access, or enter a promo code to open the workspace.",
    "subscription.message.trialStarted": "Trial started. Full access is open for 3 days.",
    "subscription.message.weekStarted": "7-day access is active. This is a demo activation without payment.",
    "subscription.message.promoSuccess": "Promo accepted. Lifetime access is active.",
    "subscription.message.promoInvalid": "Promo code was not found.",
    "subscription.message.active": "Access is active. You can keep studying.",
    "toast.subscriptionRequired": "Activate access to open this section.",
    "skill.reading": "Reading",
    "skill.listening": "Listening",
    "skill.speaking": "Speaking",
    "skill.writing": "Writing",
    "skill.vocabulary": "Vocabulary",
    "skill.strategy": "Strategy",
    "practice.title": "What should I train?",
    "practice.copy": "Pick a skill based on readiness, recent accuracy, and mistakes.",
    "practice.vocabulary": "Vocabulary Practice",
    "practice.reading": "Reading Practice",
    "practice.listening": "Listening Practice",
    "practice.speaking": "Speaking Practice",
    "practice.writing": "Writing Practice",
    "practice.miniTest": "Mini TOEFL Test",
    "practice.today": "Today's practice",
    "practice.startDrill": "Start recommended drill",
    "practice.notStarted": "Not started",
    "practice.shortDrill": "Start with a short drill",
    "practice.accuracy": "{pct}% accuracy from {total} tasks",
    "practice.meta": "{mistakes} mistakes · readiness {readiness}%",
    "practice.miniCopy": "Mixed diagnostic across all skills. Updates prediction and weak zones.",
    "feedback.correct": "Correct (Верно)",
    "feedback.incorrect": "Incorrect (Неверно)",
    "feedback.correctExplain": "Good. The selected option matches the question focus.",
    "feedback.defaultExplain": "Compare your choice with the green option and review the question focus before moving on.",
    "feedback.vocabularyExplain": "The green option matches the word meaning in an academic context.",
    "feedback.readingExplain": "Return to the passage evidence. The green option is the only choice directly supported by the text.",
    "feedback.listeningExplain": "Use the lecture detail or signal closest to the question. The green option matches that spoken evidence.",
    "feedback.writingExplain": "The green option has clearer academic logic, structure, or support than the selected answer.",
    "plan.title": "How will I reach my goal?",
    "plan.copy": "Calendar, weekly targets, and Groq-backed recommendations live here.",
    "plan.calendar": "Study calendar",
    "plan.countdown": "Countdown and roadmap",
    "plan.prevMonth": "Previous month",
    "plan.nextMonth": "Next month",
    "plan.roadmap": "8-week roadmap",
    "plan.goalOverview": "Goal overview",
    "plan.weeklyTargets": "Weekly targets",
    "plan.groq": "Groq recommendations",
    "plan.focusPlan": "Focus plan",
    "plan.generate": "Generate Study Plan",
    "plan.placeholder": "Click \"Generate Study Plan\" to get your personalized recommendations.",
    "plan.gapAnalysis": "Gap analysis",
    "plan.currentToTarget": "Current to target",
    "plan.runAnalysis": "Run AI Analysis",
    "mistakes.title": "Mistakes",
    "mistakes.copy": "Review missed tasks and decide what to repair first.",
    "analytics.title": "Why is my score changing?",
    "analytics.copy": "Analytics explains movement, accuracy, weak areas, and mistakes.",
    "tools.coach": "Coach",
    "tools.notes": "Notes",
    "notebook.kicker": "Notebook",
    "notebook.title": "My notes",
    "notebook.close": "Close notebook",
    "notebook.titlePlaceholder": "Rule or phrase title",
    "notebook.contentPlaceholder": "Write a phrase, mistake pattern, template, or personal TOEFL rule.",
    "notebook.add": "Add note",
    "notebook.empty": "Save useful phrases, personal rules, templates, or AI advice here.",
    "coach.kicker": "AI Coach",
    "coach.title": "Ask about your next step",
    "coach.close": "Close chat",
    "coach.today": "Today",
    "coach.weakZones": "Weak zones",
    "coach.thisWeek": "This week",
    "coach.placeholder": "Ask your TOEFL coach...",
    "coach.send": "Send",
    "toast.setGoal": "Set your TOEFL goal to get started.",
    "toast.confirmReset": "Reset all progress? This cannot be undone.",
    "toast.reset": "Progress reset.",
    "toast.goalSaved": "Goal saved. Let's start preparing.",
    "toast.signedOut": "Signed out.",
    "toast.signedInSynced": "Signed in. Progress is synced.",
    "toast.signedIn": "Signed in.",
    "toast.syncFailed": "Sync failed. Local changes are still saved.",
    "toast.synced": "Synced."
  },
  ru: {
    "common.skip": "Перейти к содержимому",
    "common.target": "Цель",
    "common.day": "День",
    "common.current": "Сейчас",
    "common.gap": "Разрыв",
    "common.daysLeft": "Дней осталось",
    "common.level": "Уровень",
    "common.goal": "Цель",
    "common.today": "Сегодня",
    "common.close": "Закрыть",
    "common.dark": "Тёмная",
    "common.light": "Светлая",
    "common.task": "задание",
    "common.tasks": "заданий",
    "common.taskCount": "{total} заданий",
    "common.days": "дней",
    "common.questions10": "10 вопросов",
    "brand.subtitle": "Панель балла",
    "nav.primary": "Основная навигация",
    "nav.openDashboard": "Открыть дашборд",
    "page.dashboard": "Дашборд",
    "page.learn": "Обучение",
    "page.lesson": "Урок",
    "page.practice": "Практика",
    "page.aiplan": "План",
    "page.analytics": "Аналитика",
    "page.goal": "Профиль",
    "theme.toggle": "Переключить тему",
    "theme.toLight": "Включить светлую тему",
    "theme.toDark": "Включить тёмную тему",
    "language.button": "Language",
    "language.select": "Выбрать язык",
    "language.options": "Варианты языка",
    "sidebar.studyStreak": "Серия занятий",
    "sidebar.reset": "Сбросить прогресс",
    "sidebar.currentToGoal": "Сейчас {current}, цель {target}",
    "sidebar.dayCount": "{current} / {total}",
    "dashboard.heroTitle": "Что делать прямо сейчас?",
    "dashboard.defaultInsight": "Сделай одно сфокусированное действие, и коуч обновит следующий шаг.",
    "dashboard.atTarget": "Ты уже на цели или выше. Сохраняй ритм и защищай сильные секции.",
    "dashboard.runDiagnosticInsight": "Сначала пройди диагностику. Коуч превратит ответы в сфокусированный план.",
    "dashboard.gapInsight": "Нужно закрыть {gap} баллов за {days} дней. Сначала усиливай самый слабый навык.",
    "dashboard.nextBestAction": "Лучший следующий шаг",
    "dashboard.runDiagnostic": "Пройти диагностику из 10 вопросов",
    "dashboard.diagnosticReason": "Начни со смешанного мини-теста, чтобы коуч нашёл первые слабые зоны.",
    "dashboard.choosePractice": "Выбрать фокусную практику",
    "dashboard.practiceReason": "Поддерживай ежедневную практику, пока данных становится больше.",
    "dashboard.mixedSkills": "Смешанные навыки",
    "dashboard.diagnostic": "Диагностика",
    "dashboard.dailyLoop": "Ежедневный цикл",
    "dashboard.startFocus": "Начать фокус-сессию",
    "dashboard.refreshAI": "Обновить AI-план",
    "dashboard.generating": "Генерирую...",
    "dashboard.todayFocus": "Фокус на сегодня",
    "dashboard.twoActions": "Два действия на сегодня",
    "dashboard.skillsSnapshot": "Срез навыков",
    "dashboard.effortTitle": "Куда вложить усилия",
    "dashboard.weakPreview": "Слабые зоны",
    "dashboard.repairAreas": "Главные зоны ремонта",
    "dashboard.fullAnalysis": "Полный анализ",
    "dashboard.priority": "Приоритет",
    "dashboard.needsPractice": "Нужна практика",
    "dashboard.stable": "Стабильно",
    "dashboard.highPriority": "Высокий приоритет",
    "dashboard.mediumPriority": "Средний приоритет",
    "dashboard.errorRate": "{pct}% ошибок на {total} заданиях.",
    "dashboard.readingInference": "Reading: выводы",
    "dashboard.readingCopy": "Тренируй поиск доказательств перед заданиями на время.",
    "dashboard.listeningDetails": "Listening: детали",
    "dashboard.listeningCopy": "Лови намерение спикера, примеры и повороты лекции.",
    "dashboard.writingStructure": "Writing: структура",
    "dashboard.writingCopy": "Собирай тезис, поддержку и логику абзацев.",
    "learn.title": "Что изучать дальше?",
    "learn.copy": "Короткие TOEFL-уроки, модули, учебный путь, словарь и личные заметки.",
    "learn.search": "Поиск тем",
    "learn.searchPlaceholder": "inference, lecture notes, academic discussion",
    "learn.level": "Уровень",
    "learn.level.all": "Все уровни",
    "learn.time": "Время",
    "learn.time.all": "Любое время",
    "learn.time.short": "До 5 мин",
    "learn.time.medium": "5-6 мин",
    "learn.filter.all": "Все",
    "learn.studyPath": "Учебный путь",
    "learn.map": "Карта подготовки на 8 недель",
    "learn.mistakeLessons": "Уроки по ошибкам",
    "learn.repairErrors": "Разобрать повторяющиеся ошибки",
    "learn.modules": "Модули",
    "learn.courses": "Курсы подготовки",
    "learn.topicLibrary": "Библиотека тем",
    "learn.shortLessons": "Короткие уроки",
    "learn.vocabSystem": "Словарная система",
    "learn.academicWords": "Академические слова",
    "profile.title": "Кто готовится?",
    "profile.copy": "Держи имя, TOEFL-цель и аватар актуальными.",
    "profile.settings": "Настройки профиля",
    "profile.setupTitle": "Твоя настройка TOEFL",
    "profile.settingsCopy": "Измени имя, целевой балл, срок, уровень или цель обучения. Дашборд и AI-план обновятся по этим настройкам.",
    "profile.name": "Имя",
    "profile.examType": "Тип экзамена",
    "profile.targetScore": "Целевой балл",
    "profile.prepTime": "Время подготовки",
    "profile.days30": "30 дней",
    "profile.days60": "60 дней",
    "profile.days90": "90 дней",
    "profile.daysLabel": "{days} дней",
    "profile.currentLevel": "Текущий уровень",
    "profile.studyGoal": "Цель обучения",
    "profile.saveStart": "Сохранить и начать",
    "profile.saveSettings": "Сохранить настройки профиля",
    "profile.saved": "Профиль сохранён. Перейди в дашборд, чтобы начать.",
    "profile.savedUpdated": "Профиль сохранён. Дашборд и учебный план обновлены.",
    "profile.summary": "Краткий профиль",
    "profile.setup": "Твои настройки подготовки",
    "profile.currentToefl": "текущий TOEFL",
    "profile.timeline": "Срок",
    "avatar.change": "Изменить аватар",
    "avatar.kicker": "Аватар",
    "avatar.title": "Выбери аватар профиля",
    "avatar.copy": "Выбери яркую аватарку в стиле зоопарка или загрузи своё изображение.",
    "avatar.choosePreset": "Сгенерированные аватары животных",
    "avatar.uploadTitle": "Своя картинка",
    "avatar.uploadCopy": "Загрузи квадратное фото или картинку. Она сохранится в профиле.",
    "avatar.upload": "Загрузить с устройства",
    "avatar.useInitials": "Вернуть инициалы",
    "avatar.saved": "Аватар сохранён.",
    "avatar.uploadTooLarge": "Картинка слишком большая. Используй файл до 4 MB.",
    "avatar.uploadFailed": "Не удалось прочитать это изображение.",
    "level.beginner": "Начальный",
    "level.intermediate": "Средний",
    "level.advanced": "Продвинутый",
    "goal.studyAbroad": "Учёба за рубежом",
    "goal.work": "Работа",
    "goal.immigration": "Иммиграция",
    "account.kicker": "Синхронизация",
    "account.saveProgress": "Сохранить прогресс",
    "account.copy": "Создай аккаунт, чтобы сохранить прогресс TOEFL и профиль.",
    "account.name": "Имя",
    "account.email": "Email",
    "account.password": "Пароль",
    "account.passwordPlaceholder": "Минимум 6 символов",
    "account.create": "Создать аккаунт",
    "account.signIn": "Войти",
    "account.syncedCopy": "Прогресс синхронизирован.",
    "account.syncNow": "Синхронизировать",
    "account.logout": "Выйти",
    "account.localMode": "Нужен вход",
    "account.local": "Войти",
    "account.synced": "Синхронизировано",
    "account.saving": "Сохранение",
    "account.syncFailed": "Ошибка синхронизации",
    "account.localTitle": "Открыть экран входа.",
    "account.failedTitle": "Синхронизация не удалась. Открой профиль и попробуй снова.",
    "account.savingTitle": "Сохраняем профиль.",
    "account.syncedTitle": "Прогресс сохранён.",
    "subscription.topbar": "Подписка",
    "subscription.kicker": "Доступ TOEFL",
    "subscription.title": "Открой доступ к подготовке",
    "subscription.copy": "Полный кабинет открывается с 3-дневного триала, дальше можно продолжить недельным тарифом.",
    "subscription.benefit.ai": "AI-коуч",
    "subscription.benefit.plan": "План занятий",
    "subscription.benefit.analytics": "Аналитика",
    "subscription.trialBadge": "Лучший старт",
    "subscription.trialTitle": "3 дня бесплатно",
    "subscription.trialCopy": "Попробуй дашборд, практику, календарь, заметки и AI-коуча до платного периода.",
    "subscription.trialPrice": "0 RUB",
    "subscription.startTrial": "Начать триал",
    "subscription.weekBadge": "Недельный доступ",
    "subscription.weekTitle": "7 дней TOEFL Coach",
    "subscription.weekCopy": "Демо-активация платного доступа для учебного спринта со всеми разделами.",
    "subscription.activateWeek": "Активировать 7 дней",
    "subscription.promoLabel": "Промокод",
    "subscription.promoPlaceholder": "Введите промокод",
    "subscription.applyPromo": "Применить",
    "subscription.status.locked": "Нужен доступ",
    "subscription.status.trial": "Триал: {days} дн.",
    "subscription.status.week": "7 дней: {days} дн.",
    "subscription.status.promo": "Навсегда",
    "subscription.message.required": "Выбери триал, недельный доступ или введи промокод, чтобы открыть кабинет.",
    "subscription.message.trialStarted": "Триал начался. Полный доступ открыт на 3 дня.",
    "subscription.message.weekStarted": "Доступ на 7 дней активен. Это демо-активация без оплаты.",
    "subscription.message.promoSuccess": "Промокод принят. Вечный доступ активен.",
    "subscription.message.promoInvalid": "Промокод не найден.",
    "subscription.message.active": "Доступ активен. Можно продолжать подготовку.",
    "toast.subscriptionRequired": "Активируй доступ, чтобы открыть этот раздел.",
    "skill.reading": "Reading",
    "skill.listening": "Listening",
    "skill.speaking": "Speaking",
    "skill.writing": "Writing",
    "skill.vocabulary": "Vocabulary",
    "skill.strategy": "Стратегия",
    "practice.title": "Что тренировать?",
    "practice.copy": "Выбирай навык по готовности, свежей точности и ошибкам.",
    "practice.vocabulary": "Практика Vocabulary",
    "practice.reading": "Практика Reading",
    "practice.listening": "Практика Listening",
    "practice.speaking": "Практика Speaking",
    "practice.writing": "Практика Writing",
    "practice.miniTest": "Мини TOEFL-тест",
    "practice.today": "Практика на сегодня",
    "practice.startDrill": "Начать рекомендованную тренировку",
    "practice.notStarted": "Не начато",
    "practice.shortDrill": "Начни с короткой тренировки",
    "practice.accuracy": "{pct}% точности на {total} заданиях",
    "practice.meta": "{mistakes} ошибок · готовность {readiness}%",
    "practice.miniCopy": "Смешанная диагностика по всем навыкам. Обновляет прогноз и слабые зоны.",
    "feedback.correct": "Верно",
    "feedback.incorrect": "Неверно",
    "feedback.correctExplain": "Хорошо. Выбранный вариант совпадает с фокусом вопроса.",
    "feedback.defaultExplain": "Сравни свой выбор с зелёным вариантом и проверь фокус вопроса перед следующим заданием.",
    "feedback.vocabularyExplain": "Зелёный вариант передаёт значение слова в академическом контексте.",
    "feedback.readingExplain": "Вернись к evidence в тексте. Зелёный вариант напрямую подтверждается passage.",
    "feedback.listeningExplain": "Опирайся на ближайшую деталь или сигнал из лекции. Зелёный вариант совпадает с услышанным evidence.",
    "feedback.writingExplain": "Зелёный вариант сильнее по академической логике, структуре или поддержке.",
    "plan.title": "Как дойти до цели?",
    "plan.copy": "Календарь, недельные цели и рекомендации Groq находятся здесь.",
    "plan.calendar": "Учебный календарь",
    "plan.countdown": "Отсчёт и дорожная карта",
    "plan.prevMonth": "Предыдущий месяц",
    "plan.nextMonth": "Следующий месяц",
    "plan.roadmap": "Дорожная карта на 8 недель",
    "plan.goalOverview": "Обзор цели",
    "plan.weeklyTargets": "Недельные цели",
    "plan.groq": "Рекомендации Groq",
    "plan.focusPlan": "Фокус-план",
    "plan.generate": "Сгенерировать план",
    "plan.placeholder": "Нажми «Сгенерировать план», чтобы получить персональные рекомендации.",
    "plan.gapAnalysis": "Анализ разрыва",
    "plan.currentToTarget": "От текущего к цели",
    "plan.runAnalysis": "Запустить AI-анализ",
    "mistakes.title": "Ошибки",
    "mistakes.copy": "Посмотри пропущенные задания и выбери, что чинить первым.",
    "analytics.title": "Почему меняется мой балл?",
    "analytics.copy": "Аналитика объясняет движение балла, точность, слабые зоны и ошибки.",
    "tools.coach": "Коуч",
    "tools.notes": "Заметки",
    "notebook.kicker": "Блокнот",
    "notebook.title": "Мои заметки",
    "notebook.close": "Закрыть блокнот",
    "notebook.titlePlaceholder": "Название правила или фразы",
    "notebook.contentPlaceholder": "Запиши фразу, шаблон ошибки, структуру ответа или личное TOEFL-правило.",
    "notebook.add": "Добавить",
    "notebook.empty": "Сохраняй здесь полезные фразы, правила, шаблоны и советы AI.",
    "coach.kicker": "AI-коуч",
    "coach.title": "Спроси про следующий шаг",
    "coach.close": "Закрыть чат",
    "coach.today": "Сегодня",
    "coach.weakZones": "Слабые зоны",
    "coach.thisWeek": "Неделя",
    "coach.placeholder": "Спроси TOEFL-коуча...",
    "coach.send": "Отправить",
    "toast.setGoal": "Задай TOEFL-цель, чтобы начать.",
    "toast.confirmReset": "Сбросить весь прогресс? Это действие нельзя отменить.",
    "toast.reset": "Прогресс сброшен.",
    "toast.goalSaved": "Цель сохранена. Начинаем подготовку.",
    "toast.signedOut": "Вы вышли.",
    "toast.signedInSynced": "Вход выполнен. Прогресс синхронизирован.",
    "toast.signedIn": "Вход выполнен.",
    "toast.syncFailed": "Синхронизация не удалась. Локальные изменения сохранены.",
    "toast.synced": "Синхронизировано."
  },
  fr: {
    "common.skip": "Aller au contenu",
    "common.target": "Objectif",
    "common.day": "Jour",
    "common.current": "Actuel",
    "common.gap": "Écart",
    "common.daysLeft": "Jours restants",
    "common.level": "Niveau",
    "common.goal": "But",
    "common.today": "Aujourd'hui",
    "common.close": "Fermer",
    "common.dark": "Sombre",
    "common.light": "Clair",
    "common.task": "tâche",
    "common.tasks": "tâches",
    "common.taskCount": "{total} tâches",
    "common.days": "jours",
    "common.questions10": "10 questions",
    "brand.subtitle": "Tableau du score",
    "nav.primary": "Navigation principale",
    "nav.openDashboard": "Ouvrir le tableau",
    "page.dashboard": "Tableau",
    "page.learn": "Apprendre",
    "page.lesson": "Leçon",
    "page.practice": "Pratique",
    "page.aiplan": "Plan",
    "page.analytics": "Analyse",
    "page.goal": "Profil",
    "theme.toggle": "Changer le thème",
    "theme.toLight": "Passer au thème clair",
    "theme.toDark": "Passer au thème sombre",
    "language.button": "Language",
    "language.select": "Choisir la langue",
    "language.options": "Options de langue",
    "sidebar.studyStreak": "Série d'étude",
    "sidebar.reset": "Réinitialiser",
    "sidebar.currentToGoal": "Actuel {current}, objectif {target}",
    "sidebar.dayCount": "{current} / {total}",
    "dashboard.heroTitle": "Que dois-je faire maintenant ?",
    "dashboard.defaultInsight": "Fais une action ciblée, puis le coach mettra à jour la prochaine étape.",
    "dashboard.atTarget": "Tu es à l'objectif ou au-dessus. Garde le rythme.",
    "dashboard.runDiagnosticInsight": "Commence par le diagnostic. Le coach transformera tes réponses en plan ciblé.",
    "dashboard.gapInsight": "{gap} points à gagner en {days} jours. Priorise la compétence la plus faible.",
    "dashboard.nextBestAction": "Meilleure prochaine action",
    "dashboard.runDiagnostic": "Lancer un diagnostic de 10 questions",
    "dashboard.diagnosticReason": "Commence par un mini-test mixte pour trouver les premières zones faibles.",
    "dashboard.choosePractice": "Choisir une pratique ciblée",
    "dashboard.practiceReason": "Garde une pratique quotidienne pendant que les données s'accumulent.",
    "dashboard.mixedSkills": "Compétences mixtes",
    "dashboard.diagnostic": "Diagnostic",
    "dashboard.dailyLoop": "Routine quotidienne",
    "dashboard.startFocus": "Démarrer la session",
    "dashboard.refreshAI": "Actualiser le plan AI",
    "dashboard.generating": "Génération...",
    "dashboard.todayFocus": "Focus du jour",
    "dashboard.twoActions": "Deux actions aujourd'hui",
    "dashboard.skillsSnapshot": "Aperçu des compétences",
    "dashboard.effortTitle": "Où concentrer l'effort",
    "dashboard.weakPreview": "Zones faibles",
    "dashboard.repairAreas": "Priorités à corriger",
    "dashboard.fullAnalysis": "Analyse complète",
    "dashboard.priority": "Priorité",
    "dashboard.needsPractice": "À pratiquer",
    "dashboard.stable": "Stable",
    "dashboard.highPriority": "Haute priorité",
    "dashboard.mediumPriority": "Priorité moyenne",
    "dashboard.errorRate": "{pct}% d'erreurs sur {total} tâches.",
    "dashboard.readingInference": "Reading : inférence",
    "dashboard.readingCopy": "Travaille la correspondance avec les preuves avant les passages chronométrés.",
    "dashboard.listeningDetails": "Listening : détails",
    "dashboard.listeningCopy": "Repère l'intention, les exemples et la structure de la conférence.",
    "dashboard.writingStructure": "Writing : structure",
    "dashboard.writingCopy": "Construis thèse, soutien et logique des paragraphes.",
    "learn.title": "Que dois-je apprendre ensuite ?",
    "learn.copy": "Leçons courtes TOEFL, modules, parcours, vocabulaire et notes.",
    "learn.search": "Rechercher",
    "learn.searchPlaceholder": "inference, lecture notes, academic discussion",
    "learn.level": "Niveau",
    "learn.level.all": "Tous les niveaux",
    "learn.time": "Temps",
    "learn.time.all": "Tout temps",
    "learn.time.short": "Moins de 5 min",
    "learn.time.medium": "5-6 min",
    "learn.filter.all": "Tout",
    "learn.studyPath": "Parcours",
    "learn.map": "Carte de préparation sur 8 semaines",
    "learn.mistakeLessons": "Leçons d'erreurs",
    "learn.repairErrors": "Corriger les erreurs répétées",
    "learn.modules": "Modules",
    "learn.courses": "Cours de préparation",
    "learn.topicLibrary": "Bibliothèque",
    "learn.shortLessons": "Leçons courtes",
    "learn.vocabSystem": "Vocabulaire",
    "learn.academicWords": "Mots académiques",
    "profile.title": "Qui se prépare ?",
    "profile.copy": "Garde ton nom, ton objectif TOEFL et ton avatar à jour.",
    "profile.settings": "Paramètres du profil",
    "profile.setupTitle": "Ta configuration TOEFL",
    "profile.settingsCopy": "Modifie ton nom, ton score cible, ton calendrier, ton niveau ou ton objectif. Le tableau de bord et le plan IA se mettent à jour.",
    "profile.name": "Nom",
    "profile.examType": "Type d'examen",
    "profile.targetScore": "Score cible",
    "profile.prepTime": "Temps de préparation",
    "profile.days30": "30 jours",
    "profile.days60": "60 jours",
    "profile.days90": "90 jours",
    "profile.daysLabel": "{days} jours",
    "profile.currentLevel": "Niveau actuel",
    "profile.studyGoal": "But d'étude",
    "profile.saveStart": "Enregistrer et commencer",
    "profile.saveSettings": "Enregistrer le profil",
    "profile.saved": "Profil enregistré. Va au tableau pour commencer.",
    "profile.savedUpdated": "Profil enregistré. Le tableau de bord et le plan d'étude sont mis à jour.",
    "profile.summary": "Résumé personnel",
    "profile.setup": "Configuration d'étude",
    "profile.currentToefl": "TOEFL actuel",
    "profile.timeline": "Calendrier",
    "avatar.change": "Changer l'avatar",
    "avatar.kicker": "Avatar",
    "avatar.title": "Choisis ton avatar",
    "avatar.copy": "Choisis un avatar animal coloré ou importe ta propre image.",
    "avatar.choosePreset": "Avatars animaux générés",
    "avatar.uploadTitle": "Ton image",
    "avatar.uploadCopy": "Importe une photo ou image carrée. Elle sera enregistrée dans ton profil.",
    "avatar.upload": "Importer depuis l'appareil",
    "avatar.useInitials": "Utiliser les initiales",
    "avatar.saved": "Avatar enregistré.",
    "avatar.uploadTooLarge": "Image trop grande. Utilise un fichier jusqu'à 4 MB.",
    "avatar.uploadFailed": "Impossible de lire cette image.",
    "level.beginner": "Débutant",
    "level.intermediate": "Intermédiaire",
    "level.advanced": "Avancé",
    "goal.studyAbroad": "Études à l'étranger",
    "goal.work": "Travail",
    "goal.immigration": "Immigration",
    "account.kicker": "Synchronisation",
    "account.saveProgress": "Enregistrer la progression",
    "account.copy": "Crée un compte pour enregistrer ta progression TOEFL et ton profil.",
    "account.name": "Nom",
    "account.email": "Email",
    "account.password": "Mot de passe",
    "account.passwordPlaceholder": "Au moins 6 caractères",
    "account.create": "Créer un compte",
    "account.signIn": "Connexion",
    "account.syncedCopy": "La progression est synchronisée.",
    "account.syncNow": "Synchroniser",
    "account.logout": "Déconnexion",
    "account.localMode": "Connexion requise",
    "account.local": "Se connecter",
    "account.synced": "Synchronisé",
    "account.saving": "Enregistrement",
    "account.syncFailed": "Échec sync",
    "subscription.topbar": "Abonnement",
    "subscription.kicker": "Accès TOEFL",
    "subscription.title": "Active ton accès d'étude",
    "subscription.copy": "Ouvre tout l'espace avec un essai de 3 jours, puis continue avec un plan hebdomadaire.",
    "subscription.benefit.ai": "Coach AI",
    "subscription.benefit.plan": "Plan d'étude",
    "subscription.benefit.analytics": "Analytique",
    "subscription.trialBadge": "Meilleur départ",
    "subscription.trialTitle": "Essai gratuit 3 jours",
    "subscription.trialCopy": "Teste tableau de bord, pratique, calendrier, notes et coach AI avant la période payante.",
    "subscription.trialPrice": "0 RUB",
    "subscription.startTrial": "Démarrer l'essai",
    "subscription.weekBadge": "Accès semaine",
    "subscription.weekTitle": "7 jours de TOEFL Coach",
    "subscription.weekCopy": "Activation démo payante pour un sprint d'étude avec toutes les sections.",
    "subscription.activateWeek": "Activer 7 jours",
    "subscription.promoLabel": "Code promo",
    "subscription.promoPlaceholder": "Entrer le code promo",
    "subscription.applyPromo": "Appliquer",
    "subscription.status.locked": "Accès requis",
    "subscription.status.trial": "Essai : {days} j",
    "subscription.status.week": "7 jours : {days} j",
    "subscription.status.promo": "À vie",
    "subscription.message.required": "Choisis l'essai, l'accès semaine ou saisis un code promo pour ouvrir l'espace.",
    "subscription.message.trialStarted": "Essai lancé. L'accès complet est ouvert pour 3 jours.",
    "subscription.message.weekStarted": "Accès 7 jours actif. C'est une activation démo sans paiement.",
    "subscription.message.promoSuccess": "Code accepté. Accès à vie activé.",
    "subscription.message.promoInvalid": "Code promo introuvable.",
    "subscription.message.active": "Accès actif. Tu peux continuer.",
    "toast.subscriptionRequired": "Active l'accès pour ouvrir cette section.",
    "skill.reading": "Reading",
    "skill.listening": "Listening",
    "skill.speaking": "Speaking",
    "skill.writing": "Writing",
    "skill.vocabulary": "Vocabulary",
    "skill.strategy": "Stratégie",
    "practice.title": "Que dois-je entraîner ?",
    "practice.copy": "Choisis selon la préparation, la précision récente et les erreurs.",
    "practice.vocabulary": "Pratique Vocabulary",
    "practice.reading": "Pratique Reading",
    "practice.listening": "Pratique Listening",
    "practice.speaking": "Pratique Speaking",
    "practice.writing": "Pratique Writing",
    "practice.miniTest": "Mini test TOEFL",
    "practice.today": "Pratique du jour",
    "practice.startDrill": "Démarrer l'exercice recommandé",
    "practice.notStarted": "Non commencé",
    "practice.shortDrill": "Commence par un exercice court",
    "practice.accuracy": "{pct}% de précision sur {total} tâches",
    "practice.meta": "{mistakes} erreurs · préparation {readiness}%",
    "practice.miniCopy": "Diagnostic mixte pour toutes les compétences. Met à jour le score et les zones faibles.",
    "feedback.correct": "Correct",
    "feedback.incorrect": "Incorrect",
    "feedback.correctExplain": "Bien. L'option choisie correspond au focus de la question.",
    "feedback.defaultExplain": "Compare ton choix avec l'option verte et revois le focus de la question avant de continuer.",
    "feedback.vocabularyExplain": "L'option verte correspond au sens du mot dans un contexte académique.",
    "feedback.readingExplain": "Reviens aux preuves du passage. L'option verte est directement soutenue par le texte.",
    "feedback.listeningExplain": "Utilise le détail ou le signal le plus proche de la question. L'option verte correspond à l'audio.",
    "feedback.writingExplain": "L'option verte a une logique, une structure ou un soutien académique plus clair.",
    "plan.title": "Comment atteindre mon objectif ?",
    "plan.copy": "Calendrier, objectifs hebdomadaires et recommandations Groq.",
    "plan.calendar": "Calendrier d'étude",
    "plan.countdown": "Compte à rebours et feuille de route",
    "plan.prevMonth": "Mois précédent",
    "plan.nextMonth": "Mois suivant",
    "plan.roadmap": "Feuille de route 8 semaines",
    "plan.goalOverview": "Vue d'objectif",
    "plan.weeklyTargets": "Objectifs hebdo",
    "plan.groq": "Recommandations Groq",
    "plan.focusPlan": "Plan de focus",
    "plan.generate": "Générer le plan",
    "plan.placeholder": "Clique sur « Générer le plan » pour obtenir des recommandations.",
    "plan.gapAnalysis": "Analyse de l'écart",
    "plan.currentToTarget": "Actuel vers objectif",
    "plan.runAnalysis": "Lancer l'analyse AI",
    "mistakes.title": "Erreurs",
    "mistakes.copy": "Revois les tâches manquées et choisis quoi corriger.",
    "analytics.title": "Pourquoi mon score change ?",
    "analytics.copy": "L'analyse explique score, précision, zones faibles et erreurs.",
    "tools.coach": "Coach",
    "tools.notes": "Notes",
    "notebook.kicker": "Carnet",
    "notebook.title": "Mes notes",
    "notebook.close": "Fermer le carnet",
    "notebook.titlePlaceholder": "Titre de règle ou phrase",
    "notebook.contentPlaceholder": "Écris une phrase, un modèle d'erreur ou une règle TOEFL.",
    "notebook.add": "Ajouter",
    "notebook.empty": "Enregistre ici phrases, règles, modèles et conseils AI.",
    "coach.kicker": "Coach AI",
    "coach.title": "Demande la prochaine étape",
    "coach.close": "Fermer le chat",
    "coach.today": "Aujourd'hui",
    "coach.weakZones": "Zones faibles",
    "coach.thisWeek": "Cette semaine",
    "coach.placeholder": "Demande au coach TOEFL...",
    "coach.send": "Envoyer",
    "toast.setGoal": "Définis ton objectif TOEFL pour commencer.",
    "toast.confirmReset": "Réinitialiser toute la progression ? Cette action est définitive.",
    "toast.reset": "Progression réinitialisée.",
    "toast.goalSaved": "Objectif enregistré. La préparation commence.",
    "toast.signedOut": "Déconnecté.",
    "toast.signedInSynced": "Connecté. La progression est synchronisée.",
    "toast.signedIn": "Connecté.",
    "toast.syncFailed": "Échec de synchronisation. Les changements locaux sont conservés.",
    "toast.synced": "Synchronisé."
  },
  es: {
    "common.skip": "Saltar al contenido",
    "common.target": "Objetivo",
    "common.day": "Día",
    "common.current": "Actual",
    "common.gap": "Brecha",
    "common.daysLeft": "Días restantes",
    "common.level": "Nivel",
    "common.goal": "Meta",
    "common.today": "Hoy",
    "common.close": "Cerrar",
    "common.dark": "Oscuro",
    "common.light": "Claro",
    "common.task": "tarea",
    "common.tasks": "tareas",
    "common.taskCount": "{total} tareas",
    "common.days": "días",
    "common.questions10": "10 preguntas",
    "brand.subtitle": "Panel de puntuación",
    "nav.primary": "Navegación principal",
    "nav.openDashboard": "Abrir panel",
    "page.dashboard": "Panel",
    "page.learn": "Aprender",
    "page.lesson": "Lección",
    "page.practice": "Práctica",
    "page.aiplan": "Plan",
    "page.analytics": "Analítica",
    "page.goal": "Perfil",
    "theme.toggle": "Cambiar tema",
    "theme.toLight": "Cambiar a tema claro",
    "theme.toDark": "Cambiar a tema oscuro",
    "language.button": "Language",
    "language.select": "Seleccionar idioma",
    "language.options": "Opciones de idioma",
    "sidebar.studyStreak": "Racha de estudio",
    "sidebar.reset": "Reiniciar progreso",
    "sidebar.currentToGoal": "Actual {current}, objetivo {target}",
    "sidebar.dayCount": "{current} / {total}",
    "dashboard.heroTitle": "¿Qué debo hacer ahora?",
    "dashboard.defaultInsight": "Haz una acción enfocada y el coach actualizará el siguiente paso.",
    "dashboard.atTarget": "Estás en el objetivo o por encima. Mantén el ritmo.",
    "dashboard.runDiagnosticInsight": "Primero haz el diagnóstico. El coach convertirá tus respuestas en un plan.",
    "dashboard.gapInsight": "Faltan {gap} puntos en {days} días. Prioriza la habilidad más débil.",
    "dashboard.nextBestAction": "Mejor siguiente acción",
    "dashboard.runDiagnostic": "Hacer diagnóstico de 10 preguntas",
    "dashboard.diagnosticReason": "Empieza con un mini test mixto para encontrar zonas débiles.",
    "dashboard.choosePractice": "Elegir práctica enfocada",
    "dashboard.practiceReason": "Mantén práctica diaria mientras se acumulan datos.",
    "dashboard.mixedSkills": "Habilidades mixtas",
    "dashboard.diagnostic": "Diagnóstico",
    "dashboard.dailyLoop": "Rutina diaria",
    "dashboard.startFocus": "Iniciar sesión",
    "dashboard.refreshAI": "Actualizar plan AI",
    "dashboard.generating": "Generando...",
    "dashboard.todayFocus": "Foco de hoy",
    "dashboard.twoActions": "Dos acciones para hoy",
    "dashboard.skillsSnapshot": "Resumen de habilidades",
    "dashboard.effortTitle": "Dónde esforzarse",
    "dashboard.weakPreview": "Zonas débiles",
    "dashboard.repairAreas": "Áreas principales",
    "dashboard.fullAnalysis": "Análisis completo",
    "dashboard.priority": "Prioridad",
    "dashboard.needsPractice": "Necesita práctica",
    "dashboard.stable": "Estable",
    "dashboard.highPriority": "Alta prioridad",
    "dashboard.mediumPriority": "Prioridad media",
    "dashboard.errorRate": "{pct}% de error en {total} tareas.",
    "dashboard.readingInference": "Reading: inferencia",
    "dashboard.readingCopy": "Entrena evidencia antes de pasajes con tiempo.",
    "dashboard.listeningDetails": "Listening: detalles",
    "dashboard.listeningCopy": "Capta intención, ejemplos y cambios en la clase.",
    "dashboard.writingStructure": "Writing: estructura",
    "dashboard.writingCopy": "Construye tesis, apoyo y flujo de párrafos.",
    "learn.title": "¿Qué debo aprender después?",
    "learn.copy": "Lecciones TOEFL cortas, módulos, ruta, vocabulario y notas.",
    "learn.search": "Buscar temas",
    "learn.searchPlaceholder": "inference, lecture notes, academic discussion",
    "learn.level": "Nivel",
    "learn.level.all": "Todos los niveles",
    "learn.time": "Tiempo",
    "learn.time.all": "Cualquier tiempo",
    "learn.time.short": "Menos de 5 min",
    "learn.time.medium": "5-6 min",
    "learn.filter.all": "Todo",
    "learn.studyPath": "Ruta",
    "learn.map": "Mapa de 8 semanas",
    "learn.mistakeLessons": "Lecciones de errores",
    "learn.repairErrors": "Reparar errores repetidos",
    "learn.modules": "Módulos",
    "learn.courses": "Cursos de preparación",
    "learn.topicLibrary": "Biblioteca",
    "learn.shortLessons": "Lecciones cortas",
    "learn.vocabSystem": "Sistema de vocabulario",
    "learn.academicWords": "Palabras académicas",
    "profile.title": "¿Quién se prepara?",
    "profile.copy": "Mantén tu nombre, meta TOEFL y avatar actualizados.",
    "profile.settings": "Ajustes del perfil",
    "profile.setupTitle": "Tu configuración TOEFL",
    "profile.settingsCopy": "Cambia tu nombre, puntuación objetivo, calendario, nivel u objetivo. El panel y el plan IA se actualizan con estos ajustes.",
    "profile.name": "Nombre",
    "profile.examType": "Tipo de examen",
    "profile.targetScore": "Puntuación objetivo",
    "profile.prepTime": "Tiempo de preparación",
    "profile.days30": "30 días",
    "profile.days60": "60 días",
    "profile.days90": "90 días",
    "profile.daysLabel": "{days} días",
    "profile.currentLevel": "Nivel actual",
    "profile.studyGoal": "Meta de estudio",
    "profile.saveStart": "Guardar y empezar",
    "profile.saveSettings": "Guardar perfil",
    "profile.saved": "Perfil guardado. Ve al panel para empezar.",
    "profile.savedUpdated": "Perfil guardado. El panel y el plan de estudio se actualizaron.",
    "profile.summary": "Resumen personal",
    "profile.setup": "Configuración de estudio",
    "profile.currentToefl": "TOEFL actual",
    "profile.timeline": "Plazo",
    "avatar.change": "Cambiar avatar",
    "avatar.kicker": "Avatar",
    "avatar.title": "Elige tu avatar",
    "avatar.copy": "Elige un avatar animal colorido o sube tu propia imagen.",
    "avatar.choosePreset": "Avatares animales generados",
    "avatar.uploadTitle": "Tu imagen",
    "avatar.uploadCopy": "Sube una foto o imagen cuadrada. Se guardará en tu perfil.",
    "avatar.upload": "Subir desde el dispositivo",
    "avatar.useInitials": "Usar iniciales",
    "avatar.saved": "Avatar guardado.",
    "avatar.uploadTooLarge": "La imagen es demasiado grande. Usa un archivo de hasta 4 MB.",
    "avatar.uploadFailed": "No se pudo leer esta imagen.",
    "level.beginner": "Inicial",
    "level.intermediate": "Intermedio",
    "level.advanced": "Avanzado",
    "goal.studyAbroad": "Estudiar fuera",
    "goal.work": "Trabajo",
    "goal.immigration": "Inmigración",
    "account.kicker": "Sincronización",
    "account.saveProgress": "Guardar progreso",
    "account.copy": "Crea una cuenta para guardar tu progreso TOEFL y perfil.",
    "account.name": "Nombre",
    "account.email": "Email",
    "account.password": "Contraseña",
    "account.passwordPlaceholder": "Al menos 6 caracteres",
    "account.create": "Crear cuenta",
    "account.signIn": "Iniciar sesión",
    "account.syncedCopy": "El progreso está sincronizado.",
    "account.syncNow": "Sincronizar",
    "account.logout": "Salir",
    "account.localMode": "Inicio requerido",
    "account.local": "Entrar",
    "account.synced": "Sincronizado",
    "account.saving": "Guardando",
    "account.syncFailed": "Error de sync",
    "subscription.topbar": "Suscripción",
    "subscription.kicker": "Acceso TOEFL",
    "subscription.title": "Activa tu acceso de estudio",
    "subscription.copy": "Abre todo el espacio con una prueba de 3 días y continúa con un plan semanal.",
    "subscription.benefit.ai": "Coach AI",
    "subscription.benefit.plan": "Plan de estudio",
    "subscription.benefit.analytics": "Analítica",
    "subscription.trialBadge": "Mejor inicio",
    "subscription.trialTitle": "Prueba gratis 3 días",
    "subscription.trialCopy": "Prueba panel, práctica, calendario, notas y coach AI antes del periodo pagado.",
    "subscription.trialPrice": "0 RUB",
    "subscription.startTrial": "Iniciar prueba",
    "subscription.weekBadge": "Acceso semanal",
    "subscription.weekTitle": "7 días de TOEFL Coach",
    "subscription.weekCopy": "Activación demo de pago para un sprint de estudio con todas las secciones.",
    "subscription.activateWeek": "Activar 7 días",
    "subscription.promoLabel": "Código promo",
    "subscription.promoPlaceholder": "Introduce el código",
    "subscription.applyPromo": "Aplicar",
    "subscription.status.locked": "Acceso requerido",
    "subscription.status.trial": "Prueba: {days} d",
    "subscription.status.week": "7 días: {days} d",
    "subscription.status.promo": "De por vida",
    "subscription.message.required": "Elige prueba, acceso semanal o introduce un código para abrir el espacio.",
    "subscription.message.trialStarted": "Prueba iniciada. Acceso completo abierto por 3 días.",
    "subscription.message.weekStarted": "Acceso de 7 días activo. Es una activación demo sin pago.",
    "subscription.message.promoSuccess": "Código aceptado. Acceso de por vida activo.",
    "subscription.message.promoInvalid": "Código promo no encontrado.",
    "subscription.message.active": "Acceso activo. Puedes seguir estudiando.",
    "toast.subscriptionRequired": "Activa el acceso para abrir esta sección.",
    "skill.reading": "Reading",
    "skill.listening": "Listening",
    "skill.speaking": "Speaking",
    "skill.writing": "Writing",
    "skill.vocabulary": "Vocabulary",
    "skill.strategy": "Estrategia",
    "practice.title": "¿Qué debo entrenar?",
    "practice.copy": "Elige según preparación, precisión reciente y errores.",
    "practice.vocabulary": "Práctica Vocabulary",
    "practice.reading": "Práctica Reading",
    "practice.listening": "Práctica Listening",
    "practice.speaking": "Práctica Speaking",
    "practice.writing": "Práctica Writing",
    "practice.miniTest": "Mini test TOEFL",
    "practice.today": "Práctica de hoy",
    "practice.startDrill": "Iniciar práctica recomendada",
    "practice.notStarted": "No iniciado",
    "practice.shortDrill": "Empieza con una práctica corta",
    "practice.accuracy": "{pct}% de acierto en {total} tareas",
    "practice.meta": "{mistakes} errores · preparación {readiness}%",
    "practice.miniCopy": "Diagnóstico mixto de todas las habilidades. Actualiza predicción y zonas débiles.",
    "feedback.correct": "Correcto",
    "feedback.incorrect": "Incorrecto",
    "feedback.correctExplain": "Bien. La opción elegida coincide con el enfoque de la pregunta.",
    "feedback.defaultExplain": "Compara tu elección con la opción verde y revisa el enfoque de la pregunta antes de continuar.",
    "feedback.vocabularyExplain": "La opción verde coincide con el significado de la palabra en contexto académico.",
    "feedback.readingExplain": "Vuelve a la evidencia del pasaje. La opción verde es la única apoyada directamente por el texto.",
    "feedback.listeningExplain": "Usa el detalle o señal de la clase más cercano a la pregunta. La opción verde coincide con lo escuchado.",
    "feedback.writingExplain": "La opción verde tiene lógica, estructura o apoyo académico más claro.",
    "plan.title": "¿Cómo llego a mi objetivo?",
    "plan.copy": "Calendario, metas semanales y recomendaciones Groq.",
    "plan.calendar": "Calendario de estudio",
    "plan.countdown": "Cuenta atrás y ruta",
    "plan.prevMonth": "Mes anterior",
    "plan.nextMonth": "Mes siguiente",
    "plan.roadmap": "Ruta de 8 semanas",
    "plan.goalOverview": "Resumen del objetivo",
    "plan.weeklyTargets": "Metas semanales",
    "plan.groq": "Recomendaciones Groq",
    "plan.focusPlan": "Plan de foco",
    "plan.generate": "Generar plan",
    "plan.placeholder": "Haz clic en «Generar plan» para recibir recomendaciones.",
    "plan.gapAnalysis": "Análisis de brecha",
    "plan.currentToTarget": "Actual a objetivo",
    "plan.runAnalysis": "Ejecutar análisis AI",
    "mistakes.title": "Errores",
    "mistakes.copy": "Revisa tareas falladas y decide qué reparar primero.",
    "analytics.title": "¿Por qué cambia mi puntuación?",
    "analytics.copy": "La analítica explica movimiento, precisión, zonas débiles y errores.",
    "tools.coach": "Coach",
    "tools.notes": "Notas",
    "notebook.kicker": "Notas",
    "notebook.title": "Mis notas",
    "notebook.close": "Cerrar notas",
    "notebook.titlePlaceholder": "Título de regla o frase",
    "notebook.contentPlaceholder": "Escribe una frase, patrón de error o regla TOEFL.",
    "notebook.add": "Añadir",
    "notebook.empty": "Guarda aquí frases, reglas, plantillas y consejos AI.",
    "coach.kicker": "Coach AI",
    "coach.title": "Pregunta por el siguiente paso",
    "coach.close": "Cerrar chat",
    "coach.today": "Hoy",
    "coach.weakZones": "Zonas débiles",
    "coach.thisWeek": "Esta semana",
    "coach.placeholder": "Pregunta a tu coach TOEFL...",
    "coach.send": "Enviar",
    "toast.setGoal": "Define tu objetivo TOEFL para empezar.",
    "toast.confirmReset": "¿Reiniciar todo el progreso? Esta acción no se puede deshacer.",
    "toast.reset": "Progreso reiniciado.",
    "toast.goalSaved": "Objetivo guardado. Empezamos la preparación.",
    "toast.signedOut": "Sesión cerrada.",
    "toast.signedInSynced": "Sesión iniciada. El progreso está sincronizado.",
    "toast.signedIn": "Sesión iniciada.",
    "toast.syncFailed": "Falló la sincronización. Los cambios locales siguen guardados.",
    "toast.synced": "Sincronizado."
  }
};

const PRACTICE_SECTIONS = ["vocabulary","reading","listening","speaking","writing","minitest"];
let learnSkillFilter = "all";
let learnLevelFilter = "all";
let learnTimeFilter = "all";
let notebookTypeFilter = "all";
let notebookSearchQuery = "";

// Per-section question state
const practiceState = {
  vocabulary: { idx: 0, questions: [], answered: false },
  reading:    { idx: 0, questions: [], answered: false },
  listening:  { idx: 0, questions: [], answered: false, played: false },
  speaking:   { idx: 0, questions: [], answered: false },
  writing:    { idx: 0, questions: [], answered: false },
  minitest:   { idx: 0, questions: [], answers: [], started: false, done: false, mode: "full", moduleId: null }
};

const listeningSpeechState = {
  supported: typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
  activeId: null,
  activeButton: null,
  activeProgress: null,
  activeUtterance: null
};

// ─── INIT ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initThemeControls();
  initLanguageControls();
  initNavigation();
  initGoalForm();
  initAvatarPicker();
  initAccountSync();
  initAuthGate();
  initOnboarding();
  initSubscriptionGate();
  initLearning();
  initDashboard();
  initPracticeSection("vocabulary");
  initPracticeSection("reading");
  initPracticeSection("listening");
  initPracticeSection("speaking");
  initPracticeSection("writing");
  initMiniTest();
  initAIPlan();
  initCoachChat();
  initCalendar();
  initAnalytics();
  renderAppShell();

  const authLocked = shouldShowAuthGate();
  if (authLocked) {
    setAuthGateMode("register");
    renderAuthGate();
    renderSubscriptionGate();
  } else {
    // Start on dashboard unless no goal set
    if (!profile.startDate) {
      navigateTo("goal", { bypassSubscription: true });
      if (!shouldBlockWorkspaceAccess()) showToast("Set your TOEFL goal to get started.", "info");
    } else {
      navigateTo("dashboard", { bypassSubscription: true });
    }
    renderSubscriptionGate();
    hydrateProfileFromBackend();
  }

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm(t("toast.confirmReset"))) {
      const preservedSubscription = loadProfile().subscription || null;
      profile = resetProfile();
      if (preservedSubscription) {
        profile.subscription = preservedSubscription;
        saveProfile(profile);
      }
      practiceState.vocabulary.idx = 0;
      practiceState.reading.idx    = 0;
      practiceState.listening.idx  = 0;
      practiceState.speaking.idx   = 0;
      practiceState.writing.idx    = 0;
      initDashboard();
      renderAppShell();
      navigateTo("dashboard", { bypassSubscription: true });
      renderSubscriptionGate();
      showToast(t("toast.reset"), "info");
    }
  });
});

// ─── THEME ───────────────────────────────────────
function initThemeControls() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || document.documentElement.dataset.theme || "dark";
  applyTheme(savedTheme === "light" ? "light" : "dark");

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

function applyTheme(theme) {
  const normalized = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = normalized;
  localStorage.setItem(THEME_STORAGE_KEY, normalized);

  const label = document.getElementById("themeToggleLabel");
  const button = document.getElementById("themeToggle");
  if (label) label.textContent = normalized === "dark" ? t("common.dark") : t("common.light");
  if (button) {
    button.title = normalized === "dark" ? t("theme.toLight") : t("theme.toDark");
    button.setAttribute("aria-pressed", String(normalized === "dark"));
  }
}

// ─── LANGUAGE ────────────────────────────────────
function initLanguageControls() {
  const savedLanguage = getStoredLanguage();
  applyLanguage(savedLanguage, { rerender: false });

  const toggle = document.getElementById("languageToggle");
  const menu = document.getElementById("languageMenu");

  toggle?.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = menu?.classList.toggle("hidden") === false;
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu?.addEventListener("click", event => {
    const option = event.target.closest("[data-lang-option]");
    if (!option) return;
    applyLanguage(option.dataset.langOption || "en");
    closeLanguageMenu();
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("#languageSwitcher")) closeLanguageMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLanguageMenu();
  });
}

function getStoredLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return LANGUAGES[saved] ? saved : "en";
  } catch {
    return "en";
  }
}

function closeLanguageMenu() {
  document.getElementById("languageMenu")?.classList.add("hidden");
  document.getElementById("languageToggle")?.setAttribute("aria-expanded", "false");
}

function getCurrentLanguage() {
  const current = document.documentElement.dataset.lang || getStoredLanguage();
  return LANGUAGES[current] ? current : "en";
}

function t(key, params = {}) {
  const lang = getCurrentLanguage();
  const value = I18N[lang]?.[key] ?? I18N.en[key] ?? key;
  return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

function optionalT(key, fallback = "") {
  const lang = getCurrentLanguage();
  return I18N[lang]?.[key] ?? I18N.en[key] ?? fallback;
}

function applyLanguage(lang, options = {}) {
  const normalized = LANGUAGES[lang] ? lang : "en";
  document.documentElement.dataset.lang = normalized;
  document.documentElement.lang = normalized;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    // localStorage can be blocked in some embedded browsers.
  }

  const flag = document.getElementById("languageFlag");
  if (flag) flag.textContent = LANGUAGES[normalized].flag;

  document.querySelectorAll("[data-lang-option]").forEach(button => {
    button.classList.toggle("active", button.dataset.langOption === normalized);
  });

  if (options.rerender !== false) {
    renderAppShell();
    renderCurrentSection();
    renderAccountSync();
    renderSubscriptionGate();
  }

  translateStaticInterface();
  updateCurrentPageTitle();
  applyTheme(document.documentElement.dataset.theme || "dark");
  renderSubscriptionGate();
}

function translateStaticInterface() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
}

function updateCurrentPageTitle() {
  const section = document.querySelector(".section.active")?.id?.replace("section-", "") || "dashboard";
  const sectionTitle = typeof SECTION_TITLES !== "undefined" ? SECTION_TITLES[section] : "";
  setText("pageTitle", optionalT(`page.${section}`, PAGE_TITLES[section] || sectionTitle || section));
}

// ─── NAVIGATION ──────────────────────────────────
function initNavigation() {
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-section]");
    if (!trigger) return;
    e.preventDefault();
    if (shouldBlockWorkspaceAccess()) {
      openSubscriptionGate();
      showToast(t("toast.subscriptionRequired"), "info");
      return;
    }
    if (trigger.dataset.section === "minitest") {
      practiceState.minitest.mode = "full";
      practiceState.minitest.moduleId = null;
      renderMiniTestStart();
    }
    navigateTo(trigger.dataset.section);
    document.getElementById("sidebar").classList.remove("open");
  });

  document.getElementById("hamburger").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    const isOpen = sidebar.classList.toggle("open");
    document.getElementById("hamburger").setAttribute("aria-expanded", String(isOpen));
  });
}

function getNavSection(section) {
  if (PRACTICE_SECTIONS.includes(section)) return "practice";
  if (section === "mistakes") return "analytics";
  if (section === "lesson") return "learn";
  return section;
}

function navigateTo(section, options = {}) {
  if (!options.bypassSubscription && shouldBlockWorkspaceAccess()) {
    openSubscriptionGate();
    showToast(t("toast.subscriptionRequired"), "info");
    return;
  }

  stopListeningSpeech();

  // Update sidebar
  document.querySelectorAll(".nav-link").forEach(l => {
    l.classList.remove("active");
    l.removeAttribute("aria-current");
  });
  const activeLink = document.querySelector(`.nav-link[data-section="${getNavSection(section)}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }

  // Show section
  document.querySelectorAll(".section").forEach(s => {
    s.classList.remove("active");
    s.setAttribute("hidden", "");
  });
  const el = document.getElementById(`section-${section}`);
  if (el) {
    el.classList.add("active");
    el.removeAttribute("hidden");
  }

  // Page title
  updateCurrentPageTitle();
  document.getElementById("mainContent").focus?.();

  // Refresh content on navigate
  if (section === "dashboard") renderDashboard();
  if (section === "learn")      renderLearn();
  if (section === "lesson")     renderLessonPage();
  if (section === "practice")  renderPracticeHub();
  if (section === "mistakes")  renderMistakesSection();
  if (section === "analytics") renderAnalytics();
  if (section === "aiplan")    renderAIPlanSection();
  if (section === "goal")      renderProfileScreen();
  if (["vocabulary","reading","listening","speaking","writing"].includes(section)) {
    renderQuestion(section);
  }
}

function renderAppShell() {
  profile = loadProfile();
  const predicted = calcPredictedScore(profile);
  const day = Math.min(profile.preparationDays || 60, Math.max(1, (profile.preparationDays || 60) - daysRemaining(profile) + 1));
  setText("topScore", predicted);
  setText("sidebarName", profile.name || "Alex Carter");
  setText("sidebarScoreLine", t("sidebar.currentToGoal", { current: predicted, target: profile.targetScore }));
  setText("sidebarTarget", profile.targetScore);
  setText("sidebarDay", t("sidebar.dayCount", { current: day, total: profile.preparationDays || 60 }));
  setAvatar("sidebarAvatar", profile.name);
}

async function hydrateProfileFromBackend() {
  renderAccountSync();
  if (typeof isAuthenticated !== "function" || !isAuthenticated()) return;

  const localSubscription = loadProfile().subscription || null;
  const syncedProfile = await syncProfileFromBackend();
  if (!syncedProfile) {
    renderAccountSync();
    return;
  }

  if (isSubscriptionActive(localSubscription) && !isSubscriptionActive(syncedProfile.subscription)) {
    syncedProfile.subscription = localSubscription;
    saveProfile(syncedProfile);
  }

  profile = syncedProfile;
  renderAppShell();
  renderCurrentSection();
  renderAccountSync();
  renderSubscriptionGate();
}

function renderCurrentSection() {
  const active = document.querySelector(".section.active");
  const section = active?.id?.replace("section-", "");
  if (!section) return;
  if (section === "dashboard") renderDashboard();
  if (section === "learn") renderLearn();
  if (section === "lesson") renderLessonPage();
  if (section === "practice") renderPracticeHub();
  if (section === "mistakes") renderMistakesSection();
  if (section === "analytics") renderAnalytics();
  if (section === "aiplan") renderAIPlanSection();
  if (section === "goal") renderProfileScreen();
  if (["vocabulary","reading","listening","speaking","writing"].includes(section)) {
    renderQuestion(section);
  }
}

// ─── SUBSCRIPTION ACCESS ─────────────────────────
function initSubscriptionGate() {
  document.getElementById("subscriptionStatusBtn")?.addEventListener("click", () => {
    openSubscriptionGate({ force: true });
  });

  document.getElementById("subscriptionCloseBtn")?.addEventListener("click", () => {
    closeSubscriptionGate();
  });

  ["pointerdown", "click"].forEach(eventName => document.addEventListener(eventName, event => {
    if (!event.target.closest("#subscriptionCloseBtn")) return;
    event.preventDefault();
    event.stopPropagation();
    closeSubscriptionGate();
  }));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSubscriptionGate();
  });

  document.getElementById("startTrialBtn")?.addEventListener("click", () => {
    activateSubscription("trial");
  });

  document.getElementById("activateTariffBtn")?.addEventListener("click", () => {
    activateSubscription("week");
  });

  document.getElementById("applyPromoBtn")?.addEventListener("click", () => {
    applyPromoCode();
  });

  document.getElementById("promoCodeInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyPromoCode();
    }
  });

  renderSubscriptionGate();
}

function isUserSignedIn() {
  return typeof isAuthenticated === "function" && isAuthenticated();
}

function isOnboardingOpen() {
  const modal = document.getElementById("onboardingModal");
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function getSubscription() {
  return profile?.subscription || null;
}

function getSubscriptionRemainingDays(subscription = getSubscription()) {
  if (!subscription?.expiresAt) return null;
  const expires = new Date(subscription.expiresAt).getTime();
  if (!Number.isFinite(expires)) return 0;
  return Math.max(0, Math.ceil((expires - Date.now()) / 86400000));
}

function isSubscriptionActive(subscription = getSubscription()) {
  if (!subscription || subscription.status !== "active") return false;
  if (!subscription.expiresAt) return true;
  const expires = new Date(subscription.expiresAt).getTime();
  return Number.isFinite(expires) && expires > Date.now();
}

function shouldBlockWorkspaceAccess() {
  return isUserSignedIn()
    && !shouldShowAuthGate()
    && !isOnboardingOpen()
    && !isSubscriptionActive();
}

function addDaysIso(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function subscriptionStatusLabel() {
  const subscription = getSubscription();
  if (!isSubscriptionActive(subscription)) return t("subscription.status.locked");
  if (subscription.type === "promo") return t("subscription.status.promo");
  const days = getSubscriptionRemainingDays(subscription) || 1;
  if (subscription.type === "week") return t("subscription.status.week", { days });
  return t("subscription.status.trial", { days });
}

function renderSubscriptionGate(options = {}) {
  const gate = document.getElementById("subscriptionGate");
  const statusBtn = document.getElementById("subscriptionStatusBtn");
  const closeBtn = document.getElementById("subscriptionCloseBtn");
  if (!gate) return;

  profile = loadProfile();
  const signedIn = isUserSignedIn();
  const active = isSubscriptionActive();
  const blocking = shouldBlockWorkspaceAccess();
  if (options.force === true) subscriptionPanelOpen = true;
  if (!signedIn || blocking) subscriptionPanelOpen = false;
  const visible = signedIn && (blocking || subscriptionPanelOpen);

  gate.classList.toggle("hidden", !visible);
  document.body.classList.toggle("subscription-required", blocking);
  document.body.classList.toggle("subscription-gate-open", visible);
  if (closeBtn) closeBtn.hidden = blocking || !active;

  if (statusBtn) {
    statusBtn.textContent = signedIn ? subscriptionStatusLabel() : t("subscription.topbar");
    statusBtn.className = `subscription-status-btn ${active ? "active" : ""} ${signedIn && !active ? "locked" : ""}`.trim();
    statusBtn.title = active ? t("subscription.message.active") : t("subscription.message.required");
  }

  if (!signedIn) {
    setSubscriptionMessage("");
    return;
  }

  if (options.message) {
    setSubscriptionMessage(options.message, options.type || "info");
  } else if (blocking) {
    setSubscriptionMessage(t("subscription.message.required"), "info");
  } else if (visible) {
    setSubscriptionMessage(t("subscription.message.active"), "success");
  }
}

function openSubscriptionGate(options = {}) {
  if (!isUserSignedIn()) {
    openAuthGate("login");
    return;
  }
  renderSubscriptionGate({ ...options, force: true });
}

function closeSubscriptionGate() {
  if (shouldBlockWorkspaceAccess()) {
    renderSubscriptionGate();
    return;
  }
  subscriptionPanelOpen = false;
  renderSubscriptionGate();
}

function setSubscriptionMessage(message = "", type = "info") {
  const messageEl = document.getElementById("subscriptionMessage");
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.className = `subscription-message ${message ? "" : "hidden"} ${type}`;
}

function activateSubscription(type) {
  profile = loadProfile();
  const now = new Date().toISOString();
  const subscription = type === "promo"
    ? {
        type: "promo",
        status: "active",
        startedAt: now,
        expiresAt: null,
        promoCode: SUBSCRIPTION_PROMO_CODE
      }
    : {
        type,
        status: "active",
        startedAt: now,
        expiresAt: addDaysIso(type === "week" ? SUBSCRIPTION_WEEK_DAYS : SUBSCRIPTION_TRIAL_DAYS),
        priceRub: type === "week" ? 2999 : 0
      };

  profile.subscription = subscription;
  subscriptionPanelOpen = false;
  saveProfile(profile);
  renderAppShell();
  renderAccountSync();
  renderCurrentSection();
  renderSubscriptionGate();

  const message = type === "promo"
    ? t("subscription.message.promoSuccess")
    : type === "week"
      ? t("subscription.message.weekStarted")
      : t("subscription.message.trialStarted");
  showToast(message, "success");
  navigateTo(profile.startDate ? "dashboard" : "goal");
}

function applyPromoCode() {
  const input = document.getElementById("promoCodeInput");
  const code = (input?.value || "").trim();
  if (code === SUBSCRIPTION_PROMO_CODE) {
    activateSubscription("promo");
    if (input) input.value = "";
    return;
  }
  setSubscriptionMessage(t("subscription.message.promoInvalid"), "error");
}

function setAvatar(id, name, avatar = profile.avatar) {
  const el = document.getElementById(id);
  if (!el) return;
  const baseClasses = el.className
    .split(" ")
    .filter(cls => cls && !cls.startsWith("avatar-tone-") && cls !== "avatar-image")
    .join(" ");
  const avatarSource = getAvatarSource(avatar);
  el.className = baseClasses;
  el.style.removeProperty("background-image");

  if (avatarSource) {
    el.classList.add("avatar-image");
    el.style.backgroundImage = `url("${avatarSource}")`;
    el.textContent = "";
    return;
  }

  const tone = getAvatarTone(name);
  el.classList.add(`avatar-tone-${tone}`);
  el.textContent = getInitials(name);
}

function getInitials(name) {
  const parts = String(name || "Alex Carter").trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "A") + (parts[1]?.[0] || "");
}

function getAvatarTone(name) {
  const source = String(name || "Alex Carter");
  const hash = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function buildLectureSpeechText(q) {
  return [q.lectureTitle, q.lectureText].filter(Boolean).join(". ");
}

function getEnglishSpeechVoice() {
  if (!listeningSpeechState.supported) return null;
  const voices = window.speechSynthesis.getVoices?.() || [];
  const englishVoices = voices.filter(voice => /^en/i.test(voice.lang));
  const softerVoiceNames = /samantha|ava|allison|victoria|karen|moira|serena|aria|jenny|google us english/i;
  return englishVoices.find(voice => softerVoiceNames.test(voice.name))
    || englishVoices.find(voice => /^en[-_]?US/i.test(voice.lang))
    || englishVoices[0]
    || null;
}

function markLectureReady(container) {
  container.querySelector("#restartBtn")?.removeAttribute("disabled");
  container.querySelector("#miniRestartBtn")?.removeAttribute("disabled");
  container.querySelectorAll(".option-btn").forEach(button => {
    button.disabled = false;
  });
}

function setLectureTranscriptVisible(container, visible) {
  const transcript = container.querySelector("#lectureText") || container.querySelector("#miniLectureBox");
  const button = container.querySelector("#transcriptBtn") || container.querySelector("#miniTranscriptBtn");
  if (!transcript || !button) return;
  transcript.classList.toggle("hidden", !visible);
  button.textContent = visible ? "Hide transcript" : "Show transcript";
}

function updateSpeechProgress(progress, percent) {
  if (!progress) return;
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  progress.style.width = `${safePercent}%`;
}

function resetSpeechButton(button, label = "Replay Lecture") {
  if (!button) return;
  button.classList.remove("playing");
  button.classList.add("played");
  button.textContent = label;
}

function stopListeningSpeech(label = "Replay Lecture") {
  const activeButton = listeningSpeechState.activeButton;
  const activeProgress = listeningSpeechState.activeProgress;
  listeningSpeechState.activeId = null;
  listeningSpeechState.activeButton = null;
  listeningSpeechState.activeProgress = null;
  listeningSpeechState.activeUtterance = null;

  if (listeningSpeechState.supported) {
    window.speechSynthesis.cancel();
  }

  resetSpeechButton(activeButton, label);
  updateSpeechProgress(activeProgress, 0);
}

function playLectureAudio({ id, text, button, progress, onReady }) {
  if (!listeningSpeechState.supported) {
    onReady?.();
    resetSpeechButton(button, "Replay Lecture");
    updateSpeechProgress(progress, 100);
    showToast("Audio is not supported in this browser.", "error");
    return;
  }

  if (listeningSpeechState.activeId === id) {
    stopListeningSpeech("Replay Lecture");
    return;
  }

  stopListeningSpeech();
  onReady?.();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.pitch = 1.02;
  const voice = getEnglishSpeechVoice();
  if (voice) utterance.voice = voice;

  listeningSpeechState.activeId = id;
  listeningSpeechState.activeButton = button;
  listeningSpeechState.activeProgress = progress;
  listeningSpeechState.activeUtterance = utterance;

  button.classList.remove("played");
  button.classList.add("playing");
  button.textContent = "Stop Audio";
  updateSpeechProgress(progress, 0);

  utterance.onboundary = event => {
    if (listeningSpeechState.activeUtterance !== utterance || typeof event.charIndex !== "number") return;
    updateSpeechProgress(progress, (event.charIndex / Math.max(text.length, 1)) * 100);
  };

  utterance.onend = () => {
    if (listeningSpeechState.activeUtterance !== utterance) return;
    listeningSpeechState.activeId = null;
    listeningSpeechState.activeButton = null;
    listeningSpeechState.activeProgress = null;
    listeningSpeechState.activeUtterance = null;
    updateSpeechProgress(progress, 100);
    resetSpeechButton(button, "Replay Lecture");
  };

  utterance.onerror = () => {
    if (listeningSpeechState.activeUtterance !== utterance) return;
    listeningSpeechState.activeId = null;
    listeningSpeechState.activeButton = null;
    listeningSpeechState.activeProgress = null;
    listeningSpeechState.activeUtterance = null;
    resetSpeechButton(button, "Replay Lecture");
    showToast("Audio stopped. You can replay the lecture.", "info");
  };

  window.speechSynthesis.resume?.();
  window.speechSynthesis.speak(utterance);
}

// ─── DASHBOARD ───────────────────────────────────
function initDashboard() {
  document.getElementById("refreshAIBtn").addEventListener("click", async () => {
    await refreshTodayAIPlan();
  });
  document.getElementById("startFocusBtn").addEventListener("click", () => {
    const section = document.getElementById("startFocusBtn").dataset.section || "minitest";
    navigateTo(section);
  });
  renderDashboard();
}

function renderDashboard() {
  profile = loadProfile();
  const predicted = calcPredictedScore(profile);
  const gap       = Math.max(0, profile.targetScore - predicted);
  const days      = daysRemaining(profile);

  const scoreProgress = Math.min(100, Math.round((predicted / Math.max(profile.targetScore, 1)) * 100));
  const taskCount = totalCompletedTasks(profile);

  setText("dashTarget", profile.targetScore);
  setText("dashTargetStat", profile.targetScore);
  setText("dashCurrent", predicted);
  setText("dashCurrentStat", predicted);
  setText("dashGap", gap);
  setText("dashGapStat", gap);
  setText("dashDays", days);
  setText("topScore", predicted);
  setText("dashTasks", `${taskCount} ${t(taskCount === 1 ? "common.task" : "common.tasks")}`);
  setText("sidebarStreak", t("profile.daysLabel", { days: profile.streak?.current || 0 }));
  setText("dashboardInsight", buildDashboardInsight(predicted, gap, days));
  const ring = document.getElementById("scoreRing");
  if (ring) ring.style.setProperty("--score-progress", `${scoreProgress}%`);

  renderSkillBars();
  renderWeakZones();
  renderTodayPlan();
  renderPrimaryFocus();
  renderAppShell();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function skillLabel(skill) {
  return optionalT(`skill.${skill}`, SKILL_META[skill]?.label || titleCase(skill));
}

function totalCompletedTasks(currentProfile) {
  return Object.values(currentProfile.totalTasks || {}).reduce((sum, value) => sum + (value || 0), 0);
}

function buildDashboardInsight(predicted, gap, days) {
  if (gap <= 0) return t("dashboard.atTarget");
  if (totalCompletedTasks(profile) === 0) return t("dashboard.runDiagnosticInsight");
  return t("dashboard.gapInsight", { gap, days });
}

function getPrimaryFocus(currentProfile) {
  const totalTasks = totalCompletedTasks(currentProfile);
  if (totalTasks === 0) {
    return {
      section: "minitest",
      skill: "minitest",
      title: t("dashboard.runDiagnostic"),
      reason: t("dashboard.diagnosticReason"),
      meta: [t("common.questions10"), t("dashboard.mixedSkills"), t("dashboard.diagnostic")]
    };
  }

  const plan = normalizeStudyPlan(null, currentProfile);
  const task = plan.tasks[0];
  if (!task) {
    return {
      section: "practice",
      skill: "practice",
      title: t("dashboard.choosePractice"),
      reason: t("dashboard.practiceReason"),
      meta: [t("page.practice"), t("dashboard.dailyLoop")]
    };
  }

  return {
    section: task.skill,
    skill: task.skill,
    title: task.title,
    reason: task.reason,
    meta: [skillLabel(task.skill), `${task.minutes} min`, task.type]
  };
}

function renderPrimaryFocus() {
  const focus = getPrimaryFocus(profile);
  document.getElementById("primaryFocusTitle").textContent = focus.title;
  document.getElementById("primaryFocusReason").textContent = focus.reason;
  document.getElementById("primaryFocusMeta").innerHTML = focus.meta
    .map(item => `<span class="plan-pill">${escapeHtml(item)}</span>`)
    .join("");
  document.getElementById("startFocusBtn").dataset.section = focus.section;
}

function renderSkillBars() {
  const container = document.getElementById("skillBars");
  const skills = ["reading","listening","speaking","writing"];
  container.innerHTML = skills.map(skill => {
    const meta = SKILL_META[skill];
    const score = profile.scores[skill] || 0;
    const pct = Math.round((score / 30) * 100);
    const total = profile.totalTasks[skill] || 0;
    const status = getSkillStatus(score);
    return `
      <div class="skill-row-modern">
        <div class="skill-row-top">
          <span class="skill-dot fill-${skill}"></span>
          <span class="skill-bar-label">${skillLabel(skill)}</span>
          <strong>${score}/30</strong>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill ${meta.fillClass} ${percentClass("w", pct)}"></div>
        </div>
        <div class="skill-row-meta">
          <span class="skill-status ${status.className}">${status.label}</span>
          <span>${t("common.taskCount", { total })}</span>
        </div>
      </div>`;
  }).join("");
}

function getSkillStatus(score) {
  if (score <= 14) return { label: t("dashboard.priority"), className: "priority" };
  if (score <= 20) return { label: t("dashboard.needsPractice"), className: "needs" };
  return { label: t("dashboard.stable"), className: "stable" };
}

function renderWeakZones() {
  const container = document.getElementById("weakList");
  const weak      = calcWeaknessScores(profile).filter(s => s.total > 0);

  if (weak.length === 0) {
    const starterZones = [
      { skill: "reading", title: t("dashboard.readingInference"), copy: t("dashboard.readingCopy"), risk: t("dashboard.priority") },
      { skill: "listening", title: t("dashboard.listeningDetails"), copy: t("dashboard.listeningCopy"), risk: t("dashboard.priority") },
      { skill: "writing", title: t("dashboard.writingStructure"), copy: t("dashboard.writingCopy"), risk: t("dashboard.needsPractice") }
    ];
    container.innerHTML = starterZones.map(item => `
      <button class="weak-zone-card" data-section="${item.skill}">
        <span class="weak-zone-tag">${item.risk}</span>
        <strong>${item.title}</strong>
        <span>${item.copy}</span>
      </button>`).join("");
    return;
  }

  container.innerHTML = weak.slice(0, 4).map(w => {
    const errPct   = Math.round(w.score * 100);
    const severity = w.score >= 0.5 ? t("dashboard.highPriority") : t("dashboard.mediumPriority");
    return `
      <button class="weak-zone-card" data-section="${w.skill}">
        <span class="weak-zone-tag">${severity}</span>
        <strong>${skillLabel(w.skill)}</strong>
        <span>${t("dashboard.errorRate", { pct: errPct, total: w.total })}</span>
      </button>`;
  }).join("");
}

function renderTrajectoryChart(predicted) {
  renderTrajectoryChartInto("trajectoryChart", predicted);
}

function renderTrajectoryChartInto(containerId, predicted) {
  const targetContainer = document.getElementById(containerId);
  if (!targetContainer) return;
  renderTrajectoryBars(targetContainer, predicted);
}

function renderTrajectoryBars(container, predicted) {
  if (!container) return;

  const target = profile.targetScore || 95;
  const start = Math.max(35, Math.min(predicted - 10, predicted));
  const history = profile.miniTestHistory || [];
  const lastScores = history.slice(-8).map(item => item.predictedScore || predicted);
  const points = lastScores.length >= 2
    ? lastScores
    : Array.from({ length: 8 }, (_, i) => Math.round(start + ((predicted - start) * i / 7)));

  container.innerHTML = points.map((score, index) => {
    const pct = Math.max(18, Math.min(100, Math.round((score / Math.max(target, 1)) * 100)));
    const heightBand = Math.max(20, Math.min(100, Math.round(pct / 10) * 10));
    return `
      <div class="trajectory-week">
        <span class="trajectory-bar bar-h-${heightBand}"></span>
        <small>W${index + 1}</small>
      </div>`;
  }).join("");
  setText("trajectoryInsight", points.length > 1
    ? `Projected movement: ${points[0]} to ${points[points.length - 1]} toward your ${target} target.`
    : "Complete a mini test to start charting score movement.");
}

function renderTodayPlan() {
  const container = document.getElementById("todayPlan");

  // Use cached AI plan if recent (same day)
  if (profile.lastAIPlan && profile.lastAIPlanDate) {
    const today = new Date().toDateString();
    const planDate = new Date(profile.lastAIPlanDate).toDateString();
    if (today === planDate) {
      container.innerHTML = renderPlanHtml(normalizeStudyPlan(profile.lastAIPlan, profile));
      return;
    }
  }

  // Use local plan
  container.innerHTML = renderPlanHtml(normalizeStudyPlan(null, profile));
}

function renderHabitProgress() {
  const container = document.getElementById("habitProgress");
  if (!container) return;
  const level = calcUserLevel(profile);
  const next = xpForNextLevel(profile);
  const prev = (level - 1) * 120;
  const xp = profile.xp || 0;
  const pct = Math.min(100, Math.round(((xp - prev) / Math.max(1, next - prev)) * 100));
  const achievements = (profile.achievements || []).slice(-2);

  container.innerHTML = `
    <div class="habit-grid">
      <div class="habit-stat"><div class="habit-value">${level}</div><div class="habit-label">Level</div></div>
      <div class="habit-stat"><div class="habit-value">${profile.streak?.current || 0}</div><div class="habit-label">Day streak</div></div>
      <div class="habit-stat"><div class="habit-value">${xp}</div><div class="habit-label">Total XP</div></div>
      <div class="habit-stat"><div class="habit-value">${profile.streak?.best || 0}</div><div class="habit-label">Best streak</div></div>
    </div>
    <div class="xp-track"><div class="xp-fill ${percentClass("w", pct)}"></div></div>
    <div class="plan-why plan-why-spaced">${Math.max(0, next - xp)} XP to Level ${level + 1}</div>
    <div class="achievement-list achievement-list-spaced">
      ${achievements.length ? achievements.map(a => `<div class="achievement-mini">${a}</div>`).join("") : `<div class="placeholder-text placeholder-text-compact">Earn achievements by practicing.</div>`}
    </div>`;
}

function renderSmartFocus() {
  const container = document.getElementById("smartFocus");
  if (!container) return;
  const plan = normalizeStudyPlan(null, profile);
  container.innerHTML = `
    <div class="smart-list">
      ${plan.tasks.slice(0, 3).map(task => `
        <div class="smart-item">
          <strong>${task.title}</strong>
          <span>${task.reason}</span>
        </div>`).join("")}
    </div>`;
}

function renderMistakePreview() {
  const container = document.getElementById("mistakePreview");
  if (!container) return;
  const mistakes = (profile.mistakeBank || []).filter(item => !item.mastered).slice(0, 4);
  if (!mistakes.length) {
    container.innerHTML = `<p class="placeholder-text placeholder-text-compact">Wrong answers will appear here for review.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="mistake-list">
      ${mistakes.map(item => `
        <div class="mistake-mini">
          <strong>${item.topic}</strong>
          <span>${escapeHtml(item.prompt).slice(0, 86)}${item.prompt.length > 86 ? "..." : ""}</span>
        </div>`).join("")}
    </div>`;
}

function renderPracticeHub() {
  const container = document.getElementById("practiceHub");
  if (!container) return;

  profile = loadProfile();
  const skills = ["reading","listening","speaking","writing","vocabulary"];
  const focus = getPrimaryFocus(profile);
  const skillCards = skills.map(skill => {
    const correct = profile.correct[skill] || 0;
    const total = profile.totalTasks[skill] || 0;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const mistakes = profile.mistakes[skill] || 0;
    const readiness = skill === "vocabulary" ? pct : Math.round(((profile.scores[skill] || 0) / 30) * 100);
    const status = total === 0 ? t("practice.notStarted") : pct >= 75 ? t("dashboard.stable") : pct >= 50 ? t("dashboard.needsPractice") : t("dashboard.priority");

    return `
      <button class="skill-practice-card" data-section="${skill}">
        <span class="hub-icon">${skillLabel(skill).slice(0, 1)}</span>
        <span class="hub-title">${skillLabel(skill)}</span>
        <span class="skill-status ${statusClass(status)}">${status}</span>
        <span class="hub-copy">${total ? t("practice.accuracy", { pct, total }) : t("practice.shortDrill")}</span>
        <span class="hub-bar"><span class="hub-bar-fill fill-${skill} ${percentClass("w", readiness)}"></span></span>
        <span class="hub-meta">${t("practice.meta", { mistakes, readiness })}</span>
      </button>`;
  }).join("");

  container.innerHTML = `
    <div class="card today-practice-card">
      <div class="card-kicker">${t("practice.today")}</div>
      <h2>${escapeHtml(focus.title)}</h2>
      <p>${escapeHtml(focus.reason)}</p>
      <div class="focus-meta">${focus.meta.map(item => `<span class="plan-pill">${escapeHtml(item)}</span>`).join("")}</div>
      <button class="btn-primary" data-section="${focus.section}">${t("practice.startDrill")}</button>
    </div>
    <button class="card mini-test-feature" data-section="minitest">
      <span class="hub-icon">10</span>
      <span>
        <strong>${t("practice.miniTest")}</strong>
        <small>${t("practice.miniCopy")}</small>
      </span>
    </button>
    <div class="practice-skills-grid">${skillCards}</div>`;
}

function statusClass(status) {
  const value = String(status).toLowerCase();
  if (status === t("dashboard.priority") || value.includes("priority") || value.includes("priorité") || value.includes("prioridad") || value.includes("приоритет")) return "priority";
  if (status === t("dashboard.needsPractice") || value.includes("needs") || value.includes("prati") || value.includes("práct") || value.includes("практи")) return "needs";
  if (status === t("dashboard.stable") || value.includes("stable") || value.includes("стабил")) return "stable";
  return "";
}

function renderMistakesSection() {
  const container = document.getElementById("mistakesHub");
  if (!container) return;

  profile = loadProfile();
  const weak = calcWeaknessScores(profile).filter(item => item.total > 0);
  const mistakes = (profile.mistakeBank || []).filter(item => !item.mastered);

  const weakHtml = weak.length
    ? weak.slice(0, 5).map(item => {
        const meta = SKILL_META[item.skill];
        const errPct = Math.round(item.score * 100);
        return `
          <button class="mistake-focus-row" data-section="${item.skill}">
            <span>${meta.label}</span>
            <strong>${errPct}% errors</strong>
            <small>${item.mistakes}/${item.total} missed</small>
          </button>`;
      }).join("")
    : `<p class="placeholder-text">Complete practice tasks to build your weak-zone list.</p>`;

  const mistakesHtml = mistakes.length
    ? mistakes.slice(0, 10).map(item => `
        <div class="mistake-review-card">
          <span class="mistake-review-skill">${SKILL_META[item.skill]?.label || item.skill}</span>
          <strong>${escapeHtml(item.topic)}</strong>
          <span>${escapeHtml(item.prompt).slice(0, 160)}${item.prompt.length > 160 ? "..." : ""}</span>
          ${item.correctAnswer ? `<small>Correct: ${escapeHtml(item.correctAnswer)}</small>` : ""}
          <div class="mistake-card-actions">
            <button class="btn-secondary btn-compact" data-section="${escapeHtml(item.skill)}">Practice skill</button>
            <button class="btn-secondary btn-compact" data-save-mistake-note="${escapeHtml(item.id)}">Save to notes</button>
          </div>
        </div>`).join("")
    : `<p class="placeholder-text">Missed questions will appear here after practice.</p>`;

  container.innerHTML = `
    <div class="card mistakes-panel">
      <h2 class="card-title">Weak Zones</h2>
      <div class="mistake-focus-list">${weakHtml}</div>
    </div>
    <div class="card mistakes-panel">
      <h2 class="card-title">Review Bank</h2>
      <div class="mistake-review-list">${mistakesHtml}</div>
    </div>`;
}

function normalizeStudyPlan(rawPlan, currentProfile) {
  const local = generateLocalStudyPlan(currentProfile);
  const parsed = parseJsonFromAI(rawPlan);
  const cleanedSummary = parsed?.summary || cleanAIText(rawPlan || local.explanation).split("\n").find(Boolean) || local.explanation;
  const aiTasks = Array.isArray(parsed?.tasks) ? parsed.tasks : [];
  const fallbackTasks = local.tasks.map(task => ({
    skill: task.skill,
    title: task.task,
    reason: task.why,
    minutes: task.skill === "vocabulary" ? 8 : 15,
    type: task.skill === "speaking" || task.skill === "writing" ? "ai-feedback" : "drill"
  }));

  const tasks = normalizePlanTasks(aiTasks, fallbackTasks);
  return {
    summary: cleanedSummary,
    tasks,
    motivation: parsed?.motivation || "Small daily practice compounds into real score movement."
  };
}

function normalizePlanTasks(aiTasks, fallbackTasks) {
  const allowed = new Set(["reading","listening","speaking","writing","vocabulary"]);
  const tasks = aiTasks.map(task => {
    const skill = String(task.skill || "").toLowerCase();
    if (!allowed.has(skill)) return null;
    return {
      skill,
      title: cleanAIText(task.title || task.task || `Practice ${SKILL_META[skill].label}`),
      reason: cleanAIText(task.reason || "Targets your current score gap."),
      minutes: Number(task.minutes) || 12,
      type: cleanAIText(task.type || "drill")
    };
  }).filter(Boolean);

  fallbackTasks.forEach(task => {
    if (tasks.length < 5 && !tasks.some(existing => existing.skill === task.skill)) tasks.push(task);
  });

  return tasks.slice(0, 5);
}

function renderPlanHtml(plan) {
  return `
    <div class="feedback-box info plan-summary">${escapeHtml(plan.summary)}</div>
    ${plan.tasks.map((task, i) => `
      <div class="plan-item">
        <div class="plan-num">${i + 1}</div>
        <div>
          <div class="plan-text">${escapeHtml(task.title)}</div>
          <div class="plan-why">${escapeHtml(task.reason)}</div>
          <div class="plan-meta">
            <span class="plan-pill">${escapeHtml(SKILL_META[task.skill]?.label || task.skill)}</span>
            <span class="plan-pill">${task.minutes} min</span>
            <span class="plan-pill">${escapeHtml(task.type)}</span>
          </div>
        </div>
      </div>`).join("")}`;
}

function parseJsonFromAI(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "string") return null;
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function cleanAIText(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/^\s*[*-]\s+/gm, "")
    .replace(/#+\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getAIStatusCopy(err) {
  const code = err?.code || "AI_REQUEST_FAILED";
  const status = err?.status ? `HTTP ${err.status}` : "Local fallback";
  const copies = {
    RATE_LIMITED: {
      tone: "warning",
      label: "Rate limit",
      title: "AI is taking a short break",
      message: "Too many AI requests were sent recently. Your local plan is still ready to use."
    },
    AI_TIMEOUT: {
      tone: "warning",
      label: "Timeout",
      title: "AI took too long to answer",
      message: "The coach switched to a local fallback so you can keep preparing without waiting."
    },
    AI_UNAVAILABLE: {
      tone: "danger",
      label: "Unavailable",
      title: "AI is not available right now",
      message: "The Groq connection or API key is not ready. Local recommendations are shown instead."
    },
    INVALID_AI_RESPONSE: {
      tone: "warning",
      label: "Invalid response",
      title: "AI response could not be used",
      message: "The app protected the plan quality and replaced the response with a structured fallback."
    },
    VALIDATION_ERROR: {
      tone: "danger",
      label: "Data issue",
      title: "The request needs cleaner data",
      message: "Some study data did not pass validation. A local plan is shown while the data is corrected."
    },
    AI_PROXY_ERROR: {
      tone: "danger",
      label: "Server error",
      title: "AI proxy had a problem",
      message: "The backend could not complete the AI request. You can keep working with the local plan."
    },
    AI_REQUEST_FAILED: {
      tone: "danger",
      label: "Fallback",
      title: "AI plan could not be generated",
      message: "The app switched to local recommendations so the preparation flow stays usable."
    }
  };
  return { ...copies[code] || copies.AI_REQUEST_FAILED, detail: err?.message || status, code };
}

function renderAIStatus(state, options = {}) {
  const detail = options.showDetail === false ? "" : `<small>${escapeHtml(state.detail)}</small>`;
  const action = options.action ? `<span class="ai-state-action">${escapeHtml(options.action)}</span>` : "";
  return `
    <div class="ai-state-card ai-state-${state.tone}" role="status">
      <div class="ai-state-icon">${state.tone === "danger" ? "!" : "i"}</div>
      <div class="ai-state-copy">
        <div class="ai-state-topline">
          <span class="ai-state-label">${escapeHtml(state.label)}</span>
          ${action}
        </div>
        <strong>${escapeHtml(state.title)}</strong>
        <p>${escapeHtml(state.message)}</p>
        ${detail}
      </div>
    </div>`;
}

function renderAILoading(message) {
  return `
    <div class="ai-state-card ai-state-loading" role="status">
      <div class="spinner"></div>
      <div class="ai-state-copy">
        <span class="ai-state-label">AI working</span>
        <strong>${escapeHtml(message)}</strong>
        <p>Using your current score, weak zones, confidence, and target pace.</p>
      </div>
    </div>`;
}

function initCoachChat() {
  const toggle = document.getElementById("coachChatToggle");
  const panel = document.getElementById("coachChatPanel");
  const close = document.getElementById("coachChatClose");
  const form = document.getElementById("coachChatForm");
  const input = document.getElementById("coachChatInput");
  const suggestions = document.getElementById("coachChatSuggestions");
  const messages = document.getElementById("coachChatMessages");
  if (!toggle || !panel || !form || !input || !messages) return;

  if (!messages.dataset.ready) {
    appendCoachMessage("assistant", getCoachWelcomeMessage());
    messages.dataset.ready = "true";
  }

  toggle.addEventListener("click", () => setCoachChatOpen(panel.classList.contains("hidden")));
  close?.addEventListener("click", () => setCoachChatOpen(false));

  form.addEventListener("submit", async event => {
    event.preventDefault();
    await submitCoachChat(input.value);
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  suggestions?.addEventListener("click", event => {
    const prompt = event.target.closest("[data-chat-prompt]")?.dataset.chatPrompt;
    if (!prompt) return;
    input.value = prompt;
    form.requestSubmit();
  });
}

function setCoachChatOpen(isOpen) {
  const panel = document.getElementById("coachChatPanel");
  const toggle = document.getElementById("coachChatToggle");
  if (!panel || !toggle) return;
  panel.classList.toggle("hidden", !isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.classList.toggle("active", isOpen);
  if (isOpen) {
    setNotebookOpen(false, { preserveFocus: true });
    document.getElementById("coachChatInput")?.focus();
    scrollCoachChatToBottom();
  }
}

function setNotebookOpen(isOpen, options = {}) {
  const panel = document.getElementById("notebookPanel");
  const toggle = document.getElementById("notebookToggle");
  if (!panel || !toggle) return;
  panel.classList.toggle("hidden", !isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.classList.toggle("active", isOpen);
  if (isOpen) {
    const chatPanel = document.getElementById("coachChatPanel");
    const chatToggle = document.getElementById("coachChatToggle");
    chatPanel?.classList.add("hidden");
    chatToggle?.setAttribute("aria-expanded", "false");
    chatToggle?.classList.remove("active");
    renderNotebook();
    if (!options.preserveFocus) document.getElementById("noteTitleInput")?.focus();
  }
}

function getCoachWelcomeMessage() {
  const total = totalCompletedTasks(profile);
  if (total === 0) {
    return "I can help you choose the next TOEFL step. Start with the mini diagnostic, then I will use your weak zones and score gap for sharper advice.";
  }
  return "I can use your score, weak zones, confidence, and recent mistakes to suggest the next focused TOEFL step.";
}

async function submitCoachChat(rawMessage) {
  const input = document.getElementById("coachChatInput");
  const send = document.getElementById("coachChatSend");
  const message = cleanCoachText(rawMessage);
  if (!message) return;

  input.value = "";
  appendCoachMessage("user", message);
  const loadingId = appendCoachMessage("assistant", "Thinking through your TOEFL data...", { loading: true });
  if (send) send.disabled = true;

  try {
    const result = await fetchCoachChat(message, coachChatHistory.slice(-6), getCoachChatContext());
    replaceCoachMessage(loadingId, renderCoachAnswer(result));
  } catch (err) {
    replaceCoachMessage(loadingId, renderCoachAnswer({
      answer: getLocalCoachFallback(message),
      followUps: ["Run the mini diagnostic", "Review today's focus"]
    }));
    showToast("AI coach used a local fallback.", "error");
  } finally {
    if (send) send.disabled = false;
    input.focus();
  }
}

function getCoachChatContext() {
  const active = document.querySelector(".section.active")?.id?.replace("section-", "") || "dashboard";
  const selectedSkill = PRACTICE_SECTIONS.includes(active) ? active : "";
  return { page: PAGE_TITLES[active] || SECTION_TITLES[active] || active, selectedSkill };
}

function appendCoachMessage(role, text, options = {}) {
  const messages = document.getElementById("coachChatMessages");
  if (!messages) return "";

  const id = `coach-msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const item = document.createElement("div");
  item.className = `coach-message coach-message-${role}${options.loading ? " coach-message-loading" : ""}`;
  item.dataset.messageId = id;
  item.innerHTML = role === "assistant" && options.loading
    ? `<div class="coach-typing"><span></span><span></span><span></span></div><p>${escapeHtml(text)}</p>`
    : renderCoachMessageContent(role, text);
  messages.appendChild(item);

  if (!options.loading) rememberCoachMessage(role, text);
  scrollCoachChatToBottom();
  return id;
}

function replaceCoachMessage(id, html) {
  const item = document.querySelector(`[data-message-id="${id}"]`);
  if (!item) return;
  item.classList.remove("coach-message-loading");
  item.innerHTML = html;
  const plainText = item.textContent.replace(/\s+/g, " ").trim();
  rememberCoachMessage("assistant", plainText);
  bindCoachFollowUps(item);
  scrollCoachChatToBottom();
}

function renderCoachMessageContent(role, text) {
  const cleaned = cleanCoachText(text);
  return `<p>${escapeHtml(cleaned)}</p>`;
}

function renderCoachAnswer(result) {
  const parsed = parseJsonFromAI(result) || {};
  const answer = cleanCoachText(parsed.answer || result?.answer || result || getLocalCoachFallback(""));
  const paragraphs = answer.split(/\n+/).map(part => part.trim()).filter(Boolean);
  const followUps = Array.isArray(parsed.followUps || result?.followUps)
    ? (parsed.followUps || result.followUps).map(cleanCoachText).filter(Boolean).slice(0, 3)
    : [];

  return `
    <div class="coach-answer">
      ${paragraphs.map(part => `<p>${escapeHtml(part)}</p>`).join("")}
      ${followUps.length ? `
        <div class="coach-followups">
          ${followUps.map(item => `<button type="button" data-chat-prompt="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        </div>` : ""}
    </div>`;
}

function bindCoachFollowUps(scope) {
  scope.querySelectorAll("[data-chat-prompt]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById("coachChatInput");
      input.value = button.dataset.chatPrompt || "";
      document.getElementById("coachChatForm")?.requestSubmit();
    });
  });
}

function rememberCoachMessage(role, text) {
  coachChatHistory.push({ role, text: cleanCoachText(text).slice(0, 500) });
  coachChatHistory = coachChatHistory.slice(-10);
}

function cleanCoachText(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`+/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function getLocalCoachFallback(message) {
  const total = totalCompletedTasks(profile);
  if (total === 0) {
    return "Start with the 10-question mini diagnostic. After that, the coach can use real weak zones, confidence, and score gap instead of guessing.";
  }
  const weak = calcWeaknessScores(profile).filter(item => item.total > 0)[0];
  if (weak) {
    const label = SKILL_META[weak.skill]?.label || weak.skill;
    return `Focus on ${label} next. Your recent answers show this is the fastest place to reduce mistakes before adding more general practice.`;
  }
  return "Choose one focused practice set, answer it fully, then review every missed question before moving to a new skill.";
}

function scrollCoachChatToBottom() {
  const messages = document.getElementById("coachChatMessages");
  if (messages) messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function refreshTodayAIPlan() {
  const btn = document.getElementById("refreshAIBtn");
  btn.disabled = true;
  btn.textContent = t("dashboard.generating");

  const container = document.getElementById("todayPlan");
  container.innerHTML = renderAILoading("Building your structured AI plan...");

  try {
    const result = await fetchAIStudyPlan();
    container.innerHTML = renderPlanHtml(normalizeStudyPlan(result, profile));
    profile.lastAIPlan     = result;
    profile.lastAIPlanDate = new Date().toISOString();
    saveProfile(profile);
    showToast("AI plan updated.", "success");
  } catch (err) {
    const state = getAIStatusCopy(err);
    container.innerHTML = `
      ${renderAIStatus(state, { action: "Local plan is active" })}
      ${renderPlanHtml(normalizeStudyPlan(null, profile))}`;
    showToast("AI unavailable. Local plan is active.", state.tone === "danger" ? "error" : "info");
  }

  btn.disabled = false;
  btn.textContent = t("dashboard.refreshAI");
}

// ─── GOAL SETUP ──────────────────────────────────
function initGoalForm() {
  setupBtnGroup("targetScoreGroup");
  setupBtnGroup("prepDaysGroup");
  setupBtnGroup("levelGroup");
  setupBtnGroup("goalGroup");
  document.getElementById("profileNameInput").addEventListener("input", updateSetupPreview);

  // Restore saved values
  document.getElementById("profileNameInput").value = profile.name || "Alex Carter";
  setActiveBtn("targetScoreGroup", String(profile.targetScore));
  setActiveBtn("prepDaysGroup",    String(profile.preparationDays));
  setActiveBtn("levelGroup",       profile.level);
  setActiveBtn("goalGroup",        profile.goal);
  updateSetupPreview();

  document.getElementById("saveGoalBtn").addEventListener("click", () => {
    applyStudySetup({
      name: document.getElementById("profileNameInput").value.trim() || "Alex Carter",
      targetScore: parseInt(getSelected("targetScoreGroup")) || 95,
      preparationDays: parseInt(getSelected("prepDaysGroup")) || 60,
      level: getSelected("levelGroup") || "intermediate",
      goal: getSelected("goalGroup") || "study abroad"
    });
    document.getElementById("goalSaved").classList.remove("hidden");
    showToast(t("toast.goalSaved"), "success");
    setTimeout(() => {
      navigateTo("dashboard");
      document.getElementById("goalSaved").classList.add("hidden");
    }, 1800);
  });
}

function applyStudySetup({ name, targetScore, preparationDays, level, goal }) {
  profile.name = name || profile.name || "Alex Carter";
  profile.exam = "TOEFL iBT";
  profile.targetScore = Number(targetScore) || 95;
  profile.preparationDays = Number(preparationDays) || 60;
  profile.level = level || "intermediate";
  profile.goal = goal || "study abroad";
  profile.startDate = profile.startDate || new Date().toISOString();

  const levelScores = { beginner: 8, intermediate: 14, advanced: 20 };
  const base = levelScores[profile.level] || 14;
  if ((profile.totalTasks?.reading || 0) === 0) {
    profile.scores = { reading: base, listening: base, speaking: base, writing: base };
    profile.baselineScores = { ...profile.scores };
  }

  saveProfile(profile);
  renderAppShell();
  updateSetupPreview();
}

// ─── AVATAR PICKER ───────────────────────────────
function initAvatarPicker() {
  renderAvatarPresetGrid();

  document.getElementById("profileAvatarEditBtn")?.addEventListener("click", () => {
    openAvatarModal();
  });

  document.getElementById("avatarModalClose")?.addEventListener("click", () => {
    closeAvatarModal();
  });

  document.getElementById("avatarModal")?.addEventListener("click", event => {
    if (event.target.id === "avatarModal") closeAvatarModal();
  });

  document.getElementById("avatarUploadBtn")?.addEventListener("click", () => {
    document.getElementById("avatarUploadInput")?.click();
  });

  document.getElementById("avatarUploadInput")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleAvatarUpload(file);
    event.target.value = "";
  });

  document.getElementById("avatarInitialsBtn")?.addEventListener("click", () => {
    saveAvatarChoice(null);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAvatarModal();
  });
}

function openAvatarModal() {
  renderAvatarPresetGrid();
  document.getElementById("avatarModal")?.classList.remove("hidden");
  document.body.classList.add("avatar-modal-open");
}

function closeAvatarModal() {
  document.getElementById("avatarModal")?.classList.add("hidden");
  document.body.classList.remove("avatar-modal-open");
}

function renderAvatarPresetGrid() {
  const grid = document.getElementById("avatarPresetGrid");
  if (!grid) return;
  const currentAvatar = loadProfile().avatar || null;
  grid.innerHTML = AVATAR_PRESETS.map(preset => {
    const selected = currentAvatar?.type === "preset" && currentAvatar.id === preset.id;
    return `
      <button class="avatar-preset-btn ${selected ? "selected" : ""}" type="button" data-avatar-preset="${preset.id}" aria-label="${preset.name}">
        <span class="avatar-preset-img" style="background-image: url('${avatarPresetDataUrl(preset)}')"></span>
        <span>${preset.name}</span>
      </button>
    `;
  }).join("");

  grid.querySelectorAll("[data-avatar-preset]").forEach(button => {
    button.addEventListener("click", () => {
      const preset = AVATAR_PRESETS.find(item => item.id === button.dataset.avatarPreset);
      if (!preset) return;
      saveAvatarChoice({ type: "preset", id: preset.id });
    });
  });
}

function avatarPresetDataUrl(preset) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="bg" x1="18" y1="12" x2="142" y2="148" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${preset.bg1}"/>
          <stop offset="1" stop-color="${preset.bg2}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#0f172a" flood-opacity=".20"/>
        </filter>
      </defs>
      <rect width="160" height="160" rx="42" fill="url(#bg)"/>
      <circle cx="80" cy="84" r="56" fill="${preset.face}" opacity=".9" filter="url(#shadow)"/>
      <circle cx="54" cy="62" r="20" fill="rgba(255,255,255,.22)"/>
      <circle cx="111" cy="65" r="18" fill="rgba(255,255,255,.16)"/>
      <text x="80" y="92" text-anchor="middle" dominant-baseline="middle" font-size="72">${preset.emoji}</text>
      <circle cx="35" cy="34" r="7" fill="#fff" opacity=".55"/>
      <circle cx="125" cy="126" r="10" fill="#fff" opacity=".18"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function getAvatarSource(avatar) {
  if (avatar?.type === "upload" && avatar.dataUrl) return avatar.dataUrl;
  if (avatar?.type === "preset") {
    const preset = AVATAR_PRESETS.find(item => item.id === avatar.id);
    return preset ? avatarPresetDataUrl(preset) : "";
  }
  return "";
}

function saveAvatarChoice(avatar) {
  profile = loadProfile();
  if (avatar) {
    profile.avatar = avatar;
  } else {
    delete profile.avatar;
  }
  saveProfile(profile);
  renderAppShell();
  renderAccountSync();
  updateSetupPreview();
  renderAvatarPresetGrid();
  closeAvatarModal();
  showToast(t("avatar.saved"), "success");
}

async function handleAvatarUpload(file) {
  if (file.size > AVATAR_UPLOAD_MAX_BYTES) {
    showToast(t("avatar.uploadTooLarge"), "error");
    return;
  }

  try {
    const dataUrl = await resizeAvatarImage(file);
    saveAvatarChoice({
      type: "upload",
      dataUrl,
      name: file.name || "custom-avatar",
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Avatar upload failed:", err);
    showToast(t("avatar.uploadFailed"), "error");
  }
}

function resizeAvatarImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_IMAGE_SIZE;
        canvas.height = AVATAR_IMAGE_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas is not supported"));
          return;
        }

        const size = Math.min(image.width, image.height);
        const sx = Math.max(0, (image.width - size) / 2);
        const sy = Math.max(0, (image.height - size) / 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, AVATAR_IMAGE_SIZE, AVATAR_IMAGE_SIZE);
        ctx.drawImage(image, sx, sy, size, size, 0, 0, AVATAR_IMAGE_SIZE, AVATAR_IMAGE_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function initOnboarding() {
  document.getElementById("onboardingBackBtn")?.addEventListener("click", () => {
    if (onboardingStepIndex === 0) return;
    onboardingStepIndex -= 1;
    renderOnboardingStep();
  });

  document.getElementById("onboardingNextBtn")?.addEventListener("click", () => {
    const step = ONBOARDING_STEPS[onboardingStepIndex];
    if (!step || onboardingAnswers[step.key] == null) {
      showToast("Choose one option to continue.", "info");
      return;
    }

    if (onboardingStepIndex < ONBOARDING_STEPS.length - 1) {
      onboardingStepIndex += 1;
      renderOnboardingStep();
      return;
    }

    finishOnboardingFlow();
  });
}

function startOnboardingFlow({ prefill = false } = {}) {
  ONBOARDING_STEPS.forEach(step => {
    if (prefill) {
      onboardingAnswers[step.key] = profile[step.key];
      return;
    }
    delete onboardingAnswers[step.key];
  });
  onboardingStepIndex = 0;
  renderOnboardingStep();
  const modal = document.getElementById("onboardingModal");
  modal?.classList.remove("hidden");
  document.body.classList.add("auth-gate-open");
}

function renderOnboardingStep() {
  const step = ONBOARDING_STEPS[onboardingStepIndex];
  if (!step) return;

  setText("onboardingStepText", `Step ${onboardingStepIndex + 1} of ${ONBOARDING_STEPS.length}`);
  setText("onboardingTitle", step.title);
  setText("onboardingCopy", step.copy);
  const completedSteps = onboardingStepIndex + (onboardingAnswers[step.key] != null ? 1 : 0);
  const progress = Math.round((completedSteps / ONBOARDING_STEPS.length) * 100);
  document.getElementById("onboardingProgressFill")?.style.setProperty("--onboarding-progress", `${progress}%`);
  document.getElementById("onboardingBuilding")?.classList.add("hidden");

  const dots = document.getElementById("onboardingDots");
  if (dots) {
    dots.innerHTML = ONBOARDING_STEPS
      .map((_, index) => `<span class="${index === onboardingStepIndex ? "active" : ""}"></span>`)
      .join("");
  }

  const options = document.getElementById("onboardingOptions");
  if (options) {
    options.innerHTML = step.options.map(option => `
      <button class="onboarding-option ${String(onboardingAnswers[step.key]) === String(option.value) ? "selected" : ""}" type="button" data-onboarding-value="${option.value}">
        <strong>${option.label}</strong>
        <span>${option.note}</span>
      </button>
    `).join("");
    options.querySelectorAll("[data-onboarding-value]").forEach(button => {
      button.addEventListener("click", () => {
        onboardingAnswers[step.key] = button.dataset.onboardingValue;
        if (step.key === "targetScore" || step.key === "preparationDays") {
          onboardingAnswers[step.key] = Number(onboardingAnswers[step.key]);
        }
        renderOnboardingStep();
      });
    });
  }

  const backBtn = document.getElementById("onboardingBackBtn");
  if (backBtn) backBtn.disabled = onboardingStepIndex === 0;
  setText("onboardingNextBtn", onboardingStepIndex === ONBOARDING_STEPS.length - 1 ? "Save setup" : "Next");
}

function finishOnboardingFlow() {
  const nextBtn = document.getElementById("onboardingNextBtn");
  const backBtn = document.getElementById("onboardingBackBtn");
  const building = document.getElementById("onboardingBuilding");
  if (nextBtn) nextBtn.disabled = true;
  if (backBtn) backBtn.disabled = true;
  building?.classList.remove("hidden");
  document.getElementById("onboardingProgressFill")?.style.setProperty("--onboarding-progress", "100%");

  applyStudySetup({
    name: profile.name,
    targetScore: onboardingAnswers.targetScore,
    preparationDays: onboardingAnswers.preparationDays,
    level: onboardingAnswers.level,
    goal: onboardingAnswers.goal
  });

  window.setTimeout(() => {
    document.getElementById("onboardingModal")?.classList.add("hidden");
    document.body.classList.remove("auth-gate-open");
    if (nextBtn) nextBtn.disabled = false;
    if (backBtn) backBtn.disabled = false;
    renderProfileScreen();
    renderAccountSync();
    showToast("Personal plan is ready.", "success");
    navigateTo("dashboard", { bypassSubscription: true });
    renderSubscriptionGate();
  }, 900);
}

function initAccountSync() {
  window.addEventListener("profile-sync-state", event => {
    accountSyncState = event.detail || accountSyncState;
    renderAccountSync();
    renderAuthGate();
    renderSubscriptionGate();
  });

  document.getElementById("createAccountBtn")?.addEventListener("click", async () => {
    await handleAuthSubmit("register");
  });
  document.getElementById("signInBtn")?.addEventListener("click", async () => {
    await handleAuthSubmit("login");
  });
  document.getElementById("openAuthGateBtn")?.addEventListener("click", () => {
    openAuthGate("login");
  });
  document.getElementById("topbarSyncStatus")?.addEventListener("click", event => {
    if (typeof isAuthenticated === "function" && isAuthenticated()) return;
    event.preventDefault();
    event.stopPropagation();
    openAuthGate("login");
  });
  document.getElementById("syncNowBtn")?.addEventListener("click", async () => {
    await handleManualSync();
  });
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    logoutUser();
    renderAccountSync();
    setAuthGateMode("register");
    renderAuthGate();
    renderSubscriptionGate();
  });

  renderAccountSync();
}

function openAuthGate(mode = "login") {
  if (typeof isAuthenticated === "function" && isAuthenticated()) return;
  setAuthGateMode(mode);
  renderAuthGate();
}

function initAuthGate() {
  document.querySelectorAll("[data-auth-gate-mode]").forEach(button => {
    button.addEventListener("click", () => setAuthGateMode(button.dataset.authGateMode || "register"));
  });

  document.getElementById("authGateSubmitBtn")?.addEventListener("click", async () => {
    await handleAuthSubmit(authGateMode, "gate");
  });

  setAuthGateMode(authGateMode);
  renderAuthGate();
}

function setAuthGateMode(mode) {
  authGateMode = mode === "login" ? "login" : "register";
  document.querySelectorAll("[data-auth-gate-mode]").forEach(button => {
    button.classList.toggle("active", button.dataset.authGateMode === authGateMode);
  });
  const nameField = document.getElementById("authGateNameField");
  if (nameField) nameField.classList.toggle("hidden", authGateMode === "login");
  setText("authGateSubmitBtn", authGateMode === "login" ? "Sign in" : "Create account");
}

function shouldShowAuthGate() {
  return typeof isAuthenticated !== "function"
    || !isAuthenticated();
}

function renderAuthGate() {
  const gate = document.getElementById("authGate");
  if (!gate) return;
  const visible = shouldShowAuthGate();
  const onboardingModal = document.getElementById("onboardingModal");
  const onboardingOpen = Boolean(onboardingModal && !onboardingModal.classList.contains("hidden"));
  gate.hidden = !visible;
  document.body.classList.toggle("auth-required", visible);
  document.body.classList.toggle("auth-gate-open", visible || onboardingOpen);
}

function getAuthFormValues(source = "profile") {
  const prefix = source === "gate" ? "authGate" : "auth";
  const nameInput = document.getElementById(`${prefix}NameInput`);
  const emailInput = document.getElementById(`${prefix}EmailInput`);
  const passwordInput = document.getElementById(`${prefix}PasswordInput`);
  return {
    nameInput,
    emailInput,
    passwordInput,
    name: (nameInput?.value || document.getElementById("profileNameInput")?.value || profile.name || "").trim(),
    email: (emailInput?.value || "").trim(),
    password: passwordInput?.value || ""
  };
}

function setAuthButtonsDisabled(source, disabled) {
  const ids = source === "gate"
    ? ["authGateSubmitBtn", "authGateCreateTab", "authGateSignInTab"]
    : ["createAccountBtn", "signInBtn"];
  ids.forEach(id => {
    const button = document.getElementById(id);
    if (button) button.disabled = disabled;
  });
}

function setAuthMessage(source, message = "", type = "info") {
  const id = source === "gate" ? "authGateMessage" : "authProfileMessage";
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `auth-message ${message ? "" : "hidden"} ${type}`;
}

function setAuthSubmitLabel(source, mode, busy = false) {
  if (source === "gate") {
    setText("authGateSubmitBtn", busy
      ? (mode === "register" ? "Creating account..." : "Signing in...")
      : (mode === "register" ? "Create account" : "Sign in"));
    return;
  }

  setText("createAccountBtn", busy && mode === "register" ? "Creating..." : "Create account");
  setText("signInBtn", busy && mode === "login" ? "Signing in..." : "Sign in");
}

async function handleAuthSubmit(mode, source = "profile") {
  const { name, email, password, passwordInput } = getAuthFormValues(source);
  setAuthMessage(source, "");
  setAuthSubmitLabel(source, mode, true);
  setAuthButtonsDisabled(source, true);

  try {
    if (mode === "register") {
      await registerUser({ name, email, password });
      profile.name = name || profile.name;
      cacheProfile(profile);
      await apiSaveProfile(profile);
      showToast(t("toast.signedInSynced"), "success");
      showToast("Account created. Set your TOEFL goal next.", "success");
    } else {
      await loginUser({ email, password });
      const syncedProfile = await syncProfileFromBackend();
      if (syncedProfile) profile = syncedProfile;
      showToast(t("toast.signedIn"), "success");
    }
    if (passwordInput) passwordInput.value = "";
    setAuthMessage(source, mode === "register" ? "Account created. Preparing setup..." : "Signed in.", "success");
    renderAppShell();
    renderCurrentSection();
    renderAuthGate();
    if (mode === "register" || !profile.startDate) {
      startOnboardingFlow();
      renderSubscriptionGate();
    } else {
      navigateTo("dashboard", { bypassSubscription: true });
      renderSubscriptionGate();
    }
  } catch (err) {
    const message = err.message || "Sign in failed.";
    setAuthMessage(source, message, "error");
    showToast(message, "error");
    if (typeof setProfileSyncState === "function") setProfileSyncState("failed", "Sync failed");
  } finally {
    setAuthButtonsDisabled(source, false);
    setAuthSubmitLabel(source, mode, false);
    renderAccountSync();
  }
}

async function handleManualSync() {
  if (!isAuthenticated()) return;
  const btn = document.getElementById("syncNowBtn");
  btn.disabled = true;
  try {
    accountSyncState = { state: "saving", message: "Saving" };
    renderAccountSync();
    await apiSaveProfile(loadProfile());
    const syncedProfile = await syncProfileFromBackend();
    if (syncedProfile) profile = syncedProfile;
    showToast(t("toast.synced"), "success");
    renderAppShell();
    renderCurrentSection();
    renderSubscriptionGate();
  } catch (err) {
    console.warn("Manual sync failed:", err);
    showToast(t("toast.syncFailed"), "error");
    accountSyncState = { state: "failed", message: "Sync failed" };
  } finally {
    btn.disabled = false;
    renderAccountSync();
  }
}

function renderAccountSync() {
  const signedIn = typeof isAuthenticated === "function" && isAuthenticated();
  const status = document.getElementById("accountSyncStatus");

  if (!signedIn) {
    if (status) {
      status.textContent = t("account.localMode");
      status.className = "sync-status sync-status-local";
    }
    renderTopbarSyncStatus(false);
    return;
  }

  const user = getCurrentUser() || {};
  setText("accountName", user.name || profile.name || "Student");
  setText("accountEmail", user.email || "");
  setText("accountPlan", subscriptionStatusLabel());
  setAvatar("accountAvatar", user.name || profile.name);

  const statusCopy = getSyncStatusCopy(accountSyncState);
  if (status) {
    status.textContent = statusCopy.label;
    status.className = `sync-status ${statusCopy.className}`;
  }
  renderTopbarSyncStatus(true);
}

function getSyncStatusCopy(state) {
  if (state.state === "failed") return { label: t("account.syncFailed"), className: "sync-status-failed" };
  if (state.state === "saving" || state.state === "syncing") return { label: t("account.saving"), className: "sync-status-saving" };
  return { label: t("account.synced"), className: "sync-status-synced" };
}

function renderTopbarSyncStatus(signedIn) {
  const topbarStatus = document.getElementById("topbarSyncStatus");
  if (!topbarStatus) return;

  if (!signedIn) {
    topbarStatus.textContent = t("account.local");
    topbarStatus.className = "sync-topbar-status sync-topbar-local";
    topbarStatus.title = t("account.localTitle");
    return;
  }

  const state = accountSyncState.state;
  if (state === "failed") {
    topbarStatus.textContent = t("account.syncFailed");
    topbarStatus.className = "sync-topbar-status sync-topbar-failed";
    topbarStatus.title = t("account.failedTitle");
    return;
  }
  if (state === "saving" || state === "syncing") {
    topbarStatus.textContent = t("account.saving");
    topbarStatus.className = "sync-topbar-status sync-topbar-saving";
    topbarStatus.title = t("account.savingTitle");
    return;
  }

  topbarStatus.textContent = t("account.synced");
  topbarStatus.className = "sync-topbar-status sync-topbar-synced";
  topbarStatus.title = t("account.syncedTitle");
}

function renderProfileScreen() {
  profile = loadProfile();
  document.getElementById("profileNameInput").value = profile.name || "Alex Carter";
  setActiveBtn("targetScoreGroup", String(profile.targetScore || 95));
  setActiveBtn("prepDaysGroup", String(profile.preparationDays || 60));
  setActiveBtn("levelGroup", profile.level || "intermediate");
  setActiveBtn("goalGroup", profile.goal || "study abroad");
  renderAccountSync();
  updateSetupPreview();
}

function setupBtnGroup(groupId) {
  document.querySelectorAll(`#${groupId} .btn-option`).forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(`#${groupId} .btn-option`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      updateSetupPreview();
    });
  });
}

function getSelected(groupId) {
  const btn = document.querySelector(`#${groupId} .btn-option.selected`);
  return btn ? btn.dataset.val : null;
}

function setActiveBtn(groupId, val) {
  document.querySelectorAll(`#${groupId} .btn-option`).forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.val === val);
  });
}

function updateSetupPreview() {
  const current = calcPredictedScore(profile);
  const name = document.getElementById("profileNameInput")?.value.trim() || profile.name || "Alex Carter";
  setText("setupTarget", getSelected("targetScoreGroup") || profile.targetScore || 95);
  setText("setupCurrent", current);
  setText("setupDays", t("profile.daysLabel", { days: getSelected("prepDaysGroup") || profile.preparationDays || 60 }));
  setText("setupLevel", levelLabel(getSelected("levelGroup") || profile.level || "intermediate"));
  setText("setupGoal", goalLabel(getSelected("goalGroup") || profile.goal || "study abroad"));
  setText("profilePreviewName", name);
  setText("profilePreviewGoal", goalLabel(getSelected("goalGroup") || profile.goal || "study abroad"));
  setAvatar("profilePreviewAvatar", name);
}

function levelLabel(level) {
  return optionalT(`level.${level}`, titleCase(level));
}

function goalLabel(goal) {
  const key = String(goal || "").replace(/\s+(\w)/g, (_, char) => char.toUpperCase()).replace(/\s/g, "");
  return optionalT(`goal.${key}`, titleCase(goal));
}

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .map(part => part ? part[0].toUpperCase() + part.slice(1) : "")
    .join(" ");
}

// ─── LEARNING ────────────────────────────────────
function initLearning() {
  const search = document.getElementById("learnSearchInput");
  if (search) search.addEventListener("input", renderLearn);
  document.getElementById("learnLevelSelect")?.addEventListener("change", event => {
    learnLevelFilter = event.target.value || "all";
    renderLearn();
  });
  document.getElementById("learnTimeSelect")?.addEventListener("change", event => {
    learnTimeFilter = event.target.value || "all";
    renderLearn();
  });
  document.getElementById("noteSearchInput")?.addEventListener("input", event => {
    notebookSearchQuery = event.target.value.trim().toLowerCase();
    renderNotebook();
  });

  document.addEventListener("click", event => {
    const filterBtn = event.target.closest("[data-learn-filter]");
    if (filterBtn) {
      document.querySelectorAll("[data-learn-filter]").forEach(btn => btn.classList.remove("selected"));
      filterBtn.classList.add("selected");
      learnSkillFilter = filterBtn.dataset.learnFilter || "all";
      renderLearn();
      return;
    }

    const topicBtn = event.target.closest("[data-topic-query]");
    if (topicBtn) {
      const input = document.getElementById("learnSearchInput");
      if (input) input.value = topicBtn.dataset.topicQuery || "";
      renderLearn();
      return;
    }

    const noteFilterBtn = event.target.closest("[data-note-filter]");
    if (noteFilterBtn) {
      document.querySelectorAll("[data-note-filter]").forEach(btn => btn.classList.remove("selected"));
      noteFilterBtn.classList.add("selected");
      notebookTypeFilter = noteFilterBtn.dataset.noteFilter || "all";
      renderNotebook();
      return;
    }

    const lockedLessonBtn = event.target.closest("[data-locked-lesson]");
    if (lockedLessonBtn) {
      showToast(lockedLessonBtn.dataset.lockedReason || "Complete the previous week to unlock this lesson.", "info");
      return;
    }

    const repairLessonBtn = event.target.closest("[data-repair-lesson]");
    if (repairLessonBtn) {
      openLesson(repairLessonBtn.dataset.repairLesson, { force: true });
      return;
    }

    const moduleTestBtn = event.target.closest("[data-module-test]");
    if (moduleTestBtn) {
      startModuleMiniTest(moduleTestBtn.dataset.moduleTest);
      return;
    }

    const vocabReviewBtn = event.target.closest("[data-start-vocab-review]");
    if (vocabReviewBtn) {
      startVocabularyReviewQuiz();
      return;
    }

    const lessonBtn = event.target.closest("[data-lesson-id]");
    if (lessonBtn) {
      openLesson(lessonBtn.dataset.lessonId);
      return;
    }

    const completeBtn = event.target.closest("[data-complete-lesson]");
    if (completeBtn) {
      markLessonComplete(completeBtn.dataset.completeLesson);
      return;
    }

    const saveWordBtn = event.target.closest("[data-save-word]");
    if (saveWordBtn) {
      saveVocabularyWord(saveWordBtn.dataset.saveWord);
      return;
    }

    const masterWordBtn = event.target.closest("[data-master-word]");
    if (masterWordBtn) {
      markVocabularyMastered(masterWordBtn.dataset.masterWord);
      return;
    }

    const saveLessonNoteBtn = event.target.closest("[data-save-lesson-note]");
    if (saveLessonNoteBtn) {
      saveLessonChecklistToNotes(saveLessonNoteBtn.dataset.saveLessonNote);
      return;
    }

    const saveMistakeNoteBtn = event.target.closest("[data-save-mistake-note]");
    if (saveMistakeNoteBtn) {
      saveMistakeToNotes(saveMistakeNoteBtn.dataset.saveMistakeNote);
      return;
    }

    const deleteNoteBtn = event.target.closest("[data-delete-note]");
    if (deleteNoteBtn) {
      deleteNotebookNote(deleteNoteBtn.dataset.deleteNote);
    }
  });

  document.getElementById("addNoteBtn")?.addEventListener("click", addNotebookNoteFromForm);
  document.getElementById("notebookToggle")?.addEventListener("click", () => {
    const panel = document.getElementById("notebookPanel");
    setNotebookOpen(panel?.classList.contains("hidden"));
  });
  document.getElementById("notebookClose")?.addEventListener("click", () => setNotebookOpen(false));
}

function renderLearn() {
  profile = loadProfile();
  ensureLearningState(profile);
  renderStudyPath();
  renderMistakeLessons();
  renderModules();
  renderTopicQuickFilters();
  renderLessonLibrary();
  renderVocabularySystem();
  renderNotebook();
}

function ensureLearningState(currentProfile) {
  currentProfile.learningProgress = currentProfile.learningProgress || {};
  currentProfile.learningProgress.completedLessons = currentProfile.learningProgress.completedLessons || [];
  currentProfile.learningProgress.savedLessons = currentProfile.learningProgress.savedLessons || [];
  currentProfile.learningProgress.currentLessonId = currentProfile.learningProgress.currentLessonId || "toefl-structure";
  currentProfile.vocabularyProgress = currentProfile.vocabularyProgress || {};
  currentProfile.vocabularyProgress.savedWords = currentProfile.vocabularyProgress.savedWords || [];
  currentProfile.vocabularyProgress.masteredWords = currentProfile.vocabularyProgress.masteredWords || [];
  currentProfile.vocabularyProgress.missedWords = currentProfile.vocabularyProgress.missedWords || [];
  currentProfile.vocabularyProgress.reviews = currentProfile.vocabularyProgress.reviews || [];
  currentProfile.vocabularyProgress.savedWords = Array.from(new Set(currentProfile.vocabularyProgress.savedWords));
  currentProfile.vocabularyProgress.masteredWords = Array.from(new Set(currentProfile.vocabularyProgress.masteredWords));
  currentProfile.vocabularyProgress.missedWords = Array.from(new Set(currentProfile.vocabularyProgress.missedWords));
  currentProfile.notes = currentProfile.notes || [];
  return currentProfile;
}

function learningCompletionPct(lessonIds = LEARNING_LESSONS.map(lesson => lesson.id)) {
  const completed = new Set((profile.learningProgress?.completedLessons) || []);
  const count = lessonIds.filter(id => completed.has(id)).length;
  return lessonIds.length ? Math.round((count / lessonIds.length) * 100) : 0;
}

function getLessonWeek(lessonId) {
  return STUDY_PATH_WEEKS.find(week => week.lessonIds.includes(lessonId)) || STUDY_PATH_WEEKS[0];
}

function isStudyWeekUnlocked(week) {
  const completed = new Set(profile.learningProgress?.completedLessons || []);
  if (week.week === 1) return true;
  return STUDY_PATH_WEEKS
    .slice(0, week.week - 1)
    .every(item => item.lessonIds.some(id => completed.has(id)));
}

function isLessonUnlocked(lessonId) {
  const week = getLessonWeek(lessonId);
  return isStudyWeekUnlocked(week);
}

function getLessonLockReason(lessonId) {
  const week = getLessonWeek(lessonId);
  if (!week || week.week <= 1) return "";
  return `Complete one lesson in Week ${week.week - 1} to unlock Week ${week.week}.`;
}

function renderStudyPath() {
  const container = document.getElementById("studyPathList");
  if (!container) return;
  const completed = new Set(profile.learningProgress.completedLessons);
  setText("learnPathProgress", `${learningCompletionPct()}%`);

  container.innerHTML = STUDY_PATH_WEEKS.map(week => {
    const pct = learningCompletionPct(week.lessonIds);
    const unlocked = isStudyWeekUnlocked(week);
    const nextLesson = week.lessonIds.find(id => !completed.has(id)) || week.lessonIds[0];
    const lockReason = unlocked ? "" : `Complete one lesson in Week ${week.week - 1} first.`;
    return `
      <div class="study-path-item ${unlocked ? "unlocked" : "locked"}">
        <div class="path-week-meta">
          <span>Week ${week.week} · ${unlocked ? "Unlocked" : "Locked"}</span>
          <strong>${escapeHtml(week.title)}</strong>
        </div>
        <p>${escapeHtml(week.focus)}</p>
        <div class="path-progress"><span class="w-${pct}"></span></div>
        <button class="btn-secondary btn-compact" ${unlocked ? `data-lesson-id="${escapeHtml(nextLesson)}"` : `data-locked-lesson="${escapeHtml(nextLesson)}" data-locked-reason="${escapeHtml(lockReason)}" disabled`}>
          ${unlocked ? "Open lesson" : "Locked"}
        </button>
        ${unlocked ? "" : `<small class="path-lock-note">${escapeHtml(lockReason)}</small>`}
      </div>`;
  }).join("");
}

function renderMistakeLessons() {
  const container = document.getElementById("mistakeLessonList");
  if (!container) return;
  const lessons = getRecommendedMistakeLessons(profile);
  container.innerHTML = lessons.length
    ? lessons.map(({ lesson, reason }) => `
        <button class="mistake-lesson-row" data-lesson-id="${escapeHtml(lesson.id)}">
          <span class="lesson-skill ${escapeHtml(lesson.skill)}">${escapeHtml(titleCase(lesson.skill))}</span>
          <strong>${escapeHtml(lesson.title)}</strong>
          <small>${escapeHtml(reason)}</small>
        </button>`).join("")
    : `<p class="placeholder-text">Complete practice tasks to unlock mistake-based micro-lessons.</p>`;
}

function getRecommendedMistakeLessons(currentProfile) {
  const bank = currentProfile.mistakeBank || [];
  const weak = calcWeaknessScores(currentProfile).filter(item => item.total > 0);
  const matches = new Map();

  for (const mistake of bank) {
    const haystack = `${mistake.topic || ""} ${mistake.skill || ""} ${mistake.prompt || ""}`.toLowerCase();
    const lesson = LEARNING_LESSONS.find(item =>
      item.repairTopics?.some(topic => haystack.includes(String(topic).toLowerCase()))
    ) || LEARNING_LESSONS.find(item => item.skill === mistake.skill);
    if (lesson) matches.set(lesson.id, { lesson, reason: `Based on ${mistake.topic || mistake.skill} mistakes` });
  }

  for (const item of weak.slice(0, 2)) {
    const lesson = LEARNING_LESSONS.find(entry => entry.skill === item.skill);
    if (lesson && !matches.has(lesson.id)) {
      matches.set(lesson.id, { lesson, reason: `${item.mistakes}/${item.total} missed in ${SKILL_META[item.skill]?.label || item.skill}` });
    }
  }

  return Array.from(matches.values()).slice(0, 3);
}

function getRepairLessonForQuestion(question, skill) {
  const haystack = `${question?.topic || ""} ${question?.question || ""} ${question?.prompt || ""} ${question?.lectureTitle || ""} ${skill || ""}`.toLowerCase();
  return LEARNING_LESSONS.find(lesson =>
    lesson.repairTopics?.some(topic => haystack.includes(String(topic).toLowerCase()))
  ) || LEARNING_LESSONS.find(lesson => lesson.skill === skill);
}

function renderRepairLessonPrompt(question, skill) {
  const lesson = getRepairLessonForQuestion(question, skill);
  if (!lesson) return "";
  return `
    <div class="repair-prompt">
      <span>Repair lesson</span>
      <strong>${escapeHtml(lesson.title)}</strong>
      <button class="btn-secondary btn-compact" data-repair-lesson="${escapeHtml(lesson.id)}">Start repair lesson</button>
    </div>`;
}

function renderModules() {
  const container = document.getElementById("moduleGrid");
  if (!container) return;
  container.innerHTML = LEARNING_MODULES.map(module => {
    const pct = learningCompletionPct(module.lessonIds);
    const nextLesson = module.lessonIds.find(id => !profile.learningProgress.completedLessons.includes(id)) || module.lessonIds[0];
    const unlocked = isLessonUnlocked(nextLesson);
    return `
      <div class="module-card">
        <div class="module-card-head">
          <span class="lesson-skill ${escapeHtml(module.skill)}">${escapeHtml(titleCase(module.skill))}</span>
          <span>${pct}%</span>
        </div>
        <strong>${escapeHtml(module.title)}</strong>
        <p>${escapeHtml(module.description)}</p>
        <div class="path-progress"><span class="w-${pct}"></span></div>
        <div class="module-actions">
          <button class="btn-secondary btn-full" ${unlocked ? `data-lesson-id="${escapeHtml(nextLesson)}"` : `data-locked-lesson="${escapeHtml(nextLesson)}" disabled`}>${unlocked ? "Continue module" : "Locked"}</button>
          <button class="btn-secondary btn-full" data-module-test="${escapeHtml(module.id)}">Module mini-test</button>
        </div>
      </div>`;
  }).join("");
}

function buildLearnSearchGroups(query) {
  return String(query || "")
    .toLowerCase()
    .split(/[;,]+/)
    .map(group => group.trim().split(/\s+/).filter(Boolean))
    .filter(group => group.length);
}

function buildLessonSearchText(lesson) {
  const sectionText = (lesson.sections || [])
    .map(section => [
      section.title,
      section.body,
      ...(section.bullets || [])
    ].filter(Boolean).join(" "))
    .join(" ");
  const exampleText = lesson.example
    ? [lesson.example.prompt, lesson.example.answer, lesson.example.why].filter(Boolean).join(" ")
    : "";
  return [
    lesson.title,
    lesson.summary,
    lesson.skill,
    lesson.level,
    lesson.minutes,
    ...(lesson.tags || []),
    ...(lesson.repairTopics || []),
    sectionText,
    exampleText
  ].filter(Boolean).join(" ").toLowerCase();
}

function lessonMatchesLearnSearch(lesson, searchGroups) {
  if (!searchGroups.length) return true;
  const haystack = buildLessonSearchText(lesson);
  return searchGroups.some(group => group.every(term => haystack.includes(term)));
}

function renderLessonLibrary() {
  const container = document.getElementById("lessonGrid");
  if (!container) return;
  const query = (document.getElementById("learnSearchInput")?.value || "").trim().toLowerCase();
  const searchGroups = buildLearnSearchGroups(query);
  const completed = new Set(profile.learningProgress.completedLessons);
  const lessons = LEARNING_LESSONS.filter(lesson => {
    const matchesSkill = learnSkillFilter === "all" || lesson.skill === learnSkillFilter;
    const matchesLevel = learnLevelFilter === "all" || lesson.level === learnLevelFilter;
    const matchesTime = learnTimeFilter === "all"
      || (learnTimeFilter === "short" && lesson.minutes < 5)
      || (learnTimeFilter === "medium" && lesson.minutes >= 5 && lesson.minutes <= 6);
    return matchesSkill && matchesLevel && matchesTime && lessonMatchesLearnSearch(lesson, searchGroups);
  });

  setText("lessonCountBadge", `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`);
  container.innerHTML = lessons.length
    ? lessons.map(lesson => {
        const unlocked = isLessonUnlocked(lesson.id);
        const lockReason = getLessonLockReason(lesson.id);
        return `
        <button class="lesson-card ${unlocked ? "" : "locked"}" ${unlocked ? `data-lesson-id="${escapeHtml(lesson.id)}"` : `data-locked-lesson="${escapeHtml(lesson.id)}" data-locked-reason="${escapeHtml(lockReason)}"`}>
          <span class="lesson-card-top">
            <span class="lesson-skill ${escapeHtml(lesson.skill)}">${escapeHtml(titleCase(lesson.skill))}</span>
            <span>${lesson.minutes} min · ${escapeHtml(lesson.level)}</span>
          </span>
          <strong>${escapeHtml(lesson.title)}</strong>
          <span>${escapeHtml(lesson.summary)}</span>
          <span class="lesson-tags">${lesson.tags.slice(0, 3).map(tag => `<small>${escapeHtml(tag)}</small>`).join("")}</span>
          ${completed.has(lesson.id) ? `<em>Completed</em>` : ""}
          ${unlocked ? "" : `<em class="locked-note">Locked</em>`}
        </button>`;
      }).join("")
    : `<p class="placeholder-text">No lessons match this search. Try a skill or TOEFL topic.</p>`;
}

function renderTopicQuickFilters() {
  const container = document.getElementById("topicQuickFilters");
  if (!container) return;
  const topics = [
    "inference",
    "lecture notes",
    "academic discussion",
    "template",
    "time management",
    "vocabulary"
  ];
  container.innerHTML = topics.map(topic => `
    <button class="topic-chip" data-topic-query="${escapeHtml(topic)}">${escapeHtml(titleCase(topic))}</button>
  `).join("");
}

function renderVocabularySystem() {
  const container = document.getElementById("vocabCardList");
  if (!container) return;
  const saved = new Set(profile.vocabularyProgress.savedWords);
  const mastered = new Set(profile.vocabularyProgress.masteredWords);
  const missed = new Set(profile.vocabularyProgress.missedWords);
  const dueWords = getDueVocabularyWords();
  const reviewWords = profile.vocabularyProgress.missedWords
    .map(getVocabularyWordCard)
    .filter(word => word && !mastered.has(word.id));

  const reviewHtml = dueWords.length
    ? dueWords.map(word => renderVocabularyWordCard(word, saved, mastered, missed)).join("")
    : `<p class="placeholder-text">No words due today. Missed or saved words will appear here for review.</p>`;

  container.innerHTML = `
    <div class="vocab-system-summary">
      <div><strong>${saved.size}</strong><span>saved</span></div>
      <div><strong>${mastered.size}</strong><span>mastered</span></div>
      <div><strong>${dueWords.length}</strong><span>due today</span></div>
    </div>
    <div class="vocab-review-block">
      <div class="vocab-review-head">
        <div>
          <div class="card-kicker">Due today</div>
          <strong>Vocabulary review</strong>
        </div>
        <button class="btn-secondary btn-compact" data-start-vocab-review ${dueWords.length ? "" : "disabled"}>Review quiz</button>
      </div>
      <div class="vocab-review-list">${reviewHtml}</div>
    </div>
    ${TOEFL_WORD_CARDS.map(word => renderVocabularyWordCard(word, saved, mastered, missed)).join("")}`;
}

function getLatestVocabularyReview(wordId) {
  const reviews = profile.vocabularyProgress?.reviews || [];
  return reviews.slice().reverse().find(review => review.wordId === wordId);
}

function getDueVocabularyWords() {
  const mastered = new Set(profile.vocabularyProgress.masteredWords);
  const candidates = Array.from(new Set([
    ...profile.vocabularyProgress.missedWords,
    ...profile.vocabularyProgress.savedWords
  ])).filter(wordId => !mastered.has(wordId));
  const today = new Date().toISOString().slice(0, 10);
  return candidates
    .filter(wordId => {
      const latest = getLatestVocabularyReview(wordId);
      if (!latest) return true;
      const lastDate = String(latest.date || "").slice(0, 10);
      return latest.action === "missed" || lastDate < today;
    })
    .map(getVocabularyWordCard)
    .filter(Boolean)
    .slice(0, 6);
}

function getVocabularyWordCard(wordId) {
  const normalized = String(wordId || "").toLowerCase();
  return TOEFL_WORD_CARDS.find(word => word.id === normalized) || {
    id: normalized,
    word: normalized.replace(/-/g, " "),
    definition: "Review this word from a missed practice question.",
    example: "Save an example sentence after you review the correct answer.",
    skill: "vocabulary"
  };
}

function renderVocabularyWordCard(word, saved, mastered, missed) {
  return `
    <div class="vocab-word-card">
      <div>
        <strong>${escapeHtml(word.word)}${missed.has(word.id) ? ` <em>Missed</em>` : ""}</strong>
        <span>${escapeHtml(word.definition)}</span>
        <small>${escapeHtml(word.example)}</small>
      </div>
      <div class="vocab-actions">
        <button class="btn-secondary btn-compact" data-save-word="${escapeHtml(word.id)}">${saved.has(word.id) ? "Saved" : "Save"}</button>
        <button class="btn-secondary btn-compact" data-master-word="${escapeHtml(word.id)}">${mastered.has(word.id) ? "Mastered" : "Mark mastered"}</button>
      </div>
    </div>`;
}

function renderNotebook() {
  const container = document.getElementById("notebookList");
  if (!container) return;
  const query = notebookSearchQuery || (document.getElementById("noteSearchInput")?.value || "").trim().toLowerCase();
  const notes = (profile.notes || [])
    .filter(note => notebookTypeFilter === "all" || note.type === notebookTypeFilter)
    .filter(note => {
      const haystack = `${note.title || ""} ${note.content || ""} ${note.source || ""} ${note.type || ""}`.toLowerCase();
      return !query || haystack.includes(query);
    })
    .slice()
    .reverse();
  container.innerHTML = notes.length
    ? notes.map(note => `
        <div class="notebook-item">
          <div>
            <span class="lesson-skill strategy">${escapeHtml(note.type || "note")}</span>
            <strong>${escapeHtml(note.title)}</strong>
            <p>${escapeHtml(note.content)}</p>
          </div>
          <button class="btn-secondary btn-compact" data-delete-note="${escapeHtml(note.id)}">Delete</button>
        </div>`).join("")
    : `<p class="placeholder-text">No notes match this filter. Save useful phrases, personal rules, templates, or AI advice here.</p>`;
}

function openLesson(lessonId, options = {}) {
  ensureLearningState(profile);
  if (!options.force && !isLessonUnlocked(lessonId)) {
    showToast(getLessonLockReason(lessonId) || "This lesson is locked for now.", "info");
    renderLearn();
    return;
  }
  profile.learningProgress.currentLessonId = lessonId;
  saveProfile(profile);
  navigateTo("lesson");
}

function renderLessonPage() {
  profile = loadProfile();
  ensureLearningState(profile);
  const lesson = getLessonById(profile.learningProgress.currentLessonId);
  const module = getModuleById(lesson.moduleId);
  const completed = profile.learningProgress.completedLessons.includes(lesson.id);
  const workspace = document.getElementById("lessonWorkspace");
  if (!workspace) return;

  workspace.innerHTML = `
    <div class="lesson-shell">
      <aside class="lesson-steps card">
        <button class="btn-secondary btn-full" data-section="learn">Back to Learn</button>
        <div class="card-kicker">Lesson steps</div>
        <h2 class="card-title">${escapeHtml(module.title)}</h2>
        ${lesson.steps.map((step, index) => `
          <div class="lesson-step-item">
            <span>${index + 1}</span>
            <strong>${escapeHtml(step.title)}</strong>
          </div>`).join("")}
      </aside>

      <article class="lesson-main card">
        <div class="lesson-hero-line">
          <span class="lesson-skill ${escapeHtml(lesson.skill)}">${escapeHtml(titleCase(lesson.skill))}</span>
          <span>${lesson.minutes} min</span>
          <span>${escapeHtml(titleCase(lesson.level))}</span>
        </div>
        <h2>${escapeHtml(lesson.title)}</h2>
        <p>${escapeHtml(lesson.summary)}</p>
        ${lesson.steps.map(step => `
          <section class="lesson-theory-block">
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.body)}</p>
            <ul>${step.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </section>`).join("")}
        <section class="lesson-example-block">
          <div class="card-kicker">Example</div>
          <strong>${escapeHtml(lesson.example.prompt)}</strong>
          <p>${escapeHtml(lesson.example.answer)}</p>
          <small>${escapeHtml(lesson.example.why)}</small>
        </section>
        <div class="lesson-bottom-actions">
          <button class="btn-primary" data-section="${escapeHtml(lesson.practiceSkill)}">Practice this skill</button>
          <button class="btn-secondary" data-module-test="${escapeHtml(module.id)}">Run module mini-test</button>
          <button class="btn-secondary" data-complete-lesson="${escapeHtml(lesson.id)}">${completed ? "Completed" : "Mark complete"}</button>
        </div>
      </article>

      <aside class="lesson-checklist card">
        <div class="card-kicker">Key rules</div>
        <h2 class="card-title">Checklist</h2>
        <div class="checklist-list">
          ${lesson.checklist.map(item => `<div><span></span><strong>${escapeHtml(item)}</strong></div>`).join("")}
        </div>
        <button class="btn-secondary btn-full" data-save-lesson-note="${escapeHtml(lesson.id)}">Save checklist to notes</button>
      </aside>
    </div>`;
}

function markLessonComplete(lessonId) {
  ensureLearningState(profile);
  if (!profile.learningProgress.completedLessons.includes(lessonId)) {
    profile.learningProgress.completedLessons.push(lessonId);
  }
  saveProfile(profile);
  renderLessonPage();
  renderAppShell();
  showToast("Lesson marked complete.", "success");
}

function saveVocabularyWord(wordId) {
  ensureLearningState(profile);
  if (!profile.vocabularyProgress.savedWords.includes(wordId)) {
    profile.vocabularyProgress.savedWords.push(wordId);
  }
  profile.vocabularyProgress.reviews.push({ wordId, action: "saved", date: new Date().toISOString() });
  saveProfile(profile);
  renderVocabularySystem();
  showToast("Word saved.", "success");
}

function markVocabularyMastered(wordId) {
  ensureLearningState(profile);
  if (!profile.vocabularyProgress.savedWords.includes(wordId)) {
    profile.vocabularyProgress.savedWords.push(wordId);
  }
  if (!profile.vocabularyProgress.masteredWords.includes(wordId)) {
    profile.vocabularyProgress.masteredWords.push(wordId);
  }
  profile.vocabularyProgress.missedWords = profile.vocabularyProgress.missedWords.filter(id => id !== wordId);
  profile.vocabularyProgress.reviews.push({ wordId, action: "mastered", date: new Date().toISOString() });
  saveProfile(profile);
  renderVocabularySystem();
  showToast("Word marked mastered.", "success");
}

function buildVocabularyReviewQuestions(words) {
  return words.map(word => {
    const distractors = TOEFL_WORD_CARDS
      .filter(item => item.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(item => item.definition);
    return {
      id: `review-${word.id}`,
      type: "vocabulary",
      skill: "Vocabulary",
      question: `Choose the correct meaning of "${word.word}"`,
      options: [word.definition, ...distractors].sort(() => Math.random() - 0.5),
      correctAnswer: word.definition,
      topic: "Vocabulary review",
      difficulty: "medium"
    };
  });
}

function startVocabularyReviewQuiz() {
  profile = loadProfile();
  ensureLearningState(profile);
  const dueWords = getDueVocabularyWords();
  if (!dueWords.length) {
    showToast("No vocabulary words are due today.", "info");
    return;
  }
  practiceState.vocabulary.questions = buildVocabularyReviewQuestions(dueWords);
  practiceState.vocabulary.idx = 0;
  practiceState.vocabulary.answered = false;
  navigateTo("vocabulary");
  showToast("Vocabulary review quiz started.", "success");
}

function addNotebookNoteFromForm() {
  const title = document.getElementById("noteTitleInput")?.value.trim();
  const content = document.getElementById("noteContentInput")?.value.trim();
  const type = document.getElementById("noteTypeInput")?.value || "personal";
  if (!title || !content) {
    showToast("Add a title and note content.", "error");
    return;
  }
  addNotebookNote({ type, title, content, source: "Notebook" });
  document.getElementById("noteTitleInput").value = "";
  document.getElementById("noteContentInput").value = "";
  renderNotebook();
}

function saveLessonChecklistToNotes(lessonId) {
  const lesson = getLessonById(lessonId);
  addNotebookNote({
    type: "lesson",
    title: `${lesson.title} checklist`,
    content: lesson.checklist.join("; "),
    source: lesson.title
  });
  renderLessonPage();
}

function saveMistakeToNotes(mistakeId) {
  profile = loadProfile();
  ensureLearningState(profile);
  const mistake = (profile.mistakeBank || []).find(item => item.id === mistakeId);
  if (!mistake) {
    showToast("Mistake not found.", "error");
    return;
  }

  addNotebookNote({
    type: "mistake",
    title: `${SKILL_META[mistake.skill]?.label || titleCase(mistake.skill)}: ${mistake.topic}`,
    content: `${mistake.prompt}${mistake.correctAnswer ? ` Correct answer: ${mistake.correctAnswer}.` : ""}`,
    source: "Mistake bank"
  });
  renderCurrentSection();
}

function addNotebookNote(note) {
  ensureLearningState(profile);
  profile.notes.push({
    id: `note-${Date.now()}-${profile.notes.length}`,
    type: note.type || "note",
    title: note.title,
    content: note.content,
    source: note.source || "Manual",
    createdAt: new Date().toISOString()
  });
  profile.notes = profile.notes.slice(-120);
  saveProfile(profile);
  showToast("Saved to notebook.", "success");
}

function deleteNotebookNote(noteId) {
  ensureLearningState(profile);
  profile.notes = profile.notes.filter(note => note.id !== noteId);
  saveProfile(profile);
  renderNotebook();
  showToast("Note deleted.", "info");
}

// ─── PRACTICE SECTIONS ───────────────────────────

const SECTION_CONTENT_ID = {
  vocabulary: "vocabContent",
  reading:    "readContent",
  listening:  "listenContent",
  speaking:   "speakContent",
  writing:    "writeContent"
};

const SECTION_STAT_IDS = {
  vocabulary: { progress: "vocabProgress", mistakes: "vocabMistakes" },
  reading:    { progress: "readProgress",  mistakes: "readMistakes"  },
  listening:  { progress: "listenProgress",mistakes: "listenMistakes"},
  speaking:   { progress: "speakProgress", mistakes: "speakMistakes" },
  writing:    { progress: "writeProgress", mistakes: "writeMistakes" }
};

function initPracticeSection(skill) {
  practiceState[skill].questions = [...QUESTIONS[skill]];
}

function renderQuestion(skill) {
  const state   = practiceState[skill];
  const content = document.getElementById(SECTION_CONTENT_ID[skill]);

  // Update stat badges
  const stats = SECTION_STAT_IDS[skill];
  const total = state.questions.length;
  document.getElementById(stats.progress).textContent = `${state.idx + 1} / ${total}`;
  document.getElementById(stats.mistakes).textContent = `Mistakes: ${profile.mistakes[skill] || 0}`;

  if (state.idx >= total) {
    renderSectionDone(skill, content);
    return;
  }

  const q = state.questions[state.idx];
  state.answered = false;

  if (skill === "reading")    { renderReadingQ(q, content, skill); return; }
  if (skill === "listening")  { renderListeningQ(q, content, skill); return; }
  if (skill === "speaking")   { renderSpeakingQ(q, content, skill); return; }

  // Vocabulary and Writing standard MCQ
  renderMCQ(q, content, skill);
}

// Standard MCQ (vocabulary, writing)
function renderMCQ(q, container, skill) {
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="question-text">${q.question.replace(/\n/g,"<br>")}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div class="feedback-slot" id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">${SKILL_META[skill].label} · Q${practiceState[skill].idx + 1} of ${practiceState[skill].questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  attachOptionHandlers(container, q, skill, false);
}

// Reading
function renderReadingQ(q, container, skill) {
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-box">
      <div class="passage-label">Reading Passage</div>
      ${q.passage}
    </div>
    <div class="question-text">${q.question}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Reading · Q${practiceState[skill].idx + 1} of ${practiceState[skill].questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  attachOptionHandlers(container, q, skill, false);
}

// Listening
function renderListeningQ(q, container, skill) {
  const state   = practiceState[skill];
  const letters = ["A","B","C","D"];

  container.innerHTML = `
    <div class="passage-box passage-box-compact">
      <div class="passage-label">${q.lectureTitle}</div>
      <div class="lecture-text hidden" id="lectureText">${q.lectureText}</div>
    </div>
    <div class="lecture-player">
      <div class="lecture-player-actions">
        <button class="play-btn ${state.played ? "played" : ""}" id="playBtn">
          ${state.played ? "Replay Lecture" : "Play Lecture"}
        </button>
        <button class="btn-secondary audio-control-btn" id="restartBtn" ${state.played ? "" : "disabled"}>Restart</button>
        <button class="btn-secondary audio-control-btn" id="transcriptBtn">Show transcript</button>
      </div>
      <div class="audio-progress-track" aria-hidden="true">
        <span class="audio-progress-fill" id="audioProgress" style="width: 0%"></span>
      </div>
    </div>
    <div class="question-text">${q.question}</div>
    <ul class="options-list" id="optionsList">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}" ${state.played ? "" : "disabled"}>
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Listening · Q${state.idx + 1} of ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelector("#playBtn").addEventListener("click", function() {
    playLectureAudio({
      id: `practice-listening-${q.id}`,
      text: buildLectureSpeechText(q),
      button: this,
      progress: container.querySelector("#audioProgress"),
      onReady: () => {
        state.played = true;
        markLectureReady(container);
      }
    });
  });

  container.querySelector("#restartBtn").addEventListener("click", function() {
    const playButton = container.querySelector("#playBtn");
    stopListeningSpeech();
    playLectureAudio({
      id: `practice-listening-${q.id}`,
      text: buildLectureSpeechText(q),
      button: playButton,
      progress: container.querySelector("#audioProgress"),
      onReady: () => {
        state.played = true;
        markLectureReady(container);
      }
    });
  });

  container.querySelector("#transcriptBtn").addEventListener("click", function() {
    const transcript = container.querySelector("#lectureText");
    setLectureTranscriptVisible(container, transcript.classList.contains("hidden"));
  });

  attachOptionHandlers(container, q, skill, false);
}

// Speaking
function renderSpeakingQ(q, container, skill) {
  const state = practiceState[skill];
  container.innerHTML = `
    <div class="passage-label">${q.taskType}</div>
    <div class="speaking-prompt">${q.prompt}</div>
    <div class="speaking-tip">💡 Aim for ~60 seconds of speech. Include: position, reason, example, and a conclusion.</div>
    <textarea class="answer-textarea" id="speakAnswer" placeholder="Type your spoken response here..."></textarea>
    <div class="button-row button-row-spaced">
      <button class="btn-primary" id="submitSpeakBtn">Submit Answer</button>
      <button class="btn-secondary" id="skipSpeakBtn">Skip</button>
    </div>
    <div id="speakFeedback"></div>
    <div class="question-nav">
      <span class="q-counter">Speaking · Q${state.idx + 1} of ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelector("#submitSpeakBtn").addEventListener("click", async () => {
    const answer = container.querySelector("#speakAnswer").value.trim();
    if (answer.length < 10) {
      showToast("Please write a longer response.", "error");
      return;
    }
    evaluateSpeaking(answer, q, container, skill);
  });

  container.querySelector("#skipSpeakBtn").addEventListener("click", () => {
    profile = recordAnswer(profile, skill, false, q);
    advanceQuestion(skill);
  });

  container.querySelector("#nextBtn")?.addEventListener("click", () => {
    state.played = false;
    advanceQuestion(skill);
  });
}

// ─── Evaluate speaking locally ───────────────────
async function evaluateSpeaking(answer, q, container, skill) {
  const btn = container.querySelector("#submitSpeakBtn");
  btn.disabled = true;
  btn.textContent = "Evaluating...";

  const lower = answer.toLowerCase();
  const criteria = {
    position:     /\b(i (agree|disagree)|i think|in my opinion|i believe|i prefer)\b/.test(lower),
    reason:       /\b(because|since|as|therefore|the reason)\b/.test(lower),
    example:      /\b(for example|for instance|such as|like|specifically)\b/.test(lower),
    length:       answer.split(/\s+/).length >= 40,
    linking_words:/\b(however|furthermore|in addition|moreover|on the other hand|firstly|secondly|finally|as a result)\b/.test(lower)
  };

  const passed   = Object.values(criteria).filter(Boolean).length;
  const total    = Object.keys(criteria).length;
  const isGood   = passed >= 3;

  let feedbackHtml = `
    <div class="criteria-list">
      ${Object.entries(criteria).map(([k, v]) => `
        <span class="criteria-tag ${v ? "pass" : "fail"}">
          ${v ? "✓" : "✗"} ${k.replace("_"," ")}
        </span>`).join("")}
    </div>
    <div class="feedback-box ${isGood ? "correct" : "wrong"} feedback-box-tight">`;

  // Try AI feedback
  try {
    const aiFeedback = await fetchAnswerFeedback("Speaking", answer, q.taskType);
    feedbackHtml += renderCoachFeedback(aiFeedback);
  } catch {
    if (isGood) {
      feedbackHtml += `Good response. You covered ${passed}/${total} criteria. ${passed < total ? "Try to also include: " + Object.entries(criteria).filter(([,v]) => !v).map(([k]) => k.replace("_"," ")).join(", ") + "." : ""}`;
    } else {
      const missing = Object.entries(criteria).filter(([,v]) => !v).map(([k]) => k.replace("_"," "));
      feedbackHtml += `Your response needs improvement. Missing: ${missing.join(", ")}. Aim for a clear position, at least one reason, and a specific example.`;
    }
  }

  feedbackHtml += `</div>`;
  container.querySelector("#speakFeedback").innerHTML = feedbackHtml;
  container.querySelector("#nextBtn").classList.remove("hidden");

  profile = recordAnswer(profile, skill, isGood, q);
  btn.disabled = false;
  btn.textContent = "Submit Answer";
}

function renderCoachFeedback(rawFeedback) {
  const parsed = parseJsonFromAI(rawFeedback);
  if (parsed) {
    return `
      <strong>Good:</strong> ${escapeHtml(parsed.good || "You answered the task.")}<br>
      <strong>Improve:</strong> ${escapeHtml(parsed.improve || "Add clearer support and transitions.")}<br>
      <strong>Score:</strong> ${escapeHtml(parsed.score || "Developing")}
      ${parsed.idealAnswer ? `<br><strong>Better version:</strong> ${escapeHtml(parsed.idealAnswer)}` : ""}`;
  }
  return cleanAIText(rawFeedback).split("\n").map(escapeHtml).join("<br>");
}

function getAnswerExplanation(question, skill, correct) {
  const explicit = question?.explanation || question?.why || question?.rationale;
  if (explicit) return explicit;
  if (correct) return t("feedback.correctExplain");

  const normalizedSkill = String(skill || question?.skill || "").toLowerCase();
  if (normalizedSkill === "vocabulary") return t("feedback.vocabularyExplain");
  if (normalizedSkill === "reading") return t("feedback.readingExplain");
  if (normalizedSkill === "listening") return t("feedback.listeningExplain");
  if (normalizedSkill === "writing") return t("feedback.writingExplain");
  return t("feedback.defaultExplain");
}

function renderAnswerFeedback(question, skill, correct) {
  const title = correct ? t("feedback.correct") : t("feedback.incorrect");
  const explanation = getAnswerExplanation(question, skill, correct);
  return `
    <div class="feedback-box ${correct ? "correct" : "wrong"}">
      <strong class="feedback-title">${escapeHtml(title)}</strong>
      <span class="feedback-explanation">${escapeHtml(explanation)}</span>
    </div>`;
}

// ─── Option handler (MCQ) ─────────────────────────
function attachOptionHandlers(container, q, skill, isMiniTest) {
  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (practiceState[skill]?.answered && !isMiniTest) return;

      const chosen  = btn.dataset.val;
      const correct = chosen === q.correctAnswer;

      if (!isMiniTest) {
        practiceState[skill].answered = true;
        profile = recordAnswer(profile, skill, correct, q);
        updateStatBadges(skill);
      }

      // Highlight all buttons
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });

      // Feedback
      const fb = container.querySelector("#feedback");
      if (fb) {
        fb.innerHTML = `${renderAnswerFeedback(q, skill, correct)}
        ${correct ? "" : renderRepairLessonPrompt(q, skill)}`;
      }

      // Show Next button
      const nextBtn = container.querySelector("#nextBtn");
      if (nextBtn) nextBtn.classList.remove("hidden");

      if (isMiniTest) return; // mini test handles its own next

      nextBtn.addEventListener("click", () => {
        if (skill === "listening") practiceState[skill].played = false;
        advanceQuestion(skill);
      }, { once: true });
    });
  });
}

function advanceQuestion(skill) {
  if (skill === "listening") stopListeningSpeech();
  const state = practiceState[skill];
  state.idx++;
  state.answered = false;
  renderQuestion(skill);
  updateStatBadges(skill);
}

function updateStatBadges(skill) {
  profile = loadProfile();
  const stats = SECTION_STAT_IDS[skill];
  const total = practiceState[skill].questions.length;
  document.getElementById(stats.progress).textContent = `${practiceState[skill].idx + 1} / ${total}`;
  document.getElementById(stats.mistakes).textContent = `Mistakes: ${profile.mistakes[skill] || 0}`;
}

// ─── Section Done ─────────────────────────────────
function renderSectionDone(skill, container) {
  const correct = profile.correct[skill]    || 0;
  const total   = profile.totalTasks[skill] || 0;
  const errors  = profile.mistakes[skill]   || 0;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
  const meta    = SKILL_META[skill];

  container.innerHTML = `
    <div class="section-done">
      <div class="done-icon">${pct >= 70 ? "Strong" : pct >= 50 ? "Review" : "Practice"}</div>
      <div class="done-title">Section Complete!</div>
      <div class="done-sub">${meta.label} practice finished.</div>
      <div class="done-stats">
        <div>
          <div class="done-stat-val">${correct}</div>
          <div class="done-stat-label">Correct</div>
        </div>
        <div>
          <div class="done-stat-val done-stat-danger">${errors}</div>
          <div class="done-stat-label">Mistakes</div>
        </div>
        <div>
          <div class="done-stat-val done-stat-warning">${pct}%</div>
          <div class="done-stat-label">Accuracy</div>
        </div>
      </div>
      <button class="btn-primary" id="restartBtn">Restart Section</button>
      <button class="btn-secondary btn-adjacent" id="goAIPlanBtn">View AI Plan</button>
    </div>`;

  container.querySelector("#restartBtn").addEventListener("click", () => {
    practiceState[skill].idx      = 0;
    practiceState[skill].answered = false;
    if (skill === "listening") practiceState[skill].played = false;
    renderQuestion(skill);
  });
  container.querySelector("#goAIPlanBtn").addEventListener("click", () => navigateTo("aiplan"));
}

// ─── MINI TEST ────────────────────────────────────
function getModulePracticeSkills(moduleId) {
  const module = getModuleById(moduleId);
  const skills = [
    module.skill,
    ...module.lessonIds.map(id => getLessonById(id).practiceSkill)
  ].filter(skill => QUESTIONS[skill]);
  return Array.from(new Set(skills));
}

function buildModuleMiniTest(moduleId) {
  const skills = getModulePracticeSkills(moduleId);
  const questions = [];
  const perSkill = skills.length === 1 ? 5 : 3;
  skills.forEach(skill => {
    questions.push(...pickQuestions(QUESTIONS[skill], perSkill));
  });
  return questions.slice(0, 8);
}

function getQuestionCompositionTags(questions) {
  const counts = questions.reduce((acc, question) => {
    const skill = question.skill?.toLowerCase() || question.type;
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([skill, count]) => `${count} ${SKILL_META[skill]?.label || titleCase(skill)}`);
}

function getMiniTestConfig() {
  const state = practiceState.minitest;
  if (state.mode === "module" && state.moduleId) {
    const module = getModuleById(state.moduleId);
    const questions = buildModuleMiniTest(module.id);
    return {
      title: `${module.title} Mini-Test`,
      copy: "Focused quiz for this preparation module.",
      button: "Start Module Mini-Test",
      questions,
      tags: getQuestionCompositionTags(questions)
    };
  }

  const questions = buildMiniTest();
  return {
    title: "Mini TOEFL Test",
    copy: "10 questions across all skill areas. Complete without stopping.",
    button: "Start Mini Test",
    questions,
    tags: ["3 Reading", "3 Listening", "2 Vocabulary", "1 Speaking", "1 Writing"]
  };
}

function startModuleMiniTest(moduleId) {
  practiceState.minitest.mode = "module";
  practiceState.minitest.moduleId = moduleId;
  practiceState.minitest.started = false;
  practiceState.minitest.done = false;
  renderMiniTestStart();
  navigateTo("minitest");
}

function initMiniTest() {
  const state = practiceState.minitest;
  state.questions = buildMiniTest();
  renderMiniTestStart();
}

function renderMiniTestStart() {
  const config = getMiniTestConfig();
  document.getElementById("miniContent").innerHTML = `
    <div class="mini-start">
      <h3>${escapeHtml(config.title)}</h3>
      <p>${escapeHtml(config.copy)}</p>
      <div class="mini-composition">
        ${config.tags.map(tag => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <button class="btn-primary" id="startMiniBtn">${escapeHtml(config.button)}</button>
    </div>`;

  document.getElementById("startMiniBtn").addEventListener("click", () => {
    practiceState.minitest.questions = config.questions;
    practiceState.minitest.idx     = 0;
    practiceState.minitest.answers = [];
    practiceState.minitest.started = true;
    practiceState.minitest.done    = false;
    renderMiniQuestion();
  });
}

function renderMiniQuestion() {
  stopListeningSpeech();

  const state = practiceState.minitest;
  const total = state.questions.length;

  document.getElementById("miniProgress").textContent = `${state.idx + 1} / ${total}`;

  if (state.idx >= total) {
    renderMiniResults();
    return;
  }

  const q = state.questions[state.idx];
  const content = document.getElementById("miniContent");

  if (q.type === "speaking") {
    renderMiniSpeaking(q, content);
    return;
  }

  if (q.type === "listening") {
    renderMiniListening(q, content);
    return;
  }

  if (q.type === "reading") {
    renderMiniReading(q, content);
    return;
  }

  // MCQ (vocab/writing)
  renderMiniMCQ(q, content);
}

function renderMiniMCQ(q, container) {
  const letters = ["A","B","C","D"];
  const state   = practiceState.minitest;
  container.innerHTML = `
    <div class="passage-label">${SKILL_META[q.skill.toLowerCase()].icon} ${q.skill} · Question ${state.idx + 1}</div>
    <div class="question-text">${q.question.replace(/\n/g,"<br>")}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosen  = btn.dataset.val;
      const correct = chosen === q.correctAnswer;
      state.answers.push({ skill: q.skill.toLowerCase(), correct, question: q });

      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });

      container.querySelector("#feedback").innerHTML = renderAnswerFeedback(q, q.skill?.toLowerCase(), correct);

      const nextBtn = container.querySelector("#nextBtn");
      nextBtn.classList.remove("hidden");
      nextBtn.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniReading(q, container) {
  const state   = practiceState.minitest;
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-label">Reading</div>
    <div class="passage-box">${q.passage}</div>
    <div class="question-text">${q.question}</div>
    <ul class="options-list">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}">
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.val === q.correctAnswer;
      state.answers.push({ skill: "reading", correct, question: q });
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });
      container.querySelector("#feedback").innerHTML = renderAnswerFeedback(q, "reading", correct);
      const nb = container.querySelector("#nextBtn");
      nb.classList.remove("hidden");
      nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniListening(q, container) {
  const state   = practiceState.minitest;
  const letters = ["A","B","C","D"];
  container.innerHTML = `
    <div class="passage-label">${q.lectureTitle}</div>
    <div class="passage-box hidden" id="miniLectureBox">${q.lectureText}</div>
    <div class="lecture-player">
      <div class="lecture-player-actions">
        <button class="play-btn" id="miniPlayBtn">Play Lecture</button>
        <button class="btn-secondary audio-control-btn" id="miniRestartBtn" disabled>Restart</button>
        <button class="btn-secondary audio-control-btn" id="miniTranscriptBtn">Show transcript</button>
      </div>
      <div class="audio-progress-track" aria-hidden="true">
        <span class="audio-progress-fill" id="miniAudioProgress" style="width: 0%"></span>
      </div>
    </div>
    <div class="question-text">${q.question}</div>
    <ul class="options-list" id="miniOpts">
      ${q.options.map((opt, i) => `
        <li><button class="option-btn" data-val="${opt}" disabled>
          <span class="option-letter">${letters[i]}</span> ${opt}
        </button></li>`).join("")}
    </ul>
    <div id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelector("#miniPlayBtn").addEventListener("click", function() {
    playLectureAudio({
      id: `mini-listening-${state.idx}-${q.id}`,
      text: buildLectureSpeechText(q),
      button: this,
      progress: container.querySelector("#miniAudioProgress"),
      onReady: () => markLectureReady(container)
    });
  });

  container.querySelector("#miniRestartBtn").addEventListener("click", function() {
    const playButton = container.querySelector("#miniPlayBtn");
    stopListeningSpeech();
    playLectureAudio({
      id: `mini-listening-${state.idx}-${q.id}`,
      text: buildLectureSpeechText(q),
      button: playButton,
      progress: container.querySelector("#miniAudioProgress"),
      onReady: () => markLectureReady(container)
    });
  });

  container.querySelector("#miniTranscriptBtn").addEventListener("click", function() {
    const transcript = container.querySelector("#miniLectureBox");
    setLectureTranscriptVisible(container, transcript.classList.contains("hidden"));
  });

  container.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.val === q.correctAnswer;
      state.answers.push({ skill: "listening", correct, question: q });
      container.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
        if (b.dataset.val === q.correctAnswer) b.classList.add("correct");
        else if (b === btn && !correct)         b.classList.add("wrong");
      });
      container.querySelector("#feedback").innerHTML = renderAnswerFeedback(q, "listening", correct);
      const nb = container.querySelector("#nextBtn");
      nb.classList.remove("hidden");
      nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
    });
  });
}

function renderMiniSpeaking(q, container) {
  const state = practiceState.minitest;
  container.innerHTML = `
    <div class="passage-label">Speaking</div>
    <div class="speaking-prompt">${q.prompt}</div>
    <div class="speaking-tip">💡 Write your 60-second spoken response.</div>
    <textarea class="answer-textarea" id="miniSpeakAnswer" placeholder="Type your response..."></textarea>
    <div class="button-row">
      <button class="btn-primary" id="miniSubmitSpeak">Submit</button>
      <button class="btn-secondary" id="miniSkipSpeak">Skip</button>
    </div>
    <div class="feedback-slot" id="feedback"></div>
    <div class="question-nav">
      <span class="q-counter">Q${state.idx + 1} / ${state.questions.length}</span>
      <button class="btn-primary hidden" id="nextBtn">Next</button>
    </div>`;

  container.querySelector("#miniSubmitSpeak").addEventListener("click", () => {
    const ans   = container.querySelector("#miniSpeakAnswer").value.trim();
    const lower = ans.toLowerCase();
    const good  = ans.split(/\s+/).length >= 30 &&
                  /\b(because|since|i (agree|disagree)|i think)\b/.test(lower);
    state.answers.push({ skill: "speaking", correct: good, question: q });
    container.querySelector("#feedback").innerHTML = `
      <div class="feedback-box ${good ? "correct" : "wrong"}">
        ${good ? "Good response." : "Response too short or missing position/reason. Keep practicing."}
      </div>`;
    const nb = container.querySelector("#nextBtn");
    nb.classList.remove("hidden");
    nb.addEventListener("click", () => { state.idx++; renderMiniQuestion(); }, { once: true });
  });

  container.querySelector("#miniSkipSpeak").addEventListener("click", () => {
    state.answers.push({ skill: "speaking", correct: false, question: q });
    state.idx++;
    renderMiniQuestion();
  });
}

function renderMiniResults() {
  const state   = practiceState.minitest;
  const answers = state.answers;

  // Tally by skill
  const bySkill = {};
  answers.forEach(a => {
    if (!bySkill[a.skill]) bySkill[a.skill] = { correct: 0, total: 0 };
    bySkill[a.skill].total++;
    if (a.correct) bySkill[a.skill].correct++;
    // Also update main profile
    profile = recordAnswer(profile, a.skill, a.correct, a.question);
  });

  const totalCorrect = answers.filter(a => a.correct).length;
  const predicted    = calcPredictedScore(profile);

  // Find weakest
  let weakest = null, worstRate = -1;
  Object.entries(bySkill).forEach(([sk, d]) => {
    const errRate = d.total > 0 ? (d.total - d.correct) / d.total : 0;
    if (errRate > worstRate) { worstRate = errRate; weakest = sk; }
  });

  const skills = ["reading","listening","vocabulary","speaking","writing"];
  const content = document.getElementById("miniContent");

  content.innerHTML = `
    <div class="mini-results">
      <div class="mini-result-header">
        <div class="mini-result-score">${totalCorrect}/${answers.length}</div>
        <div class="mini-result-label">Correct Answers</div>
        <div class="mini-result-prediction">
          Predicted TOEFL: <strong>${predicted}</strong>
        </div>
      </div>

      <div class="result-skill-grid">
        ${skills.map(sk => {
          const d       = bySkill[sk] || { correct: 0, total: 0 };
          const pct     = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
          const cls     = pct >= 70 ? "strong" : pct >= 40 ? "medium" : "weak";
          const meta    = SKILL_META[sk];
          return `
            <div class="result-skill-card">
              <div class="result-skill-name">${meta.label}</div>
              <div class="result-skill-score ${cls}">${d.correct}/${d.total}</div>
              <div class="result-skill-pct">${pct}%</div>
            </div>`;
        }).join("")}
      </div>

      ${weakest ? `
        <div class="feedback-box info mini-insight">
          <strong>AI Insight:</strong> Your weakest section was
          <strong>${SKILL_META[weakest]?.label}</strong>.
          ${generateLocalStudyPlan(profile).explanation}
        </div>` : ""}

      <div class="button-row button-row-center">
        <button class="btn-primary" id="retakeMiniBtn">Retake Test</button>
        <button class="btn-secondary" id="viewPlanBtn">View AI Plan</button>
      </div>
    </div>`;

  document.getElementById("miniProgress").textContent = `Done`;
  content.querySelector("#retakeMiniBtn").addEventListener("click", () => {
    state.questions = getMiniTestConfig().questions;
    state.idx = 0; state.answers = [];
    renderMiniTestStart();
  });
  content.querySelector("#viewPlanBtn").addEventListener("click", () => navigateTo("aiplan"));
}

// ─── AI PLAN SECTION ──────────────────────────────
function initAIPlan() {
  document.getElementById("generatePlanBtn").addEventListener("click", async () => {
    const btn = document.getElementById("generatePlanBtn");
    const out = document.getElementById("studyPlanContent");
    btn.disabled = true;
    btn.textContent = "Generating...";
    out.innerHTML = renderAILoading("Building your structured AI study plan...");

    try {
      const result = await fetchAIStudyPlan();
      out.innerHTML = renderPlanHtml(normalizeStudyPlan(result, profile));
      profile.lastAIPlan     = result;
      profile.lastAIPlanDate = new Date().toISOString();
      saveProfile(profile);
      showToast("AI plan ready.", "success");
    } catch (err) {
      const state = getAIStatusCopy(err);
      out.innerHTML = `
        ${renderAIStatus(state, { action: "Fallback recommendations" })}
        ${renderPlanHtml(normalizeStudyPlan(null, profile))}`;
      showToast("AI unavailable. Fallback plan is ready.", state.tone === "danger" ? "error" : "info");
    }

    btn.disabled = false;
    btn.textContent = "Generate Study Plan";
  });

  document.getElementById("analyzeGapBtn").addEventListener("click", async () => {
    const btn = document.getElementById("analyzeGapBtn");
    const out = document.getElementById("scoreGapContent");
    btn.disabled = true;
    btn.textContent = "Analyzing...";

    profile = loadProfile();
    const gapHtml = renderScoreGapVisual(profile);
    out.innerHTML = `<div class="gap-visual">${gapHtml}</div>
      <div class="ai-loading-spaced">${renderAILoading("Running AI gap analysis...")}</div>`;

    try {
      const result = await fetchScoreGapAnalysis();
      out.innerHTML = `
        <div class="gap-visual">${gapHtml}</div>
        ${renderGapAnalysisHtml(result, profile)}`;
      showToast("Gap analysis complete.", "success");
    } catch (err) {
      const state = getAIStatusCopy(err);
      out.innerHTML = `<div class="gap-visual">${gapHtml}</div>
        ${renderAIStatus(state, { action: "Local gap summary" })}
        ${renderGapAnalysisHtml(null, profile)}`;
      showToast("AI gap analysis unavailable. Local summary is shown.", state.tone === "danger" ? "error" : "info");
    }

    btn.disabled = false;
    btn.textContent = "Run AI Analysis";
  });
}

function renderGapAnalysisHtml(raw, currentProfile) {
  const parsed = parseJsonFromAI(raw);
  const weak = calcWeaknessScores(currentProfile)[0];
  const fallback = {
    overall: `Your current gap is ${Math.max(0, currentProfile.targetScore - calcPredictedScore(currentProfile))} points. The fastest improvement path is to reduce mistakes in ${SKILL_META[weak.skill].label}.`,
    weakestSkill: weak.skill,
    topActions: [
      `Review mistakes in ${SKILL_META[weak.skill].label}`,
      "Complete one timed mixed set",
      "Redo missed questions after 24 hours"
    ]
  };
  const analysis = parsed || fallback;
  const actions = Array.isArray(analysis.topActions) ? analysis.topActions : fallback.topActions;

  return `
    <div class="feedback-box info gap-fallback">
      ${escapeHtml(cleanAIText(analysis.overall || fallback.overall))}
    </div>
    <div class="smart-list smart-list-spaced">
      ${actions.slice(0, 3).map((action, index) => `
        <div class="smart-item">
          <strong>${index + 1}. ${escapeHtml(cleanAIText(action))}</strong>
          <span>${escapeHtml(SKILL_META[analysis.weakestSkill]?.label || "Score gap")} improvement action</span>
        </div>`).join("")}
    </div>`;
}

function renderAIPlanSection() {
  profile = loadProfile();
  const gapHtml = renderScoreGapVisual(profile);
  document.getElementById("gapVisual").innerHTML = gapHtml;
  renderStudyGoalOverview();
  renderWeeklyTargets();
  renderCalendar();
  if (!document.getElementById("studyPlanContent").dataset.hydrated) {
    document.getElementById("studyPlanContent").innerHTML = renderPlanHtml(normalizeStudyPlan(profile.lastAIPlan, profile));
    document.getElementById("studyPlanContent").dataset.hydrated = "true";
  }
}

function renderStudyGoalOverview() {
  const current = calcPredictedScore(profile);
  const gap = Math.max(0, profile.targetScore - current);
  const days = daysRemaining(profile);
  const el = document.getElementById("studyGoalOverview");
  if (!el) return;
  el.innerHTML = `
    <div class="goal-overview">
      <div><span>Current</span><strong>${current}</strong></div>
      <div class="goal-arrow">to</div>
      <div><span>Target</span><strong>${profile.targetScore}</strong></div>
    </div>
    <p>${gap} points to close over ${days} days.</p>`;
}

function renderRoadmap() {
  const el = document.getElementById("roadmapContent");
  if (!el) return;
  const phases = [
    { range: "Week 1-2", title: "Diagnose and stabilize", copy: "Mini test, first weak zones, core vocabulary, evidence habits." },
    { range: "Week 3-4", title: "Repair weak skills", copy: "Focused Reading and Listening sets, speaking structure, writing organization." },
    { range: "Week 5-6", title: "Build timed accuracy", copy: "Mixed drills, review bank, AI feedback, score-gap checks." },
    { range: "Week 7-8", title: "Simulate and polish", copy: "Mini tests, final error review, pacing and exam routine." }
  ];
  el.innerHTML = phases.map(phase => `
    <div class="roadmap-item">
      <span>${phase.range}</span>
      <strong>${phase.title}</strong>
      <p>${phase.copy}</p>
    </div>`).join("");
}

function renderWeeklyTargets() {
  const el = document.getElementById("weeklyTargets");
  if (!el) return;
  const weeklyTasks = Math.max(12, Math.min(34, Math.round((Math.max(0, profile.targetScore - calcPredictedScore(profile)) || 20) / 2)));
  el.innerHTML = `
    <div class="weekly-target"><strong>${weeklyTasks}</strong><span>practice tasks / week</span></div>
    <div class="weekly-target"><strong>2</strong><span>mini tests / week</span></div>
    <div class="weekly-target"><strong>3</strong><span>mistake reviews / week</span></div>`;
}

// ─── ANALYTICS ───────────────────────────────────
function initAnalytics() { /* rendered on navigate */ }

function renderAnalytics() {
  profile = loadProfile();
  const analytics = buildAnalyticsModel(profile);
  const container = document.getElementById("analyticsWorkspace");
  if (!container) return;
  const skills = ["reading","listening","speaking","writing","vocabulary"];
  const completed = totalCompletedTasks(profile);
  const correct = Object.values(profile.correct || {}).reduce((sum, value) => sum + (value || 0), 0);
  const accuracy = completed ? Math.round((correct / completed) * 100) : 0;
  const current = analytics.predictedScore;
  const weak = analytics.weakZones.length
    ? analytics.weakZones
    : calcWeaknessScores(profile).filter(item => item.total > 0);
  const confidence = analytics.confidence || { level: "none", score: 0 };
  const readiness = analytics.readiness || { level: "not-ready", overall: 0 };

  container.innerHTML = `
    ${renderAnalyticsInsight(analytics, accuracy, completed)}
    <div class="analytics-kpi-grid">
      ${renderKpi("Current TOEFL", current, "Predicted score")}
      ${renderKpi("Accuracy", `${accuracy}%`, `${correct}/${completed} correct`)}
      ${renderKpi("Confidence", confidence.level, `${confidence.score}% model confidence`)}
      ${renderKpi("Readiness", readiness.level, `${readiness.overall}% exam readiness`)}
      ${renderKpi("Completed tasks", completed, "all practice")}
    </div>
    <div class="analytics-grid">
      <div class="card score-progress-card">
        <div class="section-heading"><div><div class="card-kicker">Score progress</div><h2 class="card-title">Movement over time</h2></div></div>
        <div class="trajectory-chart analytics-trajectory" id="analyticsTrajectory"></div>
      </div>
      <div class="card skill-distribution-card">
        <div class="section-heading"><div><div class="card-kicker">Skill distribution</div><h2 class="card-title">Score, progress, confidence</h2></div></div>
        ${skills.map(skill => renderSkillDistribution(skill)).join("")}
      </div>
      <div class="card target-pace-card">
        <div class="card-kicker">Target pace</div>
        ${renderTargetPace(analytics)}
      </div>
      <div class="card weak-areas-card">
        <div class="section-heading"><div><div class="card-kicker">Weak areas</div><h2 class="card-title">Most repeated pressure points</h2></div></div>
        <div class="error-list">
          ${weak.length ? weak.slice(0, 5).map(w => renderWeakArea(w)).join("") : renderAnalyticsEmpty("Complete practice tasks to reveal weak areas.")}
        </div>
      </div>
      <div class="card mistake-analysis-card">
        <div class="section-heading"><div><div class="card-kicker">Mistake analysis</div><h2 class="card-title">What keeps repeating</h2></div></div>
        <div id="mistakeBankReview" class="error-list"></div>
      </div>
      <div class="card progress-history-card">
        <div class="section-heading"><div><div class="card-kicker">Progress history</div><h2 class="card-title">Last 7 days</h2></div></div>
        <div id="weeklyReport" class="error-list"></div>
      </div>
    </div>`;
  renderTrajectoryChartInto("analyticsTrajectory", current);
  renderMistakeBankReview();
  renderWeeklyReport();
}

function renderKpi(label, value, note) {
  return `<div class="card analytics-kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}

function renderAnalyticsInsight(analytics, accuracy, completed) {
  const confidence = analytics.confidence || { level: "none", score: 0 };
  const readiness = analytics.readiness || { level: "not-ready", overall: 0 };
  const gap = Math.max(0, profile.targetScore - analytics.predictedScore);
  const weak = analytics.weakZones?.[0];
  const weakLabel = weak ? SKILL_META[weak.skill]?.label || weak.skill : "mixed practice";
  const confidenceCopy = confidence.score < 45
    ? "Prediction confidence is still low, so new practice will move the model more."
    : "Prediction confidence is stable enough to track directional progress.";
  return `
    <div class="card analytics-insight">
      <div>
        <div class="card-kicker">Score evidence</div>
        <h2 class="card-title">${gap} points to close</h2>
        <p>${completed} completed tasks, ${accuracy}% accuracy, ${readiness.overall}% readiness. ${confidenceCopy}</p>
      </div>
      <div class="analytics-insight-tags">
        <span>${escapeHtml(confidence.level)} confidence</span>
        <span>${escapeHtml(readiness.level)} readiness</span>
        <span>${escapeHtml(weakLabel)} focus</span>
      </div>
    </div>`;
}

function renderTargetPace(analytics) {
  const gap = Math.max(0, profile.targetScore - analytics.predictedScore);
  const days = daysRemaining(profile);
  const weeks = Math.max(1, Math.ceil(days / 7));
  const pointsPerWeek = Math.max(0, round(gap / weeks, 1));
  const weeklyTasks = Math.max(12, Math.min(34, Math.round((gap || 20) / 2)));
  return `
    <div class="pace-grid">
      <div class="pace-stat"><span>Gap</span><strong>${gap}</strong><small>points</small></div>
      <div class="pace-stat"><span>Weeks</span><strong>${weeks}</strong><small>left</small></div>
      <div class="pace-stat"><span>Pace</span><strong>${pointsPerWeek}</strong><small>pts / week</small></div>
      <div class="pace-stat"><span>Workload</span><strong>${weeklyTasks}</strong><small>tasks / week</small></div>
    </div>
    <p class="pace-note">Use this as a planning signal, not a promise. Confidence rises as the sample size grows.</p>`;
}

function renderAnalyticsEmpty(text) {
  return `<div class="analytics-empty">${escapeHtml(text)}</div>`;
}

function renderSkillDistribution(skill) {
  const meta = SKILL_META[skill];
  const analytics = buildAnalyticsModel(profile);
  const skillData = analytics.skills.find(item => item.skill === skill);
  const score = skill === "vocabulary" ? (profile.progress[skill] || 0) : (profile.scores[skill] || 0);
  const pct = skill === "vocabulary" ? score : Math.round((score / 30) * 100);
  const confidence = skillData?.confidence?.level || "none";
  const readiness = skillData?.readiness?.readiness ?? pct;
  const source = skillData?.source || "profile";
  return `
    <div class="skill-distribution-row">
      <div class="skill-distribution-head">
        <span class="bar-chart-label">${meta.label}</span>
        <span class="skill-distribution-note">${confidence} confidence · ${source}</span>
      </div>
      <div class="bar-chart-row">
        <div class="bar-chart-track"><div class="bar-chart-fill fill-${skill} ${percentClass("w", pct)}"></div></div>
        <span class="bar-chart-pct">${skill === "vocabulary" ? pct + "%" : score + "/30"}</span>
      </div>
      <div class="skill-distribution-foot">
        <span>Readiness ${readiness}%</span>
        <span>Proficiency ${skillData?.proficiency ?? pct}%</span>
      </div>
    </div>`;
}

function renderWeakArea(w) {
  const meta = SKILL_META[w.skill];
  const errPct = Math.round(w.score * 100);
  return `
    <div class="error-item">
      <span class="error-skill">${meta.label}</span>
      <div class="error-bar-wrap"><div class="error-bar-track"><div class="error-bar-fill ${percentClass("w", errPct)}"></div></div></div>
      <span class="error-pct">${errPct}%</span>
      <span class="error-count">${w.mistakes}/${w.total}</span>
    </div>`;
}

function renderMistakeBankReview() {
  const container = document.getElementById("mistakeBankReview");
  if (!container) return;
  const mistakes = (profile.mistakeBank || []).filter(item => !item.mastered).slice(0, 8);
  if (!mistakes.length) {
    container.innerHTML = `<p class="placeholder-text">No mistakes saved yet. Missed questions will become review cards.</p>`;
    return;
  }

  container.innerHTML = mistakes.map(item => `
    <div class="error-item error-item-start">
      <span class="error-skill">${SKILL_META[item.skill]?.label || item.skill}</span>
      <div class="mistake-detail">
        <strong>${escapeHtml(item.topic)}</strong><br>
        <span class="mistake-prompt">${escapeHtml(item.prompt).slice(0, 150)}${item.prompt.length > 150 ? "..." : ""}</span>
        ${item.correctAnswer ? `<br><span class="mistake-correct">Correct: ${escapeHtml(item.correctAnswer)}</span>` : ""}
      </div>
      <span class="error-count">x${item.count}</span>
    </div>`).join("");
}

function renderWeeklyReport() {
  const container = document.getElementById("weeklyReport");
  if (!container) return;
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = (profile.activityLog || []).filter(item => new Date(item.date).getTime() >= weekAgo);
  const correct = recent.filter(item => item.correct).length;
  const xp = recent.reduce((sum, item) => sum + (item.xp || 0), 0);
  const accuracy = recent.length ? Math.round((correct / recent.length) * 100) : 0;
  const achievements = profile.achievements || [];

  container.innerHTML = `
    <div class="habit-grid">
      <div class="habit-stat"><div class="habit-value">${recent.length}</div><div class="habit-label">Tasks this week</div></div>
      <div class="habit-stat"><div class="habit-value">${accuracy}%</div><div class="habit-label">Weekly accuracy</div></div>
      <div class="habit-stat"><div class="habit-value">${xp}</div><div class="habit-label">Weekly XP</div></div>
      <div class="habit-stat"><div class="habit-value">${achievements.length}</div><div class="habit-label">Achievements</div></div>
    </div>
    <div class="achievement-list">
      ${achievements.length ? achievements.map(a => `<div class="achievement-mini">${escapeHtml(a)}</div>`).join("") : `<p class="placeholder-text">No achievements yet. Complete 10 tasks to unlock the first one.</p>`}
    </div>`;
}

// ─── TOAST ───────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = "info") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
}
