// =============================================
// CANTINA ESCOLAR - PAINEL ECONÔMICO
// Extensão do app.js para controle financeiro
// =============================================

/**
 * Renderiza a página de controle econômico do aluno
 * (integrada ao histórico com gráficos)
 */
function renderEconomico(container) {
  const user = getUsuario(STATE.currentUser);
  if (!user) return;

  const historico = user.historico;

  // Calcular estatísticas
  const hoje = new Date().toDateString();
  const semanaInicio = new Date(); semanaInicio.setDate(semanaInicio.getDate() - 7);
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const gastoHoje = historico.filter(p => new Date(p.data).toDateString() === hoje).reduce((s, p) => s + p.total, 0);
  const gastoSemana = historico.filter(p => new Date(p.data) >= semanaInicio).reduce((s, p) => s + p.total, 0);
  const gastoMes = historico.filter(p => new Date(p.data).getMonth() === mesAtual && new Date(p.data).getFullYear() === anoAtual).reduce((s, p) => s + p.total, 0);
  const gastoAno = historico.filter(p => new Date(p.data).getFullYear() === anoAtual).reduce((s, p) => s + p.total, 0);

  const ticketMedio = historico.length > 0 ? gastoAno / historico.length : 0;
  const pedidoMaior = historico.length > 0 ? Math.max(...historico.map(p => p.total)) : 0;

  container.innerHTML = `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 class="section-title">💰 Controle Econômico</h1>
          <p style="color:var(--cinza-texto)">Acompanhe seus gastos na cantina</p>
        </div>
        <button class="btn btn-outline" onclick="renderPage('dashboard')">← Voltar</button>
      </div>

      ${historico.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">💰</div>
          <h3>Sem dados financeiros</h3>
          <p>Faça pedidos para ver seu controle econômico</p>
          <button class="btn btn-primary" style="margin-top:1rem" onclick="renderPage('cardapio')">Ver Cardápio</button>
        </div>
      ` : `
        <!-- Cards de resumo -->
        <div class="grid-4" style="margin-bottom:2rem">
          <div class="stat-card">
            <div class="stat-icon yellow">📅</div>
            <div>
              <div class="stat-value">${formatMoeda(gastoHoje)}</div>
              <div class="stat-label">Hoje</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">📆</div>
            <div>
              <div class="stat-value">${formatMoeda(gastoSemana)}</div>
              <div class="stat-label">Esta semana</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">🗓️</div>
            <div>
              <div class="stat-value">${formatMoeda(gastoMes)}</div>
              <div class="stat-label">Este mês</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow">🏆</div>
            <div>
              <div class="stat-value">${formatMoeda(gastoAno)}</div>
              <div class="stat-label">Este ano</div>
            </div>
          </div>
        </div>

        <!-- Gráfico de gastos -->
        <div class="card" style="margin-bottom:2rem">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h3>Evolução dos Gastos</h3>
          </div>
          <div class="card-body">
            <!-- Seletor de período -->
            <div class="tabs" style="margin-bottom:1.5rem">
              <button class="tab-btn active" id="tab-semana" onclick="mudarPeriodoGrafico('semana')">📅 Semana</button>
              <button class="tab-btn" id="tab-mes" onclick="mudarPeriodoGrafico('mes')">📆 Mês</button>
              <button class="tab-btn" id="tab-ano" onclick="mudarPeriodoGrafico('ano')">🗓️ Ano</button>
            </div>
            <div id="grafico-gastos" style="width:100%;min-height:180px"></div>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:2rem">
          <!-- Distribuição por categoria -->
          <div class="card">
            <div class="card-header">
              <span class="card-icon">🍽️</span>
              <h3>Gastos por Categoria</h3>
            </div>
            <div class="card-body">
              <div id="grafico-categorias"></div>
            </div>
          </div>

          <!-- Estatísticas adicionais -->
          <div class="card">
            <div class="card-header">
              <span class="card-icon">📈</span>
              <h3>Estatísticas</h3>
            </div>
            <div class="card-body">
              <div style="display:flex;flex-direction:column;gap:1rem">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--cinza-claro);border-radius:var(--radius-sm)">
                  <span style="color:var(--cinza-texto);font-size:0.9rem">🛒 Total de pedidos</span>
                  <span style="font-weight:700;color:var(--marrom)">${historico.length}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--cinza-claro);border-radius:var(--radius-sm)">
                  <span style="color:var(--cinza-texto);font-size:0.9rem">💵 Ticket médio</span>
                  <span style="font-weight:700;color:var(--marrom)">${formatMoeda(ticketMedio)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--cinza-claro);border-radius:var(--radius-sm)">
                  <span style="color:var(--cinza-texto);font-size:0.9rem">🏆 Maior pedido</span>
                  <span style="font-weight:700;color:var(--marrom)">${formatMoeda(pedidoMaior)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:${user.divida > 0 ? '#fde8e8' : '#d5f5e3'};border-radius:var(--radius-sm)">
                  <span style="color:var(--cinza-texto);font-size:0.9rem">${user.divida > 0 ? '⚠️ Dívida atual' : '✅ Situação'}</span>
                  <span style="font-weight:700;color:${user.divida > 0 ? 'var(--vermelho)' : 'var(--verde)'}">
                    ${user.divida > 0 ? formatMoeda(user.divida) : 'Em dia!'}
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--cinza-claro);border-radius:var(--radius-sm)">
                  <span style="color:var(--cinza-texto);font-size:0.9rem">💳 Forma mais usada</span>
                  <span style="font-weight:700;color:var(--marrom)">${getFormaMaisUsada(historico)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dívida detalhada -->
        ${user.divida > 0 ? `
          <div class="card" style="margin-bottom:2rem;border:2px solid var(--vermelho)">
            <div class="card-header" style="background:linear-gradient(135deg,#fde8e8,#fcc)">
              <span class="card-icon">⚠️</span>
              <h3 style="color:var(--vermelho-escuro)">Dívida Pendente</h3>
            </div>
            <div class="card-body">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
                <div>
                  <p style="color:var(--cinza-texto);margin-bottom:0.5rem">Você tem pedidos no fiado que precisam ser pagos:</p>
                  ${historico.filter(p => p.formaPagamento === 'fiado').map(p => `
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--cinza-claro);font-size:0.85rem">
                      <span>🎫 ${p.ticket} — ${formatDataCurta(p.data)}</span>
                      <span style="font-weight:700;color:var(--vermelho)">${formatMoeda(p.total)}</span>
                    </div>
                  `).join('')}
                </div>
                <div style="text-align:center">
                  <div style="font-size:2rem;font-weight:900;color:var(--vermelho)">${formatMoeda(user.divida)}</div>
                  <div style="font-size:0.8rem;color:var(--cinza-texto)">Total em dívida</div>
                  <p style="font-size:0.82rem;color:var(--cinza-texto);margin-top:0.5rem">Procure a cantina para regularizar</p>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      `}
    </div>
  `;

  // Renderizar gráficos após o DOM estar pronto
  if (historico.length > 0) {
    setTimeout(() => {
      const dadosSemana = gerarDadosGastos(historico, 'semana');
      renderBarChart('grafico-gastos', dadosSemana);

      const dadosCats = gerarDadosCategorias(historico);
      renderDonutChart('grafico-categorias', dadosCats);
    }, 100);
  }
}

function mudarPeriodoGrafico(periodo) {
  document.querySelectorAll('#tab-semana, #tab-mes, #tab-ano').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + periodo)?.classList.add('active');

  const user = getUsuario(STATE.currentUser);
  if (!user) return;

  const dados = gerarDadosGastos(user.historico, periodo);
  if (periodo === 'mes' || periodo === 'ano') {
    renderLineChart('grafico-gastos', dados);
  } else {
    renderBarChart('grafico-gastos', dados);
  }
}

function getFormaMaisUsada(historico) {
  if (historico.length === 0) return '—';
  const contagem = {};
  historico.forEach(p => {
    contagem[p.formaPagamento] = (contagem[p.formaPagamento] || 0) + 1;
  });
  const mais = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
  const nomes = { pix: 'PIX', dinheiro: 'Dinheiro', cartao: 'Cartão', fiado: 'Fiado' };
  return nomes[mais[0]] || mais[0];
}
