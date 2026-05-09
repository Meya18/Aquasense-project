function mettreAJour() {
    fetch('/donnees')
        .then(response => response.json())
        .then(data => {

            // Température
            if (document.getElementById('temperature')) {
                document.getElementById('temperature').textContent = data.temperature + ' °C';
                const statutTemp = document.getElementById('statut-temp');
                if (data.temperature < 10 || data.temperature > 28) {
                    statutTemp.textContent = '⚠️ DANGER';
                    statutTemp.className = 'statut danger';
                } else if (data.temperature < 18 || data.temperature > 22) {
                    statutTemp.textContent = '⚠️ Attention';
                    statutTemp.className = 'statut attention';
                } else {
                    statutTemp.textContent = '✅ Normal';
                    statutTemp.className = 'statut ok';
                }
            }

            // pH
            if (document.getElementById('ph')) {
                document.getElementById('ph').textContent = data.ph;
                const statutPh = document.getElementById('statut-ph');
                if (data.ph < 6.5 || data.ph > 8.5) {
                    statutPh.textContent = '⚠️ DANGER';
                    statutPh.className = 'statut danger';
                } else if (data.ph < 7 || data.ph > 8) {
                    statutPh.textContent = '⚠️ Attention';
                    statutPh.className = 'statut attention';
                } else {
                    statutPh.textContent = '✅ Normal';
                    statutPh.className = 'statut ok';
                }
            }

            // Turbidité
            if (document.getElementById('turbidite')) {
                document.getElementById('turbidite').textContent = data.turbidite + ' NTU';
                const statutTurb = document.getElementById('statut-turb');
                if (data.turbidite > 100) {
                    statutTurb.textContent = '⚠️ DANGER';
                    statutTurb.className = 'statut danger';
                } else if (data.turbidite > 50) {
                    statutTurb.textContent = '⚠️ Attention';
                    statutTurb.className = 'statut attention';
                } else {
                    statutTurb.textContent = '✅ Normal';
                    statutTurb.className = 'statut ok';
                }
            }
        });
}

// Mise à jour toutes les 3 secondes
setInterval(mettreAJour, 3000);
mettreAJour();