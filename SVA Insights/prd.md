# Product Requirements Document (PRD)
**SemperVirens Accelerator Application Analysis Platform – Comprehensive 6Ts Evaluation Framework**

---

## 1. Product Overview

### 1.1 Product Vision
The SemperVirens Accelerator Application Analysis Platform automates startup application evaluation using a comprehensive AI-driven framework based on the **6Ts**: Team, TAM, Technology, Traction, Timing, and Terms. This framework provides investment-grade analysis with detailed sub-sections for each T, ensuring standardized evaluation aligned with SV's investment thesis.

### 1.2 Product Mission
Enable faster, more consistent, and thesis-aligned investment decisions by generating comprehensive JSON analysis memos with detailed scoring, justifications, and actionable insights across the 6Ts framework.

### 1.3 Target Users
- **Primary:** SemperVirens Accelerator investment team and partners
- **Secondary:** Program managers and decision-makers for cohort selection
- **Tertiary:** Portfolio companies seeking structured feedback

---

## 2. Problem Statement

### 2.1 Current Challenges
- Previous evaluation systems lacked comprehensive analysis depth
- Manual assessments were inconsistent and time-consuming
- Company assessment, founder analysis, and competitive intelligence were fragmented across multiple sections
- Layout presented information in cramped 2-column format limiting detailed insights

### 2.2 Business Impact
- Slower decision cycles due to incomplete analysis
- Reduced comparability across pipeline companies
- Inconsistent memo quality and missed investment opportunities
- Difficulty presenting comprehensive analysis in investor-ready format

---

## 3. Product Goals & Success Metrics

### 3.1 Goals
- Provide comprehensive analysis with each T as a dedicated full-width section
- Consolidate company assessment, founder deep dive, and competitive analysis under Team
- Ensure investment-grade insights with detailed sub-sections for each T
- Create clean, professional layout focused solely on 6Ts + Final Recommendation

### 3.2 Success Metrics
- 100% JSON outputs include comprehensive 6Ts structure with detailed sub-sections
- Investment committee adoption rate >90% for generated memos
- Time to generate investment-ready memo <30 minutes
- User satisfaction score >4.5/5 for analysis depth and layout

---

## 4. Core Features & Functionality

### 4.1 Data Ingestion
- Parse CSV application data: company basics, founder bios, market size, traction metrics, funding stage
- Validate presence of data relevant to comprehensive 6Ts analysis
- Extract LinkedIn profiles and competitive intelligence for enhanced analysis

---

### 4.2 Comprehensive AI-Powered JSON Generation (6Ts Framework)

#### 4.2.1 Overview
AI generates investment-grade structured JSON memos based on the **comprehensive 6Ts evaluation** framework. Each T includes detailed sub-sections with specific analysis areas, scoring (1–5), and comprehensive justifications.

#### 4.2.2 Enhanced 6Ts Categories with Comprehensive Sub-Sections

**Team (Consolidated Company Analysis)**
- **Purpose:** Comprehensive evaluation of founding team, company assessment, and competitive positioning.
- **Consolidated Sections:** 
  - Company Assessment (business model, market positioning, execution, vision)
  - Founder Deep Dive (detailed profiles, backgrounds, track records)
  - Competitive Analysis (landscape overview, competitor comparison matrix)
- **Inputs:** LinkedIn profiles, prior exits, domain expertise, company strategy, competitive intelligence.
- **Highlight in justification:** Specific prior wins, scaling experience, leadership signals, execution capability.
- **Scoring Guide:** 5 = proven repeat founders with strong execution and clear competitive advantage; 1 = inexperienced team with weak positioning.

**TAM (Total Addressable Market)**
- **Purpose:** Comprehensive market opportunity analysis with detailed market and customer breakdown.
- **Sub-Sections:**
  - Market Analysis (TAM/SAM/SOM calculations, growth rates, dynamics)
  - Customer Analysis (buyer personas, willingness-to-pay, CAC/LTV)
- **Inputs:** Market size data, growth trends, customer research, competitive whitespace.
- **Highlight in justification:** Specific $ size, CAGR, market dynamics, customer validation evidence.
- **Scoring Guide:** 5 = >$5B market with strong tailwinds and proven customer demand; 1 = small or shrinking market.

**Technology**
- **Purpose:** Assess technical defensibility, differentiation, and competitive moats.
- **Sub-Sections:**
  - Technical Assessment (core technology, defensibility, IP, scalability)
  - Competitive Advantage (unique algorithms, data advantages, technical barriers)
- **Inputs:** Technical architecture, IP portfolio, integration capabilities, development velocity.
- **Highlight in justification:** Proprietary algorithms, technical moats, scalability evidence.
- **Scoring Guide:** 5 = proprietary, defensible technology with clear moats; 1 = commoditized or easily replicable tech.

**Traction**
- **Purpose:** Comprehensive evaluation of product-market fit, growth metrics, and market validation.
- **Sub-Sections:**
  - Growth Metrics (revenue growth, customer metrics, retention, unit economics)
  - Market Validation (customer feedback, PMF evidence, notable customers, partnerships)
  - Successes & Areas of Investigation (detailed achievement and concern analysis)
- **Inputs:** Revenue data, customer metrics, retention rates, customer feedback, partnerships.
- **Highlight in justification:** Quantitative traction, growth rates, customer validation, scaling indicators.
- **Scoring Guide:** 5 = >$1M ARR with strong PMF and growth; 1 = no product or meaningful traction.

**Timing**
- **Purpose:** Analyze macro timing, market readiness, and competitive timing dynamics.
- **Sub-Sections:**
  - Market Timing (market readiness, catalysts, tailwinds, headwinds)
  - Competitive Timing (first-mover advantage, competitive response, market education)
- **Inputs:** Market trends, regulatory changes, technology maturity, competitive landscape.
- **Highlight in justification:** Market catalysts, timing advantages, competitive positioning.
- **Scoring Guide:** 5 = optimal timing with strong tailwinds; 1 = poor timing or significant headwinds.

**Terms**
- **Purpose:** Comprehensive assessment of investment terms, valuation, and SV alignment.
- **Sub-Sections:**
  - Investment Details (round stage, raise amount, pre/post-money valuations)
  - Terms Analysis (SV alignment, ownership potential, liquidation preferences)
- **Inputs:** Round details, valuation data, term sheet information, ownership structure.
- **Highlight in justification:** SV alignment, valuation justification, ownership potential.
- **Scoring Guide:** 5 = ideal stage/valuation with strong SV alignment; 1 = uninvestable terms or poor fit.

---

#### 4.2.3 Enhanced JSON Output Format

The platform generates comprehensive JSON analysis with the following structure:

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

## 5. User Interface & Experience

### 5.1 Layout Design Principles
- **Full-Width Sections:** Each T displayed as dedicated full-width section for comprehensive analysis
- **Clean Information Hierarchy:** Professional investment memo format with clear section headers
- **Focused Content:** Only 6Ts + Final Recommendation sections (removed redundant sections)
- **Enhanced Readability:** Proper spacing, typography, and color-coded insights

### 5.2 Section Organization

#### 5.2.1 Team Section (Consolidated)
- **Company Assessment:** Business model, market positioning, execution, vision
- **Founder Deep Dive:** Detailed founder profiles with LinkedIn links and track records
- **Competitive Analysis:** Landscape overview and competitor comparison matrix
- **Red Flags:** Team-specific concerns and risks

#### 5.2.2 TAM Section
- **Market Analysis:** TAM/SAM/SOM breakdown with growth rates
- **Customer Analysis:** Buyer personas, willingness-to-pay, CAC/LTV
- **Red Flags:** Market-related concerns

#### 5.2.3 Technology Section
- **Technical Assessment:** Core tech, defensibility, IP, scalability
- **Competitive Advantage:** Unique algorithms, data advantages, barriers
- **Red Flags:** Technology-related concerns

#### 5.2.4 Traction Section
- **Growth Metrics:** Revenue, customers, retention, unit economics
- **Market Validation:** Customer feedback, PMF, notable customers, partnerships
- **Successes & Areas:** Color-coded achievements and investigations
- **Red Flags:** Traction-related concerns

#### 5.2.5 Timing Section
- **Market Timing:** Readiness, catalysts, tailwinds, headwinds
- **Competitive Timing:** First-mover advantage, competitive response
- **Red Flags:** Timing-related concerns

#### 5.2.6 Terms Section
- **Investment Details:** Stage, amount, pre/post-money valuations
- **Terms Analysis:** SV alignment, ownership, liquidation preferences
- **Red Flags:** Terms-related concerns

#### 5.2.7 Final Recommendation
- **Status Badge:** Color-coded recommendation (Advance/Hold/Pass)
- **Rationale:** Comprehensive reasoning
- **Key Factors:** Primary decision factors
- **Next Steps:** Actionable items for advancing

### 5.3 Visual Design Elements
- **Color Coding:** Green (successes/high scores), Yellow (investigations/medium scores), Red (flags/low scores), Blue (analysis headers)
- **Typography:** Clear hierarchy with prominent section headers and readable body text
- **Spacing:** Generous whitespace for professional presentation
- **Responsive Design:** Optimized for desktop and tablet viewing

---

## 6. Technical Implementation

### 6.1 Backend Changes
- **JSON Structure:** Restructured to have each T as top-level section (not nested under "6Ts")
- **Enhanced Prompting:** Comprehensive prompts for detailed sub-section analysis
- **Validation Logic:** Updated to check new structure with sub-sections
- **Error Handling:** Improved JSON parsing and validation

### 6.2 Frontend Changes
- **Template Restructure:** Complete redesign from 2-column to full-width sections
- **Section Consolidation:** Moved company assessment, founder analysis, and competitive intelligence under Team
- **Enhanced Display:** Rich information display with expandable sub-sections
- **Removed Sections:** Eliminated redundant standalone sections

### 6.3 Data Flow
1. **Input:** CSV application data with enhanced field extraction
2. **Processing:** AI analysis using comprehensive 6Ts prompts
3. **Output:** Structured JSON with detailed sub-sections
4. **Display:** Full-width sections with professional formatting
5. **Navigation:** Linear flow through 6Ts framework

---

## 7. Success Criteria & Validation

### 7.1 Technical Validation
- [ ] JSON outputs match comprehensive structure specification
- [ ] All sub-sections populated with meaningful analysis
- [ ] Template displays all enhanced fields correctly
- [ ] Responsive design works across devices

### 7.2 Business Validation
- [ ] Investment committee adopts generated memos for decision-making
- [ ] Analysis depth meets professional investment standards
- [ ] Layout improves readability and presentation quality
- [ ] Time to generate memos reduced while quality increased

### 7.3 User Acceptance
- [ ] Investment team satisfaction with analysis comprehensiveness
- [ ] Improved decision-making confidence
- [ ] Reduced manual memo preparation time
- [ ] Enhanced portfolio company feedback quality

---

## 8. Future Enhancements

### 8.1 Advanced Analytics
- Portfolio comparison dashboards
- Trend analysis across 6Ts dimensions
- Predictive scoring models

### 8.2 Integration Capabilities
- CRM system integration
- Automated follow-up workflows
- Portfolio management tools

### 8.3 Enhanced AI Features
- Real-time market data integration
- Competitive intelligence automation
- Dynamic scoring adjustments

---

This comprehensive PRD reflects the current state of the platform with enhanced 6Ts analysis, consolidated sections, and professional layout design focused on investment-grade analysis delivery.
