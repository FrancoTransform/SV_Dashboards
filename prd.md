# Product Requirements Document (PRD)
**SemperVirens Accelerator Application Analysis Platform – Expanded 6Ts Evaluation Framework**

---

## 1. Product Overview

### 1.1 Product Vision
The SemperVirens Accelerator Application Analysis Platform automates startup application evaluation using an AI-driven framework based on the **6Ts**: Team, TAM, Technology, Traction, Timing, and Terms. This framework ensures standardized, comprehensive analysis aligned with SV’s investment thesis and accelerates decision-making.

### 1.2 Product Mission
Enable faster, more consistent, and thesis-aligned investment decisions by generating structured JSON memos scored and justified across the 6Ts framework.

### 1.3 Target Users
- **Primary:** SemperVirens Accelerator investment team and partners
- **Secondary:** Program managers and decision-makers for cohort selection

---

## 2. Problem Statement

### 2.1 Current Challenges
- Previous 6-category system misaligned with updated SV thesis
- Manual assessments lacked consistency and slowed reviews
- Founder/market research not fully integrated into scoring

### 2.2 Business Impact
- Slower decision cycles
- Reduced comparability across pipeline companies
- Inconsistent memos and missed opportunities

---

## 3. Product Goals & Success Metrics

### 3.1 Goals
- Standardize analysis around **6Ts**
- Ensure actionable and comparable scoring across all applications
- Reduce time to produce memos while increasing depth and accuracy

### 3.2 Success Metrics
- 100% JSON outputs include 6Ts structure
- Accuracy of AI scoring vs. partner consensus >85%
- Time to generate review-ready memo <30 minutes

---

## 4. Core Features & Functionality

### 4.1 Data Ingestion
- Parse CSV application data: company basics, founder bios, market size, traction metrics, funding stage
- Validate presence of data relevant to 6Ts

---

### 4.2 AI-Powered JSON Generation (6Ts Framework)

#### 4.2.1 Overview
AI generates structured JSON memos based on the **6Ts evaluation** framework, with a score (1–5) and justification for each T.

#### 4.2.2 6Ts Categories with Deep Prompting

**Team**
- **Purpose:** Evaluate founding and leadership team’s execution ability.
- **Inputs:** LinkedIn profiles, prior exits, domain expertise, storytelling strength.
- **Highlight in justification:** Specific prior wins, scaling experience, complementary skills, leadership signals.
- **Scoring Guide:** 5 = proven repeat founders with relevant exits; 1 = no relevant experience.

**TAM (Total Addressable Market)**
- **Purpose:** Measure market size, growth, and opportunity.
- **Inputs:** Market size data, growth trends, buyer personas, competitive whitespace.
- **Highlight in justification:** $ size, CAGR, whitespace, willingness-to-pay evidence.
- **Scoring Guide:** 5 = >$5B market with tailwinds; 1 = very small or shrinking market.

**Technology**
- **Purpose:** Assess defensibility and differentiation.
- **Inputs:** Proprietary data, IP, integrations, scalability.
- **Highlight in justification:** Unique algorithms, defensibility, ease of integration.
- **Scoring Guide:** 5 = proprietary, hard to replicate; 1 = commoditized tech.

**Traction**
- **Purpose:** Evaluate product-market fit signals and GTM execution.
- **Inputs:** Revenue, customer count, retention, partnerships.
- **Highlight in justification:** Quantitative traction, growth %, notable logos.
- **Scoring Guide:** 5 = >$1M ARR or strong PMF; 1 = no product/traction.

**Timing**
- **Purpose:** Determine macro alignment and tailwinds.
- **Inputs:** Regulatory changes, tech cost curves, buyer shifts.
- **Highlight in justification:** Catalysts, risks of early/late entry, cultural shifts.
- **Scoring Guide:** 5 = strong tailwinds; 1 = poor timing.

**Terms**
- **Purpose:** Assess raise structure and valuation fit.
- **Inputs:** Round stage, post-money valuation, ownership potential.
- **Highlight in justification:** Alignment with SV focus (<$15M post-money seed/pre-seed).
- **Scoring Guide:** 5 = ideal stage/valuation; 1 = uninvestable terms.

---

#### 4.2.3 JSON Output Format

```json
{
  "company_name": "...",
  "website": "...",
  "year_founded": "...",
  "description": "...",
  "problem_statement": "...",
  "pitch_deck_link": "...",
  "demo_link": "...",
  "team": {
    "score": 1-5,
    "justification": "Comprehensive evaluation of founding and leadership team's execution ability, domain expertise, prior wins, scaling experience, complementary skills, and leadership signals. Include detailed analysis of each founder's background, achievements, and track record.",
    "company_assessment": {
      "business_model_strength": "Detailed analysis of revenue model, unit economics, scalability, and competitive positioning",
      "market_positioning": "How the company positions itself in the market, unique value proposition, and differentiation strategy",
      "execution_capability": "Evidence of team's ability to execute on vision, deliver products, and scale operations",
      "strategic_vision": "Quality of long-term vision, market understanding, and strategic planning"
    },
    "founder_deep_dive": [
      {
        "name": "Founder Name",
        "role": "Title/Role",
        "linkedin": "LinkedIn URL",
        "background": "Detailed educational and professional background",
        "domain_expertise": "Relevant industry and technical expertise",
        "previous_startups": "Prior entrepreneurial experience with outcomes",
        "notable_achievements": "Awards, recognition, significant milestones",
        "leadership_signals": "Evidence of leadership capability and team building",
        "track_record": [
          {
            "company": "Previous company name",
            "role": "Role at company",
            "outcome": "Exit, acquisition, failure, ongoing",
            "learnings": "Key learnings and relevance to current venture"
          }
        ]
      }
    ],
    "category_comparison": {
      "competitive_landscape": "Overview of competitive landscape and key players",
      "primary_competitors": [
        {
          "name": "Competitor name",
          "description": "What they do and their positioning",
          "strengths": "Their key advantages",
          "weaknesses": "Their limitations or gaps",
          "comparison": "How this company compares and differentiates"
        }
      ],
      "competitive_matrix": {
        "columns": ["Key differentiator 1", "Key differentiator 2", "Key differentiator 3"],
        "rows": {
          "This Company": [true, false, true],
          "Competitor 1": [false, true, false],
          "Competitor 2": [true, false, false]
        }
      },
      "competitive_positioning": "Overall assessment of competitive positioning and sustainable advantages"
    },
    "red_flags": ["Team-related concerns and risks"]
  },
  "tam": {
    "score": 1-5,
    "justification": "Comprehensive market size analysis including TAM, SAM, SOM calculations, market growth rates, buyer willingness-to-pay evidence, and competitive whitespace opportunities.",
    "market_analysis": {
      "total_addressable_market": "TAM size with supporting data and methodology",
      "serviceable_addressable_market": "SAM analysis and company's realistic market capture",
      "serviceable_obtainable_market": "SOM projections based on go-to-market strategy",
      "market_growth_rate": "Historical and projected CAGR with supporting trends",
      "market_dynamics": "Key trends, drivers, and forces shaping the market"
    },
    "customer_analysis": {
      "buyer_personas": "Detailed profiles of target customers and decision makers",
      "willingness_to_pay": "Evidence of customer willingness to pay and price sensitivity",
      "customer_acquisition_cost": "Analysis of CAC and customer acquisition dynamics",
      "customer_lifetime_value": "LTV analysis and retention characteristics"
    },
    "red_flags": ["Market-related concerns and risks"]
  },
  "technology": {
    "score": 1-5,
    "justification": "Assessment of technical defensibility, differentiation, scalability, and competitive moats. Analyze proprietary algorithms, IP portfolio, integration capabilities, and technical barriers to entry.",
    "technical_assessment": {
      "core_technology": "Description of core technology and technical approach",
      "defensibility": "Analysis of technical moats and barriers to replication",
      "intellectual_property": "Patents, trade secrets, and IP protection strategy",
      "scalability": "Technical architecture's ability to scale with growth",
      "integration_capabilities": "Ease of integration with existing systems and platforms"
    },
    "competitive_advantage": {
      "unique_algorithms": "Proprietary algorithms or technical innovations",
      "data_advantages": "Proprietary data sources or network effects",
      "technical_barriers": "Barriers preventing competitors from replicating solution",
      "development_velocity": "Speed of technical development and iteration"
    },
    "red_flags": ["Technology-related concerns and risks"]
  },
  "traction": {
    "score": 1-5,
    "justification": "Evaluation of product-market fit signals, growth metrics, customer validation, and go-to-market execution. Focus on quantitative traction, retention rates, and scaling indicators.",
    "growth_metrics": {
      "revenue_growth": "Revenue trajectory, ARR/MRR growth rates, and projections",
      "customer_metrics": "Customer count, acquisition rate, and growth trends",
      "retention_analysis": "Customer retention, churn rates, and cohort analysis",
      "unit_economics": "CAC, LTV, payback periods, and contribution margins"
    },
    "market_validation": {
      "customer_feedback": "Qualitative feedback and satisfaction indicators",
      "product_market_fit": "Evidence of strong PMF and customer demand",
      "notable_customers": "Key customers, logos, and case studies",
      "partnerships": "Strategic partnerships and channel relationships"
    },
    "successes_and_areas_of_investigation": [
      {
        "type": "Success or Area of Investigation",
        "description": "Specific achievement or concern",
        "context": "Background context and circumstances",
        "outcome": "Results, implications, and next steps"
      }
    ],
    "red_flags": ["Traction-related concerns and risks"]
  },
  "timing": {
    "score": 1-5,
    "justification": "Analysis of macro timing, market readiness, regulatory environment, and competitive timing. Assess catalysts, tailwinds, and risks of early/late market entry.",
    "market_timing": {
      "market_readiness": "Assessment of market maturity and readiness for solution",
      "catalysts": "Key events, trends, or changes driving market opportunity",
      "tailwinds": "Favorable macro trends supporting the business",
      "headwinds": "Potential challenges or opposing market forces"
    },
    "competitive_timing": {
      "first_mover_advantage": "Benefits of early market entry",
      "competitive_response": "Likelihood and timeline of competitive response",
      "market_education": "Required market education and adoption timeline",
      "technology_maturity": "Maturity of underlying technologies and infrastructure"
    },
    "red_flags": ["Timing-related concerns and risks"]
  },
  "terms": {
    "score": 1-5,
    "justification": "Assessment of investment terms, valuation alignment with SV focus, round structure, and ownership potential. Evaluate stage appropriateness and investment attractiveness.",
    "investment_details": {
      "round_stage": "Seed, pre-seed, or series designation",
      "raise_amount": "Target raise amount and use of funds",
      "pre_money_valuation": "Pre-money valuation and valuation methodology",
      "post_money_valuation": "Post-money valuation and ownership implications"
    },
    "terms_analysis": {
      "sv_alignment": "Alignment with SV's investment criteria and focus areas",
      "ownership_potential": "Potential ownership percentage and board representation",
      "liquidation_preferences": "Liquidation preferences and investor protections",
      "valuation_justification": "Analysis of valuation relative to comparables and metrics"
    },
    "red_flags": ["Terms-related concerns and risks"]
  },
  "final_recommendation": {
    "status": "Advance/Hold/Pass",
    "rationale": "Comprehensive synthesis of all 6Ts analysis leading to final investment recommendation",
    "key_factors": ["Primary factors influencing the recommendation"],
    "next_steps": ["Specific actions if advancing to next stage"]
  }
}
```

---

#### 4.2.4 AI Prompt Instructions

**Process:**
1. Extract google sheet data: company details, market info, founders.
2. Enrich with LinkedIn, Crunchbase, and website data.
3. For **each T**:
   - Assign **1–5 score** using rubric above.
   - Write **justification** citing evidence from data/research.
4. Identify **red flags** for each T (valuation misalignment, small TAM, etc.).
5. Summarize with **final recommendation** synthesizing all 6Ts.

**Additional Guidance:**
- Maintain consistency across memos.
- Use comparative lens vs. market norms.
- Be explicit: include metrics, benchmarks, and qualitative context.

---

### 4.3 External Research Integration
- Automated LinkedIn enrichment
- Crunchbase and market data integration
- Manual fallback for incomplete data

---

### 4.4 Web Interface
- Upload CSV, trigger JSON generation
- Radar/bar charts visualize 6Ts
- Filter companies by high-priority Ts (e.g., Team ≥4, TAM ≥4)

---

## 5. Technical Architecture

### 5.1 Data Flow
1. Upload CSV
2. Parse to schema
3. Enrich with external research
4. AI generates JSON (6Ts scoring)
5. Store and present via dashboard

---

## 6. Success Criteria
- 6Ts fully integrated across all outputs
- IC decisions adopt 6Ts as core framework
- Visualization improves comparative analysis

---
