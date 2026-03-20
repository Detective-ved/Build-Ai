from flask import Blueprint, request, jsonify
from app.database import get_db, hash_password, verify_password
import secrets
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    required = ['email', 'password', 'user_type', 'full_name']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    if data['user_type'] not in ['user', 'contractor', 'admin']:
        return jsonify({'error': 'Invalid user type'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT id FROM users WHERE email = ?", (data['email'],))
            if cursor.fetchone():
                return jsonify({'error': 'Email already registered'}), 400
            
            password_hash, salt = hash_password(data['password'])
            
            cursor.execute('''
                INSERT INTO users (email, password_hash, salt, user_type, full_name, phone)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['email'],
                password_hash,
                salt,
                data['user_type'],
                data['full_name'],
                data.get('phone', '')
            ))
            
            user_id = cursor.lastrowid
            
            if data['user_type'] == 'contractor':
                cursor.execute('''
                    INSERT INTO contractor_profiles (user_id, location, experience, hourly_rate, specializations)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    data.get('location', ''),
                    data.get('experience', 0),
                    data.get('hourly_rate', 500),
                    ','.join(data.get('specializations', []))
                ))
            
            cursor.execute('''
                INSERT INTO notifications (user_id, notification_type, title, message)
                VALUES (?, 'system', 'Welcome to BuildAI!', 'Your account has been created successfully.')
            ''', (user_id,))
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'id': user_id,
                'email': data['email'],
                'user_type': data['user_type'],
                'full_name': data['full_name']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", (data['email'],))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'Invalid email or password'}), 401
            
            if not verify_password(data['password'], user['password_hash'], user['salt']):
                return jsonify({'error': 'Invalid email or password'}), 401
            
            session_token = secrets.token_hex(32)
            
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'user_type': user['user_type'],
                'full_name': user['full_name'],
                'session_token': session_token
            }
            
            if user['user_type'] == 'contractor':
                cursor.execute("SELECT * FROM contractor_profiles WHERE user_id = ?", (user['id'],))
                profile = cursor.fetchone()
                if profile:
                    user_data['contractor'] = {
                        'location': profile['location'],
                        'experience': profile['experience'],
                        'hourly_rate': profile['hourly_rate'],
                        'rating': profile['rating'],
                        'verified': bool(profile['verified']),
                        'specializations': profile['specializations'].split(',') if profile['specializations'] else []
                    }
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    user_id = request.headers.get('X-User-ID')
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, email, user_type, full_name, phone, created_at FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            user_data = dict(user)
            
            if user['user_type'] == 'contractor':
                cursor.execute("SELECT * FROM contractor_profiles WHERE user_id = ?", (user_id,))
                profile = cursor.fetchone()
                if profile:
                    user_data['contractor'] = dict(profile)
            
            cursor.execute("SELECT COUNT(*) as count FROM projects WHERE user_id = ?", (user_id,))
            projects = cursor.fetchone()
            user_data['projects_count'] = projects['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", (user_id,))
            unread = cursor.fetchone()
            user_data['unread_notifications'] = unread['count']
        
        return jsonify({
            'success': True,
            'profile': user_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    user_id = request.headers.get('X-User-ID')
    data = request.json
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            update_fields = []
            update_values = []
            
            for field in ['full_name', 'phone']:
                if field in data:
                    update_fields.append(f"{field} = ?")
                    update_values.append(data[field])
            
            if update_fields:
                update_values.append(user_id)
                cursor.execute(f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?", update_values)
            
            if data.get('user_type') == 'contractor':
                contractor_fields = []
                contractor_values = []
                
                for field in ['location', 'experience', 'hourly_rate', 'bio', 'license_number', 'specializations']:
                    if field in data:
                        contractor_fields.append(f"{field} = ?")
                        val = data[field]
                        if field == 'specializations' and isinstance(val, list):
                            val = ','.join(val)
                        contractor_values.append(val)
                
                if contractor_fields:
                    contractor_values.append(user_id)
                    cursor.execute(f"UPDATE contractor_profiles SET {', '.join(contractor_fields)} WHERE user_id = ?", contractor_values)
        
        return jsonify({
            'success': True,
            'message': 'Profile updated'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Change user password"""
    user_id = request.headers.get('X-User-ID')
    data = request.json
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password required'}), 400
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT password_hash, salt FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not verify_password(data['current_password'], user['password_hash'], user['salt']):
                return jsonify({'error': 'Current password is incorrect'}), 400
            
            new_hash, new_salt = hash_password(data['new_password'])
            cursor.execute("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?", (new_hash, new_salt, user_id))
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Get user notifications"""
    user_id = request.headers.get('X-User-ID')
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            ''', (user_id,))
            notifications = cursor.fetchall()
        
        return jsonify({
            'success': True,
            'notifications': [dict(n) for n in notifications]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/notifications/read/<int:notif_id>', methods=['POST'])
def mark_notification_read(notif_id):
    """Mark notification as read"""
    user_id = request.headers.get('X-User-ID')
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notif_id, user_id))
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
