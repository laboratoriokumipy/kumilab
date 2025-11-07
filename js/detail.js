// Lógica de la página de detalle
document.addEventListener("DOMContentLoaded", function(){
  var id = window.kumi.qs("product");
  var container = document.getElementById("product");
  if(!container) return;

  if(!id){
    container.textContent = "Producto no especificado.";
    return;
  }

  window.kumi.fetchSheet()
    .then(function(rows){
      var products = rows.map(window.kumi.normalizeProduct);
      var p = products.find(function(x){ return String(x.id) === String(id); });
      if(!p){
        container.textContent = "Producto no encontrado.";
        return;
      }
      renderDetail(p);
    })
    .catch(function(){
      container.textContent = "No se pudo obtener la información del producto.";
    });

  function renderDetail(p){
    var gal = (p.imagenes && p.imagenes.length) ? p.imagenes : [""];
    var wapp = "https://wa.me/?text=" + encodeURIComponent("Consulta por: " + p.nombre);
    var price = p.precio ? window.kumi.currency(p.precio) : "Consultar";

    var galHtml = "";
    if(gal.length === 1){
      galHtml = '<img src="' + gal[0] + '" alt="' + (p.nombre || "") + '">';
    }else{
      galHtml = '<div class="gallery">';
      gal.forEach(function(src){
        galHtml += '<img src="' + src + '" alt="' + (p.nombre || "") + '">';
      });
      galHtml += "</div>";
    }

    var rows = "";
    if(p.sku) rows += row("Código", p.sku);
    if(p.categoria) rows += row("Categoría", p.categoria);
    if(p.unidad) rows += row("Unidad", p.unidad);
    if(p.presentacion) rows += row("Presentación", p.presentacion);
    if(p.stock != null && !isNaN(p.stock)) rows += row("Stock", p.stock);
    if(p.etiquetas && p.etiquetas.length) rows += row("Etiquetas", p.etiquetas.join(", "));
    if(p.creado) rows += row("Registro", p.creado);

    container.innerHTML = [
      "<h1>" + (p.nombre || "") + "</h1>",
      galHtml,
      '<div class="specs">',
      "<h3>Ficha técnica</h3>",
      "<table>",
      "<tbody>",
      rows || "<tr><td colspan="2">Sin metadatos adicionales.</td></tr>",
      "</tbody>",
      "</table>",
      "</div>",
      "<p>" + (p.descripcion || "") + "</p>",
      '<div class="actions">',
      '  <a class="cta" href="' + wapp + '" target="_blank" rel="noopener">Consultar por WhatsApp</a>',
      '  <a href="index.html" class="btn btn-small">Volver al catálogo</a>',
      "</div>"
    ].join("");
  }

  function row(label, value){
    return "<tr><td><strong>" + label + "</strong></td><td>" + value + "</td></tr>";
  }
});
