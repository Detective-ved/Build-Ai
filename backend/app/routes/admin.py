from flask import Blueprint, request, jsonify
from app.database import get_db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
def admin_dashboard():
    """Get admin dashboard statistics"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE user_type = 'user'")
            total_users = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE user_type = 'contractor'")
            total_contractors = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM projects")
            total_projects = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM bids")
            total_bids = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM bids WHERE status = 'pending'")
            pending_bids = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM issues WHERE status = 'open'")
            open_issues = cursor.fetchone()['count']
            
            cursor.execute('''
                SELECT u.full_name, u.email, u.user_type, u.created_at
                FROM users u
                ORDER BY u.created_at DESC
                LIMIT 10
            ''')
            recent_users = cursor.fetchall()
            
            cursor.execute('''
                SELECT * FROM issues 
                WHERE status = 'open'
                ORDER BY created_at DESC
                LIMIT 10
            ''')
            recent_issues = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_contractors': total_contractors,
                'total_projects': total_projects,
                'total_bids': total_bids,
                'pending_bids': pending_bids,
                'open_issues': open_issues
            },
            'recent_users': [dict(u) for u in recent_users],
            'recent_issues': [dict(i) for i in recent_issues]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users', methods=['GET'])
def list_all_users():
    """List all users"""
    user_type = request.args.get('type')
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            if user_type:
                cursor.execute('''
                    SELECT id, email, full_name, user_type, phone, created_at, is_active
                    FROM users
                    WHERE user_type = ?
                    ORDER BY created_at DESC
                ''', (user_type,))
            else:
                cursor.execute('''
                    SELECT id, email, full_name, user_type, phone, created_at, is_active
                    FROM users
                    ORDER BY created_at DESC
                ''')
            
            users = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(users),
            'users': [dict(u) for u in users]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
def toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT is_active FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            new_status = 0 if user['is_active'] else 1
            cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
        
        return jsonify({
            'success': True,
            'message': f'User {"activated" if new_status else "deactivated"}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>/delete', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        
        return jsonify({
            'success': True,
            'message': 'User deleted'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/contractors/verify/<int:contractor_id>', methods=['POST'])
def verify_contractor(contractor_id):
    """Verify a contractor"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE contractor_profiles 
                SET verified = 1 
                WHERE user_id = ?
            ''', (contractor_id,))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, notification_type, title, message)
                VALUES (?, 'system', 'Account Verified!', 'Your contractor account has been verified.')
            ''', (contractor_id,))
        
        return jsonify({
            'success': True,
            'message': 'Contractor verified'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/projects', methods=['GET'])
def list_projects():
    """List all projects"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT p.*, u.full_name as owner_name
                FROM projects p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
            ''')
            projects = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(projects),
            'projects': [dict(p) for p in projects]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/issues/<int:issue_id>/resolve', methods=['POST'])
def admin_resolve_issue(issue_id):
    """Admin resolve an issue"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE issues 
                SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (issue_id,))
        
        return jsonify({
            'success': True,
            'message': 'Issue resolved'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/all-bids', methods=['GET'])
def list_all_bids():
    """List all bids across projects"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT b.*, u.full_name as contractor_name, p.name as project_name
                FROM bids b
                JOIN users u ON b.contractor_id = u.id
                LEFT JOIN projects p ON b.project_id = p.project_id
                ORDER BY b.created_at DESC
            ''')
            bids = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(bids),
            'bids': [dict(b) for b in bids]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/all-issues', methods=['GET'])
def list_all_issues():
    """List all issues across projects"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM issues 
                ORDER BY created_at DESC
            ''')
            issues = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(issues),
            'issues': [dict(i) for i in issues]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/all-users-full', methods=['GET'])
def list_users_full():
    """Get all users with contractor profile data"""
    user_type = request.args.get('type')
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            if user_type == 'contractor':
                cursor.execute('''
                    SELECT u.*, cp.location, cp.experience, cp.hourly_rate, cp.rating, 
                           cp.projects_completed, cp.verified, cp.specializations
                    FROM users u
                    LEFT JOIN contractor_profiles cp ON u.id = cp.user_id
                    WHERE u.user_type = 'contractor'
                    ORDER BY u.created_at DESC
                ''')
            else:
                cursor.execute('''
                    SELECT u.*, cp.location, cp.experience, cp.hourly_rate, cp.rating, 
                           cp.projects_completed, cp.verified, cp.specializations
                    FROM users u
                    LEFT JOIN contractor_profiles cp ON u.id = cp.user_id
                    ORDER BY u.created_at DESC
                ''')
            
            users = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(users),
            'users': [dict(u) for u in users]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
