#!/usr/bin/env python3
"""
Generate comprehensive 6Ts analyses for all companies in the CSV using the new format.
This script will create investment-grade analyses with detailed sub-sections for each T.
"""

import csv
import json
import os
import time
from pathlib import Path
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

def normalize_filename(company_name):
    """Convert company name to filename format"""
    return company_name.lower().replace(' ', '_').replace(',', '').replace('.', '').replace('&', 'and')

def load_company_data(csv_file, company_name):
    """Load company data from CSV"""
    with open(csv_file, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
        reader = csv.DictReader(f)
        for row in reader:
            if row['Company Name'] == company_name:
                return row
    return None

def create_comprehensive_6ts_prompt(company_data):
    """Create the comprehensive 6Ts analysis prompt"""
    
    prompt = f"""
You are an expert venture capital analyst specializing in the SemperVirens Accelerator's investment framework. Generate a comprehensive 6Ts analysis for this startup application using the enhanced structure with detailed sub-sections.

COMPANY DATA:
{json.dumps(company_data, indent=2)}

Generate a comprehensive JSON analysis using this EXACT structure with detailed sub-sections for each T:

{{
  "company_name": "{company_data.get('Company Name', '')}",
  "website": "{company_data.get('Company website', '')}",
  "year_founded": "{company_data.get('Year Founded', '')}",
  "description": "{company_data.get('Describe your company (Word limit - 50)', '')}",
  "problem_statement": "{company_data.get('What problem are you solving, and why does it matter', '')}",
  "pitch_deck_link": "{company_data.get('Pitch Deck (link)', '')}",
  "demo_link": "{company_data.get('Demo', '')}",
  "team": {{
    "score": [1-5 integer],
    "justification": "Comprehensive evaluation of founding and leadership team's execution ability, domain expertise, prior wins, scaling experience, complementary skills, and leadership signals. Include detailed analysis of each founder's background, achievements, and track record.",
    "company_assessment": {{
      "business_model_strength": "Detailed analysis of revenue model, unit economics, scalability, and competitive positioning",
      "market_positioning": "How the company positions itself in the market, unique value proposition, and differentiation strategy",
      "execution_capability": "Evidence of team's ability to execute on vision, deliver products, and scale operations",
      "strategic_vision": "Quality of long-term vision, market understanding, and strategic planning"
    }},
    "founder_deep_dive": [
      {{
        "name": "Founder Name",
        "role": "Title/Role",
        "linkedin": "LinkedIn URL if provided",
        "background": "Detailed educational and professional background",
        "domain_expertise": "Relevant industry and technical expertise",
        "previous_startups": "Prior entrepreneurial experience with outcomes",
        "notable_achievements": "Awards, recognition, significant milestones",
        "leadership_signals": "Evidence of leadership capability and team building",
        "track_record": [
          {{
            "company": "Previous company name",
            "role": "Role at company",
            "outcome": "Exit, acquisition, failure, ongoing",
            "learnings": "Key learnings and relevance to current venture"
          }}
        ]
      }}
    ],
    "category_comparison": {{
      "competitive_landscape": "Overview of competitive landscape and key players",
      "primary_competitors": [
        {{
          "name": "Competitor name",
          "description": "What they do and their positioning",
          "strengths": "Their key advantages",
          "weaknesses": "Their limitations or gaps",
          "comparison": "How this company compares and differentiates"
        }}
      ],
      "competitive_matrix": {{
        "columns": ["Key differentiator 1", "Key differentiator 2", "Key differentiator 3"],
        "rows": {{
          "This Company": [true, false, true],
          "Competitor 1": [false, true, false],
          "Competitor 2": [true, false, false]
        }}
      }},
      "competitive_positioning": "Overall assessment of competitive positioning and sustainable advantages"
    }},
    "red_flags": ["Team-related concerns and risks"]
  }},
  "tam": {{
    "score": [1-5 integer],
    "justification": "Comprehensive market size analysis including TAM, SAM, SOM calculations, market growth rates, buyer willingness-to-pay evidence, and competitive whitespace opportunities.",
    "market_analysis": {{
      "total_addressable_market": "TAM size with supporting data and methodology",
      "serviceable_addressable_market": "SAM analysis and company's realistic market capture",
      "serviceable_obtainable_market": "SOM projections based on go-to-market strategy",
      "market_growth_rate": "Historical and projected CAGR with supporting trends",
      "market_dynamics": "Key trends, drivers, and forces shaping the market"
    }},
    "customer_analysis": {{
      "buyer_personas": "Detailed profiles of target customers and decision makers",
      "willingness_to_pay": "Evidence of customer willingness to pay and price sensitivity",
      "customer_acquisition_cost": "Analysis of CAC and customer acquisition dynamics",
      "customer_lifetime_value": "LTV analysis and retention characteristics"
    }},
    "red_flags": ["Market-related concerns and risks"]
  }},
  "technology": {{
    "score": [1-5 integer],
    "justification": "Assessment of technical defensibility, differentiation, scalability, and competitive moats. Analyze proprietary algorithms, IP portfolio, integration capabilities, and technical barriers to entry.",
    "technical_assessment": {{
      "core_technology": "Description of core technology and technical approach",
      "defensibility": "Analysis of technical moats and barriers to replication",
      "intellectual_property": "Patents, trade secrets, and IP protection strategy",
      "scalability": "Technical architecture's ability to scale with growth",
      "integration_capabilities": "Ease of integration with existing systems and platforms"
    }},
    "competitive_advantage": {{
      "unique_algorithms": "Proprietary algorithms or technical innovations",
      "data_advantages": "Proprietary data sources or network effects",
      "technical_barriers": "Barriers preventing competitors from replicating solution",
      "development_velocity": "Speed of technical development and iteration"
    }},
    "red_flags": ["Technology-related concerns and risks"]
  }},
  "traction": {{
    "score": [1-5 integer],
    "justification": "Evaluation of product-market fit signals, growth metrics, customer validation, and go-to-market execution. Focus on quantitative traction, retention rates, and scaling indicators.",
    "growth_metrics": {{
      "revenue_growth": "Revenue trajectory, ARR/MRR growth rates, and projections",
      "customer_metrics": "Customer count, acquisition rate, and growth trends",
      "retention_analysis": "Customer retention, churn rates, and cohort analysis",
      "unit_economics": "CAC, LTV, payback periods, and contribution margins"
    }},
    "market_validation": {{
      "customer_feedback": "Qualitative feedback and satisfaction indicators",
      "product_market_fit": "Evidence of strong PMF and customer demand",
      "notable_customers": "Key customers, logos, and case studies",
      "partnerships": "Strategic partnerships and channel relationships"
    }},
    "successes_and_areas_of_investigation": [
      {{
        "type": "Success or Area of Investigation",
        "description": "Specific achievement or concern",
        "context": "Background context and circumstances",
        "outcome": "Results, implications, and next steps"
      }}
    ],
    "red_flags": ["Traction-related concerns and risks"]
  }},
  "timing": {{
    "score": [1-5 integer],
    "justification": "Analysis of macro timing, market readiness, regulatory environment, and competitive timing. Assess catalysts, tailwinds, and risks of early/late market entry.",
    "market_timing": {{
      "market_readiness": "Assessment of market maturity and readiness for solution",
      "catalysts": "Key events, trends, or changes driving market opportunity",
      "tailwinds": "Favorable macro trends supporting the business",
      "headwinds": "Potential challenges or opposing market forces"
    }},
    "competitive_timing": {{
      "first_mover_advantage": "Benefits of early market entry",
      "competitive_response": "Likelihood and timeline of competitive response",
      "market_education": "Required market education and adoption timeline",
      "technology_maturity": "Maturity of underlying technologies and infrastructure"
    }},
    "red_flags": ["Timing-related concerns and risks"]
  }},
  "terms": {{
    "score": [1-5 integer],
    "justification": "Assessment of investment terms, valuation alignment with SV focus, round structure, and ownership potential. Evaluate stage appropriateness and investment attractiveness.",
    "investment_details": {{
      "round_stage": "Seed, pre-seed, or series designation",
      "raise_amount": "Target raise amount and use of funds",
      "pre_money_valuation": "Pre-money valuation and valuation methodology",
      "post_money_valuation": "Post-money valuation and ownership implications"
    }},
    "terms_analysis": {{
      "sv_alignment": "Alignment with SV's investment criteria and focus areas",
      "ownership_potential": "Potential ownership percentage and board representation",
      "liquidation_preferences": "Liquidation preferences and investor protections",
      "valuation_justification": "Analysis of valuation relative to comparables and metrics"
    }},
    "red_flags": ["Terms-related concerns and risks"]
  }},
  "final_recommendation": {{
    "status": "Advance, Hold, or Pass",
    "rationale": "Comprehensive synthesis of all 6Ts analysis leading to final investment recommendation",
    "key_factors": ["Primary factors influencing the recommendation"],
    "next_steps": ["Specific actions if advancing to next stage"]
  }}
}}

ANALYSIS REQUIREMENTS:
1. Provide detailed, investment-grade analysis for each section
2. Use specific data points and evidence from the application
3. Score each T from 1-5 based on strength and SV alignment
4. Include comprehensive sub-sections with meaningful insights
5. Identify specific red flags and areas of concern
6. Provide actionable recommendations and next steps
7. Focus on SemperVirens' investment thesis and criteria
8. Ensure all JSON fields are properly populated with substantive content

Generate the complete JSON analysis now:
"""
    
    return prompt

def generate_analysis(company_name, company_data):
    """Generate comprehensive 6Ts analysis using OpenAI"""
    print(f"Generating analysis for {company_name}...")

    prompt = create_comprehensive_6ts_prompt(company_data)

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            max_tokens=8000,
            temperature=0.1,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # Extract JSON from response
        content = response.choices[0].message.content

        # Find JSON in the response
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1

        if start_idx == -1 or end_idx == 0:
            raise ValueError("No JSON found in response")

        json_str = content[start_idx:end_idx]
        analysis = json.loads(json_str)

        return analysis

    except Exception as e:
        print(f"Error generating analysis for {company_name}: {e}")
        return None

def main():
    """Main function to generate analyses for all companies"""
    csv_file = "SVApplications.csv"
    analysis_dir = Path("analysis")
    
    # Get list of companies from CSV
    companies = []
    with open(csv_file, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
        reader = csv.DictReader(f)
        for row in reader:
            company_name = row.get('Company Name', '').strip()
            if company_name and company_name not in ['Company Name', 'By submitting this application', 'For the avoidance of doubt']:
                companies.append(company_name)
    
    # Remove duplicates and sort
    unique_companies = sorted(list(set(companies)))
    print(f"Found {len(unique_companies)} unique companies")
    
    # Skip companies that already have comprehensive analyses
    skip_companies = ['Beacon']  # Already has comprehensive analysis
    
    for company_name in unique_companies:
        if company_name in skip_companies:
            print(f"Skipping {company_name} - already has comprehensive analysis")
            continue
            
        if company_name.lower() in ['test']:
            print(f"Skipping {company_name} - test company")
            continue
        
        # Check if analysis already exists
        filename = f"{normalize_filename(company_name)}_comprehensive_analysis.json"
        analysis_file = analysis_dir / filename
        
        if analysis_file.exists():
            print(f"Skipping {company_name} - analysis already exists")
            continue
        
        # Load company data
        company_data = load_company_data(csv_file, company_name)
        if not company_data:
            print(f"No data found for {company_name}")
            continue
        
        # Generate analysis
        analysis = generate_analysis(company_name, company_data)
        if analysis:
            # Save analysis
            with open(analysis_file, 'w', encoding='utf-8') as f:
                json.dump(analysis, f, indent=2, ensure_ascii=False)
            print(f"✅ Saved analysis for {company_name}")
        else:
            print(f"❌ Failed to generate analysis for {company_name}")
        
        # Rate limiting - wait between requests
        time.sleep(2)

if __name__ == "__main__":
    main()
