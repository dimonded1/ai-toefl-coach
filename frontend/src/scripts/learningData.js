// AI TOEFL Coach - Learning content catalog

const LEARNING_MODULES = [
  {
    id: "reading-basics",
    title: "Reading Basics",
    skill: "reading",
    level: "beginner",
    weeks: [2],
    description: "Evidence habits, question types, and passage control.",
    lessonIds: ["toefl-structure", "reading-inference", "reading-purpose"]
  },
  {
    id: "listening-lectures",
    title: "Listening Lectures",
    skill: "listening",
    level: "intermediate",
    weeks: [3],
    description: "Note-taking, lecture structure, and attitude signals.",
    lessonIds: ["listening-note-taking", "listening-attitude"]
  },
  {
    id: "speaking-task-1",
    title: "Speaking Task 1",
    skill: "speaking",
    level: "beginner",
    weeks: [4],
    description: "Simple opinion structure with clear reasons and examples.",
    lessonIds: ["speaking-task-one"]
  },
  {
    id: "speaking-integrated",
    title: "Speaking Integrated",
    skill: "speaking",
    level: "intermediate",
    weeks: [4],
    description: "Summarize sources without losing the task focus.",
    lessonIds: ["speaking-integrated"]
  },
  {
    id: "writing-discussion",
    title: "Writing Academic Discussion",
    skill: "writing",
    level: "intermediate",
    weeks: [5],
    description: "Claim, support, and response structure for discussion prompts.",
    lessonIds: ["writing-academic-discussion", "writing-organization"]
  },
  {
    id: "vocabulary-toefl",
    title: "Vocabulary for TOEFL",
    skill: "vocabulary",
    level: "beginner",
    weeks: [2, 6],
    description: "Academic word families, context clues, and review rhythm.",
    lessonIds: ["vocabulary-context", "vocabulary-review"]
  },
  {
    id: "exam-strategy",
    title: "Exam Strategy",
    skill: "strategy",
    level: "intermediate",
    weeks: [1, 7, 8],
    description: "Timing, diagnostics, mock review, and final-week decisions.",
    lessonIds: ["time-management", "exam-day-strategy"]
  }
];

const LEARNING_LESSONS = [
  {
    id: "toefl-structure",
    moduleId: "reading-basics",
    title: "TOEFL Structure: What the Test Measures",
    skill: "strategy",
    level: "beginner",
    minutes: 4,
    tags: ["structure", "sections", "score"],
    summary: "Understand how Reading, Listening, Speaking, and Writing connect to the total score.",
    steps: [
      { title: "The four-section loop", body: "TOEFL rewards academic comprehension plus clear output. Reading and Listening gather evidence; Speaking and Writing turn evidence into organized answers.", bullets: ["Track evidence, not guesses.", "Practice output after input.", "Review mistakes by reason, not only by score."] },
      { title: "Score thinking", body: "A target score becomes useful when you split it by skill. A 95 target does not mean every skill must be equal, but weak skills need a repair plan.", bullets: ["Find the lowest skill first.", "Use mini tests to update the prediction.", "Review repeated mistakes weekly."] }
    ],
    checklist: ["Know the four sections", "Know your target score", "Run a diagnostic before heavy practice"],
    example: { prompt: "A student wants 95 but avoids Speaking.", answer: "Keep Reading practice active, but schedule Speaking twice a week because one weak skill can hold the total score down.", why: "The plan connects target score to skill balance." },
    practiceSkill: "minitest",
    repairTopics: ["Diagnostic", "General"]
  },
  {
    id: "reading-inference",
    moduleId: "reading-basics",
    title: "Reading: Inference Questions",
    skill: "reading",
    level: "intermediate",
    minutes: 5,
    tags: ["inference", "reading", "question types"],
    summary: "Choose the answer that must be true from the passage, not the answer that merely sounds reasonable.",
    steps: [
      { title: "What inference means", body: "An inference answer is not copied word-for-word, but it must be forced by evidence in the text.", bullets: ["Underline the sentence that supports it.", "Reject answers that add new information.", "Prefer narrow, evidence-based wording."] },
      { title: "Trap answers", body: "TOEFL inference traps often use familiar words from the passage but change the logic.", bullets: ["Too broad", "Opposite cause/effect", "True in real life but unsupported"] }
    ],
    checklist: ["Find the evidence line", "Paraphrase before looking at options", "Eliminate unsupported claims"],
    example: { prompt: "The passage says many species moved uphill as temperatures increased.", answer: "It can be inferred that temperature change affected where some species could survive.", why: "The answer stays close to the evidence and does not invent a new cause." },
    practiceSkill: "reading",
    repairTopics: ["Inference", "Reading"]
  },
  {
    id: "reading-purpose",
    moduleId: "reading-basics",
    title: "Reading: Author Purpose",
    skill: "reading",
    level: "intermediate",
    minutes: 4,
    tags: ["purpose", "reading", "rhetorical"],
    summary: "Purpose questions ask why a sentence or paragraph exists in the argument.",
    steps: [
      { title: "Read around the sentence", body: "Do not judge purpose from one sentence alone. Look at the sentence before and after it.", bullets: ["Is it an example?", "Is it a contrast?", "Is it a definition?", "Is it a result?"] },
      { title: "Name the job", body: "Before choices, name the job in simple words: explain, contrast, support, introduce, or qualify.", bullets: ["Function beats detail.", "Avoid choices that only repeat content."] }
    ],
    checklist: ["Read one sentence before and after", "Name the function", "Choose purpose, not topic"],
    example: { prompt: "A paragraph gives a fossil example after a theory.", answer: "The example supports the theory with evidence.", why: "The purpose is support, not simply fossil description." },
    practiceSkill: "reading",
    repairTopics: ["Purpose", "Reading"]
  },
  {
    id: "listening-note-taking",
    moduleId: "listening-lectures",
    title: "Listening: Lecture Note-Taking",
    skill: "listening",
    level: "intermediate",
    minutes: 6,
    tags: ["lecture notes", "listening", "organization"],
    summary: "Write structure, not everything. Good notes capture turns in the lecture.",
    steps: [
      { title: "Use a lecture skeleton", body: "Most lectures move through topic, problem, examples, contrast, and conclusion. Your notes should show those turns.", bullets: ["T = topic", "Ex = example", "But = contrast", "So = result"] },
      { title: "Listen for signals", body: "Professors announce structure with phrases like 'however', 'for example', and 'the main reason'.", bullets: ["Mark contrast clearly.", "Separate examples from the main idea.", "Circle repeated terms."] }
    ],
    checklist: ["Write structure words", "Separate main idea from examples", "Mark attitude changes"],
    example: { prompt: "The professor says 'However, this explanation has a problem.'", answer: "Mark a contrast and expect the next detail to be testable.", why: "The signal changes the lecture direction." },
    practiceSkill: "listening",
    repairTopics: ["Lecture", "Listening", "Notes"]
  },
  {
    id: "listening-attitude",
    moduleId: "listening-lectures",
    title: "Listening: Speaker Attitude",
    skill: "listening",
    level: "intermediate",
    minutes: 5,
    tags: ["attitude", "function", "listening"],
    summary: "Attitude questions depend on tone, word choice, and why the speaker says something.",
    steps: [
      { title: "Meaning behind the line", body: "When a speaker sounds surprised, doubtful, or approving, the test may ask what that line implies.", bullets: ["Notice stress words.", "Track whether the speaker agrees or corrects.", "Do not answer only from literal words."] },
      { title: "Function first", body: "Ask: is the speaker clarifying, disagreeing, encouraging, warning, or changing topic?", bullets: ["Function is more stable than emotion.", "Use context before tone."] }
    ],
    checklist: ["Listen for correction", "Track agreement", "Use context before emotion"],
    example: { prompt: "A professor says, 'Well, not exactly.'", answer: "The professor is correcting or qualifying a previous idea.", why: "The phrase signals partial disagreement." },
    practiceSkill: "listening",
    repairTopics: ["Attitude", "Function", "Listening"]
  },
  {
    id: "speaking-task-one",
    moduleId: "speaking-task-1",
    title: "Speaking Task 1: Opinion Template",
    skill: "speaking",
    level: "beginner",
    minutes: 5,
    tags: ["speaking", "template", "opinion"],
    summary: "Use a simple answer shape: opinion, reason, example, closing sentence.",
    steps: [
      { title: "The 45-second shape", body: "A clear answer beats a complicated answer. Give one position and one developed reason.", bullets: ["I believe...", "The main reason is...", "For example...", "That is why..."] },
      { title: "Development", body: "Specific examples make the response sound real and organized.", bullets: ["Use personal or school examples.", "Avoid listing three shallow reasons.", "Leave five seconds for a closing line."] }
    ],
    checklist: ["State one opinion", "Give one clear reason", "Use one specific example", "End cleanly"],
    example: { prompt: "Do you prefer studying alone or with classmates?", answer: "I prefer studying alone because I can control my schedule. For example, when I prepare for vocabulary, I repeat difficult words several times without slowing anyone else down.", why: "The response has a position, reason, and concrete example." },
    practiceSkill: "speaking",
    repairTopics: ["Speaking", "Task 1", "Opinion"]
  },
  {
    id: "speaking-integrated",
    moduleId: "speaking-integrated",
    title: "Speaking Integrated: Source Summary",
    skill: "speaking",
    level: "intermediate",
    minutes: 6,
    tags: ["speaking", "integrated", "summary"],
    summary: "Integrated speaking is about source accuracy, not personal opinion.",
    steps: [
      { title: "Source hierarchy", body: "Mention the reading or announcement first, then explain how the listening supports or challenges it.", bullets: ["Reading says...", "The speaker disagrees because...", "The first reason is..."] },
      { title: "No extra opinion", body: "Your job is to report the relationship between sources. Extra personal opinion can waste time.", bullets: ["Use source verbs.", "Keep examples tied to the prompt.", "Do not invent missing details."] }
    ],
    checklist: ["Name both sources", "Explain the relationship", "Use source details only"],
    example: { prompt: "Announcement supports a new campus rule, student disagrees.", answer: "The announcement says the rule will reduce noise, but the student disagrees because most noise happens outside the library.", why: "The answer connects source claim and listening objection." },
    practiceSkill: "speaking",
    repairTopics: ["Integrated", "Speaking"]
  },
  {
    id: "writing-academic-discussion",
    moduleId: "writing-discussion",
    title: "Writing: Academic Discussion",
    skill: "writing",
    level: "intermediate",
    minutes: 6,
    tags: ["academic discussion", "writing", "claim"],
    summary: "Make one clear claim, respond to the discussion, and add your own support.",
    steps: [
      { title: "Answer the professor", body: "Your first sentence should directly answer the prompt, not summarize the whole topic.", bullets: ["I agree that...", "I would prioritize...", "The strongest reason is..."] },
      { title: "Use classmates well", body: "Mention a classmate only if it helps your argument. Do not spend the whole answer summarizing others.", bullets: ["Build on one idea.", "Contrast politely.", "Add a concrete reason."] }
    ],
    checklist: ["Clear claim", "One classmate connection", "Specific support", "Academic tone"],
    example: { prompt: "Should universities require group projects?", answer: "I think universities should require some group projects because they train students to explain ideas clearly. This builds on Maria's point about communication, but I would add that group work also prepares students for workplace tasks.", why: "The answer responds, connects, and adds original support." },
    practiceSkill: "writing",
    repairTopics: ["Academic discussion", "Writing"]
  },
  {
    id: "writing-organization",
    moduleId: "writing-discussion",
    title: "Writing: Organization Under Time",
    skill: "writing",
    level: "intermediate",
    minutes: 5,
    tags: ["writing", "organization", "time"],
    summary: "A timed answer needs a visible claim, logical support, and clean transitions.",
    steps: [
      { title: "Plan in 60 seconds", body: "Before writing, choose claim, reason, example, and closing point. This prevents mid-answer drift.", bullets: ["Claim", "Reason", "Example", "Result"] },
      { title: "Transition lightly", body: "Transitions should show logic, not decorate every sentence.", bullets: ["because", "for example", "as a result", "however"] }
    ],
    checklist: ["Plan before writing", "One paragraph goal", "Use transitions for logic"],
    example: { prompt: "A rushed answer repeats the same reason twice.", answer: "Fix it by adding a concrete example after the reason, then explain the result.", why: "Development improves score more than repeating the claim." },
    practiceSkill: "writing",
    repairTopics: ["Organization", "Writing"]
  },
  {
    id: "vocabulary-context",
    moduleId: "vocabulary-toefl",
    title: "Vocabulary: Context Clues",
    skill: "vocabulary",
    level: "beginner",
    minutes: 4,
    tags: ["vocabulary", "context", "word meaning"],
    summary: "Use nearby contrast, examples, and definitions to infer word meaning.",
    steps: [
      { title: "Three clue types", body: "Academic passages often define a term, contrast it, or give an example nearby.", bullets: ["Definition after commas", "Contrast after however", "Example after such as"] },
      { title: "Word family check", body: "If you know one form, infer the role of another form from grammar.", bullets: ["analyze -> analysis", "significant -> significance", "vary -> variable"] }
    ],
    checklist: ["Look before and after the word", "Find contrast or example", "Check grammar role"],
    example: { prompt: "The animal is nocturnal; it is active at night.", answer: "Nocturnal means active at night.", why: "The definition follows the semicolon." },
    practiceSkill: "vocabulary",
    repairTopics: ["Academic vocabulary", "Vocabulary"]
  },
  {
    id: "vocabulary-review",
    moduleId: "vocabulary-toefl",
    title: "Vocabulary: Review Rhythm",
    skill: "vocabulary",
    level: "beginner",
    minutes: 3,
    tags: ["vocabulary", "review", "spaced repetition"],
    summary: "Review hard words soon, then gradually increase the gap.",
    steps: [
      { title: "Simple rhythm", body: "A lightweight review plan is enough for this project: today, tomorrow, three days later, then weekly.", bullets: ["Missed word: review tomorrow", "Correct twice: mark learning", "Correct three times: mark mastered"] },
      { title: "Use context", body: "Do not memorize only translations. Save one sentence that shows the word's academic use.", bullets: ["Definition", "Example", "Your own sentence"] }
    ],
    checklist: ["Review missed words tomorrow", "Keep one example sentence", "Move words to mastered gradually"],
    example: { prompt: "Word: subsequent", answer: "Subsequent experiments produced similar results.", why: "The example shows 'coming after' in an academic context." },
    practiceSkill: "vocabulary",
    repairTopics: ["Vocabulary", "Review"]
  },
  {
    id: "time-management",
    moduleId: "exam-strategy",
    title: "Time Management for TOEFL Practice",
    skill: "strategy",
    level: "intermediate",
    minutes: 5,
    tags: ["time management", "strategy", "exam"],
    summary: "Use time limits to train decisions, not panic.",
    steps: [
      { title: "Time blocks", body: "Practice in short timed blocks so you learn when to move on.", bullets: ["Reading: skip and return", "Listening: keep notes moving", "Writing: reserve review time"] },
      { title: "Review time leaks", body: "After practice, note where time disappeared: rereading, overthinking, or rewriting.", bullets: ["Name the leak", "Set one rule", "Retest the same skill"] }
    ],
    checklist: ["Use a timer", "Name one time leak", "Set a move-on rule"],
    example: { prompt: "A student spends 4 minutes on one reading item.", answer: "Mark it, move on, and return only if time remains.", why: "One question should not damage the whole section." },
    practiceSkill: "minitest",
    repairTopics: ["Time", "Strategy"]
  },
  {
    id: "exam-day-strategy",
    moduleId: "exam-strategy",
    title: "Exam Strategy: Final Review",
    skill: "strategy",
    level: "advanced",
    minutes: 4,
    tags: ["exam strategy", "final review", "mock"],
    summary: "Final review should protect score stability, not introduce too many new tactics.",
    steps: [
      { title: "Final-week rule", body: "Do less new learning and more review of repeated mistakes, timing, and templates.", bullets: ["Redo missed topics", "Practice under timer", "Sleep and logistics"] },
      { title: "Score protection", body: "Focus on predictable routines: notes, outlines, response structure, and calm pacing.", bullets: ["Use familiar templates", "Avoid last-minute experiments", "Review personal rules"] }
    ],
    checklist: ["Redo repeated mistakes", "Use known templates", "Plan test logistics"],
    example: { prompt: "A student wants to learn a new speaking structure the day before the test.", answer: "Use the practiced structure instead and spend the time reviewing common mistakes.", why: "Stability matters more than novelty in final review." },
    practiceSkill: "minitest",
    repairTopics: ["Final review", "Strategy"]
  }
];

const STUDY_PATH_WEEKS = [
  { week: 1, title: "Diagnostic", focus: "Set target, run mini test, learn the test structure.", lessonIds: ["toefl-structure"] },
  { week: 2, title: "Reading foundation", focus: "Build evidence habits and academic vocabulary.", lessonIds: ["reading-inference", "reading-purpose", "vocabulary-context"] },
  { week: 3, title: "Listening", focus: "Train lecture notes and speaker attitude.", lessonIds: ["listening-note-taking", "listening-attitude"] },
  { week: 4, title: "Speaking", focus: "Stabilize independent and integrated answer structure.", lessonIds: ["speaking-task-one", "speaking-integrated"] },
  { week: 5, title: "Writing", focus: "Academic discussion and timed organization.", lessonIds: ["writing-academic-discussion", "writing-organization"] },
  { week: 6, title: "Mixed practice", focus: "Combine weak lessons with daily drills.", lessonIds: ["vocabulary-review", "time-management"] },
  { week: 7, title: "Mock tests", focus: "Use timed sets and score breakdowns.", lessonIds: ["time-management"] },
  { week: 8, title: "Final review", focus: "Repeat mistakes, protect pacing, and simplify routines.", lessonIds: ["exam-day-strategy"] }
];

const TOEFL_WORD_CARDS = [
  { id: "significant", word: "significant", definition: "important enough to affect a result", example: "The study found a significant difference between the two groups.", skill: "reading" },
  { id: "subsequent", word: "subsequent", definition: "coming after something else", example: "Subsequent lectures expanded on the same theory.", skill: "reading" },
  { id: "controversial", word: "controversial", definition: "causing disagreement", example: "The policy remains controversial among researchers.", skill: "writing" },
  { id: "diminish", word: "diminish", definition: "to become or make something smaller", example: "The effect may diminish over time.", skill: "listening" },
  { id: "empirical", word: "empirical", definition: "based on observation or evidence", example: "The professor asked for empirical support.", skill: "writing" },
  { id: "retain", word: "retain", definition: "to keep or continue to have", example: "Students retain more vocabulary when they review it in context.", skill: "vocabulary" },
  { id: "approximate", word: "approximate", definition: "close to an exact amount", example: "The approximate age of the artifact is 2,000 years.", skill: "listening" },
  { id: "indicate", word: "indicate", definition: "to show or suggest", example: "The data indicate a change in climate patterns.", skill: "reading" }
];

function getLessonById(id) {
  return LEARNING_LESSONS.find(lesson => lesson.id === id) || LEARNING_LESSONS[0];
}

function getModuleById(id) {
  return LEARNING_MODULES.find(module => module.id === id) || LEARNING_MODULES[0];
}
