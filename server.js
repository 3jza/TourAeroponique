const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();

// Port dynamique pour Render
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ⬇️ IMPORTANT : Servir les fichiers statiques du dossier 'web'
app.use(express.static(path.join(__dirname, 'web')));

// Stockage en mémoire
let donneesActuelles = {
    temperature: 0,
    humidite: 0,
    luminosite: 0,
    horodatage: new Date().toLocaleString('fr-FR')
};

let historique = [];
const MAX_HISTORIQUE = 200;

// ============================================
// ROUTES API
// ============================================

// Route pour l'ESP32
app.post('/update', (req, res) => {
    try {
        const { temp, humi, lumi } = req.body;
        
        if (temp === undefined || humi === undefined || lumi === undefined) {
            return res.status(400).json({ 
                error: "Données manquantes",
                received: req.body 
            });
        }
        
        donneesActuelles = {
            temperature: parseFloat(temp) || 0,
            humidite: parseFloat(humi) || 0,
            luminosite: parseInt(lumi) || 0,
            horodatage: new Date().toLocaleString('fr-FR')
        };
        
        historique.unshift({
            ...donneesActuelles,
            timestamp: Date.now()
        });
        
        if (historique.length > MAX_HISTORIQUE) {
            historique = historique.slice(0, MAX_HISTORIQUE);
        }
        
        console.log(`[${donneesActuelles.horodatage}] ✓ Données reçues :`, 
                    `${temp}°C, ${humi}%, ${lumi}lux`);
        
        res.status(200).json({ 
            status: "success",
            message: "Données enregistrées",
            data: donneesActuelles
        });
        
    } catch (error) {
        console.error("Erreur /update :", error);
        res.status(500).json({ 
            error: "Erreur serveur",
            details: error.message 
        });
    }
});

// Route pour le dashboard
app.get('/data', (req, res) => {
    res.json(donneesActuelles);
});

// Route pour l'historique
app.get('/historique', (req, res) => {
    const limit = parseInt(req.query.limit) || historique.length;
    res.json(historique.slice(0, limit));
});

// Route page d'accueil → index.html du dossier web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Page de statut
app.get('/status', (req, res) => {
    res.json({
        status: "online",
        uptime: process.uptime(),
        derniere_mesure: donneesActuelles,
        nombre_mesures: historique.length,
        memoire_utilisee: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    });
});

// Démarrage
app.listen(port, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🌱 TOUR AÉROPONIQUE - SERVEUR ACTIF');
    console.log('='.repeat(50));
    console.log(`Port : ${port}`);
    console.log(`Environnement : ${process.env.NODE_ENV || 'development'}`);
    console.log(`Fichiers statiques : ${path.join(__dirname, 'web')}`);
    console.log(`Démarré le : ${new Date().toLocaleString('fr-FR')}`);
    console.log('='.repeat(50));
});

process.on('SIGTERM', () => {
    console.log('Signal SIGTERM reçu, arrêt du serveur...');
    process.exit(0);
});