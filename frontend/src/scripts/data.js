// ═══════════════════════════════════════════════
//  AI TOEFL Coach — Question Bank
// ═══════════════════════════════════════════════

const TOEFL_REFERENCE_DB = {
  exam: {
    name: "TOEFL iBT",
    sourceBasis: "ETS public TOEFL iBT test-content pages and scoring-guide PDFs; no copyrighted textbook content is copied.",
    copyrightNote: "Practice items in this app are original TOEFL-style training materials, not official ETS questions.",
    officialResources: [
      {
        title: "ETS TOEFL iBT Test Content",
        use: "Official section structure, timing, score scales, and task descriptions.",
        url: "https://www.ets.org/toefl/test-takers/ibt/about/content.html"
      },
      {
        title: "ETS TOEFL TestReady",
        use: "Official paid/free practice and prep portal.",
        url: "https://www.ets.org/toefl/test-takers/ibt/prepare.html"
      },
      {
        title: "ETS TOEFL iBT Free Practice Test",
        use: "Official sample test for format familiarity.",
        url: "https://www.ets.org/pdfs/toefl/toefl-ibt-free-practice-test.pdf"
      },
      {
        title: "ETS Speaking Rubrics",
        use: "Official criteria for speaking response quality.",
        url: "https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-speaking-rubrics.pdf"
      },
      {
        title: "ETS Writing Rubrics",
        use: "Official criteria for integrated writing and academic discussion writing.",
        url: "https://www.ets.org/pdfs/toefl/toefl-ibt-writing-rubrics.pdf"
      }
    ],
    formatBefore2026: {
      totalTime: "Just under 2 hours; plan about 2.5 hours including check-in.",
      totalScore: "0-120",
      sections: {
        reading: { time: "35 minutes", items: "20 questions", score: "0-30", focus: "Academic passages and questions." },
        listening: { time: "36 minutes", items: "28 questions", score: "0-30", focus: "Lectures, classroom discussion, campus conversations." },
        speaking: { time: "16 minutes", items: "4 tasks", score: "0-30", focus: "1 independent task and 3 integrated tasks." },
        writing: { time: "29 minutes", items: "2 tasks", score: "0-30", focus: "Integrated writing and academic discussion writing." }
      }
    },
    formatAfter2026: {
      effectiveDate: "2026-01-21",
      overallScore: "1-6 scale, average of four section scores rounded to the nearest half band.",
      transition: "ETS indicates a comparable 0-120 overall score during a two-year transition period after January 2026.",
      adaptiveSections: {
        reading: { baseTime: "30 minutes", items: "50", taskTypes: ["Complete the Words", "Read in Daily Life", "Read an Academic Passage"] },
        listening: { baseTime: "29 minutes", items: "47", taskTypes: ["Listen and Choose a Response", "Listen to a Conversation", "Listen to an Announcement", "Listen to an Academic Talk"] },
        writing: { baseTime: "23 minutes", items: "12", taskTypes: ["Build a Sentence", "Write an Email", "Write for an Academic Discussion"] },
        speaking: { baseTime: "8 minutes", items: "11", taskTypes: ["Listen and Repeat", "Take an Interview"] }
      }
    }
  },
  scoringRubrics: {
    speaking: [
      "Delivery: clear speech, natural pace, intelligible pronunciation, limited distracting hesitation.",
      "Language use: grammar and vocabulary are accurate enough to express meaning.",
      "Topic development: response answers the task, gives reasons/details, and is coherent.",
      "Integrated tasks: response accurately connects source information instead of giving unrelated opinion."
    ],
    writing: [
      "Task fulfillment: directly answers the prompt and uses relevant support.",
      "Organization: clear thesis or claim, logical paragraph flow, effective transitions.",
      "Development: specific examples, explanation, and source comparison where required.",
      "Language control: accurate sentence structure, vocabulary, grammar, and mechanics."
    ],
    reading: [
      "Main idea, factual detail, inference, vocabulary-in-context, rhetorical purpose, and organization.",
      "Track evidence line by line; avoid choosing options that are true but not supported by the passage."
    ],
    listening: [
      "Main idea, detail, speaker attitude, function, organization, and inference.",
      "Listen for lecture structure: topic, contrast, example, cause/effect, problem/solution, conclusion."
    ]
  },
  studyCalendar: [
    { week: 1, focus: "Diagnostic and format", tasks: ["Complete mini test", "Set target score", "Learn section timing", "Start error log"] },
    { week: 2, focus: "Academic vocabulary and reading accuracy", tasks: ["20 vocabulary items", "4 reading passages", "Review wrong answers by evidence type"] },
    { week: 3, focus: "Listening structure", tasks: ["5 lecture notes", "3 campus dialogues", "Practice speaker attitude questions"] },
    { week: 4, focus: "Speaking fluency", tasks: ["10 independent responses", "Record 5 integrated-style summaries", "Review delivery and structure"] },
    { week: 5, focus: "Writing organization", tasks: ["3 integrated outlines", "5 academic discussion posts", "Build transition bank"] },
    { week: 6, focus: "Mixed timed practice", tasks: ["2 mini tests", "Weak-skill drills", "Review score gap"] },
    { week: 7, focus: "Full-section stamina", tasks: ["Timed reading set", "Timed listening set", "Speaking under timer", "Writing under timer"] },
    { week: 8, focus: "Final review", tasks: ["Redo error log", "Memorize templates lightly", "Sleep and logistics plan", "One final mock test"] }
  ],
  textbookLikeTopics: [
    "campus services", "office hours", "course registration", "biology", "ecology", "astronomy", "archaeology",
    "psychology", "economics", "urban planning", "art history", "technology ethics", "climate science"
  ]
};

const QUESTIONS = {

  // ─── VOCABULARY ────────────────────────────────
  vocabulary: [
    {
      id: "v1", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "significant"',
      options: ["important", "dangerous", "simple", "temporary"],
      correctAnswer: "important",
      topic: "Academic vocabulary", difficulty: "easy"
    },
    {
      id: "v2", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "subsequent"',
      options: ["previous", "coming after", "unusual", "frequent"],
      correctAnswer: "coming after",
      topic: "Academic vocabulary", difficulty: "medium"
    },
    {
      id: "v3", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "controversial"',
      options: ["widely accepted", "causing disagreement", "difficult to find", "recently discovered"],
      correctAnswer: "causing disagreement",
      topic: "Academic vocabulary", difficulty: "medium"
    },
    {
      id: "v4", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "diminish"',
      options: ["to increase", "to remain the same", "to make smaller or less", "to duplicate"],
      correctAnswer: "to make smaller or less",
      topic: "Academic vocabulary", difficulty: "medium"
    },
    {
      id: "v5", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "articulate"',
      options: ["unable to speak", "to express clearly", "to confuse", "to delay"],
      correctAnswer: "to express clearly",
      topic: "Academic vocabulary", difficulty: "hard"
    },
    {
      id: "v6", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "empirical"',
      options: ["based on theory", "based on observation or evidence", "related to the emperor", "impossible to prove"],
      correctAnswer: "based on observation or evidence",
      topic: "Academic vocabulary", difficulty: "hard"
    },
    {
      id: "v7", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "mitigate"',
      options: ["to worsen", "to avoid completely", "to reduce the severity of", "to celebrate"],
      correctAnswer: "to reduce the severity of",
      topic: "Academic vocabulary", difficulty: "hard"
    },
    {
      id: "v8", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "coherent"',
      options: ["confused and unclear", "logically connected and consistent", "emotionally intense", "based on statistics"],
      correctAnswer: "logically connected and consistent",
      topic: "Academic vocabulary", difficulty: "medium"
    },
    {
      id: "v9", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "unprecedented"',
      options: ["happening regularly", "never having happened before", "widely expected", "scientifically proven"],
      correctAnswer: "never having happened before",
      topic: "Academic vocabulary", difficulty: "medium"
    },
    {
      id: "v10", type: "vocabulary", skill: "Vocabulary",
      question: 'Choose the correct meaning of "facilitate"',
      options: ["to prevent", "to require", "to make easier", "to measure"],
      correctAnswer: "to make easier",
      topic: "Academic vocabulary", difficulty: "easy"
    }
  ],

  // ─── READING ───────────────────────────────────
  reading: [
    {
      id: "r1", type: "reading", skill: "Reading",
      passage: "Many universities invest in digital libraries because they give students faster access to academic materials and reduce the need for physical storage. Digital collections can be updated instantly and accessed from anywhere in the world, making them far more flexible than traditional libraries.",
      question: "Why do universities invest in digital libraries?",
      options: [
        "To reduce the number of students",
        "To give students faster access to materials",
        "To make exams easier",
        "To replace teachers"
      ],
      correctAnswer: "To give students faster access to materials",
      topic: "Education", difficulty: "easy"
    },
    {
      id: "r2", type: "reading", skill: "Reading",
      passage: "Climate change is one of the most pressing challenges of the 21st century. Rising temperatures are linked to increased frequency of extreme weather events, including hurricanes, droughts, and floods. Scientists argue that immediate action is required to limit global warming to 1.5°C above pre-industrial levels.",
      question: "According to the passage, what do scientists argue is needed?",
      options: [
        "More research on hurricanes",
        "Increased use of fossil fuels",
        "Immediate action to limit global warming",
        "Building more flood barriers"
      ],
      correctAnswer: "Immediate action to limit global warming",
      topic: "Environment", difficulty: "easy"
    },
    {
      id: "r3", type: "reading", skill: "Reading",
      passage: "The human brain's neuroplasticity — its ability to reorganize itself by forming new neural connections — means that learning a new skill can physically change the structure of the brain. Studies show that musicians, for example, have enlarged areas in the motor cortex associated with hand movement.",
      question: "What does the passage say about musicians' brains?",
      options: [
        "They have smaller motor cortexes",
        "They learn faster than other people",
        "They have enlarged areas linked to hand movement",
        "They are less affected by neuroplasticity"
      ],
      correctAnswer: "They have enlarged areas linked to hand movement",
      topic: "Science", difficulty: "medium"
    },
    {
      id: "r4", type: "reading", skill: "Reading",
      passage: "The Industrial Revolution, which began in Britain in the late 18th century, transformed economies from agrarian to manufacturing-based systems. This shift led to rapid urbanization as people moved from rural areas to cities in search of factory work, fundamentally altering social structures.",
      question: "What was one major social effect of the Industrial Revolution?",
      options: [
        "People moved from cities to rural areas",
        "Agriculture became more important",
        "Social structures remained unchanged",
        "Rapid urbanization occurred"
      ],
      correctAnswer: "Rapid urbanization occurred",
      topic: "History", difficulty: "medium"
    },
    {
      id: "r5", type: "reading", skill: "Reading",
      passage: "Biodiversity refers to the variety of life on Earth, including ecosystems, species, and genetic diversity. High biodiversity makes ecosystems more resilient to environmental changes. When one species disappears, others can often fulfill its ecological role, preventing the collapse of the entire system.",
      question: "According to the passage, why is high biodiversity important?",
      options: [
        "It makes ecosystems produce more oxygen",
        "It allows ecosystems to be more resilient to change",
        "It increases the number of endangered species",
        "It prevents the formation of new ecosystems"
      ],
      correctAnswer: "It allows ecosystems to be more resilient to change",
      topic: "Biology", difficulty: "medium"
    },
    {
      id: "r6", type: "reading", skill: "Reading",
      passage: "Remote work, accelerated by the COVID-19 pandemic, has fundamentally changed workplace dynamics. Research suggests that while many employees report higher productivity at home, companies face challenges maintaining organizational culture and collaboration. A hybrid model — combining remote and in-office work — has emerged as a popular compromise.",
      question: "What does the passage suggest about hybrid work models?",
      options: [
        "They are opposed by most companies",
        "They completely eliminate in-office work",
        "They have emerged as a popular compromise",
        "They reduce employee productivity"
      ],
      correctAnswer: "They have emerged as a popular compromise",
      topic: "Business", difficulty: "medium"
    },
    {
      id: "r7", type: "reading", skill: "Reading",
      passage: "Artificial intelligence systems trained on large datasets can identify patterns invisible to human observers. However, such systems can also inherit and amplify biases present in training data. This raises ethical questions about accountability when AI-driven decisions affect employment, lending, or criminal justice.",
      question: "What concern does the passage raise about AI systems?",
      options: [
        "They are too expensive to develop",
        "They can inherit and amplify biases from training data",
        "They are unable to identify patterns",
        "They have replaced human workers completely"
      ],
      correctAnswer: "They can inherit and amplify biases from training data",
      topic: "Technology", difficulty: "hard"
    }
  ],

  // ─── LISTENING ─────────────────────────────────
  listening: [
    {
      id: "l1", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: The Benefits of Digital Libraries",
      lectureText: "Today we're going to talk about digital libraries and why universities around the world are investing in them. A digital library gives students 24/7 access to academic journals, textbooks, and research papers — without physically visiting a building. More importantly, digital collections can be updated instantly. A new research paper published today can be available to students tomorrow. Traditional libraries simply can't match that speed.",
      question: "What is the lecture mainly about?",
      options: [
        "The history of online education",
        "The benefits of digital libraries",
        "The cost of university housing",
        "The role of sports in education"
      ],
      correctAnswer: "The benefits of digital libraries",
      topic: "Education", difficulty: "easy"
    },
    {
      id: "l2", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: Sleep and Memory",
      lectureText: "Research in neuroscience has shown a strong connection between sleep and memory consolidation. During sleep, the brain replays experiences from the day, transferring information from short-term to long-term memory. Students who sleep at least 7-8 hours before an exam consistently perform better than those who stay up all night studying. Sleep deprivation, on the other hand, impairs attention, working memory, and the ability to process new information.",
      question: "According to the lecture, what happens during sleep?",
      options: [
        "The brain stops all activity",
        "The brain transfers information from short-term to long-term memory",
        "Students forget what they studied",
        "The brain prepares for physical exercise"
      ],
      correctAnswer: "The brain transfers information from short-term to long-term memory",
      topic: "Science", difficulty: "easy"
    },
    {
      id: "l3", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: Urban Heat Islands",
      lectureText: "Urban areas tend to be significantly warmer than surrounding rural areas — a phenomenon called the urban heat island effect. This happens because cities replace natural vegetation with buildings and pavement, which absorb and retain more heat than trees and soil. Additionally, waste heat from vehicles, air conditioners, and industry adds to the problem. Cities can reduce this effect by planting more trees, creating green roofs, and using reflective building materials.",
      question: "What is one cause of the urban heat island effect mentioned in the lecture?",
      options: [
        "Too many trees in cities",
        "Buildings and pavement absorbing more heat than vegetation",
        "Cold air from rural areas moving into cities",
        "Reduced industrial activity in urban areas"
      ],
      correctAnswer: "Buildings and pavement absorbing more heat than vegetation",
      topic: "Environment", difficulty: "medium"
    },
    {
      id: "l4", type: "listening", skill: "Listening",
      lectureTitle: "Dialogue: Study Group Discussion",
      lectureText: 'Student A: "I think we should divide the research paper into sections and each write one part." Student B: "That could work, but we need to make sure our writing styles are consistent." Student A: "Good point. Maybe we should each write our sections, then review each other\'s work before submitting." Student B: "I like that idea. It also means each person understands the whole paper, not just their section."',
      question: "What do the students finally decide to do?",
      options: [
        "Have one person write the entire paper",
        "Submit separate papers individually",
        "Each write a section, then review each other's work",
        "Ask the professor to divide the work"
      ],
      correctAnswer: "Each write a section, then review each other's work",
      topic: "Academic", difficulty: "medium"
    },
    {
      id: "l5", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: The Placebo Effect",
      lectureText: "The placebo effect occurs when a patient experiences real improvement after receiving a treatment with no active ingredients — simply because they believe the treatment will work. This is not imagined: physiological changes actually occur, including the release of endorphins. The placebo effect has important implications for medicine, raising questions about the role of expectation and belief in healing. Modern trials must use control groups with placebos to isolate the true effect of new medications.",
      question: "Why must clinical trials use placebo control groups?",
      options: [
        "To save money on real medications",
        "To isolate the true effect of new medications from the placebo effect",
        "Because patients prefer placebos to real medicine",
        "To test whether doctors can identify fake treatments"
      ],
      correctAnswer: "To isolate the true effect of new medications from the placebo effect",
      topic: "Medicine", difficulty: "hard"
    },
    {
      id: "l6", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: Microplastics in the Ocean",
      lectureText: "Microplastics — tiny plastic particles less than 5 millimeters in size — have been found in every ocean on Earth, even in the deepest trenches. They originate from the breakdown of larger plastic items, from synthetic clothing fibers, and from microbeads in cosmetics. Marine animals ingest them, and microplastics are now being detected in fish consumed by humans. Researchers are still studying the long-term health effects, but early findings suggest inflammation and hormonal disruption as potential risks.",
      question: "According to the lecture, what is one source of microplastics in the ocean?",
      options: [
        "Natural erosion of rocks",
        "Deep-sea volcanic activity",
        "Synthetic clothing fibers",
        "Ocean temperature changes"
      ],
      correctAnswer: "Synthetic clothing fibers",
      topic: "Environment", difficulty: "hard"
    }
  ],

  // ─── SPEAKING ──────────────────────────────────
  speaking: [
    {
      id: "s1", type: "speaking", skill: "Speaking",
      prompt: "Do you agree or disagree with the following statement: students should be allowed to choose all their university courses. Use specific reasons and examples to support your answer.",
      taskType: "Independent Speaking",
      timeLimit: 60,
      criteria: ["position", "reason", "example", "length", "linking_words"]
    },
    {
      id: "s2", type: "speaking", skill: "Speaking",
      prompt: "Some people prefer to live in a big city. Others prefer to live in a small town. Which do you prefer and why? Include specific details and examples in your response.",
      taskType: "Independent Speaking",
      timeLimit: 60,
      criteria: ["position", "reason", "example", "length", "linking_words"]
    },
    {
      id: "s3", type: "speaking", skill: "Speaking",
      prompt: "Describe an important decision you have made in your life. Explain why it was important and what the result was.",
      taskType: "Independent Speaking",
      timeLimit: 60,
      criteria: ["position", "reason", "example", "length", "linking_words"]
    },
    {
      id: "s4", type: "speaking", skill: "Speaking",
      prompt: "Do you think technology has made people's lives more complicated or simpler? Use specific reasons and examples to support your opinion.",
      taskType: "Independent Speaking",
      timeLimit: 60,
      criteria: ["position", "reason", "example", "length", "linking_words"]
    },
    {
      id: "s5", type: "speaking", skill: "Speaking",
      prompt: "Some universities require all students to take physical education classes. Do you think this is a good idea? Why or why not?",
      taskType: "Independent Speaking",
      timeLimit: 60,
      criteria: ["position", "reason", "example", "length", "linking_words"]
    }
  ],

  // ─── WRITING ───────────────────────────────────
  writing: [
    {
      id: "w1", type: "writing", skill: "Writing",
      question: 'Choose the best linking phrase:\n"The reading passage claims that online learning is less effective. ___, the lecture gives examples of successful online programs."',
      options: ["However", "Because", "Also", "For example"],
      correctAnswer: "However",
      topic: "Integrated writing", difficulty: "easy"
    },
    {
      id: "w2", type: "writing", skill: "Writing",
      question: 'Choose the best thesis statement for an essay arguing that social media benefits students:',
      options: [
        "Social media is used by many young people today.",
        "Although social media has some drawbacks, it benefits students by improving communication, providing learning resources, and building professional networks.",
        "Students should be careful when using social media.",
        "Social media companies earn billions of dollars."
      ],
      correctAnswer: "Although social media has some drawbacks, it benefits students by improving communication, providing learning resources, and building professional networks.",
      topic: "Thesis writing", difficulty: "medium"
    },
    {
      id: "w3", type: "writing", skill: "Writing",
      question: 'Choose the correct linking phrase:\n"The study found that exercise improves memory. ___, participants who exercised daily scored 30% higher on cognitive tests."',
      options: ["Nevertheless", "For instance", "Although", "Therefore"],
      correctAnswer: "For instance",
      topic: "Integrated writing", difficulty: "easy"
    },
    {
      id: "w4", type: "writing", skill: "Writing",
      question: 'Which sentence provides the strongest support for the argument that renewable energy should replace fossil fuels?',
      options: [
        "Fossil fuels have been used for a long time.",
        "Solar and wind energy produce no direct carbon emissions and are increasingly cost-competitive with coal and gas.",
        "Some people disagree about renewable energy.",
        "Energy is important for modern life."
      ],
      correctAnswer: "Solar and wind energy produce no direct carbon emissions and are increasingly cost-competitive with coal and gas.",
      topic: "Argument writing", difficulty: "medium"
    },
    {
      id: "w5", type: "writing", skill: "Writing",
      question: 'Choose the best conclusion for an essay about the benefits of reading:\n"In conclusion, ___"',
      options: [
        "reading is something many people do.",
        "I talked about reading in this essay.",
        "regular reading improves vocabulary, critical thinking, and empathy, making it one of the most valuable habits a student can develop.",
        "there are many different types of books available."
      ],
      correctAnswer: "regular reading improves vocabulary, critical thinking, and empathy, making it one of the most valuable habits a student can develop.",
      topic: "Conclusion writing", difficulty: "medium"
    },
    {
      id: "w6", type: "writing", skill: "Writing",
      question: 'Choose the correct linking phrase:\n"The professor disagrees with the reading passage. ___, the reading argues that deforestation has minimal economic impact, but the professor presents data showing it costs billions in lost ecosystem services."',
      options: ["Similarly", "Specifically", "In addition", "As a result"],
      correctAnswer: "Specifically",
      topic: "Integrated writing", difficulty: "hard"
    },
    {
      id: "w7", type: "writing", skill: "Writing",
      question: 'Which sentence best describes the relationship between a reading passage and a lecture in an integrated writing task?',
      options: [
        "The lecture always agrees with the reading.",
        "The reading and lecture are always on different topics.",
        "The lecture typically challenges, qualifies, or adds information to the reading passage's main claims.",
        "The lecture summarizes the reading passage in simpler language."
      ],
      correctAnswer: "The lecture typically challenges, qualifies, or adds information to the reading passage's main claims.",
      topic: "Test strategy", difficulty: "hard"
    }
  ]
};

// ─── MINI TEST COMPOSITION ──────────────────────
// 3 reading, 3 listening, 2 vocabulary, 1 speaking, 1 writing
const MINI_TEST_COMPOSITION = [
  { skill: "reading",    count: 3 },
  { skill: "listening",  count: 3 },
  { skill: "vocabulary", count: 2 },
  { skill: "speaking",   count: 1 },
  { skill: "writing",    count: 1 }
];

// Build flat mini-test question list
function buildMiniTest() {
  const list = [];
  MINI_TEST_COMPOSITION.forEach(group => {
    list.push(...pickQuestions(QUESTIONS[group.skill], group.count));
  });
  return list;
}

function pickQuestions(pool, count) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

// Skill meta (icons, colors, labels)
const SKILL_META = {
  reading:    { label: "Reading",    icon: "📖", color: "#4f6ef7", fillClass: "fill-reading" },
  listening:  { label: "Listening",  icon: "🎧", color: "#7c5cfc", fillClass: "fill-listening" },
  speaking:   { label: "Speaking",   icon: "🎤", color: "#22c55e", fillClass: "fill-speaking" },
  writing:    { label: "Writing",    icon: "✍️", color: "#f59e0b", fillClass: "fill-writing" },
  vocabulary: { label: "Vocabulary", icon: "📚", color: "#06b6d4", fillClass: "fill-vocabulary" }
};

const SECTION_TITLES = {
  dashboard:  "Dashboard",
  goal:       "Goal Setup",
  vocabulary: "Vocabulary Practice",
  reading:    "Reading Practice",
  listening:  "Listening Practice",
  speaking:   "Speaking Practice",
  writing:    "Writing Practice",
  minitest:   "Mini TOEFL Test",
  aiplan:     "AI Study Plan",
  analytics:  "Results & Analytics"
};

const EXTRA_QUESTIONS = {
  vocabulary: [
    { id: "v11", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "plausible"', options: ["reasonable or believable", "illegal", "extremely loud", "already proven"], correctAnswer: "reasonable or believable", topic: "Academic vocabulary", difficulty: "medium" },
    { id: "v12", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "allocate"', options: ["to remove completely", "to distribute for a purpose", "to argue angrily", "to discover by accident"], correctAnswer: "to distribute for a purpose", topic: "Academic vocabulary", difficulty: "medium" },
    { id: "v13", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "constraints"', options: ["limits or restrictions", "celebrations", "predictions", "instructions for cooking"], correctAnswer: "limits or restrictions", topic: "Academic vocabulary", difficulty: "medium" },
    { id: "v14", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "robust"', options: ["weak and temporary", "strong and effective", "hidden from view", "similar in size"], correctAnswer: "strong and effective", topic: "Academic vocabulary", difficulty: "medium" },
    { id: "v15", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "ambiguous"', options: ["clear and simple", "having more than one possible meaning", "physically dangerous", "required by law"], correctAnswer: "having more than one possible meaning", topic: "Academic vocabulary", difficulty: "medium" },
    { id: "v16", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "inherent"', options: ["temporary", "built-in or natural", "recently borrowed", "financially expensive"], correctAnswer: "built-in or natural", topic: "Academic vocabulary", difficulty: "hard" },
    { id: "v17", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "precipitate"', options: ["to cause something to happen suddenly", "to describe something slowly", "to repair a machine", "to copy exactly"], correctAnswer: "to cause something to happen suddenly", topic: "Academic vocabulary", difficulty: "hard" },
    { id: "v18", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "synthesize"', options: ["to combine parts into a whole", "to reject every detail", "to move underground", "to measure temperature"], correctAnswer: "to combine parts into a whole", topic: "Academic vocabulary", difficulty: "hard" },
    { id: "v19", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "offset"', options: ["to balance or compensate for", "to ignore a problem", "to start a fire", "to make something illegal"], correctAnswer: "to balance or compensate for", topic: "Academic vocabulary", difficulty: "medium" },
    { id: "v20", type: "vocabulary", skill: "Vocabulary", question: 'Choose the correct meaning of "profound"', options: ["deep or significant", "brief and unimportant", "easy to repair", "common in every case"], correctAnswer: "deep or significant", topic: "Academic vocabulary", difficulty: "medium" }
  ],
  reading: [
    {
      id: "r8", type: "reading", skill: "Reading",
      passage: "In archaeology, context is often as important as the object itself. A clay bowl found beside cooking stones tells a different story from the same bowl found in a burial chamber. Because artifacts gain meaning from their surroundings, careful documentation of location, depth, and nearby materials is essential during excavation.",
      question: "Why does the passage emphasize documentation during excavation?",
      options: ["It makes artifacts more valuable to collectors", "It preserves the context needed to interpret artifacts", "It allows archaeologists to avoid cleaning objects", "It proves that all objects had religious purposes"],
      correctAnswer: "It preserves the context needed to interpret artifacts",
      topic: "Archaeology", difficulty: "medium"
    },
    {
      id: "r9", type: "reading", skill: "Reading",
      passage: "Many desert plants survive by reducing water loss rather than by finding large water supplies. Some have waxy surfaces that limit evaporation, while others open their pores only at night when temperatures are lower. These adaptations allow plants to maintain internal moisture even during long dry periods.",
      question: "What is the main idea of the passage?",
      options: ["Desert plants mainly survive by storing large amounts of water in roots", "Desert plants use adaptations that reduce water loss", "Night temperatures damage desert plants", "All desert plants have the same survival strategy"],
      correctAnswer: "Desert plants use adaptations that reduce water loss",
      topic: "Biology", difficulty: "easy"
    },
    {
      id: "r10", type: "reading", skill: "Reading",
      passage: "Urban planners increasingly support mixed-use neighborhoods, where housing, shops, schools, and offices are located close together. Supporters argue that such design reduces car dependence and creates more active streets. Critics, however, warn that without affordable housing policies, these areas can become expensive and exclude lower-income residents.",
      question: "What concern do critics have about mixed-use neighborhoods?",
      options: ["They always increase car traffic", "They may become unaffordable without policy support", "They prevent shops from opening", "They make streets less active"],
      correctAnswer: "They may become unaffordable without policy support",
      topic: "Urban planning", difficulty: "medium"
    },
    {
      id: "r11", type: "reading", skill: "Reading",
      passage: "In economics, opportunity cost refers to what is given up when one choice is made over another. A student who spends an evening working at a part-time job earns money, but gives up time that could have been used for studying or rest. The concept helps explain why decisions involve trade-offs even when no money is directly spent.",
      question: "According to the passage, what does opportunity cost help explain?",
      options: ["Why all decisions require payment", "Why trade-offs exist even without direct spending", "Why students should not work part time", "Why rest has no economic value"],
      correctAnswer: "Why trade-offs exist even without direct spending",
      topic: "Economics", difficulty: "easy"
    },
    {
      id: "r12", type: "reading", skill: "Reading",
      passage: "Early photography changed painting in unexpected ways. Because cameras could capture realistic images quickly, some painters moved away from strict realism and began experimenting with color, light, and subjective experience. Rather than ending painting, photography pushed artists to reconsider what painting could uniquely express.",
      question: "What does the passage suggest about photography's effect on painting?",
      options: ["It made painting disappear immediately", "It encouraged painters to explore qualities beyond realism", "It forced painters to use only black and white", "It had no effect on artistic style"],
      correctAnswer: "It encouraged painters to explore qualities beyond realism",
      topic: "Art history", difficulty: "medium"
    },
    {
      id: "r13", type: "reading", skill: "Reading",
      passage: "Peer review is designed to improve academic research before publication. Reviewers evaluate whether a study's methods are sound, whether the evidence supports the claims, and whether the work contributes to the field. Although peer review cannot guarantee that every published article is correct, it creates an important filter against weak or unsupported claims.",
      question: "What limitation of peer review is mentioned?",
      options: ["It prevents researchers from publishing new ideas", "It cannot guarantee that every published article is correct", "It ignores research methods", "It only checks spelling and grammar"],
      correctAnswer: "It cannot guarantee that every published article is correct",
      topic: "Academic research", difficulty: "medium"
    },
    {
      id: "r14", type: "reading", skill: "Reading",
      passage: "Some animals use mimicry as a survival strategy. A harmless species may resemble a poisonous one, causing predators to avoid it. This resemblance does not need to be perfect; if a predator hesitates long enough for the prey to escape, the mimicry can still provide a significant advantage.",
      question: "Why can imperfect mimicry still be useful?",
      options: ["It helps predators find prey faster", "It may delay predators long enough for escape", "It makes harmless animals poisonous", "It prevents animals from changing color"],
      correctAnswer: "It may delay predators long enough for escape",
      topic: "Biology", difficulty: "medium"
    },
    {
      id: "r15", type: "reading", skill: "Reading",
      passage: "The invention of the printing press lowered the cost of producing books and made information easier to distribute. As texts became more available, literacy expanded among groups that previously had limited access to written material. This wider circulation of ideas contributed to scientific, religious, and political change.",
      question: "What was one effect of the printing press described in the passage?",
      options: ["It limited access to religious texts", "It made books more expensive", "It helped spread ideas more widely", "It ended scientific debate"],
      correctAnswer: "It helped spread ideas more widely",
      topic: "History", difficulty: "easy"
    }
  ],
  listening: [
    {
      id: "l7", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: Coral Reef Bleaching",
      lectureText: "Coral bleaching happens when corals lose the algae that live in their tissues. These algae provide much of the coral's energy and also give reefs their bright colors. When water temperatures remain unusually high, corals become stressed and expel the algae. If cooler conditions return quickly, some corals recover. But repeated bleaching events can weaken reef ecosystems for years.",
      question: "What causes corals to expel algae according to the lecture?",
      options: ["Unusually high water temperatures", "Too much shade from seaweed", "A lack of ocean salt", "The migration of fish"],
      correctAnswer: "Unusually high water temperatures",
      topic: "Environment", difficulty: "medium"
    },
    {
      id: "l8", type: "listening", skill: "Listening",
      lectureTitle: "Conversation: Office Hours",
      lectureText: "Student: Professor, I understand the article, but I am not sure how to connect it to my paper topic. Professor: Your topic is urban transportation, right? Student: Yes, especially bike lanes. Professor: Then use the article's idea of public space. Ask whether bike lanes change how people share streets. Student: So I should not summarize the article, but apply its concept? Professor: Exactly.",
      question: "What advice does the professor give the student?",
      options: ["Change the topic completely", "Apply the article's concept to the paper topic", "Remove bike lanes from the paper", "Only summarize the article"],
      correctAnswer: "Apply the article's concept to the paper topic",
      topic: "Campus conversation", difficulty: "medium"
    },
    {
      id: "l9", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: Working Memory",
      lectureText: "Working memory is the mental system we use to hold and manipulate information for short periods. For example, when you calculate a tip without writing anything down, you are using working memory. It is limited, which is why long instructions can be difficult to follow. Teachers often reduce cognitive load by breaking complex tasks into smaller steps.",
      question: "Why can long instructions be difficult to follow?",
      options: ["Working memory has limited capacity", "Students dislike mathematics", "Teachers speak too quietly", "Written notes prevent understanding"],
      correctAnswer: "Working memory has limited capacity",
      topic: "Psychology", difficulty: "medium"
    },
    {
      id: "l10", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: Renewable Energy Storage",
      lectureText: "Solar and wind power are variable: they do not produce electricity at the same level all day. This creates a storage problem. Batteries can store excess power for later use, but large-scale storage remains expensive. Some regions also use pumped hydro storage, moving water uphill when electricity is abundant and releasing it downhill through turbines when demand rises.",
      question: "What problem does energy storage help solve?",
      options: ["The variable production of solar and wind power", "The lack of sunlight at the equator", "The need to eliminate all turbines", "The cost of building universities"],
      correctAnswer: "The variable production of solar and wind power",
      topic: "Technology", difficulty: "medium"
    },
    {
      id: "l11", type: "listening", skill: "Listening",
      lectureTitle: "Conversation: Library Account",
      lectureText: "Student: I tried to borrow an e-book, but my account says I have a hold. Librarian: Let me check. It looks like a laptop charger was returned late last semester. Student: I returned it, but maybe after the deadline. Librarian: If you pay the small late fee, the hold will disappear immediately. Student: Great, I need the e-book for class tonight.",
      question: "Why is there a hold on the student's account?",
      options: ["A late fee from a borrowed charger", "An unpaid tuition bill", "A missing textbook", "A cancelled course registration"],
      correctAnswer: "A late fee from a borrowed charger",
      topic: "Campus services", difficulty: "easy"
    },
    {
      id: "l12", type: "listening", skill: "Listening",
      lectureTitle: "Lecture: Roman Concrete",
      lectureText: "Roman concrete has attracted attention because some ancient structures remain stable after nearly two thousand years. Researchers believe volcanic ash played a key role. When mixed with lime and seawater, the ash helped form minerals that strengthened the material over time. Modern engineers study this process because it may inspire more durable and sustainable building materials.",
      question: "Why are modern engineers interested in Roman concrete?",
      options: ["It may inspire durable and sustainable materials", "It was made entirely from wood", "It dissolved quickly in seawater", "It required no minerals"],
      correctAnswer: "It may inspire durable and sustainable materials",
      topic: "Engineering", difficulty: "hard"
    }
  ],
  speaking: [
    { id: "s6", type: "speaking", skill: "Speaking", prompt: "Some students prefer taking notes by hand, while others prefer using a laptop. Which method do you think is better for learning, and why?", taskType: "Independent Speaking", timeLimit: 60, criteria: ["position", "reason", "example", "length", "linking_words"] },
    { id: "s7", type: "speaking", skill: "Speaking", prompt: "Do you agree or disagree that universities should require students to complete internships before graduation? Use reasons and examples.", taskType: "Independent Speaking", timeLimit: 60, criteria: ["position", "reason", "example", "length", "linking_words"] },
    { id: "s8", type: "speaking", skill: "Speaking", prompt: "Some people learn better in groups, while others learn better alone. Which do you prefer and why?", taskType: "Independent Speaking", timeLimit: 60, criteria: ["position", "reason", "example", "length", "linking_words"] },
    { id: "s9", type: "speaking", skill: "Speaking", prompt: "Describe a skill that is important for university success. Explain why this skill matters.", taskType: "Independent Speaking", timeLimit: 60, criteria: ["position", "reason", "example", "length", "linking_words"] },
    { id: "s10", type: "speaking", skill: "Speaking", prompt: "Do you think students should study subjects outside their major? Explain your opinion with details.", taskType: "Independent Speaking", timeLimit: 60, criteria: ["position", "reason", "example", "length", "linking_words"] },
    { id: "s11", type: "speaking", skill: "Speaking", prompt: "Some people prefer strict daily schedules, while others prefer flexible plans. Which approach is better for you?", taskType: "Independent Speaking", timeLimit: 60, criteria: ["position", "reason", "example", "length", "linking_words"] },
    { id: "s12", type: "speaking", skill: "Speaking", prompt: "Do you agree or disagree that online courses can be as effective as in-person courses? Give specific reasons.", taskType: "Independent Speaking", timeLimit: 60, criteria: ["position", "reason", "example", "length", "linking_words"] }
  ],
  writing: [
    { id: "w8", type: "writing", skill: "Writing", question: 'Choose the strongest topic sentence for a paragraph about campus jobs:', options: ["Many students have jobs.", "Campus jobs can help students develop time management skills because they must balance work hours with academic deadlines.", "Jobs are sometimes difficult.", "The campus is large and has many buildings."], correctAnswer: "Campus jobs can help students develop time management skills because they must balance work hours with academic deadlines.", topic: "Paragraph writing", difficulty: "medium" },
    { id: "w9", type: "writing", skill: "Writing", question: 'Choose the best transition:\n"The lecture challenges the reading passage. ___, it argues that the proposed solution would be too expensive to implement."', options: ["For example", "In contrast", "After all", "Meanwhile"], correctAnswer: "For example", topic: "Integrated writing", difficulty: "medium" },
    { id: "w10", type: "writing", skill: "Writing", question: "Which response best supports an academic discussion post about public transportation?", options: ["I agree because buses are good.", "I support expanding public transportation because it reduces traffic congestion and gives low-income residents more reliable access to jobs and schools.", "Transportation is a thing people use every day.", "Cars are popular in many countries."], correctAnswer: "I support expanding public transportation because it reduces traffic congestion and gives low-income residents more reliable access to jobs and schools.", topic: "Academic discussion", difficulty: "medium" },
    { id: "w11", type: "writing", skill: "Writing", question: 'Choose the best paraphrase of "The policy produced unintended consequences.":', options: ["The policy had effects that were not originally expected.", "The policy was written in a different language.", "The policy was impossible to understand.", "The policy was cancelled before it began."], correctAnswer: "The policy had effects that were not originally expected.", topic: "Paraphrasing", difficulty: "easy" },
    { id: "w12", type: "writing", skill: "Writing", question: "Which sentence is most appropriate for integrated writing?", options: ["The professor is wrong because I personally disagree.", "The lecture casts doubt on the reading by explaining that the evidence is incomplete.", "I have never studied this topic before.", "The reading is boring but the lecture is interesting."], correctAnswer: "The lecture casts doubt on the reading by explaining that the evidence is incomplete.", topic: "Integrated writing", difficulty: "medium" },
    { id: "w13", type: "writing", skill: "Writing", question: "Which sentence best avoids vague language?", options: ["Technology is very good for many things.", "Digital note-taking can improve review efficiency because students can search, organize, and revise notes quickly.", "Stuff like apps helps people.", "There are many opinions about computers."], correctAnswer: "Digital note-taking can improve review efficiency because students can search, organize, and revise notes quickly.", topic: "Academic style", difficulty: "medium" },
    { id: "w14", type: "writing", skill: "Writing", question: 'Choose the best connector:\n"The reading claims that the museum expansion will attract tourists. ___, the professor argues that construction noise may drive visitors away during the first year."', options: ["However", "Similarly", "For this reason", "In addition"], correctAnswer: "However", topic: "Integrated writing", difficulty: "easy" },
    { id: "w15", type: "writing", skill: "Writing", question: "Which sentence gives the clearest concession?", options: ["No one has any reason to disagree.", "Although online courses lack some face-to-face interaction, they can still be effective when instructors provide clear feedback and discussion opportunities.", "Online courses are perfect in every way.", "Some people use computers."], correctAnswer: "Although online courses lack some face-to-face interaction, they can still be effective when instructors provide clear feedback and discussion opportunities.", topic: "Argument writing", difficulty: "hard" }
  ]
};

Object.keys(EXTRA_QUESTIONS).forEach(skill => {
  QUESTIONS[skill].push(...EXTRA_QUESTIONS[skill]);
});
