#!/usr/bin/env python3
"""
DOCScoin Blockchain Audit System
Псевдоблокчейн для фиксации операций с документами
"""

import sqlite3
import hashlib
import json
from datetime import datetime
import base64

class DOCScoinBlockchain:
    def __init__(self, db_path="audit-blockchain.db"):
        self.db_path = db_path
        self.init_blockchain()
    
    def init_blockchain(self):
        """Инициализация блокчейна SQLite"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Таблица блоков
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS blocks (
            block_number INTEGER PRIMARY KEY AUTOINCREMENT,
            previous_hash TEXT NOT NULL,
            timestamp DATETIME NOT NULL,
            data_hash TEXT NOT NULL,
            merkle_root TEXT NOT NULL,
            nonce INTEGER,
            difficulty INTEGER DEFAULT 4,
            miner TEXT DEFAULT 'DOCScoin-Audit-System'
        )
        """)
        
        # Таблица транзакций (операций)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            tx_id TEXT PRIMARY KEY,
            block_number INTEGER,
            operation_type TEXT NOT NULL,
            operator_id TEXT,
            certificate_thumbprint TEXT,
            document_id TEXT,
            action TEXT, -- 'export', 'sign', 'verify', 'update'
            data_summary TEXT,
            timestamp DATETIME NOT NULL,
            signature TEXT,
            FOREIGN KEY (block_number) REFERENCES blocks(block_number)
        )
        """)
        
        # Генезис-блок (первый блок)
        cursor.execute("SELECT COUNT(*) FROM blocks")
        if cursor.fetchone()[0] == 0:
            self.create_genesis_block(conn)
        
        conn.commit()
        conn.close()
    
    def create_genesis_block(self, conn):
        """Создание генезис-блока"""
        genesis_data = {
            "message": "DOCScoin Audit Blockchain Genesis Block",
            "created": datetime.now().isoformat(),
            "standard_version": "2.0.0"
        }
        
        data_hash = self.hash_data(genesis_data)
        
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO blocks (previous_hash, timestamp, data_hash, merkle_root, nonce)
        VALUES (?, ?, ?, ?, ?)
        """, (
            "0" * 64,  # Нулевой хэш для первого блока
            datetime.now().isoformat(),
            data_hash,
            data_hash,  # Для одного элемента меркл-корень = хэш данных
            0
        ))
        
        # Первая транзакция
        cursor.execute("""
        INSERT INTO transactions (tx_id, block_number, operation_type, timestamp, action, data_summary)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            "GENESIS-TX-001",
            1,
            "system",
            datetime.now().isoformat(),
            "init",
            json.dumps(genesis_data)
        ))
    
    def hash_data(self, data):
        """Хэширование данных"""
        if isinstance(data, dict):
            data_str = json.dumps(data, sort_keys=True)
        else:
            data_str = str(data)
        
        return hashlib.sha256(data_str.encode()).hexdigest()
    
    def record_export_operation(self, operator_id, certificate_hash, document_id, data_summary):
        """Запись операции экспорта в блокчейн"""
        
        # Создаем транзакцию
        tx_id = f"TX-{datetime.now().strftime('%Y%m%d%H%M%S')}-{hashlib.md5(document_id.encode()).hexdigest()[:8]}"
        
        transaction = {
            "tx_id": tx_id,
            "operation_type": "document_export",
            "operator_id": operator_id,
            "certificate_thumbprint": certificate_hash,
            "document_id": document_id,
            "action": "export",
            "data_summary": data_summary,
            "timestamp": datetime.now().isoformat()
        }
        
        # Добавляем в блок
        self.add_transaction_to_block(transaction)
        
        print(f"✅ Операция экспорта зафиксирована в блокчейне: {tx_id}")
        return tx_id
    
    def add_transaction_to_block(self, transaction):
        """Добавление транзакции в новый блок"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Получаем последний блок
        cursor.execute("SELECT block_number, data_hash FROM blocks ORDER BY block_number DESC LIMIT 1")
        last_block = cursor.fetchone()
        
        # Создаем новый блок (упрощенный Proof-of-Stake)
        previous_hash = last_block[1] if last_block else "0" * 64
        block_data = {
            "transactions": [transaction],
            "timestamp": datetime.now().isoformat(),
            "previous_block": previous_hash
        }
        
        data_hash = self.hash_data(block_data)
        
        # "Майним" блок (упрощенно)
        nonce = 0
        while not data_hash.startswith("0000"):  # Упрощенная сложность
            nonce += 1
            block_data["nonce"] = nonce
            data_hash = self.hash_data(block_data)
        
        # Добавляем блок
        cursor.execute("""
        INSERT INTO blocks (previous_hash, timestamp, data_hash, merkle_root, nonce)
        VALUES (?, ?, ?, ?, ?)
        """, (
            previous_hash,
            datetime.now().isoformat(),
            data_hash,
            data_hash,  # Упрощенный меркл-корень
            nonce
        ))
        
        block_number = cursor.lastrowid
        
        # Добавляем транзакцию
        cursor.execute("""
        INSERT INTO transactions 
        (tx_id, block_number, operation_type, operator_id, certificate_thumbprint, 
         document_id, action, data_summary, timestamp, signature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            transaction["tx_id"],
            block_number,
            transaction["operation_type"],
            transaction["operator_id"],
            transaction["certificate_thumbprint"],
            transaction["document_id"],
            transaction["action"],
            transaction["data_summary"],
            transaction["timestamp"],
            transaction.get("signature", "")
        ))
        
        conn.commit()
        conn.close()
        
        return block_number
    
    def verify_document_history(self, document_id):
        """Проверка истории операций с документом"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT tx_id, operation_type, operator_id, timestamp, action, data_summary
        FROM transactions 
        WHERE document_id = ? 
        ORDER BY timestamp
        """, (document_id,))
        
        history = cursor.fetchall()
        conn.close()
        
        if not history:
            print(f"📭 Документ {document_id} не найден в блокчейне")
            return []
        
        print(f"📜 История документа {document_id}:")
        for tx in history:
            print(f"  • {tx[3]} | {tx[1]} | Оператор: {tx[2]} | Действие: {tx[4]}")
        
        return history
    
    def generate_audit_report(self, start_date=None, end_date=None):
        """Генерация отчета аудита"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM transactions WHERE 1=1"
        params = []
        
        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date)
        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date)
        
        query += " ORDER BY timestamp DESC"
        cursor.execute(query, params)
        
        transactions = cursor.fetchall()
        
        report = {
            "generated": datetime.now().isoformat(),
            "period": {"start": start_date, "end": end_date},
            "total_operations": len(transactions),
            "operations_by_type": {},
            "operations_by_operator": {}
        }
        
        for tx in transactions:
            op_type = tx[2]
            operator = tx[3]
            
            report["operations_by_type"][op_type] = report["operations_by_type"].get(op_type, 0) + 1
            report["operations_by_operator"][operator] = report["operations_by_operator"].get(operator, 0) + 1
        
        conn.close()
        
        print(f"📊 Отчет аудита:")
        print(f"   Всего операций: {report['total_operations']}")
        print(f"   По типам: {report['operations_by_type']}")
        
        return report

# Интеграция с генератором документов
if __name__ == "__main__":
    # Тестирование
    blockchain = DOCScoinBlockchain()
    
    # Фиксация экспорта документа
    tx_id = blockchain.record_export_operation(
        operator_id="user_123",
        certificate_hash="SHA1:AB:CD:EF:12:34",
        document_id="DOC-2025-001",
        data_summary="Экспорт трудовой книжки сотрудника Иванова"
    )
    
    # Проверка истории
    blockchain.verify_document_history("DOC-2025-001")
    
    # Генерация отчета
    blockchain.generate_audit_report()