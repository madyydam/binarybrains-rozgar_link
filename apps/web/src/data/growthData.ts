// Centralized Growth Hub Data for RozgarLink
// Integrated from Futora Career OS

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  acceptance: string;
  solved: boolean;
  desc: string;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  sampleCases: {
    input: string;
    expected: string;
  }[];
}

export const GROWTH_PROBLEMS: DSAProblem[] = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hash Maps",
    acceptance: "49.2%",
    solved: true,
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    starterCode: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    lookup = {}\n    for i, num in enumerate(nums):\n        if target - num in lookup:\n            return [lookup[target - num], i]\n        lookup[num] = i\n    return []`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> m;\n        for (int i = 0; i < nums.size(); i++) {\n            if (m.count(target - nums[i])) return {m[target - nums[i]], i};\n            m[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (map.containsKey(target - nums[i])) return new int[]{map.get(target - nums[i]), i};\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`
    },
    sampleCases: [
      { input: "nums = [2, 7, 11, 15], target = 9", expected: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", expected: "[1, 2]" },
      { input: "nums = [3, 3], target = 6", expected: "[0, 1]" }
    ]
  },
  {
    id: "2",
    title: "Reverse a String in Place",
    difficulty: "Easy",
    category: "Two Pointers",
    acceptance: "75.4%",
    solved: false,
    desc: "Write a function that reverses an array of characters in-place without allocating extra memory for another array.",
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    starterCode: {
      javascript: `/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n  let left = 0, right = s.length - 1;\n  while (left < right) {\n    const tmp = s[left];\n    s[left] = s[right];\n    s[right] = tmp;\n    left++;\n    right--;\n  }\n}`,
      python: `def reverse_string(s: list[str]) -> None:\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1`,
      cpp: `class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        reverse(s.begin(), s.end());\n    }\n};`,
      java: `class Solution {\n    public void reverseString(char[] s) {\n        int i = 0, j = s.length - 1;\n        while (i < j) {\n            char c = s[i]; s[i] = s[j]; s[j] = c; i++; j--;\n        }\n    }\n}`
    },
    sampleCases: [
      { input: 's = ["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    id: "3",
    title: "Valid Anagram",
    difficulty: "Easy",
    category: "Strings & Hash Maps",
    acceptance: "62.8%",
    solved: false,
    desc: "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram contains the exact same characters rearranged.",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    starterCode: {
      javascript: `function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}`,
      python: `def is_anagram(s: str, t: str) -> bool:\n    from collections import Counter\n    return Counter(s) == Counter(t)`,
      cpp: `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.size() != t.size()) return false;\n        vector<int> c(26, 0);\n        for (char x : s) c[x - 'a']++;\n        for (char x : t) if (--c[x - 'a'] < 0) return false;\n        return true;\n    }\n};`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (char c : s.toCharArray()) count[c - 'a']++;\n        for (char c : t.toCharArray()) if (--count[c - 'a'] < 0) return false;\n        return true;\n    }\n}`
    },
    sampleCases: [
      { input: 's = "anagram", t = "nagaram"', expected: "true" },
      { input: 's = "rat", t = "car"', expected: "false" }
    ]
  },
  {
    id: "4",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Sliding Window",
    acceptance: "54.2%",
    solved: true,
    desc: "You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    starterCode: {
      javascript: `function maxProfit(prices) {\n  let minP = Infinity, maxProf = 0;\n  for (const p of prices) {\n    if (p < minP) minP = p;\n    else if (p - minP > maxProf) maxProf = p - minP;\n  }\n  return maxProf;\n}`,
      python: `def max_profit(prices: list[int]) -> int:\n    min_p, max_p = float('inf'), 0\n    for p in prices:\n        min_p = min(min_p, p)\n        max_p = max(max_p, p - min_p)\n    return max_p`,
      cpp: `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int minP = 1e9, maxP = 0;\n        for (int p : prices) {\n            minP = min(minP, p);\n            maxP = max(maxP, p - minP);\n        }\n        return maxP;\n    }\n};`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        int minP = Integer.MAX_VALUE, maxP = 0;\n        for (int p : prices) {\n            minP = Math.min(minP, p);\n            maxP = Math.max(maxP, p - minP);\n        }\n        return maxP;\n    }\n}`
    },
    sampleCases: [
      { input: "prices = [7, 1, 5, 3, 6, 4]", expected: "5 (Buy day 2 @1, sell day 5 @6)" },
      { input: "prices = [7, 6, 4, 3, 1]", expected: "0 (No profit possible)" }
    ]
  },
  {
    id: "5",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    acceptance: "33.8%",
    solved: false,
    desc: "Given a string s, find the length of the longest substring without repeating characters.",
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  let set = new Set(), l = 0, res = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (set.has(s[r])) {\n      set.delete(s[l]);\n      l++;\n    }\n    set.add(s[r]);\n    res = Math.max(res, r - l + 1);\n  }\n  return res;\n}`,
      python: `def length_of_longest_substring(s: str) -> int:\n    seen = set()\n    l = res = 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        res = max(res, r - l + 1)\n    return res`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_set<char> st;\n        int l = 0, res = 0;\n        for (int r = 0; r < s.size(); r++) {\n            while (st.count(s[r])) st.erase(s[l++]);\n            st.insert(s[r]);\n            res = max(res, r - l + 1);\n        }\n        return res;\n    }\n};`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Set<Character> set = new HashSet<>();\n        int l = 0, res = 0;\n        for (int r = 0; r < s.length(); r++) {\n            while (set.contains(s.charAt(r))) set.remove(s.charAt(l++));\n            set.add(s.charAt(r));\n            res = Math.max(res, r - l + 1);\n        }\n        return res;\n    }\n}`
    },
    sampleCases: [
      { input: 's = "abcabcbb"', expected: "3 (Substring 'abc')" },
      { input: 's = "bbbbb"', expected: "1 (Substring 'b')" },
      { input: 's = "pwwkew"', expected: "3 (Substring 'wke')" }
    ]
  }
];

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: string;
  sessions: number;
  topics: string[];
  initials: string;
  badge: string;
  desc: string;
  experience: string;
  availableSlots: string[];
}

export const GROWTH_MENTORS: Mentor[] = [
  {
    id: "1",
    name: "Madhur Dhadve",
    role: "Founder & Lead Architect",
    company: "Futora Tech / Career OS",
    rating: "4.9",
    sessions: 142,
    topics: ["Full-Stack Architecture", "React & Node", "System Design", "Startup Strategy"],
    initials: "MD",
    badge: "Top Mentor",
    desc: "Helping developers bridge the gap from beginner tutorials to production-ready software engineering and direct hiring.",
    experience: "5+ Years",
    availableSlots: ["10:00 AM", "2:00 PM", "4:30 PM", "7:00 PM"]
  },
  {
    id: "2",
    name: "Rohit Sharma",
    role: "Staff Backend Engineer",
    company: "Razorpay",
    rating: "4.8",
    sessions: 98,
    topics: ["Distributed Systems", "Payment Pipelines", "Go & Java", "Database Scaling"],
    initials: "RS",
    badge: "Fintech Leader",
    desc: "Deep-dive system design reviews, concurrency, transaction safety, and mock interviews for fintech engineering roles.",
    experience: "8 Years",
    availableSlots: ["11:00 AM", "3:00 PM", "6:00 PM"]
  },
  {
    id: "3",
    name: "Anjali Gupta",
    role: "Principal Product Manager",
    company: "Zepto (Pune Hub)",
    rating: "4.9",
    sessions: 76,
    topics: ["Product Sense", "Quick Commerce Metrics", "PRD Writing", "Execution"],
    initials: "AG",
    badge: "Product Star",
    desc: "Guidance on cracking PM interviews, transitioning from engineering/analyst to PM, and scaling user-facing consumer products.",
    experience: "6 Years",
    availableSlots: ["12:00 PM", "3:30 PM", "5:00 PM"]
  },
  {
    id: "4",
    name: "Kunal Shah",
    role: "Lead UI/UX Designer",
    company: "CRED",
    rating: "4.7",
    sessions: 110,
    topics: ["Design Systems", "Figma Advanced", "Micro-Interactions", "Portfolio Critique"],
    initials: "KS",
    badge: "Design Guru",
    desc: "Portfolio reviews that convert. Master design tokens, clean typography, responsive web layouts, and interactive prototypes.",
    experience: "7 Years",
    availableSlots: ["10:30 AM", "1:30 PM", "4:00 PM", "8:00 PM"]
  }
];

export interface Competition {
  id: string;
  title: string;
  organizer: string;
  category: 'Hackathon' | 'Coding Contest' | 'Case Study';
  prize: string;
  mode: 'Online' | 'Hybrid' | 'On-Site';
  deadline: string;
  dateStr: string;
  participants: string;
  tags: string[];
  desc: string;
  perks: string;
}

export const GROWTH_COMPETITIONS: Competition[] = [
  {
    id: "comp-1",
    title: "Smart India Hackathon (SIH 2026)",
    organizer: "Ministry of Education & AICTE",
    category: "Hackathon",
    prize: "₹1,00,000 per Problem Statement",
    mode: "Hybrid",
    deadline: "15 Aug 2026",
    dateStr: "Aug 25 - 28, 2026",
    participants: "1,50,000+ registered",
    tags: ["Nationwide", "Govt of India", "GovTech & AI"],
    desc: "World's biggest open innovation model. Teams solve hardware and software challenges directly submitted by union ministries and industry giants.",
    perks: "Cash Awards + Direct Incubation Support"
  },
  {
    id: "comp-2",
    title: "TCS CodeVita Season 12",
    organizer: "Tata Consultancy Services",
    category: "Coding Contest",
    prize: "$20,000 Global Pool + Direct PPOs",
    mode: "Online",
    deadline: "30 Sep 2026",
    dateStr: "Oct 10, 2026",
    participants: "3,00,000+ coders",
    tags: ["Guinness Record", "DSA / Algorithms", "Pre-Placement Offer"],
    desc: "Premier global competitive programming challenge. Test algorithmic precision and speed across 6 demanding problem sets.",
    perks: "Top 500 receive direct interview calls for Digital / Prime developer roles"
  },
  {
    id: "comp-3",
    title: "Unstop Ignite Tech Challenge",
    organizer: "Unstop & Top Startup Consortium",
    category: "Case Study",
    prize: "₹5,00,000 Total Prizes",
    mode: "Online",
    deadline: "20 Aug 2026",
    dateStr: "Sep 01 - 15, 2026",
    participants: "45,000+ applicants",
    tags: ["Open for all grads", "Tech Case Study", "PPO Fast-Track"],
    desc: "Solve real-world business architecture problems set by unicorn startups in Pune & Bangalore. Build working prototypes in 2 weeks.",
    perks: "Pre-placement interviews + Cash + Verified Credentials"
  },
  {
    id: "comp-4",
    title: "Pune Regional AI & Web3 Sprint",
    organizer: "Pune Builders & Hackers Guild",
    category: "Hackathon",
    prize: "₹2,50,000 + Cloud Grants",
    mode: "On-Site",
    deadline: "05 Sep 2026",
    dateStr: "Sep 12 - 13, 2026",
    participants: "1,200 builders",
    tags: ["Regional Pune", "In-Person 36h", "Cloud Credits"],
    desc: "36-hour intense in-person hackathon bringing together the best student engineers, UI designers, and founders across Pune institutes.",
    perks: "Angel investment opportunities + ₹50,000 AWS/GCP credits"
  }
];

export interface InterviewQuestion {
  id: number;
  category: 'tech' | 'hr' | 'system_design';
  role: string;
  company: string;
  question: string;
  idealAnswerTips: string[];
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    category: 'tech',
    role: 'Frontend / Full-Stack Engineer',
    company: 'Razorpay & Zepto',
    question: "Can you explain how React's Virtual DOM reconciliation and fiber diffing algorithm works, and how would you optimize an infinite-scrolling list in React?",
    idealAnswerTips: [
      "Mention Fiber tree structure and two-phase render (Reconciliation + Commit)",
      "Explain keys and how stable keys avoid unneeded unmount/remount",
      "Mention Virtualization (react-window or IntersectionObserver) to only render DOM nodes in the viewport",
      "Highlight memoization via useCallback and useMemo without premature over-optimization"
    ]
  },
  {
    id: 2,
    category: 'tech',
    role: 'Backend / Software Engineer',
    company: 'CRED & TCS Prime',
    question: "How do you handle database concurrency and avoid race conditions when two users try to book the same limited seat or voucher simultaneously?",
    idealAnswerTips: [
      "Pessimistic Locking (SELECT ... FOR UPDATE) vs Optimistic Locking with version column",
      "Atomic conditional update: UPDATE seats SET booked=1 WHERE id=? AND booked=0",
      "Redis distributed locks (Redlock algorithm) for microservice architectures",
      "Idempotency keys to avoid duplicate transaction executions"
    ]
  },
  {
    id: 3,
    category: 'hr',
    role: 'General Engineering Candidate',
    company: 'All Top Companies',
    question: "Tell me about a time you faced a critical bug or technical disagreement in a project under a tight deadline. How did you resolve it?",
    idealAnswerTips: [
      "Use the STAR framework: Situation, Task, Action, Result",
      "Emphasize collaboration and objective data-driven decision making",
      "Highlight clear communication with stakeholders instead of silent panic",
      "Conclude with key learnings and long-term preventive measures added"
    ]
  },
  {
    id: 4,
    category: 'system_design',
    role: 'Systems / Scalable Web',
    company: 'Google & Startups',
    question: "Design a URL shortener like bit.ly that handles 100 Million daily active requests with low latency and 99.99% availability.",
    idealAnswerTips: [
      "Base62 encoding (a-z, A-Z, 0-9) yielding 62^7 combinations (~3.5 Trillion URLs)",
      "Distributed ID generator (Snowflake) or counter with pre-allocated database ranges",
      "Redis caching layer for hot URLs (LRU cache with 80/20 rule)",
      "Read-heavy architecture: Replicated PostgreSQL / NoSQL with CDN edge redirects"
    ]
  }
];
