# Icônes de l'extension

Les icônes sont disponibles en SVG (`icon.svg`) et en PNG pour Chrome.

## Fichiers disponibles

- `icon.svg` - Version source SVG (128x128)
- `icon16.png` - 16x16 pixels (barre d'outils)
- `icon48.png` - 48x48 pixels (gestionnaire d'extensions)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Conversion SVG vers PNG

Si vous modifiez `icon.svg` et souhaitez régénérer les PNG, vous pouvez utiliser:

### Avec ImageMagick
```bash
magick -background none -resize 16x16 icon.svg icon16.png
magick -background none -resize 48x48 icon.svg icon48.png
magick -background none -resize 128x128 icon.svg icon128.png
```

### Avec Inkscape
```bash
inkscape icon.svg --export-filename=icon16.png --export-width=16 --export-height=16
inkscape icon.svg --export-filename=icon48.png --export-width=48 --export-height=48
inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128
```

### En ligne
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [Convertio](https://convertio.co/svg-png/)
