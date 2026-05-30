// ═══════════════════════════════════════════════
//  HydraSense / AquaSense — script.js (FIX)
//  Anti undefined + sécurisation API
// ═══════════════════════════════════════════════


function mettreAJour() {
    fetch('/donnees')
        .then(response => response.json())
        .then(data => {

            console.log("DONNEES API =", data);

            // sécurité (évite undefined)
            const temp = data?.temperature ?? "--";
            const ph = data?.ph ?? "--";
            const turb = data?.turbidite ?? "--";


            // ── Température ──────────────────────────────
            const elTemp = document.getElementById('temperature');
            const elStatutTemp = document.getElementById('statut-temp');

            if (elTemp) elTemp.textContent = temp + ' °C';

            if (elStatutTemp) {
                if (temp !== "--" && (temp < 10 || temp > 28)) {
                    elStatutTemp.textContent = '⚠️ DANGER';
                    elStatutTemp.className = 'statut danger';
                } else if (temp !== "--" && (temp < 18 || temp > 22)) {
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

            if (elPh) elPh.textContent = ph;

            if (elStatutPh) {
                if (ph !== "--" && (ph < 6.5 || ph > 8.5)) {
                    elStatutPh.textContent = '⚠️ DANGER';
                    elStatutPh.className = 'statut danger';
                } else if (ph !== "--" && (ph < 7 || ph > 8)) {
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

            if (elTurb) elTurb.textContent = turb + ' NTU';

            if (elStatutTurb) {
                if (turb !== "--" && turb > 100) {
                    elStatutTurb.textContent = '⚠️ DANGER';
                    elStatutTurb.className = 'statut danger';
                } else if (turb !== "--" && turb > 50) {
                    elStatutTurb.textContent = '⚠️ Attention';
                    elStatutTurb.className = 'statut attention';
                } else {
                    elStatutTurb.textContent = '✅ Normal';
                    elStatutTurb.className = 'statut ok';
                }
            }


            // ── Qualité globale ──────────────────────────
            const elQualite = document.getElementById('qualite-globale');
            const elMessage  = document.getElementById('qualite-message');

            if (elQualite && elMessage) {

                const danger =
                    (temp !== "--" && temp < 10 || temp > 28) ||
                    (ph !== "--" && ph < 6.5 || ph > 8.5) ||
                    (turb !== "--" && turb > 100);

                const attention =
                    (temp !== "--" && temp < 18 || temp > 22) ||
                    (ph !== "--" && ph < 7 || ph > 8) ||
                    (turb !== "--" && turb > 50);

                if (danger) {
                    elQualite.textContent = '🔴 Mauvaise';
                    elQualite.className = 'statut danger';
                    elMessage.textContent = 'Danger détecté ! Vérifiez immédiatement.';
                }

                else if (attention) {
                    elQualite.textContent = '🟠 Moyenne';
                    elQualite.className = 'statut attention';
                    elMessage.textContent = "Attention — un paramètre s'approche des limites.";
                }

                else {
                    elQualite.textContent = '🟢 Bonne';
                    elQualite.className = 'statut ok';
                    elMessage.textContent = 'Tout semble bon pour le moment.';
                }
            }

        })
        .catch(err => console.warn('Connexion serveur impossible :', err));
}


// ─────────────────────────────
// boucle update
// ─────────────────────────────
setInterval(mettreAJour, 3000);
mettreAJour();


new Notification("⚠️ AquaSense", {
    body: "Température critique détectée !",
    icon: "/static/img/warning.png"
});

// ─────────────────────────────
// permission notif propre
// ─────────────────────────────
document.addEventListener("click", () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}, { once: true });

const audio = new Audio('/static/alert.mp3');
audio.play();

zones.forEach(pos => {
    L.circle(pos, {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        radius: 4000
    }).addTo(map);
});

if (color === "red") {
    new Notification("⚠️ Zone polluée détectée !");
}
