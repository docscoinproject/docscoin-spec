# DOCScoin Standard - Level 1: Global
*Version 0.2.0 | Effective: 2024-01-20*

## 1. Overview

The Global Level defines the minimal set of internationally recognized data fields that enable cross-border identification while preserving privacy.

## 2. Core Principles

### 2.1 Privacy by Design
- Store only what is necessary
- Use hashes instead of raw biometrics
- Encrypt all personal identifiers

### 2.2 Interoperability
- Build upon existing international standards
- Support multiple encoding formats
- Machine-readable schemas

### 2.3 Extensibility
- Versioned specifications
- Backward compatibility
- Custom extensions namespace

## 3. International Standards Compliance

This level incorporates metadata from:

### 3.1 ISO/IEC Standards
- **ISO/IEC 19794** (Biometric data interchange formats)
- **ISO/IEC 24760** (Identity management framework)
- **ISO 3166** (Country codes)
- **ISO 8601** (Date and time format)

### 3.2 UN/CEFACT Standards
- **UN/EDIFACT** (Electronic data interchange)
- **UN/LOCODE** (Location codes)

### 3.3 Other Relevant Standards
- **RFC 4122** (UUID generation)
- **W3C Verifiable Credentials**
- **ICAO 9303** (Machine-readable travel documents)

## 4. Required Global Fields

### 4.1 Global Unique Identifier (GUID)
```yaml
field_name: global_unique_id
description: "Globally unique, persistent identifier"
type: string
format: uuid-v4
required: true
generation: "Random UUID version 4"
example: "123e4567-e89b-12d3-a456-426614174000"
standards: "RFC 4122, ISO/IEC 9834-8"
privacy: "Non-correlatable, not derived from personal data"
```

### 4.2 International Person Identifier (IPI)
```yaml
field_name: international_person_identifier
description: "Standardized international identification"
type: object
required: false
fields:
  issuing_authority:
    type: string
    format: "ISO 3166-1 alpha-2 country code"
    example: "US"
    
  identifier_type:
    type: string
    enum: ["PASSPORT", "NATIONAL_ID", "RESIDENCE_PERMIT"]
    
  identifier_number:
    type: string
    encrypted: true
    format: "AES-256-GCM encrypted"
    
  issue_date:
    type: string
    format: "ISO 8601"
    
  expiry_date:
    type: string
    format: "ISO 8601"
```
### 4.3 Biometric Reference Data
```yaml
field_name: biometric_reference
description: "Reference to biometric data (not the data itself)"
type: object
required: false
fields:
  biometric_type:
    type: string
    enum: ["FACE", "FINGERPRINT", "IRIS", "VOICE"]
    
  storage_location:
    type: string
    description: "URI where encrypted biometric is stored"
    
  access_token_hash:
    type: string
    algorithm: "SHA3-256"
    length: 64
    
  verification_protocol:
    type: string
    example: "ISO/IEC 19794-5:2011"
```

### 4.4 International Status Indicators
```yaml
field_name: international_status
description: "Legal and compliance status across jurisdictions"
type: object
fields:
  data_protection_level:
    type: string
    enum: ["GDPR", "CCPA", "PIPL", "LGPD"]
    multiple: true
    
  sanctions_check:
    type: boolean
    default: false
    
  cross_border_consent:
    type: object
    fields:
      granted: boolean
      timestamp: "ISO 8601"
      jurisdictions: ["EU", "US", "CN"]
      
  verification_level:
    type: string
    enum: ["UNVERIFIED", "BASIC", "ENHANCED", "QUALIFIED"]
```

## 5. Optional Global Fields

### 5.1 International Contact Reference
```yaml
field_name: international_contact
type: object
fields:
  verified_email_hash:
    type: string
    algorithm: "SHA256"
    
  verified_phone_hash:
    type: string
    algorithm: "SHA256"
    
  public_key_fingerprint:
    type: string
    description: "PGP/GPG public key ID"
```

### 5.2 International Tax Reference
```yaml
field_name: tax_reference
type: object
fields:
  has_tin:
    type: boolean
    
  jurisdictions:
    type: array
    items: "ISO 3166-1 alpha-2"
    
  tax_treaty_benefits:
    type: boolean
```

## 6. Data Format Specifications

### 6.1 JSON Representation
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://docscoin.org/schemas/global-profile.json",
  "title": "DOCScoin Global Profile",
  "description": "Global level identification data",
  "type": "object",
  "required": ["global_unique_id", "version"],
  "properties": {
    "version": {
      "type": "string",
      "const": "1.0.0"
    },
    "global_unique_id": {
      "type": "string",
      "format": "uuid"
    },
    "international_person_identifier": {
      "$ref": "#/definitions/InternationalPersonIdentifier"
    }
  },
  "definitions": {
    "InternationalPersonIdentifier": {
      "type": "object",
      "properties": {
        "issuing_authority": {
          "type": "string",
          "pattern": "^[A-Z]{2}$"
        }
      }
    }
  }
}
```

### 6.2 XML Representation
```json
<GlobalProfile xmlns="https://docscoin.org/ns/global">
  <Version>1.0.0</Version>
  <GlobalUniqueID>123e4567-e89b-12d3-a456-426614174000</GlobalUniqueID>
  <InternationalStatus>
    <DataProtectionLevel>GDPR</DataProtectionLevel>
    <VerificationLevel>ENHANCED</VerificationLevel>
  </InternationalStatus>
</GlobalProfile>
```

## 7. Security Requirements

### 7.1 Encryption Standards 
|   Data Type  | Algorithm | Key Length | Mode  |
|--------------|-----------|------------|-------|
|  Identifiers |    AES    |  256 bits  |  GCM  |
|Biometric refs|    AES    |  256 bits  |  GCM  |
|   Metadata   | Optional  |            |       |

### 7.2 Hash Functions
- Biometric hashes: SHA3-256
- Token generation: HMAC-SHA256
- Integrity checks: SHA256

### 7.3 Key Management
- Use Hardware Security Modules (HSM) where possible
- Key rotation every 90 days minimum
- Separate keys for each data category

## 8. International Compliance Matrix
| Jurisdiction |   Standard  |   DOCScoin Implementation  |
|--------------|-------------|----------------------------|
|European Union|    eIDAS    |    Level 2-4 compatible    |
|United States | NIST 800-63 |    IAL2/AAL2 compatible    |
|     China    |  GB/T 35273 |Anonymous identifier support|
|International |ISO/IEC 29100|  Privacy framework aligned |

## 9. Versioning and Updates

### 9.1 Version Format
- MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes

### 9.2 Deprecation Policy
- Fields deprecated for 24 months before removal
- Migration paths provided
- Automatic conversion where possible

## 10. Examples

### 10.1 Minimal Valid Profile 
```json
{
  "version": "1.0.0",
  "global_unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "international_status": {
    "verification_level": "BASIC"
  }
}
```

### 10.2 Full International Profile
```json
{
  "version": "1.0.0",
  "global_unique_id": "550e8400-e29b-41d4-a716-446655440000",
  "international_person_identifier": {
    "issuing_authority": "DE",
    "identifier_type": "PASSPORT",
    "identifier_number": "ENC[AES256_GCM](...)",
    "issue_date": "2020-01-15",
    "expiry_date": "2030-01-15"
  },
  "international_status": {
    "data_protection_level": ["GDPR"],
    "verification_level": "ENHANCED",
    "cross_border_consent": {
      "granted": true,
      "timestamp": "2024-01-20T10:30:00Z",
      "jurisdictions": ["EU", "US"]
    }
  }
}
```

## Appendix A: Existing International Identifiers

### A.1 ISO/IEC 29100 Privacy Principles
DOCScoin implements:
- Consent and choice
- Purpose legitimacy and specification
- Collection limitation
- Data minimization
- Use, retention and disclosure limitation
- Accuracy and quality
- Openness, transparency and notice
- Individual participation and access
- Accountability
- Information security
- Privacy compliance

### A.2 ICAO Document 9303
Used for:
- Machine-readable zone (MRZ) compatibility
- Document number formats
- Check digit algorithms

### A.3 UN/CEFACT Core Components
Reused components:
- Date and time representations
- Country codes
- Measurement units