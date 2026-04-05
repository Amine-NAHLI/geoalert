// public/script.js
//JavaScript côté client (gestion des interactions dans le navigateur).

// ============================================
// GESTION DU LOADER GLOBAL
// ============================================

/**
 * Affiche le loader global centré
 * @param {string} message - Message optionnel à afficher (défaut: "Chargement des données trafic...")
 */
function showLoader(message = "Chargement des données trafic...") {
    const loader = document.getElementById('global-loader');
    const textElement = loader.querySelector('.loader-text');

    if (textElement) {
        textElement.textContent = message;
    }

    loader.classList.add('show');
    loader.style.display = 'flex';
}

/**
 * Masque le loader global
 */
function hideLoader() {
    const loader = document.getElementById('global-loader');
    loader.classList.remove('show');

    // Délai pour l'animation de disparition
    setTimeout(() => {
        loader.style.display = 'none';
    }, 300);
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Afficher le loader pendant l'initialisation
    showLoader("Initialisation de la carte...");
    // Initialiser la carte Leaflet centrée sur le Maroc avec un zoom de niveau 7
    const map = L.map('map').setView([34.0209, -6.8416], 7);
    // Ajouter une couche de tuiles OpenStreetMap à la carte
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
 // Variables pour stocker les marqueurs
    let userPositionMarker; // Marqueur de position de l'utilisateur
    let selectedPositionMarker; // Marqueur de position sélectionnée sur la carte
    const socket = io(); // Initialiser la connexion Socket.IO
    const incidentMarkers = new Map(); // Map pour stocker les marqueurs d'incidents (ID => marqueur)

    // Fonction pour ajouter un incident à la carte
    function addIncidentToMap(incident) {
        // Supprimer le marqueur existant s'il y en a un pour cet incident
        if (incidentMarkers.has(incident._id)) {
            map.removeLayer(incidentMarkers.get(incident._id));
        }
        
        // Créer un nouveau marqueur circulaire pour l'incident
        const marker = L.circleMarker([incident.lat, incident.lng], {
            radius: 8,
            fillColor: 'red',
            color: 'darkred',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map).bindPopup(`<b>${incident.type}</b><br>${new Date(incident.createdAt).toLocaleString()}`); // Popup avec infos
        
        // Stocker le marqueur  dans la Map pour référence future
        incidentMarkers.set(incident._id, marker);
        return marker;
    }

    // Fonction pour mettre à jour la position de l'utilisateur
    function updateUserPosition(lat, lng) {
        // Supprimer l'ancien marqueur s'il existe
        if (userPositionMarker) {
            map.removeLayer(userPositionMarker);
        }
        
        // Créer un nouveau marqueur avec animation
        userPositionMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'user-position-marker',  // Classe CSS
                html: '<div class="pulse"></div>', // HTML personnalisé
                iconSize: [20, 20] // Taille de l'icône
            })
        }).addTo(map)
          .bindPopup('Votre position actuelle')
          .openPopup(); // Ouvrir automatiquement le popup
        
        // Centrer la carte sur la position
        map.setView([lat, lng], 15);
    }

     // Gestion du bouton de géolocalisation
    const activateLocationBtn = document.getElementById('locate-btn');
    if (activateLocationBtn) {
      // Écouter le clic sur le bouton
        activateLocationBtn.addEventListener('click', () => {
           // Vérifier si la géolocalisation est supportée
            if (navigator.geolocation) {
                showLoader("Localisation en cours...");
              // Obtenir la position actuelle
                navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;

                    // Mettre à jour les champs du formulaire
                    document.getElementById('lat').value = latitude.toFixed(5);
                    document.getElementById('lng').value = longitude.toFixed(5);

                    // Mettre à jour la position sur la carte
                    updateUserPosition(latitude, longitude);
                    hideLoader();
                }, error => {
                    console.error('Erreur de géolocalisation:', error);
                    alert('Impossible d\'obtenir votre position');
                    hideLoader();
                });
            } else {
                alert('La géolocalisation n\'est pas supportée par votre navigateur');
                hideLoader();
        
        // Mettre à jour les champs du formulaire
        document.getElementById('lat').value = lat.toFixed(5);
        document.getElementById('lng').value = lng.toFixed(5);

        // Mettre à jour le marqueur de position sélectionnée
        if (selectedPositionMarker) {
            map.removeLayer(selectedPositionMarker);
        }
        selectedPositionMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup('Position sélectionnée')
            .openPopup();
    });

    // Gestion du formulaire d'ajout d'incident
    const incidentForm = document.getElementById('incident-form');
    if (incidentForm) {
      // Écouter la soumission du formulaire
        incidentForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêcher le rechargement de la page
            // Récupérer les valeurs du formulaire
            const type = document.getElementById('type').value;
            const lat = document.getElementById('lat').value;
            const lng = document.getElementById('lng').value;

            if (!type || !lat || !lng) { // Validation des champs
                alert('Veuillez remplir tous les champs');
                return;
            }

            try {
                showLoader("Ajout de l'incident...");
              // Envoyer les données au serveur
                const response = await fetch('/auth/add-incident', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type, lat, lng })
                });

                if (response.ok) {
                    // Réinitialiser le formulaire
                    incidentForm.reset();
                    alert('Incident ajouté avec succès!');

                    // Supprimer le marqueur de position sélectionnée
                    if (selectedPositionMarker) {
                        map.removeLayer(selectedPositionMarker);
                        selectedPositionMarker = null;
                    }
                } else {
                    const error = await response.text();
                    alert(`Erreur: ${error}`);
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de l\'ajout de l\'incident');
            } finally {
                hideLoader();
            }
        });
    }

    // Charger les incidents existants
    const loadIncidents = async () => {
        try {
            showLoader("Chargement des incidents...");
            const response = await fetch('/auth/api/incidents');
            const incidents = await response.json();

            incidents.forEach(incident => {
                addIncidentToMap(incident);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des incidents:', error);
        } finally {
            hideLoader();
        }
    };
    
    // Recevoir les nouveaux incidents en temps réel via Socket.IO
    socket.on('newIncident', incident => {
        // Ajouter le nouvel incident à la carte
        addIncidentToMap(incident);
        
        // Ajouter à la liste des incidents
        const incidentList = document.getElementById('incident-list');
        const newItem = document.createElement('li');
        newItem.className = 'incident-item';
        newItem.innerHTML = `
            <div class="incident-type">${incident.type}</div>
            <div class="incident-coords">${incident.lat.toFixed(5)}, ${incident.lng.toFixed(5)}</div>
            <div class="incident-time">${new Date(incident.createdAt).toLocaleString('fr-FR')}</div>
        `;
        incidentList.insertBefore(newItem, incidentList.firstChild);
    });

    // Charger les incidents au démarrage
    loadIncidents();

    // Masquer le loader d'initialisation après un court délai
    setTimeout(() => {
        hideLoader();
    }, 1000);
});