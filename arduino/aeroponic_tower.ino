#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// --- CONFIGURATION ---
const char* ssid = "iphonealex"; 
const char* password = "12345678";
// IMPORTANT : Tape 'hostname -I' sur ton Kali pour vérifier cette IP
const char* serverUrl = "http://172.20.10.2:3000/update"; 

#define PIN_DHT 15
#define TYPE_DHT DHT11  // Modifié en DHT11 pour ton module bleu
#define PIN_LUMI 34     // Pin analogique pour la luminosité

DHT dht(PIN_DHT, TYPE_DHT);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  dht.begin();
  
  Serial.println("\n--- DEMARRAGE TOUR AEROPONIQUE ---");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[WiFi] Connecte !");
  Serial.print("IP ESP32 : ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Lecture des capteurs
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    int l = analogRead(PIN_LUMI);

    // Sécurité : évite d'envoyer "nan" (cause de l'erreur 400)
    if (isnan(t)) t = 0.0;
    if (isnan(h)) h = 0.0;

    // Affichage local pour débug
    Serial.printf("Temp: %.1f°C | Hum: %.1f%% | Lum: %d\n", t, h, l);

    // Préparation de la requête HTTP
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Construction du JSON
    String payload = "{\"temp\":" + String(t, 1) + 
                    ",\"humi\":" + String(h, 1) + 
                    ",\"lumi\":" + String(l) + "}";

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      Serial.print("Reponse serveur : ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Erreur d'envoi HTTP : ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    WiFi.begin(ssid, password);
  }

  delay(5000); // Attendre 5 secondes
}