"""Contractor data store (in-memory for demo)"""
import uuid
from datetime import datetime

class ContractorStore:
    """In-memory storage for contractors and bids"""
    
    contractors = {}
    bids = {}
    
    @classmethod
    def generate_id(cls):
        return str(uuid.uuid4())[:8].upper()
    
    @classmethod
    def add_contractor(cls, data):
        contractor_id = cls.generate_id()
        contractor = {
            'id': contractor_id,
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'specialization': data.get('specialization', []),
            'experience': data.get('experience', 0),
            'location': data.get('location', ''),
            'hourly_rate': data.get('hourly_rate', 0),
            'projects_completed': data.get('projects_completed', 0),
            'rating': 4.5,
            'verified': False,
            'bio': data.get('bio', ''),
            'license_number': data.get('license_number', ''),
            'created_at': datetime.now().isoformat()
        }
        cls.contractors[contractor_id] = contractor
        return contractor
    
    @classmethod
    def get_contractor(cls, contractor_id):
        return cls.contractors.get(contractor_id)
    
    @classmethod
    def list_contractors(cls, filters=None):
        contractors = list(cls.contractors.values())
        
        if filters:
            if filters.get('specialization'):
                contractors = [c for c in contractors 
                             if filters['specialization'] in c.get('specialization', [])]
            if filters.get('location'):
                loc = filters['location'].lower()
                contractors = [c for c in contractors 
                             if loc in c.get('location', '').lower()]
            if filters.get('min_rating'):
                contractors = [c for c in contractors 
                             if c.get('rating', 0) >= filters['min_rating']]
            if filters.get('max_rate'):
                contractors = [c for c in contractors 
                             if c.get('hourly_rate', 0) <= filters['max_rate']]
        
        return sorted(contractors, key=lambda x: x.get('rating', 0), reverse=True)
    
    @classmethod
    def update_contractor(cls, contractor_id, data):
        if contractor_id not in cls.contractors:
            return None
        cls.contractors[contractor_id].update(data)
        return cls.contractors[contractor_id]
    
    @classmethod
    def add_bid(cls, project_id, data):
        bid_id = cls.generate_id()
        bid = {
            'id': bid_id,
            'project_id': project_id,
            'contractor_id': data.get('contractor_id'),
            'contractor_name': data.get('contractor_name', ''),
            'amount': data.get('amount', 0),
            'timeline_days': data.get('timeline_days', 0),
            'proposal': data.get('proposal', ''),
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        cls.bids[bid_id] = bid
        return bid
    
    @classmethod
    def get_bids_for_project(cls, project_id):
        return [b for b in cls.bids.values() if b['project_id'] == project_id]
    
    @classmethod
    def get_bids_for_contractor(cls, contractor_id):
        return [b for b in cls.bids.values() if b['contractor_id'] == contractor_id]
    
    @classmethod
    def get_bid(cls, bid_id):
        return cls.bids.get(bid_id)
    
    @classmethod
    def update_bid_status(cls, bid_id, status):
        if bid_id in cls.bids:
            cls.bids[bid_id]['status'] = status
            cls.bids[bid_id]['updated_at'] = datetime.now().isoformat()
            return cls.bids[bid_id]
        return None

contractor_store = ContractorStore()
