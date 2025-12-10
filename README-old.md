# 🌐 DOCScoin Standard
*Open Standard for Secure Digital Document Management with Blockchain Audit*

[![License: CC BY 4.0](https://img.shields.io/badge/Docs-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
[![License: Apache 2.0](https://img.shields.io/badge/Code-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

## 🎯 Vision

To create a universal, interoperable standard for document management that combines:
- **Structured data** (SQL-like organization)
- **Blockchain audit trails** (immutable access logs) 
- **Multi-level security** (global, national, enterprise)
- **Legal compliance** (GDPR, ФЗ-152, CCPA ready)

## 🏗️ Three-Tier Architecture

| Level | Scope | Key Features |
|-------|-------|--------------|
| **🌍 Global** | International | UUID identifiers, biometric hashes, cross-border consent |
| **🇷🇺🇺🇦 National** | Country-specific | Passport data, tax IDs, military records (RU/UA/US/CN/IN supported) |
| **🏢 Enterprise** | Organization | Employee data, compensation, access control, industry extensions |

## 📚 Quick Navigation

### Specification Documents
- **[Global Level](specification/01-global-level.md)** - International standards and identifiers
- **[National Level](specification/02-national-level.md)** - Country-specific fields (RU, UA, US, CN, IN)
- **[Enterprise Level](specification/03-enterprise-level.md)** - Organizational and HR data
- **[Field Mapping](field-mapping.md)** - Cross-jurisdiction field comparison

### Examples & Tutorials
- **[Basic Profile](examples/basic-profile.json)** - Complete example with all three levels
- **[RU/UA Dual Citizenship](examples/ru-ua-profile.json)** - Handling multiple nationalities

### Governance & Contribution
- **[Contribution Guide](governance/CONTRIBUTING.md)** - How to contribute to the project
- **[Governance Model](governance/GOVERNANCE.md)** - Project structure and decision making
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community behavior guidelines
- **[Changelog](CHANGELOG.md)** - Version history and changes

### Tools & Utilities
- **[JSON Schemas](specification/schemas/)** - Validation schemas

## 🚀 Getting Started

### For Users
1. **Browse examples** in the [`examples/`](examples/) directory
2. **Read specifications** starting with [Global Level](specification/01-global-level.md)
3. **Try validation** with our JSON schemas

### For Developers
```bash
# Clone the repository
git clone https://github.com/docscoinproject/docscoin-spec.git
cd docscoin-spec
```
### For Organizations
1. Review compliance with your local regulations
2. Check industry extensions in Enterprise Level
3. Contact us about implementation consulting

## 🔐 Key Features

### Privacy by Design
- ✅ Encrypted identifiers (AES-256-GCM)
- ✅ Hashed biometric references (SHA3-256)
- ✅ Consent management per jurisdiction
- ✅ Data minimization principles

### Legal Compliance
- ✅ Russia: ФЗ-152, ГОСТ Р 52633.1-2016
- ✅ Ukraine: ЗУ "Про захист персональних даних"
- ✅ EU: GDPR, eIDAS compatibility
- ✅ US: CCPA, HIPAA considerations
- ✅ China: PIPL, GB/T 35273 support

### 🌍 Supported Jurisdictions
| Country | Status | Key | Identifiers |
|---------|--------|-----|-------------|
| 🇷🇺 | Russia | Full | Паспорт, ИНН, СНИЛС, Военный билет |
| 🇺🇦 | Ukraine |	 Full | Паспорт, РНОКПП, ЄДРПОУ, Дія |
| 🇺🇸 | USA | Partial | SSN, Driver License, ITIN |
| 🇨🇳 | China | Partial |	ID Card, Social Credit Code |
| 🇮🇳 | India | Basic | Aadhaar, PAN, Voter ID |
| 🇪🇺 | EU | Reference | eIDAS, National eIDs |

## 📞 Contact & Community

### 🐛 Report Issues & Request Features
[![GitHub Issues](https://img.shields.io/github/issues/docscoinproject/docscoin-spec?color=blue&label=Issues&logo=github)](https://github.com/docscoinproject/docscoin-spec/issues)

GitHub Issues - для багов и запросов функций:

- 🐞 [Report a bug](https://github.com/docscoinproject/docscoin-spec/issues/new?template=bug_report.md) 

- 💡 [Request a feature](https://github.com/docscoinproject/docscoin-spec/issues/new?template=feature_request.md)

GitHub Discussions - для обсуждений:

- 💬 [Join Discussions](https://github.com/docscoinproject/docscoin-spec/discussions)

### 👥 Community Participation
1. Watch репозиторий (↑ сверху) - получайте уведомления
2. Star ⭐ проект - покажите поддержку
3. Fork 🍴 - создайте свою копию для экспериментов

## 📄 License & Attribution
- **Our work**: Licensed under Apache 2.0 (code) and CC BY 4.0 (docs)
- **References**: We reference but do not copy proprietary standards
- **Compliance**: All external references are properly attributed

### DOCScoin Standard v0.1.0 • [View Changelog](https://changelog.md/)