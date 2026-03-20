-- CANTINA ESCOLAR - SCHEMA PostgreSQL
-- Projeto II - Letícia, Giovana e Henrique C.

-- Criar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários (Alunos)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    turma VARCHAR(10) NOT NULL,
    turno VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gasto DECIMAL(10, 2) DEFAULT 0,
    divida DECIMAL(10, 2) DEFAULT 0,
    avatar VARCHAR(10),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Funcionários
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos (Cardápio)
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    emoji VARCHAR(10),
    descricao TEXT,
    calorias INT,
    proteina DECIMAL(5, 2),
    carboidratos DECIMAL(5, 2),
    gordura DECIMAL(5, 2),
    disponivel BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    forma_pagamento VARCHAR(20) NOT NULL,
    ticket VARCHAR(20) UNIQUE,
    status VARCHAR(20) DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens do Pedido
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Tabela de Notificações (Alunos)
CREATE TABLE notificacoes_aluno (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    texto TEXT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE
);

-- Tabela de Notificações Globais (Funcionário)
CREATE TABLE notificacoes_globais (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    texto TEXT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    autor VARCHAR(100) NOT NULL
);

-- Tabela de Dívidas
CREATE TABLE dividas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento TIMESTAMP,
    paga BOOLEAN DEFAULT FALSE,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_funcionarios_username ON funcionarios(username);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_data ON pedidos(data);
CREATE INDEX idx_notificacoes_usuario ON notificacoes_aluno(usuario_id);
CREATE INDEX idx_dividas_usuario ON dividas(usuario_id);

-- Inserir dados iniciais
INSERT INTO usuarios (username, senha, nome, turma, turno, email, gasto, divida, avatar) VALUES
('ana.silva', '123', 'Ana Silva', '3A', 'Manhã', 'ana@escola.edu.br', 0, 0, 'AS'),
('joao.santos', '123', 'João Santos', '2B', 'Tarde', 'joao@escola.edu.br', 47.50, 18.00, 'JS'),
('maria.oliveira', '123', 'Maria Oliveira', '1C', 'Manhã', 'maria@escola.edu.br', 32.00, 0, 'MO');

INSERT INTO funcionarios (username, senha, nome, cargo) VALUES
('admin', '123', 'Admin Cantina', 'Gerente'),
('funcionario1', '456', 'Carla Mendes', 'Atendente');

INSERT INTO produtos (nome, categoria, preco, emoji, descricao, calorias, proteina, carboidratos, gordura) VALUES
-- Salgados
('Coxinha', 'Salgados', 6.00, '🍗', 'Coxinha de frango crocante', 180, 8, 22, 7),
('Enroladinho de Chocolate', 'Salgados', 6.00, '🍫', 'Enroladinho com recheio de chocolate', 200, 4, 30, 8),
('Enroladinho de Presunto', 'Salgados', 6.00, '🌭', 'Enroladinho com presunto e queijo', 190, 9, 20, 8),
('Rissoles', 'Salgados', 6.00, '🥟', 'Rissoles crocantes de carne', 210, 10, 24, 9),
('Bauru', 'Salgados', 6.00, '🥪', 'Bauru quentinho', 220, 11, 25, 10),
('Enroladinho de Calabresa', 'Salgados', 6.00, '🌶️', 'Enroladinho com calabresa', 200, 9, 22, 9),
('Esfirra de Frango', 'Salgados', 6.00, '🍖', 'Esfirra salgada de frango', 190, 10, 20, 8),
('Esfirra de Carne', 'Salgados', 6.00, '🥩', 'Esfirra salgada de carne', 210, 12, 22, 9),
('Esfirra 3 Queijos', 'Salgados', 6.00, '🧀', 'Esfirra com 3 tipos de queijo', 220, 11, 23, 11),
('Pão de Queijo', 'Salgados', 6.00, '🍞', 'Pão de queijo quentinho', 200, 8, 24, 9),
('Esfirra Aberta', 'Salgados', 6.00, '📖', 'Esfirra aberta salgada', 180, 9, 21, 8),

-- Lanches
('X-Tudo', 'Lanches', 12.00, '🍔', 'Hambúrguer com tudo', 450, 20, 45, 20),
('X-Salada', 'Lanches', 12.00, '🥗', 'Hambúrguer com salada', 380, 18, 40, 16),
('X-Bacon', 'Lanches', 12.00, '🥓', 'Hambúrguer com bacon', 480, 22, 42, 22),
('Lanche Natural', 'Lanches', 12.00, '🥬', 'Lanche com ingredientes naturais', 320, 15, 38, 12),
('Sanduíche Simples', 'Lanches', 12.00, '🥪', 'Sanduíche simples', 300, 12, 40, 10),
('Sanduíche de Atum', 'Lanches', 12.00, '🐟', 'Sanduíche com atum fresco', 350, 18, 38, 14),

-- Bebidas
('Café', 'Bebidas', 2.50, '☕', 'Café quente', 5, 0, 1, 0),
('Suco Artificial', 'Bebidas', 3.50, '🧃', 'Suco artificial gelado', 80, 0, 20, 0),
('Suco Natural', 'Bebidas', 6.00, '🍊', 'Suco natural fresco', 90, 1, 22, 0),
('Refri 300ml', 'Bebidas', 5.50, '🥤', 'Refrigerante 300ml', 140, 0, 35, 0),
('Refri 2L', 'Bebidas', 15.00, '🍾', 'Refrigerante 2L', 560, 0, 140, 0),
('Energético', 'Bebidas', 12.00, '⚡', 'Bebida energética', 160, 1, 40, 0),

-- Almoços
('Lasanha', 'Almoços', 25.00, '🍝', 'Lasanha à bolonhesa', 450, 25, 50, 15),
('Arroz Feijão e Bife', 'Almoços', 25.00, '🍚', 'Prato tradicional', 480, 30, 45, 16),
('Strogonoff Arroz e Batata Palha', 'Almoços', 25.00, '🍲', 'Strogonoff cremoso', 520, 28, 48, 18),
('Macarronada', 'Almoços', 25.00, '🍝', 'Macarronada com molho', 460, 22, 52, 14),

-- Utensílios
('Copo Descartável', 'Utensílios', 1.50, '🥤', 'Copo descartável', 0, 0, 0, 0),
('Colher Descartável', 'Utensílios', 0.50, '🥄', 'Colher descartável', 0, 0, 0, 0),
('Garfo e Faca - Almoço', 'Utensílios', 1.00, '🍴', 'Garfo e faca para almoço', 0, 0, 0, 0);

-- Inserir notificações globais
INSERT INTO notificacoes_globais (tipo, titulo, texto, autor) VALUES
('novidade', '🎉 Cardápio renovado!', 'Confira os novos itens disponíveis esta semana. Novos sabores de esfirra chegaram!', 'Cantina'),
('estoque', '⚠️ Atenção: Refri 2L em falta', 'O Refrigerante 2L está temporariamente indisponível. Previsão de reposição: amanhã.', 'Cantina');
