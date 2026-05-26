# Documentação Técnica e Fluxo de Informações: TechSI Prepare

Este documento mapeia o fluxo de experiência do usuário (UX/UI), a arquitetura de dados (integração entre CSV e JSON) e a organização do sistema de arquivos do projeto.

---

## 1. Fluxo de Experiência do Usuário (UX/UI)

O sistema opera como uma *Single Page Application* (SPA) com rotas geridas via hash na URL. As páginas válidas de navegação são `home`, `acervo` e `instrucoes`.

### 1.1. Tela Inicial (`#home`)

* **Objetivo:** Apresentar a proposta do projeto de extensão e converter visitantes em participantes.

### 1.2. Tela de Acervo (`#acervo`)

* **Objetivo:** Permitir a busca de questões para estudo ou captação de novas resoluções.
* **Filtros e Paginação:** O acervo possui filtros dinâmicos extraídos dos dados reais da planilha (como ano e status). A exibição em grid é controlada por uma paginação que limita a renderização a 12 itens por página (`ITEMS_PER_PAGE`).
* **Cards Dinâmicos:**
* **Em Aberto (`open`):** Exibe a imagem de capa (borrada), um ícone de lápis em overlay, tags indicando curso/tipo e um botão com a chamada "Resolver Questão", que direciona para a página de instruções.
* **Resolvido (`done`):** Substitui a capa da imagem por um `iframe` do vídeo do YouTube embutido, exibindo o nome do autor da resolução.


* **Recursos Extras:** O grid oferece botões para visualizar o caderno completo (PDF em nova aba) e abrir o enunciado original da questão em um Modal interativo nativo da página (`abrirModalImagem`).

### 1.3. Tela de Instruções (`#instrucoes`)

* **Objetivo:** Guiar o aluno no processo de gravação e submissão através de um formulário externo.

---

## 2. Gestão de Dados (API e Repositórios)

O sistema baseia-se na mescla simultânea de dois repositórios de dados para formar o Acervo: a árvore estática local e o histórico dinâmico na nuvem.

### 2.1. Fontes de Dados

* **Planilha Google (CSV):** Obtida via `URL_CSV`, contém os dados aprovados das resoluções (formulários validados).
* **Arquivo Local (JSON):** Obtido via `URL_QUESTOES_JSON` (`data/questoes.json`), atua como o banco de dados oficial que lista a existência de todos os cadernos e questões mapeadas no repositório.

### 2.2. Tratamento e Merge

* O sistema cruza as informações utilizando a chave única `${ano}-${numero}` para verificar se uma questão estática já possui resolução no CSV dinâmico.
* O CSV passa por um *parser* (`parsearCSV`) que varre as colunas e espera extrair os seguintes campos por linha: `ano`, `numero`, `assunto`, `autor` e `video_url`.
* As URLs do YouTube inseridas no CSV são higienizadas automaticamente (`formatarUrlEmbed`), convertendo links padrão (`watch?v=`) ou curtos (`youtu.be/`) em links de incorporação (`embed/`).

---

## 3. Estrutura de Pastas e Banco de Imagens

O repositório local de cadernos e recortes de questões deve seguir um padrão rígido de encapsulamento para garantir a automação.

> O diretório base para todo o armazenamento local é `./img/banco-provas/`.

```text
img/banco-provas/
└── [CURSO]/                                    # Ex: computacao, design
    └── [ANO]/                                  # Ex: 2017, 2021
        └── [CODIGO_CADERNO]/                   # Ex: 1801, 4501, ou caderno-unico
            ├── prova.pdf                       # O arquivo PDF inteiro do caderno
            └── questoes/                       # Pasta pai dos enunciados recortados
                ├── discursivas/                # Imagens de questões dissertativas
                │   ├── 01.webp
                │   └── 02.webp
                └── objetivas/                  # Imagens de múltipla escolha
                    ├── 09.webp
                    └── 10.webp

```

### 3.1. Regras de Arquivos

* **Padrão de Nomenclatura:** As imagens das questões devem ter extensão `.webp`. O nome do arquivo deve ser preferencialmente numérico (ex: `01.webp`), pois o script extrairá os dígitos para ordenação e montagem do identificador.
* **Nome do PDF:** O arquivo com o caderno inteiro da prova deve se chamar `prova.pdf` por padrão dentro de sua respectiva pasta.
* **Segregação de Tipos:** A pasta de questões ramifica obrigatoriamente entre `objetivas` e `discursivas`.

---

## 4. Automação: Geração do Banco Local (JSON)

Para evitar a inserção manual de novos cadernos no código, o projeto conta com um script Node.js (`gerar-banco.js`).

* **Funcionamento:** O script faz uma varredura completa nas pastas dentro de `img/banco-provas/`.
* **Montagem da Árvore:** Para cada pasta reconhecida (Curso > Ano > Caderno > Tipo), o script constrói um nó em uma árvore de dados.
* **ID Único:** Ele injeta em cada questão um `id` único composto por: Prefixo do Curso (3 letras) + Ano + ID do Caderno + Sufixo do Tipo (`OBJ` ou `DIS`) + Número da Questão. *(Exemplo gerado: `COM-2021-1801-OBJ09`)*. Casos de cadernos sem código recebem a *flag* `UNI` (caderno-unico).
* **Resultado:** O output final é o arquivo `data/questoes.json`, que o frontend consumirá para renderizar a base de dados.

```mermaid
graph TD
    %% Definição de Estilos: Apenas Linhas e Texto (Sem Background)
    classDef principal fill:none,stroke:#111111,stroke-width:1.5px,color:#111111;
    classDef secundario fill:none,stroke:#666666,stroke-width:1px,stroke-dasharray: 3 3,color:#555555;
    classDef dados fill:none,stroke:#111111,stroke-width:2.5px,color:#111111;
    classDef Destaque fill:none,stroke:#111111,stroke-width:2px,font-weight:bold,color:#111111;

    %% 1. NAVEGAÇÃO SPA
    subgraph SPA ["1. Navegação SPA (Rotas via Hash)"]
        R["URL com Hash (#)"] -->|#home| H["Tela Inicial<br>• Proposta do Projeto"]
        R -->|#instrucoes| I["Tela de Instruções<br>• Guia de Submissão<br>• Link Externo"]
        R -->|#acervo| A["Tela de Acervo<br>• Grid de Questões"]
    end
    class R Destaque;
    class H,I,A principal;

    %% 2. GESTÃO E MERGE DE DADOS
    subgraph DATA ["2. Gestão de Dados & Renderização"]
        JSON[("data/questoes.json<br>Árvore Estática Local")] --> Merge{"Cruzamento de Dados<br>Chave: ano-numero"}
        CSV[("Planilha Google (CSV)<br>Histórico na Nuvem")] --> Parser["parsearCSV()"]
        
        Parser --> Clean["formatarUrlEmbed()<br>Higienização de Links"]
        Clean --> Merge
        
        Merge -->|Filtragem e Paginação| Grid["Grid do Acervo<br>Máx: 12 itens por página"]
    end
    class JSON,CSV dados;
    class Merge Destaque;
    class Parser,Clean,Grid principal;

    %% 3. ESTADOS DOS CARDS
    subgraph CARDS ["3. Estados dos Cards no Grid"]
        Grid --> CardOpen{"Status da Questão"}
        
        %% Estado Open
        CardOpen -->|'open' / Em Aberto| CO["Card Aberto"]
        CO --> CO_Detalhe["• Capa Borrada + Overlay de Lápis<br>• Tags de Curso/Tipo<br>• Botão 'Resolver Questão' (-> #instrucoes)"]
        
        %% Estado Done
        CardOpen -->|'done' / Resolvido| CD["Card Resolvido"]
        CD --> CD_Detalhe["• Substitui capa por iframe do YouTube<br>• Exibe Nome do Autor da Resolução"]
        
        %% Recursos Extras
        Grid --> Extra["Recursos Extras"]
        Extra -->|PDF| E1["Visualizar Caderno Completo<br>(Nova aba)"]
        Extra -->|Imagem| E2["Enunciado Original<br>(Modal Interativo)"]
    end
    class CardOpen Destaque;
    class CO,CD,Extra principal;
    class CO_Detalhe,CD_Detalhe,E1,E2 secundario;

    %% 4. AUTOMAÇÃO
    subgraph AUTOMATION ["4. Script de Automação (gerar-banco.js)"]
        Folder["Diretório Base<br>img/banco-provas/"] --> Scan["Varredura Completa<br>Curso > Ano > Caderno > Tipo"]
        Scan --> Rules{"Regras de Arquivo"}
        
        Rules -->|Imagens| R1["Extensão .webp<br>Ex: 01.webp"]
        Rules -->|Caderno| R2["Arquivo único<br>prova.pdf"]
        Rules -->|Estrutura| R3["Pastas<br>objetivas / discursivas"]
        
        Rules --> ID["Geração de ID Único"]
        ID --> IDF["Fórmula: Prefixo Curso (3 letras) + Ano + ID Caderno + Sufixo OBJ/DIS + Num Questão<br>Exemplo: COM-2021-1801-OBJ09"]
        
        IDF --> Output[("data/questoes.json<br>Atualização do Banco")]
    end
    class Folder,Output dados;
    class Rules,ID Destaque;
    class Scan,R1,R2,R3,IDF principal;

    %% Conexões entre blocos principais
    A -.->|Alimenta o Componente| Grid
    Output -.->|Gera Arquivo Lido por| JSON

    %% Ajuste de links para melhor visualização
    linkStyle default stroke:#111111,stroke-width:1.5px;
```