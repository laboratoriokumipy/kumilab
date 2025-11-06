// Configuración de fuentes de datos
window.kumi = window.kumi || {};
window.kumi.SHEET_ID = "1JFF44nFhV0HBm7L3o2f8_UzOHtGyZ255tNFAB1xniHs";
window.kumi.SHEET_NAME = "Productos"; // adaptar si su pestaña tiene otro nombre
// URL GViz que devuelve JSON con la tabla
window.kumi.GVIZ_URL = `https://docs.google.com/spreadsheets/d/${window.kumi.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(window.kumi.SHEET_NAME)}`;
// Duración de caché de catálogo en milisegundos
window.kumi.CACHE_MS = 10 * 60 * 1000;
