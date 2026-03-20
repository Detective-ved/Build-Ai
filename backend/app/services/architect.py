import requests
import base64
import json
from io import BytesIO

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("Warning: PIL not available, image generation limited")


class GeminiArchitect:
    """Architectural Layout Generator with Image Output"""
    
    GEMINI_API_KEY = "AIzaSyAeDMjT78HQ1aOH9Rw-Zh26UDN7xXpkiPc"
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    
    API_CALL_COUNT = 0
    API_SUCCESS_COUNT = 0
    API_FAIL_COUNT = 0
    
    ROOM_COLORS = {
        'bedroom': '#A8D8EA',
        'bathroom': '#FFE5B4',
        'kitchen': '#FFE4E1',
        'hall': '#E8F5E9',
        'dining': '#FFF9C4',
        'garden': '#C8E6C9',
        'parking': '#ECEFF1',
        'stairs': '#D7CCC8',
        'entrance': '#FFCDD2',
        'corridor': '#F5F5F5',
        'study': '#E1F5FE',
        'balcony': '#B2DFDB',
    }
    
    @staticmethod
    def generate_layout(plot_length, plot_breadth, description="", rooms=None, floors=1, parking=True, garden=False):
        """Generate layout - returns text AND image"""
        GeminiArchitect.API_CALL_COUNT += 1
        
        plot_area = plot_length * plot_breadth
        bedrooms = rooms.get('bedrooms', 2) if rooms else 2
        bathrooms = rooms.get('bathrooms', 2) if rooms else 2
        kitchens = rooms.get('kitchen', 1) if rooms else 1
        halls = rooms.get('hall', 1) if rooms else 1
        dining = rooms.get('dining', 1) if rooms else 1
        study = rooms.get('study', 0) if rooms else 0
        
        text_layout = GeminiArchitect._get_gemini_layout(
            plot_length, plot_breadth, bedrooms, bathrooms, kitchens, halls, dining, study, floors, parking, garden, description
        )
        
        image_base64 = GeminiArchitect._generate_floor_plan_image(
            plot_length, plot_breadth, bedrooms, bathrooms, kitchens, halls, dining, study, floors, parking, garden
        )
        
        GeminiArchitect.API_SUCCESS_COUNT += 1
        
        return {
            'success': True,
            'layout': text_layout,
            'image_base64': image_base64,
            'description': f"Floor plan for {bedrooms} BHK {floors}-storey house on {plot_area} sq ft plot",
            'stats': {
                'total_area': plot_area,
                'built_up_area': int(plot_area * 0.75),
                'carpet_area': int(plot_area * 0.65),
                'efficiency_ratio': '65-75%'
            },
            'plot_details': {
                'length': plot_length,
                'breadth': plot_breadth,
                'area': plot_area,
                'floors': floors,
                'rooms': {
                    'bedrooms': bedrooms, 
                    'bathrooms': bathrooms, 
                    'kitchen': kitchens, 
                    'hall': halls,
                    'dining': dining,
                    'study': study
                }
            }
        }
    
    @staticmethod
    def _get_gemini_layout(length, breadth, bedrooms, bathrooms, kitchens, halls, dining, study, floors, parking, garden, description):
        """Get detailed layout from Gemini AI"""
        
        prompt = f"""You are an expert architect. Design a detailed, practical floor plan for a modern Indian home.

PROPERTY DETAILS:
- Plot Size: {length} ft x {breadth} ft ({length * breadth} sq ft total)
- Number of Floors: {floors}
- Facing: North (main entrance recommended on North or East)

ROOM REQUIREMENTS:
- Bedrooms: {bedrooms} (Master bedroom 14x12 ft, others 12x10 ft)
- Bathrooms: {bathrooms} (attached to master + common)
- Kitchen: {kitchens} (12x10 ft, L-shaped preferred)
- Living/Hall: {halls} ({length * 0.4}x{breadth * 0.35} ft)
- Dining: {dining} (10x10 ft)
- Study Room: {study} (10x8 ft) if needed

OUTDOOR FEATURES:
- Parking: {'Yes - Car porch 12x20 ft with 10 ft gate' if parking else 'No'}
- Garden: {'Yes - landscaped area with trees and plants' if garden else 'No'}

DESIGN PRINCIPLES:
1. Vastu-compliant layout (entry from North/East preferred)
2. Optimal natural light and ventilation
3. Minimal corridor space for maximum efficiency
4. Living room connected to dining and kitchen
5. Bedrooms positioned for privacy (away from noise)
6. Bathrooms adjacent to bedrooms

Please provide:
1. A detailed room-by-room description with approximate dimensions
2. Suggested placement of each room with reasons
3. Entry/exit points marked clearly
4. Window locations for ventilation
5. Storage spaces if any
6. Special features like pooja room if applicable

Format the response clearly with sections for each floor."""
        
        try:
            url = f"{GeminiArchitect.GEMINI_API_URL}?key={GeminiArchitect.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "maxOutputTokens": 2048,
                    "temperature": 0.7,
                    "topP": 0.9
                }
            }
            response = requests.post(url, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result:
                    return result['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print(f"Gemini API error: {e}")
        
        return GeminiArchitect._generate_detailed_layout(length, breadth, bedrooms, bathrooms, kitchens, halls, dining, study, floors, parking, garden)
    
    @staticmethod
    def _generate_detailed_layout(length, breadth, bedrooms, bathrooms, kitchens, halls, dining, study, floors, parking, garden):
        """Generate detailed fallback layout"""
        
        garden_text = "Garden Area" if garden else "Future Extension"
        parking_text = "Car porch 12' x 20' with 10' wide gate" if parking else "No parking provision"
        garden_desc = "Landscaped garden with trees, flowering plants, and sitting area" if garden else "Minimal landscaping along boundaries"
        balcony_text = "+ Balcony" if study > 0 else ""
        bath_text = "(Master Bath)" if bedrooms >= 3 else ""
        floor_label = str(floors - 1) if floors > 1 else "N/A"
        
        sep = "=" * 70
        sep20 = "=" * 20
        sep10 = "=" * 10
        dash66 = "-" * 66
        living_w = int(length * 0.4)
        living_h = int(breadth * 0.3)
        dining_w = int(length * 0.35)
        dining_h = int(breadth * 0.25)
        family_w = int(length * 0.5)
        family_h = int(breadth * 0.25)
        living_area = int(length * 0.4 * breadth * 0.3)
        dining_area = int(length * 0.35 * breadth * 0.25)
        
        layout = f"""
{sep}
MODERN HOME FLOOR PLAN - {length}' x {breadth}' PLOT
Total Area: {length * breadth} sq ft | Floors: {floors} | Bedrooms: {bedrooms} BHK
{sep}

{sep20} GROUND FLOOR {sep20}

NORTH (MAIN ENTRANCE - Vastu Compliant)
    |
    V
+{dash66}+
|  ENTRANCE   |          LIVING / HALL             |
|  PORCH      |    {living_w}' x {living_h}'                          |
|  8' x 6'    |                                    |
|  >>>        |                                    |
+{"-"*20}+{"-"*46}+
|              |         DINING AREA               |
|   STAIRS     |        {dining_w}' x {dining_h}'                       |
|   6' x 10'   |                                    |
+{"-"*16}+{"-"*26}+{"-"*20}+
|             |           |                        |
|  KITCHEN    |  POWDER   |      STORE/Puja       |
|  L-SHAPED   |  ROOM     |      ROOM            |
|  12' x 10'  |  5' x 5'  |      6' x 8'         |
|             |           |                        |
+{"-"*16}+{"-"*26}+{"-"*20}+
|                                                    |
|              OPEN TO                             |
|              GARDEN (South)                      |
|              {garden_text}                       |
|                                                    |
+{dash66}+

{sep}
{"-"*70}

{sep20} FIRST FLOOR ({floor_label}) {sep20}

+{dash66}+
|  MASTER BEDROOM        |      BEDROOM 2          |
|  14' x 12'              |      12' x 10'          |
|  + Attached Bath        |      + Balcony          |
|  8' x 6'                |      6' x 4'            |
|  WALK-IN  |  BATH       |                          |
|  CLOSET   |             |                          |
+{"-"*33}+{"-"*33}+
|              |           |                        |
|  BEDROOM 3   |  COMMON  |      STUDY/              |
|  12' x 10'   |  BATH    |      OFFICE              |
|  {bath_text}  |  8' x 6' |      10' x 8'   {balcony_text}|
+{"-"*33}+{"-"*33}+
|                                                  |
|            FAMILY LIVING / LOUNGE               |
|            {family_w}' x {family_h}'                       |
|            + Open Terrace                       |
|                                                  |
+{dash66}+

{sep}
KEY FEATURES:
{sep}
ENTRIES & EXITS:
- Main Entrance: North side (Vastu compliant)
- Secondary Exit: South towards garden
- Emergency Exit: West side (optional)

PARKING: {parking_text}

GARDEN: {garden_desc}

VASTU CONSIDERATIONS:
- Kitchen: SE corner (Agni corner)
- Pooja Room: NE corner
- Master Bedroom: SW or West
- Living Room: North or East
- Bathrooms: Avoid NE corner

STRUCTURAL ELEMENTS:
- Walls: 6" thick RCC frame
- Columns: 9" x 9"
- Plinth: 2' above ground
- Ceiling Height: 10'
- Staircase: 4' wide, 12 steps per flight

ESTIMATED ROOM SIZES:
- Master Bedroom: 168 sq ft
- Other Bedrooms: 120 sq ft each
- Living Hall: {living_area} sq ft
- Kitchen: 120 sq ft
- Bathrooms: 36-48 sq ft
- Dining: {dining_area} sq ft

TOTAL BUILT-UP AREA: {int(length * breadth * 0.75)} sq ft per floor
CARPET AREA: {int(length * breadth * 0.65)} sq ft per floor
EFFICIENCY: 65-75%
"""
        return layout
    
    @staticmethod
    def _generate_floor_plan_image(plot_length, plot_breadth, bedrooms, bathrooms, kitchens, halls, dining, study, floors, parking, garden):
        """Generate beautiful PNG floor plan image"""
        if not PIL_AVAILABLE:
            return None
        
        try:
            scale = 15
            padding = 80
            extra_top = 100
            extra_bottom = 120
            
            width = int(plot_length * scale + padding * 2)
            height = int(plot_breadth * scale + extra_top + extra_bottom)
            
            img = Image.new('RGB', (width, height), color='#FAFAFA')
            draw = ImageDraw.Draw(img)
            
            try:
                font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
                font_heading = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
                font_room = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 11)
                font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 9)
                font_dim = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 8)
            except:
                font_title = ImageFont.load_default()
                font_heading = font_title
                font_room = font_title
                font_small = font_title
                font_dim = font_title
            
            draw.rectangle([0, 0, width - 1, height - 1], outline='#E0E0E0', width=1)
            
            draw.rectangle([20, 20, width - 20, 60], fill='#2C3E50', outline='#2C3E50')
            draw.text((width // 2, 40), f"MODERN HOME FLOOR PLAN  |  {int(plot_length)}' x {int(plot_breadth)}'  |  {int(plot_length * plot_breadth)} sq ft", 
                     fill='white', font=font_title, anchor='mm')
            
            compass_x, compass_y = width - 60, 100
            draw.ellipse([compass_x - 20, compass_y - 20, compass_x + 20, compass_y + 20], outline='#333', width=2)
            draw.polygon([(compass_x, compass_y - 18), (compass_x - 6, compass_y + 10), (compass_x + 6, compass_y + 10)], fill='#E74C3C')
            draw.text((compass_x, compass_y - 28), "N", fill='#E74C3C', font=font_small, anchor='mm')
            draw.text((compass_x + 25, compass_y), "E", fill='#333', font=font_small, anchor='lm')
            draw.text((compass_x, compass_y + 25), "S", fill='#333', font=font_small, anchor='mm')
            draw.text((compass_x - 25, compass_y), "W", fill='#333', font=font_small, anchor='rm')
            
            plot_x = padding
            plot_y = extra_top
            plot_w = int(plot_length * scale)
            plot_h = int(plot_breadth * scale)
            
            draw.rectangle([plot_x, plot_y, plot_x + plot_w, plot_y + plot_h], outline='#333', width=4)
            
            entrance_x = plot_x + 10
            entrance_y = plot_y
            draw.rectangle([entrance_x, entrance_y - 25, entrance_x + 50, entrance_y], fill='#8BC34A', outline='#666')
            draw.text((entrance_x + 25, entrance_y - 12), "ENTRY", fill='white', font=font_small, anchor='mm')
            draw.polygon([(entrance_x + 15, entrance_y - 5), (entrance_x + 35, entrance_y - 5), (entrance_x + 25, entrance_y - 20)], fill='#333')
            draw.line([(entrance_x + 25, entrance_y - 5), (entrance_x + 25, entrance_y + 5)], fill='#333', width=2)
            
            rooms = []
            cols = 3
            rows = 3
            room_w = plot_w // cols
            room_h = plot_h // rows
            
            room_configs = [
                {'row': 0, 'col': 0, 'name': 'LIVING', 'sub': 'HALL', 'color': '#E8F5E9', 'border': '#4CAF50'},
                {'row': 0, 'col': 1, 'name': 'DINING', 'sub': 'AREA', 'color': '#FFF9C4', 'border': '#FFC107'},
                {'row': 0, 'col': 2, 'name': 'KITCHEN', 'sub': '', 'color': '#FFEBEE', 'border': '#F44336'},
                {'row': 1, 'col': 0, 'name': 'BEDROOM', 'sub': 'MASTER', 'color': '#E3F2FD', 'border': '#2196F3'},
                {'row': 1, 'col': 1, 'name': 'BATH', 'sub': '', 'color': '#FFF3E0', 'border': '#FF9800'},
                {'row': 1, 'col': 2, 'name': 'BEDROOM', 'sub': f'#{2}', 'color': '#E8EAF6', 'border': '#3F51B5'},
                {'row': 2, 'col': 0, 'name': 'STUDY', 'sub': 'ROOM', 'color': '#F3E5F5', 'border': '#9C27B0'},
                {'row': 2, 'col': 1, 'name': 'HALL', 'sub': 'FAMILY', 'color': '#E0F7FA', 'border': '#00BCD4'},
                {'row': 2, 'col': 2, 'name': 'STORE', 'sub': '', 'color': '#ECEFF1', 'border': '#607D8B'},
            ]
            
            for config in room_configs:
                row = config['row']
                col = config['col']
                x1 = plot_x + col * room_w + 4
                y1 = plot_y + row * room_h + 4
                x2 = plot_x + (col + 1) * room_w - 4
                y2 = plot_y + (row + 1) * room_h - 4
                
                draw.rectangle([x1, y1, x2, y2], outline=config['border'], width=3, fill=config['color'])
                
                draw.text((x1 + room_w // 2, y1 + room_h // 2 - 6), config['name'], 
                         fill='#222', font=font_room, anchor='mm')
                if config['sub']:
                    draw.text((x1 + room_w // 2, y1 + room_h // 2 + 8), config['sub'], 
                             fill='#666', font=font_small, anchor='mm')
                
                dim_x = x2 - 30
                dim_y = y2 - 12
                room_size = f"{room_w // scale}'"
                draw.text((dim_x, dim_y), room_size, fill='#888', font=font_dim, anchor='rt')
            
            stair_x = plot_x + 2 * room_w + 4
            stair_y = plot_y + room_h * 2 + 4
            stair_w = room_w - 8
            stair_h = room_h - 8
            draw.rectangle([stair_x, stair_y, stair_x + stair_w, stair_y + stair_h], 
                          outline='#795548', width=3, fill='#D7CCC8')
            draw.text((stair_x + stair_w // 2, stair_y + stair_h // 2), "STAIRS", 
                     fill='#5D4037', font=font_small, anchor='mm')
            for i in range(4):
                sy = stair_y + 5 + i * 8
                draw.line([(stair_x + 5, sy), (stair_x + stair_w - 5, sy)], fill='#8D6E63', width=1)
            
            if parking:
                park_x = plot_x - 60
                park_y = plot_y + plot_h // 2
                park_w = 50
                park_h = 80
                draw.rectangle([park_x, park_y, park_x + park_w, park_y + park_h], 
                              outline='#666', width=2, fill='#ECEFF1')
                draw.text((park_x + park_w // 2, park_y + park_h // 2 - 8), "PARKING", 
                         fill='#333', font=font_small, anchor='mm')
                draw.text((park_x + park_w // 2, park_y + park_h // 2 + 8), "CAR PORCH", 
                         fill='#666', font=font_dim, anchor='mm')
                draw.line([(park_x + park_w, park_y + 10), (park_x + park_w, park_y + park_h - 10)], 
                         fill='#333', width=2)
            
            if garden:
                gar_x = plot_x
                gar_y = plot_y + plot_h + 10
                gar_w = plot_w
                gar_h = 40
                draw.rectangle([gar_x, gar_y, gar_x + gar_w, gar_y + gar_h], 
                              outline='#4CAF50', width=2, fill='#C8E6C9')
                draw.text((gar_x + gar_w // 2, gar_y + gar_h // 2), "GARDEN AREA  🌳  Plants & Landscaping", 
                         fill='#2E7D32', font=font_small, anchor='mm')
                for i in range(3):
                    tx = gar_x + 30 + i * (gar_w - 60) // 2
                    ty = gar_y + gar_h // 2
                    draw.ellipse([tx - 8, ty - 8, tx + 8, ty + 8], fill='#66BB6A')
                    draw.rectangle([tx - 2, ty + 8, tx + 2, ty + 18], fill='#795548')
            
            draw.text((width // 2, height - 40), 
                     f"Plot Area: {int(plot_length * plot_breadth)} sq ft  |  Built-up: {int(plot_length * plot_breadth * 0.75)} sq ft  |  Carpet: {int(plot_length * plot_breadth * 0.65)} sq ft  |  Efficiency: 65-75%",
                     fill='#666', font=font_small, anchor='mm')
            
            legend_x = 30
            legend_y = height - 70
            legend_items = [
                ('Living', '#E8F5E9'),
                ('Bedroom', '#E3F2FD'),
                ('Kitchen', '#FFEBEE'),
                ('Bath', '#FFF3E0'),
                ('Garden', '#C8E6C9'),
                ('Parking', '#ECEFF1'),
            ]
            for i, (name, color) in enumerate(legend_items):
                lx = legend_x + i * 70
                draw.rectangle([lx, legend_y, lx + 15, legend_y + 15], fill=color, outline='#999')
                draw.text((lx + 20, legend_y + 7), name, fill='#333', font=font_dim, anchor='lm')
            
            buffer = BytesIO()
            img.save(buffer, format='PNG', quality=95)
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            
            return image_base64
            
        except Exception as e:
            print(f"Floor plan image error: {e}")
            return None
    
    @staticmethod
    def test_connection():
        """Test API connection"""
        try:
            url = f"{GeminiArchitect.GEMINI_API_URL}?key={GeminiArchitect.GEMINI_API_KEY}"
            response = requests.post(url, json={"contents": [{"parts": [{"text": "hi"}]}]}, timeout=30)
            return response.status_code == 200
        except:
            return False
    
    @staticmethod
    def get_api_stats():
        return {'total': GeminiArchitect.API_CALL_COUNT, 'success': GeminiArchitect.API_SUCCESS_COUNT, 'failed': GeminiArchitect.API_FAIL_COUNT}


def test():
    print("=" * 60)
    print("TESTING: Floor Plan Image Generation")
    print("=" * 60)
    
    result = GeminiArchitect.generate_layout(
        40, 30, 
        floors=2, 
        parking=True, 
        garden=True,
        rooms={'bedrooms': 3, 'bathrooms': 3, 'kitchen': 1, 'hall': 1, 'dining': 1, 'study': 1}
    )
    print(f"Success: {result['success']}")
    print(f"Image: {'YES' if result.get('image_base64') else 'NO'}")
    print(f"Image Size: {len(result.get('image_base64', ''))} bytes")
    print(f"\nLayout Preview:\n{result.get('layout', '')[:500]}...")
    
    if result.get('image_base64'):
        with open('/Users/princetiwari/Desktop/test/backend/floorplan.png', 'wb') as f:
            f.write(base64.b64decode(result['image_base64']))
        print("\nImage saved to /Users/princetiwari/Desktop/test/backend/floorplan.png")


if __name__ == "__main__":
    test()
