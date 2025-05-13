import os
import sqlite3
from datetime import datetime

# Paths
data_lake_path = 'data_lake'  # <-- your path
raw_path = os.path.join(data_lake_path, 'raw')
db_path = os.path.join(data_lake_path, 'metadata.db')

# Ignore these files
ignore_files = {'.DS_Store', 'Thumbs.db', 'desktop.ini'}

# Connect to metadata database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Function to add a file to metadata
def add_file_to_metadata(file_path):
    filename = os.path.basename(file_path)
    if filename in ignore_files:
        print(f"Ignored {filename}.")
        return

    relative_path = os.path.relpath(file_path, data_lake_path)
    filetype = filename.split('.')[-1].lower()
    created_at = datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
    updated_at = datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
    
    # Check if file already exists
    cursor.execute('SELECT id FROM files WHERE filepath = ?', (relative_path,))
    if cursor.fetchone():
        print(f"Skipping {filename} (already in database).")
        return
    
    # Insert new record
    cursor.execute('''
        INSERT INTO files (filename, filepath, filetype, tags, created_at, updated_at, summary_path, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (filename, relative_path, filetype, '', created_at, updated_at, '', ''))
    print(f"Added {filename} to metadata.")

# Walk through all files
for root, dirs, files in os.walk(raw_path):
    for file in files:
        file_path = os.path.join(root, file)
        add_file_to_metadata(file_path)

# Commit and close
conn.commit()
conn.close()

print("Finished scanning and updating metadata.")
