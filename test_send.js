const axios = require('axios');

console.log("🚀 Initialisation du simulateur...");

const sendData = async () => {
    const data = {
        temp: (Math.random() * 5 + 20).toFixed(1),
        humi: (Math.random() * 10 + 50).toFixed(1),
        lumi: Math.floor(Math.random() * 5000 + 400),
        pH: (Math.random() * 14).toFixed(1),
    };

    try {
        const response = await axios.post('https://touraeroponique.onrender.com/update', data);
        console.log("✅ Données envoyées au serveur :", data, "| Réponse :", response.status);
    } catch (err) {
        console.error("❌ Erreur : Le serveur Node.js est-il lancé ? (", err.message, ")");
    }
};

// On force un premier envoi immédiat
sendData();

// On lance la boucle toutes les 3 secondes
setInterval(sendData, 3000);

console.log("📡 Simulation en cours... Appuie sur Ctrl+C pour arrêter.");