// Configuración de fuentes de datos para NaturaVida
window.kumi = window.kumi || {};

// Definir identificador de la hoja de cálculo y nombre de la pestaña
window.kumi.SHEET_ID = "1JFF44nFhV0HBm7L3o2f8_UzOHtGyZ255tNFAB1xniHs";
window.kumi.SHEET_NAME = "Productos";

// URL GViz estándar para lectura en modo solo lectura
window.kumi.GVIZ_URL =
  "https://docs.google.com/spreadsheets/d/"
  + window.kumi.SHEET_ID
  + "/gviz/tq?tqx=out:json&sheet="
  + encodeURIComponent(window.kumi.SHEET_NAME);

// Duración de caché local en milisegundos
window.kumi.CACHE_MS = 10 * 60 * 1000;
