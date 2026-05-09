import requests
import random
import time

URL = "http://127.0.0.1:5000/donnees"

print("🌊 Simulateur AquaSense démarré...")

while True:
    donnees = {
        "temperature": round(random.uniform(15, 30), 1),
        "ph": round(random.uniform(6.0, 9.0), 1),
        "turbidite": round(random.uniform(0, 120), 1)
    }

    try:
        response = requests.post(URL, json=donnees)
        print(f"✅ Données envoyées : {donnees}")
    except Exception as e:
        print(f"❌ Erreur : {e}")

    time.sleep(3)