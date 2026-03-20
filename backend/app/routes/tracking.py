from flask import Blueprint, request, jsonify
from app.database import get_db
from datetime import datetime

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/create', methods=['POST'])
def create_tracked_project():
    """Create a new tracked project"""
    data = request.json
    
    required = ['project_id', 'name', 'total_budget']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT id FROM project_tracking WHERE project_id = ?", (data['project_id'],))
            if cursor.fetchone():
                cursor.execute("SELECT * FROM projects WHERE project_id = ?", (data['project_id'],))
                existing = cursor.fetchone()
                return jsonify({
                    'success': True,
                    'message': 'Project already tracking',
                    'project': dict(existing)
                })
            
            cursor.execute('''
                INSERT INTO project_tracking 
                (project_id, current_day, overall_progress, workers_present)
                VALUES (?, ?, ?, ?)
            ''', (
                data['project_id'],
                1,
                0,
                data.get('workers_count', 10)
            ))
            
            for i, phase in enumerate(data.get('phases', [])):
                cursor.execute('''
                    INSERT INTO milestones (project_id, name, phase_index, status, start_day, end_day)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    data['project_id'],
                    phase.get('name', f'Phase {i+1}'),
                    i,
                    'pending',
                    phase.get('startDay', i * 30 + 1),
                    phase.get('endDay', (i + 1) * 30)
                ))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, notification_type, title, message)
                VALUES (?, 'milestone', 'Project Started', ?)
            ''', (data.get('user_id', 1), f'{data["name"]} tracking has begun'))
            
            cursor.execute('''
                INSERT INTO activities (project_id, activity_type, description)
                VALUES (?, 'project', ?)
            ''', (data['project_id'], 'Project tracking started'))
        
        return jsonify({
            'success': True,
            'message': 'Project tracking started',
            'project_id': data['project_id']
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/dashboard/<project_id>', methods=['GET'])
def get_dashboard(project_id):
    """Get complete dashboard summary"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM project_tracking WHERE project_id = ?", (project_id,))
            tracking = cursor.fetchone()
            
            if not tracking:
                return jsonify({'error': 'Project not found'}), 404
            
            cursor.execute("SELECT * FROM milestones WHERE project_id = ? ORDER BY phase_index", (project_id,))
            milestones = cursor.fetchall()
            
            cursor.execute('''
                SELECT * FROM activities 
                WHERE project_id = ? 
                ORDER BY created_at DESC 
                LIMIT 20
            ''', (project_id,))
            activities = cursor.fetchall()
            
            cursor.execute('''
                SELECT SUM(amount) as total FROM cost_tracking WHERE project_id = ?
            ''', (project_id,))
            total_spent = cursor.fetchone()['total'] or 0
            
            cursor.execute('''
                SELECT SUM(amount) as total FROM cost_tracking WHERE project_id = ? AND cost_type = 'labor'
            ''', (project_id,))
            labor_cost = cursor.fetchone()['total'] or 0
            
            cursor.execute('''
                SELECT SUM(amount) as total FROM cost_tracking WHERE project_id = ? AND cost_type = 'materials'
            ''', (project_id,))
            materials_cost = cursor.fetchone()['total'] or 0
            
            cursor.execute('''
                SELECT SUM(amount) as total FROM cost_tracking WHERE project_id = ? AND cost_type = 'equipment'
            ''', (project_id,))
            equipment_cost = cursor.fetchone()['total'] or 0
            
            cursor.execute('''
                SELECT SUM(amount) as total FROM cost_tracking WHERE project_id = ? AND cost_type = 'misc'
            ''', (project_id,))
            misc_cost = cursor.fetchone()['total'] or 0
            
            cursor.execute('''
                SELECT * FROM notifications 
                WHERE project_id = ? AND is_read = 0
                ORDER BY created_at DESC
            ''', (project_id,))
            notifications = cursor.fetchall()
            
            cursor.execute('''
                SELECT * FROM issues 
                WHERE project_id = ? AND status = 'open'
                ORDER BY created_at DESC
            ''', (project_id,))
            issues = cursor.fetchall()
            
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
            project = cursor.fetchone()
        
        budget = project['total_cost'] if project else tracking['total_spent'] * 10
        budget_spent_pct = (total_spent / budget * 100) if budget > 0 else 0
        completed_milestones = len([m for m in milestones if m['status'] == 'completed'])
        in_progress_milestones = len([m for m in milestones if m['status'] == 'in_progress'])
        
        return jsonify({
            'success': True,
            'dashboard': {
                'project': dict(tracking),
                'milestones': {
                    'total': len(milestones),
                    'completed': completed_milestones,
                    'in_progress': in_progress_milestones,
                    'pending': len(milestones) - completed_milestones - in_progress_milestones,
                    'items': [dict(m) for m in milestones]
                },
                'progress': {
                    'overall': tracking['overall_progress'],
                    'budget_spent': total_spent,
                    'budget_remaining': budget - total_spent,
                    'budget_spent_pct': round(budget_spent_pct, 1),
                    'time_elapsed_pct': round((tracking['current_day'] / 100) * 100, 1),
                    'current_day': tracking['current_day'],
                    'total_days': project['timeline_days'] if project else 100,
                    'days_remaining': (project['timeline_days'] if project else 100) - tracking['current_day']
                },
                'costs': {
                    'labor': labor_cost,
                    'materials': materials_cost,
                    'equipment': equipment_cost,
                    'misc': misc_cost,
                    'total_spent': total_spent
                },
                'team': {
                    'total_workers': tracking['workers_present'],
                    'present_today': tracking['workers_present'],
                    'productivity': 100
                },
                'alerts': {
                    'unread_notifications': len(notifications),
                    'open_issues': len(issues),
                    'critical_issues': len([i for i in issues if i['severity'] == 'high']),
                    'recent_issues': [dict(i) for i in issues[:5]]
                },
                'recent_activity': [dict(a) for a in activities]
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/project/<project_id>', methods=['GET'])
def get_project(project_id):
    """Get project details"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (project_id,))
            project = cursor.fetchone()
            
            if not project:
                cursor.execute("SELECT * FROM project_tracking WHERE project_id = ?", (project_id,))
                tracking = cursor.fetchone()
                if tracking:
                    return jsonify({
                        'success': True,
                        'project': dict(tracking)
                    })
                return jsonify({'error': 'Project not found'}), 404
        
        return jsonify({
            'success': True,
            'project': dict(project)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/update-progress', methods=['POST'])
def update_progress():
    """Update project progress"""
    data = request.json
    
    if not data.get('project_id'):
        return jsonify({'error': 'project_id is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE project_tracking 
                SET overall_progress = ?, current_day = ?, updated_at = CURRENT_TIMESTAMP
                WHERE project_id = ?
            ''', (
                data.get('progress', 0),
                data.get('current_day', 1),
                data['project_id']
            ))
            
            cursor.execute('''
                INSERT INTO activities (project_id, activity_type, description)
                VALUES (?, 'progress', ?)
            ''', (data['project_id'], f'Progress updated to {data.get("progress", 0)}%'))
        
        return jsonify({
            'success': True,
            'message': 'Progress updated'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/add-cost', methods=['POST'])
def add_cost():
    """Add cost to project"""
    data = request.json
    
    required = ['project_id', 'cost_type', 'amount']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    valid_types = ['labor', 'materials', 'equipment', 'misc']
    if data['cost_type'] not in valid_types:
        return jsonify({'error': f'cost_type must be one of {valid_types}'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO cost_tracking (project_id, cost_type, amount, description)
                VALUES (?, ?, ?, ?)
            ''', (
                data['project_id'],
                data['cost_type'],
                data['amount'],
                data.get('description', f'{data["cost_type"]} expense')
            ))
            
            cursor.execute('''
                INSERT INTO activities (project_id, activity_type, description)
                VALUES (?, 'cost', ?)
            ''', (data['project_id'], f'₹{data["amount"]} spent on {data["cost_type"]}'))
        
        return jsonify({
            'success': True,
            'message': 'Cost added'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/update-workers', methods=['POST'])
def update_workers():
    """Update worker attendance"""
    data = request.json
    
    if not data.get('project_id') or 'workers_present' not in data:
        return jsonify({'error': 'project_id and workers_present are required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE project_tracking 
                SET workers_present = ?, updated_at = CURRENT_TIMESTAMP
                WHERE project_id = ?
            ''', (data['workers_present'], data['project_id']))
        
        return jsonify({
            'success': True,
            'message': 'Workers updated'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/phase/update', methods=['POST'])
def update_phase():
    """Update phase/milestone status"""
    data = request.json
    
    required = ['project_id', 'phase_index', 'status']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE milestones 
                SET status = ?, progress = ?
                WHERE project_id = ? AND phase_index = ?
            ''', (
                data['status'],
                data.get('progress', 100 if data['status'] == 'completed' else 50),
                data['project_id'],
                data['phase_index']
            ))
            
            if data['status'] == 'completed':
                cursor.execute("SELECT name FROM milestones WHERE project_id = ? AND phase_index = ?",
                             (data['project_id'], data['phase_index']))
                milestone = cursor.fetchone()
                
                cursor.execute('''
                    INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                    VALUES (?, ?, 'milestone', 'Phase Completed!', ?)
                ''', (data.get('user_id', 1), data['project_id'], 
                     f'{milestone["name"] if milestone else "Phase"} completed'))
                
                cursor.execute('''
                    INSERT INTO activities (project_id, activity_type, description)
                    VALUES (?, 'milestone', ?)
                ''', (data['project_id'], f'Milestone completed: {milestone["name"] if milestone else "Phase"}'))
        
        return jsonify({
            'success': True,
            'message': 'Phase updated'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/milestones/<project_id>', methods=['GET'])
def get_milestones(project_id):
    """Get all milestones for a project"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM milestones 
                WHERE project_id = ? 
                ORDER BY phase_index
            ''', (project_id,))
            milestones = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'milestones': [dict(m) for m in milestones]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/activities/<project_id>', methods=['GET'])
def get_activities(project_id):
    """Get project activities"""
    limit = int(request.args.get('limit', 20))
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM activities 
                WHERE project_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (project_id, limit))
            activities = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'activities': [dict(a) for a in activities]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/notifications/<project_id>', methods=['GET'])
def get_notifications(project_id):
    """Get project notifications"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM notifications 
                WHERE project_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            ''', (project_id,))
            notifications = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(notifications),
            'notifications': [dict(n) for n in notifications]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/notifications/read', methods=['POST'])
def mark_notification_read():
    """Mark notification as read"""
    data = request.json
    
    if not data.get('notification_id'):
        return jsonify({'error': 'notification_id is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (data['notification_id'],))
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/notifications/read-all/<project_id>', methods=['POST'])
def mark_all_read(project_id):
    """Mark all notifications as read"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE notifications SET is_read = 1 WHERE project_id = ?", (project_id,))
        
        return jsonify({
            'success': True,
            'message': 'All notifications marked as read'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/issues/report', methods=['POST'])
def report_issue():
    """Report an issue"""
    data = request.json
    
    required = ['project_id', 'type', 'description']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO issues (project_id, user_id, issue_type, description, severity)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['project_id'],
                data.get('user_id'),
                data['type'],
                data['description'],
                data.get('severity', 'medium')
            ))
            
            cursor.execute('''
                INSERT INTO activities (project_id, activity_type, description)
                VALUES (?, 'issue', ?)
            ''', (data['project_id'], f'Issue reported: {data["type"]}'))
            
            if data.get('severity') == 'high':
                cursor.execute('''
                    INSERT INTO notifications (user_id, project_id, notification_type, title, message, priority)
                    VALUES (?, ?, 'alert', 'Critical Issue Reported', ?, 'danger')
                ''', (data.get('user_id', 1), data['project_id'], data['description']))
        
        return jsonify({
            'success': True,
            'message': 'Issue reported'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/issues/<project_id>', methods=['GET'])
def get_issues(project_id):
    """Get project issues"""
    status = request.args.get('status')
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            if status:
                cursor.execute('''
                    SELECT * FROM issues 
                    WHERE project_id = ? AND status = ?
                    ORDER BY created_at DESC
                ''', (project_id, status))
            else:
                cursor.execute('''
                    SELECT * FROM issues 
                    WHERE project_id = ?
                    ORDER BY created_at DESC
                ''', (project_id,))
            
            issues = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(issues),
            'issues': [dict(i) for i in issues]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tracking_bp.route('/issues/resolve', methods=['POST'])
def resolve_issue():
    """Resolve an issue"""
    data = request.json
    
    if not data.get('issue_id'):
        return jsonify({'error': 'issue_id is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE issues 
                SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (data['issue_id'],))
            
            cursor.execute("SELECT issue_type FROM issues WHERE id = ?", (data['issue_id'],))
            issue = cursor.fetchone()
            
            if data.get('project_id'):
                cursor.execute('''
                    INSERT INTO activities (project_id, activity_type, description)
                    VALUES (?, 'issue', ?)
                ''', (data['project_id'], f'Issue resolved: {issue["issue_type"] if issue else "Issue"}'))
        
        return jsonify({
            'success': True,
            'message': 'Issue resolved'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
