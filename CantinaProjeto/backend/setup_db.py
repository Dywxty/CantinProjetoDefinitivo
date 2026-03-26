#!/usr/bin/env python3
# Script para configurar o banco de dados

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'cantina_db',
    'user': 'cantina_user',
    'password': 'cantina_pass'
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
