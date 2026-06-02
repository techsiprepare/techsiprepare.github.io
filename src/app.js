import { inicializarDados } from './api/sheets.js';
import { inicializarRoteador } from './router.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Iniciando Ecossistema TechSI Prepare...");
    await inicializarDados();
    inicializarRoteador();
});