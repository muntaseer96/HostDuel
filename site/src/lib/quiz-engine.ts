import type { CompanyTableRow } from '@/types';
import type {
  QuizAnswers,
  HostScore,
  BuildingType,
  TechnicalLevel,
  TrafficLevel,
  BudgetRange,
  CMSPreference,
  Priority,
  MustHaveFeature,
  QuizQuestion,
  QuizResultsParams,
} from '@/types/quiz';

// Quiz questions configuration
export const QUIZ_QUESTIONS: QuizQuestion<unknown>[] = [
  {
    id: 'buildingType',
    question: 'What are you building?',
    subtitle: 'Select the primary purpose of your website',
    multiSelect: false,
    options: [
      { value: 'blog', label: 'Blog or Content Site', description: 'Personal blog, news site, or content-focused website' },
      { value: 'ecommerce', label: 'Online Store', description: 'Sell products or services with shopping cart' },
      { value: 'portfolio', label: 'Portfolio or Landing Page', description: 'Showcase work, simple business site, or landing page' },
      { value: 'saas', label: 'Web Application / SaaS', description: 'Custom web app, SaaS product, or API backend' },
      { value: 'agency', label: 'Multiple Client Sites', description: 'Agency managing websites for multiple clients' },
    ],
  },
  {
    id: 'technicalLevel',
    question: "What's your technical level?",
    subtitle: 'This helps us find the right balance of control vs simplicity',
    multiSelect: false,
    options: [
      { value: 'beginner', label: 'Beginner', description: "I'm new to web hosting and want things simple" },
      { value: 'developer', label: 'Developer', description: 'Comfortable with code, SSH, and server configuration' },
      { value: 'agency', label: 'Agency / Team', description: 'Managing multiple sites with team collaboration' },
    ],
  },
  {
    id: 'expectedTraffic',
    question: 'How much traffic do you expect?',
    subtitle: 'Monthly visitors to your website',
    multiSelect: false,
    options: [
      { value: 'starting', label: 'Just Starting', description: 'New site, building audience (under 1,000/month)' },
      { value: '10k', label: 'Up to 10,000/month', description: 'Growing site with steady traffic' },
      { value: '100k', label: 'Up to 100,000/month', description: 'Established site with significant traffic' },
      { value: '1m', label: '100,000+ / month', description: 'High-traffic site requiring robust infrastructure' },
    ],
  },
  {
    id: 'budget',
    question: "What's your monthly budget?",
    subtitle: 'We\'ll find the best value within your range',
    multiSelect: false,
    options: [
      { value: '0-10', label: '$0 - $10/month', description: 'Budget-friendly shared hosting' },
      { value: '10-30', label: '$10 - $30/month', description: 'Better performance and features' },
      { value: '30-100', label: '$30 - $100/month', description: 'Managed hosting or VPS' },
      { value: '100+', label: '$100+/month', description: 'Enterprise or high-performance hosting' },
    ],
  },
  {
    id: 'mustHaveFeatures',
    question: 'Which features are must-haves?',
    subtitle: 'Select all that apply',
    multiSelect: true,
    options: [
      { value: 'free-domain', label: 'Free Domain', description: 'Domain name included with hosting' },
      { value: 'free-ssl', label: 'Free SSL', description: 'HTTPS security certificate included' },
      { value: 'ssh-access', label: 'SSH Access', description: 'Command line access to server' },
      { value: 'staging', label: 'Staging Environment', description: 'Test changes before going live' },
      { value: 'managed-updates', label: 'Managed Updates', description: 'Automatic WordPress/CMS updates' },
      { value: 'cdn', label: 'CDN Included', description: 'Content delivery network for speed' },
      { value: 'email', label: 'Email Hosting', description: 'Business email with your domain' },
      { value: 'backups', label: 'Daily Backups', description: 'Automatic daily backup protection' },
    ],
  },
  {
    id: 'cmsPreference',
    question: 'What CMS or platform will you use?',
    subtitle: 'This helps us find optimized hosting',
    multiSelect: false,
    options: [
      { value: 'wordpress', label: 'WordPress', description: 'The most popular CMS for blogs and websites' },
      { value: 'custom', label: 'Custom / No CMS', description: 'Node.js, Python, Ruby, or custom code' },
      { value: 'drupal', label: 'Drupal or Joomla', description: 'Enterprise CMS platforms' },
      { value: 'static', label: 'Static Site', description: 'Jekyll, Hugo, Next.js static export, etc.' },
    ],
  },
  {
    id: 'priority',
    question: "What's most important to you?",
    subtitle: 'We\'ll weight our recommendations accordingly',
    multiSelect: false,
    options: [
      { value: 'price', label: 'Best Price', description: 'Maximum value for money' },
      { value: 'performance', label: 'Speed & Performance', description: 'Fastest loading times and uptime' },
      { value: 'support', label: 'Great Support', description: '24/7 responsive customer service' },
      { value: 'features', label: 'Most Features', description: 'Maximum functionality and tools' },
    ],
  },
];

// Get budget range in dollars
function getBudgetMax(budget: BudgetRange): number {
  switch (budget) {
    case '0-10': return 10;
    case '10-30': return 30;
    case '30-100': return 100;
    case '100+': return Infinity;
  }
}

function getBudgetMin(budget: BudgetRange): number {
  switch (budget) {
    case '0-10': return 0;
    case '10-30': return 10;
    case '30-100': return 30;
    case '100+': return 100;
  }
}

// Get the best price for a host
function getHostPrice(host: CompanyTableRow): number | null {
  // Return the monthly price (already the best available price from data.ts)
  return host.monthlyPrice;
}

// Map building type to suitability field
function getSuitabilityScore(host: CompanyTableRow, buildingType: BuildingType): number {
  switch (buildingType) {
    case 'blog':
    case 'portfolio':
      return host.suitabilityBlogger ?? 0;
    case 'ecommerce':
      return host.suitabilityEcommerce ?? 0;
    case 'saas':
      return host.suitabilityDeveloper ?? 0;
    case 'agency':
      return host.suitabilityAgency ?? 0;
  }
}

// Get technical level bonus
function getTechnicalLevelScore(host: CompanyTableRow, level: TechnicalLevel): number {
  switch (level) {
    case 'beginner':
      return host.suitabilityBeginner ?? 0;
    case 'developer':
      return host.suitabilityDeveloper ?? 0;
    case 'agency':
      return host.suitabilityAgency ?? 0;
  }
}

// Check if host has required feature
function hasFeature(host: CompanyTableRow, feature: MustHaveFeature): boolean {
  switch (feature) {
    case 'free-domain':
      return host.freeDomain === true;
    case 'free-ssl':
      return host.freeSsl === true;
    case 'ssh-access':
      return host.sshAccess === true;
    case 'staging':
      return host.stagingEnvironment === true;
    case 'managed-updates':
      return host.wordpressAutoUpdates === true;
    case 'cdn':
      return host.cdnIncluded === true;
    case 'email':
      return host.emailAccountsIncluded === true;
    case 'backups':
      return host.backupFrequency === 'Daily' || (host.backupFrequency?.toLowerCase().includes('daily') ?? false);
  }
}

// Get feature label for display
function getFeatureLabel(feature: MustHaveFeature): string {
  const option = QUIZ_QUESTIONS[4].options.find(o => o.value === feature);
  return option?.label ?? feature;
}

// Get priority rating
function getPriorityScore(host: CompanyTableRow, priority: Priority): number {
  switch (priority) {
    case 'price':
      return host.valueForMoney ?? 0;
    case 'performance':
      return host.performanceRating ?? 0;
    case 'support':
      return host.supportQuality ?? 0;
    case 'features':
      return host.featuresRating ?? 0;
  }
}

// Check if host suits CMS preference
function getCMSScore(host: CompanyTableRow, cms: CMSPreference): number {
  switch (cms) {
    case 'wordpress':
      return (host.wordpressOptimized ? 5 : 2);
    case 'custom':
      // Check for Node.js, Python, Ruby support
      const customScore = [
        host.nodejsSupport,
        host.pythonSupport,
        host.rubySupport,
        host.sshAccess,
      ].filter(Boolean).length;
      return Math.min(5, customScore + 1);
    case 'drupal':
      // Drupal/Joomla work best with good PHP support and resources
      return host.hostingType === 'shared' || host.hostingType === 'vps' ? 4 : 3;
    case 'static':
      // Static sites work great on JAMstack hosts
      return host.hostingType === 'jamstack' ? 5 : (host.cdnIncluded ? 4 : 3);
  }
}

// Check if host can handle expected traffic
function getTrafficScore(host: CompanyTableRow, traffic: TrafficLevel): number {
  const hostingType = host.hostingType;

  switch (traffic) {
    case 'starting':
      // Any hosting works for starting sites
      return 5;
    case '10k':
      // Shared hosting can usually handle this
      return hostingType === 'shared' ? 4 : 5;
    case '100k':
      // Need better hosting
      if (hostingType === 'shared') return 2;
      if (hostingType === 'managed-wordpress' || hostingType === 'vps') return 5;
      return 4;
    case '1m':
      // Need enterprise/cloud
      if (hostingType === 'shared') return 1;
      if (hostingType === 'cloud-iaas' || hostingType === 'dedicated') return 5;
      if (hostingType === 'managed-wordpress' || hostingType === 'vps') return 4;
      return 3;
  }
}

/**
 * Score all hosts based on quiz answers
 */
export function scoreHosts(hosts: CompanyTableRow[], answers: QuizAnswers): HostScore[] {
  const scores: HostScore[] = [];

  for (const host of hosts) {
    const matchReasons: string[] = [];
    let suitabilityScore = 0;
    let budgetScore = 0;
    let featureScore = 0;
    let priorityScore = 0;

    // 1. SUITABILITY SCORE (40 points max)
    // Building type suitability (20 points)
    if (answers.buildingType) {
      const suitability = getSuitabilityScore(host, answers.buildingType);
      suitabilityScore += suitability * 4; // 0-20 points
      if (suitability >= 4) {
        matchReasons.push(`Great for ${answers.buildingType}`);
      }
    }

    // Technical level (10 points)
    if (answers.technicalLevel) {
      const techScore = getTechnicalLevelScore(host, answers.technicalLevel);
      suitabilityScore += techScore * 2; // 0-10 points
      if (techScore >= 4) {
        matchReasons.push(`Perfect for ${answers.technicalLevel}s`);
      }
    }

    // Traffic handling (5 points)
    if (answers.expectedTraffic) {
      const trafficScore = getTrafficScore(host, answers.expectedTraffic);
      suitabilityScore += trafficScore; // 0-5 points
    }

    // CMS fit (5 points)
    if (answers.cmsPreference) {
      const cmsScore = getCMSScore(host, answers.cmsPreference);
      suitabilityScore += cmsScore; // 0-5 points
      if (cmsScore >= 4 && answers.cmsPreference === 'wordpress') {
        matchReasons.push('WordPress optimized');
      }
    }

    // 2. BUDGET SCORE (25 points max)
    if (answers.budget) {
      const price = getHostPrice(host);
      const maxBudget = getBudgetMax(answers.budget);
      const minBudget = getBudgetMin(answers.budget);

      if (price !== null) {
        if (price <= maxBudget) {
          // Within budget - score based on value
          if (price <= minBudget) {
            // Under budget - good value
            budgetScore = 25;
            matchReasons.push(`Under budget at $${price}/mo`);
          } else {
            // At the right price point
            budgetScore = 20 + (5 * (1 - (price - minBudget) / (maxBudget - minBudget)));
            matchReasons.push(`Fits budget at $${price}/mo`);
          }
        } else if (price <= maxBudget * 1.2) {
          // Slightly over budget - partial score
          budgetScore = 10;
        } else {
          // Over budget
          budgetScore = 0;
        }
      }
    }

    // 3. FEATURE SCORE (20 points max)
    if (answers.mustHaveFeatures.length > 0) {
      const matchedFeatures: string[] = [];
      for (const feature of answers.mustHaveFeatures) {
        if (hasFeature(host, feature)) {
          matchedFeatures.push(getFeatureLabel(feature));
        }
      }
      const featureRatio = matchedFeatures.length / answers.mustHaveFeatures.length;
      featureScore = Math.round(featureRatio * 20);

      if (matchedFeatures.length > 0) {
        if (matchedFeatures.length === answers.mustHaveFeatures.length) {
          matchReasons.push('All required features included');
        } else {
          matchReasons.push(`Has ${matchedFeatures.slice(0, 2).join(', ')}`);
        }
      }
    } else {
      // No features required - give full score
      featureScore = 20;
    }

    // 4. PRIORITY SCORE (15 points max)
    if (answers.priority) {
      const pScore = getPriorityScore(host, answers.priority);
      priorityScore = pScore * 3; // 0-15 points
      if (pScore >= 4) {
        const priorityLabel = {
          price: 'Excellent value',
          performance: 'Top performance',
          support: 'Great support',
          features: 'Feature-rich',
        }[answers.priority];
        matchReasons.push(priorityLabel);
      }
    }

    // Calculate total score (0-100)
    const totalScore = Math.min(100, Math.round(
      suitabilityScore + budgetScore + featureScore + priorityScore
    ));

    // Add host rating as a tiebreaker reason
    if (host.overallRating && host.overallRating >= 4) {
      matchReasons.push(`${host.overallRating.toFixed(1)} overall rating`);
    }

    scores.push({
      host,
      score: totalScore,
      matchReasons: matchReasons.slice(0, 4), // Max 4 reasons
      breakdown: {
        suitability: suitabilityScore,
        budget: budgetScore,
        features: featureScore,
        priority: priorityScore,
      },
    });
  }

  // Sort by score descending, then by overall rating as tiebreaker
  return scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.host.overallRating ?? 0) - (a.host.overallRating ?? 0);
  });
}

/**
 * Get top N recommendations
 */
export function getRecommendations(hosts: CompanyTableRow[], answers: QuizAnswers, limit = 3): HostScore[] {
  const scored = scoreHosts(hosts, answers);
  return scored.slice(0, limit);
}

/**
 * Convert quiz answers to URL params
 */
export function answersToParams(answers: QuizAnswers): string {
  const params = new URLSearchParams();

  if (answers.buildingType) params.set('build', answers.buildingType);
  if (answers.technicalLevel) params.set('level', answers.technicalLevel);
  if (answers.expectedTraffic) params.set('traffic', answers.expectedTraffic);
  if (answers.budget) params.set('budget', answers.budget);
  if (answers.mustHaveFeatures.length > 0) {
    params.set('features', answers.mustHaveFeatures.join(','));
  }
  if (answers.cmsPreference) params.set('cms', answers.cmsPreference);
  if (answers.priority) params.set('priority', answers.priority);

  return params.toString();
}

/**
 * Parse URL params back to quiz answers
 */
export function paramsToAnswers(params: QuizResultsParams): QuizAnswers {
  return {
    buildingType: (params.build as BuildingType) ?? null,
    technicalLevel: (params.level as TechnicalLevel) ?? null,
    expectedTraffic: (params.traffic as TrafficLevel) ?? null,
    budget: (params.budget as BudgetRange) ?? null,
    mustHaveFeatures: params.features
      ? (params.features.split(',') as MustHaveFeature[])
      : [],
    cmsPreference: (params.cms as CMSPreference) ?? null,
    priority: (params.priority as Priority) ?? null,
  };
}
