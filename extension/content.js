// ══════════════════════════════════════════════════════════════
// AutoSpy PRO v5.0 — VERDADEIRAMENTE UNIVERSAL
// Detecta QUALQUER carro em QUALQUER site. Não precisa conhecer
// a marca. Se tem preço de carro + contexto automotivo = analisa
// ══════════════════════════════════════════════════════════════
(function () {
  "use strict";
  if (window.__autospy_loaded) return;
  window.__autospy_loaded = true;

  console.log(
    "%c 🚗 AutoSpy PRO 5.0 — Motor UNIVERSAL Ativado ",
    "background:#0f172a;color:#00d4ff;font-weight:bold;border:1px solid #00d4ff;padding:6px 14px;border-radius:6px;font-size:13px;"
  );

  var currentMode = null;
  var processedIds = new Set();
  var allFoundCars = [];
  var scanning = false;

  // Marcas conhecidas (para enriquecer dados, mas NÃO obrigatórias)
  var BRANDS = [
    "CHEVROLET","HYUNDAI","VOLKSWAGEN","FIAT","TOYOTA","HONDA",
    "RENAULT","NISSAN","FORD","JEEP","MITSUBISHI","PEUGEOT","CITROEN","BYD",
    "GWM","CAOA CHERY","KIA","BMW","MERCEDES","AUDI","VOLVO","LAND ROVER",
    "PORSCHE","SUBARU","SUZUKI","JAC","CHANGAN","DODGE","RAM","MINI",
    "LEXUS","INFINITI","JAGUAR","MASERATI","ALFA ROMEO","CHRYSLER",
    "SMART","TROLLER","IVECO","LIFAN","HAVAL","MG","SERES","CHERY",
    "GREAT WALL","GEELY","CHERRY","DS","SEAT","OPEL","SSANGYONG"
  ];

  var MODELS = [
    "ONIX","ONIX PLUS","TRACKER","CRUZE","S10","SPIN","EQUINOX","CELTA","PRISMA","COBALT","MONTANA",
    "HB20","HB20S","HB20X","CRETA","TUCSON","IX35",
    "GOL","POLO","VIRTUS","T-CROSS","NIVUS","TAOS","TIGUAN","AMAROK","SAVEIRO","VOYAGE","JETTA","FOX",
    "ARGO","CRONOS","MOBI","STRADA","TORO","PULSE","FASTBACK","UNO","PALIO","SIENA","RAMPAGE",
    "COROLLA","COROLLA CROSS","HILUX","SW4","YARIS","ETIOS","RAV4",
    "CIVIC","CITY","HR-V","HRV","FIT","WR-V","ZR-V",
    "KWID","SANDERO","DUSTER","OROCH","CAPTUR","LOGAN",
    "KICKS","VERSA","SENTRA","FRONTIER","MARCH",
    "RANGER","TERRITORY","BRONCO","MAVERICK","KA","ECOSPORT","FIESTA",
    "COMPASS","RENEGADE","COMMANDER",
    "L200","OUTLANDER","ECLIPSE CROSS","ASX","PAJERO",
    "208","2008","C3","C4 CACTUS","DOLPHIN","SONG","YUAN",
    "HAVAL H6","TIGGO 5X","TIGGO 7","TIGGO 8",
    "SPORTAGE","CERATO","SELTOS",
    "320I","X1","X3","A200","C180","GLA","A3","Q3","Q5",
    "RX 450","UX 300","NX 350","ES 300","IS 300","LC 500",
    "S5","MG5","MG ZS","MG HS",
    "XC40","XC60","XC90","V40","V60","S60",
    "CAYENNE","MACAN","PANAMERA","BOXSTER","CAYMAN",
    "WRANGLER","CHEROKEE","GLADIATOR",
    "SERIE 3","CLASSE A","CLASSE C",
    "MODELO 3","MODEL 3","MODEL Y"
  ].sort(function(a, b) { return b.length - a.length; });

  // Palavras que indicam contexto automotivo
  var CAR_CONTEXT_WORDS = [
    "KM","FLEX","DIESEL","AUTOMÁTICO","AUTOMATICO","MANUAL","CVT",
    "SEMINOVO","USADO","0KM","0 KM","VEÍCULO","VEICULO",
    "CÂMBIO","CAMBIO","COMBUSTÍVEL","COMBUSTIVEL",
    "GASOLINA","ETANOL","ELÉTRICO","ELETRICO","HÍBRIDO","HIBRIDO",
    "VER OFERTA","AVALIE","COMPRAR","RESERVAR",
    "ESTOQUE","SEMINOVOS","USADOS","CARROS","MOTOS",
    "OFERTA","FIPE","TABELA",
    "SEDAN","HATCH","SUV","PICKUP","PICAPE","CROSSOVER",
    "TURBO","ASPIRADO","1.0","1.3","1.4","1.5","1.6","1.8","2.0","2.5","3.0",
    "4X4","4X2","AWD","FWD",
    "PORTAS","LUGARES"
  ];

  // ─── MENSAGENS DO POPUP ───
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === "SET_MODE") {
      currentMode = msg.mode;
      console.log("%c 🎯 Modo: " + currentMode.toUpperCase(), "color:#00d4ff;font-weight:bold;font-size:14px;");
      clearAll();
      runScan();
      sendResponse({ ok: true });
    }
    if (msg.type === "FORCE_SCAN") {
      currentMode = msg.mode;
      clearAll();
      runDeepScan();
      sendResponse({ ok: true });
    }
    if (msg.type === "GET_PAGE_CARS") {
      sendResponse(allFoundCars);
    }
    return true;
  });

  // Carrega modo salvo
  chrome.storage.local.get({ mode: null }, function(data) {
    if (data.mode) {
      currentMode = data.mode;
      setTimeout(runScan, 2000);
    }
  });

  function clearAll() {
    document.querySelectorAll(".autospy-badge").forEach(function(el) { el.remove(); });
    document.querySelectorAll(".autospy-highlight").forEach(function(el) {
      el.classList.remove("autospy-highlight","autospy-hl-green","autospy-hl-yellow","autospy-hl-red");
    });
    processedIds.clear();
    allFoundCars = [];
  }

  // ══════════════════════════════════════
  //  SCAN AUTOMÁTICO
  // ══════════════════════════════════════
  function runScan() {
    if (!currentMode || scanning) return;
    try {
      var cards = findAllCarElements();
      if (cards.length > 0) {
        console.log("%c 📋 " + cards.length + " possíveis anúncios detectados", "color:#00d4ff;font-weight:bold;");
        processCards(cards);
      }
    } catch (e) {
      console.warn("AutoSpy scan error:", e);
    }
  }

  // ══════════════════════════════════════
  //  DEEP SCAN COM AUTO-SCROLL
  // ══════════════════════════════════════
  function runDeepScan() {
    if (!currentMode) return;
    scanning = true;
    console.log("%c 🚀 VARREDURA TOTAL INICIADA", "background:#00d4ff;color:#000;font-weight:bold;padding:8px;font-size:14px;");

    // Scan imediato do que está visível
    var cards = findAllCarElements();
    processCards(cards);

    // Scroll automático
    var scrollIndex = 0;
    var maxScrolls = 20;
    var scrollTimer = setInterval(function() {
      scrollIndex++;
      window.scrollBy(0, 600);

      setTimeout(function() {
        var newCards = findAllCarElements();
        processCards(newCards);
      }, 400);

      // Para se chegou ao fim ou atingiu o limite
      var atBottom = (document.documentElement.scrollTop + window.innerHeight) >= (document.documentElement.scrollHeight - 200);
      if (scrollIndex >= maxScrolls || atBottom) {
        clearInterval(scrollTimer);
        scanning = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
        console.log("%c ✅ VARREDURA CONCLUÍDA: " + allFoundCars.length + " carros!", "background:#22c55e;color:#000;font-weight:bold;padding:8px;font-size:14px;");
      }
    }, 700);
  }

  // ══════════════════════════════════════════════════════════════
  //  MOTOR DE DETECÇÃO UNIVERSAL
  //  Não precisa conhecer marca/modelo!
  //  Lógica: encontra PREÇO DE CARRO (R$ 15k-2M) em um bloco
  //  de texto que tenha contexto automotivo ou esteja em um
  //  card/link de listagem
  // ══════════════════════════════════════════════════════════════
  function findAllCarElements() {
    var found = [];
    var checked = new Set();

    // Primeiro verifica se a página inteira tem contexto de carros
    var pageText = (document.body.innerText || "").toUpperCase();
    var pageHasCars = false;
    var contextCount = 0;
    for (var i = 0; i < CAR_CONTEXT_WORDS.length; i++) {
      if (pageText.indexOf(CAR_CONTEXT_WORDS[i]) !== -1) {
        contextCount++;
        if (contextCount >= 2) { pageHasCars = true; break; }
      }
    }

    // Se a página não tem contexto de carros, sai
    if (!pageHasCars) return found;

    // Busca em todos os links, articles, e divs
    var allEls = document.querySelectorAll("a, article, li, div, section");

    for (var j = 0; j < allEls.length; j++) {
      var el = allEls[j];

      // Pula se já processou esse elemento por referência
      if (checked.has(el)) continue;
      checked.add(el);

      // Pula containers muito grandes (provavelmente o wrapper da página)
      if (el.children && el.children.length > 50) continue;

      var text = el.innerText || el.textContent || "";
      if (text.length < 15 || text.length > 2500) continue;

      // TEM PREÇO DE CARRO?
      if (!hasCarPrice(text)) continue;

      // Verifica se este elemento é um "card" (unidade de anúncio)
      // Critérios: tem imagem OU tem link OU tem classe de card OU é um <a>/<article>
      var isCard = false;

      if (el.tagName === "A" || el.tagName === "ARTICLE") {
        isCard = true;
      }

      if (!isCard && el.querySelector("img")) {
        isCard = true;
      }

      if (!isCard) {
        var cn = (el.className || "").toLowerCase();
        if (cn.indexOf("card") !== -1 || cn.indexOf("item") !== -1 || cn.indexOf("listing") !== -1 ||
            cn.indexOf("result") !== -1 || cn.indexOf("vehicle") !== -1 || cn.indexOf("veiculo") !== -1 ||
            cn.indexOf("product") !== -1 || cn.indexOf("offer") !== -1 || cn.indexOf("anuncio") !== -1 ||
            cn.indexOf("carro") !== -1 || cn.indexOf("estoque") !== -1 || cn.indexOf("auto") !== -1) {
          isCard = true;
        }
      }

      // Se o elemento tem preço + é um card visual
      if (isCard) {
        found.push(el);
      }
    }

    // Se ainda não achou nada, MODO ULTRA: pega qualquer DIV/LI com preço de carro
    if (found.length === 0) {
      var divs = document.querySelectorAll("div, li");
      for (var k = 0; k < divs.length; k++) {
        var div = divs[k];
        if (div.children && div.children.length > 30) continue;
        var txt = div.innerText || "";
        if (txt.length < 20 || txt.length > 1500) continue;
        if (hasCarPrice(txt)) {
          found.push(div);
        }
      }
    }

    // Remove elementos dominados (filhos de elementos já encontrados)
    var unique = [];
    for (var u = 0; u < found.length; u++) {
      var dominated = false;
      for (var v = 0; v < found.length; v++) {
        if (found[v] !== found[u] && found[v].contains(found[u])) {
          dominated = true;
          break;
        }
      }
      if (!dominated && unique.indexOf(found[u]) === -1) {
        unique.push(found[u]);
      }
    }

    return unique;
  }

  // Verifica se o texto contém um preço na faixa de carro (R$ 15.000 a R$ 2.000.000)
  function hasCarPrice(text) {
    // R$ com número
    var m1 = text.match(/R\$\s*([\d\.]+[\,]?\d*)/g);
    if (m1) {
      for (var i = 0; i < m1.length; i++) {
        var val = parseInt(m1[i].replace(/[^\d]/g, ""), 10);
        if (val >= 15000 && val <= 2000000) return true;
      }
    }
    // Formato XX.XXX ou XXX.XXX sem R$
    var m2 = text.match(/\b(\d{2,3}\.\d{3})\b/g);
    if (m2) {
      for (var j = 0; j < m2.length; j++) {
        var val2 = parseInt(m2[j].replace(/\./g, ""), 10);
        if (val2 >= 15000 && val2 <= 2000000) return true;
      }
    }
    return false;
  }

  // ══════════════════════════════════════
  //  PROCESSAR CARDS
  // ══════════════════════════════════════
  function processCards(cards) {
    if (!cards || cards.length === 0) return;

    cards.forEach(function(card) {
      var text = (card.innerText || "").substring(0, 150).trim();
      var id = text.replace(/\s+/g, " ");
      if (processedIds.has(id)) return;
      processedIds.add(id);

      var data = extractCarData(card.innerText || card.textContent || "", card);
      if (data) {
        sendToBackground(data, card);
      }
    });
  }

  function sendToBackground(data, element) {
    try {
      chrome.runtime.sendMessage({ type: "CAR_FOUND", data: data }, function(result) {
        if (chrome.runtime.lastError || !result) return;
        allFoundCars.push(result);
        injectBadge(element, result, element === document.body);
        highlightElement(element, result);
        logResult(result);
      });
    } catch(e) {}
  }

  // ══════════════════════════════════════
  //  EXTRAIR DADOS (funciona sem conhecer a marca)
  // ══════════════════════════════════════
  function extractCarData(text, element) {
    var upper = text.toUpperCase();

    // Modelo (tenta da lista, mas NÃO obrigatório)
    var modelo = null;
    for (var i = 0; i < MODELS.length; i++) {
      if (upper.indexOf(MODELS[i]) !== -1) { modelo = MODELS[i]; break; }
    }

    // Marca (tenta da lista, mas NÃO obrigatório)
    var marca = null;
    for (var j = 0; j < BRANDS.length; j++) {
      if (upper.indexOf(BRANDS[j]) !== -1) { marca = BRANDS[j]; break; }
    }

    // Se não achou na lista, tenta extrair o primeiro "nome" do texto (geralmente é a marca/modelo)
    if (!marca && !modelo) {
      // Pega as primeiras palavras em maiúscula (geralmente "LEXUS RX 450H+" ou "MG S5")
      var nameMatch = text.match(/^[\s]*([A-ZÀ-Ú][A-ZÀ-Ú0-9\s\-\+\.\/]+)/m);
      if (nameMatch) {
        var rawName = nameMatch[1].trim();
        if (rawName.length >= 2 && rawName.length <= 40) {
          // Separa: primeira palavra = marca, resto = modelo
          var parts = rawName.split(/\s+/);
          if (parts.length >= 2) {
            marca = parts[0];
            modelo = parts.slice(1).join(" ");
          } else {
            modelo = rawName;
          }
        }
      }
    }

    // Se ainda não tem modelo, tenta pegar do título do link ou alt da imagem
    if (!modelo && element) {
      var title = element.getAttribute("title") || "";
      var ariaLabel = element.getAttribute("aria-label") || "";
      var altText = "";
      var img = element.querySelector("img");
      if (img) altText = img.getAttribute("alt") || "";

      var candidates = [title, ariaLabel, altText];
      for (var c = 0; c < candidates.length; c++) {
        if (candidates[c].length >= 3 && candidates[c].length <= 60) {
          var cp = candidates[c].toUpperCase().split(/\s+/);
          if (cp.length >= 1) {
            if (!marca && cp.length >= 2) marca = cp[0];
            if (!modelo) modelo = cp.slice(marca ? 1 : 0).join(" ") || cp[0];
            break;
          }
        }
      }
    }

    // Se AINDA não tem modelo, usa "DESCONHECIDO"
    if (!modelo) modelo = "DESCONHECIDO";

    // Preço (OBRIGATÓRIO)
    var preco = extractBestPrice(text);
    if (!preco) return null;

    // Ano
    var ano = null;
    var anoMatch = text.match(/\b(19[89]\d|20[0-2]\d)\b/g);
    if (anoMatch) {
      var anos = anoMatch.map(Number).filter(function(a) { return a >= 1990 && a <= 2027; });
      if (anos.length > 0) ano = Math.max.apply(null, anos);
    }

    // KM
    var km = null;
    var kmMatch = text.match(/([\d\.]+)\s*km/i);
    if (kmMatch) {
      km = parseInt(kmMatch[1].replace(/\./g, ""), 10);
      if (km <= 0 || km > 999999) km = null;
    }

    // Cidade
    var cidade = null;
    var cidMatch = text.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s[A-ZÀ-Ú][a-zà-ú]+)*)\s*[-–]\s*[A-Z]{2}\b/);
    if (cidMatch) cidade = cidMatch[1].trim();

    // Vendedor
    var vendedor = "desconhecido";
    var fullText = text + " " + document.title + " " + location.hostname;
    if (/\b(loja|concession|revenda|multimarcas|veículos|motors|car|auto center|automoveis|dealer)/i.test(fullText)) {
      vendedor = "loja";
    } else if (/\b(particular|dono|proprietário|owner)/i.test(text)) {
      vendedor = "particular";
    }

    // Combustível
    var combustivel = null;
    if (/\b(flex|gasolina|etanol|álcool)/i.test(text)) combustivel = "Flex/Gasolina";
    else if (/\bdiesel\b/i.test(text)) combustivel = "Diesel";
    else if (/\b(elétrico|eletrico|electric|ev|phev)\b/i.test(text)) combustivel = "Elétrico";
    else if (/\b(híbrido|hibrido|hybrid)/i.test(text)) combustivel = "Híbrido";

    // Câmbio
    var cambio = null;
    if (/\b(automático|automatico|automática|automatica|aut\b|cvt|tiptronic)/i.test(text)) cambio = "Automático";
    else if (/\b(manual|mt)\b/i.test(text)) cambio = "Manual";

    // Cor
    var cor = null;
    var cores = ["BRANCO","PRETO","PRATA","CINZA","VERMELHO","AZUL","BRANCA","PRETA","VERMELHA"];
    for (var cc = 0; cc < cores.length; cc++) {
      if (upper.indexOf(cores[cc]) !== -1) { cor = cores[cc]; break; }
    }

    // Link
    var link = null;
    if (element && element.tagName === "A" && element.href) {
      link = element.href;
    } else if (element) {
      var a = element.querySelector("a[href]");
      if (a && a.href) link = a.href;
    }

    // Imagem
    var imagem = null;
    if (element) {
      var imgEl = element.querySelector("img[src]");
      if (imgEl && imgEl.src) imagem = imgEl.src;
    }

    // Laudo aprovado / Cautelar
    var laudo = false;
    if (/\b(laudo|cautelar|perícia|pericia|vistoria)\s*(aprovado|aprovada|100%|ok)\b/i.test(fullText) || /\b(vistoriado)\b/i.test(fullText)) {
      laudo = true;
    }

    return {
      modelo: modelo, marca: marca, ano: ano, km: km, preco: preco,
      cidade: cidade, vendedor: vendedor, combustivel: combustivel,
      cambio: cambio, cor: cor, link: link, imagem: imagem, laudo: laudo
    };
  }

  function extractBestPrice(text) {
    var best = 0;

    // R$ com número
    var matches = text.match(/R\$\s*([\d\.]+[\,]?\d*)/g);
    if (matches) {
      for (var i = 0; i < matches.length; i++) {
        var val = parseInt(matches[i].replace(/[^\d]/g, ""), 10);
        if (val > 15000 && val < 2000000 && val > best) best = val;
      }
    }

    // Formato XX.XXX sem R$
    if (best === 0) {
      var loose = text.match(/\b(\d{2,3}\.\d{3})\b/g);
      if (loose) {
        for (var j = 0; j < loose.length; j++) {
          var val2 = parseInt(loose[j].replace(/\./g, ""), 10);
          if (val2 > 15000 && val2 < 2000000 && val2 > best) best = val2;
        }
      }
    }

    return best > 0 ? best : null;
  }

  // ══════════════════════════════════════
  //  VISUAL
  // ══════════════════════════════════════
  function highlightElement(el, result) {
    if (el === document.body) return;
    el.classList.add("autospy-highlight");
    if (result.classificacao === "VERDE") el.classList.add("autospy-hl-green");
    else if (result.classificacao === "AMARELO") el.classList.add("autospy-hl-yellow");
    else if (result.classificacao === "VERMELHO") el.classList.add("autospy-hl-red");
  }

  function injectBadge(container, result, isFullPage) {
    var badge = document.createElement("div");
    badge.className = "autospy-badge" + (isFullPage ? " spy-full-page" : "");

    var cls = result.classificacao;
    var borderClass = cls === "VERDE" ? "spy-border-green" : cls === "AMARELO" ? "spy-border-yellow" : cls === "VERMELHO" ? "spy-border-red" : "spy-border-gray";
    var scoreCls = (result.scoreCompra || 0) >= 75 ? "ms-green" : (result.scoreCompra || 0) >= 55 ? "ms-yellow" : "ms-red";

    var margem = result.fipe ? result.fipe - (result.preco || 0) : 0;
    var margemClass = margem >= 0 ? "val-green" : "val-red";
    var margemStr = (margem >= 0 ? "" : "-") + "R$ " + Math.abs(margem).toLocaleString("pt-BR");

    // Tags inteligentes
    var tags = "";
    if (result.laudo) tags += '<span class="spy-tag spy-tag-green">✅ laudo aprovado</span>';
    if (result.bomNegocio && !tags) tags += '<span class="spy-tag spy-tag-green">✅ bom negócio</span>';
    if (result.margemAlta) tags += '<span class="spy-tag spy-tag-green">💰 margem alta</span>';

    if (result.km && result.ano) {
      var age = new Date().getFullYear() - parseInt(result.ano);
      var kmEsp = age * 15000;
      if (age <= 0 || result.km === 0) {
        tags += '<span class="spy-tag spy-tag-blue">🆕 0km</span>';
      } else if (result.km < kmEsp * 0.7) {
        tags += '<span class="spy-tag spy-tag-green">✅ baixo km</span>';
      } else if (result.km > kmEsp * 1.5) {
        tags += '<span class="spy-tag spy-tag-red">🔴 alto km</span>';
      }
    } else if (result.km === 0 || (result.ano && result.ano >= new Date().getFullYear())) {
      tags += '<span class="spy-tag spy-tag-blue">🆕 0km</span>';
    }

    if (result.valorizando) tags += '<span class="spy-tag spy-tag-green">📈 valorizando</span>';
    if (result.desvalorizando) tags += '<span class="spy-tag spy-tag-red">📉 desvalorizando</span>';
    if (result.bomCarro) tags += '<span class="spy-tag spy-tag-blue">⭐ carro top</span>';
    if (result.compensa) tags += '<span class="spy-tag spy-tag-purple">🎯 compensa</span>';

    if (result.alertas) {
      for (var i = 0; i < result.alertas.length; i++) {
        if (result.alertas[i].indexOf("golpe") !== -1 || result.alertas[i].indexOf("GOLPE") !== -1 ||
            result.alertas[i].indexOf("suspeito") !== -1 || result.alertas[i].indexOf("absurdamente") !== -1) {
          tags += '<span class="spy-tag spy-tag-red">🚨 suspeito</span>';
          break;
        }
      }
    }

    if (isFullPage) {
      var fsCls = (result.scoreCompra || 0) >= 75 ? "fs-green" : (result.scoreCompra || 0) >= 55 ? "fs-yellow" : "fs-red";
      badge.innerHTML =
        '<div class="spy-full-card">' +
          '<div class="spy-full-header">' +
            '<div class="spy-full-score ' + fsCls + '">' + (result.scoreCompra || 0) + '</div>' +
            '<div>' +
              '<div class="spy-full-title">' + (result.label || "") + '</div>' +
              '<div class="spy-full-subtitle">' + (result.marca || "") + ' ' + (result.modelo || "") + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="spy-full-row">📊 Tabela FIPE: <strong>R$ ' + (result.fipe ? result.fipe.toLocaleString("pt-BR") : "sem dados") + '</strong></div>' +
          '<div class="spy-full-lucro ' + (margem >= 0 ? "positive" : "negative") + '">Margem ' + (result.fipe ? margemStr : "N/A") + '</div>' +
          (result.margemPercent != null ? '<div class="spy-full-row">📈 ' + result.margemPercent + '% | Liquidez: ' + (result.liquidez || "?") + '/10</div>' : '') +
          (result.tendencia ? '<div class="spy-full-row">' + (result.tendencia === "subindo" ? "📈 Valorizando" : result.tendencia === "caindo" ? "📉 Desvalorizando" : "➡️ Estável") + '</div>' : '') +
          (tags ? '<div class="spy-tags">' + tags + '</div>' : '') +
          (result.recomendacao ? '<div class="spy-full-reco">' + result.recomendacao + '</div>' : '') +
        '</div>';
      document.body.appendChild(badge);

      // COMPACT: bolha flutuante renderizada no card do anúncio
    } else {
      badge.innerHTML =
        '<div class="spy-compact ' + borderClass + '">' +
          '<div class="spy-info-line">Tabela <strong>' + (result.fipe ? result.fipe.toLocaleString("pt-BR") : "s/ dados") + '</strong></div>' +
          '<div class="spy-info-line">Margem <strong class="' + margemClass + '">' + (result.fipe ? margemStr : "N/A") + '</strong></div>' +
          (tags ? '<div class="spy-tags">' + tags + '</div>' : '') +
        '</div>';

      // Insere DENTRO do card com position relative para flutuar por cima da imagem
      container.style.position = "relative";
      container.appendChild(badge);
    }
  }

  function logResult(r) {
    var colors = { VERDE: "#22c55e", AMARELO: "#eab308", VERMELHO: "#ef4444", CINZA: "#94a3b8" };
    var emoji = (r.scoreCompra || 0) >= 75 ? "🟢" : (r.scoreCompra || 0) >= 55 ? "🟡" : "🔴";
    console.log(
      "%c " + emoji + " [" + (r.scoreCompra || 0) + "] " + (r.marca || "?") + " " + (r.modelo || "?") + " | R$ " + (r.preco ? r.preco.toLocaleString("pt-BR") : "?") + " | FIPE: " + (r.fipe ? "R$ " + r.fipe.toLocaleString("pt-BR") : "s/dados"),
      "color:" + (colors[r.classificacao] || "#94a3b8") + ";font-weight:bold;font-size:12px;"
    );
  }

  // Loop automático
  setInterval(runScan, 3000);
})();
