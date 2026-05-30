/*
 * HydraSense – ESP32 Code Final
 * 
 * Lit le capteur pH et envoie les données à l'app Flask
 * via WiFi (hotspot téléphone).
 * 
 * ⚠️ AVANT LA DÉMO : modifier les 3 lignes dans la section
 * "À MODIFIER" ci-dessous.
 * 
 * Branchement capteur pH :
 *   - VCC  → 3.3V de l'ESP32
 *   - GND  → GND de l'ESP32
 *   - AOUT → GPIO34 de l'ESP32
 * 
 * Pour trouver l'IP de l'ordi :
 *   1. Activer le hotspot sur le téléphone
 *   2. Connecter l'ordi au hotspot
 *   3. Taper "ipconfig" dans le terminal Windows
 *   4. Copier l'adresse sous "Carte réseau sans fil"
 */

#include <WiFi.h>
#include <HTTPClient.h>

// ── À MODIFIER AVANT LA DÉMO ──────────────────────────────────────────────────
#define HOME
#ifdef HOME
const char* ssid      = "bbap_9_2.4";
const char* password  = "B3rTr4nd75";
const char* serverURL = "http://192.168.1.129:5000/donnees";
#else
const char* ssid      = "Olivia";
const char* password  = "123456789";
const char* serverURL = "http://10.50.228.201:5000/donnees";  // Ligne à changer si l'IP du PC n'est plus la même. Verifier avec "ipconfig" dans le terminal Windows.   
#endif
// ─────────────────────────────────────────────────────────────────────────────

const int PIN_PH = 34;
const int PIN_LED_DANGER = 25;

const float VOLTAGE_REF    = 3.3;
const float VOLTAGE_NEUTRE = 1.65;
const float PENTE          = -5.5;
// Compensation factor for divider (AO -> R1 -> node -> R2+R3 -> GND)
// If node = k * Vsensor then COMPENSATION = 1/k. For R1=1k, R2+R3=2k, k=2/3 -> comp=1.5
const float DIV_COMP       = 1.5;

const int INTERVALLE = 3000;

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n🌊 HydraSense – Démarrage...");

    WiFi.mode(WIFI_STA);
    WiFi.disconnect(true, true);
    delay(500);
    WiFi.setSleep(false);
    WiFi.setAutoReconnect(true);
    Serial.print("📶 Connexion au hotspot : ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);

    int tentatives = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        tentatives++;
        if (tentatives > 20) {
            Serial.println("\n❌ Connexion WiFi impossible !");
            Serial.print("→ Réseau tenté : ");
            Serial.println(ssid);
            Serial.println("→ Vérifiez le nom et mot de passe du hotspot.");
            Serial.println("→ Vérifiez aussi que le hotspot est bien en 2.4 GHz et en WPA2.");
            while (true) delay(1000);
        }
    }

    Serial.println("\n✅ WiFi connecté !");
    Serial.print("📍 IP ESP32 : ");
    Serial.println(WiFi.localIP());
    Serial.print("📤 Envoi vers : ");
    Serial.println(serverURL);
    Serial.println("\n── Démarrage des mesures ──");

    pinMode(PIN_PH, INPUT);
    pinMode(PIN_LED_DANGER, OUTPUT);
    digitalWrite(PIN_LED_DANGER, LOW);
    analogReadResolution(12);
    analogSetPinAttenuation(PIN_PH, ADC_11db);
}

float lirePH(int &raw, float &voltage) {
    int somme = 0;
    for (int i = 0; i < 10; i++) {
        somme += analogRead(PIN_PH);
        delay(10);
    }
    float moyenne = somme / 10.0;
    raw = round(moyenne);
    float voltage_adc = moyenne * (VOLTAGE_REF / 4095.0);
    // Compensate for voltage divider between sensor AO and ADC node
    voltage = voltage_adc * DIV_COMP; // voltage = estimated sensor voltage
    float ph = 7.0 + ((voltage - VOLTAGE_NEUTRE) * PENTE);
    return constrain(round(ph * 10) / 10.0, 0.0, 14.0);
}

void envoyerDonnees(float ph) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠️ WiFi perdu, reconnexion...");
        WiFi.reconnect();
        delay(2000);
        return;
    }

    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"ph\": " + String(ph, 1) + "}";
    int code = http.POST(json);

    Serial.print("🧪 pH : ");
    Serial.print(ph);

    if (ph < 6.5 || ph > 8.5) {
        Serial.print("  🔴 DANGER");
    } else if (ph < 7.0 || ph > 8.0) {
        Serial.print("  🟡 Attention");
    } else {
        Serial.print("  ✅ Normal");
    }

    if (code == 200) {
        Serial.println("  → ✅ Envoyé");
    } else {
        Serial.print("  → ❌ Erreur HTTP ");
        Serial.println(code);
    }

    http.end();
}

void loop() {
    int raw = 0;
    float voltage = 0.0;
    float ph = lirePH(raw, voltage);
    bool danger = (ph < 6.5 || ph > 8.5);

    digitalWrite(PIN_LED_DANGER, danger ? HIGH : LOW);

    Serial.print("ADC brut : ");
    Serial.print(raw);
    Serial.print("  Tension : ");
    Serial.print(voltage, 3);
    Serial.print(" V  |  ");

    if (danger) {
        Serial.print("🔴 DANGER  ");
    } else if (ph < 7.0 || ph > 8.0) {
        Serial.print("🟡 Attention  ");
    } else {
        Serial.print("✅ Normal  ");
    }

    envoyerDonnees(ph);
    delay(INTERVALLE);
}
