import json
from app.database import SessionLocal
from app.models import StoryTemplate, StoryPage

db = SessionLocal()
story = db.query(StoryTemplate).filter(StoryTemplate.title.ilike('%cricket%')).first()
if story:
    story.target_gender = 'both'
    story.min_age = 2
    story.max_age = 13
    story.age_range = 'Ages 2-13'
    if story.pages:
        p1 = story.pages[0]
        p1.story_text = '{{name}} loved cricket more than anything else in the world. Every morning before class, he practiced batting in his backyard'
        p1.character_guidance = "children's storybook illustration, soft colours, consistent character, clean line art"
        p1.scene_description = 'a cozy treehouse at golden hour, storybook illustration, soft light'
        p1.original_image_path = 'storage/source_pages/cricket_p1_base.png'
        pts = [
            [41.5, 43.2], [44.8, 42.1], [48.6, 42.5], [51.9, 44.2], [54.2, 47.5],
            [54.8, 51.3], [53.5, 55.0], [51.2, 58.6], [48.1, 61.2], [45.0, 62.1],
            [41.6, 61.5], [38.2, 59.2], [35.5, 56.1], [34.0, 52.3], [34.2, 48.2],
            [36.1, 45.4], [38.5, 43.8], [40.2, 43.2], [41.0, 43.0], [41.2, 43.1], [41.5, 43.2]
        ]
        p1.face_outline_points = json.dumps(pts)
        p1.text_x = 50.0
        p1.text_y = 89.5
        p1.font_size = 20
        p1.font_family = 'Sans (DejaVu Bold)'
        p1.font_color = '#000000'
        p1.letter_spacing = 0
        p1.stroke_color = '#FFFFFF'
        p1.stroke_width = 0
        p1.has_shadow = True
        p1.soft_line_break = True
        p1.has_background_box = False
        p1.warp_style = 'None'
        p1.gender_variant = 'boy'
    db.commit()
    print("Cricket Page 1 updated successfully with reference data!")
else:
    print("Cricket story not found.")
