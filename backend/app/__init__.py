from flask import Flask, request, jsonify
from flask_cors import CORS
from app.routes.project import project_bp
from app.routes.contractor import contractor_bp
from app.routes.tracking import tracking_bp
from app.routes.auth import auth_bp
from app.routes.admin import admin_bp
from app.routes.architect import architect_bp
from app.database import init_database

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SECRET_KEY'] = 'buildai-secret-key-2024'
    
    init_database()
    
    app.register_blueprint(project_bp, url_prefix='/api')
    app.register_blueprint(contractor_bp, url_prefix='/api/contractors')
    app.register_blueprint(tracking_bp, url_prefix='/api/tracking')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(architect_bp, url_prefix='/api/architect')
    
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy', 'service': 'BuildAI Backend'})
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
