// pagination-navigator.js - Navigation entre les pages avec les flèches directionnelles

/**
 * Gère la navigation entre les pages avec les flèches directionnelles
 */
class PaginationNavigator {
  constructor() {
    this.paginationInfo = null;
    this.enabled = true;
    this.init();
  }

  init() {
    // Détecter la pagination sur la page actuelle
    this.updatePaginationInfo();
    
    // Écouter les touches du clavier
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Observer les changements d'URL (pour les SPA)
    this.observeUrlChanges();
    
    console.log('Page Extension: Navigateur de pagination initialisé', this.paginationInfo);
  }

  updatePaginationInfo() {
    this.paginationInfo = detectPagination(window.location.href);
    if (this.paginationInfo) {
      console.log('Page Extension: Pagination détectée', {
        pattern: this.paginationInfo.pattern,
        currentPage: this.paginationInfo.currentPage
      });
      
      // Notifier le background script pour mettre à jour l'icône
      this.notifyPaginationStatus(true, this.paginationInfo.currentPage);
    } else {
      // Pas de pagination détectée
      this.notifyPaginationStatus(false);
    }
  }

  notifyPaginationStatus(hasPagination, currentPage = null) {
    // Envoyer un message au background script avec un petit délai
    // pour s'assurer que la page est complètement chargée
    setTimeout(() => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'updatePaginationStatus',
          hasPagination: hasPagination,
          currentPage: currentPage,
          url: window.location.href
        }).then(() => {
          console.log('Page Extension: Statut de pagination envoyé au background', {
            hasPagination,
            currentPage
          });
        }).catch(err => {
          // Ignorer les erreurs si le background n'est pas encore prêt
          console.debug('Page Extension: Impossible de notifier le background', err);
        });
      }
    }, 100); // Petit délai pour s'assurer que tout est prêt
  }

  handleKeyDown(event) {
    // Vérifier si les touches de modification sont pressées (Ctrl, Alt, Meta, Shift)
    // Si oui, on ne gère pas la navigation pour éviter les conflits
    if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Vérifier si on est dans un champ de saisie
    const activeElement = document.activeElement;
    const isInputField = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );
    
    if (isInputField) {
      return;
    }

    if (!this.enabled || !this.paginationInfo) {
      return;
    }

    let targetPage = null;
    let direction = null;

    // Flèche gauche ou haut = page précédente
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      direction = 'prev';
      if (this.paginationInfo.currentPage > 1) {
        targetPage = this.paginationInfo.currentPage - 1;
      }
    }
    // Flèche droite ou bas = page suivante
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      direction = 'next';
      targetPage = this.paginationInfo.currentPage + 1;
    }

    if (targetPage !== null && targetPage > 0) {
      event.preventDefault();
      this.navigateToPage(targetPage, direction);
    }
  }

  navigateToPage(page, direction) {
    if (!this.paginationInfo) {
      return;
    }

    const newUrl = this.paginationInfo.buildUrl(page);
    
    if (newUrl === window.location.href) {
      return; // Déjà sur cette page
    }

    console.log(`Page Extension: Navigation vers la page ${page} (${direction})`, newUrl);
    
    // Afficher une notification
    this.showNavigationNotification(page, direction);
    
    // Naviguer vers la nouvelle URL
    window.location.href = newUrl;
  }

  showNavigationNotification(page, direction) {
    // Supprimer les notifications existantes
    const existing = document.getElementById('page-extension-nav-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'page-extension-nav-notification';
    notification.textContent = `Page ${page}`;
    
    const arrow = direction === 'next' ? '→' : '←';
    notification.textContent = `${arrow} Page ${page}`;

    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 30px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 24px;
      font-weight: 600;
      z-index: 100000;
      pointer-events: none;
      animation: pageNavFade 0.5s ease-out;
    `;

    // Ajouter l'animation CSS si elle n'existe pas déjà
    if (!document.getElementById('page-extension-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'page-extension-nav-styles';
      style.textContent = `
        @keyframes pageNavFade {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Supprimer la notification après 500ms
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 500);
  }

  observeUrlChanges() {
    // Observer les changements d'URL pour les Single Page Applications
    let lastUrl = window.location.href;
    
    // Observer les changements dans l'historique
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(() => {
          this.updatePaginationInfo();
        }, 100);
      }
    }.bind(this);

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(() => {
          this.updatePaginationInfo();
        }, 100);
      }
    }.bind(this);

    // Écouter les événements popstate
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.updatePaginationInfo();
      }, 100);
    });
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

// Initialiser le navigateur quand le script est chargé
let paginationNavigator = null;

if (typeof window !== 'undefined') {
  // Fonction d'initialisation
  function initPaginationNavigator() {
    if (!paginationNavigator) {
      paginationNavigator = new PaginationNavigator();
    }
  }
  
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaginationNavigator);
  } else {
    // DOM déjà prêt, initialiser après un petit délai pour s'assurer que tout est chargé
    setTimeout(initPaginationNavigator, 50);
  }
  
  // Réinitialiser si l'URL change (pour les SPA)
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      if (paginationNavigator) {
        paginationNavigator.updatePaginationInfo();
      }
    }
  }, 500);
}

