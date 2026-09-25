/**
 * Gemini AI Study Session Service
 * Generates personalized, interactive study material, key concepts,
 * and quiz questions using the Gemini API.
 */

const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';

// Fallback high-quality curricula in case of offline/network limits
const CURATED_STUDY_PACKS = {
  Mathematics: {
    title: 'Algebra & Quadratic Foundations',
    topic: 'Factoring, Vertex Form & Discriminant Analysis',
    estimatedMinutes: 15,
    summary: 'Master the core methods to solve and analyze quadratic equations with confidence.',
    keyConcepts: [
      {
        concept: 'The Quadratic Formula',
        explanation: 'x = (-b ± √(b² - 4ac)) / (2a). The term b² - 4ac (the discriminant) determines the number of real roots.'
      },
      {
        concept: 'Vertex Form',
        explanation: 'y = a(x - h)² + k. The vertex is at point (h, k), and the axis of symmetry is the vertical line x = h.'
      },
      {
        concept: 'Factoring by Grouping',
        explanation: 'For ax² + bx + c, find two numbers that multiply to a*c and sum to b, then split the middle term.'
      }
    ],
    quizQuestions: [
      {
        question: 'What does a discriminant value of b² - 4ac > 0 indicate for a quadratic equation?',
        options: [
          'Two distinct real solutions',
          'Exactly one real repeated solution',
          'No real solutions (two complex roots)',
          'The equation is not quadratic'
        ],
        correctIndex: 0,
        explanation: 'When the discriminant is strictly positive, the square root yields two distinct real numbers, resulting in two real roots.'
      },
      {
        question: 'What is the vertex of the parabola given by y = 2(x - 3)² + 5?',
        options: ['(3, 5)', '(-3, 5)', '(3, -5)', '(2, 5)'],
        correctIndex: 0,
        explanation: 'In vertex form y = a(x - h)² + k, (h, k) is the vertex. Here h = 3 and k = 5, so the vertex is (3, 5).'
      },
      {
        question: 'Which of the following is the factored form of x² - 5x + 6?',
        options: ['(x - 2)(x - 3)', '(x - 1)(x - 6)', '(x + 2)(x + 3)', '(x + 1)(x - 6)'],
        correctIndex: 0,
        explanation: 'We look for two numbers that multiply to +6 and add to -5. These numbers are -2 and -3: (x - 2)(x - 3) = x² - 5x + 6.'
      }
    ],
    actionableTakeaways: [
      'Always calculate the discriminant first to know what type of roots to expect.',
      'Check if a quadratic is a perfect square trinomial before applying the full formula.'
    ]
  },
  Science: {
    title: 'Cellular Respiration & Energy Flow',
    topic: 'Glycolysis, Krebs Cycle & ATP Synthesis',
    estimatedMinutes: 15,
    summary: 'Explore how cells convert biochemical energy from nutrients into ATP.',
    keyConcepts: [
      {
        concept: 'ATP Structure & Role',
        explanation: 'Adenosine triphosphate stores energy in high-energy phosphoanhydride bonds between phosphate groups.'
      },
      {
        concept: 'Mitochondrial Membrane Gradient',
        explanation: 'The electron transport chain pumps protons into the intermembrane space, powering ATP synthase through chemiosmosis.'
      },
      {
        concept: 'Aerobic vs. Anaerobic Pathways',
        explanation: 'In the absence of oxygen, cells undergo fermentation (lactic acid or ethanol) to regenerate NAD+ for glycolysis.'
      }
    ],
    quizQuestions: [
      {
        question: 'Where does glycolysis take place within a eukaryotic cell?',
        options: ['Cytoplasm (cytosol)', 'Mitochondrial matrix', 'Inner mitochondrial membrane', 'Nucleus'],
        correctIndex: 0,
        explanation: 'Glycolysis occurs in the cytosol outside mitochondria and does not require oxygen.'
      },
      {
        question: 'Which molecule serves as the final electron acceptor in aerobic respiration?',
        options: ['Oxygen (O₂)', 'Carbon dioxide (CO₂)', 'Glucose', 'Pyruvate'],
        correctIndex: 0,
        explanation: 'Oxygen accepts electrons at complex IV of the electron transport chain, forming H₂O.'
      },
      {
        question: 'What is the net gain of ATP molecules produced directly from one molecule of glucose during glycolysis?',
        options: ['2 ATP', '4 ATP', '32 ATP', '0 ATP'],
        correctIndex: 0,
        explanation: 'Glycolysis consumes 2 ATP in its investment phase and yields 4 ATP, giving a net yield of 2 ATP.'
      }
    ],
    actionableTakeaways: [
      'Trace carbon atoms from glucose (6C) through pyruvate (3C) to acetyl-CoA (2C).',
      'Remember that proton gradient accumulation drives ATP synthase rotor rotation.'
    ]
  },
  English: {
    title: 'Rhetorical Analysis & Persuasive Devices',
    topic: 'Ethos, Pathos, Logos & Stylistic Syntax',
    estimatedMinutes: 15,
    summary: 'Analyze how authors construct persuasive arguments and evaluate rhetorical devices.',
    keyConcepts: [
      {
        concept: 'The Aristotelian Appeals',
        explanation: 'Ethos establishes authority/credibility; Pathos appeals to empathy/emotion; Logos appeals to logic and evidence.'
      },
      {
        concept: 'Syntax & Parallelism',
        explanation: 'Using components in a sentence that are grammatically the same, or similar in their construction and sound.'
      },
      {
        concept: 'Tone vs. Mood',
        explanation: 'Tone is the speaker or author\'s attitude toward the topic; mood is the emotional atmosphere evoked in the reader.'
      }
    ],
    quizQuestions: [
      {
        question: 'Citing peer-reviewed medical journals in an essay on public health is an appeal to which rhetorical mode?',
        options: ['Logos & Ethos', 'Pathos exclusively', 'Satire', 'Anaphora'],
        correctIndex: 0,
        explanation: 'Peer-reviewed studies provide verifiable rational data (Logos) while leveraging recognized institutional authority (Ethos).'
      },
      {
        question: 'What literary device is present in the phrase: "Ask not what your country can do for you — ask what you can do for your country"?',
        options: ['Chiasmus / Antithesis', 'Hyperbole', 'Synecdoche', 'Litotes'],
        correctIndex: 0,
        explanation: 'This inverts sentence structure in corresponding clauses to create contrasting balance.'
      }
    ],
    actionableTakeaways: [
      'Always identify who the intended audience is before evaluating rhetorical effectiveness.',
      'Look for subtle diction shifts when the speaker transitions between emotional and logical appeals.'
    ]
  }
};

/**
 * Request dynamic AI study module from Gemini
 */
export async function generateStudySession({
  subject = 'Mathematics',
  goal = 'upcoming exam',
  time = '15min',
  userName = 'Student',
  syllabusName = null
}) {
  const cleanSubject = subject.trim() || 'General Studies';
  const durationNumber = parseInt(time.replace(/\D/g, ''), 10) || 15;

  const prompt = `You are a world-class educational AI tutor in the Scholarise mobile app.
Generate a structured, highly engaging ${durationNumber}-minute study session for:
- Student: ${userName}
- Subject: ${cleanSubject}
- Goal: ${goal}
${syllabusName ? `- Syllabus file reference: ${syllabusName}` : ''}

You MUST return a VALID JSON object (and nothing else, no markdown codeblocks, raw JSON only) with this schema:
{
  "title": "Short punchy session title (e.g. Newton's Laws & Force Equilibrium)",
  "topic": "Specific subtopic name",
  "estimatedMinutes": ${durationNumber},
  "summary": "2-sentence inspiring overview of what will be learned.",
  "keyConcepts": [
    {
      "concept": "Concept 1 Name",
      "explanation": "Clear, concise 1-2 sentence breakdown."
    },
    {
      "concept": "Concept 2 Name",
      "explanation": "Clear, concise 1-2 sentence breakdown."
    },
    {
      "concept": "Concept 3 Name",
      "explanation": "Clear, concise 1-2 sentence breakdown."
    }
  ],
  "quizQuestions": [
    {
      "question": "Clear multiple-choice practice question testing comprehension?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct."
    },
    {
      "question": "Second multiple-choice practice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Why this answer is correct."
    },
    {
      "question": "Third multiple-choice practice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Why this answer is correct."
    }
  ],
  "actionableTakeaways": [
    "Practical study tip 1",
    "Practical study tip 2"
  ]
}`;

  // Try Gemini models in order of speed and stability
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ];

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95
            }
          })
        }
      );

      if (!response.ok) {
        console.warn(`Gemini model ${model} responded with HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Extract JSON from potential code fences
      const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.title && Array.isArray(parsed.keyConcepts) && Array.isArray(parsed.quizQuestions)) {
        return {
          ...parsed,
          source: `Gemini (${model})`,
          subject: cleanSubject
        };
      }
    } catch (err) {
      console.warn(`Error generating session with ${model}:`, err);
    }
  }

  // Graceful fallback to curated curriculum if API offline or rate-limited
  console.log('Using curated backup curriculum for', cleanSubject);
  const fallback =
    CURATED_STUDY_PACKS[cleanSubject] ||
    CURATED_STUDY_PACKS['Mathematics'];

  return {
    ...fallback,
    source: 'Scholarise Core Curriculum',
    subject: cleanSubject
  };
}
