export interface Profile {
  name: string;
  wordmark: string;
  role: {
    bold: string;
    light: string;
  };
  email: string;
  phone: string;
  location: string;
  education: string;
  university: string;
  summary: string;
  resumeUrl: string;
  url: string;
  whatsapp: string;
  socials: {
    github: string;
    linkedin: string;
    portfolio: string;
  };
}

export const profile: Profile = {
  name: 'Aditya Prakash Purohit',
  wordmark: 'ADITYA',
  role: {
    bold: 'Software',
    light: 'Developer | Frontend / React | AI/ML',
  },
  email: 'adityaprakashpurohit@gmail.com',
  phone: '+91 7683894404',
  location: 'Gunupur, Odisha, India',
  education: 'B.Tech in Computer Science Engineering (2023 – 2027)',
  university: 'GIET University, Gunupur',
  summary:
    'Final-year B.Tech Computer Science Engineering student at GIET University with hands-on experience in frontend development, software engineering, AI/ML, and data analytics. Skilled in React.js, JavaScript, TypeScript, Tailwind CSS, Python, MySQL, Git, and REST APIs, building structured, responsive web applications and contributing to technical communities.',
  resumeUrl: '/assets/aistudio/Updated_65aff891.pdf',
  url: 'https://github.com/adityaprakashpurohit',
  whatsapp: '917683894404',
  socials: {
    github: 'https://github.com/adityaprakashpurohit',
    linkedin: 'https://www.linkedin.com/in/adityaprakashpurohit',
    portfolio: '#home',
  },
};

export const introWords = [
  { text: 'Hey,' },
  { text: "I'm" },
  { text: 'Aditya.', className: 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400' },
  { text: 'A' },
  { text: 'passionate' },
  { text: 'Software', className: 'text-white font-medium' },
  { text: 'Developer', className: 'text-white font-medium' },
  { text: 'specializing' },
  { text: 'in' },
  { text: 'Frontend', className: 'text-white font-medium' },
  { text: 'engineering,' },
  { text: 'React.js,', className: 'text-white font-medium' },
  { text: 'and' },
  { text: 'AI/ML.', className: 'text-white font-medium' },
  { text: 'Currently' },
  { text: 'pursuing' },
  { text: 'B.Tech' },
  { text: 'in' },
  { text: 'Computer' },
  { text: 'Science' },
  { text: 'at' },
  { text: 'GIET University,', className: 'text-white font-medium' },
  { text: 'I' },
  { text: 'build' },
  { text: 'scalable' },
  { text: 'web' },
  { text: 'platforms' },
  { text: 'like' },
  { text: 'MotoRent', className: 'text-white font-medium' },
  { text: 'and' },
  { text: 'Student ERP,', className: 'text-white font-medium' },
  { text: 'combine' },
  { text: 'responsive' },
  { text: 'modern' },
  { text: 'design' },
  { text: 'with' },
  { text: 'Framer Motion', className: 'text-white font-medium' },
  { text: 'and' },
  { text: 'React Three Fiber,', className: 'text-white font-medium' },
  { text: 'and' },
  { text: 'have' },
  { text: 'mentored' },
  { text: 'over', className: 'text-white font-medium' },
  { text: '100+ peers', className: 'text-white font-semibold' },
  { text: 'in' },
  { text: 'web' },
  { text: 'development' },
  { text: 'and' },
  { text: 'Python.' },
];

export const stackCategories = [
  {
    label: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Python', 'HTML5', 'CSS3', 'SQL'],
    copies: 3,
    duration: 44,
    reverse: false,
  },
  {
    label: 'Frontend',
    items: [
      'React.js',
      'React Router',
      'Tailwind CSS',
      'Context API',
      'Responsive Web Development',
      'Framer Motion',
      'React Three Fiber',
      'Recharts',
    ],
    copies: 2,
    duration: 52,
    reverse: true,
  },
  {
    label: 'Backend & Data',
    items: ['REST APIs', 'MySQL', 'Node.js', 'Python Scripting', 'Scikit-Learn', 'Data Analytics'],
    copies: 3,
    duration: 46,
    reverse: false,
  },
  {
    label: 'Developer Tools',
    items: ['Git', 'GitHub', 'Vite', 'npm', 'Browser DevTools', 'Postman', 'VS Code', 'Tkinter'],
    copies: 3,
    duration: 50,
    reverse: true,
  },
];

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  location: string;
  highlights: string[];
}

export const experiences: ExperienceItem[] = [
  {
    role: 'Presentation Specialist / Graphic Designer',
    organization: 'Code Quest Club, GIET University',
    period: 'Jun 2025 – Present',
    location: 'Gunupur, Odisha',
    highlights: [
      'Designed promotional campaigns and social media graphics that contributed to a reported 30% increase in club engagement and reached 500+ students per campaign.',
      'Developed Python automation scripts that reduced content-workflow preparation time by approximately 30%.',
    ],
  },
  {
    role: 'Technician / Frontend Contributor',
    organization: "Tech'HUB Club, GIET University",
    period: 'Jul 2025 – Jan 2026',
    location: 'Gunupur, Odisha',
    highlights: [
      'Contributed to frontend development for club projects and supported workshops and coding events focused on practical software development.',
      'Mentored 100+ peers in web development and Python through technical sessions, coding activities, and peer learning.',
    ],
  },
];

export interface Service {
  id: string;
  title: string;
  description: string;
  capabilities: string[];
  buttonText?: string;
}

export const services: Service[] = [
  {
    id: '01',
    title: 'FRONTEND & REACT WEB DEVELOPMENT',
    description:
      'I engineer responsive, accessible, high-performance web applications using React.js, TypeScript, and modern styling architectures. From clean state machines with Context API to interactive 3D elements with React Three Fiber.',
    capabilities: [
      'React.js, React Router & SPA architecture',
      'Tailwind CSS & responsive layout systems',
      'State management with React Context API',
      'Fluid motion & gestures with Framer Motion',
      'Component-driven modular design & Vite bundling',
    ],
    buttonText: 'VIEW PROJECTS',
  },
  {
    id: '02',
    title: 'INTERACTIVE DATA & 3D VISUALIZATION',
    description:
      'Bringing complex data and dashboards to life with interactive charts, real-time analytics widgets, and immersive 3D graphics.',
    capabilities: [
      'Recharts data visualization & metrics dashboards',
      'React Three Fiber (Three.js) 3D web experiences',
      'Multi-step booking and transaction analytics',
      'Performance profiling with Browser DevTools',
    ],
  },
  {
    id: '03',
    title: 'AI / ML & DATA ANALYTICS',
    description:
      'Applying predictive modeling, machine learning workflows, and data processing techniques in Python to transform raw datasets into actionable insights.',
    capabilities: [
      'Python data preprocessing & feature engineering',
      'Scikit-Learn classification, regression & clustering',
      'Data analysis, metrics calculation & evaluation',
      'Analytical pipelines & dataset cleaning',
    ],
  },
  {
    id: '04',
    title: 'BACKEND INTEGRATION & REST APIS',
    description:
      'Connecting client-side applications with structured backends, relational databases, and RESTful web services with robust data flow and authentication.',
    capabilities: [
      'REST API design, consumption & error handling',
      'Relational database modeling with MySQL',
      'Role-based access control & protected navigation',
      'Postman API testing & mock server integration',
    ],
  },
  {
    id: '05',
    title: 'PYTHON AUTOMATION & TOOLS',
    description:
      'Building scripts and automated pipelines that eliminate repetitive friction — from content preparation to automated testing and GUI utilities.',
    capabilities: [
      'Workflow automation scripts in Python',
      'Desktop utilities using Tkinter',
      'Content-workflow acceleration (30%+ time saved)',
      'Automated batch data processing',
    ],
  },
  {
    id: '06',
    title: 'TECHNICAL COMMUNITY & MENTORSHIP',
    description:
      'Active contributor to collegiate engineering clubs, speaker at hands-on coding workshops, and mentor empowering peers to master modern development.',
    capabilities: [
      'Mentored 100+ peers in Web Development & Python',
      'Hands-on workshop facilitator for Tech’HUB Club',
      'High-impact promotional campaign design (500+ reach)',
      'Technical documentation and collaborative code reviews',
    ],
  },
];

export interface Project {
  name: string;
  prefix: string;
  highlight: string;
  subtitle: string;
  description: string;
  techStack: string[];
  image: string;
  live?: string;
  liveLabel: string;
  repo: string;
  keyPoints: string[];
}

export const projects: Project[] = [
  {
    name: 'MotoRent',
    prefix: 'MOTO',
    highlight: 'rent',
    subtitle: 'BIKE RENTAL & BOOKING PLATFORM',
    description:
      'A comprehensive bike rental and booking web platform featuring public bike browsing, detailed specification views, customer authentication, multi-step booking flows with React Context API, booking summaries, and secure payment simulation. Includes separate protected layouts for customers and an admin management dashboard with Recharts analytics.',
    techStack: [
      'React.js',
      'React Router',
      'Context API',
      'Tailwind CSS',
      'Framer Motion',
      'Recharts',
      'React Three Fiber',
    ],
    image: '/assets/ecommerce-DVISmkX7.jpg',
    live: '#',
    liveLabel: 'Explore Demo',
    repo: 'https://github.com/adityaprakashpurohit',
    keyPoints: [
      'Public bike browsing with dynamic details and customer auth flow',
      'Protected customer and admin routes with dedicated management layouts',
      'Multi-step booking state management with React Context API',
    ],
  },
  {
    name: 'Student ERP',
    prefix: 'STUDENT',
    highlight: 'erp',
    subtitle: 'ACADEMIC MANAGEMENT SYSTEM',
    description:
      'A role-oriented academic management interface for common student, faculty, and institutional workflows. Built with reusable React components, structured routing, responsive UI, and REST API consumption for academic schedules, attendance, grade logs, and user profile management.',
    techStack: ['React.js', 'JavaScript', 'Tailwind CSS', 'REST APIs', 'MySQL'],
    image: '/assets/expense-sbI4i9tg.jpg',
    live: '#',
    liveLabel: 'View System',
    repo: 'https://github.com/adityaprakashpurohit',
    keyPoints: [
      'Role-oriented academic management interface for institutional workflows',
      'Structured application navigation and clean frontend data flows',
      'Reusable modular component library designed for low-latency interactions',
    ],
  },
  {
    name: 'AI / ML & Data Analytics',
    prefix: 'AI / ML',
    highlight: 'models',
    subtitle: 'PREDICTIVE ANALYTICS SUITE',
    description:
      'A collection of machine learning models and exploratory data analysis solutions developed in Python using Scikit-Learn. Implements data preprocessing pipelines, feature engineering, classification and regression models, and evaluation matrices to transform raw structured data into actionable predictive insights.',
    techStack: ['Python', 'Scikit-Learn', 'Data Analytics', 'Pandas', 'NumPy'],
    image: '/assets/mindpixel-Bx0qpjdU.jpg',
    live: '#',
    liveLabel: 'View Analysis',
    repo: 'https://github.com/adityaprakashpurohit',
    keyPoints: [
      'Data preprocessing, normalization, and feature selection pipelines',
      'Machine learning model training and hyperparameter evaluation',
      'Dataset transformation into actionable charts and predictive metrics',
    ],
  },
];

export interface ComponentProduct {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  tech: string;
  metrics: string;
  deps: string;
}

export const componentProducts: ComponentProduct[] = [
  {
    slug: 'motorent-core',
    name: 'Booking Flow Engine',
    tagline: 'Multi-step state management with Context API',
    category: 'state & booking',
    tech: 'React Context',
    metrics: 'Zero external state deps',
    deps: 'Context API',
  },
  {
    slug: 'analytics-charts',
    name: 'Interactive Analytics',
    tagline: 'Visual metric charts with Recharts & Tailwind',
    category: 'data visualization',
    tech: 'Recharts + React',
    metrics: 'Dynamic data feeds',
    deps: 'Recharts',
  },
  {
    slug: 'motion-ui',
    name: 'Fluid Motion System',
    tagline: 'Smooth page transitions & staggered micro-interactions',
    category: 'animation',
    tech: 'Framer Motion',
    metrics: '60 FPS animations',
    deps: 'Framer Motion',
  },
  {
    slug: 'python-automation',
    name: 'Workflow Optimizer',
    tagline: 'Script for batch content preparation & asset ingestion',
    category: 'automation',
    tech: 'Python Scripting',
    metrics: '30% time reduction',
    deps: 'Python 3',
  },
  {
    slug: 'erp-components',
    name: 'Role-Based Layouts',
    tagline: 'Protected route shell with student/admin navigation',
    category: 'architecture',
    tech: 'React Router v6',
    metrics: 'Modular structure',
    deps: 'React Router',
  },
  {
    slug: 'ml-evaluator',
    name: 'Model Evaluator',
    tagline: 'Preprocessing pipeline & model scoring tool',
    category: 'AI / ML',
    tech: 'Scikit-Learn',
    metrics: 'Train/test benchmarking',
    deps: 'Scikit-Learn',
  },
];
