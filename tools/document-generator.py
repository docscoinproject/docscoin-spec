#!/usr/bin/env python3
"""
DOCScoin Document Generator
Generates documents from templates using field registry
"""

import sqlite3
import json
import re
from pathlib import Path
import argparse
from datetime import datetime

class DocumentGenerator:
    def __init__(self, db_path="tools/template-registry.db"):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        
    def get_field_value(self, json_data, field_code):
        """Get value from JSON data using field code mapping"""
        cursor = self.conn.cursor()
        
        # Get field definition
        cursor.execute(
            "SELECT json_path, data_type FROM field_registry WHERE field_code = ?",
            (field_code,)
        )
        field = cursor.fetchone()
        
        if not field:
            raise ValueError(f"Field code not found: {field_code}")
        
        # Extract value using JSON path (simplified)
        path = field['json_path'].replace('$.', '').split('.')
        value = json_data
        for key in path:
            if key in value:
                value = value[key]
            else:
                return None
        
        return value
    
    def generate_from_template(self, template_text, json_data):
        """Replace placeholders in template text"""
        
        # Find all placeholders like {{FIELD:CODE}}
        placeholders = re.findall(r'\{\{([A-Z:_]+)\}\}', template_text)
        
        result = template_text
        for field_code in placeholders:
            value = self.get_field_value(json_data, field_code)
            if value is not None:
                result = result.replace(f'{{{{{field_code}}}}}', str(value))
            else:
                # Keep placeholder if value not found
                print(f"⚠️  Warning: No value for {field_code}")
        
        return result
    
    def generate_word_template(self, template_name, json_data, output_path):
        """Generate Word document (simplified - creates .txt for now)"""
        
        # Get template from database
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM templates WHERE name = ?",
            (template_name,)
        )
        template = cursor.fetchone()
        
        if not template:
            raise ValueError(f"Template not found: {template_name}")
        
        # Simple template for demonstration
        word_template = f"""
        EMPLOYMENT CONTRACT
        ===================
        
        Contract ID: {{GLOBAL:IDENTIFIER:GUID}}
        
        EMPLOYEE INFORMATION:
        ---------------------
        Passport: {{NATIONAL:RU:PASSPORT:SERIES}} {{NATIONAL:RU:PASSPORT:NUMBER}}
        Tax ID: {{NATIONAL:RU:TAX:INN}}
        
        Employee ID: {{ENTERPRISE:EMPLOYEE:ID}}
        Position: {{ENTERPRISE:EMPLOYEE:POSITION}}
        
        COMPENSATION:
        -------------
        Base Salary: {{ENTERPRISE:SALARY:BASE}} {{ENTERPRISE:SALARY:CURRENCY}}
        
        Date: {datetime.now().strftime('%Y-%m-%d')}
        """
        
        # Generate document
        document = self.generate_from_template(word_template, json_data)
        
        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(document)
        
        print(f"✅ Document generated: {output_path}")
        return document
    
    def generate_excel_template(self, json_data, output_path):
        """Generate Excel data (CSV for demonstration)"""
        
        # Simple CSV generation
        csv_lines = [
            "Field,Value",
            f"Global ID,{self.get_field_value(json_data, 'GLOBAL:IDENTIFIER:GUID')}",
            f"Passport Series,{self.get_field_value(json_data, 'NATIONAL:RU:PASSPORT:SERIES')}",
            f"Passport Number,{self.get_field_value(json_data, 'NATIONAL:RU:PASSPORT:NUMBER')}",
            f"Employee ID,{self.get_field_value(json_data, 'ENTERPRISE:EMPLOYEE:ID')}",
            f"Position,{self.get_field_value(json_data, 'ENTERPRISE:EMPLOYEE:POSITION')}",
            f"Salary,{self.get_field_value(json_data, 'ENTERPRISE:SALARY:BASE')}",
        ]
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(csv_lines))
        
        print(f"✅ Excel data generated: {output_path}")
    
    def close(self):
        self.conn.close()

def main():
    parser = argparse.ArgumentParser(description='DOCScoin Document Generator')
    parser.add_argument('--data', type=str, required=True, help='JSON data file')
    parser.add_argument('--template', type=str, default='Employment Contract (RU)', help='Template name')
    parser.add_argument('--output-dir', type=str, default='output', help='Output directory')
    
    args = parser.parse_args()
    
    # Create output directory
    Path(args.output_dir).mkdir(exist_ok=True)
    
    # Load JSON data
    with open(args.data, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    # Initialize generator
    generator = DocumentGenerator()
    
    # Generate documents
    word_output = f"{args.output_dir}/contract_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    generator.generate_word_template(args.template, json_data, word_output)
    
    excel_output = f"{args.output_dir}/employee_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    generator.generate_excel_template(json_data, excel_output)
    
    generator.close()
    
    print(f"\n🎉 Documents generated in: {args.output_dir}/")
    print("📄 Word-like document (TXT): contract_*.txt")
    print("📊 Excel data (CSV): employee_data_*.csv")

if __name__ == "__main__":
    main()