
# SemperVirens Accelerator Application Analysis Script (MVP)

print("Starting sva.py import...")

import csv
import os
from datetime import datetime
from pathlib import Path
import json
from openai import OpenAI
from flask import Flask, render_template, jsonify, request, redirect, url_for, session, flash
import argparse
from functools import wraps
from dotenv import load_dotenv
import requests
import io
import re

print("Loading environment variables...")
load_dotenv()
print("Environment variables loaded")

# Project structure constants
PROJECT_ROOT = Path(__file__).parent
DATA_DIR = PROJECT_ROOT / "data"
TEMPLATE_DIR = PROJECT_ROOT / "templates"
OUTPUT_DIR = PROJECT_ROOT / "outputs"
ANALYSIS_DIR = PROJECT_ROOT / "analysis"

# File paths
CSV_PATH = DATA_DIR / "SemperVirens Accelerator Applications - SemperVirens Accelerator Application Form.csv"
TEMPLATE_PATH = TEMPLATE_DIR / "memo_template.md"

# Initialize Flask
print("Initializing Flask app...")
app = Flask(__name__)
print("Flask app initialized")

# Initialize OpenAI client with error handling
print("Checking OpenAI API key...")
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    print("WARNING: OPENAI_API_KEY environment variable not set")
    client = None
else:
    try:
        print("Initializing OpenAI client...")
        client = OpenAI(api_key=openai_api_key)
        print("OpenAI client initialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to initialize OpenAI client: {e}")
        client = None



# Add a secret key for session management
# Use a consistent secret key to maintain sessions across app restarts
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'sempervirens-accelerator-secret-key-2024')

# Configure session settings for better persistence
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours in seconds
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Password for accessing the site
SITE_PASSWORD = "S@V25"  # Change this to your desired password

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == SITE_PASSWORD:
            session.permanent = True  # Make session persistent
            session['authenticated'] = True
            return redirect(url_for('index'))
        else:
            flash('Invalid password')
    return render_template('login.html')

# Logout route
@app.route('/logout')
def logout():
    session.pop('authenticated', None)
    return redirect(url_for('login'))

# Authentication check decorator
def login_required(view_func):
    @wraps(view_func)
    def wrapped_view(*args, **kwargs):
        if not session.get('authenticated'):
            return redirect(url_for('login'))
        return view_func(*args, **kwargs)
    return wrapped_view

def setup_directories():
    """Create necessary directories if they don't exist"""
    try:
        for directory in [DATA_DIR, TEMPLATE_DIR, OUTPUT_DIR, ANALYSIS_DIR]:
            directory.mkdir(exist_ok=True)
    except Exception as e:
        print(f"Warning: Could not create directories: {e}")
        # In serverless environments, we might not be able to create directories

# Ensure directories exist (with error handling for serverless)
try:
    setup_directories()
    print("Directories setup completed")
except Exception as e:
    print(f"Warning: Directory setup failed: {e}")

def analyze_submission(submission_data):
    """Process submission through OpenAI API to generate structured analysis"""
    if client is None:
        raise Exception("OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.")

    prompt = f"""
    Analyze this startup submission for the SemperVirens Accelerator Program. Provide a thorough, well-researched analysis. Return ONLY a JSON object (no markdown, no explanatory text) with the following structure:

    {{
        "executive_summary": {{
            "company_name": string,
            "website": string,
            "description": string,
            "problem_statement": string
        }},
        "scoring": {{
            "market_opportunity": {{
                "score": number(1-5),
                "justification": string (provide detailed market analysis, size, growth potential, and competitive landscape)
            }},
            "product_differentiation": {{
                "score": number(1-5),
                "justification": string (analyze unique value proposition, technical moat, and competitive advantages)
            }},
            "go_to_market_traction": {{
                "score": number(1-5),
                "justification": string (evaluate current metrics, customer validation, and sales pipeline)
            }},
            "ecosystem_signals": {{
                "score": number(1-5),
                "justification": string (assess market timing, industry trends, and external validation)
            }},
            "founder_team_strength": {{
                "score": number(1-5),
                "justification": string (evaluate team's domain expertise, past successes, and complementary skills)
            }},
            "strategic_fit": {{
                "score": number(1-5),
                "justification": string (analyze alignment with SemperVirens' investment thesis and portfolio)
            }}
        }},
        "red_flags": [
            {{
                "concern": string,
                "severity": "High" | "Medium" | "Low",
                "mitigation_possible": boolean,
                "mitigation_strategy": string (provide specific, actionable mitigation steps)
            }}
        ],
        "thesis_fit": {{
            "sector_fit": {{
                "score": number(1-5),
                "justification": string (detailed analysis of how company fits within target sectors)
            }},
            "employer_ecosystem_leverage": {{
                "score": number(1-5),
                "justification": string (specific opportunities for leveraging employer relationships)
            }},
            "gtm_support_potential": {{
                "score": number(1-5),
                "justification": string (concrete ways SemperVirens can support go-to-market)
            }},
            "strategic_partner_amplification": {{
                "score": number(1-5),
                "justification": string (specific partnership opportunities and potential impact)
            }},
            "acceleration_readiness": {{
                "score": number(1-5),
                "justification": string (detailed assessment of company's stage and acceleration potential)
            }}
        }},
        "track_record": [
            {{
                "type": "Success" | "Failure",
                "company": string (name of previous company/venture),
                "role": string (founder's role),
                "description": string (detailed description of venture),
                "outcome": string (specific outcomes, exits, or learnings),
                "relevance": string (how this experience relates to current venture)
            }}
        ],
        "founders": [
            {{
                "name": string,
                "background": string (detailed educational and professional background),
                "experience": string (comprehensive work history and achievements),
                "domain_expertise": string (relevant industry and technical expertise),
                "previous_startups": string (prior entrepreneurial experience),
                "notable_achievements": string (awards, recognition, or significant milestones),
                "linkedin": string (profile URL)
            }}
        ],
        "recommendation": "Advance" | "Hold" | "Pass",
        "recommendation_rationale": string (comprehensive explanation of decision),
        "key_factors": [
            string (specific points that influenced the recommendation)
        ],
        "next_steps": [
            string (if advancing, specific actions to take)
        ]
    }}

    Company Information:
    Company: {submission_data['Company Name']}
    Website: {submission_data.get('Website', '')}
    Description: {submission_data.get('Describe your company (Word limit - 50)', '')}
    Problem Statement: {submission_data.get('What problem are you solving, and why does it matter', '')}
    Founders: {submission_data.get('Name and title of co-founders (Please include LinkedIn profiles)', '')}

    Research each founder thoroughly using their LinkedIn profiles and any other available information. Provide comprehensive analysis of their track record, previous companies, and relevant experience. Focus on concrete achievements and outcomes.

    For the final recommendation, provide detailed reasoning that ties together all aspects of the analysis - market opportunity, team strength, product differentiation, and strategic fit with SemperVirens.
    """

    # Increase max tokens to accommodate more detailed responses
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert venture capital analyst with deep experience in analyzing startups and founding teams. Provide thorough, well-researched analysis with specific, concrete details."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=4000  # Increased from 2000
    )

    try:
        # Extract just the JSON part from the response
        content = response.choices[0].message.content.strip()
        
        # If the response contains markdown code blocks, extract just the JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        analysis = json.loads(content)
        
        # Validate required fields and content
        required_fields = ['executive_summary', 'scoring', 'red_flags', 'thesis_fit', 
                         'track_record', 'founders', 'recommendation', 'recommendation_rationale']
        
        for field in required_fields:
            if field not in analysis:
                raise KeyError(f"Missing required field: {field}")
            
        return analysis
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response: {e}")
        print("Response content:", response.choices[0].message.content)
        raise
    except (KeyError, ValueError) as e:
        print(f"Invalid response structure or content: {e}")
        print("Response content:", response.choices[0].message.content)
        raise

def analyze_submission_6ts(submission_data):
    """Process submission through OpenAI API using the 6Ts framework"""
    if client is None:
        raise Exception("OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.")

    company_name = submission_data.get('Company Name', 'Unknown')

    prompt = f"""
    Analyze this startup submission for the SemperVirens Accelerator Program using the comprehensive 6Ts evaluation framework.
    Return ONLY a JSON object (no markdown, no explanatory text) with the following structure:

    {{
        "company_name": "{company_name}",
        "website": "extracted from application",
        "year_founded": "extracted from application",
        "description": "company description",
        "problem_statement": "problem they're solving",
        "pitch_deck_link": "extracted from application",
        "demo_link": "extracted from application",
        "team": {{
            "score": 1-5,
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
                    "linkedin": "LinkedIn URL",
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
                        "{company_name}": [true, false, true],
                        "Competitor 1": [false, true, false],
                        "Competitor 2": [true, false, false]
                    }}
                }},
                "competitive_positioning": "Overall assessment of competitive positioning and sustainable advantages"
            }},
            "red_flags": ["Team-related concerns and risks"]
        }},
        "tam": {{
            "score": 1-5,
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
            "score": 1-5,
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
            "score": 1-5,
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
            "score": 1-5,
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
            "score": 1-5,
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
            "status": "Advance/Hold/Pass",
            "rationale": "Comprehensive synthesis of all 6Ts analysis leading to final investment recommendation",
            "key_factors": ["Primary factors influencing the recommendation"],
            "next_steps": ["Specific actions if advancing to next stage"]
        }}
    }}

    Company Information:
    {json.dumps(submission_data, indent=2)}

    Research the founders thoroughly using their LinkedIn profiles and any available information.
    Be explicit: include metrics, benchmarks, and qualitative context. Use comparative lens vs. market norms.
    Maintain consistency across memos. Focus on providing specific, actionable insights with concrete evidence.

    6Ts Scoring Guidelines:
    - 5: Exceptional/Best in class
    - 4: Strong/Above average
    - 3: Good/Average
    - 2: Weak/Below average
    - 1: Poor/Concerning
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert venture capital analyst specializing in the 6Ts framework. Provide thorough analysis with specific details. CRITICAL: Return ONLY valid JSON. Use proper escaping for quotes and ensure all strings are properly terminated."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=4000
    )

    try:
        content = response.choices[0].message.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        analysis = json.loads(content)

        # Validate 6Ts structure (now top-level sections)
        required_6ts = ['team', 'tam', 'technology', 'traction', 'timing', 'terms']
        for t in required_6ts:
            if t not in analysis:
                raise KeyError(f"Missing required 6T: {t}")
            if 'score' not in analysis[t] or 'justification' not in analysis[t]:
                raise KeyError(f"Missing score or justification for 6T: {t}")

        return analysis

    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response: {e}")
        print("Response content:", response.choices[0].message.content)
        raise
    except (KeyError, ValueError) as e:
        print(f"Invalid response structure: {e}")
        print("Response content:", response.choices[0].message.content)
        raise

def process_submissions():
    """Process only the first submission and store analysis"""
    print("Starting submission processing...")
    setup_directories()
    
    with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        submissions = []
        
        # Process only the first row
        try:
            row = next(reader)  # Get first row
            company_name = row['Company Name']
            print(f"Processing submission for {company_name}...")
            
            analysis_file = ANALYSIS_DIR / f"{company_name.replace(' ', '_').lower()}_analysis.json"
            
            # Skip if already processed
            if analysis_file.exists():
                print(f"Analysis already exists for {company_name}, skipping...")
                return submissions
            
            # Get OpenAI analysis
            analysis = analyze_submission(row)
            
            # Additional validation to ensure no placeholder content
            def validate_content(obj):
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        validate_content(v)
                elif isinstance(obj, list):
                    for item in obj:
                        validate_content(item)
                elif isinstance(obj, str) and "to be filled" in obj.lower():
                    raise ValueError(f"Found placeholder content: {obj}")
            
            validate_content(analysis)
            
            # Store submission data and analysis
            submission_data = {
                **analysis['executive_summary'],
                'scoring': analysis['scoring'],
                'red_flags': analysis['red_flags'],
                'thesis_fit': analysis['thesis_fit'],
                'track_record': analysis['track_record'],
                'founders': analysis['founders'],
                'recommendation': analysis['recommendation'],
                'recommendation_rationale': analysis['recommendation_rationale'],
                'timestamp': datetime.now().isoformat()
            }
            
            # Save to file
            with open(analysis_file, 'w', encoding='utf-8') as f:
                json.dump(submission_data, f, indent=2)
            
            submissions.append(submission_data)
            print(f"Successfully processed {company_name}")
            
        except StopIteration:
            print("No submissions found in CSV file")
        except Exception as e:
            print(f"Error processing {row.get('Company Name', 'Unknown')}: {e}")
    
    print("Finished processing submissions")
    return submissions

# Debug route (no login required)
@app.route('/debug')
def debug_info():
    """Debug information endpoint"""
    try:
        import platform
        return jsonify({
            'python_version': platform.python_version(),
            'platform': platform.platform(),
            'cwd': os.getcwd(),
            'files_in_cwd': os.listdir('.'),
            'env_vars': {k: v for k, v in os.environ.items() if 'KEY' in k or 'VERCEL' in k},
            'paths': {
                'PROJECT_ROOT': str(PROJECT_ROOT),
                'DATA_DIR': str(DATA_DIR),
                'ANALYSIS_DIR': str(ANALYSIS_DIR),
                'CSV_PATH': str(CSV_PATH)
            }
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

# Health check route (no login required)
@app.route('/health')
def health_check():
    """Simple health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'openai_client': 'initialized' if client else 'not_initialized',
            'openai_key_set': bool(os.getenv('OPENAI_API_KEY')),
            'data_dir_exists': DATA_DIR.exists() if DATA_DIR else False,
            'analysis_dir_exists': ANALYSIS_DIR.exists() if ANALYSIS_DIR else False,
            'csv_file_exists': CSV_PATH.exists() if CSV_PATH else False,
            'current_directory': str(Path.cwd()),
            'project_root': str(PROJECT_ROOT),
            'environment': 'vercel' if os.getenv('VERCEL') else 'local'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

# Flask routes
@app.route('/')
@login_required
def index():
    """Display list of all submissions"""
    try:
        submissions = []
        print("\n=== Loading Submissions ===")
        print(f"Looking in: {ANALYSIS_DIR}")

        # Ensure analysis directory exists
        if not ANALYSIS_DIR.exists():
            print(f"Analysis directory does not exist: {ANALYSIS_DIR}")
            return render_template('index.html', submissions=[])

        for file in ANALYSIS_DIR.glob('*_comprehensive_analysis.json'):
            print(f"\nProcessing file: {file}")
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        original_name = data.get('company_name', '')
                        data['url_company_name'] = original_name.replace(' ', '').replace('-', '').replace('_', '').lower()
                        print(f"Company name processing:")
                        print(f"  Original: '{original_name}'")
                        print(f"  URL-safe: '{data['url_company_name']}'")
                    submissions.append(data)
            except Exception as e:
                print(f"Error processing file {file}: {e}")
                continue

        print(f"\nTotal submissions: {len(submissions)}")
        print("=== End Loading ===\n")
        return render_template('index.html', submissions=submissions)
    except Exception as e:
        print(f"Error in index route: {e}")
        return render_template('error.html',
                              company_name="Unknown",
                              error_message=f"Error loading submissions: {str(e)}",
                              tried_filenames=[],
                              available_files=[]), 500

def normalize_company_name(name):
    """Convert company name to lowercase and remove spaces"""
    return name.lower().replace(' ', '')

@app.route('/submission/<company_name>')
@login_required
def submission_detail(company_name):
    print(f"=== Submission Detail Request ===")
    print(f"Requested company_name: '{company_name}'")
    
    # Normalize company name for file lookup
    normalized_name = company_name.lower().replace(' ', '_').replace('-', '_')
    
    # Try different possible filename variations for comprehensive analyses
    possible_filenames = [
        f"{normalized_name}_comprehensive_analysis.json",
        f"{company_name.lower()}_comprehensive_analysis.json",
        f"{company_name.lower().replace(' ', '')}_comprehensive_analysis.json",
        f"{company_name.lower().replace(' ', '_')}_comprehensive_analysis.json",
        f"{company_name.lower().replace(' ', '-')}_comprehensive_analysis.json",
        # Fallback to legacy analysis files if comprehensive not found
        f"{normalized_name}_analysis.json",
        f"{company_name.lower()}_analysis.json",
        f"{company_name.lower().replace(' ', '')}_analysis.json",
        f"{company_name.lower().replace(' ', '_')}_analysis.json",
        f"{company_name.lower().replace(' ', '-')}_analysis.json"
    ]
    
    # Comprehensive mapping of URL names to actual filenames
    special_cases = {
        # Companies with "AI" in the name - comprehensive analysis files
        "sunnyhealthai": "sunny_health_ai_comprehensive_analysis.json",
        "sunnyhealth": "sunny_health_ai_comprehensive_analysis.json",
        "sunny": "sunny_health_ai_comprehensive_analysis.json",
        "graphioai": "graphioai_comprehensive_analysis.json",
        "graphio": "graphioai_comprehensive_analysis.json",
        "graphio.ai": "graphioai_comprehensive_analysis.json",
        "logistifyai": "logistify_ai_comprehensive_analysis.json",
        "logistify": "logistify_ai_comprehensive_analysis.json",
        "borderlessai": "borderless_ai_comprehensive_analysis.json",
        "borderless": "borderless_ai_comprehensive_analysis.json",

        # Companies with spaces or special characters - comprehensive analysis files
        "voltahealth": "volta_health_comprehensive_analysis.json",
        "volta": "volta_health_comprehensive_analysis.json",
        "jogohealth": "jogo_health_comprehensive_analysis.json",
        "jogo": "jogo_health_comprehensive_analysis.json",
        "joyahealth": "joya_health_comprehensive_analysis.json",
        "joya": "joya_health_comprehensive_analysis.json",
        "defianthealth": "defiant_health_comprehensive_analysis.json",
        "defiant": "defiant_health_comprehensive_analysis.json",
        "blankslate": "blank_slate_technologies_comprehensive_analysis.json",
        "blankslatetech": "blank_slate_technologies_comprehensive_analysis.json",
        "blankslatetechnologies": "blank_slate_technologies_comprehensive_analysis.json",
        "virtualsapiens": "virtual_sapiens_comprehensive_analysis.json",
        "mandalaforus": "mandala_for_us_inc_comprehensive_analysis.json",
        "mandalaforusinc": "mandala_for_us_inc_comprehensive_analysis.json",
        "mandala": "mandala_for_us_inc_comprehensive_analysis.json",
        "paramean": "paramean_solutions_comprehensive_analysis.json",
        "parameansolutions": "paramean_solutions_comprehensive_analysis.json",
        "doktorconnect": "doktorconnect_comprehensive_analysis.json",
        "hero": "hero_comprehensive_analysis.json",
        "clasp": "clasp_comprehensive_analysis.json",
        "clsp": "clasp_comprehensive_analysis.json",
        "cryptomate": "cryptomate_comprehensive_analysis.json",
        "beacon": "beacon_comprehensive_analysis.json",
        "aidora": "aidora_comprehensive_analysis.json",
        "ezra": "ezra_comprehensive_analysis.json",
        "gtmflow": "gtmflow_comprehensive_analysis.json",
        "smartheritance": "smartheritance_comprehensive_analysis.json",
        "guaranteedhealth": "guaranteed_health_inc_comprehensive_analysis.json",
        "guaranteedhealth,inc": "guaranteed_health_inc_comprehensive_analysis.json",
        "guaranteedhealthinc": "guaranteed_health_inc_comprehensive_analysis.json",
        "guaranteed": "guaranteed_health_inc_comprehensive_analysis.json",
        "keptinc": "kept_inc_comprehensive_analysis.json",
        "kept": "kept_inc_comprehensive_analysis.json",
        "wigglhealth": "wiggl_health_comprehensive_analysis.json",
        "wiggl": "wiggl_health_comprehensive_analysis.json",
        "lockwellinc": "lockwell_inc_comprehensive_analysis.json",
        "lockwell": "lockwell_inc_comprehensive_analysis.json",
        "gigeasy": "gigeasy_comprehensive_analysis.json",
        "gighqai": "gighqai_comprehensive_analysis.json",
        "gighq": "gighqai_comprehensive_analysis.json",
        "icommute": "icommute_comprehensive_analysis.json",
        "thepeoappinc": "the_peo_app_inc_comprehensive_analysis.json",
        "thepeoapp": "the_peo_app_inc_comprehensive_analysis.json",
        "peoapp": "the_peo_app_inc_comprehensive_analysis.json",
        "cherrygiving": "cherrygiving_comprehensive_analysis.json",

        # Complete mappings for all companies with space/underscore issues (generated by check_url_mappings.py)
        "affinitytest": "affinity_test_comprehensive_analysis.json",
        "agavehealth": "agave_health_comprehensive_analysis.json",
        "aximaai": "axima_ai_comprehensive_analysis.json",
        "blankslatetechnologies": "blank_slate_technologies_comprehensive_analysis.json",
        "bogaisaptyltd": "bogaisa_pty_ltd_comprehensive_analysis.json",
        "borderlessai": "borderless_ai_comprehensive_analysis.json",
        "counterfin": "counter_fin_comprehensive_analysis.json",
        "deepcare": "deep_care_comprehensive_analysis.json",
        "defianthealth": "defiant_health_comprehensive_analysis.json",
        "factoscapital": "factos_capital_comprehensive_analysis.json",
        "fifthealth": "fift_health_comprehensive_analysis.json",
        "firepithealth": "firepit_health_comprehensive_analysis.json",
        "guaranteedhealthinc": "guaranteed_health_inc_comprehensive_analysis.json",
        "herdhealth": "herd_health_comprehensive_analysis.json",
        "jogohealth": "jogo_health_comprehensive_analysis.json",
        "joyahealth": "joya_health_comprehensive_analysis.json",
        "keptinc": "kept_inc_comprehensive_analysis.json",
        "kottackaltechnologiesqfzllc": "kottackal_technologies_qfz_llc_comprehensive_analysis.json",
        "logistifyai": "logistify_ai_comprehensive_analysis.json",
        "lockwellinc": "lockwell_inc_comprehensive_analysis.json",
        "magierai": "magier_ai_comprehensive_analysis.json",
        "mandalaforusinc": "mandala_for_us_inc_comprehensive_analysis.json",
        "mybenefitoptions": "my_benefit_options_comprehensive_analysis.json",
        "nucocredentialing": "nuco_credentialing_comprehensive_analysis.json",
        "outrohealth": "outro_health_comprehensive_analysis.json",
        "parameansolutions": "paramean_solutions_comprehensive_analysis.json",
        "sundllc": "sund_llc_comprehensive_analysis.json",
        "sunnyhealthai": "sunny_health_ai_comprehensive_analysis.json",
        "thepeoappinc": "the_peo_app_inc_comprehensive_analysis.json",
        "valuebuddy": "value_buddy_comprehensive_analysis.json",
        "virtualsapiens": "virtual_sapiens_comprehensive_analysis.json",
        "voltahealth": "volta_health_comprehensive_analysis.json",
        "waypavellc": "waypave_llc_comprehensive_analysis.json",
        "wigglhealth": "wiggl_health_comprehensive_analysis.json"
    }
    
    if company_name.lower() in special_cases:
        possible_filenames.insert(0, special_cases[company_name.lower()])
    
    # Debug: Print all available analysis files
    print("Available analysis files:")
    for file in ANALYSIS_DIR.glob('*_comprehensive_analysis.json'):
        print(f"  - {file.name}")
    print("Legacy analysis files:")
    for file in ANALYSIS_DIR.glob('*_analysis.json'):
        print(f"  - {file.name}")
    
    for filename in possible_filenames:
        analysis_file = ANALYSIS_DIR / filename
        print(f"Looking for file: {analysis_file}")
        
        if analysis_file.exists():
            print(f"Found file: {analysis_file}")
            try:
                with open(analysis_file, 'r', encoding='utf-8') as f:
                    analysis = json.load(f)
                
                # Add debug output
                print("Loaded analysis data:")
                
                # Ensure all required sections exist with proper structure
                # Executive Summary
                if 'executive_summary' not in analysis:
                    analysis['executive_summary'] = {
                        'company_name': analysis.get('company_name', ''),
                        'website': analysis.get('website', ''),
                        'year_founded': analysis.get('year_founded', ''),
                        'description': analysis.get('description', '')
                    }
                
                # Scoring
                if 'scoring' not in analysis:
                    analysis['scoring'] = {}
                
                for score_category in ['market_opportunity', 'product_differentiation', 
                                      'go_to_market_traction', 'ecosystem_signals', 
                                      'founder_team_strength', 'strategic_fit']:
                    if score_category not in analysis['scoring']:
                        analysis['scoring'][score_category] = {
                            'score': None,
                            'justification': f'No {score_category.replace("_", " ")} assessment available.'
                        }
                
                # Founder Profile
                if 'founder_profile' not in analysis:
                    analysis['founder_profile'] = {
                        'name': 'Not available',
                        'highlights': [],
                        'linkedin': ''
                    }
                
                # SV Thesis Fit
                if 'sv_thesis_fit' not in analysis:
                    analysis['sv_thesis_fit'] = {}
                
                for fit_category in ['sector_fit', 'employer_ecosystem_leverage', 
                                    'gtm_support_potential', 'strategic_partner_amplification', 
                                    'acceleration_readiness']:
                    if fit_category not in analysis['sv_thesis_fit']:
                        analysis['sv_thesis_fit'][fit_category] = {
                            'score': None,
                            'justification': f'No {fit_category.replace("_", " ")} assessment available.'
                        }
                
                # Red Flags
                if 'red_flags' not in analysis:
                    analysis['red_flags'] = []
                
                # Category Comparison
                if 'category_comparison' not in analysis:
                    analysis['category_comparison'] = ""
                
                # Category Comparison Expanded
                if 'category_comparison_expanded' not in analysis:
                    analysis['category_comparison_expanded'] = {
                        'primary_competitors': [],
                        'competitive_matrix': {
                            'columns': [],
                            'rows': {}
                        },
                        'conclusion': ""
                    }
                else:
                    # Ensure all required fields exist in category_comparison_expanded
                    if 'primary_competitors' not in analysis['category_comparison_expanded']:
                        analysis['category_comparison_expanded']['primary_competitors'] = []
                    
                    if 'competitive_matrix' not in analysis['category_comparison_expanded']:
                        analysis['category_comparison_expanded']['competitive_matrix'] = {
                            'columns': [],
                            'rows': {}
                        }
                    else:
                        if 'columns' not in analysis['category_comparison_expanded']['competitive_matrix']:
                            analysis['category_comparison_expanded']['competitive_matrix']['columns'] = []
                        if 'rows' not in analysis['category_comparison_expanded']['competitive_matrix']:
                            analysis['category_comparison_expanded']['competitive_matrix']['rows'] = {}
                    
                    if 'conclusion' not in analysis['category_comparison_expanded']:
                        analysis['category_comparison_expanded']['conclusion'] = ""
                
                # Successes and Areas of Investigation
                if 'successes_and_areas_of_investigation' not in analysis:
                    analysis['successes_and_areas_of_investigation'] = []
                
                # Final Recommendation
                if 'final_recommendation' not in analysis:
                    analysis['final_recommendation'] = {
                        'status': 'Pending',
                        'rationale': 'Final recommendation is pending review.'
                    }
                elif isinstance(analysis['final_recommendation'], str):
                    status = analysis['final_recommendation']
                    analysis['final_recommendation'] = {
                        'status': status,
                        'rationale': 'See detailed analysis for rationale.'
                    }
                
                print(f"SV Thesis Fit keys: {analysis.get('sv_thesis_fit', {}).keys()}")
                return render_template('detail.html', analysis=analysis)
                
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON file {analysis_file}: {e}")
                return render_template('error.html', 
                                      company_name=company_name,
                                      error_message=f"Invalid JSON format in analysis file: {e}",
                                      tried_filenames=possible_filenames,
                                      available_files=[f.name for f in ANALYSIS_DIR.glob('*_analysis.json')]), 500
            except Exception as e:
                print(f"Error processing analysis file {analysis_file}: {e}")
                return render_template('error.html', 
                                      company_name=company_name,
                                      error_message=f"Error processing analysis file: {str(e)}",
                                      tried_filenames=possible_filenames,
                                      available_files=[f.name for f in ANALYSIS_DIR.glob('*_analysis.json')]), 500
    
    # If we get here, we couldn't find the file - let's provide more helpful error info
    print(f"No analysis file found for company: {company_name}")
    print(f"Tried the following filenames:")
    for filename in possible_filenames:
        print(f"  - {filename}")
    
    return render_template('error.html', 
                          company_name=company_name, 
                          tried_filenames=possible_filenames,
                          available_files=[f.name for f in ANALYSIS_DIR.glob('*_analysis.json')]), 404

def get_google_sheet_as_csv(sheet_url: str) -> str:
    """Convert Google Sheets URL to CSV export URL and fetch data"""
    if '/d/' in sheet_url:
        sheet_id = sheet_url.split('/d/')[1].split('/')[0]
    else:
        raise ValueError("Invalid Google Sheets URL format")

    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"

    try:
        response = requests.get(csv_url, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch Google Sheet: {e}")

def parse_csv_data(csv_content: str) -> list:
    """Parse CSV content into list of dictionaries"""
    submissions = []
    csv_reader = csv.DictReader(io.StringIO(csv_content))

    for row in csv_reader:
        if not any(row.values()):
            continue

        cleaned_row = {}
        for key, value in row.items():
            if key and value:
                cleaned_row[key.strip()] = value.strip()

        if cleaned_row.get('Company Name'):
            submissions.append(cleaned_row)

    return submissions

def get_existing_companies() -> set:
    """Get set of companies that already have analysis files"""
    existing = set()

    for analysis_file in ANALYSIS_DIR.glob('*_analysis.json'):
        try:
            with open(analysis_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                company_name = data.get('company_name', '')
                if company_name:
                    existing.add(re.sub(r'[^a-z0-9]', '', company_name.lower()))
        except Exception:
            continue

    return existing

@app.route('/sync_spreadsheet')
@login_required
def sync_spreadsheet():
    """Sync with Google Spreadsheet and generate analyses for new companies"""
    try:
        # For now, let's use a test URL - you'll need to replace this with the actual spreadsheet URL
        sheet_url = request.args.get('url', '')

        # If no URL provided, return info about what we need
        if not sheet_url:
            return jsonify({
                'status': 'info',
                'message': 'Google Spreadsheet sync ready. Please provide the spreadsheet URL.',
                'current_analyses': len(list(ANALYSIS_DIR.glob('*_analysis.json'))),
                'instructions': 'Add ?url=YOUR_GOOGLE_SHEETS_URL to this endpoint to sync'
            })

        # Fetch data from Google Sheets
        csv_content = get_google_sheet_as_csv(sheet_url)
        submissions = parse_csv_data(csv_content)

        # Get existing companies
        existing_companies = get_existing_companies()

        # Find new companies
        new_companies = []
        for submission in submissions:
            company_name = submission.get('Company Name', '')
            normalized_name = re.sub(r'[^a-z0-9]', '', company_name.lower())

            if normalized_name not in existing_companies:
                new_companies.append(submission)

        # Generate analyses for new companies (limit to avoid timeouts)
        generated_count = 0
        batch_size = min(5, len(new_companies))  # Process max 5 at a time

        for submission in new_companies[:batch_size]:
            try:
                company_name = submission.get('Company Name', '')
                print(f"Generating analysis for: {company_name}")

                analysis = analyze_submission(submission)

                # Save analysis
                safe_filename = re.sub(r'[^a-z0-9]', '', company_name.lower())
                analysis_file = ANALYSIS_DIR / f"{safe_filename}_analysis.json"

                with open(analysis_file, 'w', encoding='utf-8') as f:
                    json.dump(analysis, f, indent=2)

                generated_count += 1
                print(f"✅ Generated analysis for {company_name}")

            except Exception as e:
                print(f"❌ Error generating analysis for {company_name}: {e}")
                continue

        return jsonify({
            'status': 'success',
            'message': f'Synced with spreadsheet. Generated {generated_count} new analyses.',
            'total_in_sheet': len(submissions),
            'existing_analyses': len(existing_companies),
            'new_companies_found': len(new_companies),
            'analyses_generated': generated_count,
            'remaining_to_process': max(0, len(new_companies) - batch_size)
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/sync_status')
@login_required
def sync_status():
    """Check current sync status and provide instructions"""
    try:
        existing_companies = get_existing_companies()
        analysis_files = list(ANALYSIS_DIR.glob('*_analysis.json'))

        # Get some sample company names
        sample_companies = []
        for analysis_file in analysis_files[:5]:
            try:
                with open(analysis_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    sample_companies.append(data.get('company_name', 'Unknown'))
            except Exception:
                continue

        return jsonify({
            'status': 'success',
            'current_analyses': len(analysis_files),
            'sample_companies': sample_companies,
            'instructions': {
                'step1': 'Get the Google Spreadsheet URL (must be publicly viewable)',
                'step2': 'Call /sync_spreadsheet?url=YOUR_SPREADSHEET_URL',
                'step3': 'The system will fetch all submissions and generate analyses for new companies'
            },
            'note': 'Currently have 39 analyses, expecting 63 from spreadsheet (24 missing)'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/generate_analysis')
@login_required
def generate_analysis():
    """Generate analysis for all companies in the CSV"""
    try:
        submissions = process_submissions()
        return jsonify({
            'status': 'success',
            'message': f'Generated analysis for {len(submissions)} companies',
            'companies': [s.get('company_name', 'Unknown') for s in submissions]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/generate_single/<company_name>')
@login_required
def generate_single_analysis(company_name):
    """Generate analysis for a single company"""
    try:
        # Read CSV and find the company
        with open(CSV_PATH, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row['Company Name'].lower().replace(' ', '_') == company_name.lower():
                    analysis = analyze_submission(row)
                    
                    # Save analysis
                    analysis_file = ANALYSIS_DIR / f"{company_name.lower()}_analysis.json"
                    with open(analysis_file, 'w', encoding='utf-8') as f:
                        json.dump(analysis, f, indent=2)
                    
                    return jsonify({
                        'status': 'success',
                        'message': f'Generated analysis for {row["Company Name"]}',
                        'company': row['Company Name']
                    })
        
        return jsonify({
            'status': 'error',
            'message': f'Company {company_name} not found in CSV'
        }), 404
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def start_server(host='127.0.0.1', port=5000, debug=False):
    """Start the Flask web server"""
    setup_directories()
    print(f"Starting web server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

def main():
    parser = argparse.ArgumentParser(description='SemperVirens Accelerator Application Analysis')
    parser.add_argument('command', choices=['process', 'serve'], 
                       help='Command to run: "process" to analyze submissions or "serve" to start web server')
    parser.add_argument('--host', default='127.0.0.1', help='Host address for web server')
    parser.add_argument('--port', type=int, default=5000, help='Port for web server')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode for web server')
    
    args = parser.parse_args()
    
    if args.command == 'process':
        process_submissions()
    elif args.command == 'serve':
        start_server(host=args.host, port=args.port, debug=args.debug)

@app.errorhandler(500)
def internal_server_error(e):
    """Handle internal server errors"""
    print(f"Internal Server Error: {str(e)}")
    return render_template('error.html', 
                          company_name="Unknown", 
                          error_message="An internal server error occurred. Please try again later.",
                          tried_filenames=[],
                          available_files=[f.name for f in ANALYSIS_DIR.glob('*_analysis.json')]), 500

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    print(f"Page Not Found: {str(e)}")
    return render_template('error.html', 
                          company_name="Unknown", 
                          error_message="The requested page was not found.",
                          tried_filenames=[],
                          available_files=[f.name for f in ANALYSIS_DIR.glob('*_analysis.json')]), 404

# For Vercel deployment
app_instance = app

print("sva.py module loaded successfully")

if __name__ == "__main__":
    main()
