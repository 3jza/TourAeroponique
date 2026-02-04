#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Projet Tour Aéroponique Automatisée - STI2D SIN
Script Python pour la réception et le traitement des données Arduino

Fonctionnalités :
- Lecture des données depuis le port série USB
- Traitement et validation des données
- Génération du fichier data.json
- Mise à jour continue des valeurs
"""

import serial
import json
import time
from datetime import datetime
import sys
import os

# Configuration du port série
# Sur Raspberry Pi, le port est généralement /dev/ttyACM0 ou /dev/ttyUSB0
# Sur Windows, c'est COM3, COM4, etc.
# À adapter selon votre configuration
PORT_SERIE = '/dev/ttyACM0'  # À modifier selon votre système
VITESSE = 9600  # Doit correspondre à la vitesse de l'Arduino

# Chemin du fichier JSON de sortie
# Ce fichier sera lu par la page web
CHEMIN_JSON = '/var/www/html/data.json'

# Variables pour stocker les dernières valeurs valides
donnees_actuelles = {
    'temperature': 0.0,
    'humidite': 0.0,
    'luminosite': 0,
    'horodatage': ''
}

def obtenir_horodatage():
    """
    Génère un horodatage au format français
    Retourne : chaîne de caractères avec la date et l'heure
    """
    maintenant = datetime.now()
    return maintenant.strftime('%d/%m/%Y %H:%M:%S')

def traiter_ligne_serie(ligne):
    """
    Traite une ligne reçue depuis l'Arduino
    Format attendu : temp:22.5,humi:65.3,lumi:520
    
    Paramètres :
    - ligne : chaîne de caractères reçue depuis le port série
    
    Retourne : dictionnaire avec les valeurs ou None si erreur
    """
    try:
        # Suppression des espaces et caractères de fin de ligne
        ligne = ligne.strip()
        
        # Ignorer les lignes de commentaire ou système
        if ligne.startswith('#') or not ligne:
            return None
        
        # Séparation des différentes valeurs (séparées par des virgules)
        parties = ligne.split(',')
        
        valeurs = {}
        
        # Analyse de chaque partie (format clé:valeur)
        for partie in parties:
            if ':' in partie:
                cle, valeur = partie.split(':', 1)
                
                # Conversion et stockage selon la clé
                if cle == 'temp':
                    valeurs['temperature'] = float(valeur)
                elif cle == 'humi':
                    valeurs['humidite'] = float(valeur)
                elif cle == 'lumi':
                    valeurs['luminosite'] = int(float(valeur))
        
        # Vérification que toutes les valeurs sont présentes
        if len(valeurs) == 3:
            valeurs['horodatage'] = obtenir_horodatage()
            return valeurs
        else:
            return None
            
    except (ValueError, AttributeError) as e:
        # En cas d'erreur de conversion, on ignore la ligne
        print(f"Erreur de traitement : {e}")
        return None

def sauvegarder_json(donnees, chemin):
    """
    Sauvegarde les données dans un fichier JSON
    
    Paramètres :
    - donnees : dictionnaire contenant les données à sauvegarder
    - chemin : chemin complet du fichier JSON
    """
    try:
        # Création du répertoire si nécessaire
        repertoire = os.path.dirname(chemin)
        if repertoire and not os.path.exists(repertoire):
            os.makedirs(repertoire, exist_ok=True)
        
        # Écriture du fichier JSON avec formatage lisible
        with open(chemin, 'w', encoding='utf-8') as fichier:
            json.dump(donnees, fichier, indent=2, ensure_ascii=False)
        
        print(f"[{obtenir_horodatage()}] Données sauvegardées : "
              f"T={donnees['temperature']:.1f}°C, "
              f"H={donnees['humidite']:.1f}%, "
              f"L={donnees['luminosite']} lux")
              
    except PermissionError:
        print(f"ERREUR : Permission refusée pour écrire dans {chemin}")
        print("Solution : Exécutez le script avec sudo ou modifiez les permissions")
    except Exception as e:
        print(f"ERREUR lors de la sauvegarde : {e}")

def main():
    """
    Fonction principale du programme
    """
    print("=" * 50)
    print("Tour Aéroponique - Système de collecte de données")
    print("=" * 50)
    print(f"Port série : {PORT_SERIE}")
    print(f"Vitesse : {VITESSE} bauds")
    print(f"Fichier de sortie : {CHEMIN_JSON}")
    print("=" * 50)
    
    try:
        # Ouverture du port série
        print(f"Connexion au port série {PORT_SERIE}...")
        ser = serial.Serial(PORT_SERIE, VITESSE, timeout=1)
        time.sleep(2)  # Attente de stabilisation
        print("Connexion établie !")
        print("En attente de données...\n")
        
        # Boucle principale de lecture
        while True:
            try:
                # Lecture d'une ligne depuis le port série
                if ser.in_waiting > 0:
                    ligne = ser.readline().decode('utf-8', errors='ignore')
                    
                    # Traitement de la ligne
                    donnees = traiter_ligne_serie(ligne)
                    
                    if donnees:
                        # Mise à jour des données actuelles
                        donnees_actuelles.update(donnees)
                        
                        # Sauvegarde dans le fichier JSON
                        sauvegarder_json(donnees_actuelles, CHEMIN_JSON)
                
                # Petite pause pour ne pas surcharger le CPU
                time.sleep(0.1)
                
            except KeyboardInterrupt:
                # Arrêt propre du programme (Ctrl+C)
                print("\n\nArrêt demandé par l'utilisateur")
                break
            except Exception as e:
                print(f"Erreur dans la boucle principale : {e}")
                time.sleep(1)
    
    except serial.SerialException as e:
        print(f"\nERREUR : Impossible d'ouvrir le port série {PORT_SERIE}")
        print(f"Détails : {e}")
        print("\nVérifications à effectuer :")
        print("1. L'Arduino est-il branché en USB ?")
        print("2. Le port série est-il correct ? (liste avec : ls /dev/tty*)")
        print("3. Les permissions sont-elles correctes ? (sudo ou ajout au groupe dialout)")
        sys.exit(1)
    
    except Exception as e:
        print(f"\nERREUR inattendue : {e}")
        sys.exit(1)
    
    finally:
        # Fermeture propre du port série
        if 'ser' in locals():
            ser.close()
            print("Port série fermé")

if __name__ == '__main__':
    main()

