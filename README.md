# NaturaVida · Catálogo estático mejorado

Estructura preparada para ser publicada en GitHub Pages como catálogo de solo lectura.

La información se obtiene desde Google Sheets (pestaña `Productos`) mediante la URL GViz, sin modificar la lógica existente de guardado que se realiza desde Apps Script sobre la misma hoja.

## Columnas soportadas

Se reconocen de forma flexible los siguientes campos (no son todos obligatorios):

- `ID_Producto`, `Id_Producto`, `id`, `ID`, `codigo`, `Codigo`
- `Nombre_Producto`, `Nombre`, `Producto`, `PRODUCTo`
- `Categoria`, `categoria`
- `Precio`, `Precio_py`, `Precio_PYG`, `precio_py`, `Precio_sugerido`
- `Descripcion_Corta`, `Descripcion_Larga`, `Descripcion`, `descripcion`
- `Imagen_URL_1`, `Imagen_URL_2`, `Imagen_URL`, `Imagen`, `Foto`, `Galeria`, `imagenes`
- `Etiquetas`, `etiquetas`, `Tags`, `tags`
- `Stock`, `stock`
- `Destacado`, `destacado`
- `SKU`, `sku`
- `Unidad`, `unidad`
- `Presentacion`, `presentacion`
- `Creado`, `creado`, `Timestamp`, `timestamp`

Los enlaces de Google Drive se convierten automáticamente a formato embebible mediante `https://drive.google.com/uc?export=view&id=...`.

## Uso

1. Ajustar `SHEET_ID` y `SHEET_NAME` en `js/config.js` si corresponde.
2. Subir todo el contenido de `kumilab_enhanced` a la rama configurada para GitHub Pages.
3. Verificar que la hoja `Productos` sea pública de solo lectura o compartida para quien tenga el enlace, de modo que GViz pueda entregar los datos.
4. El panel de administración existente en Apps Script continúa escribiendo en la misma hoja sin requerir cambios.
