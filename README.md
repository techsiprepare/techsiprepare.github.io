# Tech SIPrepare - Acervo

Este repositório contém o código-fonte e a documentação do **Tech SIPrepare**, uma plataforma web estruturada como uma Single Page Application (SPA) voltada para a organização, curadoria e exibição de resoluções em vídeo de questões do Exame Nacional de Desempenho dos Estudantes (ENADE).

## 🎯 Objetivo do Projeto de Extensão

O projeto de extensão tem como objetivo centralizar e disponibilizar de forma pública resoluções em vídeo de questões de exames anteriores do ENADE para cursos de computação e sistemas de informação. A plataforma funciona como um ecossistema que conecta a submissão de conteúdos práticos feitos por estudantes a um acervo interativo, auxiliando na preparação acadêmica e na revisão de conceitos fundamentais da área de tecnologia de forma acessível e colaborativa.

---

## 🏗️ Arquitetura do Sistema

O ecossistema é dividido em três camadas principais operadas de forma integrada e sem custos de infraestrutura de servidor backend convencional:

1. **Entrada de Dados (Google Forms):** Canal por onde os estudantes enviam suas submissões contendo metadados da questão (ano, curso, número, tipo), o link do vídeo explicativo original e o termo de autorização em PDF.
2. **Processamento e Banco de Dados (Google Sheets & Apps Script):** As respostas do formulário alimentam um Data Lake na planilha. Um conjunto de automações em Google Apps Script realiza a validação cruzada instantânea de dados, previne registros duplicados e cria chaves relacionais exclusivas para indexação das provas e questões.
3. **Interface do Usuário (SPA Frontend):** Uma aplicação web desenvolvida em JavaScript puro (Vanilla JS) que consome os dados processados da planilha exportados publicamente em formato CSV (apenas abas sem dados sensíveis). A navegação ocorre por meio de rotas baseadas no fragmento da URL (hash routing) com suporte a *Deep Linking*, atualizando os elementos dinamicamente e sincronizando a URL com a paginação interna de documentos (PDFs) sem recarregar a página.

---

## 📂 Estrutura de Pastas e Componentes

```text
├── assets/           # Recursos estáticos globais do projeto
├── img/              # Imagens e logotipos
├── docs/             # Documentação e scripts do banco de dados (Google Sheets)
├── src/              # Código-fonte lógico do sistema (JavaScript)
│   ├── api/          # Módulo de consumo e tratamento dos dados em CSV
│   ├── components/   # Elementos visuais reutilizáveis (botões, menus, cards)
│   ├── views/        # Páginas/telas completas renderizadas pelo roteador
│   ├── router.js     # Mecanismo que altera as telas via URL (hash routing)
│   └── app.js        # Inicializador e ponto central da lógica da aplicação
├── styles/           # Arquivos de estilização e temas visuais (CSS)
└── index.html        # Único arquivo HTML e porta de entrada da SPA
```

---

## 🛠️ Tecnologias e Dependências

A construção da aplicação priorizou o uso de tecnologias nativas para otimização de carregamento e portabilidade:

* **HTML5 & CSS3:** Estruturação semântica e estilização customizada com variáveis de CSS (CSS Variables) para controle de layout responsivo.
* **JavaScript (ES6+):** Lógica de estados, manipulação assíncrona de dados (`fetch`, `Promise.all`), parsing de arquivos CSV e injeção dinâmica de templates literais (Template Strings).
* **Google Apps Script:** Funções baseadas em JavaScript executadas diretamente nos servidores do Google para manipulação orientada a eventos e processamento em lote (Batch Update).
* **Lucide Icons:** Biblioteca externa importada via CDN utilizada exclusivamente para a renderização padronizada de ícones na interface visual.

---

## 👥 Créditos

* **Desenvolvimento e Concepção:** Desenvolvido no âmbito do projeto de extensão **Tech SIPrepare** ligado ao Instituto Federal de Minas Gerais (IFMG).
* **Ícones:** Disponibilizados sob licença de código aberto pela comunidade do [Lucide Icons](https://lucide.dev/).