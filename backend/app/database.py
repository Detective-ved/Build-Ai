"""Database configuration and models"""
import sqlite3
import hashlib
import secrets
from datetime import datetime
from contextlib import contextmanager

DATABASE_PATH = 'buildai.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
    """Initialize database with all tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table (all types: user, contractor, admin)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            user_type TEXT NOT NULL CHECK(user_type IN ('user', 'contractor', 'admin')),
            full_name TEXT NOT NULL,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    # Contractor profiles
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contractor_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            location TEXT,
            experience INTEGER DEFAULT 0,
            hourly_rate REAL DEFAULT 0,
            projects_completed INTEGER DEFAULT 0,
            rating REAL DEFAULT 4.5,
            bio TEXT,
            license_number TEXT,
            verified INTEGER DEFAULT 0,
            specializations TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            project_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            location TEXT,
            project_type TEXT,
            area REAL,
            budget REAL,
            material_quality TEXT,
            construction_type TEXT,
            status TEXT DEFAULT 'planning',
            total_cost REAL,
            timeline_days INTEGER,
            start_date TEXT,
            deadline TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Bids table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bids (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            contractor_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            timeline_days INTEGER,
            proposal TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contractor_id) REFERENCES users(id)
        )
    ''')
    
    # Project tracking
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS project_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT UNIQUE NOT NULL,
            current_day INTEGER DEFAULT 1,
            overall_progress REAL DEFAULT 0,
            total_spent REAL DEFAULT 0,
            workers_present INTEGER DEFAULT 0,
            status TEXT DEFAULT 'in_progress',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Milestones/Phases
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            phase_index INTEGER,
            status TEXT DEFAULT 'pending',
            progress REAL DEFAULT 0,
            start_day INTEGER,
            end_day INTEGER,
            cost_spent REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(project_id)
        )
    ''')
    
    # Activities
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            user_id INTEGER,
            activity_type TEXT NOT NULL,
            description TEXT NOT NULL,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Notifications
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            project_id TEXT,
            notification_type TEXT,
            title TEXT NOT NULL,
            message TEXT,
            priority TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Issues
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            user_id INTEGER,
            issue_type TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        )
    ''')
    
    # Cost tracking
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cost_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            cost_type TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(project_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Create default admin user if not exists
    create_default_admin()

def create_default_admin():
    """Create default admin user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = 'admin@buildai.com' AND user_type = 'admin'")
    if not cursor.fetchone():
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', 'admin123'.encode(), salt.encode(), 100000).hex()
        cursor.execute('''
            INSERT INTO users (email, password_hash, salt, user_type, full_name, phone)
            VALUES (?, ?, ?, 'admin', 'System Administrator', '9876543210')
        ''', ('admin@buildai.com', password_hash, salt))
        conn.commit()
        print("Default admin created: admin@buildai.com / admin123")
    
    conn.close()

def hash_password(password, salt=None):
    """Hash password with salt"""
    if salt is None:
        salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return password_hash, salt

def verify_password(password, password_hash, salt):
    """Verify password"""
    computed_hash, _ = hash_password(password, salt)
    return computed_hash == password_hash

# Initialize database on module import
init_database()
