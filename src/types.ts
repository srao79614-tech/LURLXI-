export type CategoryType = 'trading' | 'dropshipping' | 'ecommerce' | 'startup' | 'skill-development';

export type AppStage = 'landing' | 'select' | 'application';

export type ActiveWorkspaceTab =
  | 'codex'
  | 'bookmarks'
  | 'skills-book'
  | 'ai-chat'
  | 'share-thoughts'
  | 'performance'
  | 'demo-trading'
  | 'readymade';

export interface CodexChapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  readTime: string;
  content: string[];
  keyFormulas?: { name: string; formula: string; explanation?: string }[];
  checklist: string[];
  operationalSop?: string[];
  caseStudy?: { entity: string; benchmark: string; breakdown: string };
  tacticalDrills?: string[];
  commonFailureModes?: string[];
}

export interface CategoryMasterBlueprint {
  bookOverview: {
    volumeTitle: string;
    estimatedTotalHours: string;
    difficultyLevel: string;
    executiveThesis: string[];
    corePillars: {
      title: string;
      description: string;
      metricBenchmark: string;
    }[];
  };
  categorySolution: {
    problemDiagnosis: string[];
    solutionArchitecture: string[];
    systemStack: {
      layer: string;
      component: string;
      purpose: string;
    }[];
    expectedOutcomes?: string[];
  };
  masterStrategy: {
    strategicDoctrine: string[];
    phases: {
      phaseNumber: string;
      title: string;
      timeframe: string;
      objective: string;
      keyActions: string[];
      kpiTarget: string;
    }[];
    riskAndCapitalRules: string[];
  };
  tacticalPlaybook: {
    tacticalSummary: string;
    tactics: {
      id: string;
      name: string;
      triggerCondition: string;
      exactProtocol: string[];
      targetMetric: string;
      counterMeasure: string;
    }[];
  };
  howToLearn: {
    learningPhilosophy: string[];
    studyRoadmap: {
      stage: string;
      duration: string;
      focus: string;
      dailyRoutine: string;
      milestoneToPass: string;
    }[];
    dailySchedule: {
      timeBlock: string;
      activity: string;
      output: string;
    }[];
    masteryVerificationChecklist: string[];
  };
}

export interface CategoryInfo {
  id: CategoryType;
  title: string;
  subtitle: string;
  description: string;
  shortDesc?: string;
  accentColor: string;
  chapters: CodexChapter[];
  keyPrinciples: string[];
  masterBlueprint?: CategoryMasterBlueprint;
  stats?: {
    chaptersCount?: number;
    totalHours?: string;
    masteryLevel?: string;
    activeStudents?: string;
    rating?: number;
    completionRate?: string;
    [key: string]: any;
  };
}

export interface UserSession {
  email: string;
  verified: boolean;
  isVerified?: boolean;
  verifiedAt: number;
  provider: 'gmail' | 'guest';
  isVip?: boolean;
  name?: string;
  age?: number | string;
  profession?: string;
  hasEnteredWebsite?: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  email: string;
  name: string;
  age: number | string;
  profession?: string;
  selectedCategory: CategoryType;
  avatarUrl: string;
  bio?: string;
  joinDate: number;
  isVip?: boolean;
  role?: string;
  preferredTab?: ActiveWorkspaceTab | 'home' | 'select';
  savedStage?: AppStage;
  hasEnteredWebsite?: boolean;
  lastSavedAt?: number;
}

export interface CourseProgress {
  category: CategoryType;
  title: string;
  completedChapterIds: string[];
  totalChapters: number;
  minutesSpent: number;
  lastStudiedAt: number;
  masteryScore: number;
}

export interface UserPerformance {
  email: string;
  courses: Record<string, CourseProgress>;
  totalMinutes: number;
  overallMastery: number;
  lastActive: number;
  history?: LearningHistoryEvent[] | any[];
  weeklyVelocity?: any[];
  performanceMetrics?: any;
  totalStudyMinutes?: number;
}

export type UserPerformanceProfile = UserPerformance;

export interface LearningHistoryEvent {
  id: string;
  timestamp: number;
  type:
    | 'chapter_completed'
    | 'book_page_read'
    | 'skill_mastered'
    | 'ai_query'
    | 'trade_executed'
    | 'offline_download';
  category: CategoryType;
  title: string;
  description: string;
  pageNumber?: number;
  strategicFormula?: string;
}

export interface InfiniteBookPage {
  pageNumber: number;
  globalPageNumber?: number;
  chapterNumber?: number;
  chapterTitle?: string;
  volumeTitle?: string;
  subtopicTitle: string;
  readTime?: string;
  executiveSummary: string;
  analyticalLens?: string;
  sections: {
    heading: string;
    paragraphs: string[];
    keyPrinciple?: string;
  }[];
  workedModel?: {
    title: string;
    equation: string;
    explanation: string;
  };
  quantitativeFormula?: {
    name: string;
    equation: string;
    application: string;
  };
  tacticalPlaybook?: string[];
  realWorldCaseStudy?: {
    organization?: string;
    metricResult?: string;
    analysis?: string;
  };
  whatYouLearntSummary?: string[];
  onlineReferences?: any[];
  keyTakeaway: string;
  generatedAt?: number;
}

export type UserExperienceTier = 'novice' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierMilestone {
  tier: UserExperienceTier;
  title: string;
  requiredMonths: number;
  requiredDays: number;
  badgeLabel: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  summary: string;
  benchmarkVolume: string;
  perks: string[];
}

export interface DemoCandle {
  time: number;
  timeLabel: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  rsi?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
}

export interface DemoAccount {
  initialBalance: number;
  balance: number;
  equity: number;
  realizedPnl: number;
  winCount: number;
  lossCount: number;
  totalVolumeUsd: number;
}

export interface DemoTradePosition {
  id: string;
  type?: 'long' | 'short' | 'BUY' | 'SELL' | string;
  side?: 'long' | 'short' | 'BUY' | 'SELL' | string;
  symbol?: string;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  amountBtc?: number;
  sizeBtc?: number;
  sizeUsd: number;
  marginUsed?: number;
  leverage: number;
  pnl: number;
  pnlPercent?: number;
  roi?: number;
  liquidationPrice?: number;
  openTime: number;
  strategyTag?: string;
}

export interface DemoClosedTrade {
  id: string;
  type?: 'long' | 'short' | 'BUY' | 'SELL' | string;
  side?: 'long' | 'short' | 'BUY' | 'SELL' | string;
  symbol?: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  amountBtc?: number;
  sizeBtc?: number;
  sizeUsd: number;
  leverage?: number;
  profit: number;
  roi: number;
  openTime: number;
  closeTime: number;
  strategyTag?: string;
  exitReason?: 'Take Profit' | 'Stop Loss' | 'Manual Close' | 'Liquidation' | string;
  reason?: string;
}

export interface TraderRanking {
  rank: number;
  name: string;
  email: string;
  avatarUrl: string;
  country: string;
  countryFlag: string;
  tier: UserExperienceTier;
  profit: number;
  roi: number;
  winRate: number;
  tradesCount: number;
  badgeTitle?: string;
  isCurrentUser?: boolean;
}

export interface VipSecurityAlert {
  id: string;
  timestamp: number;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  threatType: string;
  vector: string;
  details: string;
  clientIp?: string;
  userAgent?: string;
  status: 'BLOCKED' | 'QUARANTINED' | 'RESOLVED' | 'INVESTIGATING';
  acknowledged?: boolean;
}

export interface ChatMessage {
  id: string;
  sender?: 'user' | 'assistant' | 'system' | string;
  role?: string;
  text?: string;
  content?: string;
  timestamp: number;
  category?: CategoryType;
  metadata?: Record<string, any>;
  isError?: boolean;
  modelUsed?: string;
  latencyMs?: number;
  groundingSources?: any[];
  suggestedPrompts?: string[];
}

export interface VipChatMessage {
  id: string;
  sender: 'vip' | 'system' | 'security_system' | 'assistant' | 'athena' | string;
  senderName?: string;
  role?: string;
  text?: string;
  content?: string;
  timestamp: number;
  isPrivate?: boolean;
  securityAlert?: VipSecurityAlert;
  chartData?: any;
}

export interface VipSettings {
  masterPin?: string;
  executiveTitle?: string;
  themePreference?: 'dark' | 'midnight' | 'gold';
  allowBypass?: boolean;
  stealthMode?: boolean;
  encryptedVault?: boolean;
  priorityDispatch?: boolean;
  alertSound?: boolean;
  customAvatar?: string;
  [key: string]: any;
}

export interface ThoughtPost {
  id: string;
  category: CategoryType;
  title: string;
  text: string;
  authorName: string;
  authorEmail: string;
  isVip?: boolean;
  timestamp: number;
  likes?: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  postType?: string;
  metrics?: any;
  comments?: {
    id: string;
    authorName: string;
    authorEmail: string;
    text: string;
    timestamp: number;
    isVip?: boolean;
    author?: string;
  }[];
}

export interface WorldwideActiveUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  location: string;
  flag: string;
  isVip?: boolean;
  lastActive: number;
  online?: boolean;
  clientId?: string;
}

export interface WeeklyDigestInsightItem {
  id: string;
  title: string;
  description?: string;
  category: CategoryType;
  metric?: string;
  impactScore?: number;
  queryText?: string;
  keyInsight?: string;
  strategicFormula?: string;
  actionableDirective?: string;
  metricImpact?: string;
  timestamp?: number;
  voiceMode?: boolean;
}

export interface WeeklyExecutiveDigest {
  id: string;
  weekNumber: number;
  startDate: number;
  endDate: number;
  executiveSummary: string;
  keyInsights: WeeklyDigestInsightItem[];
  recommendedAction: string;
  targetCategory: CategoryType;
  executiveHeadline?: string;
  voiceAdvisorSynthesis?: string;
  progressNarrative?: string;
  nextWeekImperatives?: string[];
}

export interface SoundSettings {
  masterSound?: boolean;
  ambientBgm?: boolean;
  bgmVolume?: number;
  sfxVolume?: number;
  hapticFeedback?: boolean;
  enabled?: boolean;
  ambientSound?: boolean;
  introChime?: boolean;
  voiceAutoSpeak?: boolean;
}

