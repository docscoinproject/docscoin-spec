#!/usr/bin/env python3
"""
DOCScoin JSON Validator
Validates JSON data against field registry rules
"""

import json
import sqlite3
import re
from typing import Dict, List, Tuple

class DOCScoinValidator:
    def __init__(self, db_path="tools/template-registry.db"):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        
    def validate_json(self, json_data: Dict) -> Tuple[bool, List[str]]:
        """Validate JSON data against field registry"""
        errors = []
        
        # Get all required fields
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT field_code, json_path, validation_pattern, data_type FROM field_registry WHERE required = 1"
        )
        required_fields = cursor.fetchall()
        
        for field in required_fields:
            field_code = field['field_code']
            json_path = field['json_path']
            
            # Check if field exists
            if not self._get_value_by_path(json_data, json_path):
                errors.append(f"❌ Required field missing: {field_code} ({json_path})")
                continue
            
            # Validate pattern if exists
            if field['validation_pattern']:
                value = self._get_value_by_path(json_data, json_path)
                if value and not re.match(field['validation_pattern'], str(value)):
                    errors.append(f"❌ Field {field_code} has invalid format: {value}")
        
        # Additional validations
        self._validate_russian_inn(json_data, errors)
        self._validate_passport_numbers(json_data, errors)
        
        return len(errors) == 0, errors
    
    def _get_value_by_path(self, data: Dict, json_path: str):
        """Get value from JSON using path"""
        path = json_path.replace('$.', '').split('.')
        value = data
        for key in path:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return None
        return value
    
    def _validate_russian_inn(self, data: Dict, errors: List[str]):
        """Validate Russian INN checksum"""
        inn_path = "$.national_data.ru.inn"
        inn = self._get_value_by_path(data, inn_path)
        
        if inn and isinstance(inn, str) and len(inn) == 12:
            # Simple format check (can be enhanced with actual checksum)
            if not inn.isdigit():
                errors.append(f"❌ INN must contain only digits: {inn}")
    
    def _validate_passport_numbers(self, data: Dict, errors: List[str]):
        """Validate passport numbers"""
        # Check RU passport
        ru_series = self._get_value_by_path(data, "$.national_data.ru.passport.series")
        ru_number = self._get_value_by_path(data, "$.national_data.ru.passport.number")
        
        if ru_series and ru_number:
            if not (len(str(ru_series)) == 4 and str(ru_series).isdigit()):
                errors.append(f"❌ RU passport series must be 4 digits: {ru_series}")
            if not (len(str(ru_number)) == 6 and str(ru_number).isdigit()):
                errors.append(f"❌ RU passport number must be 6 digits: {ru_number}")
    
    def generate_validation_report(self, json_data: Dict) -> str:
        """Generate detailed validation report"""
        is_valid, errors = self.validate_json(json_data)
        
        report = [
            "=" * 50,
            "DOCScoin Validation Report",
            "=" * 50,
            f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Valid: {'✅ YES' if is_valid else '❌ NO'}",
            ""
        ]
        
        if errors:
            report.append("Errors found:")
            report.extend(errors)
        else:
            report.append("✅ All validations passed!")
        
        # Field statistics
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM field_registry")
        total_fields = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as required FROM field_registry WHERE required = 1")
        required_fields = cursor.fetchone()['required']
        
        report.extend([
            "",
            "📊 Statistics:",
            f"  Total fields in registry: {total_fields}",
            f"  Required fields: {required_fields}",
            "=" * 50
        ])
        
        return '\n'.join(report)
    
    def close(self):
        self.conn.close()

# Для использования с examples/basic-profile.json
if __name__ == "__main__":
    import sys
    from datetime import datetime
    
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    else:
        json_file = "examples/basic-profile.json"
    
    # Load JSON
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Validate
    validator = DOCScoinValidator()
    report = validator.generate_validation_report(data)
    print(report)
    
    # Check if valid
    is_valid, errors = validator.validate_json(data)
    sys.exit(0 if is_valid else 1)