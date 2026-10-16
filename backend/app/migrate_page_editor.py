import sqlite3

def migrate():
    conn = sqlite3.connect('storybook.db')
    cursor = conn.cursor()

    # Check and add story_templates columns
    st_cols = [c[1] for c in cursor.execute('PRAGMA table_info(story_templates)').fetchall()]
    for col_name, col_type in [
        ('target_gender', "TEXT DEFAULT 'both'"),
        ('min_age', "INTEGER DEFAULT 2"),
        ('max_age', "INTEGER DEFAULT 13"),
    ]:
        if col_name not in st_cols:
            cursor.execute(f"ALTER TABLE story_templates ADD COLUMN {col_name} {col_type}")
            print(f"Added {col_name} to story_templates")

    # Check and add story_pages columns
    sp_cols = [c[1] for c in cursor.execute('PRAGMA table_info(story_pages)').fetchall()]
    for col_name, col_type in [
        ('face_outline_points', "TEXT DEFAULT ''"),
        ('text_x', "REAL DEFAULT 50.0"),
        ('text_y', "REAL DEFAULT 89.5"),
        ('font_size', "INTEGER DEFAULT 20"),
        ('font_family', "TEXT DEFAULT 'Sans (DejaVu Bold)'"),
        ('font_color', "TEXT DEFAULT '#000000'"),
        ('letter_spacing', "INTEGER DEFAULT 0"),
        ('stroke_color', "TEXT DEFAULT '#FFFFFF'"),
        ('stroke_width', "INTEGER DEFAULT 0"),
        ('has_shadow', "BOOLEAN DEFAULT 1"),
        ('soft_line_break', "BOOLEAN DEFAULT 1"),
        ('has_background_box', "BOOLEAN DEFAULT 0"),
        ('warp_style', "TEXT DEFAULT 'None'"),
        ('gender_variant', "TEXT DEFAULT 'boy'"),
    ]:
        if col_name not in sp_cols:
            cursor.execute(f"ALTER TABLE story_pages ADD COLUMN {col_name} {col_type}")
            print(f"Added {col_name} to story_pages")

    conn.commit()
    conn.close()
    print("Page editor migration complete!")

if __name__ == '__main__':
    migrate()
