# DOCScoin Security Layer - Hardware Tokens & Blockchain Audit
*Version 2.0.0 | December 2025*

## 1. Hardware Token Support (Рутокен, JaCarta)

### 1.1 Token Requirements
```yaml
supported_tokens:
  rutoken:
    standards: ["PKCS#11", "CryptoPro CSP", " ГОСТ Р 34.10-2012"]
    key_types: ["RSA-2048", "RSA-4096", "GOST R 34.10-2012"]
    features: ["digital_signature", "key_storage", "pin_protection"]
    
  jacarta:
    standards: ["PKCS#11", "Microsoft CryptoAPI"]
    key_types: ["RSA-2048", "RSA-4096", "EC"]
    
  software_fallback:
    standards: ["PKCS#12 (.p12/.pfx)"]
    encryption: ["AES-256", "3DES"]
```	

### 1.2 Signature Format
```json
{
  "document_signature": {
    "signature_id": "SIG-2025-123456",
    "signing_time": "2025-12-11T14:30:00Z",
    "signer_certificate": {
      "subject": "CN=Ivan Ivanov, O=Company LLC, C=RU",
      "serial_number": "1234567890ABCDEF",
      "issuer": "CN=DOCScoin CA, O=DOCScoin",
      "valid_from": "2025-01-01",
      "valid_to": "2026-01-01"
    },
    "signature_algorithm": "GOST R 34.10-2012 with GOST R 34.11-2012",
    "signature_value": "BASE64_ENCODED_SIGNATURE",
    "token_type": "RUTOKEN_ECP",
    "token_serial": "RT-1234-5678"
  }
}
```