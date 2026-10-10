import { SkillLesson, QuizQuestion, CareerOpportunity } from './types';

export function createSkill(data: {
  id: string;
  partNumber: number;
  partTitle: string;
  partEmoji: string;
  skillNumber: number;
  name: string;
  emoji: string;
  tagline: string;
  introduction: string[];
  whyItMatters: string[];
  historyOrigin: string[];
  whatYouWillLearn: string[];
  howToLearnSteps: { stepNumber: number; title: string; detail: string }[];
  howToDevelopInLife: string[];
  toolsAndResources: { name: string; type: string; description: string }[];
  timeToLearn: { beginner: string; intermediate: string; advanced: string; dailyCommitment: string };
  difficultyLevel: { level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner to Advanced' | 'Intermediate to Advanced' | 'Advanced to Extreme'; reason: string };
  dailyPracticeMethods: string[];
  commonMistakes: { mistake: string; fix: string }[];
  howToMeasureProgress: string[];
  careerOpportunities: CareerOpportunity[];
  realLifeExample: { personOrProfile: string; story: string; keyTakeaway: string };
  quizQuestions: QuizQuestion[];
  advantages: { category: string; benefit: string }[];
  finalTakeaway: string;
}): SkillLesson {
  return data;
}
