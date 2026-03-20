#!/usr/bin/env python3
# CANTINA ESCOLAR - BACKEND FLASK
# Projeto II - Letícia, Giovana e Henrique C.

import os
import json
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import jwt
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'sua-chave-secreta-aqui')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'sua-chave-jwt-aqui')

# Configuração do banco de dados
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'cantina_db'),
    'user': os.getenv('DB_USER', 'cantina_user'),
    'password': os.getenv('DB_PASSWORD', 'cantina_pass')
}

def get_db_connection():
    """Criar conexão com banco de dados"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco: {e}")
        return None

def token_required(f):
    """Decorator para verificar token JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'erro': 'Token inválido'}), 401
        
        if not token:
            return jsonify({'erro': 'Token ausente'}), 401
        
        try:
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_type = data['user_type']
        except jwt.ExpiredSignatureError:
            return jsonify({'erro': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'erro': 'Token inválido'}), 401
        
        return f(*args, **kwargs)
    return decorated

# ===== ROTAS DE AUTENTICAÇÃO =====

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login de aluno ou funcionário"""
    data = request.get_json()
    username = data.get('username')
    senha = data.get('senha')
    user_type = data.get('user_type', 'aluno')
    
    if not username or not senha:
        return jsonify({'erro': 'Username e senha são obrigatórios'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        if user_type == 'aluno':
            cur.execute('SELECT * FROM usuarios WHERE username = %s', (username,))
            user = cur.fetchone()
            if user and user['senha'] == senha:
                token = jwt.encode(
                    {'user_id': user['id'], 'user_type': 'aluno', 'exp': datetime.utcnow() + timedelta(hours=24)},
                    app.config['JWT_SECRET'],
                    algorithm='HS256'
                )
                return jsonify({
                    'sucesso': True,
                    'token': token,
                    'usuario': {
                        'id': user['id'],
                        'username': user['username'],
                        'nome': user['nome'],
                        'turma': user['turma'],
                        'turno': user['turno'],
                        'email': user['email'],
                        'gasto': float(user['gasto']),
                        'divida': float(user['divida']),
                        'avatar': user['avatar']
                    }
                }), 200
        else:
            cur.execute('SELECT * FROM funcionarios WHERE username = %s', (username,))
            user = cur.fetchone()
            if user and user['senha'] == senha:
                token = jwt.encode(
                    {'user_id': user['id'], 'user_type': 'funcionario', 'exp': datetime.utcnow() + timedelta(hours=24)},
                    app.config['JWT_SECRET'],
                    algorithm='HS256'
                )
                return jsonify({
                    'sucesso': True,
                    'token': token,
                    'usuario': {
                        'id': user['id'],
                        'username': user['username'],
                        'nome': user['nome'],
                        'cargo': user['cargo']
                    }
                }), 200
        
        return jsonify({'erro': 'Username ou senha incorretos'}), 401
    finally:
        cur.close()
        conn.close()

# ===== ROTAS DE PRODUTOS =====

@app.route('/api/produtos', methods=['GET'])
def get_produtos():
    """Listar todos os produtos"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        cur.execute('SELECT * FROM produtos WHERE disponivel = TRUE ORDER BY categoria, nome')
        produtos = cur.fetchall()
        
        resultado = {}
        for p in produtos:
            categoria = p['categoria']
            if categoria not in resultado:
                resultado[categoria] = []
            
            resultado[categoria].append({
                'id': p['id'],
                'nome': p['nome'],
                'preco': float(p['preco']),
                'emoji': p['emoji'],
                'descricao': p['descricao'],
                'calorias': p['calorias'],
                'proteina': float(p['proteina']) if p['proteina'] else 0,
                'carboidratos': float(p['carboidratos']) if p['carboidratos'] else 0,
                'gordura': float(p['gordura']) if p['gordura'] else 0
            })
        
        return jsonify(resultado), 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/produtos/<int:produto_id>', methods=['GET'])
def get_produto(produto_id):
    """Obter detalhes de um produto"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        cur.execute('SELECT * FROM produtos WHERE id = %s', (produto_id,))
        produto = cur.fetchone()
        
        if not produto:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        
        return jsonify({
            'id': produto['id'],
            'nome': produto['nome'],
            'categoria': produto['categoria'],
            'preco': float(produto['preco']),
            'emoji': produto['emoji'],
            'descricao': produto['descricao'],
            'calorias': produto['calorias'],
            'proteina': float(produto['proteina']) if produto['proteina'] else 0,
            'carboidratos': float(produto['carboidratos']) if produto['carboidratos'] else 0,
            'gordura': float(produto['gordura']) if produto['gordura'] else 0
        }), 200
    finally:
        cur.close()
        conn.close()

# ===== ROTAS DE PEDIDOS =====

@app.route('/api/pedidos', methods=['POST'])
@token_required
def criar_pedido():
    """Criar novo pedido"""
    if request.user_type != 'aluno':
        return jsonify({'erro': 'Apenas alunos podem fazer pedidos'}), 403
    
    data = request.get_json()
    itens = data.get('itens', [])
    forma_pagamento = data.get('forma_pagamento')
    
    if not itens or not forma_pagamento:
        return jsonify({'erro': 'Itens e forma de pagamento são obrigatórios'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        # Calcular total
        total = 0
        for item in itens:
            cur.execute('SELECT preco FROM produtos WHERE id = %s', (item['produto_id'],))
            produto = cur.fetchone()
            if produto:
                total += float(produto['preco']) * item['quantidade']
        
        # Gerar ticket
        cur.execute('SELECT MAX(id) FROM pedidos')
        max_id = cur.fetchone()[0] or 0
        ticket = f"A{max_id + 1:03d}"
        
        # Inserir pedido
        cur.execute('''
            INSERT INTO pedidos (usuario_id, total, forma_pagamento, ticket, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        ''', (request.user_id, total, forma_pagamento, ticket, 'entregue'))
        
        pedido_id = cur.fetchone()[0]
        
        # Inserir itens do pedido
        for item in itens:
            cur.execute('SELECT preco FROM produtos WHERE id = %s', (item['produto_id'],))
            produto = cur.fetchone()
            preco_unitario = float(produto['preco'])
            subtotal = preco_unitario * item['quantidade']
            
            cur.execute('''
                INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            ''', (pedido_id, item['produto_id'], item['quantidade'], preco_unitario, subtotal))
        
        # Atualizar gasto do usuário
        cur.execute('UPDATE usuarios SET gasto = gasto + %s WHERE id = %s', (total, request.user_id))
        
        # Se forma de pagamento é "fiado", criar dívida
        if forma_pagamento == 'fiado':
            cur.execute('''
                INSERT INTO dividas (usuario_id, pedido_id, valor, paga)
                VALUES (%s, %s, %s, FALSE)
            ''', (request.user_id, pedido_id, total))
            
            cur.execute('UPDATE usuarios SET divida = divida + %s WHERE id = %s', (total, request.user_id))
        
        conn.commit()
        
        return jsonify({
            'sucesso': True,
            'pedido_id': pedido_id,
            'ticket': ticket,
            'total': total,
            'forma_pagamento': forma_pagamento
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'erro': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/pedidos', methods=['GET'])
@token_required
def get_pedidos():
    """Listar pedidos do usuário"""
    if request.user_type != 'aluno':
        return jsonify({'erro': 'Apenas alunos podem ver seus pedidos'}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        cur.execute('''
            SELECT p.id, p.data, p.total, p.forma_pagamento, p.ticket, p.status
            FROM pedidos p
            WHERE p.usuario_id = %s
            ORDER BY p.data DESC
        ''', (request.user_id,))
        
        pedidos = cur.fetchall()
        resultado = []
        
        for pedido in pedidos:
            cur.execute('''
                SELECT ip.quantidade, pr.nome, pr.preco
                FROM itens_pedido ip
                JOIN produtos pr ON ip.produto_id = pr.id
                WHERE ip.pedido_id = %s
            ''', (pedido['id'],))
            
            itens = cur.fetchall()
            
            resultado.append({
                'id': pedido['id'],
                'data': pedido['data'].isoformat() if pedido['data'] else None,
                'total': float(pedido['total']),
                'forma_pagamento': pedido['forma_pagamento'],
                'ticket': pedido['ticket'],
                'status': pedido['status'],
                'itens': [
                    {
                        'nome': item['nome'],
                        'preco': float(item['preco']),
                        'quantidade': item['quantidade']
                    } for item in itens
                ]
            })
        
        return jsonify(resultado), 200
    finally:
        cur.close()
        conn.close()

# ===== ROTAS DE NOTIFICAÇÕES =====

@app.route('/api/notificacoes', methods=['GET'])
@token_required
def get_notificacoes():
    """Listar notificações do usuário"""
    if request.user_type != 'aluno':
        return jsonify({'erro': 'Apenas alunos podem ver notificações'}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        cur.execute('''
            SELECT id, tipo, titulo, texto, data, lida
            FROM notificacoes_aluno
            WHERE usuario_id = %s
            ORDER BY data DESC
        ''', (request.user_id,))
        
        notificacoes = cur.fetchall()
        
        return jsonify([
            {
                'id': n['id'],
                'tipo': n['tipo'],
                'titulo': n['titulo'],
                'texto': n['texto'],
                'data': n['data'].isoformat() if n['data'] else None,
                'lida': n['lida']
            } for n in notificacoes
        ]), 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/notificacoes-globais', methods=['GET'])
def get_notificacoes_globais():
    """Listar notificações globais"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        cur.execute('''
            SELECT id, tipo, titulo, texto, data, autor
            FROM notificacoes_globais
            ORDER BY data DESC
        ''')
        
        notificacoes = cur.fetchall()
        
        return jsonify([
            {
                'id': n['id'],
                'tipo': n['tipo'],
                'titulo': n['titulo'],
                'texto': n['texto'],
                'data': n['data'].isoformat() if n['data'] else None,
                'autor': n['autor']
            } for n in notificacoes
        ]), 200
    finally:
        cur.close()
        conn.close()

# ===== ROTAS DE DEVEDORES (FUNCIONÁRIO) =====

@app.route('/api/devedores', methods=['GET'])
@token_required
def get_devedores():
    """Listar alunos com dívidas"""
    if request.user_type != 'funcionario':
        return jsonify({'erro': 'Apenas funcionários podem ver devedores'}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        cur.execute('''
            SELECT id, nome, turma, turno, email, divida
            FROM usuarios
            WHERE divida > 0
            ORDER BY divida DESC
        ''')
        
        devedores = cur.fetchall()
        
        return jsonify([
            {
                'id': d['id'],
                'nome': d['nome'],
                'turma': d['turma'],
                'turno': d['turno'],
                'email': d['email'],
                'divida': float(d['divida'])
            } for d in devedores
        ]), 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/devedores/<int:usuario_id>/historico', methods=['GET'])
@token_required
def get_historico_devedor(usuario_id):
    """Listar histórico de pedidos de um devedor"""
    if request.user_type != 'funcionario':
        return jsonify({'erro': 'Apenas funcionários podem ver histórico'}), 403
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'erro': 'Erro ao conectar ao banco'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    try:
        cur.execute('''
            SELECT p.id, p.data, p.total, p.forma_pagamento, p.ticket, p.status
            FROM pedidos p
            WHERE p.usuario_id = %s
            ORDER BY p.data DESC
        ''', (usuario_id,))
        
        pedidos = cur.fetchall()
        resultado = []
        
        for pedido in pedidos:
            cur.execute('''
                SELECT ip.quantidade, pr.nome, pr.preco
                FROM itens_pedido ip
                JOIN produtos pr ON ip.produto_id = pr.id
                WHERE ip.pedido_id = %s
            ''', (pedido['id'],))
            
            itens = cur.fetchall()
            
            resultado.append({
                'id': pedido['id'],
                'data': pedido['data'].isoformat() if pedido['data'] else None,
                'total': float(pedido['total']),
                'forma_pagamento': pedido['forma_pagamento'],
                'ticket': pedido['ticket'],
                'status': pedido['status'],
                'itens': [
                    {
                        'nome': item['nome'],
                        'preco': float(item['preco']),
                        'quantidade': item['quantidade']
                    } for item in itens
                ]
            })
        
        return jsonify(resultado), 200
    finally:
        cur.close()
        conn.close()

# ===== ROTAS DE SAÚDE =====

@app.route('/api/health', methods=['GET'])
def health():
    """Verificar saúde da API"""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({'status': 'ok', 'database': 'connected'}), 200
    else:
        return jsonify({'status': 'error', 'database': 'disconnected'}), 500

# ===== ERRO 404 =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({'erro': 'Rota não encontrada'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'erro': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
