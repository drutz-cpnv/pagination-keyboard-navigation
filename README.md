# Page Extension - Extension Chrome

Une extension Chrome moderne construite avec Manifest V3 qui permet de naviguer entre les pages avec les flèches directionnelles du clavier.

## Fonctionnalités

- **Navigation par flèches** : Utilisez les flèches directionnelles (← → ↑ ↓) pour naviguer entre les pages
- **Détection automatique** : Détecte automatiquement différents formats de pagination dans les URLs
- **Support multi-formats** : Prend en charge les query parameters (`?p=2`, `?page=3`) et les paths (`/page/2`, `/p-3`)

## Structure du projet

```
page-extension/
├── manifest.json              # Configuration principale de l'extension
├── popup.html                 # Interface utilisateur du popup
├── popup.js                   # Logique du popup
├── popup.css                  # Styles du popup
├── content.js                 # Script de contenu (s'exécute sur les pages web)
├── background.js              # Service Worker (Manifest V3)
├── pagination-detector.js     # Module de détection de pagination
├── pagination-navigator.js    # Module de navigation avec flèches
├── test-pagination.html       # Page de tests pour valider les détections
├── icons/                     # Dossier contenant les icônes
│   ├── icon.svg
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md                  # Documentation
```

## Installation

1. Ouvrez Chrome et allez à `chrome://extensions/`
2. Activez le "Mode développeur" en haut à droite
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier `page-extension`

## Développement

### Fichiers principaux

- **manifest.json**: Définit les permissions, les scripts, et la configuration de l'extension
- **popup.html/js/css**: Interface utilisateur qui s'affiche quand on clique sur l'icône de l'extension
- **content.js**: Script qui s'exécute sur chaque page web visitée
- **background.js**: Service Worker qui gère les événements en arrière-plan

### Permissions

L'extension demande actuellement:
- `activeTab`: Accès à l'onglet actif
- `storage`: Stockage local des données
- `<all_urls>`: Accès à toutes les URLs (peut être restreint selon vos besoins)

## Utilisation

Une fois l'extension installée, elle fonctionne automatiquement sur toutes les pages web :

1. **Navigation vers la page suivante** : Appuyez sur **→** (flèche droite) ou **↓** (flèche bas)
2. **Navigation vers la page précédente** : Appuyez sur **←** (flèche gauche) ou **↑** (flèche haut)

L'extension détecte automatiquement le format de pagination utilisé par le site et navigue en conséquence.

### Formats de pagination supportés

#### Query Parameters
- `?p=2` - Paramètre `p`
- `?page=3` - Paramètre `page`
- `?pageNum=4` - Paramètre `pageNum`
- `?pagenum=5` - Paramètre `pagenum`

#### Path Patterns
- `/page/2` - Path avec `/page/`
- `/p/3` - Path avec `/p/`
- `/page-2` - Path avec `/page-`
- `/p-3` - Path avec `/p-`
- `/articles/2` - Numéro à la fin du path

## Tests

Pour tester la détection de pagination :

1. Ouvrez `test-pagination.html` dans votre navigateur (après avoir chargé l'extension)
2. Cliquez sur "Exécuter tous les tests" pour voir les résultats
3. Ajoutez vos propres tests avec le formulaire en bas de page

Le système de tests permet de :
- Vérifier que tous les formats sont correctement détectés
- Ajouter facilement de nouveaux cas de test
- Voir les URLs générées pour les pages suivantes/précédentes

## Ajouter de nouveaux formats de pagination

Pour ajouter un nouveau format de pagination, modifiez `pagination-detector.js` :

```javascript
{
  name: 'mon-pattern',
  detect: (url) => url.pathname.includes('/ma-page/'),
  getPage: (url) => {
    const match = url.pathname.match(/\/ma-page\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  },
  buildUrl: (url, page) => {
    const newUrl = new URL(url);
    newUrl.pathname = `/ma-page/${page}`;
    return newUrl.toString();
  }
}
```

Ajoutez ce pattern au tableau `PAGINATION_PATTERNS` dans `pagination-detector.js`, puis testez-le avec `test-pagination.html`.

## Personnalisation

Modifiez les fichiers selon vos besoins:
- Ajoutez de nouveaux patterns dans `pagination-detector.js`
- Personnalisez l'interface dans `popup.html` et `popup.css`
- Modifiez le comportement de navigation dans `pagination-navigator.js`
- Ajoutez des permissions dans `manifest.json` si nécessaire

## Notes

- Cette extension utilise Manifest V3 (la version actuelle de Chrome)
- Les icônes sont disponibles en SVG et PNG dans le dossier `icons/`
- Le service worker remplace les background pages de Manifest V2
- La navigation ne fonctionne pas dans les champs de saisie (input, textarea) pour éviter les conflits

