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
  Check,
  Brain,
  Zap,
  Target,
  ChevronRight
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full h-[94vh] sm:h-[860px] sm:max-h-[90vh] sm:max-w-[430px] bg-gradient-to-b from-[#FAF5ED] via-[#FDFBF7] to-[#F7F2E9] rounded-t-[36px] sm:rounded-[44px] shadow-[0_32px_90px_rgba(0,0,0,0.4)] border border-[#E5E0D8] overflow-hidden flex flex-col justify-between animate-page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= TOP NAVIGATION BAR ================= */}
        <div className="px-6 pt-3 pb-3.5 border-b border-black/[0.05] bg-[#FAF5ED]/95 backdrop-blur-md shrink-0">
          {/* iOS Sheet Pull Indicator */}
          <div className="w-10 h-1 rounded-full bg-black/15 mx-auto mb-2.5 sm:hidden" />

          <div className="flex items-center justify-between gap-3">
            {/* Subject & Topic Integrated Breadcrumb Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.03)] min-w-0 max-w-[240px]">
              <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0 animate-pulse" />
              <span className="text-[12px] font-extrabold text-[#0A0C0E] tracking-tight shrink-0">
                {sessionData?.subject || 'Study'}
              </span>
              <span className="text-[#D1D5DB] text-[11px] shrink-0">•</span>
              <span className="text-[12px] font-semibold text-[#71717A] truncate">
                {sessionData?.topic || 'Session'}
              </span>
            </div>

            {/* Timer Pill & Close Action */}
            <div className="flex items-center gap-2 shrink-0">
              {!isLoading && currentStep < 4 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A0C0E] text-white text-[12px] font-mono font-bold tracking-wide shadow-2xs">
                  <Clock size={12} className="text-[#F5A623]" />
                  <span>{timeFormatted}</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-[#71717A] hover:text-[#0A0C0E] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Segmented Step Progress Bar with Micro-Labels */}
          {!isLoading && currentStep < 4 && (
            <div className="mt-3.5 space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((stepIdx) => {
                  const isPassed = stepIdx < currentStep;
                  const isCurrent = stepIdx === currentStep;
                  return (
                    <div
                      key={stepIdx}
                      className="h-[5px] rounded-full overflow-hidden bg-black/[0.07] transition-all"
                    >
                      <div
                        className={`h-full transition-all duration-400 ease-out ${
                          isPassed
                            ? 'w-full bg-[#16A34A]'
                            : isCurrent
                            ? 'w-full bg-[#D97706]'
                            : 'w-0'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10.5px] font-bold text-[#8E8E93] uppercase tracking-wider px-0.5">
                <span>
                  {currentStep < 3
                    ? `Part ${currentStep + 1} of 3 • ${activePart?.partLabel || 'Concept'}`
                    : 'Quick Check • 1 Question'}
                </span>
                <span>{currentStep < 3 ? 'Bite-Sized' : 'Verification'}</span>
              </div>
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
                <h3 className="text-[20px] font-black text-[#0A0C0E] tracking-tight">
                  Crafting 3-Minute Micro-Session...
                </h3>
                <p className="text-[13.5px] text-[#71717A] mt-1.5 max-w-[280px] leading-relaxed mx-auto">
                  Distilling{' '}
                  <strong className="text-[#0A0C0E]">
                    {sessionData?.topic || sessionData?.subject}
                  </strong>{' '}
                  into 3 intuitive, high-yield insights.
                </p>
              </div>
              {/* Skeleton Cards Preview */}
              <div className="w-full space-y-2.5 pt-4 opacity-40">
                <div className="h-16 rounded-[20px] bg-white border border-[#E5DFD4] animate-pulse" />
                <div className="h-20 rounded-[20px] bg-white border border-[#E5DFD4] animate-pulse" />
              </div>
            </div>
          ) : currentStep < 3 && activePart ? (
            /* Micro-Part Cards (Steps 0, 1, 2) */
            <div className="space-y-4 animate-fadeIn">
              {/* Main Educational Card */}
              <div className="p-6 rounded-[28px] bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4 relative overflow-hidden">
                {/* Decorative Amber Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF3C7]/40 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

                {/* Card Pill Header */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF9EE] border border-[#F5A623]/30 text-[#D97706] text-[11px] font-black tracking-wider uppercase">
                    <Sparkles size={12} />
                    Part {currentStep + 1} • {activePart.partLabel || 'Micro-Concept'}
                  </span>
                  <span className="text-[12px] font-semibold text-[#8E8E93]">
                    ~45s read
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-[23px] sm:text-[25px] font-black text-[#0A0C0E] tracking-tight leading-snug relative z-10">
                  {activePart.title}
                </h2>

                {/* Formula / Rule Plaque (Step 1 / Part 2) */}
                {activePart.formula && (
                  <div className="p-4 rounded-[20px] bg-[#FAF5ED] border border-[#E5DFD4] space-y-2 relative z-10">
                    <span className="text-[10.5px] font-black text-[#D97706] uppercase tracking-wider block">
                      Core Rule / Formula
                    </span>
                    {activePart.formula.includes('|') ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {activePart.formula.split('|').map((chunk, cIdx) => (
                          <div
                            key={cIdx}
                            className="px-3 py-2 rounded-[14px] bg-white border border-[#E5DFD4] text-center font-mono font-bold text-[13px] text-[#0A0C0E] shadow-2xs"
                          >
                            {chunk.trim()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-[14px] bg-white border border-[#E5DFD4] font-mono font-bold text-[14.5px] text-[#0A0C0E] shadow-2xs">
                        {activePart.formula}
                      </div>
                    )}
                  </div>
                )}

                {/* Core Concept Text */}
                <p className="text-[15.5px] sm:text-[16px] text-[#27272A] leading-[1.6] font-normal relative z-10">
                  {activePart.content}
                </p>

                {/* Highlight Plaque (Step 2 / Part 3) */}
                {activePart.highlight && (
                  <div className="p-4 rounded-[20px] bg-[#FAF5ED] border border-[#E5DFD4] space-y-1.5 relative z-10">
                    <span className="text-[10.5px] font-black text-[#16A34A] uppercase tracking-wider block">
                      Applied Calculation / Result
                    </span>
                    <div className="px-3.5 py-2.5 rounded-[14px] bg-white border border-[#E5DFD4] font-mono font-bold text-[14px] text-[#0A0C0E] shadow-2xs">
                      {activePart.highlight}
                    </div>
                  </div>
                )}
              </div>

              {/* Takeaway Companion Card */}
              {activePart.takeaway && (
                <div className="p-4 rounded-[22px] bg-[#FEF9EE] border border-[#F5A623]/30 flex items-start gap-3 shadow-[0_2px_8px_rgba(245,166,35,0.06)]">
                  <div className="w-8 h-8 rounded-full bg-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0 mt-0.5">
                    <Lightbulb size={17} />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
                      Key Takeaway
                    </span>
                    <p className="text-[13.5px] font-semibold text-[#78350F] leading-snug mt-0.5">
                      {activePart.takeaway}
                    </p>
                  </div>
                </div>
              )}

              {/* Memory Hook Companion Card */}
              {activePart.memoryHook && (
                <div className="p-4 rounded-[22px] bg-white border border-black/[0.06] flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5ED] flex items-center justify-center text-[#0A0C0E] shrink-0 mt-0.5">
                    <BookOpen size={17} />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-[#71717A] uppercase tracking-wider block">
                      Memory Hook (Mnemonic)
                    </span>
                    <p className="text-[13px] font-medium text-[#27272A] leading-snug mt-0.5">
                      "{activePart.memoryHook}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : currentStep === 3 ? (
            /* Step 3: Quick Check (1 Single Targeted Question) */
            <div className="space-y-4 animate-fadeIn">
              {/* Question Header Card */}
              <div className="p-6 rounded-[28px] bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF9EE] border border-[#F5A623]/30 text-[#D97706] text-[11px] font-black tracking-wider uppercase">
                    <Target size={12} />
                    Quick Check • 1 Question
                  </span>
                  <span className="text-[12px] font-semibold text-[#8E8E93]">
                    Solidify Concept
                  </span>
                </div>

                <h2 className="text-[19px] sm:text-[21px] font-black text-[#0A0C0E] tracking-tight leading-snug">
                  {quickCheck.question}
                </h2>
              </div>

              {/* 4 Interactive Option Cards */}
              <div className="space-y-2.5">
                {quickCheck.options?.map((opt, oIdx) => {
                  const letterBadge = String.fromCharCode(65 + oIdx);
                  const isThisSelected = selectedAnswer === oIdx;
                  const isThisCorrect = oIdx === quickCheck.correctIndex;

                  let cardStyle = 'bg-white border-[#E5DFD4] hover:border-black/25 hover:bg-[#FAF8F5] text-[#27272A]';
                  let badgeStyle = 'bg-[#FAF5ED] text-[#636366] border border-[#E5DFD4]';
                  let icon = null;

                  if (hasAnswered) {
                    if (isThisCorrect) {
                      cardStyle = 'bg-[#F0FDF4] border-[#16A34A] shadow-[0_2px_12px_rgba(22,163,74,0.12)] text-[#15803D] font-bold';
                      badgeStyle = 'bg-[#16A34A] text-white border-transparent';
                      icon = <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />;
                    } else if (isThisSelected) {
                      cardStyle = 'bg-[#FEF2F2] border-[#EF4444] text-[#B91C1C] font-semibold';
                      badgeStyle = 'bg-[#EF4444] text-white border-transparent';
                      icon = <AlertCircle size={18} className="text-[#EF4444] shrink-0" />;
                    } else {
                      cardStyle = 'bg-white/60 border-[#E5DFD4] text-[#A1A1AA] opacity-70';
                    }
                  } else if (isThisSelected) {
                    cardStyle = 'bg-[#FAF5ED] border-[#0A0C0E] shadow-2xs font-semibold';
                    badgeStyle = 'bg-[#0A0C0E] text-white border-transparent';
                  }

                  return (
                    <button
                      key={oIdx}
                      data-testid="quiz-option"
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-4 rounded-[22px] border text-left flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer ${cardStyle} ${
                        !hasAnswered ? 'active:scale-[0.98]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12.5px] shrink-0 transition-colors ${badgeStyle}`}
                        >
                          {letterBadge}
                        </span>
                        <span className="text-[14.5px] leading-snug">{opt}</span>
                      </div>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Instant Feedback Explanation Plaque */}
              {hasAnswered && (
                <div
                  className={`p-4.5 rounded-[24px] border animate-fadeIn space-y-1 ${
                    selectedAnswer === quickCheck.correctIndex
                      ? 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#15803D]'
                      : 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#991B1B]'
                  }`}
                >
                  <div className="font-extrabold text-[14px] flex items-center gap-1.5">
                    {selectedAnswer === quickCheck.correctIndex ? (
                      <>
                        <Check size={16} strokeWidth={3} />
                        <span>Spot on! Concept Mastered 🎯</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        <span>Explanation:</span>
                      </>
                    )}
                  </div>
                  <p className="text-[13px] leading-relaxed font-medium">
                    {quickCheck.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Step 4: Celebration / Completion Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 animate-fadeIn space-y-5">
              {/* Radial Celebratory Flame Beacon */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#FEF3C7] border-4 border-white shadow-xl flex items-center justify-center text-[#D97706]">
                  <Flame size={48} className="fill-[#F5A623] animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[15px] font-bold shadow-md">
                  ✓
                </div>
              </div>

              <div>
                <span className="text-[11.5px] font-extrabold text-[#D97706] tracking-wider uppercase block mb-1">
                  Micro-Session Complete
                </span>
                <h1 className="text-[28px] font-black text-[#0A0C0E] tracking-tight leading-tight">
                  Mastery Logged!
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1.5 max-w-[290px] leading-relaxed mx-auto">
                  You conquered <strong className="text-[#0A0C0E]">{sessionData?.topic || sessionData?.subject}</strong> in 3 focused minutes.
                </p>
              </div>

              {/* Three Metric Cards */}
              <div className="grid grid-cols-3 gap-2.5 w-full">
                <div className="p-3.5 rounded-[22px] bg-white border border-[#E5DFD4] text-center shadow-2xs">
                  <div className="text-[20px] font-black text-[#0A0C0E]">+3m</div>
                  <div className="text-[11px] text-[#71717A] font-semibold mt-0.5">
                    Study Time
                  </div>
                </div>
                <div className="p-3.5 rounded-[22px] bg-white border border-[#E5DFD4] text-center shadow-2xs">
                  <div className="text-[20px] font-black text-[#D97706] flex items-center justify-center gap-0.5">
                    1<Flame size={15} className="fill-[#D97706]" />
                  </div>
                  <div className="text-[11px] text-[#71717A] font-semibold mt-0.5">
                    Day Streak
                  </div>
                </div>
                <div className="p-3.5 rounded-[22px] bg-white border border-[#E5DFD4] text-center shadow-2xs">
                  <div className="text-[20px] font-black text-[#16A34A]">100%</div>
                  <div className="text-[11px] text-[#71717A] font-semibold mt-0.5">
                    Completed
                  </div>
                </div>
              </div>

              {/* Encouraging Quote */}
              <div className="p-3.5 rounded-[18px] bg-white/70 border border-black/[0.04] text-[12.5px] text-[#4B5563] italic max-w-[320px]">
                "Consistent 3-minute micro-sessions yield 80% higher retention than cramming."
              </div>
            </div>
          )}
        </div>

        {/* ================= BOTTOM ACTION BAR ================= */}
        {!isLoading && (
          <div className="p-6 pt-3 pb-6 bg-[#FAF5ED] border-t border-black/[0.05] shrink-0 space-y-2">
            {currentStep < 2 ? (
              /* Steps 0 & 1 -> Next Micro-Part */
              <button
                data-testid="next-part-btn"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="w-full h-[54px] bg-[#0A0C0E] hover:bg-[#1E2024] active:scale-[0.98] text-white rounded-full font-bold text-[15.5px] flex items-center justify-between px-6 shadow-md cursor-pointer transition-all"
              >
                <span>
                  Part {currentStep + 2}: {microParts[currentStep + 1]?.partLabel || 'Next'}
                </span>
                <ArrowRight size={18} />
              </button>
            ) : currentStep === 2 ? (
              /* Step 2 -> Quick Check or Skip */
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
                    : 'bg-[#E5DFD4] text-[#A1A1AA] cursor-not-allowed'
                }`}
              >
                <span>
                  {hasAnswered ? 'Complete Micro-Session' : 'Select an Option Above'}
                </span>
                <ArrowRight size={18} />
              </button>
            ) : (
              /* Step 4 -> Return to dashboard */
              <button
                data-testid="save-and-return-home-btn"
                onClick={handleFinish}
                className="w-full h-[54px] bg-[#0A0C0E] hover:bg-[#1E2024] active:scale-[0.98] text-white rounded-full font-bold text-[15.5px] flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <Check size={18} strokeWidth={2.5} />
                <span>Save to Progress & Return Home</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
