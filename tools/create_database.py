#!/usr/bin/env python3
"""
DOCScoin Template Registry Database Creator
Creates SQLite database with template fields registry
"""

import sqlite3
import json
from pathlib import Path

def create_database(db_path="template-registry.db"):
    """Create SQLite database with template registry"""
    
    # Ensure tools directory exists
    Path("tools").mkdir(exist_ok=True)
    
    conn = sqlite3.connect(f"tools/{db_path}")
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_registry (
        field_code TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        jurisdiction TEXT,
        description TEXT NOT NULL,
        data_type TEXT NOT NULL,
        json_path TEXT NOT NULL,
        example_value TEXT,
        required BOOLEAN DEFAULT FALSE,
        validation_pattern TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        template_type TEXT NOT NULL,  -- word, excel, powerpoint, pdf
        description TEXT,
        file_path TEXT,
        field_codes JSON NOT NULL,  -- Array of required field codes
        version TEXT DEFAULT '1.0',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS template_examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER,
        example_name TEXT,
        input_data JSON NOT NULL,
        output_preview TEXT,
        FOREIGN KEY (template_id) REFERENCES templates (id)
    )
    """)
    
    # Insert sample field definitions
    sample_fields = [
        # Global level fields
        (
            "GLOBAL:IDENTIFIER:GUID",
            "IDENTIFIER", "GLOBAL", None,
            "Global Unique Identifier",
            "UUID", "$.global_unique_id",
            "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            1, "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        ),
        # Russia fields
        (
            "NATIONAL:RU:PASSPORT:SERIES",
            "PASSPORT", "NATIONAL", "RU",
            "Серия паспорта РФ",
            "STRING", "$.national_data.ru.passport.series",
            "1234", 1, "^[0-9]{4}$"
        ),
        (
            "NATIONAL:RU:PASSPORT:NUMBER",
            "PASSPORT", "NATIONAL", "RU",
            "Номер паспорта РФ",
            "STRING", "$.national_data.ru.passport.number",
            "567890", 1, "^[0-9]{6}$"
        ),
        # Ukraine fields
        (
            "NATIONAL:UA:PASSPORT:SERIES",
            "PASSPORT", "NATIONAL", "UA",
            "Серія паспорта України",
            "STRING", "$.national_data.ua.passport.series",
            "АБ", 1, "^[А-Я]{2}$"
        ),
        # Enterprise fields
        (
            "ENTERPRISE:EMPLOYEE:ID",
            "EMPLOYEE", "ENTERPRISE", None,
            "Employee ID",
            "STRING", "$.enterprise_data.employee.employee_id",
            "EMP-001", 1, None
        ),
    ]
    
    cursor.executemany("""
    INSERT OR REPLACE INTO field_registry 
    (field_code, category, level, jurisdiction, description, data_type, json_path, example_value, required, validation_pattern)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_fields)
    
    # Insert sample template
    cursor.execute("""
    INSERT INTO templates (name, template_type, description, field_codes)
    VALUES (?, ?, ?, ?)
    """, (
        "Employment Contract (RU)",
        "word",
        "Standard employment contract for Russian employees",
        json.dumps([
            "GLOBAL:IDENTIFIER:GUID",
            "NATIONAL:RU:PASSPORT:SERIES",
            "NATIONAL:RU:PASSPORT:NUMBER",
            "NATIONAL:RU:TAX:INN",
            "ENTERPRISE:EMPLOYEE:ID",
            "ENTERPRISE:EMPLOYEE:PERSON:FIRST_NAME",
            "ENTERPRISE:EMPLOYEE:PERSON:LAST_NAME",
            "ENTERPRISE:EMPLOYEE:POSITION",
            "ENTERPRISE:SALARY:BASE",
            "ENTERPRISE:SALARY:CURRENCY"
        ])
    ))
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database created: tools/{db_path}")
    print("📊 Tables created: field_registry, templates, template_examples")
    print("📝 Sample data inserted")

if __name__ == "__main__":
    create_database()