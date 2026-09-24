import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  BookOpen,
  PenLine,
  Search,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Globe,
  Palette,
  Laptop,
  MoreHorizontal,
  Check,
  Clock,
  User,
  Calendar,
  ChevronDown,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Play,
  Home as HomeIcon,
  BarChart2,
  HelpCircle,
  LogOut,
  Flame,
  Mail,
  Phone,
} from 'lucide-react';

const SESSION_STORAGE_KEY = 'scholarise_session_v1';

const loadSavedSession = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading session from localStorage:', e);
  }
  return null;
};

export default function App() {
  const savedSession = loadSavedSession();

  // Persistent authentication flag: true if user reached Screen 7 or completed onboarding
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(savedSession?.isLoggedIn));

  // Step 0: Welcome screen
  // Step 1: Onboarding Step 2/4 - "Which exams are you preparing for?"
  // Step 2: Onboarding Step 3/4 - "What subject are you studying?"
  // Step 3: Onboarding Step 4/4 - "How much time can you usually study?"
  // Step 4: Onboarding Step 1/6 - "What's your name and age?"
  // Step 5: Onboarding Step 6/7 - "Upload your syllabus"
  // Step 6: Onboarding Step 7/7 - "Done" Screen with "Go" CTA
  // Step 7: Main App (Home / Progress / Profile)
  const [currentScreen, setCurrentScreen] = useState(() => {
    if (savedSession?.isLoggedIn) {
      return 7;
    }
    return savedSession?.currentScreen ?? 0;
  });

  // Screen 6 seamless orb transition: 'thinking' (0-2s) -> 'matched' (2-2.5s) -> 'done' (2.5s+)
  const [orbPhase, setOrbPhase] = useState('thinking');
  const [selectedExamType, setSelectedExamType] = useState(() => savedSession?.selectedExamType || 'upcoming');
  const [selectedSubjects, setSelectedSubjects] = useState(() => savedSession?.selectedSubjects || []);
  const [customSubject, setCustomSubject] = useState(() => savedSession?.customSubject || '');
  const [selectedTime, setSelectedTime] = useState(() => savedSession?.selectedTime || '15min');
  const [userName, setUserName] = useState(() => savedSession?.userName || '');
  const [userAge, setUserAge] = useState(() => savedSession?.userAge || '');
  const [isAgeDropdownOpen, setIsAgeDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(() => savedSession?.userEmail || '');
  const [userPhone, setUserPhone] = useState(() => savedSession?.userPhone || '');
  const [userCountryCode, setUserCountryCode] = useState(() => savedSession?.userCountryCode || '+1');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBtnPressed, setIsBtnPressed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => savedSession?.activeTab || 'home');
  const [isEditingSubjectsFromHome, setIsEditingSubjectsFromHome] = useState(false);
  const [selectedChartDay, setSelectedChartDay] = useState(null);
  // Real session tracking: each entry is { subject, durationMin, date (ISO string) }
  const [studySessions, setStudySessions] = useState(() => savedSession?.studySessions || []);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  };

  // Profile modal views: edit name & terms
  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [isViewingTerms, setIsViewingTerms] = useState(false);
  const customSubjectContainerRef = useRef(null);

  useEffect(() => {
    if (selectedSubjects.includes('other')) {
      setTimeout(() => {
        customSubjectContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
    }
  }, [selectedSubjects]);

  // ── Derived real progress data ──
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayName = dayNames[now.getDay()];

  // Get start of current week (Monday)
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setHours(0, 0, 0, 0);
    date.setDate(diff);
    return date;
  };
  const weekStart = getMonday(now);

  const thisWeekSessions = studySessions.filter((s) => new Date(s.date) >= weekStart);
  const totalSessionsThisWeek = thisWeekSessions.length;
  const totalMinutesThisWeek = thisWeekSessions.reduce((sum, s) => sum + s.durationMin, 0);

  const formatDuration = (mins) => {
    if (mins === 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Per-subject breakdown
  const subjectStats = {};
  thisWeekSessions.forEach((s) => {
    if (!subjectStats[s.subject]) subjectStats[s.subject] = { sessions: 0, minutes: 0 };
    subjectStats[s.subject].sessions += 1;
    subjectStats[s.subject].minutes += s.durationMin;
  });

  // 7-day chart data (Mon-Sun)
  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayLabel) => {
    const dayIndex = dayNames.indexOf(dayLabel);
    const dayMins = thisWeekSessions
      .filter((s) => new Date(s.date).getDay() === dayIndex)
      .reduce((sum, s) => sum + s.durationMin, 0);
    return { day: dayLabel, minutes: dayMins, isToday: dayLabel === todayDayName };
  });
  const maxChartMinutes = Math.max(...chartData.map((d) => d.minutes), 1); // avoid division by 0

  const handleEditSubjectsFromHome = () => {
    setIsEditingSubjectsFromHome(true);
    setCurrentScreen(2);
  };

  // Multi-subject toggle logic (allows selecting multiple subjects)
  const toggleSubject = (subId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subId)) {
        if (prev.length > 1) {
          return prev.filter((id) => id !== subId);
        }
        return prev; // keep at least 1 selected
      } else {
        return [...prev, subId];
      }
    });
  };

  // Transition from Screen 5 to Screen 6 starts the seamless single-orb lifecycle
  const handleProceedFromSyllabus = () => {
    setOrbPhase('thinking');
    setCurrentScreen(6);
  };

  // Orchestrate the seamless orb morphing when Screen 6 is active
  useEffect(() => {
    if (currentScreen === 6) {
      setOrbPhase('thinking');

      // 1. After 2.0s: The orb eases its rotation, pulses warmly, and resolves/matches
      const matchTimer = setTimeout(() => {
        setOrbPhase('matched');
      }, 2000);

      // 2. After 2.5s: Reveal the "Done" typography and "Go" button smoothly
      const doneTimer = setTimeout(() => {
        setOrbPhase('done');
      }, 2500);

      return () => {
        clearTimeout(matchTimer);
        clearTimeout(doneTimer);
      };
    }
  }, [currentScreen]);

  // Keep session synced to localStorage so refreshes and reopens remember the user
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      if (isLoggedIn || currentScreen === 7) {
        const sessionData = {
          isLoggedIn: true,
          currentScreen: 7,
          userName,
          userAge,
          userEmail,
          userPhone,
          userCountryCode,
          selectedSubjects,
          customSubject,
          selectedTime,
          selectedExamType,
          activeTab,
          studySessions,
        };
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } else if (!isLoggedIn && currentScreen === 0 && !userName) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync session to localStorage:', e);
    }
  }, [
    isLoggedIn,
    currentScreen,
    userName,
    userAge,
    userEmail,
    userPhone,
    userCountryCode,
    selectedSubjects,
    customSubject,
    selectedTime,
    selectedExamType,
    activeTab,
    studySessions,
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__setScreen = setCurrentScreen;
      window.__setActiveTab = setActiveTab;
      window.__setUserName = setUserName;
      window.__setSelectedSubjects = setSelectedSubjects;
      window.__setIsLoggedIn = setIsLoggedIn;
      window.__clearSession = () => {
        try {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (e) {}
        setIsLoggedIn(false);
        setCurrentScreen(0);
        setUserName('');
        setUserAge('');
        setUserEmail('');
        setUserPhone('');
        setSelectedSubjects([]);
        setStudySessions([]);
      };
    }
  }, []);

  const examOptions = [
    {
      id: 'upcoming',
      title: 'An upcoming exam',
      description: "I have a specific exam date I'm preparing for.",
      icon: ListChecks,
    },
    {
      id: 'regular',
      title: 'Regular studying',
      description: 'I want to stay on top of my subjects and learn consistently.',
      icon: BookOpen,
    },
    {
      id: 'assignment',
      title: 'An assignment',
      description: 'I need help planning and completing an assignment.',
      icon: PenLine,
    },
  ];

  const subjects = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: Calculator,
      badgeBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
    {
      id: 'science',
      name: 'Science',
      icon: FlaskConical,
      badgeBg: 'bg-[#FFE4E6]',
      iconColor: 'text-[#E11D48]',
    },
    {
      id: 'english',
      name: 'English',
      icon: BookOpen,
      badgeBg: 'bg-[#E0F2FE]',
      iconColor: 'text-[#0284C7]',
    },
    {
      id: 'physics',
      name: 'Physics',
      icon: Atom,
      badgeBg: 'bg-[#FCE7F3]',
      iconColor: 'text-[#7C3AED]',
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      icon: FlaskConical,
      badgeBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#9333EA]',
    },
    {
      id: 'biology',
      name: 'Biology',
      icon: Leaf,
      badgeBg: 'bg-[#DCFCE7]',
      iconColor: 'text-[#16A34A]',
    },
    {
      id: 'history',
      name: 'History',
      icon: Globe,
      badgeBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
    {
      id: 'art',
      name: 'Art',
      icon: Palette,
      badgeBg: 'bg-[#FFE4E6]',
      iconColor: 'text-[#E11D48]',
    },
    {
      id: 'cs',
      name: 'Computer Science',
      icon: Laptop,
      badgeBg: 'bg-[#F1F5F9]',
      iconColor: 'text-[#475569]',
    },
    {
      id: 'other',
      name: 'Other',
      icon: MoreHorizontal,
      badgeBg: 'bg-[#F5F2EB]',
      iconColor: 'text-[#71717A]',
    },
  ];

  const timeOptions = [
    {
      id: '15min',
      title: '15 minutes',
      description: 'Quick focused sessions',
    },
    {
      id: '30min',
      title: '30 minutes',
      description: 'Good for most topics',
    },
    {
      id: '45min',
      title: '45 minutes',
      description: 'Ideal for deep work',
    },
    {
      id: '60min',
      title: '1 hour or more',
      description: 'For bigger goals',
    },
  ];

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-[100dvh] bg-[#0a0b0e] flex items-center justify-center p-0 sm:p-4 font-sans select-none antialiased overflow-hidden">
      {/* Mobile Screen Chassis / Viewport */}
      <div
        data-mobile-screen
        className="relative w-full h-[100dvh] sm:h-[870px] sm:w-[414px] sm:rounded-[48px] sm:border-[10px] sm:border-[#1c1d22] sm:shadow-[0_32px_100px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col justify-between"
        style={{
          backgroundColor: '#FAF5ED',
        }}
      >
        {/* Floating In-App Toast Message (Apple Dynamic Island style) */}
        {toastMessage && (
          <div className="absolute top-5 inset-x-0 flex justify-center z-50 pointer-events-none px-4">
            <div className="bg-[#0A0C0E]/95 backdrop-blur-md text-white text-[13px] font-[600] px-4 py-2 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10 flex items-center gap-2 animate-toast pointer-events-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ======================= SCREEN 0: WELCOME SCREEN ======================== */}
        {/* ========================================================================= */}
        {currentScreen === 0 && (
          <div className="relative w-full h-full flex flex-col justify-between animate-page-enter">
            {/* Authentic Original Full Background Artwork - Elevated to guarantee zero overlap with pagination */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <img
                src="/background_art.png"
                alt="Background Artwork"
                className="w-full h-full object-cover object-top transform -translate-y-12 scale-[0.98]"
                draggable="false"
              />
            </div>

            {/* Header: Logo (Clean top, zero notch/status bar, zero extraneous indicators) */}
            <div className="relative z-30 pt-8 sm:pt-10 px-8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo_mark.png"
                  alt="Scholarise Logo"
                  className="h-[38px] w-auto object-contain select-none"
                  draggable="false"
                />
                <span className="text-[23px] font-bold tracking-tight text-[#0A0C0E]">
                  Scholarise
                </span>
              </div>
            </div>

            {/* Hero Copy */}
            <div className="relative z-20 px-8 pt-8 flex-1 flex flex-col justify-start">
              <h1 className="text-[50px] sm:text-[52px] leading-[1.12] font-[800] tracking-[-0.038em]">
                <span className="block text-[#0A0C0E]">Study</span>
                <span className="block text-[#0A0C0E]">smarter,</span>
                <span className="block text-[#52525B]">not harder.</span>
              </h1>
              <p className="mt-4 text-[17px] leading-[1.4] text-[#4B5563] font-[450] max-w-[270px] tracking-[-0.015em]">
                A personalized plan that turns your workload into a clear next step.
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-30 px-7 pb-5 flex flex-col items-center gap-4">
              {/* Pagination: 7 Steps (1st active pill + 6 inactive dots) */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                <span className="w-[28px] h-[6px] bg-[#0A0C0E] rounded-full" />
                <span className="w-[6px] h-[6px] bg-[#D4CDBC] rounded-full" />
                <span className="w-[6px] h-[6px] bg-[#D4CDBC] rounded-full" />
                <span className="w-[6px] h-[6px] bg-[#D4CDBC] rounded-full" />
                <span className="w-[6px] h-[6px] bg-[#D4CDBC] rounded-full" />
                <span className="w-[6px] h-[6px] bg-[#D4CDBC] rounded-full" />
                <span className="w-[6px] h-[6px] bg-[#D4CDBC] rounded-full" />
              </div>

              {/* Primary CTA Button */}
              <button
                onMouseDown={() => setIsBtnPressed(true)}
                onMouseUp={() => setIsBtnPressed(false)}
                onTouchStart={() => setIsBtnPressed(true)}
                onTouchEnd={() => setIsBtnPressed(false)}
                onClick={() => setCurrentScreen(1)}
                className={`w-full h-[58px] bg-[#0A0C0E] hover:bg-[#1C1E24] active:bg-[#000000] rounded-full flex items-center justify-center gap-2.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] cursor-pointer transition-all duration-200 select-none ${
                  isBtnPressed ? 'scale-[0.98] brightness-110' : ''
                }`}
              >
                <span className="text-[17px] font-semibold tracking-[-0.01em]">
                  Get Started
                </span>
                <ArrowRight size={18} strokeWidth={2.5} className="text-white/95" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ============= SCREEN 1: ONBOARDING STEP 2/4 (EXAM SELECTION) ============= */}
        {/* ========================================================================= */}
        {currentScreen === 1 && (
          <div className="relative w-full h-full flex flex-col justify-between animate-page-enter bg-[#FAF5ED]">
            {/* Clear, focused background - zero visual distraction for onboarding inputs */}

            {/* Navigation Header: Back Chevron + 7-Segment Progress Bar (2 active) + '2 / 7' Counter */}
            <div className="relative z-30 pt-8 sm:pt-9 px-7 flex items-center justify-between">
              {/* Back Arrow */}
              <button
                onClick={() => setCurrentScreen(0)}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#0A0C0E] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to previous screen"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>

              {/* 7-Segment Progress Indicator (2 of 7 active) */}
              <div className="flex items-center gap-1.5">
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
              </div>

              {/* Step Ratio Indicator */}
              <div className="text-[15px] font-[500] text-[#71717A] tracking-tight pr-1">
                2 / 7
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-20 px-7 pt-6 flex-1 flex flex-col justify-start">
              {/* Question Headline (Exact to reference mock) */}
              <h1 className="text-[34px] sm:text-[36px] font-[800] leading-[1.12] text-[#0A0C0E] tracking-tight">
                Which exams<br />
                are you preparing<br />
                for?
              </h1>

              {/* Subtitle Explainer */}
              <p className="mt-3.5 text-[15px] leading-[1.4] text-[#71717A] font-[450] max-w-[310px]">
                This helps me create the right type of study plan for you. You can add more later.
              </p>

              {/* Option Selection Cards */}
              <div className="mt-6 flex flex-col gap-3.5">
                {/* Option 1: An upcoming exam */}
                <button
                  onClick={() => setSelectedExamType('upcoming')}
                  className={`w-full p-4 rounded-[24px] flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                    selectedExamType === 'upcoming'
                      ? 'bg-[#FEF9EE] border-[1.5px] border-[#F5A623] shadow-[0_6px_20px_rgba(245,166,35,0.12)]'
                      : 'bg-white/90 backdrop-blur-sm border border-black/[0.06] hover:border-black/15 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checklist Icon Badge */}
                    <div
                      className={`w-[50px] h-[50px] rounded-[18px] flex items-center justify-center shrink-0 transition-colors ${
                        selectedExamType === 'upcoming' ? 'bg-[#FDE89C]' : 'bg-[#F5F2EB]'
                      }`}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0A0C0E"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="4" />
                        <line x1="7" y1="8" x2="8" y2="8" />
                        <line x1="11" y1="8" x2="17" y2="8" />
                        <line x1="7" y1="12" x2="8" y2="12" />
                        <line x1="11" y1="12" x2="17" y2="12" />
                        <line x1="7" y1="16" x2="8" y2="16" />
                        <line x1="11" y1="16" x2="17" y2="16" />
                      </svg>
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="text-[16px] font-bold text-[#0A0C0E] tracking-tight leading-snug">
                        An upcoming exam
                      </div>
                      <div className="text-[13px] font-normal text-[#71717A] leading-snug mt-0.5">
                        I have a specific exam date<br />I'm preparing for.
                      </div>
                    </div>
                  </div>

                  {/* Right Chevron Affordance (1:1 with mock) */}
                  <div className="pr-1 text-[#0A0C0E] shrink-0">
                    <ChevronRight size={18} strokeWidth={2.4} />
                  </div>
                </button>

                {/* Option 2: Regular studying */}
                <button
                  onClick={() => setSelectedExamType('regular')}
                  className={`w-full p-4 rounded-[24px] flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                    selectedExamType === 'regular'
                      ? 'bg-[#FEF9EE] border-[1.5px] border-[#F5A623] shadow-[0_6px_20px_rgba(245,166,35,0.12)]'
                      : 'bg-white/90 backdrop-blur-sm border border-black/[0.06] hover:border-black/15 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Book Icon Badge */}
                    <div
                      className={`w-[50px] h-[50px] rounded-[18px] flex items-center justify-center shrink-0 transition-colors ${
                        selectedExamType === 'regular' ? 'bg-[#FDE89C]' : 'bg-[#F5F2EB]'
                      }`}
                    >
                      <BookOpen size={22} strokeWidth={2.1} className="text-[#0A0C0E]" />
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="text-[16px] font-bold text-[#0A0C0E] tracking-tight leading-snug">
                        Regular studying
                      </div>
                      <div className="text-[13px] font-normal text-[#71717A] leading-snug mt-0.5">
                        I want to stay on top of my<br />subjects and learn consistently.
                      </div>
                    </div>
                  </div>

                  {/* Right Chevron Affordance */}
                  <div className="pr-1 text-[#0A0C0E] shrink-0">
                    <ChevronRight size={18} strokeWidth={2.4} />
                  </div>
                </button>

                {/* Option 3: An assignment */}
                <button
                  onClick={() => setSelectedExamType('assignment')}
                  className={`w-full p-4 rounded-[24px] flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                    selectedExamType === 'assignment'
                      ? 'bg-[#FEF9EE] border-[1.5px] border-[#F5A623] shadow-[0_6px_20px_rgba(245,166,35,0.12)]'
                      : 'bg-white/90 backdrop-blur-sm border border-black/[0.06] hover:border-black/15 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Assignment / Pen Icon Badge */}
                    <div
                      className={`w-[50px] h-[50px] rounded-[18px] flex items-center justify-center shrink-0 transition-colors ${
                        selectedExamType === 'assignment' ? 'bg-[#FDE89C]' : 'bg-[#F5F2EB]'
                      }`}
                    >
                      <PenLine size={22} strokeWidth={2.1} className="text-[#0A0C0E]" />
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="text-[16px] font-bold text-[#0A0C0E] tracking-tight leading-snug">
                        An assignment
                      </div>
                      <div className="text-[13px] font-normal text-[#71717A] leading-snug mt-0.5">
                        I need help planning and<br />completing an assignment.
                      </div>
                    </div>
                  </div>

                  {/* Right Chevron Affordance */}
                  <div className="pr-1 text-[#0A0C0E] shrink-0">
                    <ChevronRight size={18} strokeWidth={2.4} />
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Unified CTA Button: "Continue" + Circular Right Arrow Badge */}
            <div className="relative z-30 px-7 pb-5 flex flex-col items-center gap-3">
              <button
                onMouseDown={() => setIsBtnPressed(true)}
                onMouseUp={() => setIsBtnPressed(false)}
                onTouchStart={() => setIsBtnPressed(true)}
                onTouchEnd={() => setIsBtnPressed(false)}
                onClick={() => {
                  setCurrentScreen(2);
                }}
                className={`w-full h-[62px] bg-[#0A0C0E] hover:bg-[#1C1E24] active:scale-[0.98] rounded-full flex items-center justify-between pl-8 pr-2 text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] cursor-pointer transition-all duration-200 select-none ${
                  isBtnPressed ? 'brightness-110' : ''
                }`}
              >
                <span className="text-[17px] font-semibold tracking-[-0.01em]">
                  Continue
                </span>
                <div className="w-[46px] h-[46px] rounded-full bg-[#27272A] flex items-center justify-center text-white shrink-0">
                  <ArrowRight size={20} strokeWidth={2.4} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ============ SCREEN 2: ONBOARDING STEP 3/4 (SUBJECT SELECTION) ============ */}
        {/* ========================================================================= */}
        {currentScreen === 2 && (
          <div className="relative w-full h-full flex flex-col justify-between animate-page-enter bg-[#FAF5ED]">
            {/* Clear, focused background - zero visual distraction for onboarding inputs */}

            {/* Navigation Header */}
            <div className="relative z-30 pt-8 sm:pt-9 px-7 flex items-center justify-between">
              {/* Back Arrow */}
              <button
                onClick={() => {
                  if (isEditingSubjectsFromHome) {
                    setIsEditingSubjectsFromHome(false);
                    setCurrentScreen(7);
                  } else {
                    setCurrentScreen(1);
                  }
                }}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#0A0C0E] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>

              {isEditingSubjectsFromHome ? (
                <>
                  <div className="text-[17px] font-[700] text-[#0A0C0E] tracking-tight">
                    Edit subjects
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSubjectsFromHome(false);
                      setCurrentScreen(7);
                    }}
                    className="text-[15px] font-[700] text-[#D97706] hover:text-[#B45309] active:scale-95 transition-transform cursor-pointer py-1 px-1 -mr-1"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  {/* 7-Segment Progress Indicator (3 of 7 active) */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                    <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                    <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                    <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                    <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                    <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                    <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                  </div>

                  {/* Step Ratio Indicator */}
                  <div className="text-[15px] font-[500] text-[#71717A] tracking-tight pr-1">
                    3 / 7
                  </div>
                </>
              )}
            </div>

            {/* Main Content Area */}
            <div className="relative z-20 px-7 pt-4 pb-8 flex-1 flex flex-col justify-start overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Question Headline (Exact to reference mock) */}
              <h1 className="text-[34px] sm:text-[36px] font-[800] leading-[1.12] text-[#0A0C0E] tracking-tight">
                {isEditingSubjectsFromHome ? 'Manage your subjects' : 'What subject are you studying?'}
              </h1>

              {/* Subtitle Explainer */}
              <p className="mt-2.5 text-[15px] leading-[1.4] text-[#71717A] font-[450] max-w-[310px]">
                {isEditingSubjectsFromHome
                  ? 'Select or deselect subjects to update your daily study dashboard.'
                  : 'Choose the subjects you want to focus on. You can select multiple.'}
              </p>

              {/* Search Bar with WCAG AA compliant contrast */}
              <div className="mt-4 w-full bg-[#F3EFE7] border border-black/[0.05] rounded-[18px] px-4 py-2.5 flex items-center gap-2.5 shadow-2xs">
                <Search size={18} className="text-[#6B7280] shrink-0" strokeWidth={2.2} />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-[14.5px] text-[#0A0C0E] placeholder-[#6B7280] outline-none w-full font-medium"
                />
              </div>

              {/* 3x3 Subjects Grid (Uniform, compact spacing with content-start) */}
              <div className="mt-3.5 grid grid-cols-3 gap-3 content-start">
                {filteredSubjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  const IconComp = sub.icon;
                  const displayName = sub.id === 'other' ? (customSubject.trim() || 'Other') : sub.name;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`relative aspect-square p-2 rounded-[24px] flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FEF9EE] border-[1.5px] border-[#F5A623] shadow-[0_4px_16px_rgba(245,166,35,0.12)] scale-[1.02]'
                          : 'bg-white/95 border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-black/15'
                      }`}
                    >
                      {/* Top Right Radio / Check Indicator */}
                      <div
                        className={`w-[20px] h-[20px] rounded-full flex items-center justify-center absolute top-2.5 right-2.5 transition-all ${
                          isSelected
                            ? 'bg-[#D97706] text-white shadow-xs'
                            : 'border-[1.5px] border-[#E2DBD1] bg-transparent'
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3.4} className="text-white" />}
                      </div>

                      {/* Icon Badge in Squircle */}
                      <div
                        className={`w-[48px] h-[48px] rounded-[16px] flex items-center justify-center shrink-0 mb-1.5 transition-colors ${sub.badgeBg}`}
                      >
                        <IconComp size={24} strokeWidth={2.1} className={sub.iconColor} />
                      </div>

                      {/* Subject Name Label with Balanced Clearance */}
                      <span className="text-[12px] font-[600] text-[#0A0C0E] tracking-tight leading-[1.15] px-1 truncate max-w-full">
                        {displayName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Subject Input Field: Pops in when 'other' is selected */}
              {selectedSubjects.includes('other') && (
                <div
                  ref={customSubjectContainerRef}
                  className="mt-3.5 mb-4 w-full bg-white border-[1.5px] border-[#F5A623] rounded-[20px] px-4 py-3 shadow-[0_6px_20px_rgba(245,166,35,0.12)] flex items-center justify-between gap-3 animate-fadeIn"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-[36px] h-[36px] rounded-[12px] bg-[#FEF3C7] flex items-center justify-center shrink-0 text-[#D97706]">
                      <MoreHorizontal size={20} strokeWidth={2.5} />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type subject name (required)..."
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="bg-transparent text-[14.5px] text-[#0A0C0E] placeholder-[#9CA3AF] outline-none w-full font-semibold"
                    />
                  </div>
                  {!customSubject.trim() && (
                    <span className="text-[11px] font-[600] text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full shrink-0">
                      Required
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Unified CTA Button */}
            <div className="relative z-30 px-7 pb-5 flex flex-col items-center gap-3">
              {(() => {
                const isSubjectSelectionValid =
                  selectedSubjects.length > 0 &&
                  (!selectedSubjects.includes('other') || customSubject.trim().length > 0);

                return (
                  <button
                    disabled={!isSubjectSelectionValid}
                    onMouseDown={() => isSubjectSelectionValid && setIsBtnPressed(true)}
                    onMouseUp={() => setIsBtnPressed(false)}
                    onTouchStart={() => isSubjectSelectionValid && setIsBtnPressed(true)}
                    onTouchEnd={() => setIsBtnPressed(false)}
                    onClick={() => {
                      if (isSubjectSelectionValid) {
                        if (isEditingSubjectsFromHome) {
                          setIsEditingSubjectsFromHome(false);
                          setCurrentScreen(7);
                        } else {
                          setCurrentScreen(3);
                        }
                      }
                    }}
                    className={`w-full h-[62px] rounded-full flex items-center justify-between pl-8 pr-2 transition-all duration-200 select-none ${
                      isSubjectSelectionValid
                        ? 'bg-[#0A0C0E] hover:bg-[#1C1E24] active:scale-[0.98] text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] cursor-pointer'
                        : 'bg-[#E5E0D8] text-[#9CA3AF] cursor-not-allowed shadow-none'
                    } ${isBtnPressed && isSubjectSelectionValid ? 'brightness-110' : ''}`}
                  >
                    <span className="text-[17px] font-semibold tracking-[-0.01em]">
                      {isEditingSubjectsFromHome ? 'Save Changes' : 'Continue'}
                    </span>
                    <div
                      className={`w-[46px] h-[46px] rounded-full flex items-center justify-center text-white shrink-0 transition-colors ${
                        isSubjectSelectionValid ? 'bg-[#27272A]' : 'bg-[#D6D0C7]'
                      }`}
                    >
                      {isEditingSubjectsFromHome ? (
                        <Check size={20} strokeWidth={2.4} />
                      ) : (
                        <ArrowRight size={20} strokeWidth={2.4} />
                      )}
                    </div>
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ============ SCREEN 3: ONBOARDING STEP 4/4 (TIME DURATION) ============= */}
        {/* ========================================================================= */}
        {currentScreen === 3 && (
          <div className="relative w-full h-full flex flex-col justify-between animate-page-enter bg-[#FAF5ED]">
            {/* Clear, focused background - zero visual distraction */}

            {/* Navigation Header: Back Chevron + 7-Segment Progress Bar (4 active) + '4 / 7' Counter */}
            <div className="relative z-30 pt-8 sm:pt-9 px-7 flex items-center justify-between">
              {/* Back Arrow */}
              <button
                onClick={() => setCurrentScreen(2)}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#0A0C0E] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to previous screen"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>

              {/* 7-Segment Progress Indicator (4 of 7 active) */}
              <div className="flex items-center gap-1.5">
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
              </div>

              {/* Step Ratio Indicator */}
              <div className="text-[15px] font-[500] text-[#71717A] tracking-tight pr-1">
                4 / 7
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-20 px-7 pt-6 flex-1 flex flex-col justify-start">
              {/* Question Headline (Exact to reference mock) */}
              <h1 className="text-[34px] sm:text-[36px] font-[800] leading-[1.12] text-[#0A0C0E] tracking-tight">
                How much time<br />
                can you usually<br />
                study?
              </h1>

              {/* Subtitle Explainer */}
              <p className="mt-3.5 text-[15px] leading-[1.4] text-[#71717A] font-[450] max-w-[310px]">
                This helps create a realistic plan that actually works for you.
              </p>

              {/* Duration Selection Cards (4 options matching mock) */}
              <div className="mt-6 flex flex-col gap-3.5">
                {timeOptions.map((opt) => {
                  const isSelected = selectedTime === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedTime(opt.id)}
                      className={`w-full p-4 rounded-[24px] flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FEF9EE] border-[1.5px] border-[#F5A623] shadow-[0_6px_20px_rgba(245,166,35,0.12)]'
                          : 'bg-white/95 border border-black/[0.06] hover:border-black/15 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Clock Icon Badge (Dynamic hands indicating duration) */}
                        <div
                          className={`w-[50px] h-[50px] rounded-[18px] flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-[#FDE89C]' : 'bg-[#F5F2EB]'
                          }`}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#0A0C0E"
                            strokeWidth="2.1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <polyline points="12 6 12 12" />
                            {opt.id === '15min' && <line x1="12" y1="12" x2="16.5" y2="12" />}
                            {opt.id === '30min' && <line x1="12" y1="12" x2="12" y2="16.5" />}
                            {opt.id === '45min' && <line x1="12" y1="12" x2="7.5" y2="12" />}
                            {opt.id === '60min' && <line x1="12" y1="12" x2="12" y2="7.5" />}
                          </svg>
                        </div>

                        {/* Text Details */}
                        <div>
                          <div className="text-[16px] font-bold text-[#0A0C0E] tracking-tight leading-snug">
                            {opt.title}
                          </div>
                          <div className="text-[13px] font-normal text-[#71717A] leading-snug mt-0.5">
                            {opt.description}
                          </div>
                        </div>
                      </div>

                      {/* Apple-Grade Radio Affordance (1:1 with mock) */}
                      <div className="pl-2 pr-1 shrink-0">
                        <div
                          className={`w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[2px] border-[#F5A623] bg-transparent'
                              : 'border-[1.5px] border-[#D1D5DB] bg-transparent'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-[9px] h-[9px] rounded-full bg-[#F5A623]" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Unified CTA Button: "Continue" + Circular Right Arrow Badge */}
            <div className="relative z-30 px-7 pb-5 flex flex-col items-center gap-3">
              <button
                onMouseDown={() => setIsBtnPressed(true)}
                onMouseUp={() => setIsBtnPressed(false)}
                onTouchStart={() => setIsBtnPressed(true)}
                onTouchEnd={() => setIsBtnPressed(false)}
                onClick={() => {
                  setCurrentScreen(4);
                }}
                className={`w-full h-[62px] bg-[#0A0C0E] hover:bg-[#1C1E24] active:scale-[0.98] rounded-full flex items-center justify-between pl-8 pr-2 text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] cursor-pointer transition-all duration-200 select-none ${
                  isBtnPressed ? 'brightness-110' : ''
                }`}
              >
                <span className="text-[17px] font-semibold tracking-[-0.01em]">
                  Continue
                </span>
                <div className="w-[46px] h-[46px] rounded-full bg-[#27272A] flex items-center justify-center text-white shrink-0">
                  <ArrowRight size={20} strokeWidth={2.4} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ============ SCREEN 4: ONBOARDING STEP 1/6 (NAME AND AGE) ============== */}
        {/* ========================================================================= */}
        {currentScreen === 4 && (
          <div className="relative w-full h-full flex flex-col justify-between animate-page-enter bg-[#FAF5ED]">
            {/* Clear, focused background - zero visual distraction */}

            {/* Navigation Header: Back Chevron + 7-Segment Progress Bar (5 active) + '5 / 7' Counter */}
            <div className="relative z-30 pt-8 sm:pt-9 px-7 flex items-center justify-between">
              {/* Back Arrow */}
              <button
                onClick={() => setCurrentScreen(3)}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#0A0C0E] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to previous screen"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>

              {/* 7-Segment Progress Indicator (5 of 7 active) */}
              <div className="flex items-center gap-1.5">
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
              </div>

              {/* Step Ratio Indicator */}
              <div className="text-[15px] font-[500] text-[#71717A] tracking-tight pr-1">
                5 / 7
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-20 px-7 pt-4 pb-2 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start">
              {/* Question Headline */}
              <h1 className="text-[32px] sm:text-[34px] font-[800] leading-[1.12] text-[#0A0C0E] tracking-tight">
                What's your<br />
                name and details?
              </h1>

              {/* Subtitle Explainer */}
              <p className="mt-2 text-[14px] leading-[1.4] text-[#636366] font-[450] max-w-[310px]">
                This helps us create a plan that's personalized for you.
              </p>

              {/* Form Fields Container */}
              <div className="mt-5 flex flex-col gap-4">
                {/* 1. Your Name Input Field */}
                <div>
                  <label className="block text-[13.5px] font-[700] text-[#0A0C0E] mb-1.5 tracking-tight">
                    Your name <span className="text-[#E11D48]">*</span>
                  </label>
                  <div className="w-full min-h-[52px] bg-white border border-[#E5E0D8] rounded-[20px] px-4 py-3 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-[#0A0C0E] focus-within:ring-2 focus-within:ring-[#0A0C0E]/10 transition-all">
                    <User size={19} strokeWidth={2} className="text-[#636366] shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter your name..."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-transparent text-[15px] text-[#0A0C0E] placeholder-[#8E8E93] outline-none w-full font-medium"
                    />
                  </div>
                </div>

                {/* 2. Your Age Dropdown Field */}
                <div className="relative">
                  <label className="block text-[13.5px] font-[700] text-[#0A0C0E] mb-1.5 tracking-tight">
                    Your age <span className="text-[#E11D48]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAgeDropdownOpen(!isAgeDropdownOpen);
                      setIsCountryDropdownOpen(false);
                    }}
                    className="w-full min-h-[52px] bg-white border border-[#E5E0D8] rounded-[20px] px-4 py-3 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-black/20 focus:border-[#0A0C0E] focus:ring-2 focus:ring-[#0A0C0E]/10 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={19} strokeWidth={2} className="text-[#636366] shrink-0" />
                      <span className={`text-[15px] font-medium ${userAge ? 'text-[#0A0C0E]' : 'text-[#8E8E93]'}`}>
                        {userAge || 'Select your age...'}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      className={`text-[#636366] transition-transform duration-200 ${isAgeDropdownOpen ? 'rotate-180 text-[#0A0C0E]' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu Options */}
                  {isAgeDropdownOpen && (
                    <div className="absolute top-[78px] inset-x-0 bg-white border border-[#E5E0D8] rounded-[22px] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-40 animate-fadeIn flex flex-col gap-1">
                      {['Under 14', '14 – 17', '18 – 22', '23 – 25', '26+'].map((ageOption) => (
                        <button
                          key={ageOption}
                          type="button"
                          onClick={() => {
                            setUserAge(ageOption);
                            setIsAgeDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 rounded-[14px] text-left text-[14px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            userAge === ageOption ? 'bg-[#FEF9EE] text-[#D97706] font-semibold' : 'text-[#0A0C0E] hover:bg-black/5'
                          }`}
                        >
                          <span>{ageOption}</span>
                          {userAge === ageOption && <Check size={16} strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Your Email Input Field (Compulsory) */}
                <div>
                  <label className="block text-[13.5px] font-[700] text-[#0A0C0E] mb-1.5 tracking-tight">
                    Email address <span className="text-[#E11D48]">*</span>
                  </label>
                  <div className={`w-full min-h-[52px] bg-white border ${
                    userEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())
                      ? 'border-[#E11D48] ring-1 ring-[#E11D48]/20'
                      : 'border-[#E5E0D8]'
                  } rounded-[20px] px-4 py-3 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-[#0A0C0E] focus-within:ring-2 focus-within:ring-[#0A0C0E]/10 transition-all`}>
                    <Mail size={19} strokeWidth={2} className="text-[#636366] shrink-0" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="bg-transparent text-[15px] text-[#0A0C0E] placeholder-[#8E8E93] outline-none w-full font-medium"
                    />
                  </div>
                  {userEmail.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim()) && (
                    <p className="text-[11.5px] text-[#E11D48] mt-1 pl-1 font-medium">
                      Please enter a valid email address (e.g. name@example.com)
                    </p>
                  )}
                </div>

                {/* 4. Your Phone Number with Country Code (Compulsory) */}
                <div className="relative">
                  <label className="block text-[13.5px] font-[700] text-[#0A0C0E] mb-1.5 tracking-tight">
                    Phone number <span className="text-[#E11D48]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Country Code Picker Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCountryDropdownOpen(!isCountryDropdownOpen);
                        setIsAgeDropdownOpen(false);
                      }}
                      className="min-h-[52px] bg-white border border-[#E5E0D8] rounded-[20px] px-3 py-3 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-black/20 focus:border-[#0A0C0E] transition-all cursor-pointer shrink-0"
                    >
                      <span className="text-[14.5px] font-[600] text-[#0A0C0E]">{userCountryCode}</span>
                      <ChevronDown size={14} strokeWidth={2.4} className="text-[#636366]" />
                    </button>

                    {/* Phone Input */}
                    <div className={`flex-1 min-h-[52px] bg-white border ${
                      userPhone.trim() && userPhone.trim().replace(/\D/g, '').length < 6
                        ? 'border-[#E11D48] ring-1 ring-[#E11D48]/20'
                        : 'border-[#E5E0D8]'
                    } rounded-[20px] px-4 py-3 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-[#0A0C0E] focus-within:ring-2 focus-within:ring-[#0A0C0E]/10 transition-all`}>
                      <Phone size={18} strokeWidth={2} className="text-[#636366] shrink-0" />
                      <input
                        type="tel"
                        placeholder="555-0199"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="bg-transparent text-[15px] text-[#0A0C0E] placeholder-[#8E8E93] outline-none w-full font-medium"
                      />
                    </div>
                  </div>
                  {userPhone.trim().length > 0 && userPhone.trim().replace(/\D/g, '').length < 6 && (
                    <p className="text-[11.5px] text-[#E11D48] mt-1 pl-1 font-medium">
                      Please enter a valid phone number (at least 6 digits)
                    </p>
                  )}

                  {/* Country Code Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-[78px] left-0 w-[200px] bg-white border border-[#E5E0D8] rounded-[20px] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-40 animate-fadeIn flex flex-col gap-1 max-h-[180px] overflow-y-auto no-scrollbar">
                      {[
                        { code: '+1', flag: '🇺🇸', name: 'US / CA' },
                        { code: '+91', flag: '🇮🇳', name: 'India' },
                        { code: '+44', flag: '🇬🇧', name: 'UK' },
                        { code: '+61', flag: '🇦🇺', name: 'Australia' },
                        { code: '+49', flag: '🇩🇪', name: 'Germany' },
                        { code: '+33', flag: '🇫🇷', name: 'France' },
                        { code: '+81', flag: '🇯🇵', name: 'Japan' },
                        { code: '+971', flag: '🇦🇪', name: 'UAE' },
                      ].map((item) => (
                        <button
                          key={item.code + item.name}
                          type="button"
                          onClick={() => {
                            setUserCountryCode(item.code);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-[12px] text-left text-[13.5px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            userCountryCode === item.code ? 'bg-[#FEF9EE] text-[#D97706] font-semibold' : 'text-[#0A0C0E] hover:bg-black/5'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.name}</span>
                          </span>
                          <span className="text-[12px] text-[#636366]">{item.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Unified CTA Button: "Continue" + Circular Right Arrow Badge */}
            <div className="relative z-30 px-7 pb-5 flex flex-col items-center gap-3">
              {(() => {
                const isNameValid = userName.trim().length > 0;
                const isAgeValid = Boolean(userAge);
                const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
                const isPhoneValid = userPhone.trim().replace(/\D/g, '').length >= 6;
                const isFormValid = isNameValid && isAgeValid && isEmailValid && isPhoneValid;

                return (
                  <button
                    disabled={!isFormValid}
                    onMouseDown={() => isFormValid && setIsBtnPressed(true)}
                    onMouseUp={() => setIsBtnPressed(false)}
                    onTouchStart={() => isFormValid && setIsBtnPressed(true)}
                    onTouchEnd={() => setIsBtnPressed(false)}
                    onClick={() => {
                      if (isFormValid) {
                        setCurrentScreen(5);
                      }
                    }}
                    className={`w-full h-[62px] rounded-full flex items-center justify-between pl-8 pr-2 transition-all duration-200 select-none ${
                      isFormValid
                        ? 'bg-[#0A0C0E] hover:bg-[#1C1E24] active:scale-[0.98] text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] cursor-pointer'
                        : 'bg-[#E5E0D8] text-[#9CA3AF] cursor-not-allowed shadow-none'
                    } ${isBtnPressed && isFormValid ? 'brightness-110' : ''}`}
                  >
                    <span className="text-[17px] font-semibold tracking-[-0.01em]">
                      Continue
                    </span>
                    <div
                      className={`w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isFormValid ? 'bg-[#27272A] text-white' : 'bg-[#D6D0C7] text-[#9CA3AF]'
                      }`}
                    >
                      <ArrowRight size={20} strokeWidth={2.4} />
                    </div>
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ============ SCREEN 5: ONBOARDING STEP 7/7 (UPLOAD SYLLABUS) ============ */}
        {/* ========================================================================= */}
        {currentScreen === 5 && (
          <div className="relative w-full h-full flex flex-col justify-between animate-page-enter bg-[#FAF5ED]">
            {/* Clear, focused background - zero visual distraction */}

            {/* Navigation Header: Back Chevron + 7-Segment Progress Bar (6 active) + Skip on right */}
            <div className="relative z-30 pt-8 sm:pt-9 px-7 flex items-center justify-between">
              {/* Back Arrow */}
              <button
                onClick={() => setCurrentScreen(4)}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#0A0C0E] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to previous screen"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>

              {/* 7-Segment Progress Indicator (6 of 7 active) */}
              <div className="flex items-center gap-1.5">
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#E5E0D8] rounded-full" />
              </div>

              {/* Top Skip Button - Moved to header so bottom Continue button stays locked in place */}
              <button
                type="button"
                onClick={handleProceedFromSyllabus}
                className="text-[15px] font-[600] text-[#71717A] hover:text-[#0A0C0E] active:scale-95 transition-all cursor-pointer py-1 px-1 -mr-1 select-none"
              >
                Skip
              </button>
            </div>

            {/* Main Content Area */}
            <div className="relative z-20 px-7 pt-5 flex-1 flex flex-col justify-start">
              {/* Question Headline (Exact to reference mock) */}
              <h1 className="text-[34px] sm:text-[36px] font-[800] leading-[1.12] text-[#0A0C0E] tracking-tight">
                Upload your<br />
                syllabus
              </h1>

              {/* Subtitle Explainer */}
              <p className="mt-2 text-[15px] leading-[1.4] text-[#71717A] font-[450] max-w-[320px]">
                This helps create a study plan based on exactly what you need to learn.
              </p>

              {/* Upload Dropzone Container - Clean rounded card exactly matching reference mock */}
              <div
                onClick={() => {
                  if (!uploadedFile) {
                    document.getElementById('syllabus-file-input')?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const f = e.dataTransfer.files[0];
                    const sizeMb = f.size / (1024 * 1024);
                    setUploadedFile({
                      name: f.name,
                      size: sizeMb < 0.1 ? '2.4 MB' : sizeMb.toFixed(1) + ' MB',
                    });
                  }
                }}
                className={`mt-6 w-full rounded-[26px] py-8 px-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-2 border-dashed border-[#F5A623] bg-[#FEF9EE] scale-[1.01]'
                    : uploadedFile
                    ? 'border-[1.5px] border-[#F5A623] bg-[#FEFBF4] shadow-[0_4px_20px_rgba(245,166,35,0.08)]'
                    : 'border border-black/[0.08] bg-white/90 hover:bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                }`}
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  id="syllabus-file-input"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      const sizeMb = f.size / (1024 * 1024);
                      setUploadedFile({
                        name: f.name,
                        size: sizeMb < 0.1 ? '2.4 MB' : sizeMb.toFixed(1) + ' MB',
                      });
                    }
                  }}
                />

                {!uploadedFile ? (
                  <>
                    {/* Document Icon in Soft Peach Squircle (Exact to mock) */}
                    <div className="w-[72px] h-[72px] rounded-[22px] bg-[#FDEEE4] flex items-center justify-center mb-3.5 shadow-2xs">
                      <FileText size={32} strokeWidth={1.85} className="text-[#E06738]" />
                    </div>

                    {/* Card Title */}
                    <div className="text-[17.5px] font-bold text-[#0A0C0E] tracking-tight">
                      Choose a file
                    </div>

                    {/* Format hint */}
                    <div className="text-[13px] text-[#71717A] font-normal mt-1">
                      PDF, image or document (max 10 MB)
                    </div>
                  </>
                ) : (
                  /* Active Uploaded File Card State */
                  <div className="w-full flex flex-col items-center py-1.5 animate-fadeIn">
                    <div className="w-[56px] h-[56px] rounded-[18px] bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] mb-2.5">
                      <CheckCircle2 size={30} strokeWidth={2} />
                    </div>
                    <div className="text-[16px] font-bold text-[#0A0C0E] tracking-tight max-w-[260px] truncate">
                      {uploadedFile.name}
                    </div>
                    <div className="text-[13px] text-[#71717A] mt-0.5 mb-3 font-medium">
                      {uploadedFile.size} • Ready for analysis
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#EF4444] hover:text-[#DC2626] bg-[#FEE2E2]/60 hover:bg-[#FEE2E2] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <X size={14} strokeWidth={2.5} />
                      <span>Remove file</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drag and Drop Subtext outside the card (Exact to reference mock) */}
              <div className="text-[13px] text-[#8E8E93] text-center mt-3.5 font-normal select-none">
                or drag and drop it here
              </div>
            </div>

            {/* Bottom Action Area: Unified with All Screens - Position Locked */}
            <div className="relative z-30 px-7 pb-5 flex flex-col items-center gap-3">
              {/* Primary Action Button: Continue */}
              <button
                onMouseDown={() => setIsBtnPressed(true)}
                onMouseUp={() => setIsBtnPressed(false)}
                onTouchStart={() => setIsBtnPressed(true)}
                onTouchEnd={() => setIsBtnPressed(false)}
                onClick={handleProceedFromSyllabus}
                className={`w-full h-[62px] bg-[#0A0C0E] hover:bg-[#1C1E24] active:scale-[0.98] rounded-full flex items-center justify-between pl-8 pr-2 text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] cursor-pointer transition-all duration-200 select-none ${
                  isBtnPressed ? 'brightness-110' : ''
                }`}
              >
                <span className="text-[17px] font-semibold tracking-[-0.01em]">
                  {uploadedFile ? 'Continue with Syllabus' : 'Continue'}
                </span>
                <div className="w-[46px] h-[46px] rounded-full bg-[#27272A] flex items-center justify-center text-white shrink-0">
                  <ArrowRight size={20} strokeWidth={2.4} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ================== SCREEN 6: DONE SCREEN (STEP 7/7) ==================== */}
        {/* ========================================================================= */}
        {currentScreen === 6 && (
          <div className="relative w-full h-full flex flex-col justify-between animate-page-enter bg-[#FAF5ED]">
            {/* Top Navigation: Back Chevron + 7-Segment Progress Indicator (Zero text) */}
            <div className="relative z-30 pt-8 sm:pt-9 px-7 flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen(5)}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#0A0C0E] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft size={24} strokeWidth={2.4} />
              </button>

              <div className="flex items-center gap-1.5 pr-2">
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
                <div className="w-[22px] h-[4px] bg-[#0A0C0E] rounded-full" />
              </div>
            </div>

            {/* Main Center Area: One Persistent Continuous Morphing Hero Orb */}
            <div className="relative z-20 px-7 flex-1 flex flex-col items-center justify-center text-center -mt-6">
              {/* Single Continuous Hero Orb that morphs seamlessly in place */}
              <div className="relative flex items-center justify-center">
                {/* Ambient Halo Glow: Subtle obsidian depth and warm beige radiance */}
                <div
                  className={`absolute w-[220px] h-[220px] rounded-full transition-all duration-700 ease-out pointer-events-none ${
                    orbPhase === 'thinking'
                      ? 'bg-gradient-to-tr from-[#0A0C0E]/20 via-[#D8CBB6]/65 to-[#0A0C0E]/15 blur-[45px] animate-orb-pulse'
                      : 'bg-gradient-to-tr from-[#0A0C0E]/15 via-[#E6D9C5]/50 to-[#0A0C0E]/10 blur-[40px] scale-95'
                  }`}
                />

                {/* Secondary Color Swirl Glow (Active during thinking) */}
                <div
                  className={`absolute w-[180px] h-[180px] rounded-full bg-[#D4C4AB]/50 blur-[32px] pointer-events-none transition-opacity duration-700 ${
                    orbPhase === 'thinking' ? 'opacity-60 animate-orb-spin-reverse' : 'opacity-0'
                  }`}
                />

                {/* Main Orb Sphere */}
                <div
                  className={`relative w-[136px] h-[136px] rounded-full transition-all duration-700 ease-out flex items-center justify-center ${
                    orbPhase === 'thinking'
                      ? 'shadow-[0_16px_45px_rgba(10,12,14,0.25),0_0_60px_rgba(216,203,182,0.35)] animate-orb-float'
                      : orbPhase === 'matched'
                      ? 'scale-[1.08] shadow-[0_20px_50px_rgba(10,12,14,0.3)]'
                      : 'scale-100 shadow-[0_12px_36px_rgba(10,12,14,0.2)]'
                  }`}
                >
                  {/* Fluid Spinning Conic Gradient Layer: Obsidian Black and Cream/Beige Liquid Marble */}
                  <div
                    className={`absolute inset-0 rounded-full transition-opacity duration-700 ${
                      orbPhase === 'thinking' ? 'opacity-100 animate-orb-spin' : 'opacity-10'
                    }`}
                    style={{
                      background:
                        'conic-gradient(from 0deg, #0A0C0E 0%, #2A2D36 20%, #FAF5ED 40%, #D8C7A8 50%, #0A0C0E 65%, #FAF5ED 85%, #0A0C0E 100%)',
                      filter: 'blur(2px)',
                    }}
                  />

                  {/* Counter-rotating Inner Gradient for fluid swirl */}
                  <div
                    className={`absolute inset-[3px] rounded-full mix-blend-overlay transition-opacity duration-700 ${
                      orbPhase === 'thinking' ? 'opacity-70 animate-orb-spin-reverse' : 'opacity-0'
                    }`}
                    style={{
                      background:
                        'conic-gradient(from 180deg, #FAF5ED, #0A0C0E, #FAF5ED, #0A0C0E)',
                      filter: 'blur(4px)',
                    }}
                  />

                  {/* Settled Core Layer: Semi-transparent during thinking, settles to deep obsidian glass */}
                  <div
                    className={`absolute inset-[5px] rounded-full transition-all duration-700 ${
                      orbPhase === 'thinking'
                        ? 'bg-gradient-to-br from-[#FAF5ED]/30 to-[#0A0C0E]/40 opacity-50 animate-orb-pulse'
                        : 'bg-gradient-to-br from-[#1C1F26] via-[#0A0C0E] to-[#0A0C0E] opacity-100'
                    }`}
                  />

                  {/* Specular Glass Highlight & 3D Depth Rim */}
                  <div className="absolute inset-0 rounded-full border border-white/60 shadow-[inset_0_4px_16px_rgba(255,255,255,0.7),inset_0_-6px_20px_rgba(0,0,0,0.35)] pointer-events-none" />

                  {/* Top-Left Crisp Glint */}
                  <div className="absolute top-[16px] left-[22px] w-[34px] h-[18px] rounded-full bg-gradient-to-b from-white/90 to-transparent rotate-[-30deg] blur-[1px] pointer-events-none" />

                  {/* The Animated Checkmark: Springs out gracefully in warm beige on obsidian */}
                  <div
                    className={`relative z-10 flex items-center justify-center transition-all duration-500 ease-out ${
                      orbPhase === 'thinking'
                        ? 'scale-0 opacity-0'
                        : 'scale-100 opacity-100'
                    }`}
                  >
                    <div className="w-[50px] h-[50px] rounded-full bg-[#0A0C0E] border border-white/10 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
                      <Check size={26} strokeWidth={3.4} className="text-[#FAF5ED]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Headline: "Done" (Glides in smoothly when orb enters done phase) */}
              <div
                className={`transition-all duration-500 ease-out mt-6 ${
                  orbPhase === 'done'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <h1 className="text-[44px] font-[800] text-[#0A0C0E] tracking-tight leading-none">
                  Done
                </h1>
              </div>
            </div>

            {/* Bottom Action Area: "Go" Button (Glides in smoothly when done) */}
            <div className="relative z-30 px-7 pb-5 flex flex-col items-center gap-3">
              <div
                className={`w-full transition-all duration-500 ease-out ${
                  orbPhase === 'done'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6 pointer-events-none'
                }`}
              >
                <button
                  onMouseDown={() => setIsBtnPressed(true)}
                  onMouseUp={() => setIsBtnPressed(false)}
                  onTouchStart={() => setIsBtnPressed(true)}
                  onTouchEnd={() => setIsBtnPressed(false)}
                  onClick={() => {
                    setIsLoggedIn(true);
                    setCurrentScreen(7);
                  }}
                  className={`w-full h-[62px] bg-[#0A0C0E] hover:bg-[#1C1E24] active:scale-[0.98] rounded-full flex items-center justify-between pl-8 pr-2 text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] cursor-pointer transition-all duration-200 select-none ${
                    isBtnPressed ? 'brightness-110' : ''
                  }`}
                >
                  <span className="text-[18px] font-bold tracking-tight">
                    Go
                  </span>
                  <div className="w-[46px] h-[46px] rounded-full bg-[#27272A] flex items-center justify-center text-white shrink-0">
                    <ArrowRight size={20} strokeWidth={2.4} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ====================== SCREEN 7: MAIN HOME SCREEN ======================= */}
        {/* ========================================================================= */}
        {currentScreen === 7 && (() => {
          const displayName = userName.trim() || 'Student';
          const userInitial = displayName[0]?.toUpperCase() || 'S';

          const subjectMeta = {
            mathematics: { name: 'Maths', icon: BookOpen, color: 'text-[#2563EB]', bg: 'bg-[#EEF4FD]', border: 'border-[#D6E4FA]' },
            science: { name: 'Science', icon: FlaskConical, color: 'text-[#E11D48]', bg: 'bg-[#FCECEB]', border: 'border-[#F7D5D4]' },
            physics: { name: 'Physics', icon: Atom, color: 'text-[#7C3AED]', bg: 'bg-[#EDE9FE]', border: 'border-[#DDD6FE]' },
            chemistry: { name: 'Chemistry', icon: FlaskConical, color: 'text-[#9333EA]', bg: 'bg-[#F3E8FF]', border: 'border-[#E9D5FF]' },
            biology: { name: 'Biology', icon: Leaf, color: 'text-[#16A34A]', bg: 'bg-[#DCFCE7]', border: 'border-[#BBF7D0]' },
            english: { name: 'English', icon: FileText, color: 'text-[#16A34A]', bg: 'bg-[#EAF7EE]', border: 'border-[#D1EED8]' },
            history: { name: 'History', icon: Globe, color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]', border: 'border-[#FDE68A]' },
            art: { name: 'Art', icon: Palette, color: 'text-[#E11D48]', bg: 'bg-[#FFE4E6]', border: 'border-[#FECDD3]' },
            cs: { name: 'CompSci', icon: Laptop, color: 'text-[#0284C7]', bg: 'bg-[#E0F2FE]', border: 'border-[#BAE6FD]' },
            other: { name: customSubject.trim() || 'Other', icon: MoreHorizontal, color: 'text-[#4B5563]', bg: 'bg-[#F3F4F6]', border: 'border-[#E5E7EB]' },
          };

          return (
            <div className="relative w-full h-full flex flex-col justify-between animate-page-enter bg-[#FAF5ED] overflow-hidden select-none">
              {/* Luminous warm radial ambient bloom on top right for depth without clutter */}
              <div className="absolute top-0 right-0 w-[260px] h-[220px] bg-[radial-gradient(ellipse_at_80%_0%,rgba(253,222,185,0.45)_0%,transparent_70%)] pointer-events-none" />

              {/* Tab 1 View: Home Feed */}
              {activeTab === 'home' && (
                <div
                  className="flex-1 overflow-y-auto no-scrollbar px-6 pt-7 pb-6 relative z-10 animate-fadeIn"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {/* Header: Greeting & Profile Avatar */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <span className="text-[14px] font-[500] text-[#636366] tracking-tight">
                        Good morning,
                      </span>
                      <h1 className="text-[32px] font-[800] text-[#0A0C0E] tracking-tight leading-[1.1] mt-0.5">
                        {displayName}
                      </h1>
                      <p className="text-[14px] text-[#636366] mt-1 font-[450]">
                        Ready to make progress today?
                      </p>
                    </div>

                    {/* Avatar Badge with 48x48 touch target */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="w-[48px] h-[48px] rounded-full bg-[#FCEAD2] text-[#9A5826] font-bold text-[19px] flex items-center justify-center border border-[#F5A623]/25 shadow-2xs shrink-0 cursor-pointer active:scale-95 transition-transform"
                    >
                      {userInitial}
                    </button>
                  </div>

                  {/* Hero Focus Card: Spacious, Apple-caliber, zero clip-art bloat */}
                  <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#FFFDF9] via-[#FEF7EC] to-[#FDEADA] border border-black/[0.06] p-6 shadow-[0_4px_20px_rgba(245,166,35,0.06)]">
                    {/* Subtle warm ambient glow */}
                    <div className="absolute right-0 top-0 w-[180px] h-[180px] bg-[radial-gradient(circle,rgba(253,217,181,0.45)_0%,transparent_70%)] pointer-events-none" />

                    <div className="relative z-10">
                      {/* Category Badge */}
                      <div className="inline-flex items-center gap-1.5 text-[12px] font-[600] text-[#9A5826] uppercase tracking-wider bg-[#FCEAD2]/60 px-2.5 py-0.5 rounded-full">
                        <Clock size={12.5} strokeWidth={2.4} />
                        <span>Today's focus</span>
                      </div>

                      {/* Headline */}
                      <h2 className="text-[22px] sm:text-[24px] font-[800] text-[#0A0C0E] tracking-tight leading-[1.2] mt-3">
                        {totalSessionsThisWeek === 0
                          ? 'Start your first study session'
                          : `${formatDuration(totalMinutesThisWeek)} studied this week`}
                      </h2>

                      {/* Subtitle with high-contrast text */}
                      <p className="text-[13.5px] text-[#48484A] leading-[1.45] mt-2 max-w-[290px]">
                        {totalSessionsThisWeek === 0
                          ? 'Get a personalized session based on your goals and subjects.'
                          : `${totalSessionsThisWeek} session${totalSessionsThisWeek !== 1 ? 's' : ''} completed. Keep your momentum going.`}
                      </p>

                      {/* Apple-spec Primary CTA Button */}
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Not configured yet');
                        }}
                        className="mt-5 bg-[#0A0C0E] hover:bg-[#1E2024] active:scale-[0.98] text-white px-6 py-3 rounded-full inline-flex items-center gap-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.16)] font-[600] text-[14px] cursor-pointer transition-all"
                      >
                        <Play size={13.5} fill="currentColor" strokeWidth={0} />
                        <span>{totalSessionsThisWeek === 0 ? 'Start now' : 'Study again'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Section: "Your subjects" — Clean monochrome/neutral cards, inviting action */}
                  <div className="mt-7">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-[17px] font-[700] text-[#0A0C0E] tracking-tight">Your subjects</h3>
                        <span className="text-[13px] font-[500] text-[#636366]">({selectedSubjects.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditSubjectsFromHome}
                        className="text-[13px] font-[600] text-[#9A5826] hover:text-[#7A431B] min-h-[44px] px-2 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Edit</span>
                        <ChevronRight size={14} strokeWidth={2.4} />
                      </button>
                    </div>

                    {/* Clean Subject Tiles */}
                    <div
                      className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mx-6 px-6"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {selectedSubjects.map((subId) => {
                        const meta = subjectMeta[subId] || {
                          name: subId,
                          icon: BookOpen,
                        };
                        const Icon = meta.icon;
                        const stats = subjectStats[subId] || { sessions: 0, minutes: 0 };

                        return (
                          <button
                            type="button"
                            key={subId}
                            onClick={() => {
                              showToast('Not configured yet');
                            }}
                            className="bg-white rounded-[20px] p-4 border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between w-[145px] h-[122px] shrink-0 text-left hover:border-black/[0.12] active:scale-[0.98] transition-all cursor-pointer group"
                          >
                            <div className="w-[36px] h-[36px] rounded-[11px] bg-[#FAF5ED] flex items-center justify-center text-[#1C1C1E] group-hover:bg-[#FCEAD2] group-hover:text-[#9A5826] transition-colors">
                              <Icon size={18} strokeWidth={2.2} />
                            </div>
                            <div>
                              <div className="text-[14.5px] font-[700] text-[#0A0C0E] leading-tight">
                                {meta.name}
                              </div>
                              <div className="text-[12px] font-[500] text-[#636366] mt-1">
                                {stats.sessions > 0
                                  ? `${stats.sessions} session${stats.sessions !== 1 ? 's' : ''}`
                                  : 'Tap to study'}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: Dynamic Progress / Guidance — NO empty-state dashboard clutter */}
                  {totalSessionsThisWeek > 0 ? (
                    <div className="mt-7">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[17px] font-[700] text-[#0A0C0E] tracking-tight">This week's progress</h3>
                        <button
                          type="button"
                          onClick={() => setActiveTab('progress')}
                          className="text-[13px] font-[600] text-[#9A5826] hover:text-[#7A431B] min-h-[44px] px-2 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>View all</span>
                          <ChevronRight size={14} strokeWidth={2.4} />
                        </button>
                      </div>

                      <div className="bg-white rounded-[22px] p-5 border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-[44px] h-[44px] rounded-[14px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                            <Clock size={20} strokeWidth={2.3} />
                          </div>
                          <div>
                            <div className="text-[22px] font-[800] text-[#0A0C0E] leading-none tracking-tight">
                              {formatDuration(totalMinutesThisWeek)}
                            </div>
                            <div className="text-[12.5px] font-[500] text-[#636366] mt-1">
                              {totalSessionsThisWeek} session{totalSessionsThisWeek !== 1 ? 's' : ''} completed
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('progress')}
                          className="bg-[#FAF5ED] text-[#0A0C0E] hover:bg-[#F2EADB] text-[13px] font-[600] px-4 py-2 rounded-full transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-7 mb-2">
                      <div className="bg-white rounded-[22px] p-5 border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-start gap-3.5">
                        <div className="w-[40px] h-[40px] rounded-[12px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                          <Flame size={19} strokeWidth={2.2} />
                        </div>
                        <div>
                          <h4 className="text-[14.5px] font-[700] text-[#0A0C0E] leading-tight">
                            Build your daily streak
                          </h4>
                          <p className="text-[13px] text-[#636366] leading-relaxed mt-1">
                            Complete your first session today to track study time and unlock weekly insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2 View: Progress Screen (1:1 with media_1790269382045.png) */}
              {activeTab === 'progress' && (
                <div
                  className="flex-1 overflow-y-auto no-scrollbar px-6 pt-7 pb-4 relative z-10 animate-fadeIn"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {/* Header: Progress title, subtext & 'This week' dropdown pill */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-[32px] sm:text-[34px] font-[800] text-[#0A0C0E] tracking-tight leading-[1.1]">
                        Progress
                      </h1>
                      <p className="text-[14px] text-[#71717A] mt-1 font-[450]">
                        Keep going. You’re building consistency.
                      </p>
                    </div>

                    {/* Dropdown Filter Pill */}
                    <button
                      type="button"
                      className="bg-white/95 border border-black/[0.06] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-[13px] font-[600] text-[#0A0C0E] shadow-2xs shrink-0 cursor-pointer active:scale-95 transition-transform"
                    >
                      <span>This week</span>
                      <ChevronDown size={14} strokeWidth={2.4} className="text-[#71717A]" />
                    </button>
                  </div>

                  {/* Top 2 Metric Cards — Real data */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Card 1: Study time */}
                    <div className="bg-white/95 rounded-[24px] p-4 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[126px]">
                      <div className="w-[38px] h-[38px] rounded-[13px] bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                        <Clock size={19} strokeWidth={2.3} />
                      </div>
                      <div>
                        <div className="text-[28px] font-[800] text-[#0A0C0E] tracking-tight leading-none">
                          {formatDuration(totalMinutesThisWeek)}
                        </div>
                        <div className="text-[12px] font-[500] text-[#71717A] mt-1.5">
                          Study time
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Sessions completed */}
                    <div className="bg-white/95 rounded-[24px] p-4 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[126px]">
                      <div className="w-[38px] h-[38px] rounded-[13px] bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="10" width="3.5" height="8" rx="1.75" fill="currentColor" />
                          <rect x="8.25" y="4" width="3.5" height="14" rx="1.75" fill="currentColor" />
                          <rect x="14.5" y="7" width="3.5" height="11" rx="1.75" fill="currentColor" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[28px] font-[800] text-[#0A0C0E] tracking-tight leading-none">
                          {totalSessionsThisWeek}
                        </div>
                        <div className="text-[12px] font-[500] text-[#71717A] mt-1.5">
                          Sessions completed
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart Card: "Study time" Bar Chart — Real data */}
                  <div className="bg-white/95 rounded-[26px] p-5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mt-3.5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[17px] font-[700] text-[#0A0C0E] tracking-tight">
                        Study time
                      </h3>
                      {selectedChartDay && (() => {
                        const selectedData = chartData.find((d) => d.day === selectedChartDay);
                        return selectedData ? (
                          <div className="text-[12.5px] font-[600] text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full animate-fadeIn">
                            {selectedData.isToday ? `Today: ${formatDuration(selectedData.minutes)}` : `${selectedData.day}: ${formatDuration(selectedData.minutes)}`}
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* 7-Day Vertical Bar Chart — Real data */}
                    <div className="h-[135px] flex items-end justify-between px-1">
                      {chartData.map((item) => {
                        const isSelected = selectedChartDay === item.day;
                        const barHeight = totalMinutesThisWeek === 0 ? '0%' : `${Math.max((item.minutes / maxChartMinutes) * 100, item.minutes > 0 ? 8 : 0)}%`;
                        return (
                          <button
                            type="button"
                            key={item.day}
                            onClick={() => setSelectedChartDay(item.day)}
                            className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer group focus:outline-none"
                          >
                            <div className={`w-[28px] h-[105px] rounded-full flex items-end justify-center pb-1 transition-colors ${
                              isSelected ? 'bg-[#FDF4E7]' : 'bg-[#FAF5ED]/80 group-hover:bg-[#FDF4E7]'
                            }`}>
                              <div
                                style={{ height: barHeight }}
                                className={`w-[18px] bg-gradient-to-t from-[#F5A623] to-[#FB923C] rounded-full shadow-2xs transition-all duration-500 ${
                                  isSelected ? 'brightness-105 scale-x-105' : 'group-hover:brightness-105'
                                }`}
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className={`text-[11.5px] leading-tight transition-colors ${
                                item.isToday
                                  ? 'font-[700] text-[#0A0C0E]'
                                  : isSelected
                                  ? 'font-[600] text-[#0A0C0E]'
                                  : 'font-[500] text-[#8E8E93]'
                              }`}>
                                {item.day}
                              </span>
                              {item.isToday && (
                                <span className="w-1 h-1 rounded-full bg-[#F5A623] mt-0.5" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subjects Breakdown Card — Real data, dynamically from selected subjects */}
                  <div className="bg-white/95 rounded-[26px] p-5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mt-3.5 mb-2">
                    <h3 className="text-[17px] font-[700] text-[#0A0C0E] tracking-tight mb-2">
                      Subjects
                    </h3>

                    <div className="flex flex-col">
                      {selectedSubjects.map((subId, idx) => {
                        const meta = subjectMeta[subId] || { name: subId, icon: BookOpen, color: 'text-[#2563EB]', bg: 'bg-[#EEF4FD]' };
                        const Icon = meta.icon;
                        const stats = subjectStats[subId] || { sessions: 0, minutes: 0 };
                        const iconBgMap = {
                          'text-[#2563EB]': 'bg-[#EEF4FD]',
                          'text-[#E11D48]': 'bg-[#FCECEB]',
                          'text-[#7C3AED]': 'bg-[#EDE9FE]',
                          'text-[#9333EA]': 'bg-[#F3E8FF]',
                          'text-[#16A34A]': 'bg-[#DCFCE7]',
                          'text-[#D97706]': 'bg-[#FEF3C7]',
                          'text-[#0284C7]': 'bg-[#E0F2FE]',
                          'text-[#4B5563]': 'bg-[#F3F4F6]',
                        };
                        const iconBg = iconBgMap[meta.color] || 'bg-[#F3F4F6]';

                        return (
                          <React.Fragment key={subId}>
                            {idx > 0 && <div className="h-[1px] bg-black/[0.04] my-1 ml-[52px]" />}
                            <div className="flex items-center justify-between px-2.5 -mx-2.5 py-2.5 rounded-[16px] hover:bg-black/[0.02] active:bg-black/[0.04] cursor-pointer transition-colors">
                              <div className="flex items-center gap-3.5">
                                <div className={`w-[42px] h-[42px] rounded-[14px] ${iconBg} ${meta.color} flex items-center justify-center shrink-0`}>
                                  <Icon size={20} strokeWidth={2.2} />
                                </div>
                                <div>
                                  <div className="text-[15px] font-[700] text-[#0A0C0E] leading-tight">
                                    {meta.name}
                                  </div>
                                  <div className="text-[12px] text-[#71717A] mt-0.5">
                                    {stats.sessions === 0 ? 'No sessions yet' : `${stats.sessions} session${stats.sessions !== 1 ? 's' : ''}`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-[#0A0C0E]">
                                <span className="text-[13.5px] font-[600] text-[#0A0C0E]">{formatDuration(stats.minutes)}</span>
                                <ChevronRight size={16} strokeWidth={2.4} className="text-[#8E8E93]" />
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div
                  className="flex-1 overflow-y-auto no-scrollbar px-6 pt-7 pb-4 relative z-10 animate-fadeIn"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {isEditingProfileName ? (
                    /* Subview: Edit Name */
                    <div className="animate-page-enter">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfileName(false)}
                        className="inline-flex items-center gap-1 text-[14px] font-[600] text-[#0A0C0E] hover:text-[#9A5826] mb-4 -ml-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft size={18} strokeWidth={2.4} />
                        <span>Profile</span>
                      </button>

                      <h1 className="text-[28px] font-[800] text-[#0A0C0E] tracking-tight leading-[1.15]">
                        Edit Name
                      </h1>
                      <p className="text-[13.5px] text-[#636366] mt-1 font-[450]">
                        Update the name displayed on your dashboard and study sessions.
                      </p>

                      <div className="mt-6 bg-white rounded-[22px] p-4 border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <label className="block text-[12.5px] font-[700] text-[#636366] uppercase tracking-wider mb-2">
                          Your Name
                        </label>
                        <div className="flex items-center gap-3 bg-[#FAF5ED] rounded-[16px] px-3.5 py-3 border border-black/[0.04]">
                          <User size={19} strokeWidth={2} className="text-[#636366] shrink-0" />
                          <input
                            type="text"
                            value={profileNameInput}
                            onChange={(e) => setProfileNameInput(e.target.value)}
                            placeholder="Enter your name..."
                            className="bg-transparent text-[16px] font-[600] text-[#0A0C0E] outline-none w-full"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2.5">
                        <button
                          type="button"
                          disabled={!profileNameInput.trim()}
                          onClick={() => {
                            if (profileNameInput.trim()) {
                              setUserName(profileNameInput.trim());
                              setIsEditingProfileName(false);
                              showToast('Name updated');
                            }
                          }}
                          className={`w-full py-3.5 rounded-full font-[600] text-[15px] transition-all cursor-pointer ${
                            profileNameInput.trim()
                              ? 'bg-[#0A0C0E] text-white hover:bg-[#1E2024] active:scale-[0.98] shadow-[0_4px_14px_rgba(0,0,0,0.18)]'
                              : 'bg-[#E5E0D8] text-[#9CA3AF] cursor-not-allowed'
                          }`}
                        >
                          Save changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfileName(false)}
                          className="w-full py-3 rounded-full text-[14px] font-[600] text-[#636366] hover:text-[#0A0C0E] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : isViewingTerms ? (
                    /* Subview: Terms and Conditions */
                    <div className="animate-page-enter">
                      <button
                        type="button"
                        onClick={() => setIsViewingTerms(false)}
                        className="inline-flex items-center gap-1 text-[14px] font-[600] text-[#0A0C0E] hover:text-[#9A5826] mb-4 -ml-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft size={18} strokeWidth={2.4} />
                        <span>Profile</span>
                      </button>

                      <h1 className="text-[28px] font-[800] text-[#0A0C0E] tracking-tight leading-[1.15]">
                        Terms & Conditions
                      </h1>
                      <p className="text-[13.5px] text-[#636366] mt-1 font-[450]">
                        Scholarise Service & Privacy Agreement
                      </p>

                      <div className="mt-5 space-y-3 pb-6">
                        <div className="bg-white rounded-[20px] p-4 border border-black/[0.05] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                          <h3 className="text-[14.5px] font-[700] text-[#0A0C0E] mb-1">
                            1. Acceptance of Terms
                          </h3>
                          <p className="text-[13px] text-[#636366] leading-relaxed">
                            By creating a profile and using Scholarise, you agree to comply with our academic honor code and terms of service.
                          </p>
                        </div>

                        <div className="bg-white rounded-[20px] p-4 border border-black/[0.05] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                          <h3 className="text-[14.5px] font-[700] text-[#0A0C0E] mb-1">
                            2. AI Study Assistant
                          </h3>
                          <p className="text-[13px] text-[#636366] leading-relaxed">
                            Scholarise provides AI-assisted revision plans, questions, and curriculum summaries designed to support your learning. All generated materials are intended for educational aid.
                          </p>
                        </div>

                        <div className="bg-white rounded-[20px] p-4 border border-black/[0.05] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                          <h3 className="text-[14.5px] font-[700] text-[#0A0C0E] mb-1">
                            3. Privacy & Syllabus Data
                          </h3>
                          <p className="text-[13px] text-[#636366] leading-relaxed">
                            Files and notes uploaded to Scholarise are processed securely solely to construct your personalized study schedule. We never sell your personal data.
                          </p>
                        </div>

                        <div className="bg-white rounded-[20px] p-4 border border-black/[0.05] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                          <h3 className="text-[14.5px] font-[700] text-[#0A0C0E] mb-1">
                            4. Academic Integrity
                          </h3>
                          <p className="text-[13px] text-[#636366] leading-relaxed">
                            Scholarise is built to foster genuine comprehension and consistency. It must not be utilized for unauthorized assistance or cheating on proctored assessments.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsViewingTerms(false)}
                          className="w-full mt-4 bg-[#0A0C0E] text-white py-3.5 rounded-full font-[600] text-[14.5px] hover:bg-[#1E2024] active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
                        >
                          I Understand
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Main Profile Screen */
                    <div>
                      {/* Header */}
                      <div className="mb-5">
                        <h1 className="text-[32px] sm:text-[34px] font-[800] text-[#0A0C0E] tracking-tight leading-[1.1]">
                          Profile
                        </h1>
                        <p className="text-[14px] text-[#71717A] mt-1 font-[450]">
                          Your account and preferences.
                        </p>
                      </div>

                      {/* Row 1: Name (Click to edit) */}
                      <div className="bg-white/95 rounded-[22px] border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileNameInput(userName.trim() || displayName);
                            setIsEditingProfileName(true);
                          }}
                          className="w-full flex items-center justify-between p-4 cursor-pointer active:bg-black/[0.02] rounded-[22px] transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-[48px] h-[48px] rounded-full bg-[#FCEAD2] text-[#D97706] font-bold text-[19px] flex items-center justify-center shrink-0">
                              {userInitial}
                            </div>
                            <div className="text-left">
                              <div className="text-[15.5px] font-[700] text-[#0A0C0E] leading-tight">
                                Name
                              </div>
                              <div className="text-[13px] text-[#71717A] mt-0.5">
                                {displayName}
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={18} strokeWidth={2.2} className="text-[#8E8E93] shrink-0" />
                        </button>
                      </div>

                      {/* Row 2: Help (Click for Terms & Conditions) */}
                      <div className="bg-white/95 rounded-[22px] border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-3">
                        <button
                          type="button"
                          onClick={() => setIsViewingTerms(true)}
                          className="w-full flex items-center justify-between p-4 cursor-pointer active:bg-black/[0.02] rounded-[22px] transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-[48px] h-[48px] rounded-full bg-[#EEF4FD] text-[#2563EB] flex items-center justify-center shrink-0">
                              <HelpCircle size={22} strokeWidth={2.2} />
                            </div>
                            <div className="text-left">
                              <div className="text-[15.5px] font-[700] text-[#0A0C0E] leading-tight">
                                Help
                              </div>
                              <div className="text-[13px] text-[#71717A] mt-0.5">
                                Terms and conditions
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={18} strokeWidth={2.2} className="text-[#8E8E93] shrink-0" />
                        </button>
                      </div>

                      {/* Row 3: Log out */}
                      <div className="bg-white/95 rounded-[22px] border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              window.localStorage.removeItem(SESSION_STORAGE_KEY);
                            } catch (e) {}
                            setIsLoggedIn(false);
                            setCurrentScreen(0);
                            setActiveTab('home');
                            setUserName('');
                            setUserAge('');
                            setUserEmail('');
                            setUserPhone('');
                            setSelectedSubjects([]);
                            setStudySessions([]);
                          }}
                          className="w-full flex items-center justify-between p-4 cursor-pointer active:bg-black/[0.02] rounded-[22px] transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-[48px] h-[48px] rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center shrink-0">
                              <LogOut size={21} strokeWidth={2.2} />
                            </div>
                            <div className="text-left">
                              <div className="text-[15.5px] font-[700] text-[#0A0C0E] leading-tight">
                                Log out
                              </div>
                              <div className="text-[13px] text-[#71717A] mt-0.5">
                                Sign out of your account
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={18} strokeWidth={2.2} className="text-[#8E8E93] shrink-0" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Translucent Tab Bar — Exactly 3 Tabs: Home, Progress, Profile */}
              <div className="relative z-30 px-6 pt-2 pb-3.5 bg-[#FAF5ED]/95 backdrop-blur-md border-t border-black/[0.05] flex flex-col items-center shrink-0">
                <div className="w-full flex items-center justify-around py-0.5">
                  {/* Tab 1: Home */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfileName(false);
                      setIsViewingTerms(false);
                      setActiveTab('home');
                    }}
                    className={`min-w-[64px] min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      activeTab === 'home'
                        ? 'text-[#0A0C0E]'
                        : 'text-[#8E8E93] hover:text-[#48484A]'
                    }`}
                  >
                    <HomeIcon size={21} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'home' ? 'font-[700]' : 'font-[500]'}`}>Home</span>
                  </button>

                  {/* Tab 2: Progress */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfileName(false);
                      setIsViewingTerms(false);
                      setActiveTab('progress');
                    }}
                    className={`min-w-[64px] min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      activeTab === 'progress'
                        ? 'text-[#0A0C0E]'
                        : 'text-[#8E8E93] hover:text-[#48484A]'
                    }`}
                  >
                    <BarChart2 size={21} strokeWidth={activeTab === 'progress' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'progress' ? 'font-[700]' : 'font-[500]'}`}>Progress</span>
                  </button>

                  {/* Tab 3: Profile */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`min-w-[64px] min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      activeTab === 'profile'
                        ? 'text-[#0A0C0E]'
                        : 'text-[#8E8E93] hover:text-[#48484A]'
                    }`}
                  >
                    <User size={21} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                    <span className={`text-[10px] ${activeTab === 'profile' ? 'font-[700]' : 'font-[500]'}`}>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
