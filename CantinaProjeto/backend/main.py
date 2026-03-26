#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import jwt
from functools import wraps

load_dotenv()

app = Flask(__name__, template_folder="../templates", static_folder="../static")
CORS(app)

app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'jwt-secret')

# =========================
# 🔗 CONEXÃO COM NEON
# =========================

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("PGHOST"),
            dbname=os.getenv("PGDATABASE"),
            user=os.getenv("PGUSER"),
            password=os.getenv("PGPASSWORD"),
            sslmode=os.getenv("PGSSLMODE", "require"),
            channel_binding=os.getenv("PGCHANNELBINDING", "require")
        )
        return conn
    except Exception as e:
        print("Erro ao conectar:", e)
        return None

# =========================
# 🔐 JWT
# =========================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except:
                return jsonify({'erro': 'Token inválido'}), 401

        if not token:
            return jsonify({'erro': 'Token ausente'}), 401

        try:
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_type = data['user_type']
        except:
            return jsonify({'erro': 'Token inválido ou expirado'}), 401

        return f(*args, **kwargs)
    return decorated

# =========================
# 🏠 HOME
# =========================

@app.route('/')
def home():
    return render_template("index.html")

# =========================
# 🔐 LOGIN
# =========================

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    senha = data.get("senha")
    tipo = data.get("tipo", "aluno")

    conn = get_db_connection()
    if not conn:
        return jsonify({"erro": "Erro no banco"}), 500

    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        tabela = "usuarios" if tipo == "aluno" else "funcionarios"

        cur.execute(f"SELECT * FROM {tabela} WHERE username = %s", (username,))
        user = cur.fetchone()

        if not user or user["senha"] != senha:
            return jsonify({"erro": "Credenciais inválidas"}), 401

        token = jwt.encode({
            "user_id": user["id"],
            "user_type": tipo,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }, app.config['JWT_SECRET'], algorithm="HS256")

        return jsonify({
            "token": token,
            "usuario": dict(user)
        })

    finally:
        cur.close()
        conn.close()

# =========================
# 🛒 PRODUTOS
# =========================

@app.route('/api/produtos')
def produtos():
    conn = get_db_connection()
    if not conn:
        return jsonify({"erro": "Erro no banco"}), 500

    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cur.execute("SELECT * FROM produtos WHERE disponivel = TRUE")
        produtos = cur.fetchall()
        return jsonify([dict(p) for p in produtos])
    finally:
        cur.close()
        conn.close()

# =========================
# 📦 PEDIDO
# =========================

@app.route('/api/pedido', methods=['POST'])
@token_required
def pedido():
    data = request.json
    itens = data.get("itens", [])
    pagamento = data.get("pagamento")

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        total = 0

        for item in itens:
            cur.execute("SELECT preco FROM produtos WHERE id = %s", (item["id"],))
            preco = cur.fetchone()[0]
            total += preco * item["qtd"]

        cur.execute("""
            INSERT INTO pedidos (usuario_id, total, forma_pagamento)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (request.user_id, total, pagamento))

        pedido_id = cur.fetchone()[0]
        conn.commit()

        return jsonify({
            "sucesso": True,
            "pedido_id": pedido_id,
            "total": total
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# =========================
# ❤️ HEALTH
# =========================

@app.route('/api/health')
def health():
    conn = get_db_connection()
    if conn:
        conn.close()
        return {"status": "ok"}
    return {"status": "erro"}, 500

# =========================
# ▶️ RUN
# =========================

if __name__ == "__main__":
    app.run(debug=True)