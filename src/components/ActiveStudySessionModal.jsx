import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Flame,
  Award,
  ChevronRight,
  RotateCcw,
  Check
} from 'lucide-react';

export default function ActiveStudySessionModal({
  isOpen,
  onClose,
  sessionData,
  isLoading,
  onFinishSession
}) {
  if (!isOpen) return null;

  // Active step in the session: 0 = Concepts, 1 = Quiz, 2 = Summary / Done
  const [step, setStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    (sessionData?.estimatedMinutes || 15) * 60
  );
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Sync timer when sessionData arrives
  useEffect(() => {
    if (sessionData?.estimatedMinutes) {
      setSecondsRemaining(sessionData.estimatedMinutes * 60);
    }
  }, [sessionData]);

  // Countdown timer effect
  useEffect(() => {
    if (isLoading || isTimerPaused || secondsRemaining <= 0 || step === 2) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, isTimerPaused, secondsRemaining, step]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleSelectOption = (optIndex) => {
    if (hasAnsweredCurrent) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optIndex
    }));
    setHasAnsweredCurrent(true);
  };

  const handleNextQuestion = () => {
    const totalQuestions = sessionData?.quizQuestions?.length || 0;
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setHasAnsweredCurrent(false);
    } else {
      // Finished all questions -> go to Celebration & Summary screen
      setStep(2);
    }
  };

  const handleCompleteAndLog = () => {
    if (onFinishSession) {
      onFinishSession({
        subject: sessionData?.subject || 'Mathematics',
        durationMin: sessionData?.estimatedMinutes || 15,
        title: sessionData?.title || 'Interactive Study Session',
        date: new Date().toISOString()
      });
    }
    onClose();
  };

  const questions = sessionData?.quizQuestions || [];
  const currentQ = questions[currentQuestionIndex];
  const userSelected = selectedAnswers[currentQuestionIndex];
  const isCorrect = userSelected === currentQ?.correctIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-[430px] h-[90vh] max-h-[860px] bg-[#FAF5ED] rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-[#E5E0D8] flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div className="relative z-20 pt-6 px-6 pb-4 bg-white/70 backdrop-blur-md border-b border-[#E5E0D8]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#FEF9EE] border border-[#F5A623]/30 text-[#D97706] text-[12.5px] font-bold tracking-tight">
              {sessionData?.subject || 'Study Session'}
            </span>
            <span className="flex items-center gap-1 text-[11.5px] font-semibold text-[#71717A] bg-[#0A0C0E]/5 px-2.5 py-1 rounded-full">
              <Sparkles size={12} className="text-[#F5A623]" />
              AI Powered
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0C0E] text-white text-[13px] font-mono font-semibold">
              <Clock size={13} className="text-[#F5A623]" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#0A0C0E] transition-colors cursor-pointer"
              aria-label="Close session"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
          {isLoading ? (
            /* Loading State with Real Gemini Generation Checklist */
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#F5A623]/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0A0C0E] via-[#2A2D36] to-[#F5A623] flex items-center justify-center text-white shadow-xl animate-spin">
                  <Sparkles size={28} />
                </div>
              </div>

              <h2 className="text-[22px] font-extrabold text-[#0A0C0E] tracking-tight mb-2">
                Consulting Gemini AI...
              </h2>
              <p className="text-[14px] text-[#71717A] max-w-[280px] mb-6">
                Synthesizing key curriculum topics, personalized examples, and practice questions.
              </p>

              <div className="w-full max-w-[300px] bg-white rounded-2xl p-4 border border-[#E5E0D8] space-y-2.5 text-left text-[13px]">
                <div className="flex items-center gap-2.5 text-[#16A34A] font-medium">
                  <CheckCircle2 size={16} />
                  <span>Curriculum scope indexed</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#D97706] font-medium">
                  <Sparkles size={16} className="animate-spin" />
                  <span>Drafting adaptive quiz questions...</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#9CA3AF]">
                  <div className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]" />
                  <span>Calibrating 15-min pacing</span>
                </div>
              </div>
            </div>
          ) : step === 0 ? (
            /* Step 0: Core Concepts & Topic Overview */
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-[11.5px] font-extrabold text-[#D97706] tracking-wider uppercase">
                  Session Topic
                </span>
                <h1 className="text-[24px] font-black text-[#0A0C0E] tracking-tight leading-tight mt-0.5">
                  {sessionData?.title}
                </h1>
                <p className="text-[14px] text-[#71717A] mt-1.5 leading-relaxed">
                  {sessionData?.summary}
                </p>
              </div>

              {/* Key Concept Cards */}
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold text-[#0A0C0E] tracking-tight flex items-center gap-2">
                  <BookOpen size={17} className="text-[#D97706]" />
                  Key Takeaways
                </h3>

                {sessionData?.keyConcepts?.map((kc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[22px] bg-white border border-[#E5E0D8] shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#FEF9EE] text-[#D97706] text-[12px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <span className="text-[15px] font-bold text-[#0A0C0E]">
                        {kc.concept}
                      </span>
                    </div>
                    <p className="text-[13.5px] text-[#4B5563] leading-relaxed pl-7 font-normal">
                      {kc.explanation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actionable Tips */}
              {sessionData?.actionableTakeaways?.length > 0 && (
                <div className="p-4 rounded-[20px] bg-[#FEF9EE] border border-[#F5A623]/30">
                  <span className="text-[12px] font-bold text-[#D97706] uppercase tracking-wide block mb-1">
                    Study Strategy
                  </span>
                  <ul className="list-disc list-inside text-[13px] text-[#78350F] space-y-1">
                    {sessionData.actionableTakeaways.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : step === 1 ? (
            /* Step 1: Interactive Practice Quiz */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#71717A] tracking-wider uppercase">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-[12px] font-semibold text-[#D97706]">
                  Practice Check
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-[19px] font-bold text-[#0A0C0E] tracking-tight leading-snug">
                {currentQ?.question}
              </h2>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5 mt-4">
                {currentQ?.options?.map((opt, oIdx) => {
                  const isThisSelected = userSelected === oIdx;
                  const isThisCorrect = oIdx === currentQ.correctIndex;

                  let borderClass = 'border-[#E5E0D8] bg-white';
                  let icon = null;

                  if (hasAnsweredCurrent) {
                    if (isThisCorrect) {
                      borderClass = 'border-[#16A34A] bg-[#DCFCE7]/60 text-[#15803D]';
                      icon = <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />;
                    } else if (isThisSelected) {
                      borderClass = 'border-[#EF4444] bg-[#FEE2E2]/60 text-[#B91C1C]';
                      icon = <AlertCircle size={18} className="text-[#EF4444] shrink-0" />;
                    }
                  } else if (isThisSelected) {
                    borderClass = 'border-[#0A0C0E] bg-white';
                  }

                  return (
                    <button
                      key={oIdx}
                      data-testid="quiz-option"
                      disabled={hasAnsweredCurrent}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-4 rounded-[20px] border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${borderClass} ${
                        !hasAnsweredCurrent ? 'hover:border-black/20 active:scale-[0.99]' : ''
                      }`}
                    >
                      <span className="text-[14.5px] font-medium leading-snug">
                        {opt}
                      </span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Feedback */}
              {hasAnsweredCurrent && (
                <div
                  className={`p-4 rounded-[20px] animate-fadeIn border ${
                    isCorrect
                      ? 'bg-[#DCFCE7]/50 border-[#16A34A]/30 text-[#15803D]'
                      : 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#991B1B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[14px] mb-1">
                    {isCorrect ? 'Correct! 🎯' : 'Explanation:'}
                  </div>
                  <p className="text-[13px] leading-relaxed font-normal">
                    {currentQ?.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Session Complete & Streak Celebration */
            <div className="h-full flex flex-col items-center justify-center text-center py-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-[#FEF9EE] border-2 border-[#F5A623] flex items-center justify-center text-[#D97706] mb-5 shadow-lg">
                <Flame size={40} className="animate-bounce" />
              </div>

              <span className="text-[12px] font-extrabold text-[#D97706] tracking-widest uppercase mb-1">
                Session Completed!
              </span>
              <h1 className="text-[28px] font-black text-[#0A0C0E] tracking-tight leading-tight mb-2">
                Great work today!
              </h1>
              <p className="text-[14px] text-[#71717A] max-w-[290px] mb-6">
                You logged <strong className="text-[#0A0C0E]">{sessionData?.estimatedMinutes || 15} minutes</strong> of focused study in{' '}
                <strong className="text-[#0A0C0E]">{sessionData?.subject}</strong>.
              </p>

              {/* Achievement Summary Cards */}
              <div className="w-full grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-[22px] bg-white border border-[#E5E0D8] text-center">
                  <div className="text-[26px] font-extrabold text-[#0A0C0E] leading-none mb-1">
                    +{sessionData?.estimatedMinutes || 15}m
                  </div>
                  <div className="text-[12px] text-[#71717A] font-semibold">
                    Study Time Added
                  </div>
                </div>

                <div className="p-4 rounded-[22px] bg-white border border-[#E5E0D8] text-center">
                  <div className="text-[26px] font-extrabold text-[#D97706] leading-none mb-1 flex items-center justify-center gap-1">
                    <span>1</span>
                    <Flame size={20} className="text-[#F5A623]" />
                  </div>
                  <div className="text-[12px] text-[#71717A] font-semibold">
                    Day Streak Active
                  </div>
                </div>
              </div>

              <div className="w-full p-4 rounded-[22px] bg-[#FEF9EE] border border-[#F5A623]/30 text-left text-[13px] text-[#78350F] flex items-center gap-3">
                <Award size={24} className="text-[#D97706] shrink-0" />
                <span>
                  Your weekly progress and subject breakdown have been updated with this session.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        {!isLoading && (
          <div className="p-6 bg-white/80 backdrop-blur-md border-t border-[#E5E0D8]/60 flex items-center justify-between gap-3">
            {step === 0 ? (
              <button
                onClick={() => setStep(1)}
                className="w-full h-[54px] bg-[#0A0C0E] hover:bg-[#1C1E24] text-white rounded-full font-bold text-[16px] flex items-center justify-between px-6 shadow-md cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>Start Practice Quiz ({questions.length} questions)</span>
                <ArrowRight size={18} strokeWidth={2.4} />
              </button>
            ) : step === 1 ? (
              <button
                disabled={!hasAnsweredCurrent}
                onClick={handleNextQuestion}
                className={`w-full h-[54px] rounded-full font-bold text-[16px] flex items-center justify-between px-6 transition-all select-none ${
                  hasAnsweredCurrent
                    ? 'bg-[#0A0C0E] hover:bg-[#1C1E24] text-white cursor-pointer active:scale-[0.98] shadow-md'
                    : 'bg-[#E5E0D8] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                <span>
                  {currentQuestionIndex + 1 < questions.length
                    ? 'Next Question'
                    : 'Finish & View Results'}
                </span>
                <ArrowRight size={18} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                onClick={handleCompleteAndLog}
                className="w-full h-[56px] bg-[#0A0C0E] hover:bg-[#1C1E24] text-white rounded-full font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.98]"
              >
                <Check size={20} strokeWidth={2.5} />
                <span>Save to Progress & Return Home</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
