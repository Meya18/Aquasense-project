/*
 * HydraSense – Test capteur pH
 * 
 * Ce fichier sert uniquement à tester que le capteur pH
 * est bien branché et renvoie des valeurs correctes.
 * Pas besoin de WiFi ni de Flask pour ce test.
 * 
 * Branchement :
 *   - VCC  → 3.3V de l'ESP32
 *   - GND  → GND de l'ESP32
 *   - AOUT → GPIO34 de l'ESP32
 * 
 * Comment utiliser :
 *   1. Téléverser ce code sur l'ESP32
 *   2. Ouvrir le Moniteur Série (115200 bauds)
 *   3. Plonger le capteur dans l'eau
 *   4. Vérifier que les valeurs pH s'affichent (entre 0 et 14)
 */

const int PIN_PH = 34;

// Calibration (à ajuster selon votre capteur)
const float VOLTAGE_REF    = 3.3;
const float VOLTAGE_NEUTRE = 1.65;  // Tension à pH 7
const float PENTE          = -5.5;  // À ajuster si valeurs incorrectes

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("=============================");
    Serial.println("  🧪 Test capteur pH – HydraSense");
    Serial.println("=============================");
    Serial.println("Lecture toutes les 2 secondes...\n");
}

float lirePH() {
    // Moyenne sur 10 lectures
    int somme = 0;
    for (int i = 0; i < 10; i++) {
        somme += analogRead(PIN_PH);
        delay(10);
    }
    float moyenne = somme / 10.0;
    float voltage = moyenne * (VOLTAGE_REF / 4095.0);
    float ph = 7.0 + ((voltage - VOLTAGE_NEUTRE) * PENTE);
    return constrain(round(ph * 10) / 10.0, 0.0, 14.0);
}

void loop() {
    float ph = lirePH();

    Serial.print("🧪 pH mesuré : ");
    Serial.print(ph);
    Serial.print("  →  ");

    if (ph < 6.5 || ph > 8.5) {
        Serial.println("🔴 DANGER (hors norme)");
    } else if (ph < 7.0 || ph > 8.0) {
        Serial.println("🟡 Attention (hors plage idéale)");
    } else {
        Serial.println("✅ Normal");
    }

    delay(2000);
}
