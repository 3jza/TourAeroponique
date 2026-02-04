# 🌱 Tour Aéroponique Automatisée - Guide d'Installation

## Présentation du Projet

Ce projet présente un système complet de supervision pour une tour aéroponique automatisée, développé dans le cadre d'un projet STI2D (Sciences et Technologies de l'Industrie et du Développement Durable), spécialité SIN (Systèmes d'Information et Numérique).

### Architecture du Système

Le projet suit la chaîne d'information SIN classique :

1. **Acquisition** : Carte Arduino qui mesure les paramètres (température, humidité, luminosité)
2. **Traitement** : Raspberry Pi qui reçoit et traite les données via USB série
3. **Stockage** : Fichier JSON contenant les dernières valeurs mesurées
4. **Communication** : Serveur web Nginx qui diffuse les données
5. **Affichage** : Interface web HTML/CSS/JavaScript pour visualiser les données

### Fonctionnalités

- Mesure continue de trois paramètres environnementaux
- Transmission des données en temps réel
- Interface web de supervision mise à jour automatiquement
- Stockage des données avec horodatage
- Architecture modulaire et pédagogique

---

## 📦 Matériel Nécessaire

### Matériel Informatique

- **1 Carte Arduino** (Uno, Nano, ou compatible)
- **1 Raspberry Pi** (modèle 3 ou supérieur recommandé)
- **1 Câble USB** pour connecter l'Arduino au Raspberry Pi
- **Carte microSD** pour le Raspberry Pi (minimum 8 Go)
- **Alimentations** pour l'Arduino et le Raspberry Pi

### Matériel Optionnel (pour vraies mesures)

- Capteur de température (ex: DS18B20, LM35)
- Capteur d'humidité (ex: DHT22, DHT11)
- Capteur de luminosité (ex: photorésistance, BH1750)
- Câbles et résistances pour les connexions

### Logiciels

- **Arduino IDE** (pour programmer l'Arduino)
- **Raspberry Pi OS** (anciennement Raspbian)
- **Python 3** (généralement pré-installé sur Raspberry Pi OS)
- **Nginx** (serveur web à installer)
- **Bibliothèque Python pyserial** (pour la communication série)

---

## 🔧 Installation et Configuration

### Étape 1 : Préparation du Raspberry Pi

1. **Installer Raspberry Pi OS**
   - Télécharger Raspberry Pi Imager depuis le site officiel
   - Flasher l'image sur la carte microSD
   - Configurer les paramètres de base (Wi-Fi, utilisateur, etc.)

2. **Mettre à jour le système**
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

3. **Activer SSH** (pour accéder à distance si besoin)
   ```bash
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

---

### Étape 2 : Installation de Python et des Bibliothèques

Python 3 est généralement déjà installé sur Raspberry Pi OS. Vérifions et installons les dépendances :

```bash
# Vérifier la version de Python
python3 --version

# Installer pip si nécessaire
sudo apt install python3-pip -y

# Installer la bibliothèque pyserial pour la communication série
sudo pip3 install pyserial

# Vérifier l'installation
python3 -c "import serial; print('pyserial installé avec succès')"
```

---

### Étape 3 : Configuration du Port Série USB

Lorsque l'Arduino est connecté au Raspberry Pi via USB, il apparaît comme un périphérique série (généralement `/dev/ttyACM0` ou `/dev/ttyUSB0`).

1. **Connecter l'Arduino au Raspberry Pi** via USB

2. **Identifier le port série**
   ```bash
   ls /dev/tty*
   # Rechercher ttyACM0 ou ttyUSB0
   ```

3. **Vérifier les permissions**
   ```bash
   # Ajouter l'utilisateur au groupe dialout (permissions série)
   sudo usermod -a -G dialout $USER
   # Il faut se déconnecter et reconnecter pour que cela prenne effet
   ```

4. **Tester la connexion série** (optionnel)
   ```bash
   # Installer screen pour tester
   sudo apt install screen -y
   
   # Ouvrir le port série (remplacer /dev/ttyACM0 par votre port)
   screen /dev/ttyACM0 9600
   # Vous devriez voir les données envoyées par l'Arduino
   # Pour quitter : Ctrl+A puis K puis Y
   ```

---

### Étape 4 : Installation et Configuration de Nginx

Nginx est un serveur web léger et performant, idéal pour servir des fichiers statiques.

1. **Installer Nginx**
   ```bash
   sudo apt install nginx -y
   ```

2. **Démarrer et activer Nginx**
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

3. **Vérifier que Nginx fonctionne**
   - Ouvrir un navigateur et aller à l'adresse IP du Raspberry Pi
   - Vous devriez voir la page par défaut de Nginx

4. **Créer le répertoire pour les fichiers web**
   ```bash
   sudo mkdir -p /var/www/html
   sudo chown -R $USER:$USER /var/www/html
   ```

---

### Étape 5 : Placement des Fichiers

#### 5.1 Fichiers Web

Copiez les fichiers de l'interface web dans le répertoire Nginx :

```bash
# Depuis le répertoire du projet
sudo cp web/index.html /var/www/html/
sudo cp web/style.css /var/www/html/
sudo cp web/script.js /var/www/html/
sudo cp web/data.json /var/www/html/

# Définir les permissions
sudo chmod 644 /var/www/html/*
```

#### 5.2 Script Python

Copiez le script Python dans un répertoire approprié :

```bash
# Créer un répertoire pour les scripts
mkdir -p ~/aeroponic
cp raspberry/aeroponic_reader.py ~/aeroponic/

# Rendre le script exécutable
chmod +x ~/aeroponic/aeroponic_reader.py
```

#### 5.3 Configuration du Script Python

Éditez le script Python pour adapter les paramètres à votre configuration :

```bash
nano ~/aeroponic/aeroponic_reader.py
```

**Paramètres à vérifier/modifier :**
- `PORT_SERIE` : Le port USB de l'Arduino (généralement `/dev/ttyACM0`)
- `CHEMIN_JSON` : Le chemin du fichier JSON (déjà configuré sur `/var/www/html/data.json`)

**Note importante :** Si vous modifiez le `CHEMIN_JSON`, assurez-vous que le script a les permissions d'écriture dans ce répertoire.

---

### Étape 6 : Configuration Nginx (Optionnel mais Recommandé)

Pour optimiser le fonctionnement, vous pouvez créer une configuration spécifique :

```bash
# Copier la configuration d'exemple
sudo cp nginx/nginx-config-example.conf /etc/nginx/sites-available/aeroponic

# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/aeroponic /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

Si vous préférez utiliser la configuration par défaut, cela fonctionnera également.

---

### Étape 7 : Programmation de l'Arduino

1. **Installer Arduino IDE** sur votre ordinateur
   - Télécharger depuis arduino.cc
   - Installer selon votre système d'exploitation

2. **Ouvrir le projet Arduino**
   - Ouvrir le fichier `arduino/aeroponic_tower.ino` dans Arduino IDE

3. **Sélectionner la carte**
   - Outils → Type de carte → Arduino Uno (ou votre modèle)

4. **Sélectionner le port**
   - Outils → Port → Choisir le port USB de l'Arduino

5. **Téléverser le programme**
   - Cliquer sur le bouton "Téléverser" (flèche droite)
   - Attendre la fin du téléversement

6. **Vérifier le moniteur série** (optionnel)
   - Outils → Moniteur série
   - Régler la vitesse à 9600 bauds
   - Vous devriez voir les données s'afficher

---

### Étape 8 : Lancement du Système

#### 8.1 Connecter l'Arduino au Raspberry Pi

Branchez l'Arduino au Raspberry Pi via le câble USB.

#### 8.2 Lancer le Script Python

```bash
# Se placer dans le répertoire du script
cd ~/aeroponic

# Lancer le script (avec sudo si nécessaire pour les permissions)
python3 aeroponic_reader.py
```

**Ou en arrière-plan :**
```bash
nohup python3 ~/aeroponic/aeroponic_reader.py > ~/aeroponic/log.txt 2>&1 &
```

**Pour arrêter le script :**
- Si en premier plan : `Ctrl+C`
- Si en arrière-plan : trouver le processus avec `ps aux | grep aeroponic_reader` puis `kill PID`

#### 8.3 Vérifier le Fichier JSON

```bash
# Vérifier que le fichier est créé et mis à jour
cat /var/www/html/data.json

# Surveiller les modifications en temps réel
watch -n 1 cat /var/www/html/data.json
```

#### 8.4 Accéder à l'Interface Web

1. **Trouver l'adresse IP du Raspberry Pi**
   ```bash
   hostname -I
   ```

2. **Ouvrir un navigateur web**
   - Sur le Raspberry Pi : `http://localhost`
   - Depuis un autre appareil : `http://ADRESSE_IP_RASPBERRY_PI`

3. **Vérifier que les données s'affichent et se mettent à jour**

---

## 📚 Explications Pédagogiques

### Rôle de l'Arduino

L'Arduino est une **carte électronique programmable** qui sert d'interface entre le monde physique (capteurs) et le monde numérique (données).

**Dans ce projet :**
- L'Arduino **acquiert** les données des capteurs (température, humidité, luminosité)
- Il **traite** ces données (conversion analogique/numérique, formatage)
- Il **transmet** les données via le port série USB vers le Raspberry Pi
- Format d'envoi : `temp:22.5,humi:65.3,lumi:520`

**Avantages pédagogiques :**
- Interface simple avec le monde réel
- Programmation accessible avec l'IDE Arduino
- Communication série standard et universelle

---

### Rôle du Raspberry Pi

Le Raspberry Pi est un **mini-ordinateur** qui sert de cerveau du système.

**Dans ce projet :**
- Il **reçoit** les données depuis le port série USB
- Il **traite** les données reçues (parsing, validation)
- Il **stocke** les données dans un fichier JSON avec horodatage
- Il **gère** le serveur web Nginx

**Fonction du script Python :**
- Lecture continue du port série
- Extraction des valeurs (température, humidité, luminosité)
- Formatage et validation des données
- Écriture dans le fichier JSON pour l'interface web

**Chaîne d'information :**
- **Entrée** : Port série USB (données brutes)
- **Traitement** : Script Python (parsing, validation)
- **Sortie** : Fichier JSON (données structurées)

---

### Rôle de Nginx

Nginx est un **serveur web** qui sert des fichiers statiques aux clients.

**Dans ce projet :**
- Il **héberge** les fichiers HTML, CSS et JavaScript
- Il **sert** le fichier JSON aux clients
- Il **gère** les requêtes HTTP depuis les navigateurs
- Il **configure** les en-têtes HTTP (cache, CORS, etc.)

**Fonctionnement :**
1. Un navigateur demande `http://adresse-ip/index.html`
2. Nginx envoie le fichier HTML
3. Le navigateur demande les fichiers CSS et JS
4. Le script JavaScript demande périodiquement `data.json`
5. Nginx envoie le fichier JSON (mis à jour par le script Python)

**Avantages :**
- Léger et performant
- Configuration simple
- Idéal pour servir des fichiers statiques
- Pas besoin de backend complexe

---

### Chaîne d'Information Complète

```
[CARACTÉRISTIQUES PHYSIQUES]
         ↓
[ARDUINO - Acquisition]
    - Mesure des capteurs
    - Conversion A/N
         ↓
[PORT SÉRIE USB - Transmission]
    - Communication série
    - Format structuré
         ↓
[RASPBERRY PI - Traitement]
    - Script Python
    - Parsing des données
    - Validation
         ↓
[FICHIER JSON - Stockage]
    - Données structurées
    - Horodatage
         ↓
[NGINX - Communication]
    - Serveur HTTP
    - Diffusion des fichiers
         ↓
[NAVIGATEUR WEB - Affichage]
    - HTML/CSS/JavaScript
    - Mise à jour automatique
```

---

## 🎤 Conseils pour la Présentation Orale STI2D

### Structure de Présentation Recommandée

1. **Introduction (2-3 min)**
   - Présentation du projet et du contexte
   - Objectifs pédagogiques
   - Architecture globale du système

2. **Chaîne d'Information (5-7 min)**
   - **Acquisition** : Présenter l'Arduino et le code
   - **Traitement** : Expliquer le script Python
   - **Stockage** : Montrer le fichier JSON
   - **Communication** : Présenter Nginx
   - **Affichage** : Démontrer l'interface web

3. **Démonstration (3-4 min)**
   - Démarrer le système
   - Montrer l'interface en fonctionnement
   - Expliquer les valeurs affichées

4. **Aspects Techniques (3-4 min)**
   - Choix technologiques (pourquoi Arduino, Raspberry Pi, Nginx)
   - Difficultés rencontrées et solutions
   - Améliorations possibles

5. **Conclusion (1-2 min)**
   - Synthèse du projet
   - Compétences acquises
   - Perspectives d'évolution

### Points Clés à Mentionner

✅ **Chaîne d'information SIN** : Bien expliquer chaque étape
✅ **Communication série** : Format des données, protocole
✅ **Architecture client-serveur** : Rôle de Nginx, requêtes HTTP
✅ **Traitement des données** : Parsing, validation, format JSON
✅ **Temps réel** : Mise à jour automatique, horodatage
✅ **Séparation des responsabilités** : Modularité du code

### Questions Possibles du Jury

**Q : Pourquoi avoir choisi Nginx plutôt qu'Apache ?**
R : Nginx est plus léger et plus adapté aux fichiers statiques. Il consomme moins de ressources sur un Raspberry Pi.

**Q : Pourquoi utiliser JSON plutôt qu'une base de données ?**
R : Pour un projet pédagogique, JSON est plus simple à comprendre et à manipuler. Une base de données serait plus complexe sans apporter de valeur ajoutée ici.

**Q : Comment gérez-vous les erreurs de communication ?**
R : Le script Python gère les erreurs avec des try/except. L'interface web affiche un indicateur de connexion. Les données précédentes sont conservées en cas de perte de communication.

**Q : Pourquoi ne pas utiliser Node-RED comme demandé parfois ?**
R : Ce projet vise à comprendre les mécanismes de base (communication série, serveur web, JavaScript). Node-RED ajouterait une abstraction qui masquerait certains aspects pédagogiques.

---

## 🔍 Résolution de Problèmes Courants

### Problème : Le script Python ne trouve pas le port série

**Solutions :**
```bash
# Vérifier les ports disponibles
ls /dev/tty*

# Vérifier les permissions
groups  # Vérifier que "dialout" est dans la liste

# Si nécessaire, utiliser sudo (temporaire)
sudo python3 aeroponic_reader.py
```

### Problème : Permission refusée pour écrire dans /var/www/html/

**Solutions :**
```bash
# Donner les permissions à l'utilisateur
sudo chown -R $USER:$USER /var/www/html

# Ou modifier les permissions du répertoire
sudo chmod 755 /var/www/html
sudo chmod 666 /var/www/html/data.json
```

### Problème : L'interface web ne se met pas à jour

**Vérifications :**
1. Le script Python fonctionne-t-il ? (vérifier les logs)
2. Le fichier JSON est-il mis à jour ? (`cat /var/www/html/data.json`)
3. Nginx fonctionne-t-il ? (`sudo systemctl status nginx`)
4. Ouvrir la console du navigateur (F12) pour voir les erreurs JavaScript

### Problème : Nginx affiche "403 Forbidden"

**Solutions :**
```bash
# Vérifier les permissions
sudo chmod 755 /var/www/html
sudo chmod 644 /var/www/html/*

# Vérifier la configuration Nginx
sudo nginx -t
```

---

## 📝 Commandes Utiles de Référence

### Gestion du Script Python

```bash
# Lancer le script
python3 ~/aeroponic/aeroponic_reader.py

# Lancer en arrière-plan
nohup python3 ~/aeroponic/aeroponic_reader.py > log.txt 2>&1 &

# Voir les processus Python
ps aux | grep python

# Arrêter le script
kill PID  # (remplacer PID par le numéro de processus)
```

### Gestion de Nginx

```bash
# Démarrer Nginx
sudo systemctl start nginx

# Arrêter Nginx
sudo systemctl stop nginx

# Redémarrer Nginx
sudo systemctl restart nginx

# Recharger la configuration
sudo systemctl reload nginx

# Vérifier le statut
sudo systemctl status nginx

# Tester la configuration
sudo nginx -t
```

### Surveillance du Système

```bash
# Voir les logs Nginx en temps réel
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Voir les ports série ouverts
ls -l /dev/tty*

# Tester la communication série
screen /dev/ttyACM0 9600
```

---

## 🎓 Compétences STI2D Développées

- **Acquisition de données** : Utilisation de capteurs, communication série
- **Traitement de l'information** : Script Python, parsing de données
- **Transmission d'informations** : Protocole HTTP, serveur web
- **Interface homme-machine** : Développement web (HTML/CSS/JavaScript)
- **Architecture système** : Conception modulaire, séparation des responsabilités
- **Documentation technique** : Commentaires de code, guide d'installation

---

## 📄 Licence et Remerciements

Ce projet est destiné à un usage pédagogique dans le cadre du baccalauréat STI2D, spécialité SIN.

**Bonne chance pour votre présentation ! 🎓🌱**

---

*Document généré pour le projet Tour Aéroponique Automatisée - STI2D SIN*

