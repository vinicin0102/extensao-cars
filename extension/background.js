// ══════════════════════════════════════════════════════════════
// AutoSpy PRO v4.0 — Background Service Worker
// Análise completa: lucro, margem, valorização, score de compra
// ══════════════════════════════════════════════════════════════

// ─── BANCO FIPE APROXIMADO (2025/2026) com tendência ───
// tendencia: "subindo", "estavel", "caindo"
const FIPE_DB = {
  "CHEVROLET": {
    "ONIX": { fipe: 78000, demanda: "alta", liquidez: 9, tendencia: "estavel", revenda_dias: 15 },
    "ONIX PLUS": { fipe: 85000, demanda: "alta", liquidez: 9, tendencia: "estavel", revenda_dias: 15 },
    "TRACKER": { fipe: 115000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 20 },
    "CRUZE": { fipe: 98000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 35 },
    "S10": { fipe: 215000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 20 },
    "SPIN": { fipe: 88000, demanda: "media", liquidez: 6, tendencia: "estavel", revenda_dias: 40 },
    "EQUINOX": { fipe: 145000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 45 },
    "CELTA": { fipe: 32000, demanda: "alta", liquidez: 9, tendencia: "caindo", revenda_dias: 10 },
    "PRISMA": { fipe: 58000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 15 },
    "COBALT": { fipe: 55000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 30 },
    "MONTANA": { fipe: 105000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 18 }
  },
  "HYUNDAI": {
    "HB20": { fipe: 72000, demanda: "alta", liquidez: 9, tendencia: "estavel", revenda_dias: 12 },
    "HB20S": { fipe: 78000, demanda: "alta", liquidez: 9, tendencia: "estavel", revenda_dias: 12 },
    "CRETA": { fipe: 125000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 15 },
    "TUCSON": { fipe: 175000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 35 },
    "IX35": { fipe: 95000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 30 },
    "HB20X": { fipe: 75000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 20 }
  },
  "VOLKSWAGEN": {
    "GOL": { fipe: 48000, demanda: "alta", liquidez: 10, tendencia: "caindo", revenda_dias: 8 },
    "POLO": { fipe: 85000, demanda: "alta", liquidez: 9, tendencia: "estavel", revenda_dias: 12 },
    "VIRTUS": { fipe: 92000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 15 },
    "T-CROSS": { fipe: 125000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 15 },
    "NIVUS": { fipe: 118000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 18 },
    "TAOS": { fipe: 170000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 30 },
    "TIGUAN": { fipe: 190000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 45 },
    "AMAROK": { fipe: 225000, demanda: "alta", liquidez: 7, tendencia: "subindo", revenda_dias: 25 },
    "SAVEIRO": { fipe: 80000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 10 },
    "VOYAGE": { fipe: 55000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 15 },
    "JETTA": { fipe: 160000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 40 },
    "FOX": { fipe: 48000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 12 }
  },
  "FIAT": {
    "ARGO": { fipe: 70000, demanda: "alta", liquidez: 9, tendencia: "estavel", revenda_dias: 12 },
    "CRONOS": { fipe: 75000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 15 },
    "MOBI": { fipe: 50000, demanda: "alta", liquidez: 9, tendencia: "estavel", revenda_dias: 10 },
    "STRADA": { fipe: 98000, demanda: "altissima", liquidez: 10, tendencia: "subindo", revenda_dias: 7 },
    "TORO": { fipe: 135000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 12 },
    "PULSE": { fipe: 92000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 18 },
    "FASTBACK": { fipe: 118000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 25 },
    "UNO": { fipe: 48000, demanda: "alta", liquidez: 9, tendencia: "caindo", revenda_dias: 10 },
    "PALIO": { fipe: 32000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 12 },
    "SIENA": { fipe: 35000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 20 },
    "RAMPAGE": { fipe: 150000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 30 }
  },
  "TOYOTA": {
    "COROLLA": { fipe: 135000, demanda: "altissima", liquidez: 10, tendencia: "subindo", revenda_dias: 10 },
    "COROLLA CROSS": { fipe: 165000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 14 },
    "HILUX": { fipe: 260000, demanda: "altissima", liquidez: 10, tendencia: "subindo", revenda_dias: 7 },
    "SW4": { fipe: 300000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 15 },
    "YARIS": { fipe: 92000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 25 },
    "ETIOS": { fipe: 62000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 15 },
    "RAV4": { fipe: 240000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 30 }
  },
  "HONDA": {
    "CIVIC": { fipe: 140000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 12 },
    "CITY": { fipe: 108000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 18 },
    "HR-V": { fipe: 138000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 14 },
    "HRV": { fipe: 138000, demanda: "alta", liquidez: 9, tendencia: "subindo", revenda_dias: 14 },
    "FIT": { fipe: 80000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 15 },
    "WR-V": { fipe: 100000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 22 },
    "ZR-V": { fipe: 195000, demanda: "media", liquidez: 7, tendencia: "subindo", revenda_dias: 25 }
  },
  "RENAULT": {
    "KWID": { fipe: 55000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 15 },
    "SANDERO": { fipe: 70000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 18 },
    "DUSTER": { fipe: 100000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 20 },
    "OROCH": { fipe: 108000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 22 },
    "CAPTUR": { fipe: 105000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 25 },
    "LOGAN": { fipe: 62000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 22 }
  },
  "NISSAN": {
    "KICKS": { fipe: 108000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 18 },
    "VERSA": { fipe: 92000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 25 },
    "SENTRA": { fipe: 110000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 35 },
    "FRONTIER": { fipe: 210000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 18 },
    "MARCH": { fipe: 52000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 25 }
  },
  "FORD": {
    "RANGER": { fipe: 235000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 18 },
    "TERRITORY": { fipe: 160000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 30 },
    "BRONCO": { fipe: 230000, demanda: "media", liquidez: 6, tendencia: "subindo", revenda_dias: 35 },
    "MAVERICK": { fipe: 188000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 28 },
    "KA": { fipe: 52000, demanda: "alta", liquidez: 8, tendencia: "caindo", revenda_dias: 12 },
    "ECOSPORT": { fipe: 85000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 25 },
    "FIESTA": { fipe: 42000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 20 }
  },
  "JEEP": {
    "COMPASS": { fipe: 160000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 20 },
    "RENEGADE": { fipe: 108000, demanda: "alta", liquidez: 8, tendencia: "estavel", revenda_dias: 18 },
    "COMMANDER": { fipe: 220000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 28 }
  },
  "MITSUBISHI": {
    "L200": { fipe: 195000, demanda: "alta", liquidez: 8, tendencia: "subindo", revenda_dias: 18 },
    "OUTLANDER": { fipe: 185000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 40 },
    "ECLIPSE CROSS": { fipe: 165000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 42 },
    "ASX": { fipe: 130000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 35 },
    "PAJERO": { fipe: 170000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 35 }
  },
  "PEUGEOT": {
    "208": { fipe: 85000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 25 },
    "2008": { fipe: 105000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 28 }
  },
  "CITROEN": {
    "C3": { fipe: 72000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 25 },
    "C4 CACTUS": { fipe: 92000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 35 }
  },
  "BYD": {
    "DOLPHIN": { fipe: 120000, demanda: "alta", liquidez: 7, tendencia: "subindo", revenda_dias: 22 },
    "SONG": { fipe: 180000, demanda: "alta", liquidez: 7, tendencia: "subindo", revenda_dias: 25 },
    "YUAN": { fipe: 135000, demanda: "alta", liquidez: 7, tendencia: "subindo", revenda_dias: 25 }
  },
  "GWM": {
    "HAVAL H6": { fipe: 170000, demanda: "media", liquidez: 6, tendencia: "estavel", revenda_dias: 35 }
  },
  "CAOA CHERY": {
    "TIGGO 5X": { fipe: 105000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 35 },
    "TIGGO 7": { fipe: 135000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 38 },
    "TIGGO 8": { fipe: 175000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 40 }
  },
  "KIA": {
    "SPORTAGE": { fipe: 175000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 28 },
    "CERATO": { fipe: 120000, demanda: "media", liquidez: 7, tendencia: "caindo", revenda_dias: 30 },
    "SELTOS": { fipe: 140000, demanda: "media", liquidez: 7, tendencia: "estavel", revenda_dias: 25 }
  },
  "BMW": {
    "320I": { fipe: 250000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 45 },
    "X1": { fipe: 280000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 40 },
    "X3": { fipe: 350000, demanda: "media", liquidez: 5, tendencia: "caindo", revenda_dias: 50 }
  },
  "MERCEDES": {
    "A200": { fipe: 220000, demanda: "media", liquidez: 5, tendencia: "caindo", revenda_dias: 50 },
    "C180": { fipe: 270000, demanda: "media", liquidez: 5, tendencia: "caindo", revenda_dias: 50 },
    "GLA": { fipe: 290000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 45 }
  },
  "AUDI": {
    "A3": { fipe: 220000, demanda: "media", liquidez: 5, tendencia: "caindo", revenda_dias: 50 },
    "Q3": { fipe: 280000, demanda: "media", liquidez: 6, tendencia: "caindo", revenda_dias: 45 },
    "Q5": { fipe: 380000, demanda: "media", liquidez: 5, tendencia: "caindo", revenda_dias: 55 }
  }
};

// Custos estimados de operação para REVENDA
const CUSTOS = {
  revisao: 1500,
  documentacao: 800,
  transporte: 500,
  polimento: 400,
  margem_seguranca: 500
};
const CUSTO_TOTAL = Object.values(CUSTOS).reduce((a, b) => a + b, 0);

// ─── LISTENERS ───
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAR_FOUND") {
    processCarData(msg.data).then(result => {
      // Salva no storage
      chrome.storage.local.get({ cars: [] }, (stored) => {
        const cars = stored.cars;
        result.url = sender.tab ? sender.tab.url : "";
        result.siteHost = sender.tab ? new URL(sender.tab.url).hostname : "";
        result.timestamp = new Date().toISOString();
        
        // Evita duplicatas (mesmo modelo, mesmo preço, mesmo site)
        const isDuplicate = cars.some(c => 
          c.modelo === result.modelo && 
          c.preco === result.preco && 
          c.siteHost === result.siteHost
        );
        if (!isDuplicate) {
          cars.unshift(result);
          if (cars.length > 500) cars.pop();
          chrome.storage.local.set({ cars });
        }
      });
      sendResponse(result);
    });
    return true; // async
  }

  if (msg.type === "BATCH_CARS") {
    const promises = msg.cars.map(carData => processCarData(carData));
    Promise.all(promises).then(results => {
      chrome.storage.local.get({ cars: [] }, (stored) => {
        const cars = stored.cars;
        const host = sender.tab ? new URL(sender.tab.url).hostname : "";
        results.forEach(result => {
          result.url = sender.tab ? sender.tab.url : "";
          result.siteHost = host;
          result.timestamp = new Date().toISOString();
          const isDuplicate = cars.some(c =>
            c.modelo === result.modelo &&
            c.preco === result.preco &&
            c.siteHost === result.siteHost
          );
          if (!isDuplicate) {
            cars.unshift(result);
          }
        });
        if (cars.length > 500) cars.splice(500);
        chrome.storage.local.set({ cars });
        sendResponse({ ok: true, count: results.length, results });
      });
    });
    return true;
  }

  if (msg.type === "GET_CARS") {
    chrome.storage.local.get({ cars: [] }, (stored) => {
      sendResponse(stored.cars);
    });
    return true;
  }

  if (msg.type === "GET_SITE_CARS") {
    chrome.storage.local.get({ cars: [] }, (stored) => {
      const filtered = stored.cars.filter(c => c.siteHost === msg.host);
      sendResponse(filtered);
    });
    return true;
  }

  if (msg.type === "CLEAR_CARS") {
    chrome.storage.local.set({ cars: [] });
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "GET_FIPE") {
    sendResponse(FIPE_DB);
    return true;
  }

  if (msg.type === "EXPORT_CARS") {
    chrome.storage.local.get({ cars: [] }, (stored) => {
      sendResponse(stored.cars);
    });
    return true;
  }
});

// ─── ANÁLISE INTELIGENTE COMPLETA ───
async function processCarData(raw) {
  const { modelo, marca, ano, km, preco, cidade, vendedor, combustivel, cambio, cor, extras } = raw;
  const result = { ...raw };

  // Busca FIPE
  let fipeEntry = null;
  if (marca && modelo) {
    const brandDB = FIPE_DB[marca.toUpperCase()];
    if (brandDB) {
      fipeEntry = brandDB[modelo.toUpperCase()];
      if (!fipeEntry) {
        for (const key in brandDB) {
          if (modelo.toUpperCase().includes(key) || key.includes(modelo.toUpperCase())) {
            fipeEntry = brandDB[key];
            break;
          }
        }
      }
    }
  }

  // Se não achou pela marca, tenta busca global
  if (!fipeEntry && modelo) {
    for (const brand in FIPE_DB) {
      for (const m in FIPE_DB[brand]) {
        if (modelo.toUpperCase().includes(m)) {
          fipeEntry = FIPE_DB[brand][m];
          result.marca = brand;
          break;
        }
      }
      if (fipeEntry) break;
    }
  }

  if (fipeEntry) {
    result.fipe = fipeEntry.fipe;
    result.demanda = fipeEntry.demanda;
    result.liquidez = fipeEntry.liquidez;
    result.tendencia = fipeEntry.tendencia;
    result.revenda_dias = fipeEntry.revenda_dias;

    // Ajusta FIPE pelo ano (deprecia ~7% ao ano)
    if (ano) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - parseInt(ano);
      if (age > 0) {
        result.fipe = Math.round(fipeEntry.fipe * Math.pow(0.93, age));
      }
      result.idade = age;
    }

    // ─── CÁLCULOS DE LUCRO ───
    result.lucroBreve = result.fipe - preco;
    result.lucroLiquido = result.fipe - preco - CUSTO_TOTAL;
    result.margemPercent = parseFloat(((result.lucroLiquido / preco) * 100).toFixed(1));
    result.diffFipe = result.fipe - preco;
    result.diffFipePercent = parseFloat(((result.diffFipe / result.fipe) * 100).toFixed(1));

    // ─── SCORE DE COMPRA (0-100) ───
    let score = 50; // base

    // +/- por preço vs FIPE
    if (result.diffFipePercent > 20) score += 25;
    else if (result.diffFipePercent > 10) score += 18;
    else if (result.diffFipePercent > 5) score += 10;
    else if (result.diffFipePercent > 0) score += 5;
    else if (result.diffFipePercent > -5) score -= 5;
    else if (result.diffFipePercent > -10) score -= 12;
    else score -= 20;

    // + por liquidez
    score += (fipeEntry.liquidez - 5) * 3;

    // + por demanda
    const demandaScore = { altissima: 10, alta: 6, media: 0, baixa: -8 };
    score += demandaScore[fipeEntry.demanda] || 0;

    // + por tendência
    if (fipeEntry.tendencia === "subindo") score += 8;
    else if (fipeEntry.tendencia === "caindo") score -= 5;

    // + por km baixa
    if (km && ano) {
      const age = new Date().getFullYear() - parseInt(ano);
      const kmEsperado = age * 15000;
      if (km < kmEsperado * 0.7) score += 5;
      else if (km > kmEsperado * 1.5) score -= 5;
    }

    // Clamp
    result.scoreCompra = Math.max(0, Math.min(100, Math.round(score)));

    // ─── CLASSIFICAÇÃO ───
    if (result.scoreCompra >= 75) {
      result.classificacao = "VERDE";
      result.label = "EXCELENTE NEGÓCIO";
    } else if (result.scoreCompra >= 55) {
      result.classificacao = "AMARELO";
      result.label = "NEGÓCIO MEDIANO";
    } else {
      result.classificacao = "VERMELHO";
      result.label = "EVITAR";
    }

    // ─── INDICADORES VISUAIS ───
    result.bomNegocio = result.preco <= result.fipe;
    result.margemAlta = result.margemPercent > 10;
    result.compensa = result.scoreCompra >= 60;
    result.bomCarro = fipeEntry.liquidez >= 8 && (fipeEntry.demanda === "alta" || fipeEntry.demanda === "altissima");
    result.valorizando = fipeEntry.tendencia === "subindo";
    result.desvalorizando = fipeEntry.tendencia === "caindo";

    // ─── RECOMENDAÇÃO ───
    if (result.scoreCompra >= 80) {
      result.recomendacao = "🏆 COMPRAR AGORA! Oportunidade rara.";
    } else if (result.scoreCompra >= 65) {
      result.recomendacao = "✅ Bom negócio. Vale a pena investir.";
    } else if (result.scoreCompra >= 50) {
      result.recomendacao = "⚖️ Negociável. Tente abaixar o preço.";
    } else if (result.scoreCompra >= 35) {
      result.recomendacao = "⚠️ Preço alto. Só compre se necessário.";
    } else {
      result.recomendacao = "🚫 Péssimo negócio. Passe longe!";
    }

    // ─── ALERTAS ───
    result.alertas = [];

    if (preco < result.fipe * 0.55) {
      result.alertas.push("🚨 GOLPE? Preço absurdamente baixo!");
    } else if (preco < result.fipe * 0.7) {
      result.alertas.push("⚠️ Preço muito abaixo — investigue antes!");
    }

    if (km && ano) {
      const age = new Date().getFullYear() - parseInt(ano);
      const kmEsperado = age * 15000;
      if (km > kmEsperado * 2) {
        result.alertas.push("⚠️ KM muito alta para o ano");
      }
      if (km < kmEsperado * 0.2 && age > 3) {
        result.alertas.push("⚠️ KM suspeitamente baixa — possível adulteração");
      }
    }

    if (preco > result.fipe * 1.15) {
      result.alertas.push("🔴 Preço 15%+ acima da FIPE");
    }

    if (fipeEntry.tendencia === "caindo") {
      result.alertas.push("📉 Modelo em desvalorização");
    }

    if (fipeEntry.liquidez <= 5) {
      result.alertas.push("🐌 Baixa liquidez — difícil revender");
    }

    if (vendedor === "loja" && result.diffFipePercent < -5) {
      result.alertas.push("💸 Loja com preço acima da FIPE — negocie!");
    }

  } else {
    result.classificacao = "CINZA";
    result.label = "SEM DADOS FIPE";
    result.scoreCompra = 0;
    result.alertas = ["ℹ️ Modelo não encontrado na base FIPE"];
    result.recomendacao = "❓ Sem dados para análise automática.";
    result.bomNegocio = false;
    result.margemAlta = false;
    result.compensa = false;
    result.bomCarro = false;
    result.valorizando = false;
    result.desvalorizando = false;
  }

  return result;
}
