const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Banco de dados em memória (Nota: Vercel serverless não persiste)
let scannedCars = [];

app.post('/api/car-data', (req, res) => {
    const carData = req.body;
    carData.timestamp = new Date().toLocaleTimeString();
    scannedCars.push(carData);
    if (scannedCars.length > 50) scannedCars.shift();
    res.json({ success: true });
});

app.get('/api/scanned-cars', (req, res) => {
    res.json(scannedCars);
});

// Apena escuta se não estiver na Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`AutoSpy Dashboard Rodando em: http://localhost:${PORT}`);
    });
}

module.exports = app;
