// Utilidades comunes
window.kumi = window.kumi || {};

window.kumi.slug = (s='') => String(s).toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

window.kumi.currency = v => new Intl.NumberFormat('es-PY',{style:'currency',currency:'PYG',maximumFractionDigits:0}).format(v||0);

window.kumi.qs = key => new URLSearchParams(location.search).get(key);

window.kumi.parseGViz = (txt) => {
  const json = JSON.parse(txt.substring(txt.indexOf('{'), txt.lastIndexOf('}')+1));
  const cols = json.table.cols.map(c => c.label || c.id || `col${Math.random()}`);
  const rows = json.table.rows.map(r => {
    const o = {};
    cols.forEach((c,i) => { o[c] = r.c[i] ? r.c[i].v : null; });
    return o;
  });
  return rows;
};

window.kumi.fetchSheet = async () => {
  const key = 'kumi-cache-v1';
  try{
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if(cached && Date.now() - cached.ts < window.kumi.CACHE_MS) return cached.rows;
  }catch(e){}
  const res = await fetch(window.kumi.GVIZ_URL, {cache:'no-store'});
  const txt = await res.text();
  const rows = window.kumi.parseGViz(txt);
  try{ localStorage.setItem(key, JSON.stringify({ts:Date.now(), rows})); }catch(e){}
  return rows;
};

window.kumi.driveToDirect = (u) => {
  if(!u) return null;
  const idMatch = String(u).match(/[-\w]{25,}/);
  const id = idMatch ? idMatch[0] : null;
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : u;
};

window.kumi.parseImages = (s) => {
  if(!s) return [];
  return String(s).split(/[;|,\n]/).map(x => x.trim()).filter(Boolean).map(window.kumi.driveToDirect);
};

window.kumi.parseTags = (s) => {
  if(!s) return [];
  return String(s).split(/[;|,]/).map(x => x.trim().toLowerCase()).filter(Boolean);
};

window.kumi.normalizeProduct = (row) => {
  const id = row.id || row.ID || row.Id || row.codigo || row.CODIGO || row.Codigo;
  const precio = Number(row.precio || row.Precio || row.precio_py || row.Precio_PYG || 0);
  const nombre = row.nombre || row.Nombre || row.PRODUCTO || row.Producto;
  const categoria = row.categoria || row.Categoria || 'General';
  const imagenes = window.kumi.parseImages(row.imagen || row.Imagen || row.foto || row.Foto || row.imagenes || row.Galeria);
  const etiquetas = window.kumi.parseTags(row.etiquetas || row.tags || row.Tags);
  const creado = row.creado || row.Creado || row.timestamp || row.Timestamp;
  const stock = Number(row.stock ?? row.Stock ?? -1);
  return {
    id: id ? String(id) : `auto-${crypto.randomUUID()}`,
    nombre: nombre || 'Producto',
    categoria,
    precio,
    descripcion: row.descripcion || row.Descripcion || '',
    imagenes,
    etiquetas,
    stock,
    sku: row.sku || row.SKU || '',
    unidad: row.unidad || row.Unidad || '',
    presentacion: row.presentacion || row.Presentacion || '',
    destacado: String(row.destacado || row.Destacado || '').toLowerCase().includes('si'),
    creado
  };
};

window.kumi.fuzzyScore = (text, q) => {
  text = String(text||'').toLowerCase(); q = String(q||'').toLowerCase();
  if(!q) return 1;
  let i=0, score=0;
  for(const ch of text){
    if(ch===q[i]){ score+=2; i++; if(i===q.length) break; }
    else if(q.includes(ch)) score += .5;
  }
  return score / Math.max(q.length,1);
};

window.kumi.chunk = (arr, size) => {
  const out=[]; for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out;
};
