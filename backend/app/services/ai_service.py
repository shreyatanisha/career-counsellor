import google.generativeai as genai
import json
import re
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-flash-lite-latest')

INTAKE_SYSTEM_PROMPT = """
You are an empathetic career intake specialist. Ask ONE question per turn.

INTAKE SEQUENCE:
1. "What is your highest level of education and what did you study?"
2. "What have you worked on or studied that you genuinely enjoyed?"
3. "Describe a task or project where you felt most confident."
4. "What kind of work environment do you prefer? (remote/team/solo/field)"
5. "Do you have any constraints? (location, salary floor, timeline)"
6. "What is your single biggest career frustration right now?"

EXTRACTION RULES:
- After each answer, silently extract: skills[], interests[], constraints{}, personality_signals[]
- If an answer is vague, ask ONE clarifying follow-up before moving on
- Never ask more than 1 question per message
- If user volunteers info early, skip that question later

After question 6, output ONLY this JSON block (no extra text):
<profile>
{"education":"","skills":[],"interests":[],"personality":"",
"constraints":{"location":"","salary_min":"","timeline":""},
"frustration":"","readiness_score":0}
</profile>
"""

CAREER_MATCH_SYSTEM_PROMPT = """
You are a career matching engine. Analyse the profile and return ONLY this JSON.
Use Indian market salary data (NASSCOM, LinkedIn India, Naukri).
Return exactly 3 career matches ranked by fit score (0-100).

<career_matches>
[{"rank":1,"role":"","fit_score":0,"why_matched":"",
"salary_range_inr":{"min":0,"max":0},"growth_outlook":"High|Medium|Low",
"growth_reason":"","required_skills":[],"user_has":[],
"user_lacks":[],"time_to_job_ready":""}]
</career_matches>
"""

ROADMAP_SYSTEM_PROMPT = """
Generate a full career roadmap for the target role. Return ONLY this JSON.
Include both free and paid resources. Resources must be available in India.

<roadmap>
{"target_role":"","total_duration":"","milestones":[
{"phase":"Phase 1 — Foundation","timeframe":"0-3 months",
"goal":"","actions":[{"task":"","resource_free":"","resource_paid":"","hours_per_week":0}],
"measurable_outcome":"","checkpoint":""}],
"weekly_commitment_hours":0,"quick_win":"","biggest_risk":""}
</roadmap>
"""

GAP_ANALYSIS_SYSTEM_PROMPT = """
Analyse skill gaps and return ONLY this JSON. Classify each skill as
CRITICAL, IMPORTANT, or NICE-TO-HAVE. Max 8 gaps total.
Free resources: YouTube, NPTEL, freeCodeCamp only.
Paid resources: Coursera, Udemy, NPTEL Premium, UpGrad only.

<gap_analysis>
{"role":"","gaps":[{"skill":"","priority":"CRITICAL|IMPORTANT|NICE-TO-HAVE",
"why_needed":"","current_level":"None|Beginner|Intermediate",
"target_level":"Intermediate|Advanced","estimated_hours":0,
"learn_free":{"name":"","url":"","duration":""},
"learn_paid":{"name":"","platform":"","cost_inr":0,"duration":""},
"practice_project":""}],
"total_gap_hours":0,"fastest_path":"","certification_priority":""}
</gap_analysis>
"""

FEEDBACK_SYSTEM_PROMPT = """
You are a progress coach. Analyse completion rate and return ONLY this JSON.
Mode rules: <50% = REPLAN, 50-80% = NUDGE, >80% = ACCELERATE.

<progress_report>
{"check_in_date":"","completion_rate":0,"mode":"REPLAN|NUDGE|ACCELERATE",
"mood_trend":"","next_action":"","updated_eta":"",
"encouragement":"","specific_feedback":""}
</progress_report>
"""

def extract_json_from_tag(text: str, tag: str):
    """Fallback JSON extractor if Gemini wraps it differently."""
    pattern = rf"<{tag}>(.*?)</{tag}>"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        raw_json = match.group(1).strip()
    else:
        raw_json = text.replace("```json", "").replace("```", "").strip()
        
    try:
        return json.loads(raw_json)
    except Exception as e:
        raise ValueError(f"Tag <{tag}> JSON parsing failed: {str(e)}\nRaw was: {raw_json}")


def __dict_to_gemini_history(history: list):
    res = []
    for msg in history:
        role = "model" if msg["role"] == "assistant" else "user"
        res.append({"role": role, "parts": [{"text": msg["content"]}]})
    return res


async def run_intake_turn(conversation_history: list, user_message: str) -> dict:
    conversation_history.append({"role": "user", "content": user_message})
    
    gemini_history = __dict_to_gemini_history(conversation_history)
    # Prepend system prompt to the first user message
    gemini_history[0]["parts"][0]["text"] = INTAKE_SYSTEM_PROMPT + "\\n\\nThe user says: " + gemini_history[0]["parts"][0]["text"]
    
    response = model.generate_content(gemini_history)
    assistant_message = response.text
    conversation_history.append({"role": "assistant", "content": assistant_message})
    
    is_complete = "<profile>" in assistant_message or '"readiness_score"' in assistant_message
    profile_data = None
    if is_complete:
        profile_data = extract_json_from_tag(assistant_message, "profile")
        
    return {"message": assistant_message, "is_complete": is_complete, "profile": profile_data, "history": conversation_history}


async def match_careers(profile: dict) -> list:
    prompt = CAREER_MATCH_SYSTEM_PROMPT + "\\n\\nProfile:\\n" + json.dumps(profile)
    response = model.generate_content(prompt)
    return extract_json_from_tag(response.text, "career_matches")


async def generate_roadmap(profile: dict, career: dict) -> dict:
    prompt = ROADMAP_SYSTEM_PROMPT + "\\n\\nProfile:\\n" + json.dumps(profile) + "\\n\\nTarget career:\\n" + json.dumps(career)
    response = model.generate_content(prompt)
    return extract_json_from_tag(response.text, "roadmap")


async def analyse_gaps(profile: dict, career: dict) -> dict:
    prompt = GAP_ANALYSIS_SYSTEM_PROMPT + f"\\n\\nUser skills: {career.get('user_has', [])}\\nMissing skills: {career.get('user_lacks', [])}\\nRole: {career.get('role', '')}"
    response = model.generate_content(prompt)
    return extract_json_from_tag(response.text, "gap_analysis")


async def run_feedback(roadmap: dict, completed: list, mood: int, blockers: list) -> dict:
    prompt = FEEDBACK_SYSTEM_PROMPT + f"\\n\\nRoadmap: {json.dumps(roadmap)}\\nCompleted: {json.dumps(completed)}\\nMood: {mood}\\nBlockers: {json.dumps(blockers)}"
    response = model.generate_content(prompt)
    return extract_json_from_tag(response.text, "progress_report")
