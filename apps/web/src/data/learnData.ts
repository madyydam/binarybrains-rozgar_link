export interface VideoSubcategory {
  id: string;
  name: string;
  image: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  image: string;
  subcategories: VideoSubcategory[];
}

export interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  video_url: string;
}

export interface VideoCourse {
  id: string;
  category_id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  instructor_name: string;
  thumbnail_url: string;
  video_url: string;
  source_platform: string;
  is_external: boolean;
  total_views: number;
  rating: number;
  created_at: string;
  lessons?: VideoLesson[];
}

export interface Course {
  id: string;
  title: string;
  category: "AI" | "Development" | "Design" | "Growth";
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  outcome: "Job-ready" | "Internship-ready";
  mappedJobs: number;
  description: string;
  isPaid: boolean;
  price?: number;
}

export interface CareerTrack {
  id: string;
  title: string;
  description: string;
  icon: string;
  skills: string[];
  coursesCount: number;
  projectsCount: number;
  jobsCount: number;
  internshipsCount: number;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "AI" | "Development" | "Design" | "Growth";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  skills: string[];
  deliverables: string[];
  unlocks: {
    internships: number;
    jobs: number;
  };
}

export const MOCK_VIDEO_CATEGORIES: VideoCategory[] = [
  {
    id: "web-dev",
    name: "Web Development",
    slug: "web-dev",
    icon: "Code2",
    description: "Modern Fullstack development",
    color: "#3B82F6",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "frontend", name: "Frontend Development", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=400" },
      { id: "backend", name: "Backend Development", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400" },
      { id: "fullstack", name: "Full Stack Development", image: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&q=80&w=400" },
      { id: "mern", name: "MERN Stack", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400" },
      { id: "api", name: "API Development", image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=400" },
      { id: "web-sec", name: "Web Security", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "app-dev",
    name: "App Development",
    slug: "app-dev",
    icon: "Smartphone",
    description: "Mobile app development",
    color: "#EF4444",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "android", name: "Android Development", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400" },
      { id: "ios", name: "iOS Development", image: "https://images.unsplash.com/photo-1556656793-062ff987b50d?auto=format&fit=crop&q=80&w=400" },
      { id: "flutter", name: "Flutter Development", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400" },
      { id: "react-native", name: "React Native", image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=400" },
      { id: "cross-platform", name: "Cross-Platform Apps", image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    slug: "ai-ml",
    icon: "Sparkles",
    description: "Master GenAI and ML",
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "ml", name: "Machine Learning", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=400" },
      { id: "deep-learning", name: "Deep Learning", image: "https://images.unsplash.com/photo-1509228468518-180dd482195b?auto=format&fit=crop&q=80&w=400" },
      { id: "gen-ai", name: "Generative AI", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400" },
      { id: "prompt-eng", name: "Prompt Engineering", image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=400" },
      { id: "data-science", name: "Data Science", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400" },
      { id: "ai-automation", name: "AI Tools & Automation", image: "https://images.unsplash.com/photo-1620712943543-bcc4607c9759?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "ui-ux",
    name: "UI/UX & Design",
    slug: "ui-ux",
    icon: "Palette",
    description: "Design beautiful interfaces",
    color: "#EC4899",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "ui-design", name: "UI Design", image: "https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?auto=format&fit=crop&q=80&w=400" },
      { id: "ux-research", name: "UX Research", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400" },
      { id: "figma", name: "Figma Masterclass", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400" },
      { id: "web-design", name: "Web Design", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=400" },
      { id: "design-systems", name: "Design Systems", image: "https://images.unsplash.com/photo-1634084462412-b54873c0a56d?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "data-analytics",
    name: "Data & Analytics",
    slug: "data-analytics",
    icon: "BarChart3",
    description: "Data analysis and visualization",
    color: "#10B981",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "data-analysis", name: "Data Analysis", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400" },
      { id: "python-data", name: "Python for Data", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400" },
      { id: "sql", name: "SQL Mastery", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400" },
      { id: "power-bi", name: "Power BI", image: "https://images.unsplash.com/photo-1599658880436-c61792e70672?auto=format&fit=crop&q=80&w=400" },
      { id: "tableau", name: "Tableau", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    slug: "cybersecurity",
    icon: "ShieldAlert",
    description: "Defend against cyber threats",
    color: "#F59E0B",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "ethical-hacking", name: "Ethical Hacking", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400" },
      { id: "network-security", name: "Network Security", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=400" },
      { id: "bug-bounty", name: "Bug Bounty", image: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&q=80&w=400" },
      { id: "web-sec", name: "Web Security", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "marketing",
    name: "Digital Marketing",
    slug: "marketing",
    icon: "Megaphone",
    description: "Grow brands online",
    color: "#6366F1",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "social-media", name: "Social Media Marketing", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400" },
      { id: "seo", name: "SEO Optimization", image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&q=80&w=400" },
      { id: "performance-mkt", name: "Performance Marketing", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400" },
      { id: "content-mkt", name: "Content Marketing", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "business",
    name: "Startup & Business",
    slug: "business",
    icon: "Rocket",
    description: "Build and scale your business",
    color: "#06B6D4",
    image: "https://images.unsplash.com/photo-1556761175-5973bc0f22b8?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "entrepreneurship", name: "Entrepreneurship", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=400" },
      { id: "product-mgmt", name: "Product Management", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" },
      { id: "growth-hacking", name: "Growth Hacking", image: "https://images.unsplash.com/photo-1454165833267-03511eb44d8b?auto=format&fit=crop&q=80&w=400" },
      { id: "fundraising", name: "Fundraising Basics", image: "https://images.unsplash.com/photo-1553484771-047a44eee27b?auto=format&fit=crop&q=80&w=400" }
    ]
  },
  {
    id: "freelancing",
    name: "Freelancing",
    slug: "freelancing",
    icon: "Zap",
    description: "Launch your freelance career",
    color: "#F43F5E",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400",
    subcategories: [
      { id: "freelance-basics", name: "Freelancing Basics", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" },
      { id: "clients", name: "Client Acquisition", image: "https://images.unsplash.com/photo-1556761175-5973bc0f22b8?auto=format&fit=crop&q=80&w=400" },
      { id: "upwork", name: "Upwork Masterclass", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400" },
      { id: "branding", name: "Personal Branding", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" }
    ]
  }
];

export const MOCK_VIDEO_COURSES: VideoCourse[] = [
  // Web Dev
  {
    id: "js-m1",
    category_id: "web-dev",
    title: "Modern JavaScript & TypeScript Masterclass",
    description: "Deep dive into JS: From Variables and Scopes to Closures, Event Loop, and Async/Await.",
    difficulty: "Beginner",
    duration: "45h",
    instructor_name: "Chai aur Code",
    thumbnail_url: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/Zg4-uSjxosE",
    source_platform: "YouTube",
    is_external: true,
    total_views: 120000,
    rating: 5.0,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "js-l1", title: "JavaScript Introduction & Setup", duration: "12:05", video_url: "https://youtu.be/Zg4-uSjxosE" },
      { id: "js-l2", title: "Execution Context & Call Stack", duration: "18:40", video_url: "https://youtu.be/Zg4-uSjxosE" },
      { id: "js-l3", title: "Promises, Fetch & Async Architecture", duration: "24:15", video_url: "https://youtu.be/Zg4-uSjxosE" }
    ]
  },
  {
    id: "react-m1",
    category_id: "web-dev",
    title: "Production React 18 & State Architecture",
    description: "Build robust web apps with Hooks, Custom Reducers, Suspense, and Clean Component Design.",
    difficulty: "Intermediate",
    duration: "32h",
    instructor_name: "Hitesh Choudhary",
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/bMknfKXIFA8",
    source_platform: "YouTube",
    is_external: true,
    total_views: 95000,
    rating: 4.9,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "react-l1", title: "React Component Lifecycle & Virtual DOM", duration: "14:50", video_url: "https://youtu.be/bMknfKXIFA8" },
      { id: "react-l2", title: "Advanced Hooks: useMemo & useCallback", duration: "21:30", video_url: "https://youtu.be/bMknfKXIFA8" }
    ]
  },
  // App Dev
  {
    id: "flutter-m1",
    category_id: "app-dev",
    title: "Flutter & Dart Cross-Platform Pro",
    description: "Build beautiful iOS & Android apps with a single codebase, Bloc architecture, and animations.",
    difficulty: "Intermediate",
    duration: "38h",
    instructor_name: "Vandad Nahavandipoor",
    thumbnail_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/Zg4-uSjxosE",
    source_platform: "YouTube",
    is_external: true,
    total_views: 78000,
    rating: 4.9,
    created_at: new Date().toISOString()
  },
  // AI-ML
  {
    id: "py-m1",
    category_id: "ai-ml",
    title: "Python for Data Science & Machine Learning",
    description: "Master Python specifically for data processing, pandas, numpy, and introductory neural nets.",
    difficulty: "Beginner",
    duration: "20h",
    instructor_name: "Krish Naik",
    thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/fXAGTOZ25H8",
    source_platform: "YouTube",
    is_external: true,
    total_views: 45000,
    rating: 4.9,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "py-l1", title: "NumPy Arrays and Vectorization", duration: "15:20", video_url: "https://youtu.be/fXAGTOZ25H8" },
      { id: "py-l2", title: "Pandas Dataframes for Tabular Data", duration: "22:10", video_url: "https://youtu.be/fXAGTOZ25H8" }
    ]
  },
  // UI-UX
  {
    id: "figma-m1",
    category_id: "ui-ux",
    title: "Figma Masterclass: AutoLayout & Design Systems",
    description: "Design pixel-perfect interfaces, scalable design systems, design tokens, and developer handoffs.",
    difficulty: "Beginner",
    duration: "18h",
    instructor_name: "DesignCourse",
    thumbnail_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/c9Wg6Cb_YlU",
    source_platform: "YouTube",
    is_external: true,
    total_views: 62000,
    rating: 4.8,
    created_at: new Date().toISOString()
  },
  // Data Analytics
  {
    id: "sql-m1",
    category_id: "data-analytics",
    title: "SQL & Relational Databases for Analysts",
    description: "From Basic SELECTs to Window Functions, CTEs, Indexing, and Query Optimization.",
    difficulty: "Beginner",
    duration: "16h",
    instructor_name: "Alex The Analyst",
    thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/Zg4-uSjxosE",
    source_platform: "YouTube",
    is_external: true,
    total_views: 84000,
    rating: 4.9,
    created_at: new Date().toISOString()
  },
  // Cybersecurity
  {
    id: "sec-m1",
    category_id: "cybersecurity",
    title: "Hands-On Ethical Hacking & Web Pentesting",
    description: "OWASP Top 10, Network Vulnerability Scanning, Burp Suite, and Defensive Remediation.",
    difficulty: "Intermediate",
    duration: "25h",
    instructor_name: "The Cyber Mentor",
    thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/Zg4-uSjxosE",
    source_platform: "YouTube",
    is_external: true,
    total_views: 110000,
    rating: 4.9,
    created_at: new Date().toISOString()
  },
  // Marketing
  {
    id: "mkt-m1",
    category_id: "marketing",
    title: "Technical SEO & Growth Architecture",
    description: "Master Schema Markup, Crawl Budgets, Core Web Vitals, and Performance Analytics.",
    difficulty: "Beginner",
    duration: "14h",
    instructor_name: "Ahrefs Academy",
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/Zg4-uSjxosE",
    source_platform: "YouTube",
    is_external: true,
    total_views: 52000,
    rating: 4.8,
    created_at: new Date().toISOString()
  },
  // Business
  {
    id: "biz-m1",
    category_id: "business",
    title: "Startup Foundations: Zero to 1 Product Strategy",
    description: "Idea Validation, Unit Economics, MVP Prototyping, and Customer Acquisition.",
    difficulty: "Beginner",
    duration: "12h",
    instructor_name: "Y Combinator",
    thumbnail_url: "https://images.unsplash.com/photo-1556761175-5973bc0f22b8?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/Zg4-uSjxosE",
    source_platform: "YouTube",
    is_external: true,
    total_views: 94000,
    rating: 5.0,
    created_at: new Date().toISOString()
  },
  // Freelancing
  {
    id: "free-m1",
    category_id: "freelancing",
    title: "High-Ticket Freelancing & Client Acquisition",
    description: "Proposal Writing, Upwork Top-Rated Strategy, Portfolio Positioning, and Invoicing.",
    difficulty: "Beginner",
    duration: "10h",
    instructor_name: "Chris Do",
    thumbnail_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600",
    video_url: "https://youtu.be/Zg4-uSjxosE",
    source_platform: "YouTube",
    is_external: true,
    total_views: 67000,
    rating: 4.9,
    created_at: new Date().toISOString()
  }
];

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "AI Foundations for Builders",
    category: "AI",
    level: "Beginner",
    duration: "4 weeks",
    outcome: "Internship-ready",
    mappedJobs: 8,
    description: "Master the fundamentals of AI, ML concepts, and prompt engineering.",
    isPaid: false
  },
  {
    id: "2",
    title: "Full-Stack Developer Track",
    category: "Development",
    level: "Intermediate",
    duration: "8 weeks",
    outcome: "Job-ready",
    mappedJobs: 15,
    description: "Build production-ready apps with React, Node.js, and databases.",
    isPaid: true,
    price: 1999
  },
  {
    id: "3",
    title: "UI/UX for Developers",
    category: "Design",
    level: "Beginner",
    duration: "3 weeks",
    outcome: "Internship-ready",
    mappedJobs: 6,
    description: "Learn design principles, Figma, and build beautiful interfaces.",
    isPaid: false
  },
  {
    id: "4",
    title: "Growth & Marketing Essentials",
    category: "Growth",
    level: "Beginner",
    duration: "4 weeks",
    outcome: "Job-ready",
    mappedJobs: 10,
    description: "Master SEO, content marketing, and user acquisition strategies.",
    isPaid: true,
    price: 999
  },
  {
    id: "5",
    title: "Become an AI Engineer",
    category: "AI",
    level: "Advanced",
    duration: "10 weeks",
    outcome: "Job-ready",
    mappedJobs: 12,
    description: "Build AI agents, fine-tune models, and deploy production AI systems.",
    isPaid: true,
    price: 2999
  },
  {
    id: "6",
    title: "Get Your First Internship",
    category: "Growth",
    level: "Beginner",
    duration: "2 weeks",
    outcome: "Internship-ready",
    mappedJobs: 20,
    description: "Build proof of work, craft your profile, and land your first role.",
    isPaid: false
  }
];

export const mockCareerTracks: CareerTrack[] = [
  {
    id: "1",
    title: "AI Engineer",
    description: "Build AI agents, fine-tune models, and deploy production AI systems.",
    icon: "brain",
    skills: ["Python", "Machine Learning", "LLMs", "Prompt Engineering", "RAG"],
    coursesCount: 5,
    projectsCount: 3,
    jobsCount: 12,
    internshipsCount: 8,
    duration: "12 weeks",
    difficulty: "Advanced"
  },
  {
    id: "2",
    title: "Full-Stack Developer",
    description: "Master frontend, backend, and databases to build complete applications.",
    icon: "code",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "APIs"],
    coursesCount: 6,
    projectsCount: 4,
    jobsCount: 15,
    internshipsCount: 10,
    duration: "14 weeks",
    difficulty: "Intermediate"
  },
  {
    id: "3",
    title: "UI/UX Designer",
    description: "Create beautiful, user-centered designs that solve real problems.",
    icon: "palette",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
    coursesCount: 4,
    projectsCount: 3,
    jobsCount: 8,
    internshipsCount: 6,
    duration: "10 weeks",
    difficulty: "Beginner"
  },
  {
    id: "4",
    title: "Growth Marketer",
    description: "Drive user acquisition, retention, and revenue through data-driven strategies.",
    icon: "trending-up",
    skills: ["SEO", "Content Marketing", "Analytics", "Social Media", "Paid Ads"],
    coursesCount: 4,
    projectsCount: 2,
    jobsCount: 10,
    internshipsCount: 7,
    duration: "8 weeks",
    difficulty: "Beginner"
  }
];

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI Chatbot for Customer Support",
    description: "Build a conversational AI bot using LLMs that can handle customer queries.",
    category: "AI",
    difficulty: "Intermediate",
    duration: "2 weeks",
    skills: ["Python", "LLMs", "Prompt Engineering"],
    deliverables: ["Live demo", "GitHub repo", "Documentation"],
    unlocks: { internships: 4, jobs: 6 }
  },
  {
    id: "2",
    title: "Full-Stack Task Manager",
    description: "Create a complete task management app with auth, CRUD, and real-time updates.",
    category: "Development",
    difficulty: "Intermediate",
    duration: "3 weeks",
    skills: ["React", "Node.js", "PostgreSQL"],
    deliverables: ["Live app", "GitHub repo", "API docs"],
    unlocks: { internships: 5, jobs: 8 }
  },
  {
    id: "3",
    title: "Mobile App Redesign",
    description: "Redesign an existing mobile app with improved UX and modern design system.",
    category: "Design",
    difficulty: "Beginner",
    duration: "1 week",
    skills: ["Figma", "UI Design", "Prototyping"],
    deliverables: ["Figma file", "Prototype", "Case study"],
    unlocks: { internships: 3, jobs: 4 }
  },
  {
    id: "4",
    title: "SEO Audit & Strategy",
    description: "Perform a complete SEO audit and create an actionable growth strategy.",
    category: "Growth",
    difficulty: "Beginner",
    duration: "1 week",
    skills: ["SEO", "Analytics", "Content Strategy"],
    deliverables: ["Audit report", "Strategy doc", "Implementation plan"],
    unlocks: { internships: 3, jobs: 5 }
  },
  {
    id: "5",
    title: "AI-Powered Content Generator",
    description: "Build a tool that generates marketing content using AI models.",
    category: "AI",
    difficulty: "Advanced",
    duration: "2 weeks",
    skills: ["Python", "LLMs", "API Integration"],
    deliverables: ["Live tool", "GitHub repo", "Usage docs"],
    unlocks: { internships: 6, jobs: 8 }
  },
  {
    id: "6",
    title: "Portfolio Website",
    description: "Design and build a personal portfolio showcasing your best work.",
    category: "Development",
    difficulty: "Beginner",
    duration: "1 week",
    skills: ["React", "CSS", "Responsive Design"],
    deliverables: ["Live website", "GitHub repo"],
    unlocks: { internships: 4, jobs: 6 }
  }
];
