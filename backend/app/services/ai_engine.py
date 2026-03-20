import math
import json
import re
from datetime import datetime, timedelta
import requests

class AIEngine:
    """AI Cost & Timeline Prediction Engine using Groq API"""
    
    GROQ_API_KEY = "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"
    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    GROQ_MODEL = "llama-3.3-70b-versatile"
    
    API_CALL_COUNT = 0
    API_SUCCESS_COUNT = 0
    API_FAIL_COUNT = 0
    
    LOCATION_MULTIPLIERS = {'tier1': 1.3, 'tier2': 1.1, 'tier3': 1.0, 'rural': 0.9}
    BASE_COST_PER_SQFT = {'basic': 850, 'standard': 1250, 'premium': 1900}
    MATERIAL_RATIO = 0.55
    LABOR_RATIO = 0.30
    EQUIPMENT_RATIO = 0.10
    MISC_RATIO = 0.05
    WORKERS_PER_1000_SQFT = 8
    BASE_DAYS_PER_1000_SQFT = 15

    @staticmethod
    def test_connection():
        """Test if Groq API is accessible"""
        print("\n" + "="*50)
        print("TESTING GROQ API CONNECTION")
        print("="*50)
        print(f"API Key: {AIEngine.GROQ_API_KEY[:20]}...")
        print(f"Endpoint: {AIEngine.GROQ_API_URL}")
        print(f"Model: {AIEngine.GROQ_MODEL}")
        
        test_messages = [{"role": "user", "content": "Say 'API is working' if you receive this"}]
        
        try:
            response = AIEngine.call_grok_api(test_messages, temperature=0.1)
            if response:
                print(f"✅ SUCCESS! Response: {response}")
                return True
            else:
                print("❌ FAILED! No response")
                return False
        except Exception as e:
            print(f"❌ ERROR: {e}")
            return False

    @staticmethod
    def call_grok_api(messages, temperature=0.7):
        """Call Groq API"""
        AIEngine.API_CALL_COUNT += 1
        call_num = AIEngine.API_CALL_COUNT
        
        headers = {
            "Authorization": f"Bearer {AIEngine.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messages": messages,
            "model": AIEngine.GROQ_MODEL,
            "temperature": temperature,
            "max_tokens": 4000
        }
        
        print(f"\n📡 [Call #{call_num}] Calling Groq API...")
        
        try:
            response = requests.post(AIEngine.GROQ_API_URL, headers=headers, json=payload, timeout=60)
            print(f"📨 Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                AIEngine.API_SUCCESS_COUNT += 1
                print(f"✅ SUCCESS! Got response ({len(content)} chars)")
                return content
            else:
                AIEngine.API_FAIL_COUNT += 1
                print(f"❌ HTTP {response.status_code}: {response.text[:200]}")
                return None
        except Exception as e:
            AIEngine.API_FAIL_COUNT += 1
            print(f"💥 ERROR: {e}")
            return None
    
    @staticmethod
    def extract_json(text):
        """Extract JSON from text"""
        if not text:
            return None
        text = text.strip()
        if text.startswith('```'):
            lines = text.split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]
            text = '\n'.join(lines)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', text)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except:
                    pass
        return None
    
    @staticmethod
    def detect_location_tier(location):
        """Auto-detect location tier"""
        if not location:
            return 'tier3'
        tier1 = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune']
        tier2 = ['jaipur', 'lucknow', 'chandigarh', 'kochi', 'nagpur', 'indore']
        loc_lower = location.lower()
        for city in tier1:
            if city in loc_lower:
                return 'tier1'
        for city in tier2:
            if city in loc_lower:
                return 'tier2'
        return 'tier3'
    
    @classmethod
    def analyze_project(cls, data, progress_callback=None, verbose=True):
        """MAIN METHOD: Analyze project using Groq AI"""
        def update_progress(percent, message):
            if progress_callback:
                progress_callback(percent, message)
            if verbose:
                print(f"[{percent}%] {message}")
        
        update_progress(5, "Starting analysis...")
        
        project_name = data.get('projectName', 'Untitled Project')
        location = data.get('location', 'Unknown')
        area = float(data.get('area', 0))
        rooms = int(data.get('rooms', 0))
        floors = int(data.get('floors', 1))
        budget = float(data.get('budget', 0))
        material_quality = data.get('materialQuality', 'standard')
        construction_type = data.get('constructionType', 'contractor')
        project_type = data.get('projectType', 'House')
        parking = data.get('parking', False)
        garden = data.get('garden', False)
        smart_home = data.get('smartHome', False)
        
        update_progress(10, f"Project: {area} sq ft {project_type} in {location}")
        
        if area <= 0:
            area = 1000
        
        base_cost_per_sqft = cls.BASE_COST_PER_SQFT.get(material_quality, 1250)
        total_cost = int(area * base_cost_per_sqft)
        location_tier = cls.detect_location_tier(location)
        total_days = int((area / 1000) * 15 * (1 + (floors - 1) * 0.25))
        workers = math.ceil((area / 1000) * 8)
        
        prompt = f"""You are an expert construction cost estimator for India. Return ONLY valid JSON.

Project Details:
- Name: {project_name}
- Type: {project_type}
- Location: {location}
- Area: {area} sq ft
- Rooms: {rooms}
- Floors: {floors}
- Budget: Rs{budget:,.0f}
- Quality: {material_quality}
- Model: {construction_type}
- Parking: {'Yes' if parking else 'No'}
- Garden: {'Yes' if garden else 'No'}
- Smart Home: {'Yes' if smart_home else 'No'}

Calculate estimates:
- Total Cost: Rs{total_cost:,}
- Location Tier: {location_tier}
- Timeline: {total_days} days
- Workers: {workers}

Return this JSON (fill in the values):
{{
    "cost": {{
        "totalCost": {total_cost},
        "costPerSqFt": {base_cost_per_sqft},
        "breakdown": {{
            "material": {int(total_cost * 0.55)},
            "labor": {int(total_cost * 0.30)},
            "equipment": {int(total_cost * 0.10)},
            "miscellaneous": {int(total_cost * 0.05)},
            "addons": {int(area * 50) if parking else 0}
        }},
        "factors": {{
            "locationTier": "{location_tier}",
            "marketConditions": "Indian construction rates",
            "pricingFactors": ["Location", "Quality", "Floors"]
        }}
    }},
    "timeline": {{
        "totalDays": {total_days},
        "totalWeeks": {round(total_days / 7, 1)},
        "totalMonths": {round(total_days / 30, 1)},
        "workersNeeded": {workers},
        "phases": [
            {{"name": "Site Preparation", "duration": {int(total_days * 0.08)}, "cost": {int(total_cost * 0.08)}, "startDay": 1, "endDay": {int(total_days * 0.08)}, "description": "Excavation and clearing"}},
            {{"name": "Foundation", "duration": {int(total_days * 0.15)}, "cost": {int(total_cost * 0.15)}, "startDay": {int(total_days * 0.08) + 1}, "endDay": {int(total_days * 0.23)}, "description": "Foundation work"}},
            {{"name": "Structure", "duration": {int(total_days * 0.25)}, "cost": {int(total_cost * 0.25)}, "startDay": {int(total_days * 0.23) + 1}, "endDay": {int(total_days * 0.48)}, "description": "Walls and columns"}},
            {{"name": "Roofing", "duration": {int(total_days * 0.15)}, "cost": {int(total_cost * 0.15)}, "startDay": {int(total_days * 0.48) + 1}, "endDay": {int(total_days * 0.63)}, "description": "Roof construction"}},
            {{"name": "Finishing", "duration": {int(total_days * 0.37)}, "cost": {int(total_cost * 0.37)}, "startDay": {int(total_days * 0.63) + 1}, "endDay": {total_days}, "description": "Plastering and painting"}}
        ]
    }},
    "risks": [
        {{"type": "medium", "category": "budget", "message": "Track expenses weekly", "suggestion": "Maintain buffer fund"}},
        {{"type": "low", "category": "timeline", "message": "Weather may cause delays", "suggestion": "Plan for monsoon"}}
    ],
    "recommendations": [
        {{"type": "cost", "icon": "money", "title": "Cost Tips", "suggestions": ["Buy in bulk", "Compare prices", "Off-season purchase"]}},
        {{"type": "time", "icon": "clock", "title": "Speed Tips", "suggestions": ["Pre-order materials", "Hire skilled workers", "Parallel tasks"]}},
        {{"type": "quality", "icon": "star", "title": "Quality Tips", "suggestions": ["Branded cement", "Quality steel", "Supervision"]}}
    ],
    "resourceOptimization": {{
        "workers": {{"total": {workers}, "breakdown": {{"masons": {math.ceil(workers * 0.3)}, "helpers": {math.ceil(workers * 0.5)}, "supervisors": {max(1, math.ceil(workers * 0.1))}}}, "costPerDay": {workers * 800}, "totalLaborCost": {workers * 800 * total_days}}},
        "equipment": [
            {{"name": "Concrete Mixer", "quantity": 1, "rentPerDay": 800, "totalDays": {total_days}, "totalCost": {800 * total_days}}}
        ],
        "materials": {{
            "cement": {{"brand": "ACC", "bags": {math.ceil(area * 0.45)}, "cost": {math.ceil(area * 0.45) * 350}}},
            "steel": {{"grade": "Fe 500D", "tons": {round(area * 0.003, 2)}, "cost": {round(area * 0.003, 2) * 65000}}},
            "bricks": {{"type": "Fly Ash", "count": {math.ceil(area * 7)}, "cost": {(math.ceil(area * 7) / 1000) * 6000}}},
            "sand": {{"type": "River Sand", "cuft": {math.ceil(area * 0.5)}, "cost": {math.ceil(area * 0.5) * 55}}},
            "aggregate": {{"type": "20mm", "cuft": {math.ceil(area * 0.3)}, "cost": {math.ceil(area * 0.3) * 40}}}
        }},
        "totalResourceCost": {int(total_cost * 0.6)}
    }},
    "summary": {{
        "projectViability": "viable",
        "budgetSufficiency": "sufficient" if budget >= total_cost else "needs_adjustment",
        "timelineFeasibility": "feasible",
        "overallAssessment": "{project_type} in {location} - Rs{total_cost:,}"
    }}
}}"""
        
        messages = [
            {"role": "system", "content": "You are a construction expert. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]
        
        update_progress(30, "Calling AI API...")
        response = cls.call_grok_api(messages, temperature=0.3)
        
        if response:
            update_progress(60, "Processing AI response...")
            result = cls.extract_json(response)
            
            if result:
                update_progress(90, "Validating data...")
                update_progress(100, "Analysis complete via AI!")
                print(f"\n📊 API: Success {cls.API_SUCCESS_COUNT}/{cls.API_CALL_COUNT}")
                return result
            else:
                print("\n⚠️ Could not parse AI response")
        
        update_progress(50, "Using fallback calculation...")
        result = cls._fallback_analysis(data)
        update_progress(100, "Analysis complete (fallback)")
        return result
    
    @classmethod
    def _fallback_analysis(cls, data):
        """Fallback if API fails"""
        area = float(data.get('area', 1000))
        material_quality = data.get('materialQuality', 'standard')
        location = data.get('location', '')
        floors = int(data.get('floors', 1))
        budget = float(data.get('budget', 0))
        parking = data.get('parking', False)
        
        base_cost = cls.BASE_COST_PER_SQFT.get(material_quality, 1250)
        total_cost = area * base_cost
        location_tier = cls.detect_location_tier(location)
        total_days = int((area / 1000) * 15 * (1 + (floors - 1) * 0.25))
        workers = math.ceil((area / 1000) * 8)
        
        return {
            'cost': {
                'totalCost': round(total_cost, 2),
                'costPerSqFt': round(total_cost / area, 2),
                'breakdown': {'material': total_cost * 0.55, 'labor': total_cost * 0.30, 'equipment': total_cost * 0.10, 'miscellaneous': total_cost * 0.05, 'addons': area * 50 if parking else 0},
                'factors': {'locationTier': location_tier, 'marketConditions': 'Indian rates', 'pricingFactors': ['Location', 'Quality']}
            },
            'timeline': {'totalDays': total_days, 'totalWeeks': round(total_days / 7, 1), 'totalMonths': round(total_days / 30, 1), 'workersNeeded': workers, 'phases': []},
            'risks': [{'type': 'medium', 'category': 'budget', 'message': 'Track expenses', 'suggestion': 'Maintain buffer'}],
            'recommendations': [{'type': 'cost', 'icon': 'money', 'title': 'Cost Tips', 'suggestions': ['Buy in bulk']}],
            'resourceOptimization': {
                'workers': {'total': workers, 'breakdown': {'masons': math.ceil(workers * 0.3), 'helpers': math.ceil(workers * 0.5), 'supervisors': 1}, 'costPerDay': workers * 800, 'totalLaborCost': workers * 800 * total_days},
                'equipment': [{'name': 'Concrete Mixer', 'quantity': 1, 'rentPerDay': 800, 'totalDays': total_days, 'totalCost': 800 * total_days}],
                'materials': {'cement': {'brand': 'ACC', 'bags': math.ceil(area * 0.45), 'cost': math.ceil(area * 0.45) * 350}},
                'totalResourceCost': total_cost * 0.6
            },
            'summary': {'projectViability': 'viable', 'budgetSufficiency': 'sufficient' if budget >= total_cost else 'needs_adjustment', 'timelineFeasibility': 'feasible', 'overallAssessment': f'Construction for {area} sq ft'}
        }
    
    @classmethod
    def predict_cost(cls, data):
        result = cls.analyze_project(data, verbose=False)
        return result['cost']
    
    @classmethod
    def predict_timeline(cls, data, estimated_cost=None):
        result = cls.analyze_project(data, verbose=False)
        return result['timeline']
    
    @classmethod
    def detect_risks(cls, data, estimated_cost, budget):
        result = cls.analyze_project(data, verbose=False)
        return result.get('risks', [])
    
    @classmethod
    def get_recommendations(cls, data, estimated_cost, budget):
        result = cls.analyze_project(data, verbose=False)
        return result.get('recommendations', [])
    
    @classmethod
    def optimize_resources(cls, data, estimated_cost, timeline_days):
        result = cls.analyze_project(data, verbose=False)
        resources = result.get('resourceOptimization', {})
        if not isinstance(resources, dict):
            resources = {'workers': {}, 'equipment': [], 'materials': {}, 'totalResourceCost': 0}
        return {
            'workers': resources.get('workers', {}),
            'equipment': resources.get('equipment', []),
            'materials': resources.get('materials', {}),
            'tradeoffs': cls.analyze_tradeoffs(float(data.get('area', 0)), float(data.get('budget', 0)), timeline_days),
            'summary': {'totalResourceCost': resources.get('totalResourceCost', 0), 'efficiencyScore': cls.calculate_efficiency(float(data.get('area', 0)), resources.get('workers', {}).get('total', 10), timeline_days), 'optimizationTips': cls.get_optimization_tips(float(data.get('area', 0)), float(data.get('budget', 0)))}
        }
    
    @classmethod
    def optimize_workers(cls, area, timeline_days, budget):
        base_workers = math.ceil((area / 1000) * cls.WORKERS_PER_1000_SQFT)
        return {'baseWorkers': base_workers, 'recommendedWorkers': base_workers, 'minWorkers': math.ceil(base_workers * 0.7), 'maxWorkers': base_workers * 1.5, 'costPerDayPerWorker': 800, 'totalCost': base_workers * 800 * timeline_days, 'phases': []}
    
    @classmethod
    def optimize_equipment(cls, area, floors, timeline_days):
        return {'equipment': [{'name': 'Concrete Mixer', 'quantity': 1, 'costPerDay': 800, 'totalCost': 800 * timeline_days}], 'totalCost': 800 * timeline_days, 'recommendation': 'Equipment rental recommended'}
    
    @classmethod
    def optimize_materials(cls, data):
        quality = data.get('materialQuality', 'standard')
        area = float(data.get('area', 0))
        return {'materials': {'cement': {'specification': {'brand': 'ACC'}, 'estimatedCost': area * 0.45 * 350}}, 'totalEstimatedCost': area * 1250 * 0.55, 'supplierRecommendations': ['Source from authorized dealers']}
    
    @classmethod
    def analyze_tradeoffs(cls, area, budget, timeline_days):
        return [{'scenario': 'Budget Priority', 'icon': 'money', 'adjustments': {'quality': 'basic', 'workers': math.ceil(area * 8 / 1000 * 0.8), 'timeline': '+25%'}, 'pros': ['Lower cost'], 'cons': ['Longer time'], 'savings': '15-20%'}, {'scenario': 'Time Priority', 'icon': 'clock', 'adjustments': {'quality': 'standard', 'workers': math.ceil(area * 8 / 1000 * 1.5), 'timeline': '-30%'}, 'pros': ['Faster'], 'cons': ['Higher cost'], 'extraCost': '15-20%'}]
    
    @classmethod
    def calculate_efficiency(cls, area, workers, timeline_days):
        return {'overallScore': 75, 'workerEfficiency': 80, 'timeEfficiency': 70, 'rating': 'Good'}
    
    @classmethod
    def get_optimization_tips(cls, area, budget):
        return [{'priority': 'high', 'tip': 'Pre-order materials'}, {'priority': 'medium', 'tip': 'Schedule deliveries'}]
    
    @classmethod
    def simulate_scenario(cls, data, changes):
        modified_data = data.copy()
        modified_data.update(changes)
        result = cls.analyze_project(modified_data, verbose=False)
        original = cls.analyze_project(data, verbose=False)
        return {'scenario': changes, 'results': {'newCost': result['cost']['totalCost'], 'newTimeline': result['timeline']['totalDays']}, 'comparison': {'costChange': result['cost']['totalCost'] - original['cost']['totalCost']}}
    
    @classmethod
    def get_api_stats(cls):
        return {'total_calls': cls.API_CALL_COUNT, 'successful_calls': cls.API_SUCCESS_COUNT, 'failed_calls': cls.API_FAIL_COUNT}
    
    @classmethod
    def reset_api_stats(cls):
        cls.API_CALL_COUNT = 0
        cls.API_SUCCESS_COUNT = 0
        cls.API_FAIL_COUNT = 0


def test_ai_engine():
    print("="*60)
    print("TESTING GROQ API")
    print("="*60)
    
    print("\n1. Testing API Connection...")
    AIEngine.test_connection()
    
    print("\n2. Testing Project Analysis...")
    test_data = {
        'projectName': 'Dream House',
        'location': 'Mumbai',
        'area': 2000,
        'rooms': 4,
        'floors': 2,
        'budget': 3000000,
        'materialQuality': 'standard',
        'constructionType': 'contractor',
        'projectType': 'House',
        'parking': True,
        'garden': True,
        'smartHome': False
    }
    
    result = AIEngine.analyze_project(test_data)
    
    print("\n📊 RESULT:")
    print(f"   Total Cost: Rs{result['cost']['totalCost']:,.0f}")
    print(f"   Timeline: {result['timeline']['totalDays']} days")
    print(f"   Workers: {result['timeline']['workersNeeded']}")
    
    print("\n📈 API STATS:")
    stats = AIEngine.get_api_stats()
    print(f"   Total: {stats['total_calls']}, Success: {stats['successful_calls']}, Failed: {stats['failed_calls']}")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    test_ai_engine()
