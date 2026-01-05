// popup.js - Logique de l'interface popup

document.addEventListener('DOMContentLoaded', () => {
  const actionBtn = document.getElementById('actionBtn');
  const inputField = document.getElementById('inputField');
  const status = document.getElementById('status');

  // Charger les données sauvegardées
  chrome.storage.sync.get(['savedData'], (result) => {
    if (result.savedData) {
      inputField.value = result.savedData;
    }
  });

  // Gestionnaire de clic sur le bouton
  actionBtn.addEventListener('click', async () => {
    const text = inputField.value;
    
    if (!text) {
      showStatus('Veuillez entrer du texte', 'error');
      return;
    }

    // Sauvegarder les données
    chrome.storage.sync.set({ savedData: text }, () => {
      showStatus('Données sauvegardées!', 'success');
    });

    // Envoyer un message au script de contenu
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'execute', data: text });
  });

  // Fonction pour afficher le statut
  function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
    }, 3000);
  }
});

