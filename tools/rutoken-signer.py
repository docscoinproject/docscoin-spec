#!/usr/bin/env python3
"""
Упрощенная интеграция с Рутокен для DOCScoin
Для реального использования нужен PKCS#11 модуль
"""

import hashlib
import base64
import json
from datetime import datetime
import os

class MockRutokenSigner:
    """Мок-класс для имитации работы с Рутокен (без реального токена)"""
    
    def __init__(self, pin="123456"):
        self.pin = pin
        self.certificate = self.generate_mock_certificate()
        
    def generate_mock_certificate(self):
        """Генерация мок-сертификата"""
        return {
            "subject": "CN=DOCScoin Test User, O=Test Company, C=RU",
            "serial": "TEST-123456",
            "issuer": "CN=DOCScoin Test CA",
            "valid_from": "2025-01-01",
            "valid_to": "2026-01-01",
            "public_key": "MOCK-RSA-PUBLIC-KEY",
            "token_type": "RUTOKEN_ECP_MOCK"
        }
    
    def sign_data(self, data, hash_algorithm="SHA256"):
        """Подпись данных (мок-реализация)"""
        
        if isinstance(data, dict):
            data_str = json.dumps(data, sort_keys=True)
        else:
            data_str = str(data)
        
        # "Подпись" - просто хэш + метаданные
        if hash_algorithm == "SHA256":
            data_hash = hashlib.sha256(data_str.encode()).digest()
        elif hash_algorithm == "GOST":
            # Имитация ГОСТ 34.11
            data_hash = hashlib.sha256(data_str.encode()).digest()  # Упрощенно
        else:
            data_hash = hashlib.sha256(data_str.encode()).digest()
        
        signature = {
            "signature_id": f"SIG-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "signing_time": datetime.now().isoformat(),
            "signer_certificate": self.certificate,
            "algorithm": f"{hash_algorithm}_with_RSA" if hash_algorithm != "GOST" else "GOST R 34.10-2012",
            "data_hash": base64.b64encode(data_hash).decode('utf-8'),
            "signature_value": base64.b64encode(f"MOCK_SIGNATURE_{data_hash.hex()}".encode()).decode('utf-8'),
            "verification_url": "https://docscoin.org/verify",
            "token_used": True,
            "token_serial": "RT-MOCK-001"
        }
        
        return signature
    
    def verify_signature(self, data, signature):
        """Проверка подписи (мок)"""
        print(f"🔍 Проверка подписи от: {signature.get('signer_certificate', {}).get('subject', 'Unknown')}")
        print(f"   Время подписи: {signature.get('signing_time')}")
        print(f"   Алгоритм: {signature.get('algorithm')}")
        print(f"   Использован токен: {signature.get('token_used', False)}")
        
        # Всегда возвращаем True для мок-реализации
        return True

def integrate_with_generator():
    """Интеграция подписи в генератор документов"""
    
    # 1. Создаем подписывающее устройство
    print("🔐 Инициализация Рутокен...")
    signer = MockRutokenSigner(pin="123456")
    
    # 2. Данные для подписи
    doc_data = {
        "document_id": "DOC-2025-001",
        "employee_name": "Иван Иванов",
        "export_time": datetime.now().isoformat(),
        "purpose": "Трудовая книжка для найма"
    }
    
    # 3. Подписываем
    print("📝 Подписание документа...")
    signature = signer.sign_data(doc_data, hash_algorithm="SHA256")
    
    # 4. Фиксируем в блокчейне
    print("⛓️  Фиксация в блокчейне...")
    blockchain = DOCScoinBlockchain()
    blockchain.record_export_operation(
        operator_id="admin_01",
        certificate_hash=signature["signer_certificate"]["serial"],
        document_id=doc_data["document_id"],
        data_summary=f"Подписан документ: {doc_data['employee_name']}"
    )
    
    # 5. Сохраняем подписанный документ
    signed_document = {
        "version": "DOCScoin v2.0",
        "document": doc_data,
        "signature": signature,
        "blockchain_tx_id": signature["signature_id"]
    }
    
    output_file = f"signed_{doc_data['document_id']}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(signed_document, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Документ подписан и сохранен: {output_file}")
    print(f"🔗 TX ID в блокчейне: {signature['signature_id']}")
    
    return signed_document

if __name__ == "__main__":
    # Демонстрация работы
    signed_doc = integrate_with_generator()
    
    # Проверка подписи
    print("\n" + "="*50)
    verifier = MockRutokenSigner()
    is_valid = verifier.verify_signature(
        signed_doc["document"],
        signed_doc["signature"]
    )
    
    if is_valid:
        print("✅ Подпись действительна")
    else:
        print("❌ Подпись недействительна")