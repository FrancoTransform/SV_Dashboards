
# SemperVirens Accelerator Application Analysis Script (MVP)

import csv
import os
from datetime import datetime
from pathlib import Path
import json
from openai import OpenAI
from flask import Flask, render_template, jsonify, request, redirect, url_for, session, flash
import argparse
import secrets
from functools import wraps

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
app = Flask(__name__)
client = OpenAI()

# Add a secret key for session management
app.secret_key = secrets.token_hex(16)

# Password for accessing the site
SITE_PASSWORD = "S@V25"  # Change this to your desired password

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == SITE_PASSWORD:
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
    for directory in [DATA_DIR, TEMPLATE_DIR, OUTPUT_DIR, ANALYSIS_DIR]:
        directory.mkdir(exist_ok=True)

def analyze_submission(submission_data):
    """Process submission through OpenAI API to generate structured analysis"""
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

# Flask routes
@app.route('/')
@login_required
def index():
    """Display list of all submissions"""
    submissions = []
    print("\n=== Loading Submissions ===")
    print(f"Looking in: {ANALYSIS_DIR}")
    
    for file in ANALYSIS_DIR.glob('*_analysis.json'):
        print(f"\nProcessing file: {file}")
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict):
                original_name = data.get('company_name', '')
                data['url_company_name'] = original_name.replace(' ', '').replace('-', '').replace('_', '').lower()
                print(f"Company name processing:")
                print(f"  Original: '{original_name}'")
                print(f"  URL-safe: '{data['url_company_name']}'")
            submissions.append(data)
    
    print(f"\nTotal submissions: {len(submissions)}")
    print("=== End Loading ===\n")
    return render_template('index.html', submissions=submissions)

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
    
    # Try different possible filename variations
    possible_filenames = [
        f"{normalized_name}_analysis.json",
        f"{company_name.lower()}_analysis.json",
        f"{company_name.lower().replace(' ', '')}_analysis.json",
        f"{company_name.lower().replace(' ', '_')}_analysis.json",
        f"{company_name.lower().replace(' ', '-')}_analysis.json"
    ]
    
    # Comprehensive mapping of URL names to actual filenames
    special_cases = {
        # Companies with "AI" in the name
        "sunnyhealthai": "sunny_health_ai_analysis.json",
        "sunnyhealth": "sunny_health_ai_analysis.json",
        "sunny": "sunny_health_ai_analysis.json",
        "graphioai": "graphioai_analysis.json",
        "graphio": "graphioai_analysis.json",
        "graphio.ai": "graphioai_analysis.json",
        "logistifyai": "logistify_ai_analysis.json",
        "logistify": "logistify_ai_analysis.json",
        "borderlessai": "borderless_analysis.json",
        "borderless": "borderless_analysis.json",
        
        # Companies with spaces or special characters
        "voltahealth": "volta_health_analysis.json",
        "volta": "volta_health_analysis.json",
        "jogohealth": "jogohealth_analysis.json",
        "jogo": "jogohealth_analysis.json",
        "joyahealth": "joya_health_analysis.json",
        "joya": "joya_health_analysis.json",
        "defianthealth": "defianthealth_analysis.json",
        "defiant": "defianthealth_analysis.json",
        "blankslate": "blank_slate_technologies_analysis.json",
        "blankslatetech": "blank_slate_technologies_analysis.json",
        "blankslatetechnologies": "blank_slate_technologies_analysis.json",
        "virtualsapiens": "virtualsapiens_analysis.json",
        "mandalaforus": "mandalaforus_analysis.json",
        "mandalaforusinc": "mandalaforus_analysis.json",
        "mandala": "mandalaforus_analysis.json",
        "paramean": "paramean_solutions_analysis.json",
        "parameansolutions": "paramean_solutions_analysis.json",
        "doktorconnect": "doktorconnect_analysis.json",
        "hero": "hero_analysis.json",
        "clasp": "clasp_analysis.json",
        "clsp": "clasp_analysis.json",
        "cryptomate": "cryptomate_analysis.json",
        "beacon": "beacon_analysis.json",
        "aidora": "aidora_analysis.json",
        "ezra": "ezra_analysis.json",
        "gtmflow": "gtmflow_analysis.json",
        "smartheritance": "smartheritance_analysis.json",
        "guaranteedhealth": "guaranteed_health_inc_analysis.json",
        "guaranteedhealth,inc": "guaranteed_health_inc_analysis.json",
        "guaranteedhealthinc": "guaranteed_health_inc_analysis.json",
        "guaranteed": "guaranteed_health_inc_analysis.json",
        "keptinc": "kept_inc_analysis.json",
        "kept": "kept_inc_analysis.json",
        "wigglhealth": "wiggl_health_analysis.json",
        "wiggl": "wiggl_health_analysis.json",
        "lockwellinc": "lockwell_inc_analysis.json",
        "lockwell": "lockwell_inc_analysis.json"
    }
    
    if company_name.lower() in special_cases:
        possible_filenames.insert(0, special_cases[company_name.lower()])
    
    # Debug: Print all available analysis files
    print("Available analysis files:")
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

if __name__ == "__main__":
    main()
