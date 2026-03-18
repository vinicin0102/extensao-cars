const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados em memória
let scannedCars = [];

// API para a extensão enviar dados
app.post('/api/car-data', (req, res) => {
    const carData = req.body;
    carData.timestamp = new Date().toLocaleTimeString();
    scannedCars.push(carData);
    
    // Limita o histórico
    if (scannedCars.length > 50) scannedCars.shift();
    
    console.log(`Recebido: ${carData.title} | Lucro: R$ ${carData.profit}`);
    res.json({ success: true });
});

// API para o Dashboard ler dados
app.get('/api/scanned-cars', (req, res) => {
    res.json(scannedCars);
});

app.listen(PORT, () => {
    console.log(`AutoSpy Dashboard Rodando em: http://localhost:${PORT}`);
});
