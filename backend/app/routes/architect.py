from flask import Blueprint, request, jsonify
from app.services.architect import GeminiArchitect

architect_bp = Blueprint('architect', __name__)

@architect_bp.route('/generate-layout', methods=['POST'])
def generate_layout():
    """Generate architectural layout using Gemini AI"""
    data = request.json
    
    if not data.get('plot_length') or not data.get('plot_breadth'):
        return jsonify({'error': 'plot_length and plot_breadth are required'}), 400
    
    try:
        plot_length = float(data.get('plot_length'))
        plot_breadth = float(data.get('plot_breadth'))
        
        if plot_length <= 0 or plot_breadth <= 0:
            return jsonify({'error': 'Plot dimensions must be positive numbers'}), 400
        
        result = GeminiArchitect.generate_layout(
            plot_length=plot_length,
            plot_breadth=plot_breadth,
            description=data.get('description', ''),
            rooms=data.get('rooms'),
            floors=int(data.get('floors', 1)),
            parking=data.get('parking', True),
            garden=data.get('garden', False)
        )
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'layout': result
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to generate layout'),
                'message': result.get('message', 'Please try again')
            }), 500
            
    except ValueError:
        return jsonify({'error': 'Invalid plot dimensions'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@architect_bp.route('/api-stats', methods=['GET'])
def get_api_stats():
    """Get Gemini API usage statistics"""
    return jsonify({
        'success': True,
        'stats': GeminiArchitect.get_api_stats()
    })


@architect_bp.route('/test-connection', methods=['GET'])
def test_connection():
    """Test Gemini API connection"""
    success = GeminiArchitect.test_connection()
    return jsonify({
        'success': success,
        'message': 'API connected successfully' if success else 'API connection failed'
    })


@architect_bp.route('/suggest-rooms', methods=['POST'])
def suggest_rooms():
    """Suggest room configuration based on plot size"""
    data = request.json
    
    plot_length = float(data.get('plot_length', 0))
    plot_breadth = float(data.get('plot_breadth', 0))
    plot_area = plot_length * plot_breadth
    
    suggestions = []
    
    if plot_area < 500:
        suggestions = {
            'floors': 1,
            'rooms': {
                'bedrooms': 1,
                'bathrooms': 1,
                'kitchen': 1,
                'hall': 1
            },
            'max_carpet_area': int(plot_area * 0.7),
            'message': 'Compact single bedroom layout'
        }
    elif plot_area < 1000:
        suggestions = {
            'floors': 1,
            'rooms': {
                'bedrooms': 2,
                'bathrooms': 2,
                'kitchen': 1,
                'hall': 1
            },
            'max_carpet_area': int(plot_area * 0.7),
            'message': '2 BHK layout recommended'
        }
    elif plot_area < 2000:
        suggestions = {
            'floors': 2 if plot_length < 30 else 1,
            'rooms': {
                'bedrooms': 3,
                'bathrooms': 3,
                'kitchen': 1,
                'hall': 2
            },
            'max_carpet_area': int(plot_area * 0.7),
            'message': '3 BHK spacious layout'
        }
    elif plot_area < 4000:
        suggestions = {
            'floors': 2,
            'rooms': {
                'bedrooms': 4,
                'bathrooms': 4,
                'kitchen': 2,
                'hall': 3
            },
            'max_carpet_area': int(plot_area * 0.65),
            'message': '4+ BHK luxury villa layout'
        }
    else:
        suggestions = {
            'floors': 3,
            'rooms': {
                'bedrooms': 5,
                'bathrooms': 5,
                'kitchen': 2,
                'hall': 3
            },
            'max_carpet_area': int(plot_area * 0.6),
            'message': 'Premium mansion layout'
        }
    
    return jsonify({
        'success': True,
        'plot_area': plot_area,
        'suggestions': suggestions
    })
