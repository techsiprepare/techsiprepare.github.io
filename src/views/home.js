/**
 * @file home.js
 * @description View da página Home. Composta pelos componentes isolados Hero e cardHome.
 */

import { hero } from '../components/hero.js';
import { cardHome } from '../components/card-home.js';

export function home() {
    const features = [
        {
            icon: 'target',
            title: 'Foco e Objetivo',
            description: 'Preparar os estudantes para o exame do ENADE através da técnica de aprendizado ativo. O objetivo é construir uma biblioteca de resoluções em vídeo, clara e acessível, mapeando todas as provas passadas.'
        },
        {
            icon: 'users',
            title: 'Público Alvo',
            description: 'Estudantes do curso de Sistemas de Informação que desejam se preparar para as provas, e alunos que buscam horas de extensão contribuindo ativamente com a resolução de questões abertas.'
        },
        {
            icon: 'award',
            title: 'Quem pode participar?',
            description: 'Qualquer estudante regularmente matriculado no IFMG. A submissão de vídeos passa por avaliação e, se aprovada, é publicada no nosso acervo oficial, contabilizando carga horária de extensão.'
        }
    ];

    return `
        ${hero()}
        <div class="grid-cards home-cards">
            ${features.map(f => cardHome(f)).join('')}
        </div>
    `;
}