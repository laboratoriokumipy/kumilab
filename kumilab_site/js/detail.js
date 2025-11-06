// Lógica de la página de detalle
document.addEventListener('DOMContentLoaded', async () => {
  const id = window.kumi.qs('product');
  const container = document.getElementById('product');
  if(!id){ container.textContent = 'Producto no especificado.'; return; }

  const rows = await window.kumi.fetchSheet();
  const products = rows.map(window.kumi.normalizeProduct);
  const p = products.find(x => String(x.id)===String(id));
  if(!p){ container.textContent = 'Producto no encontrado.'; return; }

  const gal = p.imagenes.length ? p.imagenes : [''];
  const wapp = `https://wa.me/?text=${encodeURIComponent('Consulta por: ' + p.nombre)}`;
  const price = p.precio ? window.kumi.currency(p.precio) : 'Consultar';

  container.innerHTML = `
    <h1>${p.nombre}</h1>
    <p class="muted">${p.categoria || 'General'}</p>
    <div class="gallery">
      ${gal.map(g => `<figure><img src="${g}" alt="${p.nombre}"></figure>`).join('')}
    </div>
    <section class="specs">
      <h3>Especificaciones</h3>
      <table>
        <tbody>
          <tr><td><strong>Precio</strong></td><td>${price}</td></tr>
          ${p.sku ? `<tr><td><strong>SKU</strong></td><td>${p.sku}</td></tr>`:''}
          ${p.unidad ? `<tr><td><strong>Unidad</strong></td><td>${p.unidad}</td></tr>`:''}
          ${p.presentacion ? `<tr><td><strong>Presentación</strong></td><td>${p.presentacion}</td></tr>`:''}
          ${Number.isFinite(p.stock) && p.stock>=0 ? `<tr><td><strong>Stock</strong></td><td>${p.stock}</td></tr>`:''}
          ${p.etiquetas.length ? `<tr><td><strong>Etiquetas</strong></td><td>${p.etiquetas.join(', ')}</td></tr>`:''}
        </tbody>
      </table>
      <p>${p.descripcion || ''}</p>
      <div class="actions">
        <a class="cta" href="${wapp}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
        <a href="index.html?categoria=${window.kumi.slug(p.categoria)}">Ver más en ${p.categoria||'Catálogo'}</a>
      </div>
    </section>
  `;
});
