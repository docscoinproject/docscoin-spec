# DOCScoin Template Fields Registry
*Version 1.0.0 | For template generation systems*

## Overview
This registry defines standardized field codes for document template generation.
Each field has a unique code that can be used in Word, Excel, PowerPoint, PDF templates.

## Field Code Structure
{LEVEL}:{CATEGORY}:{FIELD}:{SUBFIELD}@{VERSION}

Example: `GLOBAL:IDENTIFIER:GUID@1.0`

## Field Categories

### Global Level Fields
| Field Code | Description | Data Type | Example Value |
|------------|-------------|-----------|---------------|
| `GLOBAL:IDENTIFIER:GUID` | Global Unique ID | UUID | `f47ac10b-58cc-4372-a567-0e02b2c3d479` |
| `GLOBAL:STATUS:VERIFICATION_LEVEL` | Verification level | Enum | `ENHANCED` |
| `GLOBAL:CONTACT:EMAIL_HASH` | Hashed email | SHA256 | `e3b0c44298fc1c...` |

### National Level Fields (Russia)
| Field Code | Description | Data Type | Format |
|------------|-------------|-----------|--------|
| `NATIONAL:RU:PASSPORT:SERIES` | Серия паспорта | String | `1234` |
| `NATIONAL:RU:PASSPORT:NUMBER` | Номер паспорта | String | `567890` |
| `NATIONAL:RU:TAX:INN` | ИНН | String | `770112345678` |
| `NATIONAL:RU:SOCIAL:SNILS` | СНИЛС | String | `123-456-789 00` |

### National Level Fields (Ukraine)
| Field Code | Description | Data Type | Format |
|------------|-------------|-----------|--------|
| `NATIONAL:UA:PASSPORT:SERIES` | Серія паспорта | String | `АБ` |
| `NATIONAL:UA:PASSPORT:NUMBER` | Номер паспорта | String | `123456` |
| `NATIONAL:UA:TAX:TIN` | РНОКПП | String | `1234567890` |

### Enterprise Level Fields
| Field Code | Description | Data Type | Example |
|------------|-------------|-----------|---------|
| `ENTERPRISE:EMPLOYEE:ID` | Employee ID | String | `EMP-2024-001` |
| `ENTERPRISE:EMPLOYEE:DEPARTMENT` | Department | String | `Engineering` |
| `ENTERPRISE:EMPLOYEE:POSITION` | Position | String | `Senior Developer` |
| `ENTERPRISE:SALARY:BASE` | Base salary | Decimal | `85000` |
| `ENTERPRISE:SALARY:CURRENCY` | Currency | ISO 4217 | `USD` |

## Template Syntax Examples

### Word/PDF Template
Employee: {{ENTERPRISE:EMPLOYEE:FIRST_NAME}} {{ENTERPRISE:EMPLOYEE:LAST_NAME}}
Passport: {{NATIONAL:RU:PASSPORT:SERIES}} {{NATIONAL:RU:PASSPORT:NUMBER}}
Salary: {{ENTERPRISE:SALARY:BASE}} {{ENTERPRISE:SALARY:CURRENCY}}

### Excel Template Formula
=CONCATENATE(
"Employee: ", A1, // A1 = {{ENTERPRISE:EMPLOYEE:FULL_NAME}}
" | Passport: ", B1 // B1 = {{NATIONAL:RU:PASSPORT:FULL}}
)

### PowerPoint Placeholder
- Name: {{ENTERPRISE:EMPLOYEE:FULL_NAME}}
- Department: {{ENTERPRISE:EMPLOYEE:DEPARTMENT}}
- Status: {{GLOBAL:STATUS:VERIFICATION_LEVEL}}


## Implementation Guide

### 1. SQLite Schema
```sql
CREATE TABLE template_fields (
    field_code TEXT PRIMARY KEY,
    description TEXT,
    data_type TEXT,
    json_path TEXT,
    required BOOLEAN DEFAULT FALSE,
    validation_regex TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE templates (
    id INTEGER PRIMARY KEY,
    name TEXT,
    type TEXT,  -- 'word', 'excel', 'powerpoint', 'pdf'
    content BLOB,
    field_codes JSON,  -- Array of field codes used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### 2. JSON Mapping
```json 
{
  "field_mapping": {
    "GLOBAL:IDENTIFIER:GUID": "$.global_unique_id",
    "NATIONAL:RU:PASSPORT:SERIES": "$.national_data.ru.passport.series",
    "ENTERPRISE:EMPLOYEE:ID": "$.enterprise_data.employee.employee_id"
  }
}
```

### 3. Usage Example
```python
# Replace placeholders in template
template = "Hello {{ENTERPRISE:EMPLOYEE:FIRST_NAME}}!"
data = {"enterprise_data": {"employee": {"first_name": "Ivan"}}}
result = replace_placeholders(template, data, field_registry)
# Result: "Hello Ivan!"
```

## Version History
- 1.0.0 (2025-12-09): Initial template fields registry
