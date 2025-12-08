# Cross-Jurisdiction Field Mapping

## Identification Numbers

| Purpose | Russia | Ukraine | USA | China | India |
|---------|--------|---------|-----|-------|-------|
| Tax ID | ИНН (12 digits) | РНОКПП (10 digits) | SSN (9 digits) | N/A | PAN (10 alnum) |
| National ID | Паспорт (серия+номер) | Паспорт (№ запису) | Driver License | ID Card (18) | Aadhaar (12) |
| Social Security | СНИЛС (11) | N/A | SSN | Social Credit Code | N/A |
| Business ID | ОГРН/ОГРНИП | ЄДРПОУ (8) | EIN | Unified Social Credit | CIN |

## Date Formats
- **Russia/Ukraine**: DD.MM.YYYY
- **USA**: MM/DD/YYYY
- **China/India**: YYYY-MM-DD
- **International**: ISO 8601 (YYYY-MM-DD)

## Name Formats
- **Russia**: Фамилия Имя Отчество
- **Ukraine**: Прізвище Ім'я По-батькові
- **USA/International**: First Middle Last
- **China**: Last First (王小明)
- **India**: Varies by region