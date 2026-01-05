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
  } else if (request.action === 'updatePaginationStatus') {
    // Mettre à jour l'icône selon le statut de pagination
    console.log('Page Extension: Mise à jour du badge', {
      tabId: sender.tab.id,
      hasPagination: request.hasPagination,
      currentPage: request.currentPage,
      url: request.url
    });
    updateExtensionIcon(sender.tab.id, request.hasPagination, request.currentPage);
    sendResponse({ success: true });
  }
  
  return true; // Indique que la réponse sera asynchrone
});

/**
 * Met à jour l'icône de l'extension pour indiquer si la pagination est disponible
 * @param {number} tabId - ID de l'onglet
 * @param {boolean} hasPagination - Si la pagination est détectée
 * @param {number|null} currentPage - Numéro de page actuel
 */
function updateExtensionIcon(tabId, hasPagination, currentPage = null) {
  if (hasPagination && currentPage !== null) {
    // Afficher un badge avec le numéro de page (limité à 4 caractères)
    const pageText = currentPage > 9999 ? '9999+' : currentPage.toString();
    console.log('Page Extension: Affichage du badge', { tabId, pageText });
    
    chrome.action.setBadgeText({
      tabId: tabId,
      text: pageText
    });
    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#34a853' // Vert pour indiquer que c'est actif
    });
    chrome.action.setTitle({
      tabId: tabId,
      title: `Page Extension - Navigation active (Page ${currentPage}) - Utilisez ← → pour naviguer`
    });
  } else {
    // Pas de pagination, retirer le badge
    console.log('Page Extension: Suppression du badge', { tabId });
    chrome.action.setBadgeText({
      tabId: tabId,
      text: ''
    });
    chrome.action.setTitle({
      tabId: tabId,
      title: 'Page Extension - Navigation non disponible sur cette page'
    });
  }
}

// Écouter les changements d'onglets
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Réinitialiser l'icône seulement au début du chargement
    // Le content script mettra à jour l'icône une fois la page chargée
    chrome.action.setBadgeText({
      tabId: tabId,
      text: ''
    });
    console.log('Page Extension: Onglet en cours de chargement', tab.url);
  }
  // Ne pas réinitialiser quand status === 'complete' car le content script
  // va mettre à jour le badge juste après
});

// Ne pas réinitialiser automatiquement lors du changement d'onglet
// Le content script de l'onglet actif mettra à jour l'icône s'il est déjà chargé
// Sinon, il le fera une fois chargé

