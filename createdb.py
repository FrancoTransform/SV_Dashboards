import sqlite3

# Connect to the database (creates it if not exists)
conn = sqlite3.connect('data_lake/metadata.db')
cursor = conn.cursor()

# Create the table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        filepath TEXT,
        filetype TEXT,
        tags TEXT,
        created_at TEXT,
        updated_at TEXT,
        summary_path TEXT
    )
''')

conn.commit()
conn.close()

print("Metadata database and table created successfully.")
