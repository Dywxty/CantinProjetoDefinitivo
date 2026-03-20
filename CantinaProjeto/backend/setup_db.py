#!/usr/bin/env python3
# Script para configurar o banco de dados

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'cantina_db'),
    'user': os.getenv('DB_USER', 'cantina_user'),
    'password': os.getenv('DB_PASSWORD', 'cantina_pass')
}

def setup_database():
    """Criar tabelas e dados iniciais"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Ler e executar schema
        with open('schema.sql', 'r', encoding='utf-8') as f:
            schema = f.read()
        
        # Dividir em comandos individuais
        commands = schema.split(';')
        
        for command in commands:
            command = command.strip()
            if command:
                try:
                    cur.execute(command)
                except psycopg2.Error as e:
                    print(f"Erro ao executar comando: {e}")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print("✅ Banco de dados configurado com sucesso!")
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao conectar ao banco: {e}")

if __name__ == '__main__':
    setup_database()
