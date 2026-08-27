import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Brain,
  Lock,
  ArrowRight,
  CheckCircle,
  HeartHandshake,
  Compass,
  FileText,
  Feather,
  Sparkles,
  Quote,
  TrendingUp,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  Calendar,
  Layers,
  MessageSquareQuote,
  Smile,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Profile dropdown menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Testimonial Carousel State (10 reviews)
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const samplePrompts = [
    {
      title: 'Stoic Evening Reflection',
      tagline: 'Equanimity & Control',
      icon: ShieldCheck,
      color: 'border-[#9c6644]/40 bg-[#9c6644]/10 dark:bg-[#9c6644]/25 text-[#7f4f24] dark:text-[#f4a261]',
      sample: '"I felt overwhelmed by unexpected feedback today. Help me separate what is within my control from what is outside it."',
    },
    {
      title: 'Emotional Untangling',
      tagline: 'Clarity & Validation',
      icon: HeartHandshake,
      color: 'border-[#c86d51]/40 bg-[#c86d51]/10 dark:bg-[#c86d51]/25 text-[#96472d] dark:text-[#f28e79]',
      sample: '"I feel frustrated with my progress but guilty for feeling impatient. Help me unpack where this tension is coming from."',
    },
    {
      title: 'CBT Cognitive Reframe',
      tagline: 'Challenging Distortions',
      icon: Brain,
      color: 'border-[#85756e]/40 bg-[#85756e]/10 dark:bg-[#85756e]/25 text-[#53463f] dark:text-[#d5c7be]',
      sample: '"I made a minor mistake in my presentation and I feel like everything failed. Walk me through cognitive reframing."',
    },
    {
      title: 'Daily Gratitude & Mindfulness',
      tagline: 'Grounded Presence',
      icon: Sparkles,
      color: 'border-[#7d8461]/40 bg-[#7d8461]/10 dark:bg-[#7d8461]/25 text-[#4c5432] dark:text-[#b4c498]',
      sample: '"What are 3 small ordinary moments today that brought quiet joy, and why do they matter?"',
    },
    {
      title: 'Future Self Visioning',
      tagline: 'Purpose & Alignment',
      icon: Compass,
      color: 'border-[#b08968]/40 bg-[#b08968]/10 dark:bg-[#b08968]/25 text-[#6f4e37] dark:text-[#e5c29f]',
      sample: '"What small micro-habit today will my 5-year future self thank me for staying committed to?"',
    },
    {
      title: 'Weekly Retrospective',
      tagline: 'Bottlenecks & Momentum',
      icon: Calendar,
      color: 'border-[#606c38]/40 bg-[#606c38]/10 dark:bg-[#606c38]/25 text-[#283618] dark:text-[#c5cb82]',
      sample: '"Review my week: Where did my energy drain, where did I make meaningful progress, and what is next week’s focus?"',
    },
  ];

  // 10 authentic, diverse user reviews for the carousel
  const testimonials = [
    {
      name: 'Elena Rostova',
      role: 'UX Designer & Essayist',
      initials: 'ER',
      quote:
        'Fuenzer Journal completely solved my blank page paralysis. Instead of staring at an empty box, the Socratic prompts gently probe into the core of what I am feeling. It feels like having a wise, patient mentor in my pocket.',
    },
    {
      name: 'Marcus Vance',
      role: 'Engineering Lead & Founder',
      initials: 'MV',
      quote:
        'The Stoic reflection framework has transformed my evenings. Separating what I can control from what I cannot helped me disconnect from high-pressure sprints and reclaim restful sleep.',
    },
    {
      name: 'Dr. Sophia Lin',
      role: 'Cognitive Science Researcher',
      initials: 'SL',
      quote:
        'The automated takeaways and 30-day mood trajectory chart are remarkably well implemented. Seeing my emotional shifts visually gives me actionable self-compassion over time.',
    },
    {
      name: 'David Thorne',
      role: 'Creative Director & Author',
      initials: 'DT',
      quote:
        'Being able to export formatted Markdown and print-ready PDFs with one click gives me complete peace of mind. Knowing my data is owner-isolated on Google Cloud makes this my permanent sanctuary.',
    },
    {
      name: 'Amara Chen',
      role: 'Clinical Psychologist',
      initials: 'AC',
      quote:
        'I recommend Fuenzer Journal to clients wanting a constructive journaling practice. The structured CBT reframing dialogues help dissolve catastrophic thinking habits without judgment.',
    },
    {
      name: 'Liam O\'Connor',
      role: 'Product Architect',
      initials: 'LO',
      quote:
        'The keyboard shortcuts, Markdown export, and instant command palette make this feel like an ultra-responsive engineering tool built for deep human introspection.',
    },
    {
      name: 'Nadia Al-Mansoor',
      role: 'Endurance Athlete & Coach',
      initials: 'NA',
      quote:
        'Mental recovery is as critical as physical recovery. Journaling with the Gratitude and Stoic modes helps me reset after grueling training blocks and stay grounded.',
    },
    {
      name: 'Julian Sterling',
      role: 'University Professor of Philosophy',
      initials: 'JS',
      quote:
        'The socratic inquiries don\'t just validate your emotions—they challenge your unexamined premises. It is the closest digital experience to an authentic philosophical dialogue.',
    },
    {
      name: 'Maya Takahashi',
      role: 'Visual Artist & Illustrator',
      initials: 'MT',
      quote:
        'I love the warm paper aesthetics, clean serif typography, and zero-distraction layout. It feels like a quiet physical notebook infused with an intelligent, empathetic soul.',
    },
    {
      name: 'Gabriel Morales',
      role: 'Executive Leadership Coach',
      initials: 'GM',
      quote:
        'The automated executive synthesis and next-day action items turn raw self-reflection into tangible behavioral changes. Truly indispensable for high-performing teams and individuals.',
    },
  ];

  // Auto-advance carousel every 4.5 seconds unless paused
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isCarouselPaused, testimonials.length]);

  const handlePrevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const faqs = [
    {
      question: 'How is Fuenzer Journal different from a standard notes app or diary?',
      answer:
        'Traditional journals leave you with a blank page and no guidance. Fuenzer Journal is an interactive conversational sounding board. It listens, asks clarifying Socratic questions based on proven frameworks (Stoic, CBT, Gratitude), and automatically distills your raw stream-of-consciousness into structured takeaways, insights, and actionable steps.',
    },
    {
      question: 'Is my journal data private and secure?',
      answer:
        'Yes, absolutely. We enforce a strict Zero Data Monetization policy. Your reflections are stored strictly under your private user path in Google Cloud Firestore and protected by owner-bound security rules. Furthermore, your private reflections are never used to train public AI models.',
    },
    {
      question: 'How do I log in or create an account?',
      answer:
        'We utilize seamless, passwordless Google Federated Authentication. You simply sign in securely with your existing Google account in one click—no passwords to create, manage, or lose.',
    },
    {
      question: 'Can I export or print my entries?',
      answer:
        'Yes. You have complete data sovereignty with 100% Client-Side Export (Best Privacy). You can export individual entries or your entire journal archive as formatted Markdown (.md), print-ready PDF, or raw JSON. All conversion and file rendering occur exclusively inside your web browser without sending your data to any external export server.',
    },
    {
      question: 'What is the 30-Day Mood Trajectory feature?',
      answer:
        'Whenever you finish a reflection, our sentiment engine detects emotional states (Calm, Grateful, Energized, Anxious, Reflective). In the Insights dashboard, a responsive interactive chart visualizes your emotional equanimity and journaling consistency over 14 or 30-day timelines.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf5] dark:bg-[#181814] text-[#2c2c26] dark:text-[#f0efe6] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white transition-colors duration-200">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#7d8461]/15 via-[#ddb892]/10 to-transparent blur-[130px] dark:from-[#7d8461]/10 dark:via-[#ddb892]/5" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-[#9c6644]/10 blur-[110px] dark:bg-[#9c6644]/5" />
        <div className="absolute bottom-1/4 -left-40 w-[450px] h-[450px] bg-[#7d8461]/10 blur-[110px] dark:bg-[#7d8461]/5" />
      </div>

      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[#fbfaf5]/95 dark:bg-[#181814]/95 backdrop-blur-md border-b border-[#ecece0] dark:border-[#2e2e28] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#7d8461] rounded-none flex items-center justify-center text-white shadow-xs group-hover:bg-[#6c7351] transition">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-base sm:text-lg font-serif italic font-bold leading-tight text-[#2c2c26] dark:text-[#f0efe6]">
              Fuenzer Journal
            </h1>
          </Link>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 text-[#5c5c52] hover:text-[#2c2c26] dark:text-[#a8a89b] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#252520] transition border border-[#e8e8df] dark:border-[#2e2e28] rounded-none cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#e0a96d]" /> : <Moon className="w-4 h-4 text-[#5c5c52]" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Profile Button with Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-none bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] transition cursor-pointer text-xs whitespace-nowrap"
                    title="Your Profile"
                    aria-label="User profile menu"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-6 h-6 rounded-none object-cover border border-[#d8d8cc] dark:border-[#424236]"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-none bg-[#7d8461] dark:bg-[#8e966f] flex items-center justify-center text-white text-[11px] font-bold font-serif italic">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                      </div>
                    )}
                    <span className="text-xs font-medium text-[#2c2c26] dark:text-[#f0efe6] max-w-[85px] sm:max-w-[110px] truncate">
                      {user.displayName?.split(' ')[0] || 'Profile'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#5c5c52] dark:text-[#a8a89b]" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#23231c] border border-[#2c2c26]/20 dark:border-[#38382e] shadow-2xl rounded-none py-1 z-50 divide-y divide-[#ecece0] dark:divide-[#38382e] animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2">
                        <p className="text-xs font-bold text-[#2c2c26] dark:text-[#f0efe6] truncate font-serif italic">
                          {user.displayName || 'Reflective Writer'}
                        </p>
                        <p className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b] truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/app"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                          <span>Journal Sanctuary</span>
                        </Link>
                        <Link
                          to="/archive"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                          <span>Personal Archive</span>
                        </Link>
                        <Link
                          to="/analytics"
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                          <span>Insights & Growth</span>
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={async () => {
                            setShowProfileMenu(false);
                            await signOut();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#c86d51] dark:text-[#e07a5f] hover:bg-[#c86d51]/10 transition cursor-pointer text-left font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main CTA to app */}
                <Link
                  to="/app"
                  className="whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider rounded-none shadow-xs transition flex items-center gap-1.5"
                >
                  <span>Go to Journal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#2c2c26] hover:bg-[#3a3a30] dark:bg-[#e0ded5] dark:hover:bg-[#f0efe6] text-[#fbfaf5] dark:text-[#181814] text-xs font-semibold uppercase tracking-wider rounded-none shadow-xs transition flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Landing Sections */}
      <main className="relative z-10">
        {/* HERO SECTION - Pure Display Typography without artificial badges */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-14 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif italic font-bold tracking-tight text-[#2c2c26] dark:text-[#f0efe6] leading-tight sm:leading-tight">
            Your Private Sanctuary for <br />
            <span className="text-[#7d8461] dark:text-[#a3b18a] underline decoration-[#ddb892]/60 underline-offset-8">
              Deep Reflection & Clarity
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-[#5c5c52] dark:text-[#a8a89b] max-w-2xl mx-auto leading-relaxed font-light">
            Engage in thoughtful multi-turn dialogues to untangle complex feelings, challenge cognitive biases, and cultivate calm. Automatically distill breakthroughs into your encrypted, owner-isolated personal archive.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to={user ? '/app' : '/login'}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#7d8461] hover:bg-[#6c7351] text-white font-bold rounded-none shadow-md shadow-[#7d8461]/20 flex items-center justify-center gap-2.5 transition text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              <Feather className="w-4 h-4 text-[#ddb892]" />
              <span>{user ? 'Open Reflection Studio' : 'Start Your Journal'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#f4f4ea] dark:bg-[#252520] hover:bg-[#ecece0] dark:hover:bg-[#2e2e28] text-[#2c2c26] dark:text-[#f0efe6] border border-[#e8e8df] dark:border-[#2e2e28] font-semibold rounded-none flex items-center justify-center gap-2 transition text-xs sm:text-sm uppercase tracking-wider"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Quick Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#5c5c52] dark:text-[#a8a89b]">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#a3b18a]" />
              No Passwords Stored
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#a3b18a]" />
              Owner-Isolated Firestore
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Download className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#a3b18a]" />
              100% Client-Side Export (PDF/MD/JSON)
            </span>
          </div>
        </section>

        {/* INTERACTIVE VISUAL SHOWCASE MOCKUP SECTION */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] p-4 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#ecece0] dark:border-[#2e2e28] mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7d8461]" />
                <span className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                  Active Reflection Preview: Stoic Reflection Mode
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 text-[#7d8461] dark:text-[#a3b18a] font-mono text-[10px] uppercase font-bold">
                Sentiment: Seeking Clarity
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* User Thought Bubble */}
              <div className="flex justify-end">
                <div className="max-w-xl bg-[#f4f4ea] dark:bg-[#252520] border border-[#ecece0] dark:border-[#2e2e28] p-3.5 rounded-none text-[#2c2c26] dark:text-[#f0efe6]">
                  <p className="font-medium text-[11px] text-[#7d8461] dark:text-[#a3b18a] uppercase tracking-wider mb-1 font-mono">
                    You &bull; 8:45 PM
                  </p>
                  <p className="leading-relaxed">
                    &ldquo;I spent the whole afternoon stressing about a client delay that I could not prevent. I feel exhausted and frustrated with myself.&rdquo;
                  </p>
                </div>
              </div>

              {/* Socratic AI Companion Reply */}
              <div className="flex justify-start">
                <div className="max-w-xl bg-white dark:bg-[#181814] border border-[#7d8461]/40 p-4 rounded-none shadow-xs text-[#2c2c26] dark:text-[#f0efe6]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Feather className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#a3b18a]" />
                    <p className="font-serif italic font-bold text-xs text-[#7d8461] dark:text-[#a3b18a]">
                      Socratic Reflection Partner
                    </p>
                  </div>
                  <p className="text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    Notice where your exhaustion is focused: is it the delay itself, or the pressure you placed on yourself to control an uncontrollable outcome? If you separate what belonged to the client from what belonged to your response, what would your next hour look like?
                  </p>
                </div>
              </div>

              {/* Auto-Distilled Synthesis Box */}
              <div className="mt-4 p-4 bg-[#fbfaf5] dark:bg-[#181814] border border-dashed border-[#7d8461]/40">
                <div className="flex items-center gap-2 text-[#7d8461] dark:text-[#a3b18a] font-bold text-xs mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Automated Executive Synthesis & Takeaway</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5c5c52] dark:text-[#a8a89b]">
                  <div>
                    <span className="font-bold text-[#2c2c26] dark:text-[#f0efe6] block">Breakthrough Insight:</span>
                    <span className="italic">
                      Anxiety stemmed from internalizing external schedule slippage. Control was restored upon releasing ownership of other parties' timelines.
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#2c2c26] dark:text-[#f0efe6] block">Action Step Tomorrow:</span>
                    <span>
                      Draft a clean status email in the morning, then dedicate the rest of the day to creative project milestones.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (3 STEPS WITH DOTTED CONNECTING LINE) */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs uppercase text-[#7d8461] dark:text-[#a3b18a] tracking-widest font-bold">
              The Reflective Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] mt-1.5">
              How Fuenzer Journal Works
            </h2>
            <p className="text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] mt-2">
              Three connected stages from mental clutter to structured breakthroughs and lasting peace.
            </p>
          </div>

          {/* Steps Grid with Horizontal & Vertical Dotted Connection Lines */}
          <div className="relative">
            {/* Desktop Dotted Connecting Track 1 -> 2 -> 3 */}
            <div className="hidden md:block absolute top-11 left-[16%] right-[16%] h-0 border-t-2 border-dashed border-[#7d8461]/40 z-0 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="p-6 bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] shadow-xs flex flex-col justify-between relative group hover:border-[#7d8461]/40 transition">
                <div>
                  <div className="w-10 h-10 bg-[#7d8461] text-white flex items-center justify-center font-serif italic font-bold text-base mb-4 ring-4 ring-[#fbfaf5] dark:ring-[#181814] shadow-xs">
                    1
                  </div>
                  <h3 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-1.5">
                    Choose a Mindset & Speak Freely
                  </h3>
                  <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    Select a framework (Stoic, CBT, Gratitude, or Free-Flow) and type or dictate your raw thoughts without worrying about grammar or structure.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#ecece0] dark:border-[#2e2e28] flex items-center gap-1.5 text-[10px] font-mono text-[#7d8461] dark:text-[#a3b18a] font-bold">
                  <span>STEP 01</span>
                  <ArrowRight className="w-3 h-3 text-[#7d8461]/60" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] shadow-xs flex flex-col justify-between relative group hover:border-[#7d8461]/40 transition">
                <div>
                  <div className="w-10 h-10 bg-[#7d8461] text-white flex items-center justify-center font-serif italic font-bold text-base mb-4 ring-4 ring-[#fbfaf5] dark:ring-[#181814] shadow-xs">
                    2
                  </div>
                  <h3 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-1.5">
                    Engage in Socratic Dialogue
                  </h3>
                  <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    Receive calm, empathetic inquiries that challenge assumptions, unpack emotional roots, and guide you toward first-principles clarity.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#ecece0] dark:border-[#2e2e28] flex items-center gap-1.5 text-[10px] font-mono text-[#7d8461] dark:text-[#a3b18a] font-bold">
                  <span>STEP 02</span>
                  <ArrowRight className="w-3 h-3 text-[#7d8461]/60" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] shadow-xs flex flex-col justify-between relative group hover:border-[#7d8461]/40 transition">
                <div>
                  <div className="w-10 h-10 bg-[#7d8461] text-white flex items-center justify-center font-serif italic font-bold text-base mb-4 ring-4 ring-[#fbfaf5] dark:ring-[#181814] shadow-xs">
                    3
                  </div>
                  <h3 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-1.5">
                    Distill & Track Growth
                  </h3>
                  <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    With one click, convert dialogues into synthesized takeaways, tomorrow's action items, and view your 30-day emotional trajectory.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#ecece0] dark:border-[#2e2e28] flex items-center gap-1.5 text-[10px] font-mono text-[#7d8461] dark:text-[#a3b18a] font-bold">
                  <span>STEP 03</span>
                  <CheckCircle className="w-3 h-3 text-[#7d8461] dark:text-[#a3b18a]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FRAMEWORKS SHOWCASE */}
        <section id="frameworks" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-[#ecece0] dark:border-[#2e2e28]">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#7d8461] dark:text-[#a3b18a]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                Curated Reflection Frameworks
              </h2>
              <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b]">
                Proven philosophical and psychological models configured for conversational reflection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {samplePrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 bg-white dark:bg-[#1f1f1a] border border-[#e8e8df] dark:border-[#2e2e28] hover:border-[#7d8461]/50 transition flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-[#f4f4ea] dark:bg-[#252520] border border-[#e8e8df] dark:border-[#2e2e28] flex items-center justify-center text-[#7d8461] dark:text-[#a3b18a]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none border ${item.color}`}>
                        {item.tagline}
                      </span>
                    </div>

                    <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5c5c52] dark:text-[#dcdcd2] italic leading-relaxed bg-[#fbfaf5] dark:bg-[#181814] p-2.5 border border-[#ecece0] dark:border-[#2e2e28]">
                      {item.sample}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* USER TESTIMONIALS CAROUSEL SECTION (10 REVIEWS) */}
        <section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 border-t border-[#ecece0] dark:border-[#2e2e28]"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-xs uppercase text-[#7d8461] dark:text-[#a3b18a] tracking-widest font-bold">
                Voices of Clarity
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] mt-1.5">
                Reflections from Everyday Journalers
              </h2>
              <p className="text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] mt-1.5">
                Discover how thinkers, creators, and professionals cultivate mindful presence.
              </p>
            </div>

            {/* Carousel Navigation Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono text-[#5c5c52] dark:text-[#a8a89b] font-semibold mr-2">
                {String(testimonialIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>
              <button
                onClick={handlePrevTestimonial}
                aria-label="Previous testimonial"
                className="w-8 h-8 rounded-none bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] hover:bg-[#f4f4ea] dark:hover:bg-[#252520] text-[#2c2c26] dark:text-[#f0efe6] flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextTestimonial}
                aria-label="Next testimonial"
                className="w-8 h-8 rounded-none bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] hover:bg-[#f4f4ea] dark:hover:bg-[#252520] text-[#2c2c26] dark:text-[#f0efe6] flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Testimonial Active Display Cards (Showing 2 cards side-by-side on desktop, 1 on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-300">
            {/* Primary active card */}
            {(() => {
              const t1 = testimonials[testimonialIndex];
              const t2 = testimonials[(testimonialIndex + 1) % testimonials.length];
              return (
                <>
                  <div className="p-6 sm:p-7 bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] shadow-xs flex flex-col justify-between relative">
                    <div>
                      <Quote className="w-7 h-7 text-[#7d8461]/35 dark:text-[#7d8461]/50 mb-3" />
                      <p className="text-xs sm:text-sm text-[#3a3a30] dark:text-[#e4e3da] leading-relaxed italic">
                        &ldquo;{t1.quote}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-5 border-t border-[#ecece0] dark:border-[#2e2e28] mt-5">
                      <div className="w-9 h-9 bg-[#7d8461] text-white flex items-center justify-center font-bold text-xs font-serif shadow-xs">
                        {t1.initials}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#2c2c26] dark:text-[#f0efe6] font-serif italic">
                          {t1.name}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">{t1.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Secondary card on desktop */}
                  <div className="hidden md:flex p-6 sm:p-7 bg-[#fbfaf5] dark:bg-[#252520] border border-[#ecece0] dark:border-[#2e2e28] shadow-xs flex-col justify-between relative">
                    <div>
                      <Quote className="w-7 h-7 text-[#7d8461]/35 dark:text-[#7d8461]/50 mb-3" />
                      <p className="text-xs sm:text-sm text-[#3a3a30] dark:text-[#e4e3da] leading-relaxed italic">
                        &ldquo;{t2.quote}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-5 border-t border-[#ecece0] dark:border-[#2e2e28] mt-5">
                      <div className="w-9 h-9 bg-[#3a3a30] dark:bg-[#4a4a40] text-[#fbfaf5] flex items-center justify-center font-bold text-xs font-serif shadow-xs">
                        {t2.initials}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#2c2c26] dark:text-[#f0efe6] font-serif italic">
                          {t2.name}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">{t2.role}</p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Carousel Dot Pagination Indicators */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-1.5 transition-all cursor-pointer rounded-none ${
                  idx === testimonialIndex
                    ? 'w-6 bg-[#7d8461] dark:bg-[#a3b18a]'
                    : 'w-2 bg-[#d8d8cc] dark:bg-[#3a3a30] hover:bg-[#8c8c80]'
                }`}
              />
            ))}
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-[#ecece0] dark:border-[#2e2e28]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="font-mono text-xs uppercase text-[#7d8461] dark:text-[#a3b18a] tracking-widest font-bold">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#2e2e28] transition overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#fbfaf5] dark:hover:bg-[#252520] transition"
                  >
                    <span className="font-serif italic font-bold text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6]">
                      {faq.question}
                    </span>
                    <div className="w-5 h-5 flex items-center justify-center text-[#7d8461] dark:text-[#a3b18a] shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed border-t border-[#ecece0] dark:border-[#2e2e28] pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CALL TO ACTION BANNER */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-[#2c2c26] dark:bg-[#1f1f1a] border dark:border-[#2e2e28] text-[#fbfaf5] p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-4xl font-serif italic font-bold text-[#fbfaf5] dark:text-[#f0efe6]">
                Begin Cultivating Daily Clarity Today
              </h2>
              <p className="text-xs sm:text-sm text-[#d8d8cc] dark:text-[#a8a89b] font-light leading-relaxed">
                Step away from the noise. Experience thoughtful Socratic guidance, mood tracking, and complete privacy in your private reflection sanctuary.
              </p>
              <div className="pt-3">
                <Link
                  to={user ? '/app' : '/login'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-md"
                >
                  <Feather className="w-4 h-4 text-[#ddb892]" />
                  <span>{user ? 'Open Reflection Studio' : 'Start Your Journal Free'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enterprise Global Footer */}
      <Footer />
    </div>
  );
};
