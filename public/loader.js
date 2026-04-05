// public/loader.js
// Module pour gérer le loading global

class GlobalLoader {
    constructor() {
        this.activeRequests = 0;
        this.init();
    }

    init() {
        // Créer le conteneur du loader
        this.createLoaderElement();

        // Intercepter les requêtes fetch
        this.interceptFetch();

        // Intercepter XMLHttpRequest si utilisé
        this.interceptXHR();

        // Intercepter les formulaires
        this.interceptForms();
    }

    createLoaderElement() {
        // Créer la progress bar NProgress style
        const loaderContainer = document.createElement('div');
        loaderContainer.id = 'global-loader';
        loaderContainer.innerHTML = `
            <div class="loader-overlay">
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">Chargement...</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        document.body.appendChild(loaderContainer);

        // Styles CSS
        const style = document.createElement('style');
        style.textContent = `
            #global-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 10000;
                pointer-events: none;
            }

            .loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .loader-content {
                text-align: center;
                color: white;
                font-family: 'Rajdhani', sans-serif;
            }

            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #c0392b;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            .loader-text {
                font-size: 18px;
                font-weight: 500;
            }

            .progress-bar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                z-index: 10002;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                box-shadow: 0 0 10px rgba(192, 57, 43, 0.5);
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #c0392b, #e74c3c, #c0392b);
                background-size: 200% 100%;
                animation: progressShine 2s infinite;
                width: 100%;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }

            @keyframes progressShine {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            .show-overlay .loader-overlay {
                display: flex;
            }

            .show-progress .progress-bar {
                transform: translateX(0);
            }

            .show-progress .progress-fill {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }

    interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            this.startRequest();
            return originalFetch(...args)
                .then(response => {
                    this.endRequest();
                    return response;
                })
                .catch(error => {
                    this.endRequest();
                    this.showError('Erreur de réseau');
                    throw error;
                });
        };
    }

    interceptXHR() {
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this.addEventListener('loadstart', () => window.globalLoader.startRequest());
            this.addEventListener('loadend', () => window.globalLoader.endRequest());
            this.addEventListener('error', () => {
                window.globalLoader.endRequest();
                window.globalLoader.showError('Erreur de réseau');
            });
            return originalOpen.call(this, method, url, ...rest);
        };
    }

    interceptForms() {
        // Intercepter les soumissions de formulaires
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                this.startRequest();
                // Écouter le retour sur la page (pageshow) pour arrêter le loader
                const handlePageShow = () => {
                    this.endRequest();
                    window.removeEventListener('pageshow', handlePageShow);
                };
                window.addEventListener('pageshow', handlePageShow);
                // Timeout de sécurité au cas où pageshow ne se déclenche pas
                setTimeout(() => this.endRequest(), 10000);
            }
        });
    }

    startRequest() {
        this.activeRequests++;
        this.updateUI();
    }

    endRequest() {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.updateUI();
    }

    updateUI() {
        const loader = document.getElementById('global-loader');
        if (this.activeRequests > 0) {
            loader.classList.add('show-progress');
            if (this.activeRequests > 1) {
                loader.classList.add('show-overlay');
            }
        } else {
            loader.classList.remove('show-progress', 'show-overlay');
        }
    }

    showError(message, isCritical = false) {
        if (isCritical) {
            // Afficher une notification d'erreur critique
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification critical';
            errorDiv.innerHTML = `
                <div class="error-icon">⚠️</div>
                <div class="error-content">
                    <div class="error-title">Erreur</div>
                    <div class="error-message">${message}</div>
                </div>
                <button class="error-close">&times;</button>
            `;
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10003;
                font-family: 'Rajdhani', sans-serif;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                animation: slideInRight 0.3s ease;
                max-width: 300px;
                cursor: pointer;
            `;
            document.body.appendChild(errorDiv);

            // Fermer automatiquement après 5 secondes
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.style.animation = 'slideOutRight 0.3s ease';
                    setTimeout(() => errorDiv.remove(), 300);
                }
            }, 5000);

            // Bouton de fermeture
            errorDiv.querySelector('.error-close').addEventListener('click', () => {
                errorDiv.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => errorDiv.remove(), 300);
            });
        } else {
            // Pour les erreurs non-critiques, juste un indicateur subtil
            console.warn('Loader error:', message);
        }
    }

    // Méthodes publiques pour contrôle manuel
    show() {
        this.startRequest();
    }

    hide() {
        this.endRequest();
    }

    setProgress(percent) {
        const fill = document.querySelector('.progress-fill');
        if (fill) {
            fill.style.transform = `translateX(${percent - 100}%)`;
        }
    }
}

// Initialiser le loader global
window.globalLoader = new GlobalLoader();

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalLoader;
}