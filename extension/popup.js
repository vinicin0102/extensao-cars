// Popup Logic
document.addEventListener('DOMContentLoaded', () => {
    let count = 0;
    const countEl = document.getElementById('scanned-count');
    const listEl = document.getElementById('deals-list');

    // Escuta atualizações do content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "SCAN_UPDATE") {
            count++;
            countEl.innerText = count;

            if (message.data.profit > 8000) {
                updateDealsList(message.data);
            }
        }
    });

    function updateDealsList(data) {
        // Limpa mensagem vazia na primeira vez
        const empty = listEl.querySelector('.empty-msg');
        if (empty) empty.remove();

        const item = document.createElement('div');
        item.style.padding = "8px";
        item.style.borderBottom = "1px solid #334155";
        item.style.fontSize = "0.8rem";
        item.style.color = "#4ade80";
        item.innerHTML = `<strong>OPORTUNIDADE:</strong> Lucro R$ ${data.profit.toLocaleString('pt-BR')}`;
        
        listEl.prepend(item);
    }
});
