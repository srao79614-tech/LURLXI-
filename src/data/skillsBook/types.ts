export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
}

export interface CareerOpportunity {
  role: string;
  salaryRange: string;
  description: string;
}

export interface SkillLesson {
  id: string;
  partNumber: number;
  partTitle: string;
  partEmoji: string;
  skillNumber: number; // 1 to 50
  name: string;
  emoji: string;
  tagline: string;
  
  // Point 2: Introduction (5-6 lines)
  introduction: string[];

  // Point 3: Why This Skill Matters (5-6 lines)
  whyItMatters: string[];

  // Point 4: History / Origin (2-3 lines)
  historyOrigin: string[];

  // Point 5: What You Will Learn (10-12 detailed topics)
  whatYouWillLearn: string[];

  // Point 6: How to Learn It - Step by Step (10 clear steps)
  howToLearnSteps: { stepNumber: number; title: string; detail: string }[];

  // Point 7: How to Develop It in Life (8-10 long-term habits & routines)
  howToDevelopInLife: string[];

  // Point 8: Tools / Apps / Resources (8 resources)
  toolsAndResources: { name: string; type: string; description: string }[];

  // Point 9: Time to Learn
  timeToLearn: {
    beginner: string;
    intermediate: string;
    advanced: string;
    dailyCommitment: string;
  };

  // Point 10: Difficulty Level
  difficultyLevel: {
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner to Advanced' | 'Intermediate to Advanced' | 'Advanced to Extreme';
    reason: string;
  };

  // Point 11: Daily Practice Method (6 specific routines)
  dailyPracticeMethods: string[];

  // Point 12: Common Mistakes Beginners Make (5 mistakes + fixes)
  commonMistakes: { mistake: string; fix: string }[];

  // Point 13: How to Measure Progress (5 metrics)
  howToMeasureProgress: string[];

  // Point 14: Career Opportunities (8-10 roles with salaries)
  careerOpportunities: CareerOpportunity[];

  // Point 15: Real-Life Success Example
  realLifeExample: {
    personOrProfile: string;
    story: string;
    keyTakeaway: string;
  };

  // Point 16: Quiz / Test (5 questions with 4 options each)
  quizQuestions: QuizQuestion[];

  // Point 17: Advantages of Learning This Skill (10 strong advantages)
  advantages: { category: string; benefit: string }[];

  // Point 18: Final Takeaway (2-3 lines)
  finalTakeaway: string;
}

export interface BookPart {
  partNumber: number;
  title: string;
  emoji: string;
  worldSkillsCount: string;
  description: string;
  skills: SkillLesson[];
}

export interface SummaryTableRow {
  partNumber: number;
  partName: string;
  approxWorldSkills: string;
  skillsCovered: string;
  difficulty: string;
  timeToLearn: string;
  topCareerOption: string;
}

export interface InDemandSkill {
  rank: number;
  name: string;
  category: string;
  reason: string;
  averageCompensation: string;
}
