// ═══════════════════════════════════════════════
//  HydraSense — script.js
//  Mise à jour automatique toutes les 3 secondes
// ═══════════════════════════════════════════════

function mettreAJour() {
    fetch('/donnees')
        .then(response => response.json())
        .then(data => {

            // ── Température ──────────────────────────────
            const elTemp = document.getElementById('temperature');
            const elStatutTemp = document.getElementById('statut-temp');
            if (elTemp) elTemp.textContent = data.temperature + ' °C';
            if (elStatutTemp) {
                if (data.temperature < 10 || data.temperature > 28) {
                    elStatutTemp.textContent = '⚠️ DANGER';
                    elStatutTemp.className = 'statut danger';
                } else if (data.temperature < 18 || data.temperature > 22) {
                    elStatutTemp.textContent = '⚠️ Attention';
                    elStatutTemp.className = 'statut attention';
                } else {
                    elStatutTemp.textContent = '✅ Normal';
                    elStatutTemp.className = 'statut ok';
                }
            }

            // ── pH ───────────────────────────────────────
            const elPh = document.getElementById('ph');
            const elStatutPh = document.getElementById('statut-ph');
            if (elPh) elPh.textContent = data.ph;
            if (elStatutPh) {
                if (data.ph < 6.5 || data.ph > 8.5) {
                    elStatutPh.textContent = '⚠️ DANGER';
                    elStatutPh.className = 'statut danger';
                } else if (data.ph < 7 || data.ph > 8) {
                    elStatutPh.textContent = '⚠️ Attention';
                    elStatutPh.className = 'statut attention';
                } else {
                    elStatutPh.textContent = '✅ Normal';
                    elStatutPh.className = 'statut ok';
                }
            }

            // ── Turbidité ────────────────────────────────
            const elTurb = document.getElementById('turbidite');
            const elStatutTurb = document.getElementById('statut-turb');
            if (elTurb) elTurb.textContent = data.turbidite + ' NTU';
            if (elStatutTurb) {
                if (data.turbidite > 100) {
                    elStatutTurb.textContent = '⚠️ DANGER';
                    elStatutTurb.className = 'statut danger';
                } else if (data.turbidite > 50) {
                    elStatutTurb.textContent = '⚠️ Attention';
                    elStatutTurb.className = 'statut attention';
                } else {
                    elStatutTurb.textContent = '✅ Normal';
                    elStatutTurb.className = 'statut ok';
                }
            }

            // ── Qualité globale (pecheur.html) ───────────
            const elQualite = document.getElementById('qualite-globale');
            const elMessage  = document.getElementById('qualite-message');
            if (elQualite && elMessage) {
                const danger    = data.temperature < 10 || data.temperature > 28
                               || data.ph < 6.5 || data.ph > 8.5
                               || data.turbidite > 100;
                const attention = data.temperature < 18 || data.temperature > 22
                               || data.ph < 7 || data.ph > 8
                               || data.turbidite > 50;

                if (danger) {
                    elQualite.textContent = '🔴 Mauvaise';
                    elQualite.className   = 'statut danger';
                    elMessage.textContent = 'Danger détecté ! Vérifiez les alertes immédiatement.';
                } else if (attention) {
                    elQualite.textContent = '🟠 Moyenne';
                    elQualite.className   = 'statut attention';
                    elMessage.textContent = "Attention — un paramètre s'approche des limites.";
                } else {
                    elQualite.textContent = '🟢 Bonne';
                    elQualite.className   = 'statut ok';
                    elMessage.textContent = 'Tout semble bon pour le moment.';
                }
            }

        })
        .catch(err => console.warn('Connexion serveur impossible :', err));
}

setInterval(mettreAJour, 3000);
mettreAJour();

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

new Notification("⚠️ AquaSense", {
    body: "Température critique détectée !",
    icon: "/static/img/warning.png"
});

const audio = new Audio('/static/alert.mp3');
audio.play();