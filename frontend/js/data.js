// ═══════════════════════════════════════════════
//  AI TOEFL Coach — Question Bank
// ═══════════════════════════════════════════════

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
  { skill: "reading",    ids: ["r1", "r2", "r3"] },
  { skill: "listening",  ids: ["l1", "l2", "l3"] },
  { skill: "vocabulary", ids: ["v1", "v2"] },
  { skill: "speaking",   ids: ["s1"] },
  { skill: "writing",    ids: ["w1"] }
];

// Build flat mini-test question list
function buildMiniTest() {
  const list = [];
  MINI_TEST_COMPOSITION.forEach(group => {
    group.ids.forEach(id => {
      const q = QUESTIONS[group.skill].find(q => q.id === id);
      if (q) list.push(q);
    });
  });
  return list;
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
