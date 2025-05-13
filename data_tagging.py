import sqlite3

# Paths
data_lake_path = 'data_lake'
db_path = f'{data_lake_path}/metadata.db'

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List files without a category
cursor.execute("SELECT id, filename, filetype, category FROM files WHERE category IS NULL OR category = ''")
files = cursor.fetchall()

if not files:
    print("All files are already categorized.")
else:
    print("\n=== Files needing categorization ===")
    for file in files:
        print(f"ID: {file[0]} | {file[1]} | {file[2]} | Category: {file[3]}")

    while True:
        file_id = input("\nEnter file ID to categorize (or 'exit' to finish): ")
        if file_id.lower() == 'exit':
            break
        try:
            file_id = int(file_id)
            category = input("Enter category (workplans, grounding, sampleoutput): ").lower()
            tags = input("Enter tags (comma-separated, or leave empty): ")

            cursor.execute('''
                UPDATE files
                SET category = ?, tags = ?
                WHERE id = ?
            ''', (category, tags, file_id))

            conn.commit()
            print(f"Updated file ID {file_id} with category '{category}' and tags '{tags}'.")
        except ValueError:
            print("Invalid input. Please enter a numeric ID.")

conn.close()
print("Done tagging!")
