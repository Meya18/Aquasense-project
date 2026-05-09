from flask import Flask, render_template, request, jsonify
import json
import csv
from datetime import datetime

app = Flask(__name__)

# Données capteurs en mémoire
donnees = {
    "temperature": 0,
    "ph": 0,
    "turbidite": 0
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pecheur')
def pecheur():
    return render_template('pecheur.html')

@app.route('/ong')
def ong():
    return render_template('ong.html')

@app.route('/alertes')
def alertes():
    return render_template('alertes.html')

@app.route('/historique')
def historique():
    return render_template('historique.html')

@app.route('/tuto')
def tuto():
    return render_template('tuto.html')

@app.route('/details')
def details():
    return render_template('details.html')

@app.route('/donnees', methods=['GET'])
def get_donnees():
    return jsonify(donnees)

@app.route('/donnees', methods=['POST'])
def post_donnees():
    global donnees
    donnees = request.get_json()
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True)