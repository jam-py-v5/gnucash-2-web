import sqlite3
import re
import json

# === CONFIGURATION ===
INPUT_SCHEMA_FILE = 'schema.sql'
DB_FILE = 'admin.sqlite'

RESERVED_FIELD_NAMES = {"active", "class", "def", "from", "global", "import", "lambda", "placeholder", "hidden", "progress", "task", "label", "badge", "order", "privileges"}

def sanitize_field_name(name):
    return name + "_f" if name in RESERVED_FIELD_NAMES else name


# SYS_ITEMS config
ITEM_START_ID = 6
PARENT_ID = 2
TASK_ID = 1
TYPE_ID = 10
VISIBLE = 1
DELETED = 0
TABLE_ID = 0

# SYS_FIELDS config
FIELD_START_ID = 15
OWNER_ID = 3
F_ALIGNMENT = 1
F_TEXTAREA = 0
F_DO_NOT_SANITIZE = 0
F_CALC_LOOKUP_FIELD = 0
F_REQUIRED = 0

# === REGEX PATTERNS ===
#create_table_pattern = re.compile(
#    r'CREATE TABLE IF NOT EXISTS\s+"?([A-Z0-9_]+)"?\s*\((.*?)\);',
#    re.IGNORECASE | re.DOTALL
#)
create_table_pattern = re.compile(
    r'CREATE TABLE(?: IF NOT EXISTS)?\s+"?([A-Z0-9_]+)"?\s*\((.*?)\);',
    re.IGNORECASE | re.DOTALL
)

column_pattern = re.compile(
    r'\s*("?)([a-zA-Z_][a-zA-Z0-9_]*)\1\s+([a-zA-Z0-9_()]+)(.*?)(?:,|$)',
    re.IGNORECASE | re.DOTALL
)


# === HELPERS ===
def to_caption(name):
    return name.replace('_', ' ').title()

def to_camel_case(name):
    parts = name.lower().split('_')
    return parts[0] + ''.join(x.capitalize() for x in parts[1:])

def get_f_data_type(sql_type, col_name):
    if 'DATE' in col_name.upper():
        return 5
    sql_type = sql_type.upper()
    if sql_type == 'TEXT':
        return 1
    elif sql_type == 'INTEGER':
        return 2
    elif sql_type == 'BIGINT':
        return 2
    elif sql_type == 'FLAT':
        return 3
    elif sql_type == 'REAL':
        return 4
    return 1

# === READ SCHEMA FILE ===
with open(INPUT_SCHEMA_FILE, 'r', encoding='utf-8') as f:
    schema_sql = f.read()

matches = create_table_pattern.findall(schema_sql)
if not matches:
    print("❌ No valid CREATE TABLE statements found.")
    exit(1)

# === CONNECT TO DB ===
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

cursor.execute("""UPDATE SYS_PARAMS SET F_LANGUAGE=1""")
cursor.execute("""UPDATE SYS_TASKS SET F_DB_TYPE=1, F_ALIAS='demo.sqlite', F_NAME='demo', F_ITEM_NAME='demo'""")

item_id = ITEM_START_ID
field_id = FIELD_START_ID

# Maps
table_to_item_id = {}
item_id_to_pk_field_id = {}

# === INSERT INTO SYS_ITEMS AND SYS_FIELDS ===
for table_name, table_def in matches:
    f_table_name = table_name
    f_item_name = table_name.lower()
    f_name = "_".join(part.capitalize() for part in table_name.replace("DEMO_", "").split("_"))

    cursor.execute("""
        INSERT INTO SYS_ITEMS (
            id, deleted, task_id, type_id, parent, table_id,
            f_name, f_item_name, f_table_name,
            f_visible, f_soft_delete, f_deleted_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item_id, DELETED, TASK_ID, TYPE_ID, PARENT_ID, TABLE_ID,
        f_name, f_item_name, f_table_name,
        VISIBLE, None, None
    ))

    print(f"[SYS_ITEMS] Inserted {table_name} with id={item_id}")
    table_to_item_id[table_name] = item_id

    # Insert fields and collect their IDs
    field_ids = []
    columns = column_pattern.findall(table_def)
    pk_detected = False

    for _, col_name, col_type, col_constraints in columns:
        f_field_name = sanitize_field_name(to_camel_case(col_name))
        f_name = to_caption(col_name)
        f_data_type = get_f_data_type(col_type, col_name)

        cursor.execute("""
            INSERT INTO SYS_FIELDS (
                id, owner_id, task_id, owner_rec_id, deleted,
                f_field_name, f_db_field_name, f_name, f_data_type, f_required,
                f_alignment, f_textarea, f_do_not_sanitize, f_calc_lookup_field
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            field_id, OWNER_ID, TASK_ID, item_id, DELETED,
            f_field_name, col_name, f_name, f_data_type, F_REQUIRED,
            F_ALIGNMENT, F_TEXTAREA, F_DO_NOT_SANITIZE, F_CALC_LOOKUP_FIELD
        ))

        print(f"  ↳ [SYS_FIELDS] {col_name} → {f_field_name}, id={field_id}, type={f_data_type}")

        # 🔍 Detect PRIMARY KEY using constraints string
        if "PRIMARY KEY" in col_constraints.upper() and not pk_detected:
            item_id_to_pk_field_id[item_id] = field_id
            pk_detected = True

        field_ids.append(field_id)
        field_id += 1

    # === BUILD F_INFO JSON ===
    view_section = [[fid, ""] for fid in field_ids]
    edit_section = [
        ["", [[{}, [[fid] for fid in field_ids], ""]]]
    ]
    f_info = {
        "view": {"0": ["", {}, [], {}, view_section, []]},
        "edit": {"0": ["", {}, [], edit_section]},
        "order": [],
        "reports": []
    }
    f_info_str = "json" + json.dumps(f_info)

    # === UPDATE SYS_ITEMS WITH F_INFO ===
    cursor.execute("UPDATE SYS_ITEMS SET f_info = ? WHERE id = ?", (f_info_str, item_id))

    item_id += 1

# === UPDATE SYS_ITEMS WITH f_primary_key ===
for item_id, pk_field_id in item_id_to_pk_field_id.items():
    cursor.execute("UPDATE SYS_ITEMS SET f_primary_key = ? WHERE id = ?", (pk_field_id, item_id))
    print(f"[SYS_ITEMS] Updated item_id={item_id} with f_primary_key={pk_field_id}")

# === COMMIT AND CLOSE ===
conn.commit()
conn.close()

print(f"\n✅ Done. Inserted {item_id - ITEM_START_ID} items and {field_id - FIELD_START_ID} fields.")

