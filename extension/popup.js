document.addEventListener("DOMContentLoaded", () => {
  const modeButtons = document.querySelectorAll(".mode-btn");
  const statusBar = document.getElementById("status-bar");
  const statusText = document.getElementById("status-text");
  const scanBtn = document.getElementById("btn-scan");
  const statsGrid = document.getElementById("stats-grid");
  const topSection = document.getElementById("top-section");
  const alertSection = document.getElementById("alert-section");
  const topTitle = document.getElementById("top-title");
  const tabBar = document.getElementById("tab-bar");

  let currentMode = null;
  let allCars = [];

  // Carrega modo salvo
  chrome.storage.local.get({ mode: null }, (data) => {
    if (data.mode) activateMode(data.mode);
    loadData();
  });

  // ─── TABS ───
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById("tab-" + tab.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  // ─── SELECIONAR MODO ───
  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      activateMode(mode);
      chrome.storage.local.set({ mode });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "SET_MODE", mode });
        }
      });
    });
  });

  function activateMode(mode) {
    currentMode = mode;
    modeButtons.forEach(b => b.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    statusBar.classList.add("active");
    scanBtn.disabled = false;
    statsGrid.style.display = "grid";
    topSection.style.display = "block";
    if (alertSection) alertSection.style.display = "block";
    tabBar.style.display = "flex";

    const labels = {
      revenda: { status: "REVENDA — buscando lucro máximo", top: "💰 Maiores Margens de Lucro", good: "Lucrativos" },
      compra: { status: "COMPRA — buscando melhores negócios", top: "🛒 Melhores para Comprar", good: "Bons" },
      analise: { status: "ANÁLISE — mostrando tudo", top: "📊 Ranking por Score", good: "Analisados" }
    };

    const l = labels[mode];
    statusText.textContent = l.status;
    topTitle.textContent = l.top;
    document.getElementById("lbl-bons").textContent = l.good;
  }

  // ─── SCAN MANUAL (VARREDURA TOTAL) ───
  scanBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        statusText.textContent = "🚀 Iniciando Varredura Total...";
        scanBtn.textContent = "⏳ Varrendo Site...";
        scanBtn.disabled = true;

        chrome.tabs.sendMessage(tabs[0].id, { type: "FORCE_SCAN", mode: currentMode }, (response) => {
          // Espera um tempo para o scroll e análise acontecerem
          setTimeout(() => {
            loadData();
            scanBtn.textContent = "🔍 Escanear Tudo";
            scanBtn.disabled = false;
            statusText.textContent = "✅ Varredura Completa! Veja o relatório.";
          }, 12000); // 12 segundos para a varredura completa
        });
      }
    });
  });

  // ─── DASHBOARD ───
  document.getElementById("btn-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: "dashboard.html" });
  });

  // ─── LIMPAR ───
  document.getElementById("btn-clear").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CLEAR_CARS" }, () => {
      loadData();
      statusText.textContent = "🗑️ Histórico limpo!";
    });
  });

  // ─── EXPORTAR CSV ───
  document.getElementById("btn-export").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "EXPORT_CARS" }, (cars) => {
      if (!cars || cars.length === 0) return;
      const headers = ["Score","Classificação","Marca","Modelo","Ano","KM","Preço","FIPE","Lucro Líq.","Margem %","Demanda","Liquidez","Tendência","Dias p/ Vender","Combustível","Câmbio","Vendedor","Recomendação","URL"];
      const rows = cars.map(c => [
        c.scoreCompra || 0,
        c.label || "",
        c.marca || "",
        c.modelo || "",
        c.ano || "",
        c.km || "",
        c.preco || "",
        c.fipe || "",
        c.lucroLiquido || "",
        c.margemPercent || "",
        c.demanda || "",
        c.liquidez || "",
        c.tendencia || "",
        c.revenda_dias || "",
        c.combustivel || "",
        c.cambio || "",
        c.vendedor || "",
        c.recomendacao?.replace(/[^\w\s]/g, "") || "",
        c.url || ""
      ]);
      const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `autospy_carros_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // ─── FILTERS ───
  const filterClass = document.getElementById("filter-class");
  const filterSort = document.getElementById("filter-sort");
  if (filterClass) filterClass.addEventListener("change", () => renderAllCars(allCars));
  if (filterSort) filterSort.addEventListener("change", () => renderAllCars(allCars));

  // ─── CARREGAR DADOS ───
  function loadData() {
    chrome.runtime.sendMessage({ type: "GET_CARS" }, (cars) => {
      if (!cars) return;
      allCars = cars;

      document.getElementById("total").textContent = cars.length;

      const greens = cars.filter(c => c.classificacao === "VERDE").length;
      const yellows = cars.filter(c => c.classificacao === "AMARELO").length;
      const reds = cars.filter(c => c.classificacao === "VERMELHO").length;

      document.getElementById("bons").textContent = greens;
      document.getElementById("medios").textContent = yellows;
      document.getElementById("ruins").textContent = reds;

      // ─── TOP LIST ───
      renderTopList(cars);

      // ─── ALL CARS ───
      renderAllCars(cars);

      // ─── ALERTAS ───
      renderAlerts(cars);
    });
  }

  function renderTopList(cars) {
    const topList = document.getElementById("top-list");
    let sorted = [];

    if (currentMode === "revenda") {
      sorted = cars.filter(c => c.lucroLiquido > 0).sort((a, b) => b.lucroLiquido - a.lucroLiquido);
    } else if (currentMode === "compra") {
      sorted = cars.filter(c => c.scoreCompra >= 50).sort((a, b) => b.scoreCompra - a.scoreCompra);
    } else {
      sorted = [...cars].sort((a, b) => (b.scoreCompra || 0) - (a.scoreCompra || 0));
    }

    const top5 = sorted.slice(0, 8);
    if (top5.length > 0) {
      topList.innerHTML = top5.map(c => renderCarCard(c)).join("");
    } else {
      topList.innerHTML = '<div class="empty-state"><div class="empty-icon">🚗</div>Navegue em um site de carros e clique Escanear</div>';
    }
  }

  function renderAllCars(cars) {
    const allList = document.getElementById("all-cars-list");
    const countEl = document.getElementById("cars-count");
    let filtered = [...cars];

    // Filtro classificação
    const cls = filterClass?.value;
    if (cls) filtered = filtered.filter(c => c.classificacao === cls);

    // Sort
    const sort = filterSort?.value;
    if (sort === "score") filtered.sort((a, b) => (b.scoreCompra || 0) - (a.scoreCompra || 0));
    else if (sort === "preco-asc") filtered.sort((a, b) => (a.preco || 0) - (b.preco || 0));
    else if (sort === "preco-desc") filtered.sort((a, b) => (b.preco || 0) - (a.preco || 0));
    else if (sort === "lucro") filtered.sort((a, b) => (b.lucroLiquido || -999999) - (a.lucroLiquido || -999999));
    else if (sort === "margem") filtered.sort((a, b) => (b.margemPercent || -999) - (a.margemPercent || -999));

    if (filtered.length > 0) {
      allList.innerHTML = filtered.map(c => renderCarCard(c)).join("");
      countEl.textContent = `${filtered.length} carro(s) encontrado(s)`;
    } else {
      allList.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div>Nenhum carro encontrado ainda</div>';
      countEl.textContent = "";
    }
  }

  function renderCarCard(c) {
    const clsMap = { VERDE: "cc-green", AMARELO: "cc-yellow", VERMELHO: "cc-red", CINZA: "cc-gray" };
    const scoreMap = { VERDE: "sc-green", AMARELO: "sc-yellow", VERMELHO: "sc-red" };
    const cardCls = clsMap[c.classificacao] || "cc-gray";
    const scoreCls = scoreMap[c.classificacao] || "sc-red";

    // Tags
    let tags = "";
    if (c.bomNegocio) tags += '<span class="cc-tag t-green">✅ Bom Negócio</span>';
    if (c.margemAlta) tags += '<span class="cc-tag t-green">💰 Margem Alta</span>';
    if (c.compensa) tags += '<span class="cc-tag t-blue">🎯 Compensa</span>';
    if (c.bomCarro) tags += '<span class="cc-tag t-purple">⭐ Carro Top</span>';
    if (c.valorizando) tags += '<span class="cc-tag t-green">📈 Valorizando</span>';
    if (c.desvalorizando) tags += '<span class="cc-tag t-red">📉 Desvalorizando</span>';
    if (c.tendencia === "estavel") tags += '<span class="cc-tag t-yellow">➡️ Estável</span>';

    // Lucro
    let lucroHTML = "";
    if (c.lucroLiquido != null) {
      if (c.lucroLiquido >= 0) {
        lucroHTML = `<span class="cc-lucro positive">+R$ ${c.lucroLiquido.toLocaleString("pt-BR")}</span>`;
      } else {
        lucroHTML = `<span class="cc-lucro negative">-R$ ${Math.abs(c.lucroLiquido).toLocaleString("pt-BR")}</span>`;
      }
    }

    return `
      <div class="car-card ${cardCls}" ${c.link ? 'onclick="window.open(\'' + c.link + '\', \'_blank\')"' : ''}>
        <div class="cc-top">
          <div>
            <div class="cc-name">${c.marca || ""} ${c.modelo || "?"}</div>
            <div class="cc-details">
              <span class="cc-detail">💰 R$ ${c.preco ? c.preco.toLocaleString("pt-BR") : "?"}</span>
              ${c.ano ? '<span class="cc-detail">📅 ' + c.ano + '</span>' : ''}
              ${c.km ? '<span class="cc-detail">🛣️ ' + c.km.toLocaleString("pt-BR") + ' km</span>' : ''}
            </div>
          </div>
          <div class="cc-score ${scoreCls}">${c.scoreCompra || 0}</div>
        </div>
        <div class="cc-details" style="margin-top:4px;">
          ${c.fipe ? '<span class="cc-detail">📊 FIPE: R$ ' + c.fipe.toLocaleString("pt-BR") + '</span>' : ''}
          ${lucroHTML ? '<span class="cc-detail">' + lucroHTML + '</span>' : ''}
          ${c.margemPercent != null ? '<span class="cc-detail">📈 ' + c.margemPercent + '%</span>' : ''}
          ${c.liquidez ? '<span class="cc-detail">💧 ' + c.liquidez + '/10</span>' : ''}
          ${c.revenda_dias ? '<span class="cc-detail">⏱️ ~' + c.revenda_dias + 'd</span>' : ''}
          ${c.combustivel ? '<span class="cc-detail">⛽ ' + c.combustivel + '</span>' : ''}
          ${c.cambio ? '<span class="cc-detail">⚙️ ' + c.cambio + '</span>' : ''}
        </div>
        ${tags ? '<div class="cc-tags">' + tags + '</div>' : ''}
        ${c.recomendacao ? '<div class="cc-reco">' + c.recomendacao + '</div>' : ''}
      </div>`;
  }

  function renderAlerts(cars) {
    const alertsList = document.getElementById("alerts-list");
    if (!alertsList) return;
    const alertCars = cars.filter(c => c.alertas && c.alertas.length > 0).slice(0, 10);
    if (alertCars.length > 0) {
      alertsList.innerHTML = alertCars.map(c =>
        c.alertas.map(a => `<div class="alert-item">${c.marca || ""} ${c.modelo}: ${a}</div>`).join("")
      ).join("");
    } else {
      alertsList.innerHTML = '<div class="empty-state" style="padding:16px">✅ Nenhum alerta</div>';
    }
  }
});
