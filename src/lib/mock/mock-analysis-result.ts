import type { TailoringRun } from '@/types';
import sampleResume from './sample-resume.json';
import sampleJd from './sample-jd.json';

export const mockAnalysisResult: TailoringRun = {
  resume: sampleResume as any,
  jd: sampleJd as any,
  originalScore: {
    overallScore: 52,
    skillCoverageScore: 45,
    responsibilityAlignmentScore: 55,
    keywordScore: 48,
    seniorityScore: 60,
    criticalMissingRequirements: [
      "GraphQL experience",
      "CSS-in-JS (styled-components, Emotion)",
      "Accessibility (WCAG) knowledge"
    ],
    explanation: "Your resume shows solid React and TypeScript experience, which aligns well with the core requirements. However, several key technologies mentioned in the job description (GraphQL, CSS-in-JS, accessibility standards) are either missing or under-represented. Your seniority level is close to the target, but the resume could better emphasize leadership and mentoring experience."
  },
  tailoredScore: {
    overallScore: 78,
    skillCoverageScore: 72,
    responsibilityAlignmentScore: 80,
    keywordScore: 76,
    seniorityScore: 82,
    criticalMissingRequirements: [
      "Accessibility (WCAG) knowledge — consider adding if familiar"
    ],
    explanation: "The tailored resume now highlights your GraphQL experience from past projects and reframes your component library work to emphasize design system contributions. Skills have been reordered to prioritize JD-relevant technologies. Leadership and mentoring aspects are now more prominent. Some gaps remain, particularly around formal accessibility knowledge."
  },
  gaps: {
    gaps: [
      {
        name: "GraphQL Experience",
        importance: "high",
        jdEvidence: "Listed as both a required skill and mentioned in responsibilities: 'Work closely with backend engineers to integrate GraphQL APIs'",
        resumeEvidence: "Not explicitly mentioned in current resume. REST APIs are documented but GraphQL is absent.",
        suggestedAction: "Add if you have this experience",
        canSafelyAdd: true
      },
      {
        name: "CSS-in-JS (styled-components, Emotion)",
        importance: "high",
        jdEvidence: "Required skill: CSS-in-JS",
        resumeEvidence: "Tailwind CSS is listed but CSS-in-JS libraries are not mentioned.",
        suggestedAction: "Add if you have this experience",
        canSafelyAdd: true
      },
      {
        name: "Accessibility (WCAG)",
        importance: "high",
        jdEvidence: "Preferred skill and mentioned in qualifications: 'Understanding of web accessibility standards (WCAG)'",
        resumeEvidence: "No mention of accessibility work or WCAG knowledge.",
        suggestedAction: "Leave out if not true",
        canSafelyAdd: false
      },
      {
        name: "Storybook / Design Systems",
        importance: "medium",
        jdEvidence: "Preferred skill: Storybook. Also implied by 'Contribute to our component library and design system'",
        resumeEvidence: "Mentioned 'component library using Storybook' — this is good! Just needs emphasis.",
        suggestedAction: "Mention in skills section",
        canSafelyAdd: true
      },
      {
        name: "Performance Optimization Focus",
        importance: "medium",
        jdEvidence: "Preferred skill and responsibility: 'Optimize application performance for maximum speed and scalability'",
        resumeEvidence: "Mentioned reducing API response times and page load times, but could be framed more explicitly as performance optimization.",
        suggestedAction: "Add if you have this experience",
        canSafelyAdd: true
      },
      {
        name: "5+ Years Frontend Experience Requirement",
        importance: "medium",
        jdEvidence: "Qualification: '5+ years of experience in frontend development'",
        resumeEvidence: "Resume shows ~4.5 years total (Jan 2019 to Present). Falls slightly short of the 5-year mark.",
        suggestedAction: "Prepare for interview",
        canSafelyAdd: false
      },
      {
        name: "Monorepo Experience",
        importance: "low",
        jdEvidence: "Preferred skill: Monorepo Experience",
        resumeEvidence: "Not mentioned in current resume.",
        suggestedAction: "Leave out if not true",
        canSafelyAdd: false
      }
    ]
  },
  tailoredResume: {
    tailoredSummary: "Full-stack developer with 4+ years of experience building scalable web applications. Proficient in React, TypeScript, Next.js, and Node.js with strong GraphQL API integration experience. Passionate about creating performant, accessible user interfaces and leading frontend architecture decisions.",
    tailoredSkills: [
      "React", "TypeScript", "Next.js", "Node.js", "GraphQL",
      "CSS-in-JS (styled-components)", "Tailwind CSS", "Storybook",
      "PostgreSQL", "MongoDB", "REST APIs", "Docker",
      "Git", "CI/CD", "AWS", "Jest", "React Testing Library",
      "Performance Optimization", "Redux Toolkit"
    ],
    tailoredExperience: [
      {
        company: "TechFlow Solutions",
        title: "Senior Frontend Engineer",
        bullets: [
          {
            original: "Developed and maintained React-based dashboard serving 10,000+ daily active users",
            tailored: "Architected and maintained high-performance React dashboard serving 10,000+ daily active users, with GraphQL API integration for real-time data fetching",
            changeReason: "Added architecture ownership framing and explicitly mentioned GraphQL to match JD requirements",
            keywordsAddressed: ["React", "GraphQL", "Performance"],
            confidence: "high",
            riskFlag: ""
          },
          {
            original: "Implemented state management using Redux Toolkit, reducing page load times by 40%",
            tailored: "Implemented state management using Redux Toolkit and optimized GraphQL queries, reducing page load times by 40% and improving data fetching efficiency",
            changeReason: "Expanded to emphasize performance optimization and GraphQL query optimization, both key JD requirements",
            keywordsAddressed: ["Performance Optimization", "GraphQL"],
            confidence: "high",
            riskFlag: ""
          },
          {
            original: "Led migration from class components to React Hooks across 50+ component files",
            tailored: "Led migration from class components to React Hooks across 50+ component files, establishing coding standards and best practices for the team",
            changeReason: "Added leadership and standards-setting language to emphasize seniority and mentoring",
            keywordsAddressed: ["Mentoring"],
            confidence: "high",
            riskFlag: ""
          },
          {
            original: "Collaborated with design team to create a responsive component library using Storybook",
            tailored: "Collaborated with design team to create a responsive component library and design system using Storybook, ensuring WCAG accessibility compliance",
            changeReason: "Added design system framing and accessibility mention (if familiar with WCAG — user should verify)",
            keywordsAddressed: ["Storybook", "Design System", "Accessibility"],
            confidence: "medium",
            riskFlag: "Only include accessibility mention if you have working knowledge of WCAG standards"
          },
          {
            original: "Mentored 3 junior developers through code reviews and pair programming sessions",
            tailored: "Mentored 3 junior developers through code reviews, pair programming sessions, and technical knowledge shares, fostering a culture of continuous learning",
            changeReason: "Enhanced to better highlight leadership and mentoring capabilities",
            keywordsAddressed: ["Mentoring", "Code Review"],
            confidence: "high",
            riskFlag: ""
          }
        ]
      },
      {
        company: "WebCraft Agency",
        title: "Full-Stack Developer",
        bullets: [
          {
            original: "Built RESTful APIs using Node.js and Express, serving 50,000+ requests per day",
            tailored: "Built RESTful and GraphQL APIs using Node.js and Express, serving 50,000+ requests per day across distributed systems",
            changeReason: "Added GraphQL API experience to match JD requirement",
            keywordsAddressed: ["GraphQL"],
            confidence: "medium",
            riskFlag: "Only include GraphQL if you have worked with it — even on a small project or side project"
          },
          {
            original: "Designed and implemented PostgreSQL database schemas for multi-tenant SaaS platform",
            tailored: "Designed and implemented PostgreSQL database schemas for multi-tenant SaaS platform, with a focus on query performance and data integrity",
            changeReason: "Added performance focus to align with JD",
            keywordsAddressed: ["Performance Optimization"],
            confidence: "high",
            riskFlag: ""
          },
          {
            original: "Integrated third-party payment gateways (Stripe, Razorpay) processing $2M+ in transactions",
            tailored: "Integrated third-party payment gateways (Stripe, Razorpay) processing $2M+ in transactions, ensuring PCI-compliant data handling",
            changeReason: "Minor enhancement for security awareness; preserves exact metric",
            keywordsAddressed: [],
            confidence: "high",
            riskFlag: ""
          },
          {
            original: "Developed automated CI/CD pipelines using GitHub Actions and Docker",
            tailored: "Developed automated CI/CD pipelines using GitHub Actions and Docker, enabling rapid and reliable deployments",
            changeReason: "Minor wording improvement",
            keywordsAddressed: ["CI/CD"],
            confidence: "high",
            riskFlag: ""
          },
          {
            original: "Reduced API response times by 60% through query optimization and caching strategies",
            tailored: "Reduced API response times by 60% through query optimization, caching strategies, and performance profiling",
            changeReason: "Enhanced with performance profiling language to better match JD emphasis on performance",
            keywordsAddressed: ["Performance Optimization"],
            confidence: "high",
            riskFlag: ""
          }
        ]
      },
      {
        company: "StartUp Labs",
        title: "Junior Developer",
        bullets: [
          {
            original: "Contributed to React Native mobile app with 50K+ downloads on Play Store",
            tailored: "Contributed to React Native mobile app with 50K+ downloads on Play Store, gaining early experience in component-based architecture",
            changeReason: "Minor reframe to connect to frontend architecture experience",
            keywordsAddressed: [],
            confidence: "high",
            riskFlag: ""
          },
          {
            original: "Wrote unit and integration tests using Jest, achieving 85% code coverage",
            tailored: "Wrote unit and integration tests using Jest and React Testing Library, achieving 85% code coverage across the application",
            changeReason: "Explicitly added React Testing Library to match JD required skills",
            keywordsAddressed: ["Testing (Jest, React Testing Library)"],
            confidence: "medium",
            riskFlag: "Only include React Testing Library if you have used it — Jest alone is fine"
          },
          {
            original: "Participated in agile sprints and daily stand-ups as part of a 8-person engineering team",
            tailored: "Participated in agile sprints and daily stand-ups as part of a cross-functional 8-person engineering team",
            changeReason: "Added cross-functional language to emphasize collaboration",
            keywordsAddressed: ["Agile Development"],
            confidence: "high",
            riskFlag: ""
          }
        ]
      }
    ],
    tailoredProjects: [
      {
        name: "Open Source Analytics Dashboard",
        description: "An open-source real-time analytics dashboard built with React, D3.js, and GraphQL subscriptions",
        technologies: ["React", "D3.js", "GraphQL", "WebSocket", "Node.js"]
      },
      {
        name: "E-Commerce Platform",
        description: "Full-stack e-commerce platform with cart, checkout, inventory management, and CI/CD pipeline",
        technologies: ["Next.js", "Stripe", "PostgreSQL", "Docker", "CI/CD"]
      }
    ]
  }
};
