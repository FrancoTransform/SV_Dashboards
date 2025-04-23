
# SemperVirens Accelerator Application Analysis Script (MVP)

import csv
import os
from datetime import datetime
from pathlib import Path
import json
from openai import OpenAI
from flask import Flask, render_template, jsonify
import argparse

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
def submission_detail(company_name):
    """Display detailed analysis for a specific submission"""
    print(f"\n=== Submission Detail Request ===")
    print(f"Requested company_name: '{company_name}'")
    
    # Try both normalized and original versions
    normalized_name = normalize_company_name(company_name)
    possible_filenames = [
        f"{normalized_name}_analysis.json",
        f"{company_name.lower()}_analysis.json"
    ]
    
    for filename in possible_filenames:
        analysis_file = ANALYSIS_DIR / filename
        print(f"Looking for file: {analysis_file}")
        
        if analysis_file.exists():
            print(f"Found file: {analysis_file}")
            with open(analysis_file, 'r', encoding='utf-8') as f:
                analysis = json.load(f)
                # Add debug output
                print("Loaded analysis data:")
                print(f"SV Thesis Fit keys: {analysis.get('sv_thesis_fit', {}).keys()}")
                
                # Ensure required sections exist
                if 'final_recommendation' not in analysis:
                    analysis['final_recommendation'] = {
                        'status': 'Pending',
                        'rationale': 'Final recommendation is pending review.'
                    }
                    
                return render_template('detail.html', analysis=analysis)
    
    print(f"No analysis file found for company: {company_name}")
    return f"Analysis not found for company: {company_name}", 404

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

if __name__ == "__main__":
    main()
