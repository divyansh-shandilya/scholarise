import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Search, BookOpen, Clock } from 'lucide-react';

const TOPIC_SUGGESTIONS = {
  'Computer Science': [
    { label: 'Memory Management', icon: '💾', hint: 'Stack vs Heap & pointers' },
    { label: 'Data Structures', icon: '🌳', hint: 'Trees, graphs & hash maps' },
    { label: 'Algorithms & Big-O', icon: '⚡', hint: 'Sorting & time complexity' },
    { label: 'Object-Oriented Design', icon: '🧩', hint: 'Classes, inheritance & SOLID' }
  ],
  Mathematics: [
    { label: 'Trigonometry', icon: '📐', hint: 'SOH-CAH-TOA & angles' },
    { label: 'Quadratic Equations', icon: '📊', hint: 'Factoring & roots' },
    { label: 'Calculus & Limits', icon: '∫', hint: 'Derivatives & rates' },
    { label: 'Probability', icon: '🎲', hint: 'Permutations & odds' },
    { label: 'Geometry', icon: '📏', hint: 'Theorems & proofs' }
  ],
  Science: [
    { label: 'Cellular Respiration', icon: '🧬', hint: 'ATP & glycolysis' },
    { label: 'Thermodynamics', icon: '⚡', hint: 'Heat & entropy laws' },
    { label: 'Newtonian Mechanics', icon: '🍎', hint: 'Force & motion' },
    { label: 'Chemical Bonding', icon: '🧪', hint: 'Covalent & ionic' },
    { label: 'Optics & Waves', icon: '💡', hint: 'Refraction & light' }
  ],
  Physics: [
    { label: 'Newtonian Mechanics', icon: '🍎', hint: 'Force, mass & acceleration' },
    { label: 'Thermodynamics', icon: '⚡', hint: 'Heat, work & entropy' },
    { label: 'Electromagnetism', icon: '🧲', hint: 'Fields, charge & circuits' },
    { label: 'Optics & Waves', icon: '💡', hint: 'Refraction & interference' }
  ],
  Chemistry: [
    { label: 'Chemical Bonding', icon: '🧪', hint: 'Covalent, ionic & polar' },
    { label: 'Stoichiometry', icon: '⚖️', hint: 'Mole ratios & yield' },
    { label: 'Thermodynamics & Equilibrium', icon: '🔥', hint: "Le Chatelier's principle" },
    { label: 'Organic Functional Groups', icon: '⬡', hint: 'Alkanes, alcohols & ketones' }
  ],
  Biology: [
    { label: 'Cellular Respiration', icon: '🧬', hint: 'Glycolysis, Krebs & ATP' },
    { label: 'DNA Replication & Genetics', icon: '🔬', hint: 'Polymerase & transcription' },
    { label: 'Photosynthesis', icon: '🌱', hint: 'Light reactions & Calvin cycle' },
    { label: 'Ecology & Food Webs', icon: '🌍', hint: 'Trophic levels & energy' }
  ],
  English: [
    { label: 'Rhetorical Appeals', icon: '✍️', hint: 'Ethos, Pathos, Logos' },
    { label: 'Metaphor & Imagery', icon: '📖', hint: 'Literary devices' },
    { label: 'Essay Structuring', icon: '📝', hint: 'Thesis & transitions' },
    { label: 'Syntax & Grammar', icon: '🔤', hint: 'Sentence mechanics' }
  ],
  History: [
    { label: 'The Industrial Revolution', icon: '🏭', hint: 'Mechanization & social change' },
    { label: 'World War II & Diplomacy', icon: '🕊️', hint: 'Alliances & global impact' },
    { label: 'Ancient Civilizations', icon: '🏛️', hint: 'Rome, Greece & Mesopotamia' },
    { label: 'Cold War Era', icon: '🌐', hint: 'Superpowers & ideological division' }
  ],
  Art: [
    { label: 'Color Theory & Harmony', icon: '🎨', hint: 'Complementary & analogous' },
    { label: 'Linear Perspective', icon: '📐', hint: 'Vanishing points & horizon' },
    { label: 'Composition & Framing', icon: '🖼️', hint: 'Rule of thirds & golden ratio' }
  ]
};

export default function TopicSelectionModal({
  isOpen,
  onClose,
  subjects = [],
  initialSubject = 'Mathematics',
  onStartSession
}) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'Mathematics');
  const [topicInput, setTopicInput] = useState('');

  // Keep state in perfect sync whenever the modal opens or the selected initial subject changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSubject(initialSubject || 'Mathematics');
      setTopicInput('');
    }
  }, [isOpen, initialSubject]);

  if (!isOpen) return null;

  const normalizeSubject = (name) => {
    const s = String(name || '').toLowerCase().trim();
    if (s === 'math' || s === 'maths' || s === 'mathematics') return 'Mathematics';
    if (s === 'cs' || s === 'compsci' || s === 'computer science') return 'Computer Science';
    if (s === 'science') return 'Science';
    if (s === 'physics') return 'Physics';
    if (s === 'chemistry') return 'Chemistry';
    if (s === 'biology') return 'Biology';
    if (s === 'english') return 'English';
    if (s === 'history') return 'History';
    if (s === 'art') return 'Art';
    return name || 'General Studies';
  };

  const currentSubjectClean = normalizeSubject(selectedSubject);
  const suggestions =
    TOPIC_SUGGESTIONS[currentSubjectClean] || TOPIC_SUGGESTIONS['Computer Science'] || TOPIC_SUGGESTIONS['Mathematics'];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const finalTopic = topicInput.trim() || suggestions[0]?.label || 'General Review';
    onStartSession({
      subject: currentSubjectClean,
      topic: finalTopic
    });
  };

  const handleSelectSuggestion = (suggestedTopic) => {
    setTopicInput(suggestedTopic);
    onStartSession({
      subject: currentSubjectClean,
      topic: suggestedTopic
    });
  };

  return (
    <div
      data-testid="topic-selection-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-[#FAF5ED] rounded-t-[36px] sm:rounded-[36px] border border-[#E5E0D8] shadow-[0_24px_60px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col max-h-[90vh] animate-page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-3 flex items-center justify-between border-b border-black/[0.05]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FEF9EE] border border-[#F5A623]/30 flex items-center justify-center text-[#D97706]">
              <Sparkles size={16} />
            </span>
            <span className="text-[12px] font-bold text-[#D97706] tracking-wider uppercase">
              New Study Session
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#71717A] hover:text-[#0A0C0E] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {/* Headline */}
          <div>
            <h2 className="text-[22px] font-black text-[#0A0C0E] tracking-tight leading-snug">
              What topic do you want to study?
            </h2>
            <p className="text-[13.5px] text-[#71717A] mt-1 leading-relaxed">
              Type any concept or tap a recommended topic to begin a 3-minute bite-sized micro-session.
            </p>
          </div>

          {/* Subject Switcher: Native iOS Segmented Control */}
          {subjects.length > 1 && (
            <div>
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block mb-2">
                Select Subject
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#EFE9DF] border border-[#E5DFD4] overflow-x-auto no-scrollbar max-w-full">
                {subjects.map((sub) => {
                  const displayName = typeof sub === 'string' ? sub : sub.name;
                  const isSelected = normalizeSubject(displayName) === currentSubjectClean;
                  return (
                    <button
                      key={displayName}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(displayName);
                        setTopicInput('');
                      }}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#0A0C0E] text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
                          : 'text-[#636366] hover:text-[#0A0C0E]'
                      }`}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clean Topic Input Field */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-[#9CA3AF] pointer-events-none" />
              <input
                data-testid="topic-input"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={`e.g., Trigonometry, Organic Chemistry...`}
                className="w-full bg-white border border-[#E5E0D8] rounded-[20px] pl-11 pr-10 py-3.5 text-[15px] font-medium text-[#0A0C0E] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 shadow-2xs transition-all"
              />
              {topicInput && (
                <button
                  type="button"
                  onClick={() => setTopicInput('')}
                  className="absolute right-3.5 text-[#9CA3AF] hover:text-[#0A0C0E] p-1"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </form>

          {/* Quick-Pick Suggested Topics */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-[#8E8E93] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#D97706]" />
                Recommended for {currentSubjectClean}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((sug) => {
                const isSelected = topicInput.toLowerCase() === sug.label.toLowerCase();
                return (
                  <button
                    key={sug.label}
                    data-testid={`topic-suggestion-${sug.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleSelectSuggestion(sug.label)}
                    className={`w-full p-3.5 rounded-[18px] text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FEF9EE] border-2 border-[#D97706] shadow-2xs'
                        : 'bg-white border border-[#E5E0D8] hover:border-black/20 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[20px] leading-none">{sug.icon}</span>
                      <div>
                        <div className="text-[14.5px] font-bold text-[#0A0C0E] leading-snug">
                          {sug.label}
                        </div>
                        <div className="text-[12px] text-[#71717A] leading-tight mt-0.5 font-normal">
                          {sug.hint}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className={isSelected ? 'text-[#D97706]' : 'text-[#A1A1AA]'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Format Guarantee */}
          <div className="p-3.5 rounded-[18px] bg-white border border-black/[0.04] flex items-center gap-3 text-[#4B5563]">
            <Clock size={16} className="text-[#D97706] shrink-0" />
            <span className="text-[12px] leading-snug">
              <strong className="text-[#0A0C0E] font-bold">Bite-Sized Guarantee:</strong> 3 clean micro-parts + 1 quick check. Zero overwhelming walls of text.
            </span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-6 pt-3 bg-[#FAF5ED] border-t border-black/[0.05]">
          <button
            data-testid="start-micro-session-btn"
            type="button"
            onClick={handleSubmit}
            className="w-full h-[54px] bg-[#0A0C0E] hover:bg-[#1E2024] active:scale-[0.98] text-white rounded-full font-bold text-[15.5px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.18)] cursor-pointer transition-all"
          >
            <span>
              {topicInput ? `Start Studying "${topicInput}"` : 'Start Micro-Session'}
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
