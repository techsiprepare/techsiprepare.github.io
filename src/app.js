import { inicializarDados } from './api.js';
import { inicializarRoteador } from './router.js';

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Iniciando Ecossistema TechSI Prepare...");
    await inicializarDados();
    inicializarRoteador();
});