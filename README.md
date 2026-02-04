# 🌱 Tour Aéroponique Automatisée - STI2D SIN

Projet pédagogique de supervision pour une tour aéroponique automatisée.

## 📁 Structure du Projet

```
.
├── arduino/              # Code Arduino
│   └── aeroponic_tower.ino
│
├── raspberry/            # Script Python
│   └── aeroponic_reader.py
│
├── web/                  # Interface web
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── data.json
│
├── nginx/                # Configuration Nginx
│   └── nginx-config-example.conf
│
├── setup.md              # Documentation complète
└── README.md             # Ce fichier
```

## 🚀 Démarrage Rapide

1. **Programmer l'Arduino** avec `arduino/aeroponic_tower.ino`
2. **Connecter l'Arduino au Raspberry Pi** via USB
3. **Installer les dépendances** (voir `setup.md`)
4. **Copier les fichiers web** dans `/var/www/html/`
5. **Lancer le script Python** : `python3 aeroponic_reader.py`
6. **Accéder à l'interface** : `http://adresse-ip-raspberry-pi`

## 📖 Documentation Complète

Consultez le fichier **`setup.md`** pour :
- Guide d'installation détaillé
- Explications pédagogiques
- Résolution de problèmes
- Conseils pour la présentation orale

## 🔧 Technologies Utilisées

- **Arduino** : Acquisition des données
- **Python** : Traitement des données
- **Nginx** : Serveur web
- **HTML/CSS/JavaScript** : Interface de supervision

## 📝 Licence

Projet pédagogique - Usage éducatif STI2D SIN

