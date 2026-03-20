// API CLIENT - Integração com Backend Flask
// Cantina Escolar - Projeto II

const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('cantina_auth_token');

const API = {
  // ===== AUTENTICAÇÃO =====
  
  login: async (username, senha, userType = 'aluno') => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha, user_type: userType })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        authToken = data.token;
        localStorage.setItem('cantina_auth_token', authToken);
        localStorage.setItem('cantina_usuario', JSON.stringify(data.usuario));
        return data;
      } else {
        throw new Error(data.erro || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },
  
  logout: () => {
    authToken = null;
    localStorage.removeItem('cantina_auth_token');
    localStorage.removeItem('cantina_usuario');
  },
  
  // ===== PRODUTOS =====
  
  getProdutos: async () => {
    try {
      const response = await fetch(`${API_URL}/produtos`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Erro ao buscar produtos');
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return {};
    }
  },
  
  getProduto: async (produtoId) => {
    try {
      const response = await fetch(`${API_URL}/produtos/${produtoId}`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Produto não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  },
  
  // ===== PEDIDOS =====
  
  criarPedido: async (itens, formaPagamento) => {
    try {
      if (!authToken) {
        throw new Error('Não autenticado');
      }
      
      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          itens,
          forma_pagamento: formaPagamento
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.erro || 'Erro ao criar pedido');
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  },
  
  getPedidos: async () => {
    try {
      if (!authToken) {
        throw new Error('Não autenticado');
      }
      
      const response = await fetch(`${API_URL}/pedidos`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Erro ao buscar pedidos');
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
  },
  
  // ===== NOTIFICAÇÕES =====
  
  getNotificacoes: async () => {
    try {
      if (!authToken) {
        throw new Error('Não autenticado');
      }
      
      const response = await fetch(`${API_URL}/notificacoes`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Erro ao buscar notificações');
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  },
  
  getNotificacoesGlobais: async () => {
    try {
      const response = await fetch(`${API_URL}/notificacoes-globais`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Erro ao buscar notificações globais');
      }
    } catch (error) {
      console.error('Erro ao buscar notificações globais:', error);
      return [];
    }
  },
  
  // ===== DEVEDORES (FUNCIONÁRIO) =====
  
  getDevedores: async () => {
    try {
      if (!authToken) {
        throw new Error('Não autenticado');
      }
      
      const response = await fetch(`${API_URL}/devedores`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Erro ao buscar devedores');
      }
    } catch (error) {
      console.error('Erro ao buscar devedores:', error);
      return [];
    }
  },
  
  getHistoricoDevedor: async (usuarioId) => {
    try {
      if (!authToken) {
        throw new Error('Não autenticado');
      }
      
      const response = await fetch(`${API_URL}/devedores/${usuarioId}/historico`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Erro ao buscar histórico');
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  },
  
  // ===== SAÚDE =====
  
  health: async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
