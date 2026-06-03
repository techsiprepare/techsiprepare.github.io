import { inicializarDados } from './api/sheets.js';
import { inicializarRoteador } from './router.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("Iniciando Ecossistema TechSI Prepare...");
    inicializarRoteador();
    inicializarDados().then(() => {
        window.dispatchEvent(new CustomEvent('dadosProntos'));
    });
});