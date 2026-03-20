from flask import Blueprint, request, jsonify
from app.services.ai_engine import AIEngine

project_bp = Blueprint('project', __name__)

@project_bp.route('/api-stats', methods=['GET'])
def get_api_stats():
    """Get Grok API usage statistics"""
    return jsonify({
        'success': True,
        'stats': AIEngine.get_api_stats()
    })

@project_bp.route('/analyze-project', methods=['POST'])
def analyze_project():
    """Full project analysis using Grok AI"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        result = AIEngine.analyze_project(data)
        return jsonify({
            'success': True,
            'analysis': result,
            'api_stats': AIEngine.get_api_stats()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@project_bp.route('/create-project', methods=['POST'])
def create_project():
    """Create a new project and run AI analysis"""
    data = request.json
    
    # Validate required fields
    required = ['area', 'budget']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        # Run AI Cost Prediction
        cost_result = AIEngine.predict_cost(data)
        
        # Run AI Timeline Prediction
        timeline_result = AIEngine.predict_timeline(data, cost_result['totalCost'])
        
        # Detect Risks
        risks = AIEngine.detect_risks(
            data, 
            cost_result['totalCost'],
            data.get('budget')
        )
        
        # Get Recommendations
        recommendations = AIEngine.get_recommendations(
            data,
            cost_result['totalCost'],
            data.get('budget')
        )
        
        # PART 3: Resource Optimization
        resource_optimization = AIEngine.optimize_resources(
            data,
            cost_result['totalCost'],
            timeline_result['totalDays']
        )
        
        # Save project to database
        project_id = None
        user_id = data.get('user_id')
        
        if user_id:
            try:
                from app.database import get_db
                import uuid
                
                project_id = f"PRJ-{uuid.uuid4().hex[:12].upper()}"
                
                with get_db() as conn:
                    cursor = conn.cursor()
                    cursor.execute('''
                        INSERT INTO projects 
                        (user_id, project_id, name, location, project_type, area, budget, 
                         material_quality, construction_type, status, total_cost, timeline_days,
                         start_date, deadline, parking, garden, smart_home)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        user_id,
                        project_id,
                        data.get('projectName', 'Untitled Project'),
                        data.get('location', ''),
                        data.get('projectType', 'House'),
                        float(data.get('area', 0)),
                        float(data.get('budget', 0)),
                        data.get('materialQuality', 'standard'),
                        data.get('constructionType', 'contractor'),
                        'planning',
                        cost_result['totalCost'],
                        timeline_result['totalDays'],
                        data.get('startDate', ''),
                        data.get('deadline', ''),
                        1 if data.get('parking') else 0,
                        1 if data.get('garden') else 0,
                        1 if data.get('smartHome') else 0
                    ))
                    
                    # Create initial milestones
                    for i, phase in enumerate(timeline_result.get('phases', [])):
                        cursor.execute('''
                            INSERT INTO milestones (project_id, name, phase_index, status, start_day, end_day)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (
                            project_id,
                            phase.get('name', f'Phase {i+1}'),
                            i,
                            'pending',
                            phase.get('startDay', i * 30 + 1),
                            phase.get('endDay', (i + 1) * 30)
                        ))
                    
                    # Create notification for user
                    cursor.execute('''
                        INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                        VALUES (?, ?, 'system', 'Project Created', ?)
                    ''', (user_id, project_id, f'Your project "{data.get("projectName", "Untitled")}" has been created successfully.'))
                    
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Continue without saving - still return analysis results
        
        return jsonify({
            'success': True,
            'project_id': project_id,
            'project': {
                **data,
                'ai_estimated_cost': cost_result['totalCost'],
                'ai_estimated_timeline': timeline_result['totalDays']
            },
            'analysis': {
                'cost': cost_result,
                'timeline': timeline_result,
                'risks': risks,
                'recommendations': recommendations,
                'resourceOptimization': resource_optimization
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/predict-cost', methods=['POST'])
def predict_cost():
    """Get cost prediction only"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        result = AIEngine.predict_cost(data)
        return jsonify({
            'success': True,
            'cost': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/predict-timeline', methods=['POST'])
def predict_timeline():
    """Get timeline prediction only"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        # Need cost for timeline
        cost_result = AIEngine.predict_cost(data)
        result = AIEngine.predict_timeline(data, cost_result['totalCost'])
        
        return jsonify({
            'success': True,
            'timeline': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/detect-risks', methods=['POST'])
def detect_risks():
    """Detect project risks"""
    data = request.json
    
    if not data.get('area') or not data.get('budget'):
        return jsonify({'error': 'area and budget are required'}), 400
    
    try:
        cost_result = AIEngine.predict_cost(data)
        risks = AIEngine.detect_risks(data, cost_result['totalCost'], data.get('budget'))
        
        return jsonify({
            'success': True,
            'risks': risks
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/simulate', methods=['POST'])
def simulate():
    """Simulate 'what-if' scenarios"""
    data = request.json
    changes = request.json.get('changes', {})
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        result = AIEngine.simulate_scenario(data, changes)
        
        return jsonify({
            'success': True,
            'simulation': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/recommendations', methods=['POST'])
def recommendations():
    """Get smart recommendations"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        cost_result = AIEngine.predict_cost(data)
        recs = AIEngine.get_recommendations(
            data, 
            cost_result['totalCost'],
            data.get('budget')
        )
        
        return jsonify({
            'success': True,
            'recommendations': recs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/phases', methods=['POST'])
def get_phases():
    """Get phase-wise breakdown"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        cost_result = AIEngine.predict_cost(data)
        timeline = AIEngine.predict_timeline(data, cost_result['totalCost'])
        
        return jsonify({
            'success': True,
            'phases': timeline.get('phases', []),
            'summary': {
                'totalDays': timeline.get('totalDays'),
                'totalCost': cost_result['totalCost']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/optimize', methods=['POST'])
def optimize():
    """Get optimization suggestions"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        cost_result = AIEngine.predict_cost(data)
        timeline_result = AIEngine.predict_timeline(data, cost_result['totalCost'])
        
        # Generate optimization scenarios
        scenarios = []
        
        # Scenario 1: More workers = faster
        fast_scenario = AIEngine.simulate_scenario(data, {'quickDeadline': True})
        scenarios.append({
            'name': 'Faster Completion',
            'description': 'Add more workers to speed up',
            'result': fast_scenario
        })
        
        # Scenario 2: Lower quality = cheaper
        cheap_scenario = AIEngine.simulate_scenario(data, {'materialQuality': 'basic'})
        scenarios.append({
            'name': 'Cost Reduction',
            'description': 'Switch to basic materials',
            'result': cheap_scenario
        })
        
        # Scenario 3: Hybrid model
        hybrid_scenario = AIEngine.simulate_scenario(data, {'constructionType': 'hybrid'})
        scenarios.append({
            'name': 'Hybrid Model',
            'description': 'Split material responsibility',
            'result': hybrid_scenario
        })
        
        return jsonify({
            'success': True,
            'current': {
                'cost': cost_result['totalCost'],
                'timeline': timeline_result['totalDays'],
                'workers': timeline_result['workersNeeded']
            },
            'scenarios': scenarios
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =====================================================
# PART 3: RESOURCE OPTIMIZATION ENDPOINTS
# =====================================================

@project_bp.route('/resource-optimization', methods=['POST'])
def resource_optimization():
    """PART 3: Get complete resource optimization plan"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        cost_result = AIEngine.predict_cost(data)
        timeline_result = AIEngine.predict_timeline(data, cost_result['totalCost'])
        
        resources = AIEngine.optimize_resources(
            data,
            cost_result['totalCost'],
            timeline_result['totalDays']
        )
        
        return jsonify({
            'success': True,
            'projectSummary': {
                'area': data.get('area'),
                'estimatedCost': cost_result['totalCost'],
                'timeline': timeline_result['totalDays'],
                'workers': timeline_result['workersNeeded']
            },
            'resourceOptimization': resources
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/worker-plan', methods=['POST'])
def worker_plan():
    """PART 3: Get detailed worker optimization plan"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        cost_result = AIEngine.predict_cost(data)
        timeline_result = AIEngine.predict_timeline(data, cost_result['totalCost'])
        budget = float(data.get('budget', 0))
        
        workers = AIEngine.optimize_workers(
            data.get('area'),
            timeline_result['totalDays'],
            budget
        )
        
        return jsonify({
            'success': True,
            'workers': workers
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/equipment-plan', methods=['POST'])
def equipment_plan():
    """PART 3: Get equipment optimization plan"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        cost_result = AIEngine.predict_cost(data)
        timeline_result = AIEngine.predict_timeline(data, cost_result['totalCost'])
        
        equipment = AIEngine.optimize_equipment(
            data.get('area'),
            int(data.get('floors', 1)),
            timeline_result['totalDays']
        )
        
        return jsonify({
            'success': True,
            'equipment': equipment
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/material-plan', methods=['POST'])
def material_plan():
    """PART 3: Get material optimization plan"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        materials = AIEngine.optimize_materials(data)
        
        return jsonify({
            'success': True,
            'materials': materials
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/tradeoffs', methods=['POST'])
def tradeoffs():
    """PART 3: Analyze cost vs time vs quality tradeoffs"""
    data = request.json
    
    if not data.get('area'):
        return jsonify({'error': 'area is required'}), 400
    
    try:
        budget = float(data.get('budget', 0))
        timeline = int(data.get('timeline', 100))
        
        tradeoffs = AIEngine.analyze_tradeoffs(
            data.get('area'),
            budget,
            timeline
        )
        
        return jsonify({
            'success': True,
            'tradeoffs': tradeoffs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/update-project', methods=['POST'])
def update_project():
    """Update an existing project"""
    data = request.json
    
    if not data.get('project_id'):
        return jsonify({'error': 'project_id is required'}), 400
    
    try:
        from app.database import get_db
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if project exists
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (data['project_id'],))
            project = cursor.fetchone()
            
            if not project:
                return jsonify({'error': 'Project not found'}), 404
            
            # Build update query
            update_fields = []
            update_values = []
            
            # Map frontend camelCase to backend snake_case
            field_mapping = {
                'name': 'name',
                'location': 'location',
                'projectType': 'project_type',
                'area': 'area',
                'budget': 'budget',
                'materialQuality': 'material_quality',
                'constructionType': 'construction_type',
                'startDate': 'start_date',
                'deadline': 'deadline',
                'status': 'status',
                'parking': 'parking',
                'garden': 'garden',
                'smartHome': 'smart_home'
            }
            
            for camel_field, snake_field in field_mapping.items():
                if data.get(camel_field) is not None:
                    update_fields.append(f"{snake_field} = ?")
                    if snake_field in ['parking', 'garden', 'smart_home']:
                        update_values.append(1 if data[camel_field] else 0)
                    else:
                        update_values.append(data[camel_field])
            
            if update_fields:
                update_fields.append('updated_at = CURRENT_TIMESTAMP')
                update_values.append(data['project_id'])
                cursor.execute(f"UPDATE projects SET {', '.join(update_fields)} WHERE project_id = ?", update_values)
                
                # Create notification
                cursor.execute('''
                    INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                    VALUES (?, ?, 'system', 'Project Updated', ?)
                ''', (project['user_id'], data['project_id'], 'Your project has been updated successfully.'))
        
        return jsonify({
            'success': True,
            'message': 'Project updated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/complete-project', methods=['POST'])
def complete_project():
    """Mark a project as completed"""
    data = request.json
    
    if not data.get('project_id'):
        return jsonify({'error': 'project_id is required'}), 400
    
    try:
        from app.database import get_db
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if project exists
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (data['project_id'],))
            project = cursor.fetchone()
            
            if not project:
                return jsonify({'error': 'Project not found'}), 404
            
            # Update project status
            cursor.execute("""
                UPDATE projects 
                SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ?
            """, (data['project_id'],))
            
            # Update all milestones to completed
            cursor.execute("""
                UPDATE milestones 
                SET status = 'completed', progress = 100 
                WHERE project_id = ?
            """, (data['project_id'],))
            
            # Create notification
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'milestone', 'Project Completed!', ?)
            ''', (project['user_id'], data['project_id'], 'Congratulations! Your construction project has been completed.'))
            
            # Create activity
            cursor.execute('''
                INSERT INTO activities (project_id, activity_type, description)
                VALUES (?, 'milestone', 'Project marked as completed')
            ''', (data['project_id'],))
        
        return jsonify({
            'success': True,
            'message': 'Project marked as completed'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/uncomplete-project', methods=['POST'])
def uncomplete_project():
    """Mark a completed project back to in_progress"""
    data = request.json
    
    if not data.get('project_id'):
        return jsonify({'error': 'project_id is required'}), 400
    
    try:
        from app.database import get_db
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (data['project_id'],))
            project = cursor.fetchone()
            
            if not project:
                return jsonify({'error': 'Project not found'}), 404
            
            if project['status'] != 'completed':
                return jsonify({'error': 'Project is not completed'}), 400
            
            cursor.execute("""
                UPDATE projects 
                SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ?
            """, (data['project_id'],))
            
            cursor.execute("""
                UPDATE milestones 
                SET status = 'in_progress', progress = 50 
                WHERE project_id = ? AND status = 'completed'
            """, (data['project_id'],))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'milestone', 'Project Reopened', ?)
            ''', (project['user_id'], data['project_id'], 'Project has been reopened and marked as in progress.'))
            
            cursor.execute('''
                INSERT INTO activities (project_id, activity_type, description)
                VALUES (?, 'system', 'Project marked as not completed')
            ''', (data['project_id'],))
        
        return jsonify({
            'success': True,
            'message': 'Project reopened'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@project_bp.route('/start-project', methods=['POST'])
def start_project():
    """Start a project (change status to in_progress)"""
    data = request.json
    
    if not data.get('project_id'):
        return jsonify({'error': 'project_id is required'}), 400
    
    try:
        from app.database import get_db
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if project exists
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (data['project_id'],))
            project = cursor.fetchone()
            
            if not project:
                return jsonify({'error': 'Project not found'}), 404
            
            # Update project status
            cursor.execute("""
                UPDATE projects 
                SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ?
            """, (data['project_id'],))
            
            # Create project tracking entry
            cursor.execute("""
                INSERT OR IGNORE INTO project_tracking 
                (project_id, current_day, overall_progress, status)
                VALUES (?, 1, 0, 'in_progress')
            """, (data['project_id'],))
            
            # Create notification
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'milestone', 'Project Started', ?)
            ''', (project['user_id'], data['project_id'], 'Your project has started. Good luck!'))
            
            # Create activity
            cursor.execute('''
                INSERT INTO activities (project_id, activity_type, description)
                VALUES (?, 'milestone', 'Project started')
            ''', (data['project_id'],))
        
        return jsonify({
            'success': True,
            'message': 'Project started'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
