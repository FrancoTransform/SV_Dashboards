import sqlite3
import pandas as pd

# Settings
data_lake_path = 'data_lake'  # <-- your actual data lake
db_path = f'{data_lake_path}/metadata.db'

# Connect to database
conn = sqlite3.connect(db_path)

# Load files into a dataframe
df = pd.read_sql_query('SELECT * FROM files', conn)

# Function to list all files
def list_all_files():
    print("\n=== All Files in Data Lake ===")
    print(df[['id', 'filename', 'filetype', 'created_at', 'updated_at']])

# Function to filter by file type
def filter_by_type(file_type):
    filtered = df[df['filetype'].str.lower() == file_type.lower()]
    print(f"\n=== Files of type: {file_type} ===")
    print(filtered[['id', 'filename', 'created_at', 'updated_at']])

# Function to sort by created or updated date
def sort_by_date(date_field='created_at', descending=False):
    sorted_df = df.sort_values(by=date_field, ascending=not descending)
    order = "Descending" if descending else "Ascending"
    print(f"\n=== Files sorted by {date_field} ({order}) ===")
    print(sorted_df[['id', 'filename', 'filetype', date_field]])

# Basic Menu
while True:
    print("\n--- Data Lake Explorer ---")
    print("1. List all files")
    print("2. Filter by file type")
    print("3. Sort by creation date")
    print("4. Sort by update date")
    print("5. Exit")

    choice = input("Enter your choice (1-5): ")

    if choice == '1':
        list_all_files()
    elif choice == '2':
        ftype = input("Enter file type (e.g., docx, pptx, png): ")
        filter_by_type(ftype)
    elif choice == '3':
        order = input("Sort descending? (y/n): ").lower() == 'y'
        sort_by_date('created_at', descending=order)
    elif choice == '4':
        order = input("Sort descending? (y/n): ").lower() == 'y'
        sort_by_date('updated_at', descending=order)
    elif choice == '5':
        print("Goodbye!")
        break
    else:
        print("Invalid choice. Try again.")

# Close connection
conn.close()
