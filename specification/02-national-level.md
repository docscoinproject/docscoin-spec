# DOCScoin Standard - Level 2: National
*Version 0.3.0 | Effective: 2024-01-21*

## 1. Overview

The National Level defines country-specific data fields that comply with local regulations while maintaining interoperability with the Global Level. This specification supports multiple jurisdictions simultaneously.

## 2. Architecture Principles

### 2.1 Jurisdictional Modularity
- Each country's requirements in separate namespaces
- No mixing of regulations
- Clear mapping to Global Level

### 2.2 Legal Compliance by Design
- Fields validated against national laws
- Built-in consent management
- Automatic regulatory updates

### 2.3 Multi-Jurisdiction Support
- Single profile can contain data for multiple countries
- Clear separation of legal domains
- Conflict resolution rules

## 3. Supported Jurisdictions

### 3.1 Primary Jurisdictions (Initial Release)

| Country | ISO Code | Key Regulations | Implementation Status |
|---------|----------|----------------|----------------------|
| Russia | RU | ФЗ-152, ГОСТ Р 52633.1-2016 | Full |
| Ukraine | UA | ЗУ "Про захист персональних даних" | Full |
| United States | US | CCPA, HIPAA, GLBA | Partial |
| China | CN | GB/T 35273, PIPL, CSL | Partial |
| India | IN | DPDPA 2023, Aadhaar Act | Basic |
| European Union | EU | GDPR, eIDAS | Reference |

### 3.2 Jurisdictional Dependencies
```yaml
national_profile:
  primary_jurisdiction: "RU"  # Основная юрисдикция
  applicable_jurisdictions: ["RU", "UA", "KZ"]  # Применимые законы
  data_location_rules:
    storage: "jurisdiction_of_origin"
    processing: "consent_based"
    transfer: "adequacy_decision"
```
## 4. Field Definitions by Jurisdiction

### 4.1 Russian Federation (RU) 🇷🇺

#### 4.1.1 Personal Identification
```yaml
# Паспорт гражданина РФ
ru_passport:
  type: object
  required_for: ["RU residents", "RU citizens"]
  fields:
    series:
      type: string
      pattern: "^[0-9]{4}$"
      example: "1234"
      
    number:
      type: string
      pattern: "^[0-9]{6}$"
      example: "567890"
      
    issue_date:
      type: string
      format: "DD.MM.YYYY"
      
    issued_by:
      type: string
      encryption: "partial"  # Код подразделения частично зашифрован
    
    department_code:
      type: string
      pattern: "^[0-9]{3}-[0-9]{3}$"
```
#### 4.1.2 Tax and Social Identification
```yaml
# ИНН (Индивидуальный номер налогоплательщика)
ru_inn:
  type: string
  length: 12
  pattern: "^[0-9]{12}$"
  validation: "контрольная сумма"
  privacy_level: "sensitive"
  storage_requirement: "encrypted_at_rest"

# СНИЛС
ru_snils:
  type: string
  length: 11
  pattern: "^[0-9]{3}-[0-9]{3}-[0-9]{3} [0-9]{2}$"
  example: "123-456-789 01"
  
# ОГРНИП (для ИП)
ru_ogrnip:
  type: string
  length: 15
  pattern: "^[0-9]{15}$"
```

#### 4.1.3 Military Registration
```yaml
ru_military:
  type: object
  required_for: ["RU males 18-27"]
  fields:
    registration_status:
      type: string
      enum: ["registered", "reserve", "exempt", "served"]
      
    vojkomat_code:
      type: string
      encrypted: true
      
    military_id:
      type: string
      pattern: "^[А-Я]{2} [0-9]{7}$"
```
### 4.2 Ukraine (UA) 🇺🇦

#### 4.2.1 Ukrainian Identification
```yaml
# Паспорт громадянина України
ua_passport:
  type: object
  fields:
    series:
      type: string
      pattern: "^[А-Я]{2}$"
      
    number:
      type: string
      pattern: "^[0-9]{6}$"
      
    record_number:
      type: string
      pattern: "^[0-9]{9}$"  # № запису
      
    issue_date:
      type: string
      format: "DD.MM.YYYY"
      
    issued_by:
      type: string
      example: "ДМС України"
```
#### 4.2.2 Tax Identification (РНОКПП)
```yaml
ua_tin:
  type: string
  length: 10
  pattern: "^[0-9]{10}$"
  name: "РНОКПП (ІПН)"
  validation: "control digit algorithm"
  
# Для физических лиц, ведущих предпринимательскую деятельность
ua_edrpou:
  type: string
  length: 8
  pattern: "^[0-9]{8}$"
  applies_to: ["entrepreneurs", "legal_entities"]
```

#### 4.2.3 Social Identification
```yaml
# Номер плательщика налогов (до 2023)
ua_old_tax:
  type: string
  deprecated: true
  
# Електронний кабінет (Дія)
ua_diya_account:
  type: object
  fields:
    has_diya_account: boolean
    verification_level: ["basic", "advanced", "qualified"]
    last_login: "ISO 8601"
```
### 4.3 United States (US) 🇺🇸

#### 4.3.1 US Identification
```yaml
us_identification:
  type: object
  fields:
    ssn:
      type: string
      pattern: "^[0-9]{3}-[0-9]{2}-[0-9]{4}$"
      encryption: "mandatory"
      privacy: "highly_sensitive"
      
    driver_license:
      type: object
      fields:
        state: "ISO 3166-2:US"
        number: string
        expiration: "ISO 8601"
        
    itin:
      type: string  # Individual Taxpayer Identification Number
      pattern: "^9[0-9]{2}-[0-9]{2}-[0-9]{4}$"
```
#### 4.3.2 Compliance Fields
```yaml
us_compliance:
  type: object
  fields:
    fatca_status:
      type: string
      enum: ["exempt", "participating", "non_participating"]
      
    ofac_check:
      type: boolean
      last_check: "ISO 8601"
      
    hipaa_consent:
      type: object
      fields:
        granted: boolean
        purposes: ["treatment", "payment", "operations"]
        expiration: "ISO 8601"
```
### 4.4 China (CN) 🇨🇳

#### 4.4.1 Chinese Identification
```yaml
cn_identification:
  type: object
  fields:
    id_card:
      type: string
      length: 18
      pattern: "^[0-9]{17}[0-9X]$"
      validation: "China ID card checksum"
      encryption: "mandatory_for_storage"
      
    household_registration:
      type: string  # 户口所在地
      format: "encrypted_free_text"
      
    social_credit_code:
      type: string
      pattern: "^[0-9A-Z]{18}$"  # 统一社会信用代码
```
#### 4.4.2 Cybersecurity Law Compliance
```yaml
cn_csl_compliance:
  type: object
  required_for: ["CN_data_subjects"]
  fields:
    data_localization:
      type: boolean
      default: true
      
    security_assessment:
      type: object
      fields:
        required: boolean
        last_assessment: "ISO 8601"
        result: ["passed", "failed", "pending"]
        
    cross_border_transfer:
      type: object
      fields:
        allowed: boolean
        approval_number: string
        destination_countries: ["ISO 3166-1 alpha-2"]
```

### 4.5 India (IN) 🇮🇳

#### 4.5.1 Aadhaar System Integration
```yaml
in_aadhaar:
  type: object
  fields:
    aadhaar_number:
      type: string
      length: 12
      pattern: "^[0-9]{12}$"
      encryption: "mandatory"
      usage_restrictions: ["consent_required"]
      
    virtual_id:
      type: string  # 16-digit VID
      length: 16
      
    kyc_status:
      type: string
      enum: ["eKYC", "offline_KYC", "not_verified"]
      
    authentication_log:
      type: array
      items:
        timestamp: "ISO 8601"
        relying_party: string
        purpose: string
```

#### 4.5.2 Other Indian Identifiers
```yaml
in_other_ids:
  type: object
  fields:
    pan:
      type: string  # Permanent Account Number
      pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
      
    voter_id:
      type: string  # EPIC Number
      pattern: "^[A-Z]{3}[0-9]{7}$"
      
    driving_license:
      type: object
      fields:
        state: string
        number: string
```

## 5. Cross-Jurisdictional Rules

### 5.1 Conflict Resolution
```yaml
conflict_resolution:
  priority_order:
    1. "jurisdiction_of_residence"
    2. "jurisdiction_of_citizenship"
    3. "jurisdiction_of_data_processing"
    
  field_conflicts:
    handling: "separate_namespaces"
    example: "ru_passport and ua_passport can coexist"
    
  legal_conflicts:
    handling: "most_restrictive_applies"
    documentation: "explicit_consent_required"
```

### 5.2 Data Localization Requirements
|Country|Data Must Reside In|          Exceptions        |
|-------|-------------------|----------------------------|
| Russia|    RU territory   | Encryption allowed abroad  |
| China |    CN territory   |Security assessment required|
| India |    IN territory   |      Mirroring allowed     |
|   EU  | Adequate countries|Standard Contractual Clauses|
|   US  |   No restriction  |    Sector-specific rules   |

### 5.3 Consent Management
```yaml
multi_jurisdiction_consent:
  structure:
    - jurisdiction: "RU"
      consent_given: boolean
      purposes: ["tax", "employment", "banking"]
      timestamp: "ISO 8601"
      
    - jurisdiction: "UA"
      consent_given: boolean
      legal_basis: "contractual_necessity"
      timestamp: "ISO 8601"
      
  withdrawal:
    partial_withdrawal: true
    jurisdiction_specific: true
    effect: "processing_stops_for_withdrawn_purposes"
```

## 6. Implementation Examples

### 6.1 Dual Citizenship (RU/UA)
```json
{
  "version": "1.0.0",
  "global_unique_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "national_data": {
    "ru": {
      "passport": {
        "series": "1234",
        "number": "567890",
        "issue_date": "15.01.2020"
      },
      "inn": "ENC[AES256_GCM](770123456789)",
      "military": {
        "registration_status": "served"
      }
    },
    "ua": {
      "passport": {
        "series": "АБ",
        "number": "123456",
        "record_number": "123456789"
      },
      "tin": "1234567890"
    }
  },
  "jurisdictional_rules": {
    "primary_jurisdiction": "RU",
    "conflict_resolution": "separate_namespaces",
    "consent_management": {
      "ru": {"given": true, "timestamp": "2024-01-21T10:00:00Z"},
      "ua": {"given": true, "timestamp": "2024-01-21T10:00:00Z"}
    }
  }
}
```

### 6.2 International Business (US/CN)
```json
{
  "version": "1.0.0",
  "global_unique_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
  "national_data": {
    "us": {
      "ssn": "ENC[AES256_GCM](123-45-6789)",
      "compliance": {
        "fatca_status": "participating",
        "ofac_check": true
      }
    },
    "cn": {
      "id_card": "ENC[AES256_GCM](11010119900307567X)",
      "csl_compliance": {
        "data_localization": true,
        "security_assessment": {
          "required": true,
          "result": "passed"
        }
      }
    }
  }
}
```

## 7. Security and Privacy

### 7.1 Jurisdiction-Specific Encryption
```yaml
encryption_requirements:
  russia:
    algorithm: "GOST 34.12-2015"
    certification: "ФСБ России"
    key_storage: "РФ территория"
    
  china:
    algorithm: "SM4"
    certification: "国家密码管理局"
    key_management: "本土化"
    
  general:
    fallback: "AES-256-GCM"
    quantum_resistance: "planned_2025"
```

### 7.2 Data Sovereignty Controls
```yaml
sovereignty_controls:
  data_location_tracking:
    enabled: true
    blockchain_verification: true
    
  access_jurisdiction_logging:
    enabled: true
    immutable_log: "DOCScoin blockchain"
    
  breach_notification_rules:
    timeline: "72_hours"
    authorities: ["national_dpa", "affected_subjects"]
```

## 8. Compliance Automation

### 8.1 Automatic Regulation Updates
```yaml
regulation_updates:
  mechanism: "smart_contracts"
  sources:
    - "official_gazettes"
    - "dpa_announcements"
    - "court_decisions"
    
  effects:
    - "field_validations_updated"
    - "consent_forms_regenerated"
    - "processing_pauses_if_non_compliant"
```

### 8.2 Compliance Proof Generation
```yaml
compliance_proof:
  generated_for:
    - "data_protection_authorities"
    - "international_partners"
    - "auditors"
    
  includes:
    - "data_flow_maps"
    - "consent_records"
    - "access_logs"
    - "encryption_certificates"
    
  format: "W3C Verifiable Credentials"
```

## 9. Migration and Interoperability

### 9.1 From Legacy Systems
```yaml
migration_paths:
  russia:
    from_1c: "XML transformation"
    from_gosuslugi: "API integration"
    
  ukraine:
    from_diya: "OAuth 2.0"
    from_erp: "CSV mapping"
    
  international:
    from_ldap: "standard_schemas"
    from_hr_systems: "predefined_templates"
```

### 9.2 To International Standards
```yaml
export_formats:
  iso:
    - "ISO/IEC 19794 (biometrics)"
    - "ISO/IEC 24760 (identity)"
    
  un:
    - "UN/CEFACT Core Components"
    
  industry:
    - "FIDO2 (authentication)"
    - "OpenID Connect (authorization)"
```

## Appendix A: Regulatory References

### A.1 Russia (RU)
- Федеральный закон №152-ФЗ "О персональных данных"
- ГОСТ Р 52633.1-2016 "Защита информации"
- Приказ ФСТЭК №21 "Требования к защите ПДн"

### A.2 Ukraine (UA)
- Закон України №2297-VI "Про захист персональних даних"
- НБУ Положення №95 "Про захист інформації"
- Дія (Diia) цифрова ідентифікація

### A.3 United States (US)
- California Consumer Privacy Act (CCPA)
- Health Insurance Portability Act (HIPAA)
- Gramm-Leach-Bliley Act (GLBA)

### A.4 China (CN)
- Personal Information Protection Law (PIPL)
- Cybersecurity Law (CSL)
- GB/T 35273-2020 (Personal information security)

### A.5 India (IN)
- Digital Personal Data Protection Act 2023
- Aadhaar Act 2016
- IT Act 2000 with amendments

## Appendix B: Implementation Checklist

### B.1 For Russian Federation
- Шифрование по ГОСТ 34.12-2015
- Хранение ключей на территории РФ
- Регистрация в Роскомнадзоре
- Уведомление о нарушении за 24 часа

### B.2 For Ukraine
- Інтеграція з Дія.Підпис
- Шифрування AES-256
- Зберігання даних в Україні
- Повідомлення УОПД за 72 години

### B.3 Multi-Jurisdiction
- Clear jurisdictional separation
- Consent management per jurisdiction
- Conflict resolution rules
- Compliance proof generation