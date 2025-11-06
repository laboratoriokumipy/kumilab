# Sitio estático — Laboratorios Kumi

Este repositorio publica un catálogo de productos con **GitHub Pages** y consume los datos directamente de una **Google Sheet** y las imágenes guardadas en **Google Drive**.

## Requisitos previos
1. Hacer pública la hoja: abrir la hoja en Google Sheets y usar Archivo → Publicar en la web. Debe ser visible para cualquiera con el enlace.
2. Usar el nombre de pestaña `Productos` o actualizar `SHEET_NAME` en `js/config.js`.
3. Las imágenes deben ser compartidas como "Cualquiera con el enlace". Si la URL proviene de Drive, el sitio convierte automáticamente links como `https://drive.google.com/file/d/<ID>/view` en `https://drive.google.com/uc?export=view&id=<ID>`.

## Estructura
```
.
├── index.html                # Catálogo con búsqueda, filtros y ordenación
├── producto.html             # Vista de detalle ?product=<id>
├── categorias.html           # Explorador por categorías
├── contacto.html             # Contacto
├── acerca.html               # Información de la empresa
├── manifest.webmanifest      # PWA
├── js/
│   ├── config.js             # IDs y parámetros de la fuente
│   ├── utils.js              # Utilidades comunes
│   ├── app.js                # Lógica de catálogo
│   └── detail.js             # Lógica de detalle
├── assets/
│   └── styles.css            # Estilos base
└── sw.js                     # Service Worker (caché)
```

## Despliegue en GitHub Pages
1. Subir todo el contenido a la rama `main` del repositorio.
2. En Settings → Pages, seleccionar la rama `main` y la carpeta root `/`.
3. Esperar a que se publique y comprobar la URL.

## Parámetros de URL
- `producto.html?product=<id>`: abre directamente la ficha del producto.
- `index.html?categoria=<slug>`: prefiltra por categoría.
- `index.html?q=<texto>`: búsqueda inicial.

## Personalización
- Editar colores en `assets/styles.css`.
- Cambiar la marca en el encabezado de `index.html` y `acerca.html`.
