import { SkillLesson, BookPart } from './types';
import { PART_1_SKILLS } from './parts1to2';
import { PART_2_SKILLS } from './part2';
import { PART_3_SKILLS } from './part3';
import { PART_4_SKILLS } from './part4';
import { PART_5_SKILLS } from './part5';
import { PART_6_SKILLS } from './part6';
import { PART_7_SKILLS } from './part7';
import { PART_8_SKILLS } from './part8';
import { PART_9_SKILLS } from './part9';
import { PART_10_SKILLS } from './part10';

export * from './types';
export * from './finalSections';
export {
  PART_1_SKILLS,
  PART_2_SKILLS,
  PART_3_SKILLS,
  PART_4_SKILLS,
  PART_5_SKILLS,
  PART_6_SKILLS,
  PART_7_SKILLS,
  PART_8_SKILLS,
  PART_9_SKILLS,
  PART_10_SKILLS,
};

export const ALL_50_SKILLS: SkillLesson[] = [
  ...PART_1_SKILLS,
  ...PART_2_SKILLS,
  ...PART_3_SKILLS,
  ...PART_4_SKILLS,
  ...PART_5_SKILLS,
  ...PART_6_SKILLS,
  ...PART_7_SKILLS,
  ...PART_8_SKILLS,
  ...PART_9_SKILLS,
  ...PART_10_SKILLS,
];

export const SKILLS_BOOK_PARTS: BookPart[] = [
  {
    partNumber: 1,
    title: 'Psychological & Soft Skills',
    emoji: '🧠',
    worldSkillsCount: '~200 – 300 Skills',
    description: 'Internal cognitive operating systems, emotional intelligence, meta-cognition, resilience, and laser focus.',
    skills: PART_1_SKILLS,
  },
  {
    partNumber: 2,
    title: 'Business & Management Skills',
    emoji: '💼',
    worldSkillsCount: '~500 – 800 Skills',
    description: 'Capital allocation, high-stakes negotiation, agile organizational mechanics, enterprise sales, and executive leadership.',
    skills: PART_2_SKILLS,
  },
  {
    partNumber: 3,
    title: 'Technical & IT Skills',
    emoji: '💻',
    worldSkillsCount: '~1,500 – 3,000+ Skills',
    description: 'Full-stack engineering, applied machine learning/LLMs, DevOps infrastructure, zero-trust cybersecurity, and distributed SQL.',
    skills: PART_3_SKILLS,
  },
  {
    partNumber: 4,
    title: 'Creative & Design Skills',
    emoji: '🎨',
    worldSkillsCount: '~300 – 500 Skills',
    description: 'Design systems, cinematic video editing, brand identity typography, 3D spatial modeling, and conversion copywriting.',
    skills: PART_4_SKILLS,
  },
  {
    partNumber: 5,
    title: 'Vocational & Trade Skills',
    emoji: '🔧',
    worldSkillsCount: '~2,000 – 4,000 Skills',
    description: 'High-voltage electrical wiring, precision TIG welding, commercial hydraulic plumbing, EV battery diagnostics, and fine joinery.',
    skills: PART_5_SKILLS,
  },
  {
    partNumber: 6,
    title: 'Medical & Healthcare Skills',
    emoji: '🏥',
    worldSkillsCount: '~1,000+ Skills',
    description: 'Advanced trauma life support (ATLS), clinical venipuncture, metabolic nutritional biochemistry, rehabilitative kinesiology, and hemodynamics.',
    skills: PART_6_SKILLS,
  },
  {
    partNumber: 7,
    title: 'Communication & Language Skills',
    emoji: '🗣️',
    worldSkillsCount: '~500+ Skills',
    description: 'Keynote public oratory, rapid polyglot language acquisition, international conflict mediation, somatic body language, and story architecture.',
    skills: PART_7_SKILLS,
  },
  {
    partNumber: 8,
    title: 'Academic & Research Skills',
    emoji: '📚',
    worldSkillsCount: '~400+ Skills',
    description: 'Statistical causal inference, systematic literature synthesis, syntopical Adlerian reading, experimental design, and institutional grant writing.',
    skills: PART_8_SKILLS,
  },
  {
    partNumber: 9,
    title: 'Physical & Sports Skills',
    emoji: '🏃',
    worldSkillsCount: '~1,000+ Skills',
    description: 'Calisthenic gymnastic leverage, Zone-2 aerobic mitochondria conditioning, Brazilian Jiu-Jitsu, Total Immersion swimming, and alpine mountaineering.',
    skills: PART_9_SKILLS,
  },
  {
    partNumber: 10,
    title: 'Arts & Performing Skills',
    emoji: '🎭',
    worldSkillsCount: '~600+ Skills',
    description: 'Classical & jazz piano improvisation, Stanislavski/Meisner method acting, operatic Bel Canto projection, oil painting chiaroscuro, and Hollywood screenwriting.',
    skills: PART_10_SKILLS,
  },
];

export function getSkillById(id: string): SkillLesson | undefined {
  return ALL_50_SKILLS.find((s) => s.id === id);
}

export function getSkillByNumber(skillNumber: number): SkillLesson | undefined {
  return ALL_50_SKILLS.find((s) => s.skillNumber === skillNumber);
}

export function getSkillsByPart(partNumber: number): SkillLesson[] {
  const part = SKILLS_BOOK_PARTS.find((p) => p.partNumber === partNumber);
  return part ? part.skills : [];
}

export function searchSkills(query: string): SkillLesson[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_50_SKILLS;
  return ALL_50_SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.partTitle.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.whatYouWillLearn.some((topic) => topic.toLowerCase().includes(q)) ||
      s.careerOpportunities.some((c) => c.role.toLowerCase().includes(q))
  );
}
