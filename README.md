# Documentação Técnica e Fluxo de Informações: TechSI Prepare

Este documento mapeia o fluxo de experiência do usuário (UX/UI), a arquitetura de dados (planilhas e formulários) e a organização de arquivos do projeto de extensão **TechSI Prepare - IFMG**.

---

## 1. Fluxo de Experiência do Usuário (UX/UI)

O sistema opera como uma *Single Page Application* (SPA), dividida em três frentes principais que guiam o usuário desde o entendimento do projeto até a ação (gravação da resolução). O layout utiliza *CSS Grid* e *Flexbox* para garantir consistência visual e alinhamento padronizado em dispositivos móveis e desktops.

### 1.1. Tela Inicial (`#home` - Sobre o Projeto)
* **Objetivo:** Apresentar a proposta de valor e converter o visitante em um participante ativo.
* **Componentes:**
  * **Hero Section:** Título de impacto, subtítulo explicativo e um *Call to Action* (CTA) principal direcionando para o acervo.
  * **Info Grid:** Três cards informativos (Foco, Público Alvo e Quem pode participar) que quebram objeções e explicam o funcionamento.
  * **Team Section:** Apresentação da equipe em formato de *tags* arredondadas.

### 1.2. Tela de Acervo (`#acervo` - Exploração e Descoberta)
* **Objetivo:** Permitir a busca de questões para estudo (já resolvidas) ou captação (abertas para gravação).
* **Componentes:**
  * **Header do Acervo:** Título e um *badge* dinâmico indicando o status de sincronização (Google Sheets).
  * **Filtros de Busca:** Dois *dropdowns* (`<select>`) que permitem cruzar dados por **Ano** e **Status** (Resolvidas vs. Abertas).
  * **Grid de Questões (Layout Padronizado):** Utiliza `grid-template-columns` flexível com largura mínima (`minmax`) para manter a consistência e largura uniforme dos cards em qualquer tela.
    * **Card de Questão Aberta:** Exibe a imagem local (`.webp`) do enunciado com overlay escurecido em hover, *tags* de identificação e um botão CTA "Quero Resolver" que direciona para as instruções.
    * **Card de Questão Resolvida:** Substitui a imagem pelo `<iframe>` do vídeo do YouTube e exibe o nome do autor da resolução.

### 1.3. Tela de Instruções (`#instrucoes` - Como Participar)
* **Objetivo:** Guiar o aluno no processo de gravação e submissão de forma clara e sem ambiguidades.
* **Componentes:**
  * **Steps Container:** Layout em lista vertical com numeração destacada guiando o usuário em 4 passos:
    1. Consultar o acervo (com link de retorno).
    2. Escolher a questão (inclui *alert box* sobre a regra de concorrência por ordem de chegada).
    3. Gravar e publicar no YouTube (regras de privacidade).
    4. Submeter o formulário (Botão CTA que abre o Google Forms em nova aba).

---

## 2. Estrutura do Formulário de Submissão

O formulário institucional (Google Forms) deve conter apenas os dados estritamente necessários para validação do vídeo e concessão das horas de extensão. *(Nota: O campo de link original da questão foi removido por ser desnecessário, já que o controle é feito via Ano + Número).*

| Ordem | Campo | Tipo de Resposta | Obrigatoriedade | Observação |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **E-mail Institucional** | E-mail | Sim | Coleta automática (se configurado no Forms). |
| 2 | **Nome Completo** | Texto Curto | Sim | Necessário para emissão do certificado. |
| 3 | **Ano da Prova do ENADE** | Múltipla Escolha | Sim | Ex: 2017, 2021. Evita erros de digitação. |
| 4 | **Número da Questão** | Texto Curto | Sim | Apenas números (Ex: 14, 15). |
| 5 | **Assunto Principal** | Texto Curto | Sim | Tema tratado na resolução (Ex: Banco de Dados). |
| 6 | **Link do Vídeo (YouTube)** | URL | Sim | O vídeo não pode estar em modo "Privado". |

> Exemplo de formulário: https://docs.google.com/forms/d/e/1FAIpQLSe51HB2cNklrDfzdbCbcf6HbnMcpgHU6R4s5FGMgviNdCOGZA/viewform

---

## 3. Gestão de Dados: Planilha, Aba Sanitizada e CSV

O sistema de *backend* *serverless* baseia-se na publicação de um arquivo CSV oriundo de uma aba sanitizada no Google Sheets.

### 3.1. Aba 1: Respostas do Formulário (Raw Data)
* Esta aba recebe os dados puros diretamente do Google Forms. Contém carimbo de data/hora, e-mail e todos os dados inseridos pelo aluno.
* **Uso:** Exclusivo para a moderação e auditoria dos professores/bolsistas. **Nunca deve ser publicada.**

### 3.2. Aba 2: Acervo Aprovado (Aba Sanitizada)
* Esta aba é alimentada manualmente pela moderação ou via função `=QUERY()` e `IMPORTRANGE` baseada na aprovação dos vídeos da Aba 1 (Atualmente está automático para facilitar a visualização do MVP, mas futuramente, podemos deixar isso completamente manual).
* É **esta aba** que deve ser publicada na web em formato CSV (`Arquivo > Compartilhar > Publicar na Web > Valores separados por vírgula`).

### 3.3. Estrutura de Colunas do CSV Exportado
A ordem exata e o cabeçalho das colunas da aba sanitizada devem refletir o *parser* programado no arquivo `index.html`:

| Índice da Coluna | Cabeçalho (Exemplo) | O que o JavaScript espera ler |
| :--- | :--- | :--- |
| Coluna A (0) | `Ano` | `ano` (Ex: 2021) |
| Coluna B (1) | `Questão` | `numero` (Ex: 14) |
| Coluna C (2) | `Assunto` | `assunto` (Ex: Engenharia de Software) |
| Coluna D (3) | `Autor` | `autor` (Nome do aluno) |
| Coluna E (4) | `URL` | `video_url` (Link do YouTube) |

> Exemplo de planilha exposta: https://docs.google.com/spreadsheets/d/e/2PACX-1vSEog8ElAjXVA3_XJ9e6OF1vRf7KA5SrR-uhhFhV1LYWbEBGQBCjf4DM3upe9w0v_c8dtZJQ_tmkXl0/pub?gid=434025022&single=true&output=csv

---

## 4. Estrutura de Pastas (Banco de Imagens e Documentos)

A organização foi padronizada para facilitar a manutenção e o acesso tanto aos enunciados individuais quanto aos cadernos de prova completos.

> As questões não devem ser divididas em mais de uma imagem.

```text
/img/
└── /banco-de-questoes/
    ├── /2017/
    │   ├── /questoes/
    │   │   ├── 09.webp
    │   │   └── 10.webp
    │   └── caderno.pdf
    │
    └── /2021/
        ├── /questoes/
        │   ├── 14.webp
        │   ├── 15.webp
        │   └── 16.webp
        └── caderno.pdf