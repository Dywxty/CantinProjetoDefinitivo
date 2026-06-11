// =============================================
// CANTINA ESCOLAR - GRÁFICOS E VISUALIZAÇÕES
// =============================================

/**
 * Renderiza um gráfico de barras simples em SVG
 */
function renderBarChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    width = container.offsetWidth || 400,
    height = 200,
    color = '#FFD600',
    colorAlt = '#F9A800',
    labelColor = '#555',
    valueColor = '#5C3D11',
    showValues = true
  } = options;

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><h3>Sem dados</h3></div>';
    return;
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.floor((width - 40) / data.length) - 8;
  const chartHeight = height - 50;

  let svgBars = '';
  let svgLabels = '';
  let svgValues = '';

  data.forEach((d, i) => {
    const barH = Math.max((d.value / maxVal) * chartHeight, 2);
    const x = 20 + i * (barWidth + 8);
    const y = chartHeight - barH + 10;
    const grad = i % 2 === 0 ? color : colorAlt;

    svgBars += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" 
            fill="${grad}" rx="4" ry="4" opacity="0.9">
        <title>${d.label}: ${typeof d.value === 'number' && d.value % 1 !== 0 ? 'R$ ' + d.value.toFixed(2).replace('.', ',') : d.value}</title>
      </rect>
    `;

    if (showValues && d.value > 0) {
      const valText = d.value >= 1 ? (d.value % 1 !== 0 ? 'R$' + d.value.toFixed(0) : d.value) : '';
      svgValues += `
        <text x="${x + barWidth / 2}" y="${y - 4}" 
              text-anchor="middle" font-size="10" fill="${valueColor}" font-weight="700">${valText}</text>
      `;
    }

    const labelText = d.label.length > 6 ? d.label.slice(0, 5) + '.' : d.label;
    svgLabels += `
      <text x="${x + barWidth / 2}" y="${height - 5}" 
            text-anchor="middle" font-size="10" fill="${labelColor}">${labelText}</text>
    `;
  });

  container.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <!-- Grid lines -->
      ${[0.25, 0.5, 0.75, 1].map(pct => {
        const y = 10 + (1 - pct) * chartHeight;
        return `<line x1="15" y1="${y}" x2="${width - 10}" y2="${y}" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="4,4"/>`;
      }).join('')}
      ${svgBars}
      ${svgValues}
      ${svgLabels}
    </svg>
  `;
}

/**
 * Renderiza um gráfico de pizza/donut em SVG
 */
function renderDonutChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { size = 160, innerRadius = 50 } = options;
  const colors = ['#FFD600', '#F9A800', '#2ECC71', '#3498DB', '#E74C3C', '#9B59B6', '#E67E22'];
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:1rem"><h3>Sem dados</h3></div>';
    return;
  }

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;

  let paths = '';
  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const slice = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + slice;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + innerRadius * Math.cos(startAngle);
    const iy1 = cy + innerRadius * Math.sin(startAngle);
    const ix2 = cx + innerRadius * Math.cos(endAngle);
    const iy2 = cy + innerRadius * Math.sin(endAngle);
    const largeArc = slice > Math.PI ? 1 : 0;

    paths += `
      <path d="M ${ix1} ${iy1} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z"
            fill="${colors[i % colors.length]}" opacity="0.9" stroke="white" stroke-width="2">
        <title>${d.label}: ${Math.round((d.value / total) * 100)}%</title>
      </path>
    `;
    startAngle = endAngle;
  });

  const legendItems = data.map((d, i) => `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
      <div style="width:12px;height:12px;border-radius:3px;background:${colors[i % colors.length]};flex-shrink:0"></div>
      <span style="font-size:0.78rem;color:var(--cinza-texto)">${d.label}</span>
      <span style="font-size:0.78rem;font-weight:700;color:var(--marrom);margin-left:auto">${Math.round((d.value / total) * 100)}%</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0">
        ${paths}
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="11" fill="#5C3D11" font-weight="600">Total</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="13" fill="#5C3D11" font-weight="800">${data.length}</text>
        <text x="${cx}" y="${cy + 24}" text-anchor="middle" font-size="9" fill="#888">itens</text>
      </svg>
      <div style="flex:1;min-width:120px">${legendItems}</div>
    </div>
  `;
}

/**
 * Renderiza um gráfico de linha simples
 */
function renderLineChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    width = container.offsetWidth || 400,
    height = 160,
    color = '#F9A800',
    fillColor = 'rgba(255, 214, 0, 0.15)'
  } = options;

  if (!data || data.length < 2) {
    container.innerHTML = '<div class="empty-state" style="padding:1rem"><h3>Dados insuficientes</h3></div>';
    return;
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2 - 20;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + (1 - d.value / maxVal) * chartH,
    ...d
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${points[0].x},${padY + chartH} ` + polyline + ` ${points[points.length - 1].x},${padY + chartH}`;

  const dots = points.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="white" stroke-width="2">
      <title>${p.label}: R$ ${p.value.toFixed(2).replace('.', ',')}</title>
    </circle>
  `).join('');

  const labels = points.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map(p => `
    <text x="${p.x}" y="${padY + chartH + 16}" text-anchor="middle" font-size="9" fill="#888">${p.label}</text>
  `).join('');

  container.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <!-- Grid -->
      ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padY + pct * chartH;
        const val = maxVal * (1 - pct);
        return `
          <line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>
          <text x="${padX - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="#aaa">R$${val.toFixed(0)}</text>
        `;
      }).join('')}
      <!-- Área preenchida -->
      <polygon points="${area}" fill="url(#lineGrad)"/>
      <!-- Linha -->
      <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- Pontos -->
      ${dots}
      <!-- Labels -->
      ${labels}
    </svg>
  `;
}

/**
 * Gera dados de gastos por período para o aluno
 */
function gerarDadosGastos(historico, periodo = 'semana') {
  const agora = new Date();
  const dados = [];

  if (periodo === 'semana') {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(agora);
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const gasto = historico
        .filter(p => new Date(p.data).toDateString() === dayStr)
        .reduce((s, p) => s + p.total, 0);
      dados.push({ label: diasSemana[d.getDay()], value: gasto });
    }
  } else if (periodo === 'mes') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(agora);
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const gasto = historico
        .filter(p => new Date(p.data).toDateString() === dayStr)
        .reduce((s, p) => s + p.total, 0);
      dados.push({ label: d.getDate() + '/' + (d.getMonth() + 1), value: gasto });
    }
  } else if (periodo === 'ano') {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    for (let m = 0; m < 12; m++) {
      const gasto = historico
        .filter(p => new Date(p.data).getMonth() === m && new Date(p.data).getFullYear() === agora.getFullYear())
        .reduce((s, p) => s + p.total, 0);
      dados.push({ label: meses[m], value: gasto });
    }
  }

  return dados;
}

/**
 * Gera dados de distribuição por categoria
 */
function gerarDadosCategorias(historico) {
  const cats = {};
  historico.forEach(pedido => {
    pedido.itens.forEach(item => {
      for (const [catNome, catData] of Object.entries(CARDAPIO)) {
        if (catData.itens[item.nome]) {
          cats[catNome] = (cats[catNome] || 0) + item.preco * item.qtd;
          break;
        }
      }
    });
  });

  return Object.entries(cats)
    .filter(([_, v]) => v > 0)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
