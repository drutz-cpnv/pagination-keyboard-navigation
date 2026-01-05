// content.js - Script de contenu qui s'exécute sur les pages web

console.log('Page Extension: Script de contenu chargé');

// Charger les modules de pagination
// Note: Les scripts sont chargés dans l'ordre défini dans manifest.json

// Écouter les messages depuis le popup ou le background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'execute') {
    console.log('Page Extension: Action reçue avec les données:', request.data);
    
    // Exemple d'action: afficher une notification sur la page
    showNotification(request.data);
    
    sendResponse({ success: true });
  }
  
  return true; // Indique que la réponse sera asynchrone
});

// Fonction pour afficher une notification sur la page
function showNotification(message) {
  // Créer un élément de notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4285f4;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = `Extension: ${message}`;
  
  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Supprimer la notification après 3 secondes
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

