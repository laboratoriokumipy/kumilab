// Lógica del catálogo
document.addEventListener('DOMContentLoaded', async () => {
  const orderSel = document.getElementById('order');
  const searchInput = document.getElementById('search');
  const grid = document.getElementById('grid');
  const pager = document.getElementById('pager');
  const chipbar = document.getElementById('chipbar');
  const summary = document.getElementById('summary');

  const rows = await window.kumi.fetchSheet();
  let products = rows.map(window.kumi.normalizeProduct).filter(p => p.nombre);

  // chips de categorías
  const cats = Array.from(new Set(products.map(p => p.categoria || 'General'))).sort();
  const chips = ['Todos', ...cats].map(c => {
    const el = document.createElement('button');
    el.className = 'chip' + (c==='Todos' ? ' active' : '');
    el.textContent = c;
    el.dataset.categoria = c==='Todos' ? '' : c;
    el.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      apply();
    });
    return el;
  });
  chipbar.replaceChildren(...chips);

  // filtros por URL
  const q0 = window.kumi.qs('q'); if(q0){ searchInput.value = q0; }
  const cat0 = window.kumi.qs('categoria');
  if(cat0){
    const chip = Array.from(document.querySelectorAll('.chip')).find(x => window.kumi.slug(x.dataset.categoria)===cat0);
    if(chip){ document.querySelectorAll('.chip').forEach(x => x.classList.remove('active')); chip.classList.add('active'); }
  }

  // orden inicial
  orderSel.addEventListener('change', apply);
  searchInput.addEventListener('input', apply);

  const PAGE = 12;
  let page = 0;

  function apply(){
    const term = searchInput.value.trim();
    const activeChip = document.querySelector('.chip.active');
    const cat = activeChip ? activeChip.dataset.categoria : '';
    const ord = orderSel.value;

    let filtered = products.filter(p => !cat || p.categoria===cat);
    if(term){
      filtered = filtered.map(p => ({...p, _score: window.kumi.fuzzyScore([p.nombre,p.categoria,p.etiquetas.join(' ')].join(' '), term)}))
                         .filter(p => p._score>0.2);
    }

    switch(ord){
      case 'name_asc': filtered.sort((a,b)=>a.nombre.localeCompare(b.nombre)); break;
      case 'name_desc': filtered.sort((a,b)=>b.nombre.localeCompare(a.nombre)); break;
      case 'price_asc': filtered.sort((a,b)=>a.precio-b.precio); break;
      case 'price_desc': filtered.sort((a,b)=>b.precio-a.precio); break;
      case 'recent': filtered.sort((a,b)=> new Date(b.creado||0) - new Date(a.creado||0)); break;
      default: if(term){ filtered.sort((a,b)=>(b._score||0)-(a._score||0)); }
    }

    summary.textContent = `${filtered.length} producto(s) encontrados`;
    page = 0;
    renderPage(filtered);
  }

  function renderPage(items){
    const chunks = window.kumi.chunk(items, PAGE);
    const list = chunks[page] || [];
    grid.innerHTML = list.map(card).join('');
    pager.innerHTML = '';
    if(chunks.length>1){
      const prev = Object.assign(document.createElement('button'), {textContent:'Anterior', disabled: page===0});
      const next = Object.assign(document.createElement('button'), {textContent:'Siguiente', disabled: page>=chunks.length-1});
      prev.onclick = () => { page--; renderPage(items); window.scrollTo({top:0,behavior:'smooth'}); };
      next.onclick = () => { page++; renderPage(items); window.scrollTo({top:0,behavior:'smooth'}); };
      pager.append(prev, next);
    }
    // lazy loading
    const imgs = document.querySelectorAll('img[data-src]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const img = e.target;
          img.src = img.dataset.src;
          img.onload = () => img.classList.add('loaded');
          io.unobserve(img);
        }
      });
    }, {rootMargin:'120px'});
    imgs.forEach(img => io.observe(img));
  }

  function card(p){
    const img = p.imagenes[0] || '';
    const price = p.precio ? `<span class="price">${window.kumi.currency(p.precio)}</span>` : '';
    const tags = p.etiquetas.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('');
    const wapp = `https://wa.me/?text=${encodeURIComponent('Consulta por: ' + p.nombre)}`;
    const detail = `producto.html?product=${encodeURIComponent(p.id)}`;
    const badge = p.destacado ? `<span class="badge">Destacado</span>` : '';
    return `<article class="card">
      <div class="thumb">
        <div class="badges">${badge}</div>
        <img data-src="${img}" alt="${p.nombre}">
      </div>
      <div class="body">
        <div class="meta">
          <span class="cat">${p.categoria || 'General'}</span>
          ${price}
        </div>
        <h3 class="title">${p.nombre}</h3>
        <div class="tags">${tags}</div>
        <div class="actions">
          <a class="cta" href="${detail}">Ver detalle</a>
          <a href="${wapp}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </article>`;
  }

  apply();
});
