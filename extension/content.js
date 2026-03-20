// AutoSpy - Real-time Content Script
(function() {
    console.log("AutoSpy PRO Active - Scanner Iniciado.");

    // Simulação de banco de dados de mercado para fins de demonstração rápida
    // Em produção, isso consultaria uma API de preços/FIPE
    const MARKET_PRICES = {
        "HB20": 65000,
        "ONIX": 68000,
        "COROLLA": 120000,
        "HILUX": 250000,
        "GOL": 45000,
        "CIVIC": 115000
    };

    function scanPage() {
        const hostname = window.location.hostname;
        let cards = [];

        if (hostname.includes('webmotors')) {
            cards = document.querySelectorAll('.ContainerCardVehicle');
        } else if (hostname.includes('olx')) {
            cards = document.querySelectorAll('.sc-1f2ug0x-0'); // Seletor genérico OLX
        }

        cards.forEach(card => {
            if (card.dataset.spyProcessed) return;

            // Extração de dados (Webmotors Exemplo)
            const titleElement = card.querySelector('h2');
            const priceElement = card.querySelector('strong');
            
            if (titleElement && priceElement) {
                const title = titleElement.innerText.toUpperCase();
                const priceText = priceElement.innerText.replace(/\D/g, '');
                const price = parseFloat(priceText);

                // Lógica de Espionagem
                processCarData(card, title, price);
            }
            
            card.dataset.spyProcessed = "true";
        });
    }

    function processCarData(card, title, price) {
        let foundModel = null;
        for (const model in MARKET_PRICES) {
            if (title.includes(model)) {
                foundModel = model;
                break;
            }
        }

        if (foundModel) {
            const marketPrice = MARKET_PRICES[foundModel];
            const profit = marketPrice - price;
            const profitPercent = ((profit / price) * 100).toFixed(1);

            injectSpyBadge(card, profit, profitPercent, title);
        }
    }

    function injectSpyBadge(card, profit, percent, title) {
        const badge = document.createElement('div');
        badge.className = 'autospy-badge';
        
        const isGoodDeal = profit > 5000;
        const colorClass = isGoodDeal ? 'spy-profit' : 'spy-neutral';
        const icon = isGoodDeal ? '🔥' : '⚙️';

        badge.innerHTML = `
            <div class="${colorClass}">
                <span class="spy-icon">${icon}</span>
                <span class="spy-profit-val">R$ ${profit.toLocaleString('pt-BR')} de Lucro Estimado</span>
                <span class="spy-percent">${percent}% margem</span>
            </div>
        `;

        card.style.position = 'relative';
        card.appendChild(badge);

        // Envia para o Popup
        chrome.runtime.sendMessage({ type: "SCAN_UPDATE", data: { profit, percent } });

        // Envia para o LOCALHOST DASHBOARD
        fetch('http://localhost:3000/api/car-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, profit, percent })
        }).catch(err => console.log("Dashboard off? Run node server.js"));
    }

    // Cronômetro de scan para capturar carregamento dinâmico (infinit scroll)
    setInterval(scanPage, 2000);
})();
