// Lógica del catálogo principal
document.addEventListener("DOMContentLoaded", function(){
  var orderSel = document.getElementById("order");
  var searchInput = document.getElementById("search");
  var grid = document.getElementById("grid");
  var pager = document.getElementById("pager");
  var chipbar = document.getElementById("chipbar");
  var summary = document.getElementById("summary");
  var metricProductos = document.getElementById("metricProductos");
  var metricCategorias = document.getElementById("metricCategorias");
  var clearBtn = document.getElementById("clearFilters");

  if(!grid || !orderSel || !searchInput || !chipbar || !summary){
    return;
  }

  var PAGE = 12;
  var products = [];
  var current = {
    term: "",
    cat: "",
    order: "relevance",
    page: 0
  };

  window.kumi.fetchSheet()
    .then(function(rows){
      products = rows.map(window.kumi.normalizeProduct).filter(function(p){
        return p && p.nombre;
      });

      buildChips(products);
      updateMetrics(products);
      apply();
    })
    .catch(function(){
      summary.textContent = "No se pudo cargar el catálogo desde la hoja de cálculo.";
    });

  function updateMetrics(list){
    if(!metricProductos || !metricCategorias) return;
    var total = list.length;
    var cats = Array.from(new Set(list.map(function(p){ return p.categoria || "General"; })));
    metricProductos.textContent = String(total);
    metricCategorias.textContent = String(cats.length);
  }

  function buildChips(list){
    chipbar.innerHTML = "";
    var cats = Array.from(new Set(list.map(function(p){
      return p.categoria || "General";
    }))).sort(function(a,b){
      return a.localeCompare(b,"es");
    });
    var all = document.createElement("button");
    all.className = "chip active";
    all.textContent = "Todos";
    all.dataset.categoria = "";
    chipbar.appendChild(all);

    cats.forEach(function(c){
      var el = document.createElement("button");
      el.className = "chip";
      el.textContent = c;
      el.dataset.categoria = c;
      chipbar.appendChild(el);
    });

    chipbar.addEventListener("click", function(e){
      var btn = e.target.closest(".chip");
      if(!btn) return;
      Array.prototype.forEach.call(chipbar.querySelectorAll(".chip"), function(c){
        c.classList.remove("active");
      });
      btn.classList.add("active");
      current.cat = btn.dataset.categoria || "";
      current.page = 0;
      apply();
    });
  }

  if(orderSel){
    orderSel.addEventListener("change", function(){
      current.order = orderSel.value;
      current.page = 0;
      apply();
    });
  }

  if(searchInput){
    searchInput.addEventListener("input", function(){
      current.term = searchInput.value || "";
      current.page = 0;
      apply();
    });
  }

  if(clearBtn){
    clearBtn.addEventListener("click", function(){
      current.term = "";
      current.cat = "";
      current.order = "relevance";
      current.page = 0;
      searchInput.value = "";
      orderSel.value = "relevance";
      var firstChip = chipbar.querySelector(".chip");
      if(firstChip){
        Array.prototype.forEach.call(chipbar.querySelectorAll(".chip"), function(c){
          c.classList.remove("active");
        });
        firstChip.classList.add("active");
      }
      apply();
    });
  }

  function apply(){
    if(!products.length){
      summary.textContent = "Sin productos cargados.";
      grid.innerHTML = "";
      pager.innerHTML = "";
      return;
    }

    var list = products.slice();

    if(current.cat){
      list = list.filter(function(p){
        return String(p.categoria || "") === String(current.cat);
      });
    }

    if(current.term){
      var term = current.term.trim();
      list = list
        .map(function(p){
          var base = [
            p.nombre,
            p.categoria,
            p.descripcion,
            (p.etiquetas || []).join(" ")
          ].join(" ");
          var score = window.kumi.fuzzyScore(base, term);
          p._score = score;
          return p;
        })
        .filter(function(p){
          return p._score && p._score > 0.2;
        });
    }

    switch(current.order){
      case "name_asc":
        list.sort(function(a,b){ return a.nombre.localeCompare(b.nombre,"es"); });
        break;
      case "name_desc":
        list.sort(function(a,b){ return b.nombre.localeCompare(a.nombre,"es"); });
        break;
      case "price_asc":
        list.sort(function(a,b){
          return (a.precio || 0) - (b.precio || 0);
        });
        break;
      case "price_desc":
        list.sort(function(a,b){
          return (b.precio || 0) - (a.precio || 0);
        });
        break;
      case "recent":
        list.sort(function(a,b){
          return new Date(b.creado || 0) - new Date(a.creado || 0);
        });
        break;
      default:
        if(current.term){
          list.sort(function(a,b){
            return (b._score || 0) - (a._score || 0);
          });
        }
    }

    summary.textContent = list.length + " producto(s) encontrados";

    var pages = window.kumi.chunk(list, PAGE);
    if(!pages.length){
      grid.innerHTML = "";
      pager.innerHTML = "";
      return;
    }
    if(current.page >= pages.length) current.page = 0;

    renderPage(pages, current.page);
  }

  function renderPage(pages, pageIndex){
    var page = pages[pageIndex] || [];
    grid.innerHTML = page.map(cardHtml).join("");
    buildPager(pages.length, pageIndex);
    configureLazyImages();
  }

  function cardHtml(p){
    var img = (p.imagenes && p.imagenes[0]) || "";
    var price = p.precio ? '<span class="price">' + window.kumi.currency(p.precio) + "</span>" : "";
    var tags = (p.etiquetas || []).slice(0,3).map(function(t){
      return '<span class="tag">' + t + "</span>";
    }).join("");
    var wapp = "https://wa.me/?text=" + encodeURIComponent("Consulta por: " + p.nombre);
    var detail = "producto.html?product=" + encodeURIComponent(p.id);
    var badge = p.destacado ? '<span class="badge">Destacado</span>' : "";
    return [
      '<article class="card">',
      '  <div class="thumb">',
      '    <div class="badges">' + badge + "</div>",
      '    <img data-src="' + (img || "") + '" alt="' + (p.nombre || "") + '">',
      "  </div>",
      '  <div class="body">',
      '    <div class="meta">',
      '      <span class="cat">' + (p.categoria || "General") + "</span>",
      "      " + price,
      "    </div>",
      '    <h3 class="title">' + (p.nombre || "") + "</h3>",
      '    <div class="tags">' + tags + "</div>",
      '    <div class="actions">',
      '      <a class="cta" href="' + detail + '">Ver detalle</a>',
      '      <a href="' + wapp + '" target="_blank" rel="noopener">WhatsApp</a>',
      "    </div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function buildPager(totalPages, activeIndex){
    pager.innerHTML = "";
    if(totalPages <= 1) return;
    for(var i = 0; i < totalPages; i++){
      var btn = document.createElement("button");
      btn.textContent = String(i + 1);
      if(i === activeIndex) btn.classList.add("active");
      (function(pageIndex){
        btn.addEventListener("click", function(){
          current.page = pageIndex;
          apply();
        });
      })(i);
      pager.appendChild(btn);
    }
  }

  function configureLazyImages(){
    var imgs = grid.querySelectorAll("img[data-src]");
    if(!("IntersectionObserver" in window)){
      imgs.forEach(function(img){
        img.src = img.dataset.src;
        img.onload = function(){ img.classList.add("loaded"); };
      });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var img = e.target;
          img.src = img.dataset.src;
          img.onload = function(){ img.classList.add("loaded"); };
          io.unobserve(img);
        }
      });
    }, { rootMargin: "120px" });
    imgs.forEach(function(img){ io.observe(img); });
  }
});
