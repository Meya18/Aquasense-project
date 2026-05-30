from flask import Flask, render_template, request, jsonify, send_file
import json
import csv
import os
from datetime import datetime

app = Flask(__name__)

# ── Données capteurs en mémoire ───────────────────────────────────────────────
donnees = {
    "temperature": 20.0,
    "ph": 7.0,
    "turbidite": 15.0
}

CSV_PATH      = os.path.join("data", "historique.csv")
ALERTES_PATH  = os.path.join("data", "alertes.json")
CAPTEURS_PATH = os.path.join("data", "capteurs.json")

# ── Fonctions utilitaires ─────────────────────────────────────────────────────

def sauvegarder_csv(d):
    os.makedirs("data", exist_ok=True)
    file_exists = os.path.isfile(CSV_PATH)
    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["datetime", "temperature", "ph", "turbidite"])
        writer.writerow([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            d["temperature"], d["ph"], d["turbidite"]
        ])

def sauvegarder_capteurs(d):
    os.makedirs("data", exist_ok=True)
    with open(CAPTEURS_PATH, "w", encoding="utf-8") as f:
        json.dump({**d, "updated": datetime.now().strftime("%H:%M:%S")}, f, indent=2)

def generer_alertes(d):
    alertes = []
    now = datetime.now().strftime("%H:%M")
    if d["temperature"] < 10 or d["temperature"] > 28:
        alertes.append({"type": "temperature", "niveau": "danger",
            "message": f"Temperature critique : {d['temperature']}C", "heure": now})
    elif d["temperature"] < 18 or d["temperature"] > 22:
        alertes.append({"type": "temperature", "niveau": "attention",
            "message": f"Temperature hors plage ideale : {d['temperature']}C", "heure": now})
    if d["ph"] < 6.5 or d["ph"] > 8.5:
        alertes.append({"type": "ph", "niveau": "danger",
            "message": f"pH hors norme : {d['ph']}", "heure": now})
    elif d["ph"] < 7 or d["ph"] > 8:
        alertes.append({"type": "ph", "niveau": "attention",
            "message": f"pH hors plage ideale : {d['ph']}", "heure": now})
    if d["turbidite"] > 100:
        alertes.append({"type": "turbidite", "niveau": "danger",
            "message": f"Turbidite critique : {d['turbidite']} NTU", "heure": now})
    elif d["turbidite"] > 50:
        alertes.append({"type": "turbidite", "niveau": "attention",
            "message": f"Turbidite elevee : {d['turbidite']} NTU", "heure": now})
    os.makedirs("data", exist_ok=True)
    with open(ALERTES_PATH, "w", encoding="utf-8") as f:
        json.dump(alertes, f, indent=2, ensure_ascii=False)
    return alertes

def charger_alertes():
    if os.path.isfile(ALERTES_PATH):
        with open(ALERTES_PATH, encoding="utf-8") as f:
            return json.load(f)
    return []

def charger_historique():
    rows = []
    if not os.path.isfile(CSV_PATH):
        return rows
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        premiere_ligne = f.readline().strip()
        f.seek(0)
        if premiere_ligne.startswith("datetime"):
            # CSV avec en-tête
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
        else:
            # CSV sans en-tête (format de ta camarade)
            reader = csv.reader(f)
            for row in reader:
                if len(row) == 4:
                    try:
                        rows.append({
                            "datetime":    row[0],
                            "temperature": row[1],
                            "ph":          row[2],
                            "turbidite":   row[3]
                        })
                    except Exception:
                        pass  # ignore les lignes malformées (marqueurs Git, etc.)
    return rows[-50:]

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pecheur')
def pecheur():
    return render_template('pecheur.html')

@app.route('/ong')
def ong():
    return render_template('ong.html', alertes=charger_alertes())

@app.route('/alertes')
def alertes():
    return render_template('alertes.html', alertes=charger_alertes())

@app.route('/historique')
def historique():
    return render_template('historique.html', history=charger_historique())

@app.route('/tuto')
def tuto():
    return render_template('tuto.html')

@app.route('/details')
def details():
    return render_template('details.html', donnees=donnees)

# ── API ───────────────────────────────────────────────────────────────────────

@app.route('/donnees', methods=['GET'])
def get_donnees():
    return jsonify(donnees)

@app.route('/donnees', methods=['POST'])
def post_donnees():
    global donnees
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "JSON invalide"}), 400
    donnees["temperature"] = payload.get("temperature", donnees["temperature"])
    donnees["ph"]          = payload.get("ph",          donnees["ph"])
    donnees["turbidite"]   = payload.get("turbidite",   donnees["turbidite"])
    sauvegarder_csv(donnees)
    sauvegarder_capteurs(donnees)
    generer_alertes(donnees)
    return jsonify({"status": "ok"}), 200

@app.route('/export-csv')
def export_csv():
    if not os.path.isfile(CSV_PATH):
        return "Aucune donnee a exporter.", 404
    return send_file(CSV_PATH, mimetype='text/csv',
                     as_attachment=True,
                     download_name='hydrasense_historique.csv')

@app.route('/historique-data')
def historique_data():
    return jsonify(charger_historique())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')