"""Project Tracking data store (in-memory for demo)"""
import uuid
from datetime import datetime, timedelta

class TrackingStore:
    """In-memory storage for project tracking data"""
    
    projects = {}
    activities = {}
    notifications = {}
    issues = {}
    milestones = {}
    
    @classmethod
    def generate_id(cls):
        return str(uuid.uuid4())[:8].upper()
    
    @classmethod
    def create_tracked_project(cls, project_id, data):
        project = {
            'id': project_id,
            'name': data.get('name', 'Project'),
            'total_budget': data.get('total_budget', 0),
            'total_days': data.get('total_days', 100),
            'start_date': data.get('start_date', datetime.now().isoformat()),
            'current_day': 1,
            'overall_progress': 0,
            'phases': data.get('phases', []),
            'costs': {
                'labor': 0,
                'materials': 0,
                'equipment': 0,
                'misc': 0,
                'total_spent': 0
            },
            'workers': {
                'total': data.get('workers_count', 10),
                'present_today': data.get('workers_count', 10),
                'active': data.get('workers_count', 10)
            },
            'status': 'in_progress',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        cls.projects[project_id] = project
        
        for i, phase in enumerate(project['phases']):
            milestone_id = f"{project_id}-M{i+1}"
            cls.milestones[milestone_id] = {
                'id': milestone_id,
                'project_id': project_id,
                'name': phase.get('name', f'Milestone {i+1}'),
                'phase_index': i,
                'status': 'pending',
                'progress': 0,
                'start_day': phase.get('startDay', i * 30 + 1),
                'end_day': phase.get('endDay', (i + 1) * 30),
                'cost_spent': 0,
                'notes': []
            }
        
        cls.notifications[project_id] = []
        cls.activities[project_id] = []
        
        return project
    
    @classmethod
    def get_project(cls, project_id):
        return cls.projects.get(project_id)
    
    @classmethod
    def update_progress(cls, project_id, progress_update):
        if project_id not in cls.projects:
            return None
        
        project = cls.projects[project_id]
        project['overall_progress'] = progress_update.get('progress', project['overall_progress'])
        project['current_day'] = progress_update.get('current_day', project['current_day'])
        project['updated_at'] = datetime.now().isoformat()
        
        return project
    
    @classmethod
    def add_cost(cls, project_id, cost_type, amount):
        if project_id not in cls.projects:
            return None
        
        project = cls.projects[project_id]
        if cost_type in project['costs']:
            project['costs'][cost_type] += amount
            project['costs']['total_spent'] += amount
        
        project['updated_at'] = datetime.now().isoformat()
        return project
    
    @classmethod
    def update_workers(cls, project_id, workers_present):
        if project_id not in cls.projects:
            return None
        
        project = cls.projects[project_id]
        project['workers']['present_today'] = workers_present
        project['updated_at'] = datetime.now().isoformat()
        return project
    
    @classmethod
    def update_phase_status(cls, project_id, phase_index, status, progress):
        milestone_id = f"{project_id}-M{phase_index + 1}"
        if milestone_id in cls.milestones:
            cls.milestones[milestone_id]['status'] = status
            cls.milestones[milestone_id]['progress'] = progress
            cls.milestones[milestone_id]['updated_at'] = datetime.now().isoformat()
        
        if project_id in cls.projects:
            cls.projects[project_id]['updated_at'] = datetime.now().isoformat()
        
        return cls.milestones.get(milestone_id)
    
    @classmethod
    def get_milestones(cls, project_id):
        return [m for mid, m in cls.milestones.items() if m['project_id'] == project_id]
    
    @classmethod
    def add_activity(cls, project_id, activity_type, description, metadata=None):
        activity_id = cls.generate_id()
        activity = {
            'id': activity_id,
            'project_id': project_id,
            'type': activity_type,
            'description': description,
            'metadata': metadata or {},
            'timestamp': datetime.now().isoformat()
        }
        
        if project_id not in cls.activities:
            cls.activities[project_id] = []
        cls.activities[project_id].insert(0, activity)
        
        if len(cls.activities[project_id]) > 100:
            cls.activities[project_id] = cls.activities[project_id][:100]
        
        return activity
    
    @classmethod
    def get_activities(cls, project_id, limit=20):
        if project_id not in cls.activities:
            return []
        return cls.activities[project_id][:limit]
    
    @classmethod
    def add_notification(cls, project_id, notification_type, title, message, priority='info'):
        notification_id = cls.generate_id()
        notification = {
            'id': notification_id,
            'project_id': project_id,
            'type': notification_type,
            'title': title,
            'message': message,
            'priority': priority,
            'read': False,
            'created_at': datetime.now().isoformat()
        }
        
        if project_id not in cls.notifications:
            cls.notifications[project_id] = []
        cls.notifications[project_id].insert(0, notification)
        
        return notification
    
    @classmethod
    def get_notifications(cls, project_id, unread_only=False):
        if project_id not in cls.notifications:
            return []
        notifications = cls.notifications[project_id]
        if unread_only:
            notifications = [n for n in notifications if not n['read']]
        return notifications
    
    @classmethod
    def mark_notification_read(cls, project_id, notification_id):
        if project_id in cls.notifications:
            for n in cls.notifications[project_id]:
                if n['id'] == notification_id:
                    n['read'] = True
                    return n
        return None
    
    @classmethod
    def mark_all_read(cls, project_id):
        if project_id in cls.notifications:
            for n in cls.notifications[project_id]:
                n['read'] = True
    
    @classmethod
    def report_issue(cls, project_id, issue_type, description, severity='medium'):
        issue_id = cls.generate_id()
        issue = {
            'id': issue_id,
            'project_id': project_id,
            'type': issue_type,
            'description': description,
            'severity': severity,
            'status': 'open',
            'created_at': datetime.now().isoformat(),
            'resolved_at': None
        }
        
        if project_id not in cls.issues:
            cls.issues[project_id] = []
        cls.issues[project_id].insert(0, issue)
        
        return issue
    
    @classmethod
    def get_issues(cls, project_id, status=None):
        if project_id not in cls.issues:
            return []
        issues = cls.issues[project_id]
        if status:
            issues = [i for i in issues if i['status'] == status]
        return issues
    
    @classmethod
    def resolve_issue(cls, project_id, issue_id):
        if project_id in cls.issues:
            for issue in cls.issues[project_id]:
                if issue['id'] == issue_id:
                    issue['status'] = 'resolved'
                    issue['resolved_at'] = datetime.now().isoformat()
                    return issue
        return None
    
    @classmethod
    def get_dashboard_summary(cls, project_id):
        project = cls.projects.get(project_id)
        if not project:
            return None
        
        milestones = cls.get_milestones(project_id)
        activities = cls.get_activities(project_id, 10)
        notifications = cls.get_notifications(project_id, unread_only=True)
        issues = cls.get_issues(project_id, status='open')
        
        budget_spent_pct = (project['costs']['total_spent'] / project['total_budget'] * 100) if project['total_budget'] > 0 else 0
        days_elapsed = project['current_day']
        days_total = project['total_days']
        time_elapsed_pct = (days_elapsed / days_total * 100) if days_total > 0 else 0
        
        completed_milestones = len([m for m in milestones if m['status'] == 'completed'])
        in_progress_milestones = len([m for m in milestones if m['status'] == 'in_progress'])
        
        return {
            'project': project,
            'milestones': {
                'total': len(milestones),
                'completed': completed_milestones,
                'in_progress': in_progress_milestones,
                'pending': len(milestones) - completed_milestones - in_progress_milestones,
                'items': milestones
            },
            'progress': {
                'overall': project['overall_progress'],
                'budget_spent': project['costs']['total_spent'],
                'budget_remaining': project['total_budget'] - project['costs']['total_spent'],
                'budget_spent_pct': round(budget_spent_pct, 1),
                'time_elapsed_pct': round(time_elapsed_pct, 1),
                'current_day': days_elapsed,
                'total_days': days_total,
                'days_remaining': days_total - days_elapsed
            },
            'team': {
                'total_workers': project['workers']['total'],
                'present_today': project['workers']['present_today'],
                'productivity': round(project['workers']['present_today'] / project['workers']['total'] * 100, 1) if project['workers']['total'] > 0 else 0
            },
            'alerts': {
                'unread_notifications': len(notifications),
                'open_issues': len(issues),
                'critical_issues': len([i for i in issues if i['severity'] == 'high']),
                'recent_issues': issues[:5]
            },
            'recent_activity': activities
        }


tracking_store = TrackingStore()
