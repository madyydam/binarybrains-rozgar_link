import React, { useState } from 'react';
import {
  MOCK_VIDEO_CATEGORIES,
  MOCK_VIDEO_COURSES,
  mockCareerTracks,
  mockProjects,
  VideoCategory,
  VideoCourse,
  CareerTrack,
  Project
} from '../../data/learnData';
import {
  PlayCircle,
  Target,
  Hammer,
  BookOpen,
  Clock,
  Star,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Code,
  Palette,
  TrendingUp,
  CheckCircle2,
  Download,
  Share2,
  X,
  Play
} from 'lucide-react';

interface LearnHubProps {
  onToast: (msg: string) => void;
  candidate?: any;
  handleCompleteCourse?: (id: string) => void;
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

const projectCatColors: Record<string, string> = {
  AI: "bg-violet-50 text-violet-700 border-violet-200",
  Development: "bg-blue-50 text-blue-700 border-blue-200",
  Design: "bg-pink-50 text-pink-700 border-pink-200",
  Growth: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const LearnHub: React.FC<LearnHubProps> = ({
  onToast,
  candidate,
  handleCompleteCourse
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'tracks' | 'projects'>('skills');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<VideoCourse | null>(null);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({
    'js-m1': 65,
    'py-m1': 100
  });
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certCourse, setCertCourse] = useState<VideoCourse | null>(null);

  const selectedCategory = MOCK_VIDEO_CATEGORIES.find(c => c.slug === selectedCategorySlug);

  const filteredCourses = MOCK_VIDEO_COURSES.filter(crs => {
    if (!selectedCategorySlug) return true;
    return crs.category_id === selectedCategorySlug;
  });

  const handleOpenCourse = (course: VideoCourse) => {
    setActiveCourse(course);
  };

  const handleFinishCourse = (course: VideoCourse) => {
    setCourseProgress(prev => ({ ...prev, [course.id]: 100 }));
    setCertCourse(course);
    setShowCertificateModal(true);
    if (handleCompleteCourse) {
      handleCompleteCourse(course.id);
    }
    onToast(`Course completed! 100% Verified Certificate generated.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-3 sm:px-6">

      {/* ── HEADER SECTION (EXACT FUTORA CAREER OS) ── */}
      <div className="space-y-4 border-b pb-6 border-slate-200">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B3D] tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-[#345BFF]" /> Skills, Tracks & Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Choose your learning path: master single skills, follow structured career tracks, or build live proof-of-work projects to secure elite opportunities.
          </p>
        </div>

        {/* ── 3 PREMIUM HIGH-CONTRAST TAB CARDS (EXACT CAREER OS) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* 1. Skills Ecosystem Card */}
          <div
            onClick={() => {
              setActiveTab('skills');
              setSelectedCategorySlug(null);
              setSelectedSubCategory(null);
              setActiveCourse(null);
            }}
            className={cn(
              "p-4 rounded-xl cursor-pointer flex items-start gap-3 border transition-all duration-200 select-none shadow-sm",
              activeTab === 'skills'
                ? "bg-[#0F172A] border-[#345BFF] text-white shadow-md ring-2 ring-[#345BFF]/30"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              activeTab === 'skills' ? "bg-[#345BFF]/20 text-[#345BFF]" : "bg-slate-100 text-slate-500"
            )}>
              <PlayCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className={cn("text-[13px] font-bold", activeTab === 'skills' ? "text-white" : "text-slate-900")}>
                Skills Ecosystem
              </h3>
              <p className={cn("text-[11px] mt-0.5 leading-snug", activeTab === 'skills' ? "text-slate-400" : "text-slate-500")}>
                Explore modular topics, libraries, and frameworks at your own pace.
              </p>
            </div>
          </div>

          {/* 2. Career Tracks Card */}
          <div
            onClick={() => {
              setActiveTab('tracks');
              setActiveCourse(null);
            }}
            className={cn(
              "p-4 rounded-xl cursor-pointer flex items-start gap-3 border transition-all duration-200 select-none shadow-sm",
              activeTab === 'tracks'
                ? "bg-[#0F172A] border-[#345BFF] text-white shadow-md ring-2 ring-[#345BFF]/30"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              activeTab === 'tracks' ? "bg-[#345BFF]/20 text-[#345BFF]" : "bg-slate-100 text-slate-500"
            )}>
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className={cn("text-[13px] font-bold", activeTab === 'tracks' ? "text-white" : "text-slate-900")}>
                Career Tracks
              </h3>
              <p className={cn("text-[11px] mt-0.5 leading-snug", activeTab === 'tracks' ? "text-slate-400" : "text-slate-500")}>
                Goal-oriented pathways mapping skills directly to verified developer roles.
              </p>
            </div>
          </div>

          {/* 3. Proof-of-Work Projects Card */}
          <div
            onClick={() => {
              setActiveTab('projects');
              setActiveCourse(null);
            }}
            className={cn(
              "p-4 rounded-xl cursor-pointer flex items-start gap-3 border transition-all duration-200 select-none shadow-sm",
              activeTab === 'projects'
                ? "bg-[#0F172A] border-[#345BFF] text-white shadow-md ring-2 ring-[#345BFF]/30"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              activeTab === 'projects' ? "bg-[#345BFF]/20 text-[#345BFF]" : "bg-slate-100 text-slate-500"
            )}>
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <h3 className={cn("text-[13px] font-bold", activeTab === 'projects' ? "text-white" : "text-slate-900")}>
                Proof-of-Work Projects
              </h3>
              <p className={cn("text-[11px] mt-0.5 leading-snug", activeTab === 'projects' ? "text-slate-400" : "text-slate-500")}>
                Build real applications to showcase your execution and capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── COURSE PLAYER VIEW (IF A VIDEO IS PLAYING) ── */}
      {activeCourse ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <button
              onClick={() => setActiveCourse(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#345BFF] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Courses Catalog
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {activeCourse.difficulty} · {activeCourse.duration}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Main Embed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                <iframe
                  src="https://www.youtube.com/embed/Zg4-uSjxosE"
                  title={activeCourse.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <span>Instructor: {activeCourse.instructor_name}</span>
                  <span>·</span>
                  <span>★ {activeCourse.rating} ({activeCourse.total_views.toLocaleString()} learners)</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#0F1B3D]">{activeCourse.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{activeCourse.description}</p>
              </div>

              {/* Progress & Complete Action */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex-1 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Course Progress</span>
                    <span>{courseProgress[activeCourse.id] || 35}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#345BFF] rounded-full transition-all duration-300"
                      style={{ width: `${courseProgress[activeCourse.id] || 35}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleFinishCourse(activeCourse)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
                >
                  Mark 100% Complete & Get Certificate 🎓
                </button>
              </div>
            </div>

            {/* Lessons Playlist Sidebar */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F1B3D] flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 text-[#345BFF]" /> Course Curriculum ({activeCourse.lessons?.length || 3})
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {(activeCourse.lessons || [
                  { id: '1', title: '1. Introduction & Overview', duration: '12:05', video_url: '' },
                  { id: '2', title: '2. Architecture & Core Concepts', duration: '28:15', video_url: '' },
                  { id: '3', title: '3. Hands-On Real World Implementation', duration: '45:30', video_url: '' }
                ]).map((lesson, idx) => (
                  <div key={lesson.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{lesson.title}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{lesson.duration}</span>
                      </div>
                    </div>
                    <Play className="h-3.5 w-3.5 text-[#345BFF] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ══════════════ TAB 1: SKILLS ECOSYSTEM (EXACT FUTORA CAREER OS) ══════════════ */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Back breadcrumb if category is open */}
              {selectedCategory && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 p-2.5 rounded-xl">
                  <button
                    onClick={() => { setSelectedCategorySlug(null); setSelectedSubCategory(null); }}
                    className="text-[#345BFF] font-bold hover:underline"
                  >
                    ← All 9 Categories
                  </button>
                  <span>/</span>
                  <span className="text-slate-900 font-bold">{selectedCategory.name}</span>
                </div>
              )}

              {/* View 1A: 9 Category Grid (Aspect Square Rounded-3xl with image overlay) */}
              {!selectedCategorySlug ? (
                <div className="space-y-6">
                  <div className="space-y-2 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#345BFF]/10 text-[10px] font-bold text-[#345BFF] uppercase tracking-wider mx-auto">
                      <PlayCircle className="h-3.5 w-3.5" />
                      Video Course Ecosystem
                    </div>
                    <h2 className="text-2xl font-black text-[#0F1B3D] tracking-tight">
                      Select Your <span className="text-[#345BFF]">Career Path</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider opacity-75">
                      Master In-Demand Skills through Structured Learning
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {MOCK_VIDEO_CATEGORIES.map((cat: VideoCategory) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className="cursor-pointer group"
                      >
                        <div className="relative aspect-square rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          {/* Background Image with Color Overlay */}
                          <div className="absolute inset-0">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div
                              className="absolute inset-0 opacity-80 mix-blend-multiply"
                              style={{ backgroundColor: cat.color }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute inset-0 p-3.5 sm:p-4 flex flex-col justify-between items-center text-center">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg text-lg font-bold">
                              {cat.slug === 'web-dev' ? '💻' :
                               cat.slug === 'app-dev' ? '📱' :
                               cat.slug === 'ai-ml' ? '✨' :
                               cat.slug === 'ui-ux' ? '🎨' :
                               cat.slug === 'data-analytics' ? '📊' :
                               cat.slug === 'cybersecurity' ? '🛡️' :
                               cat.slug === 'marketing' ? '📢' :
                               cat.slug === 'business' ? '🚀' : '⚡'}
                            </div>

                            <div>
                              <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                                {cat.name}
                              </h3>
                              <span className="text-[10px] text-white/80 font-medium mt-1 block">
                                {cat.subcategories.length} Tracks →
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* View 1B: Subcategories & Courses inside selected category */
                <div className="space-y-6">
                  <div
                    className="p-6 rounded-3xl text-white relative overflow-hidden shadow-md"
                    style={{ backgroundColor: selectedCategory?.color || '#345BFF' }}
                  >
                    <div className="relative z-10 space-y-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-white/80">
                        Category Hub
                      </span>
                      <h2 className="text-2xl font-black">{selectedCategory?.name}</h2>
                      <p className="text-xs text-white/90 max-w-xl">{selectedCategory?.description}</p>
                    </div>
                  </div>

                  {/* Subcategory Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedSubCategory(null)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                        selectedSubCategory === null
                          ? "bg-[#345BFF] text-white border-[#345BFF]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      All Tracks ({selectedCategory?.subcategories.length})
                    </button>
                    {selectedCategory?.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubCategory(sub.name)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                          selectedSubCategory === sub.name
                            ? "bg-[#345BFF] text-white border-[#345BFF]"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>

                  {/* Courses Showcase Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourses.map((course: VideoCourse) => {
                      const prog = courseProgress[course.id] || 0;
                      return (
                        <div
                          key={course.id}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
                        >
                          {/* Thumbnail Area */}
                          <div className="relative aspect-video overflow-hidden bg-slate-900">
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border backdrop-blur-md",
                                course.difficulty === 'Beginner' ? "bg-emerald-500/90 text-white border-emerald-400" :
                                course.difficulty === 'Intermediate' ? "bg-amber-500/90 text-white border-amber-400" :
                                "bg-rose-500/90 text-white border-rose-400"
                              )}>
                                {course.difficulty}
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#345BFF]" />
                              {course.duration}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                <span>{course.instructor_name}</span>
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Star className="h-3 w-3 fill-amber-500" /> {course.rating}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-[#0F1B3D] line-clamp-2 leading-tight">
                                {course.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {course.description}
                              </p>
                            </div>

                            {/* Progress bar if ongoing */}
                            {prog > 0 && (
                              <div className="space-y-1 pt-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                  <span>Progress</span>
                                  <span>{prog}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#345BFF]" style={{ width: `${prog}%` }} />
                                </div>
                              </div>
                            )}

                            {/* CTA Action */}
                            <div className="pt-2 flex gap-2">
                              <button
                                onClick={() => handleOpenCourse(course)}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Play className="h-3 w-3 fill-white" />
                                {prog === 100 ? 'Review Video' : prog > 0 ? 'Continue' : 'Start Course'}
                              </button>
                              {prog === 100 && (
                                <button
                                  onClick={() => { setCertCourse(course); setShowCertificateModal(true); }}
                                  className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                                  title="View Certificate"
                                >
                                  🎓 Cert
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB 2: CAREER TRACKS (EXACT FUTORA CAREER OS) ══════════════ */}
          {activeTab === 'tracks' && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2 mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#345BFF]/10 text-[#345BFF] text-xs font-bold">
                  <Target className="h-3.5 w-3.5" /> Structured Paths
                </div>
                <h2 className="text-2xl font-black text-[#0F1B3D]">
                  Career Tracks to <span className="text-[#345BFF]">Your Dream Role</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Follow a structured path from learning to getting hired. Each track maps directly to real opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockCareerTracks.map((track: CareerTrack) => {
                  const Icon = track.icon === 'brain' ? Sparkles :
                               track.icon === 'code' ? Code :
                               track.icon === 'palette' ? Palette : TrendingUp;

                  return (
                    <div
                      key={track.id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[#345BFF]/10 text-[#345BFF] flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-[#0F1B3D]">{track.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                              difficultyColors[track.difficulty] || "bg-slate-100 text-slate-600"
                            )}>
                              {track.difficulty}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                              <Clock className="h-3 w-3" /> {track.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {track.description}
                      </p>

                      {/* Progress Visual */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>Track Pathway</span>
                          <span className="text-[#345BFF] font-bold">Learn → Build → Apply → Hired</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#345BFF] to-[#10B981] w-2/5 rounded-full" />
                        </div>
                      </div>

                      {/* 3 Stats: Courses, Internships, Jobs */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <BookOpen className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                          <span className="text-xs font-extrabold text-slate-800">{track.coursesCount}</span>
                          <p className="text-[10px] text-slate-400 font-medium">Courses</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <GraduationCap className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                          <span className="text-xs font-extrabold text-slate-800">{track.internshipsCount}</span>
                          <p className="text-[10px] text-slate-400 font-medium">Internships</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <Briefcase className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                          <span className="text-xs font-extrabold text-slate-800">{track.jobsCount}</span>
                          <p className="text-[10px] text-slate-400 font-medium">Open Jobs</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => onToast(`Enrolled in ${track.title} Track! Syllabus unlocked.`)}
                        className="w-full py-2.5 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        Start Career Track
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════ TAB 3: PROOF-OF-WORK PROJECTS (EXACT FUTORA CAREER OS) ══════════════ */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-2 mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#345BFF]/10 text-[#345BFF] text-xs font-bold">
                  <Hammer className="h-3.5 w-3.5" /> Proof of Work
                </div>
                <h2 className="text-2xl font-black text-[#0F1B3D]">
                  Build Proof, <span className="text-[#345BFF]">Not Certificates</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-world projects that prove your skills. Complete them to unlock internships and recruiter introductions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mockProjects.map((project: Project) => (
                  <div
                    key={project.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "px-2.5 py-0.5 text-[10px] font-bold rounded-full border",
                        projectCatColors[project.category] || "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {project.category}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                        difficultyColors[project.difficulty] || "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {project.difficulty}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-bold text-[#0F1B3D] leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Skills Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.map(sk => (
                        <span key={sk} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Duration */}
                    <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {project.duration}
                    </div>

                    {/* Deliverables Box */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deliverables:</span>
                      <div className="flex flex-wrap gap-1">
                        {project.deliverables.map(item => (
                          <span key={item} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Unlocks Banner */}
                    <div className="p-2.5 rounded-xl bg-[#345BFF]/5 border border-[#345BFF]/15 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-[#0F1B3D]">Unlocks:</span>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#345BFF]">
                        <span>🎓 {project.unlocks.internships} Internships</span>
                        <span>·</span>
                        <span>💼 {project.unlocks.jobs} Jobs</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => onToast(`Enrolled in project: ${project.title}`)}
                      className="w-full py-2.5 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      Start Project
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── 100% VERIFIED CERTIFICATE MODAL (OFFICIAL ROZGARSATHI CREST) ── */}
      {showCertificateModal && certCourse && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowCertificateModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Certificate Canvas */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] border-4 border-double border-[#345BFF]/40 text-center space-y-3 relative">
              <div className="text-3xl">🏛️</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#345BFF]">
                RozgarSathi National Skill Academy
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Certificate of Completion
              </h2>
              <p className="text-xs text-slate-500 font-serif italic">This certifies that</p>

              <div className="text-lg sm:text-xl font-black text-[#0F1B3D] border-b-2 border-slate-300 pb-1 mx-6 font-serif">
                {candidate?.name || 'Asha Patil'}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto pt-1">
                has successfully completed all verified lessons, coding practicums, and benchmark assessments for
              </p>

              <h3 className="text-sm font-extrabold text-[#345BFF] bg-blue-50 py-1 px-3 rounded-lg inline-block">
                {certCourse.title}
              </h3>

              <div className="pt-4 flex items-center justify-between text-[9px] text-slate-400 font-semibold border-t border-slate-200">
                <div className="text-left">
                  <span>Authorized Signatory</span>
                  <p className="font-bold text-slate-700">RozgarSathi Academic Board</p>
                </div>
                <div className="text-right">
                  <span>Credential ID</span>
                  <p className="font-mono font-bold text-slate-700">RZG-CERT-2026-MH94</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onToast('Certificate downloaded as High-Resolution PDF.');
                  setShowCertificateModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#345BFF] hover:bg-[#2348E0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </button>
              <button
                onClick={() => {
                  onToast('Certificate added to profile!');
                  setShowCertificateModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Credential
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
