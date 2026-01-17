# Hosting Comparison Tool - Action Plan

## Project Overview
A comprehensive web hosting comparison site with 56 providers, 355+ attributes, programmatic SEO pages, and interactive tools.

**Tech Stack:** Next.js 14 (App Router) + Tailwind CSS + TypeScript
**Deployment:** Netlify
**Monetization:** Affiliate Links + Display Ads
**Design:** Dark theme, lime/green accents, modern sexy aesthetic (creative freedom)

---

## Phase 1: Project Foundation [DONE]

### Step 1.1: Initialize Next.js Project [DONE]
- Create Next.js 14 project with App Router, TypeScript, Tailwind CSS
- Set up project structure:
  ```
  src/
  ├── app/                    # Next.js App Router pages
  ├── components/             # Reusable UI components
  ├── lib/                    # Utilities, data fetching, helpers
  ├── data/                   # JSON data (copy from existing)
  └── types/                  # TypeScript interfaces
  ```
- Configure Tailwind with dark theme custom colors (lime/green accents)
- Set up ESLint, Prettier

### Step 1.2: Design System Setup
- Define color palette:
  - Background: `#0a0a0a` (near black)
  - Surface: `#141414`, `#1a1a1a`, `#222222`
  - Primary accent: `#84cc16` (lime-500) or `#a3e635` (lime-400)
  - Secondary: `#22d3ee` (cyan-400) for variety
  - Text: `#fafafa` (white), `#a1a1aa` (gray-400)
  - Success: `#22c55e`, Error: `#ef4444`
- Typography scale (Inter or Geist font)
- Component primitives: Button, Card, Badge, Table, Input
- Create reusable layout components: Header, Footer, Container

### Step 1.3: Data Layer
- Copy `/data/companies/*.json` and `index.json` to project
- Create TypeScript interfaces from `schema.json` (355+ fields)
- Build data utility functions:
  - `getAllCompanies()` - list all hosts
  - `getCompanyById(id)` - single host data
  - `getCompaniesByCategory(type)` - filter by hosting type
  - `searchCompanies(query, filters)` - full-text search with filters

---

## Phase 2: Homepage & Comparison Table (MVP) [DONE]

### Step 2.1: Homepage Hero Section
- Large headline: "Find Your Perfect Web Host"
- Subheadline with value proposition
- Quick stats (56 hosts, 355+ data points compared)
- Primary CTA to comparison table
- Dark gradient background with subtle visual elements

### Step 2.2: Interactive Comparison Table
**Core Features:**
- Display all 56 hosts with key columns
- Sortable columns (price, rating, uptime, etc.)
- Real-time search/filter as you type
- Category filter (Shared, VPS, Managed WP, Cloud, etc.)
- Price range slider
- Feature toggles (Free SSL, Free Domain, Free Migration, etc.)

**Column Sets (user can toggle):**
- Essential: Name, Price, Rating, Uptime, Support
- Technical: Storage, Bandwidth, PHP versions, SSH
- WordPress: WP optimized, Staging, Auto-updates
- Security: SSL, Backups, DDoS, Malware scanning

**Row Actions:**
- "View Details" → Individual host page
- "Compare" → Add to comparison (max 4)
- Affiliate link button with tracking

### Step 2.3: Quick Compare Widget
- Floating compare bar when hosts selected (sticky bottom)
- Side-by-side comparison modal/page
- Highlight differences in green/red
- Clear winner indicators

### Step 2.4: Homepage Additional Sections
- "Best For" cards: Beginners, Developers, eCommerce, Bloggers
- Top picks carousel by category
- Trust indicators (data freshness, methodology)
- Newsletter signup (simple email capture)
- Footer with links to all categories

---

## Phase 3: Individual Host Pages [DONE]

### Step 3.1: Dynamic Route Setup
- Route: `/hosting/[slug]` (e.g., `/hosting/siteground`)
- Static generation (SSG) for all 56 hosts
- Generate metadata for SEO (title, description, OG tags)

### Step 3.2: Host Page Layout
- **Hero:** Logo, name, tagline, overall rating, affiliate CTA button
- **Pricing Cards:** Show promo vs renewal pricing clearly (unique differentiator!)
- **Pros/Cons Section:** From editorial data (knownIssues, bestFor, avoidIf)
- **Detailed Specs Accordion:**
  - Technical specifications
  - Performance & uptime
  - Security features
  - Support channels
  - WordPress features (if applicable)
  - Email hosting
  - Policies & restrictions
- **Rating Breakdown:** Visual bars for each rating category (8 dimensions)
- **Use Case Suitability:** Visual scores for Blogger, eCommerce, Agency, etc.
- **FAQ Section:** Use FAQ content from data (8 pre-written Q&As)
- **Alternatives:** Link to competitors from `primaryCompetitors` field
- **Related Comparisons:** Links to X vs Y pages featuring this host

### Step 3.3: SEO Elements
- Schema.org Product markup
- FAQ structured data
- Breadcrumbs
- Internal linking to comparison pages
- Canonical URLs

---

## Phase 4: X vs Y Comparison Pages (Smart Clustering) [DONE]

### Step 4.1: Generate Comparison Pairs
**Smart Clustering Strategy** - Only compare hosts within same/similar categories:

| Category | Hosts | Comparison Pages |
|----------|-------|------------------|
| Budget Shared | GoDaddy, Hostinger, Bluehost, HostGator, etc. | ~15 hosts → ~105 pairs |
| Premium/Managed WP | Kinsta, WP Engine, Flywheel, Pressable, etc. | ~8 hosts → ~28 pairs |
| VPS/Cloud | DigitalOcean, Vultr, Linode, Hetzner, etc. | ~11 hosts → ~55 pairs |
| Website Builders | Wix, Squarespace, Weebly | ~5 hosts → ~10 pairs |
| Cloud Giants | AWS, GCP, Azure | ~3 hosts → ~3 pairs |
| Modern Platforms | Vercel, Netlify, Render | ~6 hosts → ~15 pairs |

**Total: ~220-250 high-quality comparison pages** (not 3000+ noise)

### Step 4.2: Comparison Page Template
- Route: `/compare/[hostA]-vs-[hostB]`
- **Layout:**
  - H1: "[HostA] vs [HostB]: Complete [Year] Comparison"
  - Winner summary box with key differentiators
  - Side-by-side feature table (sortable sections)
  - Pricing comparison (including renewal prices!)
  - Performance comparison
  - Support comparison
  - Verdict section with recommendations by use case
  - Both affiliate CTAs
  - Related comparisons

### Step 4.3: Build Script
- Node script to generate all comparison page data at build time
- Pre-compute winner for each category (price, performance, support, etc.)
- Generate unique content snippets per comparison
- SEO-friendly URLs (alphabetically ordered: `aws-vs-gcp` not `gcp-vs-aws`)

---

## Phase 5: Quiz/Recommender Tool [DONE]

### Step 5.1: Quiz Flow Design
- Route: `/find-hosting` or `/quiz`
- **Questions (5-7 steps):**
  1. What are you building? (Blog, eCommerce, Portfolio, SaaS, Agency sites)
  2. Technical level? (Beginner, Developer, Agency)
  3. Expected traffic? (Just starting, 10K/mo, 100K/mo, 1M+)
  4. Budget range? ($0-10/mo, $10-30/mo, $30-100/mo, $100+/mo)
  5. Must-have features? (Multi-select: Free domain, SSH access, Staging, Managed updates)
  6. CMS preference? (WordPress, None/Custom, Drupal/Joomla, Static site)
  7. Priority? (Price, Performance, Support, Features)

### Step 5.2: Recommendation Engine
- Score hosts based on answers using:
  - `suitability*` fields (Blogger, eCommerce, Agency, Developer, Beginner, Enterprise)
  - Feature fields matching user requirements
  - Price within budget range
  - Hosting type matching technical level
- Weight factors by user's stated priority
- Return top 3 recommendations with match percentage
- Show specific reasons why each was recommended

### Step 5.3: Results Page
- Shareable URL: `/quiz/results?type=blog&budget=30&...`
- Top 3 hosts with match scores and explanations
- Comparison table of recommendations
- CTA to full comparison or individual pages
- "Retake quiz" option

---

## Phase 6: Blog Section

### Step 6.1: Blog Infrastructure
- Route: `/blog` and `/blog/[slug]`
- MDX for content (markdown + React components)
- Categories: Guides, Comparisons, News, Tutorials
- Author support
- Tags for filtering

### Step 6.2: Initial Content Strategy
**Pillar Pages (target main keywords):** [DONE]
- "Best Web Hosting [Year]"
- "Best WordPress Hosting [Year]"
- "Best VPS Hosting [Year]"
- "Cheapest Web Hosting [Year]"
- "Best Managed WordPress Hosting [Year]"

**Guide Content:**
- "How to Choose Web Hosting: Complete Guide"
- "Shared vs VPS vs Dedicated: What's the Difference?"
- "Hidden Hosting Fees to Watch Out For"
- "Web Hosting for Beginners: Everything You Need to Know"
- "How to Migrate Your Website to a New Host"
- "Understanding Uptime and SLA Guarantees"

### Step 6.3: Long-Tail Keyword Topics (Researched from Quora/Reddit)

**Beginner Questions (High Volume, Low Competition):**

*Hosting Basics:*
1. "What is web hosting and do I need it?" - Explain hosting vs domain, when you need it ✅ DONE
2. "Do I need web hosting for WordPress, Shopify, or Wix?" - Platform-specific requirements
3. "What happens when my web hosting expires?" - Grace periods, data loss, recovery
4. "How long does it take to switch web hosts?" - DNS propagation (24-48 hours)
5. "How much bandwidth does my website need?" - Traffic-based calculations
6. "What does 99.9% uptime guarantee actually mean?" - Real downtime math (43 min/month)

*Choosing a Host:*
7. "Which hosting is best for a small business website?" - Budget vs features vs support
8. "Best web hosting for beginners with no technical knowledge" - User-friendly options
9. "Cheapest web hosting that's actually good (Reddit recommendations)" - Budget picks
10. "How to choose a web hosting provider: 10 factors to consider" - Checklist
11. "What's the difference between shared, VPS, and dedicated hosting?" - Visual comparison ✅ DONE
12. "Is managed WordPress hosting worth the extra cost?" - When to upgrade

**Technical Deep-Dives (Medium Competition, High Intent):**

*Hosting Types:*
13. "Shared hosting vs VPS hosting: When should I upgrade?" - Traffic thresholds
14. "VPS vs dedicated server: Which one do I need?" - Resource requirements
15. "Cloud hosting vs traditional hosting: What's the difference?" - Scalability
16. "What is managed WordPress hosting and who needs it?" - Features, security

*Performance & Speed:*
17. "Why is my website slow? (It might be your hosting)" - Diagnosing issues
18. "How server location affects website speed" - CDN, latency, data centers
19. "What is a CDN and do I need one?" - When free Cloudflare is enough
20. "How to test if my hosting is slowing down my site" - Tools, benchmarks

*Security:*
21. "Free SSL certificate vs paid SSL: Is there a difference?" - Let's Encrypt, SEO
22. "How often should I backup my website?" - Backup frequency by site type
23. "What security features should web hosting include?" - DDoS, firewall, malware
24. "Is my website data safe on shared hosting?" - Isolation, risks

**Comparison & Decision Content (High Buyer Intent):**

*Platform Comparisons:*
25. "cPanel vs Plesk: Which control panel is better for beginners?" - UI, features
26. "WordPress.com vs self-hosted WordPress: Complete comparison" - Flexibility
27. "Email hosting vs web hosting: Should they be separate?" - Google Workspace

*Specific Use Cases:*
28. "Best hosting for WordPress multisite (and requirements)" - Resource needs
29. "Best hosting for WooCommerce stores" - Performance, SSL, PCI compliance
30. "Best hosting for portfolio websites and photographers" - Storage, bandwidth
31. "Best hosting for high-traffic blogs (100K+ visitors)" - Scaling, caching
32. "Hosting for agencies managing multiple client sites" - White-label, reseller

*Migration & Setup:*
33. "How to migrate your website to a new host without downtime" - Step-by-step
34. "What is a staging site and why do I need one?" - Testing changes safely
35. "How many websites can I host on one hosting account?" - Shared vs VPS limits

**Money & Value Questions (Transactional Intent):**

*Pricing & Hidden Costs:*
36. "Why web hosting renewal prices are so much higher" - Intro pricing trap
37. "Hidden web hosting fees to watch out for" - Migration, SSL, backup charges
38. "Is unlimited hosting really unlimited?" - Fair use policies, real limits
39. "Monthly vs annual hosting: Which saves more money?" - True cost comparison

*Budget Optimization:*
40. "Best free web hosting options (and their limitations)" - When free works
41. "Web hosting under $5/month that doesn't suck" - Budget picks
42. "Is GoDaddy hosting worth it? (Honest review)" - Controversial take

**Troubleshooting Content (Problem-Solution):**

*Common Issues:*
43. "Website down but hosting says it's up - what to check" - DNS, cache, ISP
44. "Email not working after switching hosts" - MX records, SPF/DKIM
45. "Why does my site show 'Error establishing database connection'?" - Causes
46. "My hosting was hacked - now what?" - Recovery steps, prevention

*Support & Service:*
47. "How to get a refund from your web host" - Money-back guarantees
48. "Web hosting support comparison: Chat vs phone vs ticket" - Response times
49. "Signs it's time to switch web hosts" - Red flags, when to migrate

**Niche/Specific Topics (Very Low Competition):**

*Regional & Compliance:*
50. "Best web hosting with servers in [Country]" - Data residency, GDPR
51. "Web hosting for HIPAA compliance (healthcare sites)" - Requirements

*Developer-Focused:*
52. "Best hosting for Node.js applications" - VPS, PaaS options, SSH
53. "Static site hosting: Netlify vs Vercel vs GitHub Pages" - JAMstack
54. "Best hosting with SSH access for developers" - CLI access, Git deploy

*Business-Specific:*
55. "Web hosting for nonprofits (discounts and recommendations)" - TechSoup
56. "Reseller hosting explained: Start your own hosting business" - White-label

### Step 6.4: Content Priority Tiers

**Tier 1 - Publish First (Highest Volume + Low Competition):**
- What is web hosting and do I need it? ✅ DONE
- Shared vs VPS vs Dedicated: What's the difference? ✅ DONE
- What does 99.9% uptime guarantee mean?
- Is managed WordPress hosting worth it?
- Why web hosting renewal prices are higher
- How to migrate website without downtime

**Tier 2 - Publish Second (Medium Volume, Buyer Intent):**
- Best hosting for small business
- Best hosting for WooCommerce
- cPanel vs Plesk comparison
- How much bandwidth do I need?
- Free SSL vs paid SSL

**Tier 3 - Long-Tail Deep Dives:**
- Platform-specific guides (Node.js, Multisite, etc.)
- Troubleshooting content
- Regional/compliance topics

### Step 6.5: Blog Features
- Table of contents (auto-generated)
- Related posts
- Share buttons
- Newsletter CTA in posts
- Reading time estimate
- Last updated date

### Step 6.6: Blog SEO Strategy
- Target keyword in H1, first paragraph, URL slug
- Include related keywords naturally
- Add FAQ schema for question-based posts
- Include comparison tables where relevant
- Link to `/hosting/[slug]` and `/compare/[x]-vs-[y]` pages
- 1500-2500 words for pillar content
- 800-1200 words for focused long-tail posts

---

## Phase 7: SEO Optimization

### Step 7.1: Technical SEO
- `sitemap.xml` generation (all pages - homepage, 56 hosts, ~220 comparisons, blog)
- `robots.txt` configuration
- Canonical URLs on all pages
- Next.js metadata API for all pages
- OpenGraph and Twitter cards
- Hreflang (if multi-language later)

### Step 7.2: Structured Data
- Organization schema (site-wide)
- Product schema (host pages)
- FAQ schema (host pages, comparison pages)
- Article schema (blog posts)
- BreadcrumbList schema
- AggregateRating schema

### Step 7.3: Performance
- Image optimization (Next.js Image component, WebP)
- Font optimization (next/font, font-display: swap)
- Lazy loading for below-fold content
- Code splitting
- Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Step 7.4: Internal Linking
- Breadcrumbs on all pages
- Related hosts on individual pages
- "Compare with" links
- Category landing pages
- Contextual links in blog posts
- Footer navigation

---

## Phase 8: Monetization Integration

### Step 8.1: Affiliate Links
- Store affiliate URLs in config/data
- Create `AffiliateButton` component with click tracking
- Add `rel="sponsored noopener"` to affiliate links
- Disclosure banner/text where required by FTC
- Track conversions with UTM parameters

### Step 8.2: Ad Integration
- Google AdSense setup
- Ad placement strategy:
  - Header banner (optional, above the fold)
  - In-content ads (blog posts)
  - Sidebar ads (if sidebar layout)
  - **No ads in comparison tables** (keep clean, trust)
- Create `AdSlot` component
- Lazy load ads for performance

### Step 8.3: Analytics [DONE]
- Google Analytics 4 setup
- Track events:
  - Affiliate link clicks (host, position, page)
  - Quiz completions
  - Comparison interactions (which hosts compared)
  - Filter usage (popular filters)
  - Search queries
- Google Search Console integration
- Optional: Plausible or Fathom for privacy-focused alternative

---

## Phase 9: Deployment & Launch [DONE]

### Step 9.1: Netlify Setup
- Connect Git repository
- Configure build settings (`npm run build`)
- Set environment variables
- Enable automatic deployments from main branch
- Set up preview deployments for PRs

### Step 9.2: Domain Setup
- Purchase domain (suggestions: `hostcompare.io`, `hostingpicked.com`, `hostfinder.dev`, `hostmatch.io`)
- Configure DNS on Netlify
- SSL certificate (automatic via Let's Encrypt)
- Set up www → non-www redirect (or vice versa)
- Configure custom 404 page

### Step 9.3: Pre-Launch Checklist
- [ ] All 56 host pages render correctly
- [ ] All ~220 comparison pages render correctly
- [ ] Mobile responsive on all pages
- [ ] Lighthouse score 90+ (Performance, SEO, Accessibility)
- [ ] All affiliate links working and tracked
- [ ] Analytics tracking verified
- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Test Core Web Vitals
- [ ] Test search/filter functionality
- [ ] Test quiz flow end-to-end
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] FTC disclosure visible on monetized pages

---

## Execution Order (Step by Step)

### Week 1: Foundation
| Step | Task | Dependencies |
|------|------|--------------|
| 1.1 | Initialize Next.js project | None |
| 1.2 | Design system setup | 1.1 |
| 1.3 | Data layer | 1.1 |

### Week 2: Homepage (MVP Core)
| Step | Task | Dependencies |
|------|------|--------------|
| 2.1 | Homepage hero section | 1.2 |
| 2.2 | Interactive comparison table | 1.3 |
| 2.3 | Quick compare widget | 2.2 |
| 2.4 | Additional homepage sections | 2.1 |

### Week 3: Host Pages
| Step | Task | Dependencies |
|------|------|--------------|
| 3.1 | Dynamic route setup | 1.3 |
| 3.2 | Host page layout | 3.1 |
| 3.3 | SEO elements | 3.2 |

### Week 4: Comparison Pages
| Step | Task | Dependencies |
|------|------|--------------|
| 4.1 | Generate comparison pairs | 1.3 |
| 4.2 | Comparison page template | 3.2 |
| 4.3 | Build script | 4.1, 4.2 |

### Week 5: Interactive Features
| Step | Task | Dependencies |
|------|------|--------------|
| 5.1 | Quiz flow design | 1.2 |
| 5.2 | Recommendation engine | 1.3, 5.1 |
| 5.3 | Results page | 5.2 |

### Week 6: Blog & Content
| Step | Task | Dependencies |
|------|------|--------------|
| 6.1 | Blog infrastructure | 1.2 |
| 6.2 | Initial content | 6.1 |
| 6.3 | Blog features | 6.1 |

### Week 7: Polish & Launch
| Step | Task | Dependencies |
|------|------|--------------|
| 7.1-7.4 | SEO optimization | All pages |
| 8.1-8.3 | Monetization | All pages |
| 9.1-9.3 | Deployment | Everything |

---

## File Structure

```
hosting-comparison-site/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with header/footer
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css                # Global styles
│   │   ├── hosting/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Individual host pages (56)
│   │   ├── compare/
│   │   │   └── [comparison]/
│   │   │       └── page.tsx           # X vs Y pages (~220)
│   │   ├── quiz/
│   │   │   ├── page.tsx               # Quiz start
│   │   │   └── results/
│   │   │       └── page.tsx           # Quiz results
│   │   ├── blog/
│   │   │   ├── page.tsx               # Blog index
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Blog posts
│   │   ├── category/
│   │   │   └── [category]/
│   │   │       └── page.tsx           # Category landing pages
│   │   └── sitemap.ts                 # Dynamic sitemap generation
│   │
│   ├── components/
│   │   ├── ui/                        # Primitives (Button, Card, Badge, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Slider.tsx
│   │   │   └── Accordion.tsx
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Container.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── comparison/                # Comparison-specific
│   │   │   ├── ComparisonTable.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CompareWidget.tsx
│   │   │   └── HostRow.tsx
│   │   ├── host/                      # Host page components
│   │   │   ├── HostHero.tsx
│   │   │   ├── PricingCards.tsx
│   │   │   ├── SpecsAccordion.tsx
│   │   │   ├── RatingBreakdown.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   └── AffiliateButton.tsx
│   │   ├── quiz/                      # Quiz components
│   │   │   ├── QuizProgress.tsx
│   │   │   ├── QuizQuestion.tsx
│   │   │   └── ResultsCard.tsx
│   │   └── blog/                      # Blog components
│   │       ├── PostCard.tsx
│   │       ├── TableOfContents.tsx
│   │       └── ShareButtons.tsx
│   │
│   ├── lib/
│   │   ├── data.ts                    # Data fetching utilities
│   │   ├── utils.ts                   # General helpers
│   │   ├── constants.ts               # Config, categories, etc.
│   │   ├── comparisons.ts             # Comparison pair generation
│   │   ├── quiz-engine.ts             # Recommendation algorithm
│   │   └── seo.ts                     # SEO helpers (schema, meta)
│   │
│   ├── types/
│   │   ├── index.ts                   # Main TypeScript interfaces
│   │   ├── company.ts                 # Company/Host types
│   │   └── comparison.ts              # Comparison types
│   │
│   └── data/
│       ├── index.json                 # Company manifest
│       ├── companies/                 # Individual host JSON files
│       │   ├── godaddy.json
│       │   ├── siteground.json
│       │   └── ... (56 files)
│       └── blog/                      # MDX blog posts
│           └── *.mdx
│
├── public/
│   ├── images/
│   │   ├── logos/                     # Host logos
│   │   └── og/                        # OpenGraph images
│   ├── favicon.ico
│   └── robots.txt
│
├── scripts/
│   └── generate-comparisons.ts        # Build-time script for comparison data
│
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local                         # Environment variables
```

---

## Design Specifications

### Color Palette
```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-tertiary: #1a1a1a;
  --bg-elevated: #222222;

  /* Accents */
  --accent-primary: #84cc16;      /* lime-500 */
  --accent-primary-light: #a3e635; /* lime-400 */
  --accent-secondary: #22d3ee;    /* cyan-400 */

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  /* Semantic */
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-medium: rgba(255, 255, 255, 0.2);
}
```

### Typography
- **Font Family:** Inter or Geist Sans
- **Headings:** Bold (700), tight letter-spacing (-0.02em)
- **Body:** Regular (400), normal letter-spacing
- **Monospace:** Geist Mono or JetBrains Mono (for technical specs)

### Spacing Scale
- Using Tailwind default spacing (4px base)
- Section padding: `py-16` to `py-24`
- Card padding: `p-6` to `p-8`
- Component gaps: `gap-4` to `gap-8`

### UI Elements
- Rounded corners: `rounded-lg` (8px) to `rounded-2xl` (16px)
- Subtle borders: `border border-white/10`
- Glass morphism: `bg-white/5 backdrop-blur-sm` for overlays
- Shadows: Minimal, using `shadow-lg` sparingly
- Transitions: `transition-all duration-200 ease-out`
- Hover states: Slight brightness increase, border glow

---

## Data Architecture

### Company Index (`data/index.json`)
```json
{
  "companies": [
    {
      "id": "siteground",
      "name": "SiteGround",
      "status": "complete",
      "lastUpdated": "2026-01-14"
    }
  ],
  "totalCompanies": 56,
  "lastFullUpdate": "2026-01-14"
}
```

### Company Data (`data/companies/[id].json`)
Full schema with 355+ fields organized into 21+ sections:
- Basic Info, Pricing, Technical Specs, Server Performance
- Security, Compliance, Support, WordPress Features
- Managed WordPress, Migration, Control Panel, Email
- Policies, Content Restrictions, Business, Reputation
- Editorial, Ratings, Use Cases, Platform Support
- Pricing Calculated, Comparison Data, Regional, FAQ

---

## Verification Checklist

### After Phase 1 (Foundation)
- [ ] `npm run dev` starts without errors
- [ ] Tailwind styles apply correctly
- [ ] All data loads from JSON files
- [ ] TypeScript types match data structure

### After Phase 2 (Homepage)
- [ ] Table displays all 56 hosts
- [ ] Search filters results in real-time
- [ ] Category filter works
- [ ] Price range slider works
- [ ] Sort by columns works
- [ ] Responsive on mobile

### After Phase 3 (Host Pages)
- [ ] All 56 pages generate at build time
- [ ] URLs are correct (`/hosting/siteground`)
- [ ] SEO meta tags present
- [ ] Structured data validates (Google Rich Results Test)

### After Phase 4 (Comparison Pages)
- [ ] All ~220 pages generate
- [ ] URLs follow pattern (`/compare/aws-vs-gcp`)
- [ ] Winner calculations are correct
- [ ] No duplicate pages (alphabetically ordered)

### After Phase 5 (Quiz)
- [ ] All question paths work
- [ ] Recommendations are relevant
- [ ] Results page displays correctly
- [ ] Shareable URLs work

### After Phase 6 (Blog)
- [ ] MDX renders correctly
- [ ] Blog index shows posts
- [ ] Navigation works

### Pre-Launch
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse SEO: 90+
- [ ] Lighthouse Accessibility: 90+
- [ ] No console errors
- [ ] All affiliate links work
- [ ] Analytics tracking verified
- [ ] Mobile responsive
- [ ] Cross-browser tested

---

## Notes

- **Data:** Already collected - 56 hosts, 355+ fields, all complete
- **Priority:** MVP first (homepage + table), then expand
- **Design:** Dark aesthetic with creative freedom
- **Comparisons:** Smart clustering reduces 3000+ possible pairs to ~220 quality pages
- **Deployment:** Netlify
- **Domain:** TBD (to be purchased)

---

## Quick Start Command Reference

```bash
# Create project
npx create-next-app@latest hosting-comparison-site --typescript --tailwind --eslint --app --src-dir

# Install dependencies
npm install lucide-react @radix-ui/react-accordion @radix-ui/react-slider clsx tailwind-merge

# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```
