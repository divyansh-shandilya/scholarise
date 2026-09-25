import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  Award,
  BookOpen,
  Lightbulb,
  Check
} from 'lucide-react';

export default function ActiveStudySessionModal({
  isOpen,
  isLoading,
  sessionData,
  onClose,
  onFinishSession
}) {
  // Navigation:
  // step 0, 1, 2 = microParts 1, 2, 3
  // step 3 = quickCheck (1 single question)
  // step 4 = celebration / summary
  const [currentStep, setCurrentStep] = useState(0);

  // Quick check state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState(180); // 3 minutes

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setSecondsRemaining(180);
    }
  }, [isOpen, sessionData]);

  useEffect(() => {
    if (!isOpen || isLoading || currentStep === 4) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isLoading, currentStep]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const microParts = sessionData?.microParts || [
    {
      partNumber: 1,
      partLabel: 'Core Intuition',
      title: sessionData?.title || 'Key Concept',
      content: sessionData?.summary || 'Review this core concept carefully.',
      takeaway: 'Focus on understanding the foundation.'
    },
    {
      partNumber: 2,
      partLabel: 'Key Rule',
      title: 'The Core Rule',
      formula: 'Fundamental Formula',
      content: 'Apply this rule to solve standard problems.',
      memoryHook: 'Memorize the core relationship.'
    },
    {
      partNumber: 3,
      partLabel: 'Quick Example',
      title: 'Concrete Application',
      content: 'Work through this example step-by-step.',
      highlight: 'Key solution step'
    }
  ];

  const quickCheck = sessionData?.quickCheck || sessionData?.quizQuestions?.[0] || {
    question: 'Did you understand the core idea of this micro-session?',
    options: ['Yes, fully understood', 'Mostly clear', 'Need another review', 'Still learning'],
    correctIndex: 0,
    explanation: 'Great job staying engaged and reviewing the core principles!'
  };

  const totalSteps = 4; // 3 micro parts + 1 quick check
  const activePart = currentStep < 3 ? microParts[currentStep] : null;

  const handleSelectOption = (idx) => {
    if (hasAnswered) return;
    setSelectedAnswer(idx);
    setHasAnswered(true);
  };

  const handleFinish = () => {
    onFinishSession({
      subject: sessionData?.subject || 'Mathematics',
      topic: sessionData?.topic || sessionData?.title || 'Study Session',
      durationMin: 3,
      title: sessionData?.title || 'Micro-Study Session'
    });
    onClose();
  };

  return (
    <div
      data-testid="active-study-session-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full h-[100dvh] sm:h-[860px] sm:max-w-[420px] bg-[#FAF5ED] sm:rounded-[44px] shadow-[0_32px_90px_rgba(0,0,0,0.45)] border border-[#E5E0D8] overflow-hidden flex flex-col justify-between">
        {/* ================= TOP NAVIGATION BAR ================= */}
        <div className="px-6 pt-5 pb-3 border-b border-black/[0.05] bg-[#FAF5ED]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between mb-3">
            {/* Subject & Topic Badges */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FEF9EE] border border-[#F5A623]/35 text-[#D97706] text-[12px] font-bold tracking-tight">
                {sessionData?.subject || 'Mathematics'}
              </span>
              <span className="text-[12px] font-semibold text-[#71717A] max-w-[120px] truncate">
                {sessionData?.topic || 'Session'}
              </span>
            </div>

            {/* Timer & Close */}
            <div className="flex items-center gap-2">
              {!isLoading && currentStep < 4 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0C0E] text-white text-[12.5px] font-mono font-bold shadow-2xs">
                  <Clock size={13} className="text-[#F5A623]" />
                  <span>{timeFormatted}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-[#71717A] hover:text-[#0A0C0E] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Segmented Step Progress Bar */}
          {!isLoading && currentStep < 4 && (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[0, 1, 2, 3].map((stepIdx) => {
                const isPassed = stepIdx < currentStep;
                const isCurrent = stepIdx === currentStep;
                return (
                  <div
                    key={stepIdx}
                    className={`h-[4px] rounded-full transition-all duration-300 ${
                      isPassed
                        ? 'bg-[#16A34A]'
                        : isCurrent
                        ? 'bg-[#D97706]'
                        : 'bg-[#E5E0D8]'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ================= BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col justify-start">
          {isLoading ? (
            /* Loading State */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-5 animate-fadeIn">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#F5A623]/25 animate-ping absolute inset-0" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0A0C0E] via-[#2A2D36] to-[#F5A623] flex items-center justify-center text-white shadow-xl animate-spin">
                  <Sparkles size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-[19px] font-black text-[#0A0C0E] tracking-tight">
                  Crafting Bite-Sized Micro-Session...
                </h3>
                <p className="text-[13.5px] text-[#71717A] mt-1 max-w-[280px] leading-relaxed">
                  Gemini AI is structuring 3 clean micro-parts for{' '}
                  <strong className="text-[#0A0C0E]">
                    {sessionData?.topic || sessionData?.subject}
                  </strong>
                  .
                </p>
              </div>
            </div>
          ) : currentStep < 3 && activePart ? (
            /* Micro-Part Cards (One at a time) */
            <div className="space-y-5 animate-fadeIn">
              {/* Part Header */}
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-extrabold text-[#D97706] tracking-wider uppercase bg-[#FEF9EE] px-2.5 py-1 rounded-full border border-[#F5A623]/25">
                  Part {currentStep + 1} of 3 • {activePart.partLabel || 'Micro-Concept'}
                </span>
                <span className="text-[12px] font-semibold text-[#71717A]">
                  ~45s read
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-[23px] font-black text-[#0A0C0E] tracking-tight leading-snug">
                  {activePart.title}
                </h2>
              </div>

              {/* Formula / Rule Box (If present in Part 2) */}
              {activePart.formula && (
                <div className="p-4 rounded-[22px] bg-white border border-[#E5E0D8] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider block mb-2.5">
                    Key Formula / Rule
                  </span>
                  {activePart.formula.includes('|') ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {activePart.formula.split('|').map((chunk, cIdx) => (
                        <div
                          key={cIdx}
                          className="px-3 py-2.5 rounded-[16px] bg-[#FEF9EE] border border-[#F5A623]/25 text-center font-mono font-bold text-[13.5px] text-[#0A0C0E]"
                        >
                          {chunk.trim()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-[16px] bg-[#FEF9EE] border border-[#F5A623]/25 font-mono font-bold text-[15px] text-[#0A0C0E]">
                      {activePart.formula}
                    </div>
                  )}
                </div>
              )}

              {/* Core Text (Crisp, clean, no long walls) */}
              <div className="p-5 rounded-[24px] bg-white border border-[#E5E0D8] shadow-2xs">
                <p className="text-[15.5px] text-[#27272A] leading-relaxed font-normal">
                  {activePart.content}
                </p>
              </div>

              {/* Takeaway / Highlight / Memory Hook */}
              {activePart.takeaway && (
                <div className="p-4 rounded-[20px] bg-[#FEF9EE] border border-[#F5A623]/30 flex items-start gap-2.5">
                  <Lightbulb size={18} className="text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11.5px] font-bold text-[#D97706] uppercase tracking-wider block">
                      Core Takeaway
                    </span>
                    <span className="text-[13.5px] font-semibold text-[#78350F] leading-snug">
                      {activePart.takeaway}
                    </span>
                  </div>
                </div>
              )}

              {activePart.memoryHook && (
                <div className="p-4 rounded-[20px] bg-[#FEF9EE] border border-[#F5A623]/30 flex items-start gap-2.5">
                  <BookOpen size={18} className="text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11.5px] font-bold text-[#D97706] uppercase tracking-wider block">
                      Memory Hook
                    </span>
                    <span className="text-[13px] font-medium text-[#78350F] leading-snug">
                      {activePart.memoryHook}
                    </span>
                  </div>
                </div>
              )}

              {activePart.highlight && (
                <div className="p-4 rounded-[20px] bg-[#F0FDF4] border border-[#16A34A]/30 flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11.5px] font-bold text-[#16A34A] uppercase tracking-wider block">
                      Key Result
                    </span>
                    <span className="text-[13.5px] font-semibold text-[#14532D] leading-snug font-mono">
                      {activePart.highlight}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : currentStep === 3 ? (
            /* Step 3: Quick Check (Just 1 single question!) */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-extrabold text-[#D97706] tracking-wider uppercase bg-[#FEF9EE] px-2.5 py-1 rounded-full border border-[#F5A623]/25">
                  Quick Check • 1 Question
                </span>
                <span className="text-[12px] font-semibold text-[#71717A]">
                  Solidify Concept
                </span>
              </div>

              <h2 className="text-[19px] font-black text-[#0A0C0E] tracking-tight leading-snug">
                {quickCheck.question}
              </h2>

              {/* 4 Clean Options */}
              <div className="space-y-2.5 pt-1">
                {quickCheck.options?.map((opt, oIdx) => {
                  const isThisSelected = selectedAnswer === oIdx;
                  const isThisCorrect = oIdx === quickCheck.correctIndex;

                  let borderClass = 'border-[#E5E0D8] bg-white';
                  let icon = null;

                  if (hasAnswered) {
                    if (isThisCorrect) {
                      borderClass = 'border-[#16A34A] bg-[#DCFCE7]/70 text-[#15803D] font-bold';
                      icon = <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />;
                    } else if (isThisSelected) {
                      borderClass = 'border-[#EF4444] bg-[#FEE2E2]/70 text-[#B91C1C] font-semibold';
                      icon = <AlertCircle size={18} className="text-[#EF4444] shrink-0" />;
                    }
                  } else if (isThisSelected) {
                    borderClass = 'border-[#0A0C0E] bg-white font-semibold';
                  }

                  return (
                    <button
                      key={oIdx}
                      data-testid="quiz-option"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-4 rounded-[20px] border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${borderClass} ${
                        !hasAnswered ? 'hover:border-black/25 active:scale-[0.99]' : ''
                      }`}
                    >
                      <span className="text-[14.5px] leading-snug">{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Instant Feedback Explanation */}
              {hasAnswered && (
                <div
                  className={`p-4 rounded-[20px] animate-fadeIn border ${
                    selectedAnswer === quickCheck.correctIndex
                      ? 'bg-[#DCFCE7]/60 border-[#16A34A]/30 text-[#15803D]'
                      : 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#991B1B]'
                  }`}
                >
                  <div className="font-bold text-[13.5px] mb-1">
                    {selectedAnswer === quickCheck.correctIndex ? 'Correct! 🎯' : 'Explanation:'}
                  </div>
                  <p className="text-[13px] leading-relaxed font-normal">
                    {quickCheck.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Celebration / Completion Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-[#FEF9EE] border-2 border-[#F5A623] flex items-center justify-center text-[#D97706] mb-5 shadow-md">
                <Flame size={40} className="fill-[#F5A623]" />
              </div>

              <span className="text-[12px] font-extrabold text-[#D97706] tracking-wider uppercase mb-1">
                Micro-Session Complete!
              </span>
              <h1 className="text-[26px] font-black text-[#0A0C0E] tracking-tight">
                Great job today!
              </h1>
              <p className="text-[14px] text-[#71717A] mt-1 max-w-[280px] leading-relaxed">
                You logged <strong className="text-[#0A0C0E]">3 minutes</strong> of focused study in{' '}
                <strong className="text-[#0A0C0E]">
                  {sessionData?.topic || sessionData?.subject}
                </strong>
                .
              </p>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <div className="p-4 rounded-[22px] bg-white border border-[#E5E0D8] text-center shadow-2xs">
                  <div className="text-[24px] font-black text-[#0A0C0E]">+3m</div>
                  <div className="text-[11.5px] text-[#71717A] font-semibold mt-0.5">
                    Study Time Added
                  </div>
                </div>
                <div className="p-4 rounded-[22px] bg-white border border-[#E5E0D8] text-center shadow-2xs">
                  <div className="text-[24px] font-black text-[#D97706] flex items-center justify-center gap-1">
                    1 <Flame size={18} className="fill-[#D97706]" />
                  </div>
                  <div className="text-[11.5px] text-[#71717A] font-semibold mt-0.5">
                    Day Streak Active
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= BOTTOM ACTION BAR ================= */}
        {!isLoading && (
          <div className="p-6 pt-3 pb-6 bg-[#FAF5ED] border-t border-black/[0.05] shrink-0 space-y-2">
            {currentStep < 2 ? (
              /* Steps 0 & 1 -> Next part */
              <button
                data-testid="next-part-btn"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="w-full h-[54px] bg-[#0A0C0E] hover:bg-[#1E2024] active:scale-[0.98] text-white rounded-full font-bold text-[15.5px] flex items-center justify-between px-6 shadow-md cursor-pointer transition-all"
              >
                <span>Part {currentStep + 2}: {microParts[currentStep + 1]?.partLabel || 'Next'}</span>
                <ArrowRight size={18} />
              </button>
            ) : currentStep === 2 ? (
              /* Step 2 -> Option to do quick check or finish */
              <div className="space-y-2">
                <button
                  data-testid="start-quick-check-btn"
                  onClick={() => setCurrentStep(3)}
                  className="w-full h-[54px] bg-[#0A0C0E] hover:bg-[#1E2024] active:scale-[0.98] text-white rounded-full font-bold text-[15.5px] flex items-center justify-between px-6 shadow-md cursor-pointer transition-all"
                >
                  <span>Quick 1-Question Check</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="w-full py-2 text-[13px] font-semibold text-[#71717A] hover:text-[#0A0C0E] transition-colors cursor-pointer"
                >
                  Skip check and log session (+3m)
                </button>
              </div>
            ) : currentStep === 3 ? (
              /* Step 3 (Quick check) -> View summary */
              <button
                data-testid="finish-quick-check-btn"
                disabled={!hasAnswered}
                onClick={() => setCurrentStep(4)}
                className={`w-full h-[54px] rounded-full font-bold text-[15.5px] flex items-center justify-between px-6 transition-all ${
                  hasAnswered
                    ? 'bg-[#0A0C0E] text-white hover:bg-[#1E2024] shadow-md cursor-pointer active:scale-[0.98]'
                    : 'bg-[#E5E0D8] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                <span>Complete Micro-Session</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              /* Step 4 -> Return to dashboard */
              <button
                data-testid="save-and-return-home-btn"
                onClick={handleFinish}
                className="w-full h-[54px] bg-[#0A0C0E] hover:bg-[#1E2024] active:scale-[0.98] text-white rounded-full font-bold text-[15.5px] flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <Check size={18} />
                <span>Save to Progress & Return Home</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
