/**
 * Gemini AI Study Session Service
 * Generates bite-sized, modular micro-learning sessions using Gemini API.
 * Avoids overwhelming text dumps & exhausting quiz barrages by breaking
 * lessons into 3 crisp micro-parts + 1 single optional check.
 */

const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';

// Curated high-yield micro-lessons for instant fallback
const CURATED_MICRO_SESSIONS = {
  trigonometry: {
    title: 'Trigonometry Foundations',
    topic: 'Right Triangles & Side Ratios',
    estimatedMinutes: 3,
    summary: 'Master the fundamental right-triangle side ratios and SOH-CAH-TOA in 3 minutes.',
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: 'The Right-Triangle Relationship',
        content:
          'Trigonometry connects angles to side lengths. Every right-angled triangle keeps fixed side ratios regardless of how large or small you scale it.',
        takeaway: 'Angles uniquely fix side proportions.'
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: 'SOH • CAH • TOA',
        formula: 'sin(θ) = Opp/Hyp  |  cos(θ) = Adj/Hyp  |  tan(θ) = Opp/Adj',
        content:
          'Sine compares opposite to hypotenuse. Cosine compares adjacent to hypotenuse. Tangent compares opposite to adjacent.',
        memoryHook: 'Some Old Horses Can Always Hear Their Owners Approach.'
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Finding Height with Tangent',
        content:
          'Standing 20m from a tree at a 45° angle: tan(45°) = height / 20m. Since tan(45°) = 1, the height is exactly 20 meters!',
        highlight: 'height = 20m × tan(45°) = 20m'
      }
    ],
    quickCheck: {
      question:
        'In a right triangle with an angle of 30°, if the hypotenuse is 10, what is the opposite side? (sin(30°) = 0.5)',
      options: ['5', '10', '7.5', '2.5'],
      correctIndex: 0,
      explanation: 'Since sin(30°) = Opposite / Hypotenuse = 0.5, Opposite = 10 × 0.5 = 5.'
    }
  },
  mathematics: {
    title: 'Algebra & Quadratic Foundations',
    topic: 'The Quadratic Formula & Roots',
    estimatedMinutes: 3,
    summary: 'Understand the discriminant and solve any quadratic equation in 3 minutes.',
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: 'What Roots Actually Mean',
        content:
          'The roots of a quadratic are the exact x-coordinates where its parabola crosses the horizontal x-axis.',
        takeaway: 'Roots = points where y = 0.'
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: 'The Quadratic Formula & Discriminant',
        formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
        content:
          'The discriminant Δ = b² - 4ac tells you everything: if Δ > 0 you get two real roots; if Δ = 0 you get one root; if Δ < 0 roots are complex.',
        memoryHook: 'Calculate b² - 4ac first before doing the rest of the formula.'
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Quick Discriminant Test',
        content:
          'For x² - 4x + 4 = 0: a=1, b=-4, c=4. Discriminant = (-4)² - 4(1)(4) = 16 - 16 = 0. Exactly one real root at x = 2!',
        highlight: 'Δ = 0 → 1 unique real solution'
      }
    ],
    quickCheck: {
      question: 'What does a discriminant of b² - 4ac > 0 indicate?',
      options: [
        'Two distinct real roots',
        'Exactly one real root',
        'No real roots',
        'The equation is linear'
      ],
      correctIndex: 0,
      explanation: 'A positive discriminant produces two distinct real values from the ± square root.'
    }
  },
  science: {
    title: 'Cellular Respiration & ATP',
    topic: 'Cellular Energy Production',
    estimatedMinutes: 3,
    summary: 'A clear mental model of how living cells convert glucose into ATP currency.',
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: 'ATP is Cellular Cash',
        content:
          'Cells cannot spend glucose directly. They break glucose bonds to charge up ATP molecules, which store energy like tiny biological batteries.',
        takeaway: 'ATP stores transferable energy in phosphate bonds.'
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: 'Overall Respiration Equation',
        formula: 'C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + ~30-32 ATP',
        content:
          'Glucose reacts with oxygen to yield carbon dioxide, water, and roughly 30 to 32 ATP molecules.',
        memoryHook: 'Input: sugar + air → Output: carbon dioxide + water + usable energy.'
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Mitochondrial Chemiosmosis',
        content:
          'The electron transport chain pumps protons across the inner membrane, creating a dam-like gradient that powers ATP synthase as protons flow back.',
        highlight: 'Proton gradient drives ATP synthase rotor'
      }
    ],
    quickCheck: {
      question: 'Where does glycolysis occur in a eukaryotic cell?',
      options: ['Cytoplasm (cytosol)', 'Mitochondrial matrix', 'Inner membrane', 'Nucleus'],
      correctIndex: 0,
      explanation: 'Glycolysis takes place in the cytosol and does not require oxygen.'
    }
  },
  english: {
    title: 'Rhetorical Appeals',
    topic: 'Ethos, Pathos, and Logos',
    estimatedMinutes: 3,
    summary: 'Master Aristotle’s three modes of persuasion in under 3 minutes.',
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: 'The Persuasion Triangle',
        content:
          'Every convincing argument balances three pillars: credibility of the speaker, emotional connection to the listener, and evidence-backed logic.',
        takeaway: 'Credibility, Emotion, Logic.'
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: 'Ethos • Pathos • Logos',
        formula: 'Ethos = Authority  |  Pathos = Emotion  |  Logos = Reason',
        content:
          'Ethos relies on reputation and credentials. Pathos taps sympathy, hope, or urgency. Logos uses statistics, facts, and deductions.',
        memoryHook: 'Ethos = Ethics/Expertise, Pathos = Passion/Pain, Logos = Logic/Layout.'
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Identifying Appeals',
        content:
          '“As a doctor with 20 years in cardiology (Ethos), I urge you to exercise before heart disease hurts your family (Pathos), as studies show a 40% risk reduction (Logos).”',
        highlight: 'A masterclass argument intertwining all three appeals.'
      }
    ],
    quickCheck: {
      question: 'Citing peer-reviewed statistics in a research paper is an example of which appeal?',
      options: ['Logos', 'Pathos', 'Ethos exclusively', 'Hyperbole'],
      correctIndex: 0,
      explanation: 'Logos uses verifiable data, facts, and rational deduction to prove a claim.'
    }
  }
};

/**
 * Request dynamic bite-sized AI micro-lesson from Gemini
 */
export async function generateStudySession({
  subject = 'Mathematics',
  topic = '',
  goal = 'upcoming exam',
  time = '3min',
  userName = 'Student',
  syllabusName = null
}) {
  const cleanSubject = subject.trim() || 'Mathematics';
  const cleanTopic = topic.trim() || cleanSubject;

  const prompt = `You are an elite, modern educational tutor in the Scholarise mobile app.
Generate a high-impact, BITE-SIZED micro-learning module for:
- Student: ${userName}
- Subject: ${cleanSubject}
- Topic: ${cleanTopic}
- Goal: ${goal}
${syllabusName ? `- Syllabus Reference: ${syllabusName}` : ''}

CRITICAL ANTI-OVERWHELM RULES:
1. Do NOT write long paragraphs or walls of text. Maximum 2 concise sentences per micro-part.
2. Break into exactly 3 micro-parts:
   - Part 1: Core Intuition (what is this concept in plain English)
   - Part 2: Key Rule or Formula (clean formula + 1 sentence on why it works + short memory hook)
   - Part 3: Quick Real-World Example (a 15-second clear practical calculation or scenario)
3. Include ONE single multiple-choice comprehension check (NOT a long quiz, just 1 single clear question with 4 options, correctIndex, and 1-sentence explanation).

You MUST return a STRICT VALID JSON object (no markdown fences, raw JSON only) with this schema:
{
  "title": "Short Punchy Title (e.g. Trigonometry: SOH-CAH-TOA)",
  "topic": "${cleanTopic}",
  "estimatedMinutes": 3,
  "summary": "1 concise sentence overview.",
  "microParts": [
    {
      "partNumber": 1,
      "partLabel": "Core Intuition",
      "title": "Short Concept Subtitle",
      "content": "Max 2 punchy sentences.",
      "takeaway": "One-line key takeaway."
    },
    {
      "partNumber": 2,
      "partLabel": "Key Rule / Formula",
      "title": "Rule Name",
      "formula": "e.g. sin(θ) = Opp / Hyp",
      "content": "1 sentence explanation.",
      "memoryHook": "Short memorable mnemonic."
    },
    {
      "partNumber": 3,
      "partLabel": "30-Second Example",
      "title": "Applied Calculation",
      "content": "A concrete 15-second scenario.",
      "highlight": "key number or takeaway"
    }
  ],
  "quickCheck": {
    "question": "One focused question testing the concept?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "1-sentence explanation of why it is correct."
  }
}`;

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ];

  if (GEMINI_API_KEY) {
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
                temperature: 0.6,
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

        const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.title && Array.isArray(parsed.microParts) && parsed.microParts.length > 0) {
          // Adapt for any legacy components
          const keyConcepts = parsed.microParts.map((mp) => ({
            concept: mp.title,
            explanation: mp.content
          }));
          const quizQuestions = parsed.quickCheck ? [parsed.quickCheck] : [];

          return {
            ...parsed,
            keyConcepts,
            quizQuestions,
            source: `Gemini (${model})`,
            subject: cleanSubject,
            topic: cleanTopic
          };
        }
      } catch (err) {
        console.warn(`Error generating session with ${model}:`, err);
      }
    }
  }

  // Fallback to curated packs if API unavailable or rate-limited
  console.log('Using curated backup curriculum for', cleanTopic || cleanSubject);
  const normalizedKey = cleanTopic.toLowerCase().includes('trig')
    ? 'trigonometry'
    : cleanSubject.toLowerCase().includes('sci')
    ? 'science'
    : cleanSubject.toLowerCase().includes('eng')
    ? 'english'
    : 'mathematics';

  const pack = CURATED_MICRO_SESSIONS[normalizedKey] || CURATED_MICRO_SESSIONS.mathematics;
  const keyConcepts = pack.microParts.map((mp) => ({
    concept: mp.title,
    explanation: mp.content
  }));
  const quizQuestions = pack.quickCheck ? [pack.quickCheck] : [];

  return {
    ...pack,
    keyConcepts,
    quizQuestions,
    source: 'Scholarise Core Curriculum',
    subject: cleanSubject,
    topic: cleanTopic
  };
}
