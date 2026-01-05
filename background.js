// background.js - Service Worker pour Manifest V3

console.log('Page Extension: Service Worker démarré');

// Écouter l'installation de l'extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Page Extension: Extension installée', details.reason);
  
  if (details.reason === 'install') {
    // Actions à effectuer lors de la première installation
    chrome.storage.sync.set({ installed: true });
  }
});

// Écouter les messages depuis le popup ou les scripts de contenu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Page Extension: Message reçu dans le service worker', request);
  
  if (request.action === 'backgroundAction') {
    // Traiter l'action
    sendResponse({ success: true, message: 'Action traitée' });
  }
  
  return true; // Indique que la réponse sera asynchrone
});

// Écouter les changements d'onglets
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Page Extension: Onglet mis à jour', tab.url);
  }
});

