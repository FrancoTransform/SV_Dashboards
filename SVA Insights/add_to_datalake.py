import sqlite3

# Connect to your metadata.db
db_path = 'data_lake/metadata.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Add a 'category' column if it doesn't exist
try:
    cursor.execute('ALTER TABLE files ADD COLUMN category TEXT')
    print("Category column added.")
except sqlite3.OperationalError:
    print("Category column already exists. Skipping.")

conn.commit()
conn.close()
