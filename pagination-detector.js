// pagination-detector.js - Détection et parsing de la pagination dans les URLs

/**
 * Configuration des patterns de pagination
 * Chaque pattern contient :
 * - name: nom descriptif
 * - detect: fonction qui détecte si l'URL correspond au pattern
 * - getPage: fonction qui extrait le numéro de page actuel
 * - buildUrl: fonction qui construit l'URL pour une page donnée
 */
const PAGINATION_PATTERNS = [
  // Query parameters simples
  {
    name: 'query-p',
    detect: (url) => url.searchParams.has('p'),
    getPage: (url) => {
      const page = parseInt(url.searchParams.get('p'), 10);
      return isNaN(page) || page < 1 ? null : page;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      if (page === 1) {
        newUrl.searchParams.delete('p');
      } else {
        newUrl.searchParams.set('p', page.toString());
      }
      return newUrl.toString();
    }
  },
  {
    name: 'query-page',
    detect: (url) => url.searchParams.has('page'),
    getPage: (url) => {
      const page = parseInt(url.searchParams.get('page'), 10);
      return isNaN(page) || page < 1 ? null : page;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      if (page === 1) {
        newUrl.searchParams.delete('page');
      } else {
        newUrl.searchParams.set('page', page.toString());
      }
      return newUrl.toString();
    }
  },
  {
    name: 'query-pageNum',
    detect: (url) => url.searchParams.has('pageNum'),
    getPage: (url) => {
      const page = parseInt(url.searchParams.get('pageNum'), 10);
      return isNaN(page) || page < 1 ? null : page;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      if (page === 1) {
        newUrl.searchParams.delete('pageNum');
      } else {
        newUrl.searchParams.set('pageNum', page.toString());
      }
      return newUrl.toString();
    }
  },
  {
    name: 'query-pagenum',
    detect: (url) => url.searchParams.has('pagenum'),
    getPage: (url) => {
      const page = parseInt(url.searchParams.get('pagenum'), 10);
      return isNaN(page) || page < 1 ? null : page;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      if (page === 1) {
        newUrl.searchParams.delete('pagenum');
      } else {
        newUrl.searchParams.set('pagenum', page.toString());
      }
      return newUrl.toString();
    }
  },

  // Query "path-like" patterns dans la partie search (ex: ?12142342340-ddwqqwd-qwdqwd/page39)
  // Ici, l'application encode toute la "route" après le ? dans la query string au lieu du pathname.
  {
    name: 'query-pathlike-page',
    detect: (url) => {
      // On ne peut pas utiliser searchParams car il n'y a pas de paires clé=valeur:
      // Exemple: ?12142342340-ddwqqwd-qwdqwd/page39
      // On cherche simplement un segment /page{num} dans la partie search brute.
      return /\/page(\d+)/.test(url.search || '');
    },
    getPage: (url) => {
      const match = (url.search || '').match(/\/page(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      const search = newUrl.search || '';

      // Remplacer le numéro de page dans le segment /page{num}
      // On conserve tout le préfixe avant /page et le reste éventuel après.
      const newSearch = search.replace(/\/page(\d+)/, `/page${page}`);

      newUrl.search = newSearch;
      return newUrl.toString();
    }
  },
  
  // Path patterns: /page/2, /p/3, /page-2, /p-3
  {
    name: 'path-page-slash',
    detect: (url) => /\/page\/\d+/.test(url.pathname),
    getPage: (url) => {
      const match = url.pathname.match(/\/page\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      newUrl.pathname = newUrl.pathname.replace(/\/page\/\d+/, page === 1 ? '' : `/page/${page}`);
      if (newUrl.pathname.endsWith('/') && newUrl.pathname !== '/') {
        newUrl.pathname = newUrl.pathname.slice(0, -1);
      }
      return newUrl.toString();
    }
  },
  {
    name: 'path-p-slash',
    detect: (url) => /\/p\/\d+/.test(url.pathname),
    getPage: (url) => {
      const match = url.pathname.match(/\/p\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      newUrl.pathname = newUrl.pathname.replace(/\/p\/\d+/, page === 1 ? '' : `/p/${page}`);
      if (newUrl.pathname.endsWith('/') && newUrl.pathname !== '/') {
        newUrl.pathname = newUrl.pathname.slice(0, -1);
      }
      return newUrl.toString();
    }
  },
  {
    name: 'path-page-dash',
    detect: (url) => /\/page-\d+/.test(url.pathname),
    getPage: (url) => {
      const match = url.pathname.match(/\/page-(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      newUrl.pathname = newUrl.pathname.replace(/\/page-\d+/, page === 1 ? '' : `/page-${page}`);
      if (newUrl.pathname.endsWith('/') && newUrl.pathname !== '/') {
        newUrl.pathname = newUrl.pathname.slice(0, -1);
      }
      return newUrl.toString();
    }
  },
  {
    name: 'path-p-dash',
    detect: (url) => /\/p-\d+/.test(url.pathname),
    getPage: (url) => {
      const match = url.pathname.match(/\/p-(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      newUrl.pathname = newUrl.pathname.replace(/\/p-\d+/, page === 1 ? '' : `/p-${page}`);
      if (newUrl.pathname.endsWith('/') && newUrl.pathname !== '/') {
        newUrl.pathname = newUrl.pathname.slice(0, -1);
      }
      return newUrl.toString();
    }
  },
  
  // Path patterns sans séparateur: /page4, /p2
  {
    name: 'path-page-no-separator',
    detect: (url) => {
      // Matche /page suivi directement d'un nombre (pas de slash ni tiret après "page")
      // Mais pas /page/ qui est déjà géré par path-page-slash
      return /\/page\d+/.test(url.pathname) && !/\/page\/\d+/.test(url.pathname);
    },
    getPage: (url) => {
      const match = url.pathname.match(/\/page(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      newUrl.pathname = newUrl.pathname.replace(/\/page\d+/, page === 1 ? '' : `/page${page}`);
      if (newUrl.pathname.endsWith('/') && newUrl.pathname !== '/') {
        newUrl.pathname = newUrl.pathname.slice(0, -1);
      }
      return newUrl.toString();
    }
  },
  {
    name: 'path-p-no-separator',
    detect: (url) => {
      // Matche /p suivi directement d'un nombre (pas de slash ni tiret après "p")
      // Mais pas /p/ qui est déjà géré par path-p-slash
      // Attention: ne pas matcher des mots comme "product", "post", etc.
      // On vérifie que c'est bien /p suivi d'un nombre et pas d'une lettre
      return /\/p\d+/.test(url.pathname) && 
             !/\/p\/\d+/.test(url.pathname) && 
             !/\/p-\d+/.test(url.pathname);
    },
    getPage: (url) => {
      const match = url.pathname.match(/\/p(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      newUrl.pathname = newUrl.pathname.replace(/\/p\d+/, page === 1 ? '' : `/p${page}`);
      if (newUrl.pathname.endsWith('/') && newUrl.pathname !== '/') {
        newUrl.pathname = newUrl.pathname.slice(0, -1);
      }
      return newUrl.toString();
    }
  },
  
  // Pagination au milieu du slug: /23453245-p3-hello-world ou /article-p2-title
  {
    name: 'path-slug-p-middle',
    detect: (url) => {
      // Matche -p suivi d'un nombre au milieu ou à la fin d'un slug
      // Exemples: /23453245-p3-hello-world, /article-p2-title, /post-p5
      // Mais pas /p-3 qui est déjà géré par path-p-dash
      return /-p\d+/.test(url.pathname) && !/^\/p-\d+/.test(url.pathname);
    },
    getPage: (url) => {
      const match = url.pathname.match(/-p(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      if (page === 1) {
        // Supprimer -p3 du slug
        newUrl.pathname = newUrl.pathname.replace(/-p\d+/, '');
      } else {
        // Remplacer -p3 par -p{page}
        newUrl.pathname = newUrl.pathname.replace(/-p\d+/, `-p${page}`);
      }
      // Nettoyer les doubles tirets qui pourraient apparaître
      newUrl.pathname = newUrl.pathname.replace(/--+/g, '-');
      // Nettoyer les tirets en début/fin de segments
      newUrl.pathname = newUrl.pathname.replace(/\/-/g, '/').replace(/-\//g, '/');
      return newUrl.toString();
    }
  },
  
  // Patterns avec numéro de page à la fin du path
  {
    name: 'path-trailing-number',
    detect: (url) => {
      const match = url.pathname.match(/\/(\d+)\/?$/);
      return match && parseInt(match[1], 10) > 1;
    },
    getPage: (url) => {
      const match = url.pathname.match(/\/(\d+)\/?$/);
      return match ? parseInt(match[1], 10) : null;
    },
    buildUrl: (url, page) => {
      const newUrl = new URL(url);
      newUrl.pathname = newUrl.pathname.replace(/\/\d+\/?$/, page === 1 ? '' : `/${page}`);
      return newUrl.toString();
    }
  }
];

/**
 * Détecte le pattern de pagination dans une URL
 * @param {string} urlString - L'URL à analyser
 * @returns {Object|null} - { pattern, currentPage, buildUrl } ou null si aucun pattern détecté
 */
function detectPagination(urlString) {
  try {
    const url = new URL(urlString);
    
    // Tester chaque pattern dans l'ordre
    for (const pattern of PAGINATION_PATTERNS) {
      if (pattern.detect(url)) {
        const currentPage = pattern.getPage(url);
        if (currentPage !== null && currentPage > 0) {
          return {
            pattern: pattern.name,
            currentPage: currentPage,
            buildUrl: (page) => pattern.buildUrl(url, page)
          };
        }
      }
    }
    
    // Si aucun pattern ne correspond, retourner null
    // Les flèches ne fonctionneront que si l'URL contient un numéro de page
    return null;
  } catch (e) {
    console.error('Page Extension: Erreur lors de la détection de pagination', e);
    return null;
  }
}

/**
 * Ajoute un nouveau pattern de pagination
 * @param {Object} pattern - Le pattern à ajouter (même format que PAGINATION_PATTERNS)
 */
function addPaginationPattern(pattern) {
  PAGINATION_PATTERNS.push(pattern);
}

// Export pour utilisation dans les tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectPagination, addPaginationPattern, PAGINATION_PATTERNS };
}

