from flask import Blueprint, request, jsonify
from app.database import get_db
import uuid

contractor_bp = Blueprint('contractor', __name__)

@contractor_bp.route('/register', methods=['POST'])
def register_contractor():
    """Register a new contractor"""
    data = request.json
    
    required = ['name', 'email', 'phone', 'password']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT id FROM users WHERE email = ?", (data['email'],))
            if cursor.fetchone():
                return jsonify({'error': 'Email already registered'}), 400
            
            from app.database import hash_password
            password_hash, salt = hash_password(data['password'])
            
            cursor.execute('''
                INSERT INTO users (email, password_hash, salt, user_type, full_name, phone)
                VALUES (?, ?, ?, 'contractor', ?, ?)
            ''', (data['email'], password_hash, salt, data['name'], data['phone']))
            
            user_id = cursor.lastrowid
            
            cursor.execute('''
                INSERT INTO contractor_profiles 
                (user_id, location, experience, hourly_rate, bio, license_number, specializations)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                data.get('location', ''),
                data.get('experience', 0),
                data.get('hourly_rate', 500),
                data.get('bio', ''),
                data.get('license_number', ''),
                ','.join(data.get('specialization', []))
            ))
            
            contractor_id = f"CON-{user_id:04d}"
            
            cursor.execute('''
                INSERT INTO notifications (user_id, notification_type, title, message)
                VALUES (?, 'system', 'Welcome Contractor!', 'Your contractor account has been created.')
            ''', (user_id,))
        
        return jsonify({
            'success': True,
            'message': 'Contractor registered successfully',
            'contractor': {
                'id': contractor_id,
                'user_id': user_id,
                'name': data['name'],
                'email': data['email']
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_contractor_profile(user_id):
    """Get contractor profile"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM users WHERE id = ? AND user_type = 'contractor'", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'Contractor not found'}), 404
            
            cursor.execute("SELECT * FROM contractor_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone()
            
            cursor.execute("SELECT COUNT(*) as count FROM bids WHERE contractor_id = ?", (user_id,))
            total_bids = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM bids WHERE contractor_id = ? AND status = 'accepted'", (user_id,))
            accepted_bids = cursor.fetchone()['count']
        
        contractor_id = f"CON-{user_id:04d}"
        
        return jsonify({
            'success': True,
            'contractor': {
                'id': contractor_id,
                'user_id': user_id,
                'name': user['full_name'],
                'email': user['email'],
                'phone': user['phone'],
                'location': profile['location'] if profile else '',
                'experience': profile['experience'] if profile else 0,
                'hourly_rate': profile['hourly_rate'] if profile else 0,
                'rating': profile['rating'] if profile else 4.5,
                'verified': bool(profile['verified']) if profile else False,
                'bio': profile['bio'] if profile else '',
                'license_number': profile['license_number'] if profile else '',
                'specialization': profile['specializations'].split(',') if profile and profile['specializations'] else [],
                'projects_completed': profile['projects_completed'] if profile else 0
            },
            'stats': {
                'total_bids': total_bids,
                'projects_completed': accepted_bids,
                'active_projects': accepted_bids
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/list', methods=['GET'])
def list_contractors():
    """List all contractors with optional filters"""
    specialization = request.args.get('specialization')
    location = request.args.get('location')
    min_rating = request.args.get('min_rating')
    max_rate = request.args.get('max_rate')
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            query = '''
                SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
                       cp.location, cp.experience, cp.hourly_rate, cp.rating, 
                       cp.projects_completed, cp.verified, cp.specializations
                FROM users u
                JOIN contractor_profiles cp ON u.id = cp.user_id
                WHERE u.user_type = 'contractor' AND u.is_active = 1
            '''
            params = []
            
            if specialization:
                query += " AND cp.specializations LIKE ?"
                params.append(f'%{specialization}%')
            
            if location:
                query += " AND LOWER(cp.location) LIKE ?"
                params.append(f'%{location.lower()}%')
            
            if min_rating:
                query += " AND cp.rating >= ?"
                params.append(float(min_rating))
            
            if max_rate:
                query += " AND cp.hourly_rate <= ?"
                params.append(float(max_rate))
            
            query += " ORDER BY cp.rating DESC, cp.projects_completed DESC"
            
            cursor.execute(query, params)
            contractors = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(contractors),
            'contractors': [{
                'id': f"CON-{c['id']:04d}",
                'user_id': c['id'],
                'name': c['full_name'],
                'email': c['email'],
                'phone': c['phone'],
                'location': c['location'],
                'experience': c['experience'],
                'hourly_rate': c['hourly_rate'],
                'rating': c['rating'],
                'verified': bool(c['verified']),
                'projects_completed': c['projects_completed'],
                'specialization': c['specializations'].split(',') if c['specializations'] else []
            } for c in contractors]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/update/<int:user_id>', methods=['PUT'])
def update_contractor(user_id):
    """Update contractor profile"""
    data = request.json
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT id FROM users WHERE id = ? AND user_type = 'contractor'", (user_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'Contractor not found'}), 404
            
            update_fields = []
            update_values = []
            
            for field in ['location', 'experience', 'hourly_rate', 'bio', 'license_number', 'specializations']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    val = data[field]
                    if field == 'specializations' and isinstance(val, list):
                        val = ','.join(val)
                    update_values.append(val)
            
            if update_fields:
                update_values.append(user_id)
                cursor.execute(f"UPDATE contractor_profiles SET {', '.join(update_fields)} WHERE user_id = ?", update_values)
        
        return jsonify({
            'success': True,
            'message': 'Profile updated'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/specializations', methods=['GET'])
def get_specializations():
    """Get available specializations"""
    return jsonify({
        'success': True,
        'specializations': [
            {'id': 'structural', 'name': 'Structural Engineering', 'icon': '🏗️'},
            {'id': 'electrical', 'name': 'Electrical', 'icon': '💡'},
            {'id': 'plumbing', 'name': 'Plumbing', 'icon': '🚿'},
            {'id': 'finishing', 'name': 'Finishing & Interiors', 'icon': '🎨'},
            {'id': 'roofing', 'name': 'Roofing', 'icon': '🏠'},
            {'id': 'landscaping', 'name': 'Landscaping', 'icon': '🌳'},
            {'id': 'demolition', 'name': 'Demolition', 'icon': '🔨'},
            {'id': 'painting', 'name': 'Painting', 'icon': '🖌️'},
            {'id': 'flooring', 'name': 'Flooring', 'icon': '🪵'},
            {'id': 'hvac', 'name': 'HVAC', 'icon': '❄️'}
        ]
    })


@contractor_bp.route('/bids', methods=['POST'])
def create_bid():
    """Submit a bid for a project"""
    data = request.json
    
    required = ['project_id', 'contractor_id', 'amount']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, full_name FROM users WHERE id = ? AND user_type = 'contractor'", (data['contractor_id'],))
            contractor = cursor.fetchone()
            
            if not contractor:
                return jsonify({'error': 'Contractor not found'}), 404
            
            cursor.execute('''
                INSERT INTO bids (project_id, contractor_id, amount, timeline_days, proposal)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['project_id'],
                data['contractor_id'],
                data['amount'],
                data.get('timeline_days', 0),
                data.get('proposal', '')
            ))
            
            bid_id = cursor.lastrowid
            
            cursor.execute('''
                INSERT INTO activities (project_id, user_id, activity_type, description)
                VALUES (?, ?, 'bid', ?)
            ''', (data['project_id'], data['contractor_id'], f'New bid submitted by {contractor["full_name"]}'))
        
        return jsonify({
            'success': True,
            'message': 'Bid submitted successfully',
            'bid': {
                'id': f"BID-{bid_id:06d}",
                'project_id': data['project_id'],
                'contractor_id': data['contractor_id'],
                'amount': data['amount']
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/bids/<project_id>', methods=['GET'])
def get_project_bids(project_id):
    """Get all bids for a project"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT b.*, u.full_name as contractor_name, u.email, u.phone,
                       cp.location, cp.experience, cp.rating, cp.specializations
                FROM bids b
                JOIN users u ON b.contractor_id = u.id
                LEFT JOIN contractor_profiles cp ON u.id = cp.user_id
                WHERE b.project_id = ?
                ORDER BY b.created_at DESC
            ''', (project_id,))
            
            bids = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(bids),
            'bids': [{
                'id': f"BID-{b['id']:06d}",
                'project_id': b['project_id'],
                'contractor_id': b['contractor_id'],
                'contractor_name': b['contractor_name'],
                'contractor': {
                    'name': b['contractor_name'],
                    'email': b['email'],
                    'phone': b['phone'],
                    'location': b['location'],
                    'experience': b['experience'],
                    'rating': b['rating'],
                    'specialization': b['specializations'].split(',') if b['specializations'] else []
                },
                'amount': b['amount'],
                'timeline_days': b['timeline_days'],
                'proposal': b['proposal'],
                'status': b['status'],
                'created_at': b['created_at']
            } for b in bids]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/bids/<bid_id>/accept', methods=['POST'])
def accept_bid(bid_id):
    """User accepts a bid - contractor needs to confirm"""
    bid_num = int(bid_id.replace('BID-', ''))
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM bids WHERE id = ?", (bid_num,))
            bid = cursor.fetchone()
            
            if not bid:
                return jsonify({'error': 'Bid not found'}), 404
            
            if bid['status'] != 'pending':
                return jsonify({'error': 'Bid is no longer available'}), 400
            
            cursor.execute("UPDATE bids SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (bid_num,))
            cursor.execute("UPDATE bids SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND id != ?", 
                         (bid['project_id'], bid_num))
            
            cursor.execute('''
                UPDATE projects 
                SET status = 'awaiting_confirmation', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ?
            ''', (bid['project_id'],))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'bid', 'Bid Accepted', ?)
            ''', (bid['contractor_id'], bid['project_id'], 'A user has accepted your bid! Please confirm the project assignment.'))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'bid', 'Bid Accepted', ?)
            ''', (bid['user_id'], bid['project_id'], 'You have accepted a bid. Waiting for contractor to confirm.'))
            
            cursor.execute('''
                INSERT INTO activities (project_id, user_id, activity_type, description)
                VALUES (?, ?, 'bid', 'Bid accepted, waiting for contractor confirmation')
            ''', (bid['project_id'], bid['user_id']))
        
        return jsonify({
            'success': True,
            'message': 'Bid accepted! Waiting for contractor confirmation.',
            'status': 'awaiting_confirmation'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/accept-counter-offer/<bid_id>', methods=['POST'])
def accept_counter_offer(bid_id):
    """User accepts counter-offer from contractor - auto-confirms contractor"""
    bid_num = int(bid_id.replace('BID-', ''))
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM bids WHERE id = ?", (bid_num,))
            bid = cursor.fetchone()
            
            if not bid:
                return jsonify({'error': 'Bid not found'}), 404
            
            if bid['status'] != 'pending':
                return jsonify({'error': 'Bid is no longer available'}), 400
            
            # Accept the bid and auto-confirm the contractor
            cursor.execute("UPDATE bids SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (bid_num,))
            cursor.execute("UPDATE bids SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND id != ?", 
                         (bid['project_id'], bid_num))
            
            # Project starts immediately (auto-confirmed)
            cursor.execute('''
                UPDATE projects 
                SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ?
            ''', (bid['project_id'],))
            
            cursor.execute('''
                UPDATE contractor_profiles 
                SET projects_completed = projects_completed + 1 
                WHERE user_id = ?
            ''', (bid['contractor_id'],))
            
            cursor.execute("""
                INSERT OR REPLACE INTO project_tracking 
                (project_id, current_day, overall_progress, status, workers_present)
                VALUES (?, 1, 0, 'in_progress', 0)
            """, (bid['project_id'],))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'milestone', 'Project Started!', ?)
            ''', (bid['user_id'], bid['project_id'], 'Counter-offer accepted! Contractor has been confirmed and project started.'))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'milestone', 'Project Confirmed!', ?)
            ''', (bid['contractor_id'], bid['project_id'], 'Counter-offer accepted! Project has started. Good luck!'))
            
            cursor.execute('''
                INSERT INTO activities (project_id, user_id, activity_type, description)
                VALUES (?, ?, 'milestone', 'Counter-offer accepted, project auto-confirmed')
            ''', (bid['project_id'], bid['user_id']))
            
            cursor.execute("SELECT full_name FROM users WHERE id = ?", (bid['contractor_id'],))
            contractor = cursor.fetchone()
        
        return jsonify({
            'success': True,
            'message': 'Counter-offer accepted! Project has started.',
            'bid': dict(bid),
            'contractor': {'name': contractor['full_name']} if contractor else None,
            'auto_confirmed': True,
            'status': 'in_progress'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/bids/<bid_id>/reject', methods=['POST'])
def reject_bid(bid_id):
    """Reject a bid"""
    bid_num = int(bid_id.replace('BID-', ''))
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE bids SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (bid_num,))
        
        return jsonify({
            'success': True,
            'message': 'Bid rejected'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/update-bid', methods=['POST'])
def update_bid():
    """Update a bid's amount, timeline, or proposal"""
    data = request.json
    
    if not data.get('bid_id'):
        return jsonify({'error': 'bid_id is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            bid_num = int(data['bid_id'].replace('BID-', ''))
            
            cursor.execute("SELECT id, status, contractor_id, project_id, user_id FROM bids WHERE id = ?", (bid_num,))
            bid = cursor.fetchone()
            
            if not bid:
                return jsonify({'error': 'Bid not found'}), 404
            
            update_fields = []
            update_values = []
            
            if data.get('amount'):
                update_fields.append('amount = ?')
                update_values.append(data['amount'])
            
            if data.get('timeline_days'):
                update_fields.append('timeline_days = ?')
                update_values.append(data['timeline_days'])
            
            if data.get('proposal'):
                update_fields.append('proposal = ?')
                update_values.append(data['proposal'])
            
            # Check if this is a counter-offer (contractor modifying pending bid)
            is_counter_offer = data.get('counter_offer', False)
            
            if bid['status'] == 'pending' and is_counter_offer:
                # For counter-offer, notify the user
                cursor.execute('''
                    INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                    VALUES (?, ?, 'bid', 'Counter Offer Received', ?)
                ''', (bid['user_id'], bid['project_id'], 'Contractor has submitted a counter-offer. Please review and accept or reject.'))
                
                update_fields.append('updated_at = CURRENT_TIMESTAMP')
                update_values.append(bid_num)
                cursor.execute(f"UPDATE bids SET {', '.join(update_fields)} WHERE id = ?", update_values)
                
                return jsonify({
                    'success': True,
                    'message': 'Counter-offer sent to user',
                    'counter_offer': True
                })
            
            elif bid['status'] in ['pending', 'accepted']:
                # Regular update
                if update_fields:
                    update_fields.append('updated_at = CURRENT_TIMESTAMP')
                    update_values.append(bid_num)
                    cursor.execute(f"UPDATE bids SET {', '.join(update_fields)} WHERE id = ?", update_values)
                    
                    cursor.execute('''
                        INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                        VALUES (?, ?, 'bid', 'Bid Updated', ?)
                    ''', (bid['user_id'], bid['project_id'], 'Contractor has updated their bid details.'))
                
                return jsonify({
                    'success': True,
                    'message': 'Bid updated successfully'
                })
            else:
                return jsonify({'error': 'Can only update pending or accepted bids'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/confirm-project', methods=['POST'])
def confirm_project():
    """Contractor confirms project assignment"""
    data = request.json
    
    if not data.get('project_id') or not data.get('contractor_id'):
        return jsonify({'error': 'project_id and contractor_id are required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if contractor has accepted bid for this project
            cursor.execute("""
                SELECT b.*, p.user_id as owner_id 
                FROM bids b 
                JOIN projects p ON b.project_id = p.project_id
                WHERE b.project_id = ? AND b.contractor_id = ? AND b.status = 'accepted'
            """, (data['project_id'], data['contractor_id']))
            assignment = cursor.fetchone()
            
            if not assignment:
                return jsonify({'error': 'No accepted bid found for this project'}), 404
            
            # Update project status to in_progress
            cursor.execute("""
                UPDATE projects 
                SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ?
            """, (data['project_id'],))
            
            # Update contractor profile
            cursor.execute('''
                UPDATE contractor_profiles 
                SET projects_completed = projects_completed + 1 
                WHERE user_id = ?
            ''', (data['contractor_id'],))
            
            # Create project tracking entry
            cursor.execute("""
                INSERT OR REPLACE INTO project_tracking 
                (project_id, current_day, overall_progress, status, workers_present)
                VALUES (?, 1, 0, 'in_progress', 0)
            """, (data['project_id'],))
            
            # Create notification for owner
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'milestone', 'Project Started!', ?)
            ''', (assignment['owner_id'], data['project_id'], 'Contractor has confirmed. Your project has started!'))
            
            # Create activity
            cursor.execute('''
                INSERT INTO activities (project_id, user_id, activity_type, description)
                VALUES (?, ?, 'milestone', 'Project confirmed and started by contractor')
            ''', (data['project_id'], data['contractor_id']))
        
        return jsonify({
            'success': True,
            'message': 'Project confirmed and started'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/reject-project', methods=['POST'])
def reject_project():
    """Contractor rejects project assignment"""
    data = request.json
    
    if not data.get('project_id') or not data.get('contractor_id'):
        return jsonify({'error': 'project_id and contractor_id are required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if contractor has accepted bid for this project
            cursor.execute("""
                SELECT b.*, p.user_id as owner_id 
                FROM bids b 
                JOIN projects p ON b.project_id = p.project_id
                WHERE b.project_id = ? AND b.contractor_id = ? AND b.status = 'accepted'
            """, (data['project_id'], data['contractor_id']))
            assignment = cursor.fetchone()
            
            if not assignment:
                return jsonify({'error': 'No accepted bid found for this project'}), 404
            
            # Update bid status back to rejected
            cursor.execute("""
                UPDATE bids SET status = 'rejected', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ? AND contractor_id = ?
            """, (data['project_id'], data['contractor_id']))
            
            # Update project status back to planning
            cursor.execute("""
                UPDATE projects 
                SET status = 'planning', updated_at = CURRENT_TIMESTAMP 
                WHERE project_id = ?
            """, (data['project_id'],))
            
            # Create notification for owner
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'bid', 'Contractor Declined', ?)
            ''', (assignment['owner_id'], data['project_id'], 'Contractor has declined the project. Please select another contractor.'))
            
            # Create activity
            cursor.execute('''
                INSERT INTO activities (project_id, user_id, activity_type, description)
                VALUES (?, ?, 'system', 'Contractor declined project assignment')
            ''', (data['project_id'], data['contractor_id']))
        
        return jsonify({
            'success': True,
            'message': 'Project assignment rejected'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/pending-confirmations/<int:contractor_id>', methods=['GET'])
def get_pending_confirmations(contractor_id):
    """Get projects awaiting contractor confirmation"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT b.*, p.name as project_name, p.location, p.status as project_status,
                       p.total_cost, p.timeline_days, p.area, p.budget, u.full_name as owner_name,
                       u.email as owner_email, u.phone as owner_phone
                FROM bids b
                JOIN projects p ON b.project_id = p.project_id
                JOIN users u ON p.user_id = u.id
                WHERE b.contractor_id = ? AND b.status = 'accepted' AND p.status = 'awaiting_confirmation'
                ORDER BY b.updated_at DESC
            ''', (contractor_id,))
            projects = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(projects),
            'projects': [{
                'id': p['id'],
                'project_id': p['project_id'],
                'project_name': p['project_name'],
                'location': p['location'],
                'owner_name': p['owner_name'],
                'owner_email': p['owner_email'],
                'owner_phone': p['owner_phone'],
                'status': p['project_status'],
                'amount': p['amount'],
                'timeline_days': p['timeline_days'],
                'area': p['area'],
                'budget': p['budget'],
                'bid_amount': p['amount'],
                'created_at': p['created_at'],
                'updated_at': p['updated_at']
            } for p in projects]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/my-bids/<int:contractor_id>', methods=['GET'])
def get_contractor_bids(contractor_id):
    """Get all bids by a contractor"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM bids 
                WHERE contractor_id = ? 
                ORDER BY created_at DESC
            ''', (contractor_id,))
            bids = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(bids),
            'bids': [{
                'id': f"BID-{b['id']:06d}",
                'project_id': b['project_id'],
                'amount': b['amount'],
                'timeline_days': b['timeline_days'],
                'status': b['status'],
                'created_at': b['created_at']
            } for b in bids]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/user-projects/<int:user_id>', methods=['GET'])
def get_user_projects(user_id):
    """Get all projects for a user with their bids"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM projects 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            ''', (user_id,))
            projects = cursor.fetchall()
            
            result = []
            for project in projects:
                cursor.execute('''
                    SELECT b.*, u.full_name as contractor_name, cp.rating, cp.experience, cp.specializations
                    FROM bids b
                    LEFT JOIN users u ON b.contractor_id = u.id
                    LEFT JOIN contractor_profiles cp ON u.id = cp.user_id
                    WHERE b.project_id = ?
                    ORDER BY b.created_at DESC
                ''', (project['project_id'],))
                bids = cursor.fetchall()
                
                result.append({
                    **dict(project),
                    'bids': [{
                        'id': f"BID-{b['id']:06d}",
                        'contractor_id': b['contractor_id'],
                        'contractor_name': b['contractor_name'],
                        'amount': b['amount'],
                        'timeline_days': b['timeline_days'],
                        'proposal': b['proposal'],
                        'status': b['status'],
                        'rating': b['rating'],
                        'experience': b['experience'],
                        'specializations': b['specializations'].split(',') if b['specializations'] else [],
                        'created_at': b['created_at']
                    } for b in bids]
                })
        
        return jsonify({
            'success': True,
            'count': len(result),
            'projects': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/submit-report', methods=['POST'])
def submit_report():
    """Submit a progress report for a project"""
    data = request.json
    
    required = ['project_id', 'contractor_id', 'report_type', 'description']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Verify contractor is assigned to this project
            cursor.execute("""
                SELECT b.*, p.user_id as owner_id 
                FROM bids b 
                JOIN projects p ON b.project_id = p.project_id
                WHERE b.project_id = ? AND b.contractor_id = ? AND b.status = 'accepted'
            """, (data['project_id'], data['contractor_id']))
            assignment = cursor.fetchone()
            
            if not assignment:
                return jsonify({'error': 'You are not assigned to this project'}), 403
            
            # Insert report (using activities table to store reports)
            cursor.execute('''
                INSERT INTO activities (project_id, user_id, activity_type, description, metadata)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data['project_id'],
                data['contractor_id'],
                f'report_{data["report_type"]}',
                data['description'],
                data.get('progress', 0)
            ))
            
            report_id = cursor.lastrowid
            
            # Update project progress if provided
            if data.get('progress'):
                cursor.execute('''
                    UPDATE project_tracking 
                    SET overall_progress = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE project_id = ?
                ''', (data['progress'], data['project_id']))
                
                # Update milestones based on progress
                if float(data['progress']) >= 100:
                    cursor.execute('''
                        UPDATE milestones 
                        SET status = 'completed', progress = 100 
                        WHERE project_id = ?
                    ''', (data['project_id'],))
            
            # Create notification for project owner
            cursor.execute('''
                INSERT INTO notifications (user_id, project_id, notification_type, title, message)
                VALUES (?, ?, 'report', ?, ?)
            ''', (
                assignment['owner_id'],
                data['project_id'],
                f'Project Report: {data["report_type"].replace("_", " ").title()}',
                data['description'][:100] + '...' if len(data['description']) > 100 else data['description']
            ))
        
        return jsonify({
            'success': True,
            'message': 'Report submitted successfully',
            'report_id': report_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/project-reports/<project_id>', methods=['GET'])
def get_project_reports(project_id):
    """Get all reports for a project"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT a.*, u.full_name as contractor_name
                FROM activities a
                JOIN users u ON a.user_id = u.id
                WHERE a.project_id = ? AND a.activity_type LIKE 'report_%'
                ORDER BY a.created_at DESC
            ''', (project_id,))
            reports = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(reports),
            'reports': [{
                'id': r['id'],
                'project_id': r['project_id'],
                'contractor_id': r['user_id'],
                'contractor_name': r['contractor_name'],
                'report_type': r['activity_type'].replace('report_', ''),
                'description': r['description'],
                'progress': r['metadata'],
                'created_at': r['created_at']
            } for r in reports]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@contractor_bp.route('/contractor-projects/<int:contractor_id>', methods=['GET'])
def get_contractor_projects(contractor_id):
    """Get all projects assigned to a contractor (accepted bids)"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT b.*, p.name as project_name, p.location, p.status as project_status,
                       p.total_cost, p.timeline_days, u.full_name as owner_name
                FROM bids b
                JOIN projects p ON b.project_id = p.project_id
                JOIN users u ON p.user_id = u.id
                WHERE b.contractor_id = ? AND b.status = 'accepted'
                ORDER BY b.updated_at DESC
            ''', (contractor_id,))
            projects = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'count': len(projects),
            'projects': [{
                'id': p['id'],
                'project_id': p['project_id'],
                'project_name': p['project_name'],
                'location': p['location'],
                'owner_name': p['owner_name'],
                'status': p['project_status'],
                'amount': p['amount'],
                'timeline_days': p['timeline_days'],
                'created_at': p['created_at']
            } for p in projects]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
