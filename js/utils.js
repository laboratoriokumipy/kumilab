// Utilidades comunes y normalización de datos
window.kumi = window.kumi || {};

// Conversión a slug
window.kumi.slug = function(s){
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/(^-|-$)/g,"");
};

// Formato moneda (PYG)
window.kumi.currency = function(v){
  var n = Number(v || 0);
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0
  }).format(n);
};

// Obtener parámetro de querystring
window.kumi.qs = function(key){
  return new URLSearchParams(window.location.search).get(key);
};

// Parseo de respuesta GViz a arreglo de objetos fila
window.kumi.parseGViz = function(txt){
  var json = JSON.parse(
    txt.substring(txt.indexOf("{"), txt.lastIndexOf("}") + 1)
  );
  var cols = json.table.cols.map(function(c, i){
    return c.label || c.id || "col" + i;
  });
  var rows = json.table.rows.map(function(r){
    var o = {};
    r.c.forEach(function(cell, i){
      o[cols[i]] = cell ? (cell.f || cell.v) : "";
    });
    return o;
  });
  return rows;
};

// Lectura con caché local
window.kumi.fetchSheet = async function(){
  var key = "naturavida-cache-v1";
  try{
    var cached = JSON.parse(localStorage.getItem(key) || "null");
    if(cached && Date.now() - cached.ts < window.kumi.CACHE_MS){
      return cached.rows;
    }
  }catch(e){}
  var res = await fetch(window.kumi.GVIZ_URL, { cache: "no-store" });
  var txt = await res.text();
  var rows = window.kumi.parseGViz(txt);
  try{
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), rows: rows }));
  }catch(e){}
  return rows;
};

// Conversión de enlaces de Drive a URL directa para <img>
window.kumi.driveToDirect = function(u){
  if(!u) return null;
  var s = String(u).trim();
  if(!s) return null;
  var idMatch = s.match(/[-\w]{25,}/);
  var id = idMatch ? idMatch[0] : null;
  if(id) return "https://drive.google.com/uc?export=view&id=" + id;
  return s;
};

// Lista de imágenes a partir de una cadena con separadores
window.kumi.parseImages = function(s){
  if(!s) return [];
  return String(s)
    .split(/[;|,\n]/)
    .map(function(x){ return x.trim(); })
    .filter(Boolean)
    .map(window.kumi.driveToDirect);
};

// Lista de etiquetas normalizadas
window.kumi.parseTags = function(s){
  if(!s) return [];
  return String(s)
    .split(/[;|,]/)
    .map(function(x){ return x.trim(); })
    .filter(Boolean);
};

// Normalización flexible de columnas de la hoja
window.kumi.normalizeProduct = function(row){
  row = row || {};

  var id =
    row.ID_Producto ||
    row.Id_Producto ||
    row.id ||
    row.ID ||
    row.Id ||
    row.codigo ||
    row.Codigo ||
    row.CODIGO;

  var nombre =
    row.Nombre_Producto ||
    row.Nombre ||
    row.PRODUCTO ||
    row.Producto ||
    row.nombre;

  var categoria =
    row.Categoria ||
    row.categoria ||
    row.CATEGORIA ||
    "General";

  var precio =
    row.Precio_py ||
    row.Precio_PYG ||
    row.Precio ||
    row.precio ||
    row.precio_py ||
    row.Precio_sugerido;
  precio = precio === "" || precio === null ? null : Number(precio);

  var imagenSources = [];
  var camposImg = [
    "Imagen_URL_1",
    "Imagen_URL_2",
    "Imagen_URL",
    "Imagen",
    "Imagen1",
    "Imagen2",
    "Foto",
    "foto",
    "Galeria",
    "imagenes"
  ];
  camposImg.forEach(function(k){
    if(row[k]) imagenSources = imagenSources.concat(window.kumi.parseImages(row[k]));
  });

  var etiquetas =
    window.kumi.parseTags(
      row.Etiquetas ||
      row.etiquetas ||
      row.Tags ||
      row.tags ||
      row.Categoria ||
      row.categoria
    );

  var descripcion =
    row.Descripcion_Larga ||
    row.Descripcion_Corta ||
    row.descripcion ||
    row.Descripcion ||
    "";

  var creado =
    row.Creado ||
    row.creado ||
    row.Timestamp ||
    row.timestamp ||
    "";

  var stockVal = row.Stock != null ? row.Stock : row.stock;
  var stock =
    stockVal === "" || stockVal == null ? null : Number(stockVal);

  var destacadoRaw = String(
    row.Destacado ||
    row.destacado ||
    ""
  ).trim().toLowerCase();
  var destacado =
    destacadoRaw === "si" ||
    destacadoRaw === "true" ||
    destacadoRaw === "1" ||
    destacadoRaw === "destacado";

  var sku = row.SKU || row.sku || "";
  var unidad = row.Unidad || row.unidad || "";
  var presentacion = row.Presentacion || row.presentacion || "";

  var imagenes = imagenSources.filter(Boolean);

  var finalId = id
    ? String(id).trim()
    : (nombre ? window.kumi.slug(nombre) : "prod-" + Math.random().toString(36).slice(2));

  return {
    id: finalId,
    nombre: nombre || "Producto sin nombre",
    categoria: categoria || "General",
    precio: precio && !isNaN(precio) ? Number(precio) : null,
    descripcion: descripcion,
    imagenes: imagenes,
    etiquetas: etiquetas,
    stock: !isNaN(stock) ? stock : null,
    sku: sku,
    unidad: unidad,
    presentacion: presentacion,
    destacado: destacado,
    creado: creado
  };
};

// Puntuación simple para búsqueda difusa
window.kumi.fuzzyScore = function(text, q){
  text = String(text || "").toLowerCase();
  q = String(q || "").toLowerCase();
  if(!q) return 1;
  var i = 0;
  var score = 0;
  for(var idx = 0; idx < text.length; idx++){
    var ch = text[idx];
    if(ch === q[i]){
      score += 2;
      i++;
      if(i === q.length) break;
    }else if(q.indexOf(ch) >= 0){
      score += 0.4;
    }
  }
  return score / Math.max(q.length, 1);
};

// Fragmentar arreglo
window.kumi.chunk = function(arr, size){
  var out = [];
  for(var i = 0; i < arr.length; i += size){
    out.push(arr.slice(i, i + size));
  }
  return out;
};
