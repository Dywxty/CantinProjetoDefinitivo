// =============================================
// CANTINA ESCOLAR - LÓGICA PRINCIPAL
// Projeto II - Letícia, Giovana e Henrique C.
// =============================================

// ===== BANCO DE DADOS (localStorage) =====
const DB = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem('cantina_' + key)) || null;
    } catch { return null; }
  },
  set: (key, value) => {
    localStorage.setItem('cantina_' + key, JSON.stringify(value));
  },
  init: () => {
    if (!DB.get('usuarios')) {
      DB.set('usuarios', {
        'ana.silva': {
          senha: '123',
          nome: 'Ana Silva',
          turma: '3A',
          turno: 'Manhã',
          email: 'ana@escola.edu.br',
          gasto: 0,
          divida: 0,
          notificacoes: [],
          historico: [],
          avatar: 'AS'
        },
        'joao.santos': {
          senha: '123',
          nome: 'João Santos',
          turma: '2B',
          turno: 'Tarde',
          email: 'joao@escola.edu.br',
          gasto: 47.50,
          divida: 18.00,
          notificacoes: [
            { id: 1, tipo: 'divida', titulo: 'Dívida pendente', texto: 'Você tem R$ 18,00 em débito. Por favor, regularize sua situação.', data: new Date(Date.now() - 86400000).toISOString(), lida: false }
          ],
          historico: [
            { id: 1, data: new Date(Date.now() - 86400000).toISOString(), itens: [{ nome: 'X-Tudo', preco: 12.00, qtd: 1 }, { nome: 'Suco Natural', preco: 6.00, qtd: 1 }], total: 18.00, formaPagamento: 'fiado', ticket: 'A042', status: 'entregue' },
            { id: 2, data: new Date(Date.now() - 172800000).toISOString(), itens: [{ nome: 'Coxinha', preco: 6.00, qtd: 2 }, { nome: 'Café', preco: 2.50, qtd: 1 }], total: 14.50, formaPagamento: 'pix', ticket: 'A038', status: 'entregue' },
            { id: 3, data: new Date(Date.now() - 259200000).toISOString(), itens: [{ nome: 'Prato do Dia', preco: 25.00, qtd: 1 }], total: 25.00, formaPagamento: 'pix', ticket: 'A031', status: 'entregue' }
          ],
          avatar: 'JS'
        },
        'maria.oliveira': {
          senha: '123',
          nome: 'Maria Oliveira',
          turma: '1C',
          turno: 'Manhã',
          email: 'maria@escola.edu.br',
          gasto: 32.00,
          divida: 0,
          notificacoes: [
            { id: 1, tipo: 'novidade', titulo: '🍕 Novo item no cardápio!', texto: 'Experimente nossa nova Esfirra 3 Queijos, quentinha e deliciosa!', data: new Date().toISOString(), lida: false }
          ],
          historico: [
            { id: 1, data: new Date(Date.now() - 86400000).toISOString(), itens: [{ nome: 'Lanche Natural', preco: 12.00, qtd: 1 }, { nome: 'Suco Artificial', preco: 3.50, qtd: 1 }], total: 15.50, formaPagamento: 'pix', ticket: 'A045', status: 'entregue' },
            { id: 2, data: new Date(Date.now() - 172800000).toISOString(), itens: [{ nome: 'Rissoles', preco: 6.00, qtd: 2 }, { nome: 'Café', preco: 2.50, qtd: 1 }], total: 14.50, formaPagamento: 'dinheiro', ticket: 'A039', status: 'entregue' }
          ],
          avatar: 'MO'
        }
      });
    }

    if (!DB.get('funcionarios')) {
      DB.set('funcionarios', {
        'admin': { senha: '123', nome: 'Admin Cantina', cargo: 'Gerente' },
        'funcionario1': { senha: '456', nome: 'Carla Mendes', cargo: 'Atendente' }
      });
    }

    if (!DB.get('notificacoes_globais')) {
      DB.set('notificacoes_globais', [
        { id: 1, tipo: 'novidade', titulo: '🎉 Cardápio renovado!', texto: 'Confira os novos itens disponíveis esta semana. Novos sabores de esfirra chegaram!', data: new Date().toISOString(), autor: 'Cantina' },
        { id: 2, tipo: 'estoque', titulo: '⚠️ Atenção: Refri 2L em falta', texto: 'O Refrigerante 2L está temporariamente indisponível. Previsão de reposição: amanhã.', data: new Date(Date.now() - 3600000).toISOString(), autor: 'Cantina' }
      ]);
    }

    if (!DB.get('pedidos')) {
      DB.set('pedidos', []);
    }

    if (!DB.get('cardapio_custom')) {
      DB.set('cardapio_custom', {});
    }
  }
};

// ===== CARDÁPIO =====
const CARDAPIO = {
  'Salgados': {
    icon: '🥐',
    cor: '#FFF3CD',
    itens: {
      'Coxinha': { preco: 6.00, emoji: '🍗', desc: 'Coxinha de frango crocante', calorias: 180, proteina: 8, carbs: 22, gordura: 7 },
      'Enroladinho de Chocolate': { preco: 6.00, emoji: '🍫', desc: 'Enroladinho com recheio de chocolate', calorias: 200, proteina: 4, carbs: 30, gordura: 8 },
      'Enroladinho de Presunto': { preco: 6.00, emoji: '🥩', desc: 'Enroladinho com presunto e queijo', calorias: 190, proteina: 9, carbs: 22, gordura: 9 },
      'Rissoles': { preco: 6.00, emoji: '🫓', desc: 'Rissoles de frango cremoso', calorias: 170, proteina: 7, carbs: 20, gordura: 7 },
      'Bauru': { preco: 6.00, emoji: '🥪', desc: 'Pão com presunto, queijo e tomate', calorias: 220, proteina: 12, carbs: 28, gordura: 8 },
      'Enroladinho de Calabresa': { preco: 6.00, emoji: '🌶️', desc: 'Enroladinho com calabresa temperada', calorias: 210, proteina: 8, carbs: 22, gordura: 11 },
      'Esfirra de Frango': { preco: 6.00, emoji: '🫔', desc: 'Esfirra recheada com frango', calorias: 185, proteina: 10, carbs: 24, gordura: 6 },
      'Esfirra de Carne': { preco: 6.00, emoji: '🥩', desc: 'Esfirra recheada com carne moída', calorias: 195, proteina: 11, carbs: 24, gordura: 8 },
      'Esfirra 3 Queijos': { preco: 6.00, emoji: '🧀', desc: 'Esfirra com blend de 3 queijos', calorias: 200, proteina: 9, carbs: 24, gordura: 9 },
      'Pão de Queijo': { preco: 6.00, emoji: '🧀', desc: 'Pão de queijo mineiro quentinho', calorias: 150, proteina: 5, carbs: 18, gordura: 7 },
      'Esfirra Aberta': { preco: 6.00, emoji: '🍕', desc: 'Esfirra aberta com recheio à escolha', calorias: 175, proteina: 8, carbs: 22, gordura: 7 }
    }
  },
  'Lanches': {
    icon: '🍔',
    cor: '#FDE8D8',
    itens: {
      'X-Tudo': { preco: 12.00, emoji: '🍔', desc: 'Hambúrguer completo com tudo', calorias: 650, proteina: 35, carbs: 55, gordura: 28 },
      'X-Salada': { preco: 12.00, emoji: '🥗', desc: 'Hambúrguer com salada fresca', calorias: 520, proteina: 30, carbs: 48, gordura: 20 },
      'X-Bacon': { preco: 12.00, emoji: '🥓', desc: 'Hambúrguer com bacon crocante', calorias: 680, proteina: 38, carbs: 50, gordura: 32 },
      'Lanche Natural': { preco: 12.00, emoji: '🥙', desc: 'Lanche saudável com vegetais', calorias: 380, proteina: 20, carbs: 42, gordura: 12 },
      'Sanduíche Simples': { preco: 12.00, emoji: '🥪', desc: 'Sanduíche com presunto e queijo', calorias: 420, proteina: 22, carbs: 45, gordura: 15 },
      'Sanduíche de Atum': { preco: 12.00, emoji: '🐟', desc: 'Sanduíche com atum temperado', calorias: 390, proteina: 28, carbs: 40, gordura: 12 }
    }
  },
  'Bebidas': {
    icon: '🥤',
    cor: '#D5F5E3',
    itens: {
      'Café': { preco: 2.50, emoji: '☕', desc: 'Café fresquinho', calorias: 5, proteina: 0, carbs: 1, gordura: 0 },
      'Suco Artificial': { preco: 3.50, emoji: '🧃', desc: 'Suco de caixinha variado', calorias: 110, proteina: 0, carbs: 27, gordura: 0 },
      'Suco Natural': { preco: 6.00, emoji: '🍊', desc: 'Suco natural feito na hora', calorias: 120, proteina: 1, carbs: 28, gordura: 0 },
      'Refri 300ml': { preco: 5.50, emoji: '🥤', desc: 'Refrigerante lata 300ml', calorias: 130, proteina: 0, carbs: 35, gordura: 0 },
      'Refri 2L': { preco: 15.00, emoji: '🍾', desc: 'Refrigerante garrafa 2 litros', calorias: 870, proteina: 0, carbs: 234, gordura: 0 },
      'Energético': { preco: 12.00, emoji: '⚡', desc: 'Bebida energética 250ml', calorias: 110, proteina: 1, carbs: 28, gordura: 0 }
    }
  },
  'Almoço': {
    icon: '🍽️',
    cor: '#D6EAF8',
    itens: {
      'Prato do Dia': { preco: 25.00, emoji: '🍽️', desc: 'Prato completo do dia', calorias: 750, proteina: 45, carbs: 80, gordura: 22 }
    }
  },
  'Utensílios': {
    icon: '🍴',
    cor: '#F0F0F0',
    itens: {
      'Copo Descartável': { preco: 1.50, emoji: '🥤', desc: 'Copo descartável 200ml', calorias: 0, proteina: 0, carbs: 0, gordura: 0 },
      'Colher Descartável': { preco: 0, emoji: '🥄', desc: 'Cortesia da cantina', calorias: 0, proteina: 0, carbs: 0, gordura: 0 },
      'Garfo e Faca (Almoço)': { preco: 0, emoji: '🍴', desc: 'Incluído no almoço', calorias: 0, proteina: 0, carbs: 0, gordura: 0 }
    }
  }
};

const ALMOCO_SEMANA = [
  { dia: 'Segunda-feira', prato: 'Lasanha à Bolonhesa', desc: 'Lasanha de carne com molho bolonhesa e queijo gratinado', emoji: '🍝', extras: 'Salada verde + Suco' },
  { dia: 'Terça-feira', prato: 'Arroz, Feijão e Bife', desc: 'Arroz branco, feijão temperado e bife grelhado', emoji: '🍖', extras: 'Salada + Farofa' },
  { dia: 'Quarta-feira', prato: 'Strogonoff', desc: 'Strogonoff de frango com arroz e batata palha', emoji: '🍛', extras: 'Arroz + Batata Palha' },
  { dia: 'Quinta-feira', prato: 'Macarronada', desc: 'Macarrão ao molho vermelho com carne moída', emoji: '🍝', extras: 'Parmesão + Salada' },
  { dia: 'Sexta-feira', prato: 'Frango Grelhado', desc: 'Frango grelhado com legumes e purê de batata', emoji: '🍗', extras: 'Purê + Legumes' }
];

// ===== ESTADO DA APLICAÇÃO =====
let STATE = {
  currentPage: 'home',
  currentUser: null,
  currentRole: null, // 'aluno' | 'funcionario'
  cart: [],
  carouselIndex: 0
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  checkSession();
  renderPage('home');
  setupToastContainer();
});

function checkSession() {
  const session = DB.get('session');
  if (session) {
    STATE.currentUser = session.user;
    STATE.currentRole = session.role;
  }
}

function setupToastContainer() {
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }
}

// ===== ROTEAMENTO =====
function renderPage(page, params = {}) {
  STATE.currentPage = page;
  const main = document.getElementById('main-content');
  if (!main) return;

  // Verificações de acesso
  const protectedAluno = ['dashboard', 'cardapio', 'carrinho', 'historico', 'nutricional', 'notificacoes'];
  const protectedFunc = ['painel-funcionario', 'devedores', 'notif-funcionario'];

  if (protectedAluno.includes(page) && (!STATE.currentUser || STATE.currentRole !== 'aluno')) {
    renderPage('login-aluno');
    return;
  }

  if (protectedFunc.includes(page) && (!STATE.currentUser || STATE.currentRole !== 'funcionario')) {
    renderPage('login-funcionario');
    return;
  }

  main.innerHTML = '';
  main.className = 'fade-in';

  switch (page) {
    case 'home': renderHome(main); break;
    case 'login-aluno': renderLoginAluno(main); break;
    case 'cadastro': renderCadastro(main); break;
    case 'login-funcionario': renderLoginFuncionario(main); break;
    case 'dashboard': renderDashboard(main); break;
    case 'cardapio': renderCardapio(main); break;
    case 'historico': renderHistorico(main); break;
    case 'nutricional': renderNutricional(main); break;
    case 'notificacoes': renderNotificacoes(main); break;
    case 'painel-funcionario': renderPainelFuncionario(main); break;
    case 'devedores': renderDevedores(main); break;
    case 'notif-funcionario': renderNotifFuncionario(main); break;
    default: renderHome(main);
  }

  updateNavbar();
  window.scrollTo(0, 0);
}

// ===== NAVBAR =====
function updateNavbar() {
  const navLinks = document.getElementById('nav-links');
  const navUser = document.getElementById('nav-user');
  if (!navLinks) return;

  navLinks.innerHTML = '';

  if (!STATE.currentUser) {
    navLinks.innerHTML = `
      <li><button onclick="renderPage('home')" class="${STATE.currentPage === 'home' ? 'btn-nav-active' : ''}">🏠 Início</button></li>
      <li><button onclick="renderPage('login-aluno')">👤 Entrar</button></li>
      <li><button onclick="renderPage('login-funcionario')">👔 Funcionário</button></li>
    `;
    if (navUser) navUser.innerHTML = '';
  } else if (STATE.currentRole === 'aluno') {
    const user = getUsuario(STATE.currentUser);
    const notifNaoLidas = user ? user.notificacoes.filter(n => !n.lida).length : 0;
    navLinks.innerHTML = `
      <li><button onclick="renderPage('dashboard')" class="${STATE.currentPage === 'dashboard' ? 'btn-nav-active' : ''}">🏠 Início</button></li>
      <li><button onclick="renderPage('cardapio')" class="${STATE.currentPage === 'cardapio' ? 'btn-nav-active' : ''}">🍽️ Cardápio</button></li>
      <li><button onclick="renderPage('historico')" class="${STATE.currentPage === 'historico' ? 'btn-nav-active' : ''}">📋 Histórico</button></li>
      <li><button onclick="renderPage('nutricional')" class="${STATE.currentPage === 'nutricional' ? 'btn-nav-active' : ''}">🥗 Nutricional</button></li>
      <li><button onclick="renderPage('notificacoes')" class="${STATE.currentPage === 'notificacoes' ? 'btn-nav-active' : ''}">🔔 Avisos${notifNaoLidas > 0 ? `<span class="badge-notif">${notifNaoLidas}</span>` : ''}</button></li>
      <li><button onclick="logout()" style="color:#c0392b">🚪 Sair</button></li>
    `;
    if (navUser && user) {
      navUser.innerHTML = `
        <div class="navbar-user">
          <div class="user-avatar">${user.avatar}</div>
          <span class="user-name">${user.nome.split(' ')[0]}</span>
        </div>
      `;
    }
  } else if (STATE.currentRole === 'funcionario') {
    const func = getFuncionario(STATE.currentUser);
    navLinks.innerHTML = `
      <li><button onclick="renderPage('painel-funcionario')" class="${STATE.currentPage === 'painel-funcionario' ? 'btn-nav-active' : ''}">📊 Painel</button></li>
      <li><button onclick="renderPage('devedores')" class="${STATE.currentPage === 'devedores' ? 'btn-nav-active' : ''}">💰 Devedores</button></li>
      <li><button onclick="renderPage('notif-funcionario')" class="${STATE.currentPage === 'notif-funcionario' ? 'btn-nav-active' : ''}">📢 Notificações</button></li>
      <li><button onclick="logout()" style="color:#c0392b">🚪 Sair</button></li>
    `;
    if (navUser && func) {
      navUser.innerHTML = `
        <div class="navbar-user">
          <div class="user-avatar" style="background:#27ae60">👔</div>
          <span class="user-name">${func.nome.split(' ')[0]}</span>
        </div>
      `;
    }
  }
}

// ===== HELPERS =====
function getUsuario(username) {
  const usuarios = DB.get('usuarios');
  return usuarios ? usuarios[username] : null;
}

function getFuncionario(username) {
  const funcionarios = DB.get('funcionarios');
  return funcionarios ? funcionarios[username] : null;
}

function saveUsuario(username, data) {
  const usuarios = DB.get('usuarios');
  if (usuarios) {
    usuarios[username] = data;
    DB.set('usuarios', usuarios);
  }
}

function formatMoeda(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function formatData(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDataCurta(isoString) {
  return new Date(isoString).toLocaleDateString('pt-BR');
}

function gerarTicket() {
  return 'A' + String(Math.floor(Math.random() * 900) + 100);
}

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function showToast(msg, tipo = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const tc = document.getElementById('toast-container');
  if (!tc) return;
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span class="toast-icon">${icons[tipo]}</span><span class="toast-text">${msg}</span>`;
  tc.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function logout() {
  DB.set('session', null);
  STATE.currentUser = null;
  STATE.currentRole = null;
  STATE.cart = [];
  renderPage('home');
  showToast('Você saiu com sucesso!', 'info');
}

// ===== PÁGINA HOME =====
function renderHome(container) {
  container.innerHTML = `
    <div class="hero">
      <div class="hero-content">
        <span class="hero-emoji">🍽️</span>
        <h1>Cantina Escolar</h1>
        <p>Peça sua comida com praticidade, sem filas e sem espera. Seu ticket na palma da mão!</p>
        <div class="hero-buttons">
          <button class="btn btn-primary btn-lg" onclick="renderPage('login-aluno')">
            👤 Sou Aluno
          </button>
          <button class="btn btn-secondary btn-lg" onclick="renderPage('login-funcionario')">
            👔 Sou Funcionário
          </button>
          <button class="btn btn-outline btn-lg" onclick="renderPage('cadastro')">
            ✏️ Cadastrar-se
          </button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div style="text-align:center; margin-bottom:3rem">
        <h2 class="section-title">Como funciona?</h2>
        <div class="section-divider" style="margin:1rem auto 2rem"></div>
      </div>
      <div class="grid-3" style="margin-bottom:4rem">
        <div class="card" style="text-align:center; padding:2rem">
          <div style="font-size:3rem;margin-bottom:1rem">📱</div>
          <h3 style="color:var(--marrom);margin-bottom:0.5rem">Faça seu pedido</h3>
          <p style="color:var(--cinza-texto);font-size:0.9rem">Escolha seus itens no cardápio digital e pague online</p>
        </div>
        <div class="card" style="text-align:center; padding:2rem">
          <div style="font-size:3rem;margin-bottom:1rem">🎫</div>
          <h3 style="color:var(--marrom);margin-bottom:0.5rem">Receba seu ticket</h3>
          <p style="color:var(--cinza-texto);font-size:0.9rem">Gere seu comprovante e número de ticket automaticamente</p>
        </div>
        <div class="card" style="text-align:center; padding:2rem">
          <div style="font-size:3rem;margin-bottom:1rem">🚀</div>
          <h3 style="color:var(--marrom);margin-bottom:0.5rem">Retire sem fila</h3>
          <p style="color:var(--cinza-texto);font-size:0.9rem">Apresente o ticket e retire sua comida rapidamente</p>
        </div>
      </div>

      <div style="text-align:center; margin-bottom:2rem">
        <h2 class="section-title">Destaques do Cardápio</h2>
        <div class="section-divider" style="margin:1rem auto 2rem"></div>
      </div>
      <div class="grid-4" style="margin-bottom:4rem">
        ${[
          { emoji: '🍗', nome: 'Coxinha', preco: 6.00, cat: 'Salgados' },
          { emoji: '🍔', nome: 'X-Tudo', preco: 12.00, cat: 'Lanches' },
          { emoji: '🍽️', nome: 'Prato do Dia', preco: 25.00, cat: 'Almoço' },
          { emoji: '☕', nome: 'Café', preco: 2.50, cat: 'Bebidas' }
        ].map(item => `
          <div class="menu-item">
            <div class="menu-item-img">${item.emoji}</div>
            <div class="menu-item-body">
              <div class="menu-item-name">${item.nome}</div>
              <div class="menu-item-desc">${item.cat}</div>
              <div class="menu-item-footer">
                <div class="menu-item-price">${formatMoeda(item.preco)}</div>
                <button class="btn-add-cart" onclick="renderPage('login-aluno')">Pedir</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <footer class="footer">
      <p>🍽️ <strong>Cantina Escolar</strong> — Projeto II</p>
      <p style="margin-top:4px">Desenvolvido por <strong>Letícia, Giovana e Henrique C.</strong></p>
    </footer>
  `;
}

// ===== LOGIN ALUNO =====
function renderLoginAluno(container) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-card slide-in">
        <div class="login-header">
          <span class="login-icon">👤</span>
          <h2 class="login-title">Área do Aluno</h2>
          <p class="login-subtitle">Entre com seu usuário e senha</p>
        </div>
        <form onsubmit="loginAluno(event)">
          <div class="form-group">
            <label class="form-label">Usuário</label>
            <input type="text" id="login-user" class="form-control" placeholder="ex: ana.silva" required>
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" id="login-senha" class="form-control" placeholder="••••••••" required>
          </div>
          <div style="background:var(--amarelo-claro);border-radius:var(--radius-sm);padding:0.8rem;margin-bottom:1.2rem;font-size:0.82rem;color:var(--marrom)">
            <strong>Contas demo:</strong><br>
            ana.silva / 123 &nbsp;|&nbsp; joao.santos / 123 &nbsp;|&nbsp; maria.oliveira / 123
          </div>
          <button type="submit" class="btn btn-primary btn-full">Entrar</button>
        </form>
        <div style="text-align:center;margin-top:1.5rem">
          <p style="color:var(--cinza-texto);font-size:0.9rem">Não tem conta? 
            <button onclick="renderPage('cadastro')" style="background:none;border:none;color:var(--marrom);font-weight:700;cursor:pointer;font-size:0.9rem">Cadastre-se</button>
          </p>
          <button onclick="renderPage('home')" style="background:none;border:none;color:var(--cinza-texto);cursor:pointer;font-size:0.85rem;margin-top:8px">← Voltar ao início</button>
        </div>
      </div>
    </div>
  `;
}

function loginAluno(e) {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;
  const usuarios = DB.get('usuarios');

  if (usuarios && usuarios[user] && usuarios[user].senha === senha) {
    STATE.currentUser = user;
    STATE.currentRole = 'aluno';
    DB.set('session', { user, role: 'aluno' });
    showToast(`Bem-vindo(a), ${usuarios[user].nome.split(' ')[0]}! 👋`, 'success');
    renderPage('dashboard');
  } else {
    showToast('Usuário ou senha inválidos!', 'error');
  }
}

// ===== CADASTRO =====
function renderCadastro(container) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-card slide-in" style="max-width:520px">
        <div class="login-header">
          <span class="login-icon">✏️</span>
          <h2 class="login-title">Criar Conta</h2>
          <p class="login-subtitle">Cadastre-se para fazer pedidos</p>
        </div>
        <form onsubmit="cadastrarAluno(event)">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Nome Completo</label>
              <input type="text" id="cad-nome" class="form-control" placeholder="Seu nome" required>
            </div>
            <div class="form-group">
              <label class="form-label">Usuário</label>
              <input type="text" id="cad-user" class="form-control" placeholder="nome.sobrenome" required>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Turma</label>
              <select id="cad-turma" class="form-control" required>
                <option value="">Selecione...</option>
                ${['1A','1B','1C','2A','2B','2C','3A','3B','3C'].map(t => `<option>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Turno</label>
              <select id="cad-turno" class="form-control" required>
                <option value="">Selecione...</option>
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input type="email" id="cad-email" class="form-control" placeholder="seu@email.com" required>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Senha</label>
              <input type="password" id="cad-senha" class="form-control" placeholder="••••••••" required>
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar Senha</label>
              <input type="password" id="cad-senha2" class="form-control" placeholder="••••••••" required>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Criar Conta</button>
        </form>
        <div style="text-align:center;margin-top:1rem">
          <button onclick="renderPage('login-aluno')" style="background:none;border:none;color:var(--cinza-texto);cursor:pointer;font-size:0.85rem">← Já tenho conta</button>
        </div>
      </div>
    </div>
  `;
}

function cadastrarAluno(e) {
  e.preventDefault();
  const nome = document.getElementById('cad-nome').value.trim();
  const user = document.getElementById('cad-user').value.trim().toLowerCase();
  const turma = document.getElementById('cad-turma').value;
  const turno = document.getElementById('cad-turno').value;
  const email = document.getElementById('cad-email').value.trim();
  const senha = document.getElementById('cad-senha').value;
  const senha2 = document.getElementById('cad-senha2').value;

  if (senha !== senha2) { showToast('As senhas não coincidem!', 'error'); return; }
  if (senha.length < 3) { showToast('Senha muito curta!', 'error'); return; }

  const usuarios = DB.get('usuarios');
  if (usuarios[user]) { showToast('Este usuário já existe!', 'error'); return; }

  const initials = nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  usuarios[user] = {
    senha, nome, turma, turno, email,
    gasto: 0, divida: 0,
    notificacoes: [
      { id: gerarId(), tipo: 'novidade', titulo: '🎉 Bem-vindo(a) à Cantina!', texto: `Olá, ${nome.split(' ')[0]}! Sua conta foi criada com sucesso. Explore o cardápio e faça seu primeiro pedido!`, data: new Date().toISOString(), lida: false }
    ],
    historico: [],
    avatar: initials
  };
  DB.set('usuarios', usuarios);

  STATE.currentUser = user;
  STATE.currentRole = 'aluno';
  DB.set('session', { user, role: 'aluno' });
  showToast(`Conta criada! Bem-vindo(a), ${nome.split(' ')[0]}! 🎉`, 'success');
  renderPage('dashboard');
}

// ===== LOGIN FUNCIONÁRIO =====
function renderLoginFuncionario(container) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-card slide-in">
        <div class="login-header">
          <span class="login-icon">👔</span>
          <h2 class="login-title">Área do Funcionário</h2>
          <p class="login-subtitle">Acesso restrito à equipe da cantina</p>
        </div>
        <form onsubmit="loginFuncionario(event)">
          <div class="form-group">
            <label class="form-label">Usuário</label>
            <input type="text" id="func-user" class="form-control" placeholder="ex: admin" required>
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" id="func-senha" class="form-control" placeholder="••••••••" required>
          </div>
          <div style="background:#f0fff4;border-radius:var(--radius-sm);padding:0.8rem;margin-bottom:1.2rem;font-size:0.82rem;color:#27ae60">
            <strong>Acesso demo:</strong> admin / 123
          </div>
          <button type="submit" class="btn btn-primary btn-full" style="background:var(--verde)">Entrar como Funcionário</button>
        </form>
        <div style="text-align:center;margin-top:1rem">
          <button onclick="renderPage('home')" style="background:none;border:none;color:var(--cinza-texto);cursor:pointer;font-size:0.85rem">← Voltar ao início</button>
        </div>
      </div>
    </div>
  `;
}

function loginFuncionario(e) {
  e.preventDefault();
  const user = document.getElementById('func-user').value.trim().toLowerCase();
  const senha = document.getElementById('func-senha').value;
  const funcionarios = DB.get('funcionarios');

  if (funcionarios && funcionarios[user] && funcionarios[user].senha === senha) {
    STATE.currentUser = user;
    STATE.currentRole = 'funcionario';
    DB.set('session', { user, role: 'funcionario' });
    showToast(`Bem-vindo(a), ${funcionarios[user].nome}! 👔`, 'success');
    renderPage('painel-funcionario');
  } else {
    showToast('Credenciais inválidas!', 'error');
  }
}

// ===== DASHBOARD ALUNO =====
function renderDashboard(container) {
  const user = getUsuario(STATE.currentUser);
  if (!user) { renderPage('login-aluno'); return; }

  const hoje = new Date().toDateString();
  const gastoHoje = user.historico
    .filter(p => new Date(p.data).toDateString() === hoje)
    .reduce((s, p) => s + p.total, 0);

  const semanaInicio = new Date();
  semanaInicio.setDate(semanaInicio.getDate() - 7);
  const gastoSemana = user.historico
    .filter(p => new Date(p.data) >= semanaInicio)
    .reduce((s, p) => s + p.total, 0);

  const mesAtual = new Date().getMonth();
  const gastoMes = user.historico
    .filter(p => new Date(p.data).getMonth() === mesAtual)
    .reduce((s, p) => s + p.total, 0);

  const notifNaoLidas = user.notificacoes.filter(n => !n.lida).length;
  const notifGlobais = DB.get('notificacoes_globais') || [];

  container.innerHTML = `
    <div class="page-content">
      <!-- Saudação -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">Olá, ${user.nome.split(' ')[0]}! 👋</h1>
          <p style="color:var(--cinza-texto)">${user.turma} • ${user.turno} • ${new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'})}</p>
        </div>
        <div style="display:flex;gap:0.8rem;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="renderPage('cardapio')">🍽️ Fazer Pedido</button>
          ${notifNaoLidas > 0 ? `<button class="btn btn-warning" onclick="renderPage('notificacoes')">🔔 ${notifNaoLidas} aviso${notifNaoLidas > 1 ? 's' : ''}</button>` : ''}
        </div>
      </div>

      ${user.divida > 0 ? `
        <div class="divida-card" style="margin-bottom:2rem">
          <div class="divida-info">
            <h4>⚠️ Você tem uma dívida pendente</h4>
            <p style="font-size:0.85rem;color:var(--cinza-texto);margin-top:4px">Regularize sua situação para continuar comprando</p>
          </div>
          <div class="divida-valor">${formatMoeda(user.divida)}</div>
        </div>
      ` : ''}

      <!-- Stats -->
      <div class="grid-4" style="margin-bottom:2rem">
        <div class="stat-card">
          <div class="stat-icon yellow">💰</div>
          <div>
            <div class="stat-value">${formatMoeda(gastoHoje)}</div>
            <div class="stat-label">Gasto hoje</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">📅</div>
          <div>
            <div class="stat-value">${formatMoeda(gastoSemana)}</div>
            <div class="stat-label">Esta semana</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">📆</div>
          <div>
            <div class="stat-value">${formatMoeda(gastoMes)}</div>
            <div class="stat-label">Este mês</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon ${user.divida > 0 ? 'red' : 'green'}">${user.divida > 0 ? '⚠️' : '✅'}</div>
          <div>
            <div class="stat-value" style="color:${user.divida > 0 ? 'var(--vermelho)' : 'var(--verde)'}">${formatMoeda(user.divida)}</div>
            <div class="stat-label">Dívida atual</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Últimos pedidos -->
        <div class="card">
          <div class="card-header">
            <span class="card-icon">📋</span>
            <h3>Últimos Pedidos</h3>
          </div>
          <div class="card-body">
            ${user.historico.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3>Nenhum pedido ainda</h3>
                <p>Faça seu primeiro pedido!</p>
                <button class="btn btn-primary" style="margin-top:1rem" onclick="renderPage('cardapio')">Ver Cardápio</button>
              </div>
            ` : user.historico.slice(-3).reverse().map(p => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--cinza-claro)">
                <div>
                  <div style="font-weight:600;font-size:0.9rem">${p.itens.map(i => i.nome).join(', ').slice(0, 30)}${p.itens.map(i => i.nome).join(', ').length > 30 ? '...' : ''}</div>
                  <div style="font-size:0.78rem;color:var(--cinza-texto)">${formatDataCurta(p.data)} • Ticket ${p.ticket}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700;color:var(--marrom)">${formatMoeda(p.total)}</div>
                  <span class="badge ${p.formaPagamento === 'fiado' ? 'badge-red' : 'badge-green'}" style="font-size:0.7rem">${p.formaPagamento === 'fiado' ? 'Fiado' : 'Pago'}</span>
                </div>
              </div>
            `).join('')}
            ${user.historico.length > 0 ? `<button class="btn btn-outline btn-full" style="margin-top:1rem" onclick="renderPage('historico')">Ver todos</button>` : ''}
          </div>
        </div>

        <!-- Notificações recentes -->
        <div class="card">
          <div class="card-header">
            <span class="card-icon">🔔</span>
            <h3>Avisos Recentes</h3>
          </div>
          <div class="card-body">
            ${[...notifGlobais.slice(-2), ...user.notificacoes.slice(-2)].length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">🔕</div>
                <h3>Sem avisos</h3>
              </div>
            ` : [...notifGlobais.slice(-2).reverse(), ...user.notificacoes.slice(-2).reverse()].slice(0, 4).map(n => `
              <div class="notif-item ${n.lida === false ? 'unread' : ''} ${n.tipo}">
                <span class="notif-icon">${n.tipo === 'divida' ? '💸' : n.tipo === 'novidade' ? '🎉' : n.tipo === 'estoque' ? '📦' : '🔔'}</span>
                <div class="notif-content">
                  <div class="notif-title">${n.titulo}</div>
                  <div class="notif-text">${n.texto.slice(0, 80)}${n.texto.length > 80 ? '...' : ''}</div>
                </div>
              </div>
            `).join('')}
            <button class="btn btn-outline btn-full" style="margin-top:1rem" onclick="renderPage('notificacoes')">Ver todos</button>
          </div>
        </div>
      </div>

      <!-- Atalhos -->
      <div class="grid-4" style="margin-top:2rem">
        <button class="card" style="border:none;cursor:pointer;padding:1.5rem;text-align:center" onclick="renderPage('cardapio')">
          <div style="font-size:2rem;margin-bottom:0.5rem">🍽️</div>
          <div style="font-weight:700;color:var(--marrom)">Cardápio</div>
        </button>
        <button class="card" style="border:none;cursor:pointer;padding:1.5rem;text-align:center" onclick="renderPage('historico')">
          <div style="font-size:2rem;margin-bottom:0.5rem">📋</div>
          <div style="font-weight:700;color:var(--marrom)">Histórico</div>
        </button>
        <button class="card" style="border:none;cursor:pointer;padding:1.5rem;text-align:center" onclick="renderPage('nutricional')">
          <div style="font-size:2rem;margin-bottom:0.5rem">🥗</div>
          <div style="font-weight:700;color:var(--marrom)">Nutricional</div>
        </button>
        <button class="card" style="border:none;cursor:pointer;padding:1.5rem;text-align:center" onclick="renderPage('notificacoes')">
          <div style="font-size:2rem;margin-bottom:0.5rem">🔔</div>
          <div style="font-weight:700;color:var(--marrom)">Avisos${notifNaoLidas > 0 ? ` (${notifNaoLidas})` : ''}</div>
        </button>
      </div>
    </div>
  `;
}

// ===== CARDÁPIO =====
function renderCardapio(container) {
  const categorias = Object.keys(CARDAPIO);

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">🍽️ Cardápio</h1>
          <p style="color:var(--cinza-texto)">Escolha seus itens e adicione ao carrinho</p>
        </div>
        <button class="btn btn-primary" onclick="abrirCarrinho()">
          🛒 Carrinho <span id="cart-count-header" class="cart-count">${STATE.cart.length}</span>
        </button>
      </div>

      <!-- Almoço do dia (carrossel) -->
      <div style="margin-bottom:2.5rem">
        <div class="category-header">
          <div class="category-icon">🍽️</div>
          <div>
            <div class="category-title">Almoço da Semana</div>
            <div class="category-count">Prato do dia — R$ 25,00</div>
          </div>
        </div>
        <div class="carousel" id="almoco-carousel">
          <div class="carousel-track" id="carousel-track">
            ${ALMOCO_SEMANA.map((a, i) => `
              <div class="carousel-slide">
                <div class="carousel-food-icon">${a.emoji}</div>
                <div class="carousel-info">
                  <div style="font-size:0.85rem;font-weight:600;color:var(--marrom-claro);text-transform:uppercase;letter-spacing:1px">${a.dia}</div>
                  <h3>${a.prato}</h3>
                  <p>${a.desc}</p>
                  <p style="font-size:0.85rem;color:var(--marrom-claro)">Acompanha: ${a.extras}</p>
                  <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem">
                    <div class="price">${formatMoeda(25.00)}</div>
                    <button class="btn btn-primary btn-sm" onclick="adicionarAoCarrinho('Prato do Dia', 25.00, '${a.emoji}', 'Almoço')">+ Adicionar</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button class="carousel-btn prev" onclick="moverCarrossel(-1)">‹</button>
          <button class="carousel-btn next" onclick="moverCarrossel(1)">›</button>
        </div>
        <div class="carousel-dots" id="carousel-dots">
          ${ALMOCO_SEMANA.map((_, i) => `<button class="carousel-dot ${i === STATE.carouselIndex ? 'active' : ''}" onclick="irParaSlide(${i})"></button>`).join('')}
        </div>
      </div>

      <!-- Filtro de categorias -->
      <div class="tabs" id="cat-tabs">
        <button class="tab-btn active" data-cat="todos" onclick="filtrarCategoria('todos', this)">🍽️ Todos</button>
        ${categorias.map(cat => `
          <button class="tab-btn" data-cat="${cat}" onclick="filtrarCategoria('${cat}', this)">${CARDAPIO[cat].icon} ${cat}</button>
        `).join('')}
      </div>

      <!-- Busca -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="busca-cardapio" placeholder="Buscar item..." oninput="buscarCardapio(this.value)">
      </div>

      <!-- Itens -->
      <div id="cardapio-grid">
        ${renderCardapioGrid('todos')}
      </div>
    </div>

    <!-- Botão flutuante do carrinho -->
    <button class="cart-btn" onclick="abrirCarrinho()" id="cart-float-btn" ${STATE.cart.length === 0 ? 'style="display:none"' : ''}>
      🛒 Carrinho
      <span class="cart-count" id="cart-count-float">${STATE.cart.length}</span>
    </button>
  `;

  // Inicializar carrossel no dia atual
  const diaAtual = new Date().getDay(); // 0=dom, 1=seg...
  const idx = diaAtual >= 1 && diaAtual <= 5 ? diaAtual - 1 : 0;
  STATE.carouselIndex = idx;
  atualizarCarrossel();
}

function renderCardapioGrid(categoria, busca = '') {
  let html = '';
  const cats = categoria === 'todos' ? Object.keys(CARDAPIO) : [categoria];

  cats.forEach(cat => {
    const catData = CARDAPIO[cat];
    const itens = Object.entries(catData.itens).filter(([nome]) =>
      !busca || nome.toLowerCase().includes(busca.toLowerCase())
    );
    if (itens.length === 0) return;

    if (categoria === 'todos') {
      html += `
        <div class="category-header" style="margin-top:2rem">
          <div class="category-icon">${catData.icon}</div>
          <div>
            <div class="category-title">${cat}</div>
            <div class="category-count">${itens.length} item${itens.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      `;
    }

    html += `<div class="grid-4" style="margin-bottom:1.5rem">`;
    itens.forEach(([nome, data]) => {
      const gratis = data.preco === 0;
      html += `
        <div class="menu-item">
          <div class="menu-item-img" style="background:linear-gradient(135deg, ${catData.cor}, var(--amarelo-claro))">${data.emoji}</div>
          <div class="menu-item-body">
            <div class="menu-item-name">${nome}</div>
            <div class="menu-item-desc">${data.desc}</div>
            ${data.calorias > 0 ? `<div style="font-size:0.75rem;color:var(--cinza-texto);margin-top:4px">🔥 ${data.calorias} kcal</div>` : ''}
            <div class="menu-item-footer">
              <div class="menu-item-price">${gratis ? '<span style="color:var(--verde);font-size:0.9rem">Grátis</span>' : formatMoeda(data.preco)}</div>
              ${!gratis ? `<button class="btn-add-cart" onclick="adicionarAoCarrinho('${nome}', ${data.preco}, '${data.emoji}', '${cat}')">+ Adicionar</button>` : '<span style="font-size:0.75rem;color:var(--cinza-texto)">Cortesia</span>'}
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  });

  if (!html) html = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Nenhum item encontrado</h3></div>`;
  return html;
}

function filtrarCategoria(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('cardapio-grid').innerHTML = renderCardapioGrid(cat);
}

function buscarCardapio(busca) {
  const catAtiva = document.querySelector('.tab-btn.active')?.dataset.cat || 'todos';
  document.getElementById('cardapio-grid').innerHTML = renderCardapioGrid(catAtiva, busca);
}

function moverCarrossel(dir) {
  STATE.carouselIndex = (STATE.carouselIndex + dir + ALMOCO_SEMANA.length) % ALMOCO_SEMANA.length;
  atualizarCarrossel();
}

function irParaSlide(idx) {
  STATE.carouselIndex = idx;
  atualizarCarrossel();
}

function atualizarCarrossel() {
  const track = document.getElementById('carousel-track');
  const dots = document.querySelectorAll('.carousel-dot');
  if (track) track.style.transform = `translateX(-${STATE.carouselIndex * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === STATE.carouselIndex));
}

// ===== CARRINHO =====
function adicionarAoCarrinho(nome, preco, emoji, categoria) {
  const existing = STATE.cart.find(i => i.nome === nome);
  if (existing) {
    existing.qtd++;
  } else {
    STATE.cart.push({ nome, preco, emoji, categoria, qtd: 1 });
  }
  atualizarBadgeCarrinho();
  showToast(`${emoji} ${nome} adicionado ao carrinho!`, 'success');
}

function atualizarBadgeCarrinho() {
  const total = STATE.cart.reduce((s, i) => s + i.qtd, 0);
  const countHeader = document.getElementById('cart-count-header');
  const countFloat = document.getElementById('cart-count-float');
  const floatBtn = document.getElementById('cart-float-btn');

  if (countHeader) countHeader.textContent = total;
  if (countFloat) countFloat.textContent = total;
  if (floatBtn) floatBtn.style.display = total > 0 ? 'flex' : 'none';
}

function abrirCarrinho() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-carrinho';

  const totalValor = STATE.cart.reduce((s, i) => s + i.preco * i.qtd, 0);
  const totalItens = STATE.cart.reduce((s, i) => s + i.qtd, 0);

  overlay.innerHTML = `
    <div class="modal" style="max-width:560px">
      <div class="modal-header">
        <h2>🛒 Meu Carrinho</h2>
        <button class="modal-close" onclick="fecharModal('modal-carrinho')">✕</button>
      </div>
      <div class="modal-body">
        ${STATE.cart.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🛒</div>
            <h3>Carrinho vazio</h3>
            <p>Adicione itens do cardápio</p>
          </div>
        ` : `
          <div id="cart-items">
            ${STATE.cart.map((item, idx) => `
              <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--cinza-claro)">
                <span style="font-size:1.8rem">${item.emoji}</span>
                <div style="flex:1">
                  <div style="font-weight:600">${item.nome}</div>
                  <div style="font-size:0.85rem;color:var(--cinza-texto)">${formatMoeda(item.preco)} cada</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <button onclick="alterarQtd(${idx}, -1)" style="background:var(--cinza-medio);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">−</button>
                  <span style="font-weight:700;min-width:20px;text-align:center">${item.qtd}</span>
                  <button onclick="alterarQtd(${idx}, 1)" style="background:var(--amarelo-principal);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">+</button>
                </div>
                <div style="font-weight:700;color:var(--marrom);min-width:70px;text-align:right">${formatMoeda(item.preco * item.qtd)}</div>
              </div>
            `).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;padding:16px 0;font-size:1.1rem;font-weight:800;color:var(--marrom);border-top:2px solid var(--amarelo-principal);margin-top:8px">
            <span>Total (${totalItens} item${totalItens > 1 ? 's' : ''})</span>
            <span>${formatMoeda(totalValor)}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Forma de Pagamento</label>
            <select id="forma-pagamento" class="form-control">
              <option value="pix">💳 PIX</option>
              <option value="dinheiro">💵 Dinheiro</option>
              <option value="cartao">💳 Cartão</option>
              <option value="fiado">📝 Fiado (pagar depois)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Observações (opcional)</label>
            <input type="text" id="obs-pedido" class="form-control" placeholder="Ex: sem cebola, bem passado...">
          </div>
        `}
      </div>
      ${STATE.cart.length > 0 ? `
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="fecharModal('modal-carrinho')">Continuar comprando</button>
          <button class="btn btn-success" onclick="finalizarPedido()">✅ Finalizar Pedido</button>
        </div>
      ` : `
        <div class="modal-footer">
          <button class="btn btn-primary btn-full" onclick="fecharModal('modal-carrinho')">Ver Cardápio</button>
        </div>
      `}
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModal('modal-carrinho'); });
}

function alterarQtd(idx, delta) {
  STATE.cart[idx].qtd += delta;
  if (STATE.cart[idx].qtd <= 0) STATE.cart.splice(idx, 1);
  atualizarBadgeCarrinho();
  fecharModal('modal-carrinho');
  abrirCarrinho();
}

function fecharModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function finalizarPedido() {
  if (STATE.cart.length === 0) return;

  const formaPagamento = document.getElementById('forma-pagamento').value;
  const obs = document.getElementById('obs-pedido').value;
  const user = getUsuario(STATE.currentUser);
  const ticket = gerarTicket();
  const total = STATE.cart.reduce((s, i) => s + i.preco * i.qtd, 0);

  const pedido = {
    id: gerarId(),
    data: new Date().toISOString(),
    itens: STATE.cart.map(i => ({ nome: i.nome, preco: i.preco, qtd: i.qtd, emoji: i.emoji })),
    total,
    formaPagamento,
    obs,
    ticket,
    status: 'aguardando',
    usuario: STATE.currentUser
  };

  // Salvar pedido
  user.historico.push(pedido);
  user.gasto += total;
  if (formaPagamento === 'fiado') {
    user.divida += total;
    user.notificacoes.push({
      id: gerarId(),
      tipo: 'divida',
      titulo: '💸 Pedido no fiado registrado',
      texto: `Seu pedido de ${formatMoeda(total)} foi registrado como fiado. Ticket: ${ticket}. Lembre-se de pagar!`,
      data: new Date().toISOString(),
      lida: false
    });
  }
  saveUsuario(STATE.currentUser, user);

  // Salvar no registro global
  const pedidos = DB.get('pedidos') || [];
  pedidos.push({ ...pedido, nomeAluno: user.nome, turma: user.turma });
  DB.set('pedidos', pedidos);

  fecharModal('modal-carrinho');
  STATE.cart = [];
  atualizarBadgeCarrinho();

  // Mostrar comprovante
  mostrarComprovante(pedido, user);
}

function mostrarComprovante(pedido, user) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-comprovante';

  overlay.innerHTML = `
    <div class="modal" style="max-width:460px">
      <div class="modal-header" style="background:linear-gradient(135deg,var(--verde),var(--verde-escuro))">
        <h2 style="color:white">✅ Pedido Confirmado!</h2>
        <button class="modal-close" onclick="fecharModal('modal-comprovante');renderPage('dashboard')" style="color:white;background:rgba(255,255,255,0.2)">✕</button>
      </div>
      <div class="modal-body">
        <div class="comprovante" id="comprovante-print">
          <div class="comprovante-header">
            <div class="comprovante-logo">🍽️</div>
            <div class="comprovante-title">Cantina Escolar</div>
            <div class="comprovante-subtitle">${formatData(pedido.data)}</div>
          </div>

          <div class="comprovante-ticket">
            <div class="ticket-label">Seu Ticket</div>
            <div class="ticket-number">${pedido.ticket}</div>
            <div class="ticket-label">Apresente na retirada</div>
          </div>

          <div style="margin:1rem 0;padding:0.8rem;background:var(--cinza-claro);border-radius:var(--radius-sm)">
            <div style="font-size:0.85rem;color:var(--cinza-texto)"><strong>Aluno:</strong> ${user.nome}</div>
            <div style="font-size:0.85rem;color:var(--cinza-texto)"><strong>Turma:</strong> ${user.turma} • ${user.turno}</div>
          </div>

          <div class="comprovante-items">
            ${pedido.itens.map(i => `
              <div class="comprovante-item">
                <span>${i.emoji} ${i.nome} x${i.qtd}</span>
                <span>${formatMoeda(i.preco * i.qtd)}</span>
              </div>
            `).join('')}
          </div>

          <div class="comprovante-total">
            <span>Total</span>
            <span>${formatMoeda(pedido.total)}</span>
          </div>

          <div style="margin-top:1rem;padding:0.8rem;border-radius:var(--radius-sm);background:${pedido.formaPagamento === 'fiado' ? '#fff5f5' : '#f0fff4'};border:1px solid ${pedido.formaPagamento === 'fiado' ? 'var(--vermelho)' : 'var(--verde)'}">
            <div style="font-weight:700;color:${pedido.formaPagamento === 'fiado' ? 'var(--vermelho)' : 'var(--verde)'}">
              ${pedido.formaPagamento === 'fiado' ? '⚠️ Pagamento: Fiado' : '✅ Pagamento: ' + pedido.formaPagamento.toUpperCase()}
            </div>
          </div>

          <div class="comprovante-footer">
            <p>Obrigado pela preferência! 😊</p>
            <p>Aguarde ser chamado pelo número do ticket</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="imprimirComprovante()">🖨️ Imprimir</button>
        <button class="btn btn-primary" onclick="fecharModal('modal-comprovante');renderPage('dashboard')">🏠 Ir ao Início</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function imprimirComprovante() {
  window.print();
}

// ===== HISTÓRICO =====
function renderHistorico(container) {
  const user = getUsuario(STATE.currentUser);
  if (!user) return;

  const historico = [...user.historico].reverse();

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">📋 Histórico de Pedidos</h1>
          <p style="color:var(--cinza-texto)">${historico.length} pedido${historico.length !== 1 ? 's' : ''} registrado${historico.length !== 1 ? 's' : ''}</p>
        </div>
        <button class="btn btn-outline" onclick="renderPage('dashboard')">← Voltar</button>
      </div>

      ${historico.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>Nenhum pedido ainda</h3>
          <p>Faça seu primeiro pedido no cardápio!</p>
          <button class="btn btn-primary" style="margin-top:1rem" onclick="renderPage('cardapio')">Ver Cardápio</button>
        </div>
      ` : `
        <!-- Resumo financeiro -->
        <div class="grid-3" style="margin-bottom:2rem">
          <div class="stat-card">
            <div class="stat-icon yellow">💰</div>
            <div>
              <div class="stat-value">${formatMoeda(historico.reduce((s,p) => s + p.total, 0))}</div>
              <div class="stat-label">Total gasto</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">🛒</div>
            <div>
              <div class="stat-value">${historico.length}</div>
              <div class="stat-label">Pedidos realizados</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon ${user.divida > 0 ? 'red' : 'green'}">${user.divida > 0 ? '⚠️' : '✅'}</div>
            <div>
              <div class="stat-value" style="color:${user.divida > 0 ? 'var(--vermelho)' : 'var(--verde)'}">${formatMoeda(user.divida)}</div>
              <div class="stat-label">Dívida atual</div>
            </div>
          </div>
        </div>

        <!-- Lista de pedidos -->
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${historico.map(p => `
            <div class="card">
              <div class="card-body" style="padding:1.2rem">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                      <span style="font-size:1.3rem">🎫</span>
                      <span style="font-weight:800;font-size:1.1rem;color:var(--marrom)">Ticket ${p.ticket}</span>
                      <span class="badge ${p.formaPagamento === 'fiado' ? 'badge-red' : 'badge-green'}">${p.formaPagamento === 'fiado' ? '📝 Fiado' : '✅ ' + p.formaPagamento}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--cinza-texto);margin-bottom:8px">📅 ${formatData(p.data)}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px">
                      ${p.itens.map(i => `<span class="badge badge-yellow">${i.emoji} ${i.nome} x${i.qtd}</span>`).join('')}
                    </div>
                    ${p.obs ? `<div style="font-size:0.82rem;color:var(--cinza-texto);margin-top:6px">📝 ${p.obs}</div>` : ''}
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:1.4rem;font-weight:900;color:var(--marrom)">${formatMoeda(p.total)}</div>
                    <button class="btn btn-outline btn-sm" style="margin-top:8px" onclick="verComprovante(${JSON.stringify(p).replace(/"/g, '&quot;')})">🧾 Comprovante</button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function verComprovante(pedido) {
  const user = getUsuario(STATE.currentUser);
  mostrarComprovante(pedido, user);
}

// ===== NUTRICIONAL =====
function renderNutricional(container) {
  const user = getUsuario(STATE.currentUser);
  if (!user) return;

  // Calcular totais nutricionais
  let totalCal = 0, totalProt = 0, totalCarbs = 0, totalGord = 0;
  let itemMaisCalórico = null;
  let contadorItens = {};

  user.historico.forEach(pedido => {
    pedido.itens.forEach(item => {
      // Buscar dados nutricionais
      for (const cat of Object.values(CARDAPIO)) {
        if (cat.itens[item.nome]) {
          const nutri = cat.itens[item.nome];
          totalCal += nutri.calorias * item.qtd;
          totalProt += nutri.proteina * item.qtd;
          totalCarbs += nutri.carbs * item.qtd;
          totalGord += nutri.gordura * item.qtd;

          if (!itemMaisCalórico || nutri.calorias > itemMaisCalórico.calorias) {
            itemMaisCalórico = { nome: item.nome, ...nutri };
          }

          contadorItens[item.nome] = (contadorItens[item.nome] || 0) + item.qtd;
        }
      }
    });
  });

  const itensMaisComprados = Object.entries(contadorItens)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const calDiaria = 2000;
  const protDiaria = 50;
  const carbsDiaria = 300;
  const gordDiaria = 65;

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">🥗 Informações Nutricionais</h1>
          <p style="color:var(--cinza-texto)">Acompanhe o que você consumiu na cantina</p>
        </div>
        <button class="btn btn-outline" onclick="renderPage('dashboard')">← Voltar</button>
      </div>

      ${user.historico.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🥗</div>
          <h3>Sem dados nutricionais</h3>
          <p>Faça pedidos para ver suas informações nutricionais</p>
        </div>
      ` : `
        <!-- Cards de resumo -->
        <div class="grid-4" style="margin-bottom:2rem">
          <div class="stat-card">
            <div class="stat-icon yellow">🔥</div>
            <div>
              <div class="stat-value">${totalCal.toLocaleString()}</div>
              <div class="stat-label">Calorias totais (kcal)</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">💪</div>
            <div>
              <div class="stat-value">${totalProt}g</div>
              <div class="stat-label">Proteínas</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">🌾</div>
            <div>
              <div class="stat-value">${totalCarbs}g</div>
              <div class="stat-label">Carboidratos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red">🧈</div>
            <div>
              <div class="stat-value">${totalGord}g</div>
              <div class="stat-label">Gorduras</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Barras nutricionais -->
          <div class="card">
            <div class="card-header">
              <span class="card-icon">📊</span>
              <h3>Consumo vs. Recomendação Diária</h3>
            </div>
            <div class="card-body">
              <p style="font-size:0.82rem;color:var(--cinza-texto);margin-bottom:1.5rem">Baseado na ingestão diária recomendada (IDR) para adultos</p>
              
              <div class="nutri-bar">
                <div class="nutri-label">
                  <span>🔥 Calorias</span>
                  <span>${totalCal} / ${calDiaria * user.historico.length} kcal</span>
                </div>
                <div class="nutri-progress">
                  <div class="nutri-fill calories" style="width:${Math.min((totalCal / (calDiaria * user.historico.length)) * 100, 100)}%"></div>
                </div>
              </div>

              <div class="nutri-bar">
                <div class="nutri-label">
                  <span>💪 Proteínas</span>
                  <span>${totalProt}g / ${protDiaria * user.historico.length}g</span>
                </div>
                <div class="nutri-progress">
                  <div class="nutri-fill protein" style="width:${Math.min((totalProt / (protDiaria * user.historico.length)) * 100, 100)}%"></div>
                </div>
              </div>

              <div class="nutri-bar">
                <div class="nutri-label">
                  <span>🌾 Carboidratos</span>
                  <span>${totalCarbs}g / ${carbsDiaria * user.historico.length}g</span>
                </div>
                <div class="nutri-progress">
                  <div class="nutri-fill carbs" style="width:${Math.min((totalCarbs / (carbsDiaria * user.historico.length)) * 100, 100)}%"></div>
                </div>
              </div>

              <div class="nutri-bar">
                <div class="nutri-label">
                  <span>🧈 Gorduras</span>
                  <span>${totalGord}g / ${gordDiaria * user.historico.length}g</span>
                </div>
                <div class="nutri-progress">
                  <div class="nutri-fill fat" style="width:${Math.min((totalGord / (gordDiaria * user.historico.length)) * 100, 100)}%"></div>
                </div>
              </div>

              <div style="margin-top:1.5rem;padding:1rem;background:var(--amarelo-claro);border-radius:var(--radius-sm)">
                <p style="font-size:0.82rem;color:var(--marrom)">
                  <strong>ℹ️ Nota:</strong> Os valores são estimativas baseadas nos itens consumidos na cantina. Para uma análise completa, consulte um nutricionista.
                </p>
              </div>
            </div>
          </div>

          <!-- Itens mais consumidos -->
          <div class="card">
            <div class="card-header">
              <span class="card-icon">🏆</span>
              <h3>Seus Favoritos</h3>
            </div>
            <div class="card-body">
              ${itensMaisComprados.length === 0 ? `
                <div class="empty-state">
                  <div class="empty-state-icon">🍽️</div>
                  <h3>Sem dados</h3>
                </div>
              ` : itensMaisComprados.map(([nome, qtd], i) => {
                let emoji = '🍽️';
                let nutri = null;
                for (const cat of Object.values(CARDAPIO)) {
                  if (cat.itens[nome]) { emoji = cat.itens[nome].emoji; nutri = cat.itens[nome]; break; }
                }
                return `
                  <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--cinza-claro)">
                    <span style="font-size:1.5rem;width:30px;text-align:center">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                    <span style="font-size:1.4rem">${emoji}</span>
                    <div style="flex:1">
                      <div style="font-weight:600">${nome}</div>
                      ${nutri ? `<div style="font-size:0.78rem;color:var(--cinza-texto)">🔥 ${nutri.calorias} kcal • 💪 ${nutri.proteina}g prot</div>` : ''}
                    </div>
                    <span class="badge badge-yellow">${qtd}x</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Tabela nutricional detalhada -->
        <div class="card" style="margin-top:2rem">
          <div class="card-header">
            <span class="card-icon">📋</span>
            <h3>Tabela Nutricional do Cardápio</h3>
          </div>
          <div class="card-body">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Categoria</th>
                    <th>Calorias</th>
                    <th>Proteínas</th>
                    <th>Carboidratos</th>
                    <th>Gorduras</th>
                    <th>Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(CARDAPIO).flatMap(([cat, catData]) =>
                    Object.entries(catData.itens).filter(([_, d]) => d.calorias > 0).map(([nome, d]) => `
                      <tr>
                        <td><span style="margin-right:6px">${d.emoji}</span>${nome}</td>
                        <td><span class="badge badge-yellow">${cat}</span></td>
                        <td>🔥 ${d.calorias} kcal</td>
                        <td>💪 ${d.proteina}g</td>
                        <td>🌾 ${d.carbs}g</td>
                        <td>🧈 ${d.gordura}g</td>
                        <td>${d.preco > 0 ? formatMoeda(d.preco) : 'Grátis'}</td>
                      </tr>
                    `)
                  ).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}

// ===== NOTIFICAÇÕES ALUNO =====
function renderNotificacoes(container) {
  const user = getUsuario(STATE.currentUser);
  if (!user) return;

  const notifGlobais = DB.get('notificacoes_globais') || [];
  const todasNotif = [
    ...notifGlobais.map(n => ({ ...n, global: true })),
    ...user.notificacoes
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  // Marcar todas como lidas
  user.notificacoes.forEach(n => n.lida = true);
  saveUsuario(STATE.currentUser, user);
  updateNavbar();

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">🔔 Avisos e Notificações</h1>
          <p style="color:var(--cinza-texto)">${todasNotif.length} aviso${todasNotif.length !== 1 ? 's' : ''}</p>
        </div>
        <button class="btn btn-outline" onclick="renderPage('dashboard')">← Voltar</button>
      </div>

      ${todasNotif.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🔕</div>
          <h3>Sem avisos</h3>
          <p>Você não tem notificações no momento</p>
        </div>
      ` : todasNotif.map(n => `
        <div class="notif-item ${n.tipo}">
          <span class="notif-icon">${
            n.tipo === 'divida' ? '💸' :
            n.tipo === 'novidade' ? '🎉' :
            n.tipo === 'estoque' ? '📦' : '🔔'
          }</span>
          <div class="notif-content">
            <div class="notif-title">${n.titulo}</div>
            <div class="notif-text">${n.texto}</div>
            <div class="notif-time">📅 ${formatData(n.data)} ${n.global ? '• <span class="badge badge-yellow" style="font-size:0.7rem">Cantina</span>' : ''}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== PAINEL FUNCIONÁRIO =====
function renderPainelFuncionario(container) {
  const usuarios = DB.get('usuarios') || {};
  const pedidos = DB.get('pedidos') || [];
  const func = getFuncionario(STATE.currentUser);

  const totalAlunos = Object.keys(usuarios).length;
  const totalDevedores = Object.values(usuarios).filter(u => u.divida > 0).length;
  const totalDividas = Object.values(usuarios).reduce((s, u) => s + u.divida, 0);
  const totalPedidosHoje = pedidos.filter(p => new Date(p.data).toDateString() === new Date().toDateString()).length;
  const receitaHoje = pedidos
    .filter(p => new Date(p.data).toDateString() === new Date().toDateString() && p.formaPagamento !== 'fiado')
    .reduce((s, p) => s + p.total, 0);

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">📊 Painel do Funcionário</h1>
          <p style="color:var(--cinza-texto)">Bem-vindo(a), ${func?.nome || 'Funcionário'}! • ${new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'})}</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-4" style="margin-bottom:2rem">
        <div class="stat-card">
          <div class="stat-icon blue">👥</div>
          <div>
            <div class="stat-value">${totalAlunos}</div>
            <div class="stat-label">Alunos cadastrados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">⚠️</div>
          <div>
            <div class="stat-value">${totalDevedores}</div>
            <div class="stat-label">Devedores</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow">💰</div>
          <div>
            <div class="stat-value">${formatMoeda(totalDividas)}</div>
            <div class="stat-label">Total em dívidas</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">💵</div>
          <div>
            <div class="stat-value">${formatMoeda(receitaHoje)}</div>
            <div class="stat-label">Receita hoje</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Pedidos recentes -->
        <div class="card">
          <div class="card-header">
            <span class="card-icon">🛒</span>
            <h3>Pedidos Recentes</h3>
          </div>
          <div class="card-body">
            ${pedidos.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3>Nenhum pedido</h3>
              </div>
            ` : [...pedidos].reverse().slice(0, 6).map(p => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--cinza-claro)">
                <div>
                  <div style="font-weight:600;font-size:0.9rem">🎫 ${p.ticket} — ${p.nomeAluno || 'Aluno'}</div>
                  <div style="font-size:0.78rem;color:var(--cinza-texto)">${p.turma || ''} • ${formatDataCurta(p.data)}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700;color:var(--marrom)">${formatMoeda(p.total)}</div>
                  <span class="badge ${p.formaPagamento === 'fiado' ? 'badge-red' : 'badge-green'}" style="font-size:0.7rem">${p.formaPagamento === 'fiado' ? 'Fiado' : 'Pago'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Ações rápidas -->
        <div class="card">
          <div class="card-header">
            <span class="card-icon">⚡</span>
            <h3>Ações Rápidas</h3>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:1rem">
            <button class="btn btn-danger btn-full" onclick="renderPage('devedores')">
              💸 Ver Devedores (${totalDevedores})
            </button>
            <button class="btn btn-warning btn-full" onclick="renderPage('notif-funcionario')">
              📢 Enviar Notificação
            </button>
            <button class="btn btn-primary btn-full" onclick="abrirModalAlunos()">
              👥 Ver Todos os Alunos
            </button>
            <button class="btn btn-success btn-full" onclick="abrirModalRelatorio()">
              📊 Relatório do Dia
            </button>
          </div>
        </div>
      </div>

      <!-- Devedores em destaque -->
      ${totalDevedores > 0 ? `
        <div class="card" style="margin-top:2rem">
          <div class="card-header" style="background:linear-gradient(135deg,#fde8e8,#fcc)">
            <span class="card-icon">⚠️</span>
            <h3 style="color:var(--vermelho-escuro)">Devedores em Destaque</h3>
          </div>
          <div class="card-body">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Turno</th>
                    <th>Dívida</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(usuarios)
                    .filter(([_, u]) => u.divida > 0)
                    .sort((a, b) => b[1].divida - a[1].divida)
                    .map(([username, u]) => `
                      <tr>
                        <td><strong>${u.nome}</strong></td>
                        <td>${u.turma}</td>
                        <td>${u.turno}</td>
                        <td><span style="color:var(--vermelho);font-weight:700">${formatMoeda(u.divida)}</span></td>
                        <td>
                          <button class="btn btn-danger btn-sm" onclick="notificarDevedor('${username}')">📩 Notificar</button>
                          <button class="btn btn-success btn-sm" onclick="quitarDivida('${username}')">✅ Quitar</button>
                        </td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function abrirModalAlunos() {
  const usuarios = DB.get('usuarios') || {};
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-alunos';

  overlay.innerHTML = `
    <div class="modal" style="max-width:700px">
      <div class="modal-header">
        <h2>👥 Todos os Alunos</h2>
        <button class="modal-close" onclick="fecharModal('modal-alunos')">✕</button>
      </div>
      <div class="modal-body">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Nome</th><th>Turma</th><th>Turno</th><th>Total Gasto</th><th>Dívida</th></tr>
            </thead>
            <tbody>
              ${Object.entries(usuarios).map(([_, u]) => `
                <tr>
                  <td><strong>${u.nome}</strong></td>
                  <td>${u.turma}</td>
                  <td>${u.turno}</td>
                  <td>${formatMoeda(u.gasto)}</td>
                  <td style="color:${u.divida > 0 ? 'var(--vermelho)' : 'var(--verde)'}"><strong>${formatMoeda(u.divida)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal('modal-alunos'); });
}

function abrirModalRelatorio() {
  const pedidos = DB.get('pedidos') || [];
  const hoje = new Date().toDateString();
  const pedidosHoje = pedidos.filter(p => new Date(p.data).toDateString() === hoje);
  const receitaTotal = pedidosHoje.filter(p => p.formaPagamento !== 'fiado').reduce((s, p) => s + p.total, 0);
  const fiadoTotal = pedidosHoje.filter(p => p.formaPagamento === 'fiado').reduce((s, p) => s + p.total, 0);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-relatorio';

  overlay.innerHTML = `
    <div class="modal" style="max-width:500px">
      <div class="modal-header">
        <h2>📊 Relatório do Dia</h2>
        <button class="modal-close" onclick="fecharModal('modal-relatorio')">✕</button>
      </div>
      <div class="modal-body">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="font-size:0.9rem;color:var(--cinza-texto)">${new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}</div>
        </div>
        <div class="grid-2" style="margin-bottom:1.5rem">
          <div class="stat-card">
            <div class="stat-icon green">💵</div>
            <div>
              <div class="stat-value">${formatMoeda(receitaTotal)}</div>
              <div class="stat-label">Receita paga</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red">📝</div>
            <div>
              <div class="stat-value">${formatMoeda(fiadoTotal)}</div>
              <div class="stat-label">Em fiado</div>
            </div>
          </div>
        </div>
        <div style="padding:1rem;background:var(--amarelo-claro);border-radius:var(--radius-sm);text-align:center">
          <div style="font-size:0.85rem;color:var(--marrom-claro)">Total de pedidos hoje</div>
          <div style="font-size:2rem;font-weight:900;color:var(--marrom)">${pedidosHoje.length}</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal('modal-relatorio'); });
}

// ===== DEVEDORES =====
function renderDevedores(container) {
  const usuarios = DB.get('usuarios') || {};
  const devedores = Object.entries(usuarios).filter(([_, u]) => u.divida > 0);

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">💸 Controle de Devedores</h1>
          <p style="color:var(--cinza-texto)">${devedores.length} aluno${devedores.length !== 1 ? 's' : ''} com dívida pendente</p>
        </div>
        <button class="btn btn-outline" onclick="renderPage('painel-funcionario')">← Voltar</button>
      </div>

      ${devedores.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <h3>Nenhum devedor!</h3>
          <p>Todos os alunos estão em dia com seus pagamentos.</p>
        </div>
      ` : `
        <div style="margin-bottom:1.5rem;padding:1rem;background:linear-gradient(135deg,#fde8e8,#fcc);border-radius:var(--radius);border:1px solid var(--vermelho)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
            <div>
              <strong style="color:var(--vermelho-escuro)">⚠️ Total em dívidas:</strong>
              <span style="font-size:1.5rem;font-weight:900;color:var(--vermelho);margin-left:10px">
                ${formatMoeda(devedores.reduce((s, [_, u]) => s + u.divida, 0))}
              </span>
            </div>
            <button class="btn btn-danger btn-sm" onclick="notificarTodosDevedores()">📩 Notificar Todos</button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1rem">
          ${devedores.sort((a, b) => b[1].divida - a[1].divida).map(([username, u]) => `
            <div class="card">
              <div class="card-body" style="padding:1.2rem">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="user-avatar" style="background:var(--vermelho);color:white;font-size:0.9rem">${u.avatar || u.nome.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div style="font-weight:700;font-size:1rem">${u.nome}</div>
                      <div style="font-size:0.85rem;color:var(--cinza-texto)">Turma ${u.turma} • ${u.turno}</div>
                      <div style="font-size:0.82rem;color:var(--cinza-texto)">${u.email || ''}</div>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:1.6rem;font-weight:900;color:var(--vermelho)">${formatMoeda(u.divida)}</div>
                    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;justify-content:flex-end">
                      <button class="btn btn-danger btn-sm" onclick="notificarDevedor('${username}')">📩 Notificar</button>
                      <button class="btn btn-success btn-sm" onclick="quitarDivida('${username}')">✅ Quitar</button>
                      <button class="btn btn-outline btn-sm" onclick="verHistoricoDevedor('${username}')">📋 Histórico</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function notificarDevedor(username) {
  const user = getUsuario(username);
  if (!user) return;

  user.notificacoes.push({
    id: gerarId(),
    tipo: 'divida',
    titulo: '⚠️ Aviso de Dívida Pendente',
    texto: `Olá, ${user.nome.split(' ')[0]}! Você tem uma dívida de ${formatMoeda(user.divida)} na cantina. Por favor, regularize sua situação o quanto antes. Em caso de dúvidas, procure a cantina.`,
    data: new Date().toISOString(),
    lida: false
  });
  saveUsuario(username, user);
  showToast(`Notificação enviada para ${user.nome.split(' ')[0]}!`, 'success');
}

function notificarTodosDevedores() {
  const usuarios = DB.get('usuarios') || {};
  let count = 0;
  Object.entries(usuarios).forEach(([username, u]) => {
    if (u.divida > 0) {
      notificarDevedor(username);
      count++;
    }
  });
  showToast(`${count} notificações enviadas!`, 'success');
}

function quitarDivida(username) {
  const user = getUsuario(username);
  if (!user) return;

  const divida = user.divida;
  user.divida = 0;
  user.notificacoes.push({
    id: gerarId(),
    tipo: 'novidade',
    titulo: '✅ Dívida quitada!',
    texto: `Sua dívida de ${formatMoeda(divida)} foi marcada como paga pela cantina. Obrigado!`,
    data: new Date().toISOString(),
    lida: false
  });
  saveUsuario(username, user);
  showToast(`Dívida de ${user.nome.split(' ')[0]} quitada!`, 'success');
  renderPage('devedores');
}

function verHistoricoDevedor(username) {
  const user = getUsuario(username);
  if (!user) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-hist-devedor';

  overlay.innerHTML = `
    <div class="modal" style="max-width:600px">
      <div class="modal-header">
        <h2>📋 Histórico — ${user.nome}</h2>
        <button class="modal-close" onclick="fecharModal('modal-hist-devedor')">✕</button>
      </div>
      <div class="modal-body">
        ${user.historico.length === 0 ? `<div class="empty-state"><h3>Sem histórico</h3></div>` :
          [...user.historico].reverse().map(p => `
            <div style="padding:10px 0;border-bottom:1px solid var(--cinza-claro)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-weight:600">🎫 ${p.ticket} — ${formatDataCurta(p.data)}</div>
                  <div style="font-size:0.82rem;color:var(--cinza-texto)">${p.itens.map(i => `${i.nome} x${i.qtd}`).join(', ')}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700">${formatMoeda(p.total)}</div>
                  <span class="badge ${p.formaPagamento === 'fiado' ? 'badge-red' : 'badge-green'}" style="font-size:0.7rem">${p.formaPagamento}</span>
                </div>
              </div>
            </div>
          `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal('modal-hist-devedor'); });
}

// ===== NOTIFICAÇÕES FUNCIONÁRIO =====
function renderNotifFuncionario(container) {
  const notifGlobais = DB.get('notificacoes_globais') || [];
  const usuarios = DB.get('usuarios') || {};

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">📢 Central de Notificações</h1>
          <p style="color:var(--cinza-texto)">Envie avisos para todos os alunos ou individualmente</p>
        </div>
        <button class="btn btn-outline" onclick="renderPage('painel-funcionario')">← Voltar</button>
      </div>

      <div class="grid-2">
        <!-- Formulário de nova notificação -->
        <div class="card">
          <div class="card-header">
            <span class="card-icon">✉️</span>
            <h3>Nova Notificação</h3>
          </div>
          <div class="card-body">
            <form onsubmit="enviarNotificacao(event)">
              <div class="form-group">
                <label class="form-label">Tipo de Notificação</label>
                <select id="notif-tipo" class="form-control">
                  <option value="novidade">🎉 Novidade / Lançamento</option>
                  <option value="estoque">📦 Aviso de Estoque</option>
                  <option value="divida">💸 Cobrança de Dívida</option>
                  <option value="geral">🔔 Aviso Geral</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Destinatário</label>
                <select id="notif-dest" class="form-control">
                  <option value="todos">👥 Todos os alunos</option>
                  ${Object.entries(usuarios).map(([username, u]) => `
                    <option value="${username}">${u.nome} (${u.turma})</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" id="notif-titulo" class="form-control" placeholder="Ex: Novo item no cardápio!" required>
              </div>
              <div class="form-group">
                <label class="form-label">Mensagem</label>
                <textarea id="notif-texto" class="form-control" rows="4" placeholder="Digite sua mensagem aqui..." required style="resize:vertical"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-full">📤 Enviar Notificação</button>
            </form>
          </div>
        </div>

        <!-- Histórico de notificações enviadas -->
        <div class="card">
          <div class="card-header">
            <span class="card-icon">📋</span>
            <h3>Notificações Enviadas</h3>
          </div>
          <div class="card-body">
            ${notifGlobais.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>Nenhuma notificação enviada</h3>
              </div>
            ` : [...notifGlobais].reverse().map(n => `
              <div class="notif-item ${n.tipo}" style="margin-bottom:0.8rem">
                <span class="notif-icon">${n.tipo === 'divida' ? '💸' : n.tipo === 'novidade' ? '🎉' : n.tipo === 'estoque' ? '📦' : '🔔'}</span>
                <div class="notif-content">
                  <div class="notif-title">${n.titulo}</div>
                  <div class="notif-text">${n.texto.slice(0, 80)}${n.texto.length > 80 ? '...' : ''}</div>
                  <div class="notif-time">📅 ${formatData(n.data)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Notificações rápidas -->
      <div class="card" style="margin-top:2rem">
        <div class="card-header">
          <span class="card-icon">⚡</span>
          <h3>Notificações Rápidas</h3>
        </div>
        <div class="card-body">
          <div class="grid-3">
            <button class="btn btn-warning btn-full" onclick="notifRapida('estoque', '📦 Item em falta!', 'Atenção: O Refri 2L está temporariamente indisponível. Pedimos desculpas pelo inconveniente.')">
              📦 Produto em Falta
            </button>
            <button class="btn btn-success btn-full" onclick="notifRapida('novidade', '🎉 Novidade no cardápio!', 'Temos novidades deliciosas no cardápio desta semana! Venha conferir os novos itens disponíveis.')">
              🎉 Nova Novidade
            </button>
            <button class="btn btn-primary btn-full" onclick="notifRapida('geral', '🔔 Lembrete da Cantina', 'Lembrete: A cantina funciona das 7h às 17h. Aproveite nossos produtos fresquinhos!')">
              🔔 Lembrete Geral
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function enviarNotificacao(e) {
  e.preventDefault();
  const tipo = document.getElementById('notif-tipo').value;
  const dest = document.getElementById('notif-dest').value;
  const titulo = document.getElementById('notif-titulo').value;
  const texto = document.getElementById('notif-texto').value;

  const notif = {
    id: gerarId(),
    tipo,
    titulo,
    texto,
    data: new Date().toISOString(),
    autor: 'Cantina'
  };

  if (dest === 'todos') {
    const notifGlobais = DB.get('notificacoes_globais') || [];
    notifGlobais.push(notif);
    DB.set('notificacoes_globais', notifGlobais);
    showToast('Notificação enviada para todos os alunos!', 'success');
  } else {
    const user = getUsuario(dest);
    if (user) {
      user.notificacoes.push({ ...notif, lida: false });
      saveUsuario(dest, user);
      showToast(`Notificação enviada para ${user.nome.split(' ')[0]}!`, 'success');
    }
  }

  document.getElementById('notif-titulo').value = '';
  document.getElementById('notif-texto').value = '';
  renderPage('notif-funcionario');
}

function notifRapida(tipo, titulo, texto) {
  const notifGlobais = DB.get('notificacoes_globais') || [];
  notifGlobais.push({
    id: gerarId(),
    tipo,
    titulo,
    texto,
    data: new Date().toISOString(),
    autor: 'Cantina'
  });
  DB.set('notificacoes_globais', notifGlobais);
  showToast('Notificação rápida enviada!', 'success');
  renderPage('notif-funcionario');
}
