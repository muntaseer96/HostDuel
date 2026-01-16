import type { CompanyTableRow } from './index';

// Quiz Answer Types
export type BuildingType = 'blog' | 'ecommerce' | 'portfolio' | 'saas' | 'agency';
export type TechnicalLevel = 'beginner' | 'developer' | 'agency';
export type TrafficLevel = 'starting' | '10k' | '100k' | '1m';
export type BudgetRange = '0-10' | '10-30' | '30-100' | '100+';
export type CMSPreference = 'wordpress' | 'custom' | 'drupal' | 'static';
export type Priority = 'price' | 'performance' | 'support' | 'features';

export type MustHaveFeature =
  | 'free-domain'
  | 'free-ssl'
  | 'ssh-access'
  | 'staging'
  | 'managed-updates'
  | 'cdn'
  | 'email'
  | 'backups';

// Complete quiz answers
export interface QuizAnswers {
  buildingType: BuildingType | null;
  technicalLevel: TechnicalLevel | null;
  expectedTraffic: TrafficLevel | null;
  budget: BudgetRange | null;
  mustHaveFeatures: MustHaveFeature[];
  cmsPreference: CMSPreference | null;
  priority: Priority | null;
}

// Quiz question configuration
export interface QuizOption<T> {
  value: T;
  label: string;
  description: string;
  icon?: string;
}

export interface QuizQuestion<T> {
  id: string;
  question: string;
  subtitle?: string;
  multiSelect: boolean;
  options: QuizOption<T>[];
}

// Host scoring result
export interface HostScore {
  host: CompanyTableRow;
  score: number;          // 0-100 percentage
  matchReasons: string[]; // Why this host matched
  breakdown: {
    suitability: number;  // 0-40
    budget: number;       // 0-25
    features: number;     // 0-20
    priority: number;     // 0-15
  };
}

// Quiz state for the page component
export interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  isComplete: boolean;
}

// URL params for shareable results
export interface QuizResultsParams {
  build?: string;
  level?: string;
  traffic?: string;
  budget?: string;
  features?: string;
  cms?: string;
  priority?: string;
}

// Default empty answers
export const defaultQuizAnswers: QuizAnswers = {
  buildingType: null,
  technicalLevel: null,
  expectedTraffic: null,
  budget: null,
  mustHaveFeatures: [],
  cmsPreference: null,
  priority: null,
};
