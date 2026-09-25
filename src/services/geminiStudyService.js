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
  },
  memory_management: {
    title: 'Memory Management: Stack vs Heap',
    topic: 'Memory Allocation & Lifecycles',
    estimatedMinutes: 3,
    summary: 'Master how programs allocate, access, and free system memory in 3 minutes.',
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: 'Stack vs. Heap Memory',
        content:
          'The Stack handles fast, short-lived function variables in order. The Heap handles dynamic, arbitrarily sized objects that outlive single function calls.',
        takeaway: 'Stack is fast and automatic; Heap is flexible and persistent.'
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: 'LIFO Execution vs Reference Pointers',
        formula: 'Stack: LIFO frames (fast) | Heap: Dynamic chunks + pointer references',
        content:
          'Primitives and function pointers live on the stack; complex objects reside on the heap with their memory addresses stored on the stack.',
        memoryHook: 'Stack for scope, Heap for heap-loads of dynamic data.'
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Variable Allocation in Memory',
        content:
          'Running int count = 42 pushes 4 bytes directly onto the stack. Instantiating new User() allocates a block on the heap and returns an address pointer.',
        highlight: 'Pointer on stack → Object body on heap'
      }
    ],
    quickCheck: {
      question: 'What happens to stack-allocated variables when a function finishes executing?',
      options: [
        'They are automatically popped and freed immediately',
        'They remain indefinitely until manual garbage collection runs',
        'They are copied over to heap memory permanently',
        'They cause a memory leak if not explicitly freed'
      ],
      correctIndex: 0,
      explanation: 'Stack memory operates as LIFO; returning from a function automatically deallocates the top stack frame.'
    }
  },
  computer_science: {
    title: 'Data Structures & Big-O',
    topic: 'Time Complexity & Algorithmic Efficiency',
    estimatedMinutes: 3,
    summary: 'A fast mental model for evaluating code performance and scalability.',
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: 'Big-O Measures Growth Rate',
        content:
          'Big-O notation describes how execution time or memory requirements scale as input size (N) grows towards infinity.',
        takeaway: 'It measures worst-case scaling, not clock milliseconds.'
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: 'The Efficiency Hierarchy',
        formula: 'O(1) < O(log N) < O(N) < O(N log N) < O(N²)',
        content:
          'Constant and logarithmic lookups scale effortlessly; quadratic nested loops quickly become unviable at large data volumes.',
        memoryHook: 'Drop constants, ignore lower-order terms, focus on dominant term.'
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Array Index vs Linear Search',
        content:
          'Accessing array[5] takes O(1) instant memory math. Searching an unsorted list of 1,000,000 items requires up to 1,000,000 comparisons: O(N).',
        highlight: 'Direct index = O(1) | Unsorted search = O(N)'
      }
    ],
    quickCheck: {
      question: 'What is the time complexity of looking up a value by key in a well-balanced hash map?',
      options: ['O(1) on average', 'O(N²)', 'O(log N) worst-case always', 'O(N log N)'],
      correctIndex: 0,
      explanation: 'Hash maps compute a hash of the key to index directly into an array bucket in O(1) average time.'
    }
  },
  physics: {
    title: 'Newton’s Laws & Motion',
    topic: 'Force, Mass, and Acceleration',
    estimatedMinutes: 3,
    summary: 'Understand the mathematical rules governing everyday motion in 3 minutes.',
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: 'Inertia and Force',
        content:
          'Objects resist changes to their velocity. An unbalanced net external force is required to accelerate or decelerate any mass.',
        takeaway: 'Acceleration is the result of unbalanced net force.'
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: 'Newton’s Second Law',
        formula: 'F_net = m · a  (Force = mass × acceleration)',
        content:
          'Force (in Newtons) directly scales with mass and acceleration. Doubling force doubles acceleration; doubling mass halves it.',
        memoryHook: 'More mass needs more push; bigger push yields faster acceleration.'
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Calculating Push on a 2kg Cart',
        content:
          'To accelerate a 2 kg cart at 3 m/s²: F = 2 kg × 3 m/s² = 6 Newtons of net forward force required.',
        highlight: 'F = 2kg × 3m/s² = 6 N'
      }
    ],
    quickCheck: {
      question: 'If you double the net force on an object while keeping its mass constant, what happens to acceleration?',
      options: ['It doubles', 'It stays the same', 'It is cut in half', 'It quadruples'],
      correctIndex: 0,
      explanation: 'From F = ma, acceleration a = F/m is directly proportional to net force.'
    }
  }
};

function buildDynamicMicroSession(cleanSubject, cleanTopic) {
  return {
    title: `${cleanTopic} Foundations`,
    topic: cleanTopic,
    estimatedMinutes: 3,
    summary: `A crisp 3-minute mental model of ${cleanTopic} in ${cleanSubject}.`,
    microParts: [
      {
        partNumber: 1,
        partLabel: 'Core Intuition',
        title: `Understanding ${cleanTopic}`,
        content: `${cleanTopic} is a foundational concept in ${cleanSubject}. Mastering its baseline intuition unlocks intuitive problem solving.`,
        takeaway: `Master the essential mechanism of ${cleanTopic}.`
      },
      {
        partNumber: 2,
        partLabel: 'Key Rule / Formula',
        title: `The Core Principle of ${cleanTopic}`,
        formula: `Principle: Systematic evaluation in ${cleanSubject}`,
        content: `Break down ${cleanTopic} into its constituent inputs, boundary constraints, and core transformations.`,
        memoryHook: `Identify inputs, verify constraints, and observe the resulting state.`
      },
      {
        partNumber: 3,
        partLabel: '30-Second Example',
        title: 'Real-World Application',
        content: `Applying ${cleanTopic} systematically simplifies problem solving and eliminates common beginner traps.`,
        highlight: `Directly verifiable application of ${cleanTopic}`
      }
    ],
    quickCheck: {
      question: `What is the most effective approach to mastering ${cleanTopic} in ${cleanSubject}?`,
      options: [
        'Understand the core principles and test them with real-world examples',
        'Memorize answers without understanding the underlying logic',
        'Skip the fundamentals and jump straight to unverified edge cases',
        'Avoid breaking concepts down into simpler parts'
      ],
      correctIndex: 0,
      explanation: `Mastery comes from grounding your intuition in core principles and verifying them with practical examples.`
    }
  };
}

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
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest'
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
                temperature: 0.3,
                topP: 0.95,
                responseMimeType: 'application/json'
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

  // Fallback to curated packs or dynamic topic builder if API unavailable or rate-limited
  console.log('Using fallback curriculum for', cleanTopic, 'in', cleanSubject);
  const topicL = cleanTopic.toLowerCase();
  const subjL = cleanSubject.toLowerCase();

  let pack = null;

  if (topicL.includes('memor') || topicL.includes('stack') || topicL.includes('heap') || topicL.includes('pointer')) {
    pack = CURATED_MICRO_SESSIONS.memory_management;
  } else if (topicL.includes('trig') || topicL.includes('triangle') || topicL.includes('sin') || topicL.includes('cos') || topicL.includes('angle')) {
    pack = CURATED_MICRO_SESSIONS.trigonometry;
  } else if (subjL.includes('comp') || subjL === 'cs' || topicL.includes('code') || topicL.includes('algorithm') || topicL.includes('structur')) {
    pack = CURATED_MICRO_SESSIONS.computer_science;
  } else if (subjL.includes('physic')) {
    pack = CURATED_MICRO_SESSIONS.physics;
  } else if (topicL.includes('cell') || topicL.includes('dna') || topicL.includes('respir') || topicL.includes('atp')) {
    pack = CURATED_MICRO_SESSIONS.science;
  } else if (subjL.includes('eng') || topicL.includes('ethos') || topicL.includes('rhetoric') || topicL.includes('essay')) {
    pack = CURATED_MICRO_SESSIONS.english;
  } else if (subjL.includes('math') && (topicL.includes('quad') || topicL.includes('calculus') || topicL.includes('limit') || topicL.includes('root'))) {
    pack = CURATED_MICRO_SESSIONS.mathematics;
  } else if (subjL === 'science' || subjL.includes('natural sci')) {
    pack = CURATED_MICRO_SESSIONS.science;
  } else if (CURATED_MICRO_SESSIONS[subjL]) {
    pack = CURATED_MICRO_SESSIONS[subjL];
  } else {
    pack = buildDynamicMicroSession(cleanSubject, cleanTopic);
  }

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
