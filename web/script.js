/*
 * Projet Tour Aéroponique Automatisée - STI2D SIN
 * Script JavaScript pour la mise à jour automatique de l'interface
 * 
 * Fonctionnalités :
 * - Lecture du fichier data.json
 * - Mise à jour automatique des valeurs affichées
 * - Gestion de l'état de connexion
 * - Mise à jour toutes les 2-5 secondes
 */

// Configuration
// On récupère désormais les données via le serveur Node (route /data)
// Si la page est servie depuis un autre hôte/port (ex: nginx), CORS est géré côté serveur.
const CHEMIN_JSON = window.location.origin + '/data';
const INTERVALLE_MAJ = 5000;       // Intervalle de mise à jour en millisecondes (3 secondes)

// Éléments DOM pour l'affichage
const elements = {
    temperature: document.getElementById('temperature-value'),
    humidite: document.getElementById('humidite-value'),
    luminosite: document.getElementById('luminosite-value'),
    horodatage: document.getElementById('horodatage'),
    connectionStatus: document.getElementById('connection-status'),
    connectionIndicator: document.getElementById('connection-indicator'),
    tempStatus: document.getElementById('temp-status'),
    humiStatus: document.getElementById('humi-status'),
    lumiStatus: document.getElementById('lumi-status')
};

// Variables pour suivre l'état
let derniereDonnee = null;
let nombreErreurs = 0;
let estConnecte = false; // État de connexion du système

// Historique des mesures (limité à 100 entrées pour chaque capteur)
const historique = {
    temperature: [],
    humidite: [],
    luminosite: []
};
const MAX_HISTORIQUE = 20; // Nombre maximum d'entrées dans l'historique

/**
 * Fonction pour charger et afficher les données depuis le fichier JSON
 */
async function chargerDonnees() {
    try {
        // Requête fetch vers le serveur (route /data)
        // On utilise un timestamp pour éviter le cache du navigateur/proxy
        const timestamp = new Date().getTime();
        const response = await fetch(`${CHEMIN_JSON}?t=${timestamp}`);
        
        // Vérification de la réponse HTTP
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        
        // Lecture et parsing du JSON
        const donnees = await response.json();
        
        // Vérification de la validité des données
        if (donnees && typeof donnees.temperature !== 'undefined') {
            // Conversion des valeurs en nombres (au cas où elles seraient des strings)
            donnees.temperature = parseFloat(donnees.temperature) || 0;
            donnees.humidite = parseFloat(donnees.humidite) || 0;
            donnees.luminosite = parseInt(donnees.luminosite) || 0;
            
            // Réinitialisation du compteur d'erreurs
            nombreErreurs = 0;
            estConnecte = true;
            mettreAJourEtatConnexion(true);
            
            // Mise à jour de l'affichage
            mettreAJourAffichage(donnees);
            
            // Ajout à l'historique (la fonction vérifie elle-même l'état de connexion)
            ajouterAHistorique(donnees);
            
            // Sauvegarde des dernières données valides
            derniereDonnee = donnees;
        } else {
            throw new Error('Données invalides dans le fichier JSON');
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
        nombreErreurs++;
        
        // Après plusieurs erreurs, on affiche un état de déconnexion
        if (nombreErreurs > 3) {
            estConnecte = false;
            mettreAJourEtatConnexion(false);
        }
        
        // Si on a des données précédentes, on les garde affichées (mais sans ajout à l'historique)
        if (derniereDonnee) {
            mettreAJourAffichage(derniereDonnee);
        }
    }
}

/**
 * Fonction pour mettre à jour l'affichage avec les nouvelles données
 * @param {Object} donnees - Objet contenant température, humidite, luminosite, horodatage
 */
function mettreAJourAffichage(donnees) {
    // Mise à jour de la température
    if (elements.temperature) {
        elements.temperature.textContent = donnees.temperature.toFixed(1);
        
        // Mise à jour du statut selon la plage de température
        if (elements.tempStatus) {
            if (donnees.temperature < 18) {
                elements.tempStatus.textContent = 'Température basse';
            } else if (donnees.temperature > 26) {
                elements.tempStatus.textContent = 'Température élevée';
            } else {
                elements.tempStatus.textContent = 'Température normale';
            }
        }
    }
    
    // Mise à jour de l'humidité
    if (elements.humidite) {
        elements.humidite.textContent = donnees.humidite.toFixed(1);
        
        // Mise à jour du statut selon l'humidité
        if (elements.humiStatus) {
            if (donnees.humidite < 50) {
                elements.humiStatus.textContent = 'Humidité faible';
            } else if (donnees.humidite > 75) {
                elements.humiStatus.textContent = 'Humidité élevée';
            } else {
                elements.humiStatus.textContent = 'Humidité normale';
            }
        }
    }
    
    // Mise à jour de la luminosité
    if (elements.luminosite) {
        elements.luminosite.textContent = donnees.luminosite;
        
        // Mise à jour du statut selon la luminosité
        if (elements.lumiStatus) {
            if (donnees.luminosite < 300) {
                elements.lumiStatus.textContent = 'Luminosité faible';
            } else if (donnees.luminosite > 800) {
                elements.lumiStatus.textContent = 'Luminosité élevée';
            } else {
                elements.lumiStatus.textContent = 'Luminosité normale';
            }
        }
    }
    
    // Mise à jour de l'horodatage
    if (elements.horodatage && donnees.horodatage) {
        elements.horodatage.textContent = donnees.horodatage;
    }
}

/**
 * Fonction pour mettre à jour l'indicateur d'état de connexion
 * @param {boolean} connecte - true si connecté, false sinon
 */
function mettreAJourEtatConnexion(connecte) {
    estConnecte = connecte; // Mise à jour de l'état de connexion global
    
    if (elements.connectionIndicator && elements.connectionStatus) {
        if (connecte) {
            elements.connectionIndicator.classList.remove('disconnected');
            elements.connectionIndicator.classList.add('connected');
            elements.connectionStatus.textContent = 'Système connecté';
        } else {
            elements.connectionIndicator.classList.remove('connected');
            elements.connectionIndicator.classList.add('disconnected');
            elements.connectionStatus.textContent = 'Connexion perdue';
        }
    }
}

/**
 * Fonction pour ajouter une nouvelle mesure à l'historique
 * Cette fonction ne s'exécute que si le système est connecté
 * @param {Object} donnees - Objet contenant les données à ajouter
 */
function ajouterAHistorique(donnees) {
    // Vérification de l'état de connexion avant d'ajouter à l'historique
    if (!estConnecte) {
        return; // Ne pas ajouter à l'historique si le système n'est pas connecté
    }
    
    const timestamp = new Date().toLocaleString('fr-FR');
    
    // Ajout de la température
    const statutTemp = obtenirStatutTemperature(donnees.temperature);
    historique.temperature.unshift({
        horodatage: donnees.horodatage || timestamp,
        valeur: donnees.temperature,
        statut: statutTemp.texte,
        classe: statutTemp.classe
    });
    if (historique.temperature.length > MAX_HISTORIQUE) {
        historique.temperature.pop();
    }
    
    // Ajout de l'humidité
    const statutHumi = obtenirStatutHumidite(donnees.humidite);
    historique.humidite.unshift({
        horodatage: donnees.horodatage || timestamp,
        valeur: donnees.humidite,
        statut: statutHumi.texte,
        classe: statutHumi.classe
    });
    if (historique.humidite.length > MAX_HISTORIQUE) {
        historique.humidite.pop();
    }
    
    // Ajout de la luminosité
    const statutLumi = obtenirStatutLuminosite(donnees.luminosite);
    historique.luminosite.unshift({
        horodatage: donnees.horodatage || timestamp,
        valeur: donnees.luminosite,
        statut: statutLumi.texte,
        classe: statutLumi.classe
    });
    if (historique.luminosite.length > MAX_HISTORIQUE) {
        historique.luminosite.pop();
    }
    
    // Mise à jour des tableaux
    mettreAJourTableaux();
}

/**
 * Fonction pour obtenir le statut de la température
 */
function obtenirStatutTemperature(temp) {
    if (temp < 18) return { texte: 'Basse', classe: 'basse' };
    if (temp > 26) return { texte: 'Élevée', classe: 'elevee' };
    return { texte: 'Normale', classe: 'normale' };
}

/**
 * Fonction pour obtenir le statut de l'humidité
 */
function obtenirStatutHumidite(humi) {
    if (humi < 50) return { texte: 'Faible', classe: 'faible' };
    if (humi > 75) return { texte: 'Élevée', classe: 'elevee' };
    return { texte: 'Normale', classe: 'normale' };
}

/**
 * Fonction pour obtenir le statut de la luminosité
 */
function obtenirStatutLuminosite(lumi) {
    if (lumi < 300) return { texte: 'Faible', classe: 'faible' };
    if (lumi > 800) return { texte: 'Élevée', classe: 'elevee' };
    return { texte: 'Normale', classe: 'normale' };
}

/**
 * Fonction pour mettre à jour les tableaux d'historique
 */
function mettreAJourTableaux() {
    // Mise à jour du tableau température
    const tempBody = document.getElementById('temp-table-body');
    if (tempBody) {
        if (historique.temperature.length === 0) {
            tempBody.innerHTML = '<tr><td colspan="3" class="no-data">Aucune donnée disponible</td></tr>';
        } else {
            tempBody.innerHTML = historique.temperature.map(item => `
                <tr>
                    <td>${item.horodatage}</td>
                    <td>${item.valeur.toFixed(1)}</td>
                    <td><span class="statut-badge statut-${item.classe}">${item.statut}</span></td>
                </tr>
            `).join('');
        }
    }
    
    // Mise à jour du tableau humidité
    const humiBody = document.getElementById('humi-table-body');
    if (humiBody) {
        if (historique.humidite.length === 0) {
            humiBody.innerHTML = '<tr><td colspan="3" class="no-data">Aucune donnée disponible</td></tr>';
        } else {
            humiBody.innerHTML = historique.humidite.map(item => `
                <tr>
                    <td>${item.horodatage}</td>
                    <td>${item.valeur.toFixed(1)}</td>
                    <td><span class="statut-badge statut-${item.classe}">${item.statut}</span></td>
                </tr>
            `).join('');
        }
    }
    
    // Mise à jour du tableau luminosité
    const lumiBody = document.getElementById('lumi-table-body');
    if (lumiBody) {
        if (historique.luminosite.length === 0) {
            lumiBody.innerHTML = '<tr><td colspan="3" class="no-data">Aucune donnée disponible</td></tr>';
        } else {
            lumiBody.innerHTML = historique.luminosite.map(item => `
                <tr>
                    <td>${item.horodatage}</td>
                    <td>${item.valeur}</td>
                    <td><span class="statut-badge statut-${item.classe}">${item.statut}</span></td>
                </tr>
            `).join('');
        }
    }
}

/**
 * Fonction pour exporter les données en format CSV (compatible Excel)
 */
function exporterEnExcel() {
    try {
        // Création du contenu CSV
        let csvContent = '\uFEFF'; // BOM UTF-8 pour Excel
        
        // En-tête général
        csvContent += 'TOUR AEROPONIQUE - EXPORT DES DONNEES\n';
        csvContent += `Date d'export : ${new Date().toLocaleString('fr-FR')}\n\n`;
        
        // Section Température
        csvContent += 'TEMPERATURE\n';
        csvContent += 'Horodatage,Température (°C),Statut\n';
        historique.temperature.forEach(item => {
            csvContent += `"${item.horodatage}",${item.valeur.toFixed(1)},"${item.statut}"\n`;
        });
        csvContent += '\n';
        
        // Section Humidité
        csvContent += 'HUMIDITE\n';
        csvContent += 'Horodatage,Humidité (%),Statut\n';
        historique.humidite.forEach(item => {
            csvContent += `"${item.horodatage}",${item.valeur.toFixed(1)},"${item.statut}"\n`;
        });
        csvContent += '\n';
        
        // Section Luminosité
        csvContent += 'LUMINOSITE\n';
        csvContent += 'Horodatage,Luminosité (lux),Statut\n';
        historique.luminosite.forEach(item => {
            csvContent += `"${item.horodatage}",${item.valeur},"${item.statut}"\n`;
        });
        
        // Création du blob et téléchargement
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `aeroponic_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Export réussi !');
    } catch (error) {
        console.error('Erreur lors de l\'export :', error);
        alert('Erreur lors de l\'export des données. Veuillez réessayer.');
    }
}

/**
 * Fonction d'initialisation
 * Exécutée au chargement de la page
 */
function initialiser() {
    console.log('Initialisation de l\'interface de supervision...');
    console.log(`Intervalle de mise à jour : ${INTERVALLE_MAJ} ms`);
    
    // Configuration du bouton d'export
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exporterEnExcel);
    }
    
    // Premier chargement immédiat
    chargerDonnees();
    
    // Configuration de la mise à jour automatique
    setInterval(chargerDonnees, INTERVALLE_MAJ);
    
    console.log('Interface prête !');
}

// Démarrage de l'application quand la page est chargée
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiser);
} else {
    // Si le DOM est déjà chargé, on lance immédiatement
    initialiser();
}

