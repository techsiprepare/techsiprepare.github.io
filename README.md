# TechSI Prepare

O **TechSI Prepare** é um ecossistema e projeto de extensão do IFMG focado na resolução colaborativa das questões do ENADE para o curso de Sistemas de Informação. Baseando-se em metodologias de aprendizado ativo (*active learning*), o projeto incentiva estudantes a fixarem o conhecimento gravando explicações em vídeo, criando simultaneamente um acervo dinâmico, público e filtrável de resoluções para toda a comunidade acadêmica.

---

## 🛠️ Arquitetura e Funcionamento

O projeto foi construído seguindo uma filosofia *frontend-only* moderna, performática e **local-first baseada em arquivos**, eliminando a dependência de bancos de dados relacionais tradicionais ou APIs proprietárias no servidor.

### Fluxo de Dados (Google Sheets as a Database)
A aplicação consome dados em tempo real estruturados em três tabelas públicas via exportação CSV do Google Planilhas:
1. **Caderno de Provas:** Contém informações gerais (`ID_Prova`, `Ano`, `Área`, `Modalidade`, `Link do Caderno`).
2. **Mapeamento de Questões:** Guarda a relação das questões (`ID_Prova`, `Número`, `Página do PDF`).
3. **Respostas Aprovadas:** Centraliza as submissões validadas (`ID_Prova`, `Número`, `Tipo`, `Autor`, `URL do Vídeo`).

O motor de processamento no frontend unifica esses dados através de chaves compostas (`ID_Prova_NumeroQuestao`) em tempo de execução para renderizar a interface de forma reativa.

---

## 📂 Estrutura de Arquivos

A organização do código-fonte adota separação estrita de responsabilidades:

```text
├── index.html          # Estrutura semântica e containers das páginas (SPA)
├── styles.css          # Identidade visual, Grid System e responsividade mobile
└── src/
    ├── main.js         # Ponto de entrada, inicialização do App e manipulação do Menu Mobile
    ├── config.js       # URLs de publicação das planilhas Google (CSVs)
    ├── api.js          # Fetching e centralização do modelo de dados unificado
    ├── ui.js           # Renderização da Grid de questões, filtros dinâmicos e paginação
    ├── router.js       # Gerenciador de rotas baseado no histórico de Hash (#)
    └── utils.js        # Utilitários de parsing de CSV e manipulação de embeds do YouTube

```

---

## 🎛️ Recursos Implementados

* **Arquitetura SPA Nativa:** Roteamento baseado em escuta de eventos `hashchange` com manipulação assíncrona do DOM, garantindo navegação instantânea.
* **Filtros Combinatórios Dinâmicos:** Filtragem simultânea por Curso, Modalidade, Ano, Tipo de questão e Status (*Em Aberto* / *Resolvida*).
* **Geração Inteligente de Links:** Acoplamento direto do PDF com âncoras de visualização de páginas (`#page=X`), otimizado para navegadores desktop e com tratamento UX (*Toast warning*) para dispositivos móveis.
* **Parser Robusto de CSV:** Manipulação manual de delimitadores de strings com suporte nativo a aspas e quebras de linha integradas na célula.

---

## 🚀 Como Executar o Projeto Localmente

Como a aplicação é estruturada através de Módulos ES6 nativos do JavaScript, é obrigatório o uso de um servidor local para evitar bloqueios de políticas de CORS (`file://`).

1. Clone o repositório em sua máquina:

```bash
   git clone [https://github.com/seu-usuario/tech-si-prepare.git](https://github.com/seu-usuario/tech-si-prepare.git)

```

2. Acesse a pasta do projeto:

```bash
   cd tech-si-prepare

```

3. Inicie um servidor local de sua preferência:

* **Se usa VS Code:** Instale a extensão *Live Server* e clique em **Go Live**.

---

## 📝 Fluxo do Estudante

O fluxo para gravação, envio e contabilização de horas de extensão funciona em quatro etapas simples mapeadas no sistema:

1. **Localize uma Questão:** Vá até a aba **Acervo de Resoluções**, ative o filtro **"Em Aberto"** e selecione um exercício disponível.
2. **Consulte o Caderno:** Clique no link para visualizar a questão exatamente na página correspondente do PDF oficial do ENADE.
3. **Grave a Resolução:** Grave a tela do seu computador explicando a resolução de forma didática. Suba o arquivo no YouTube no modo *Público* ou *Não Listado*.
4. **Envie os Dados:** Clique em **"Preencher Formulário de Envio"** na aba de Instruções para registrar o link do seu vídeo e garantir a validação da sua carga horária de extensão.

> ⚠️ **Nota Importante:** O sistema opera por ordem de chegada do formulário. Caso dois alunos gravem a mesma questão, a validação dar-se-á para o envio correto que constar com o carimbo de data/hora mais antigo.

---

## 📊 Sobre a planilha e formulário (base de dados)

[Acesse aqui.](docs/sheets-guidelines.md)