# TechSI Prepare | IFMG

O TechSI Prepare é um ecossistema focado na resolução colaborativa de questões do ENADE para estudantes de Sistemas de Informação. O objetivo do projeto é construir uma biblioteca de resoluções em vídeo, permitindo aos alunos do IFMG o aprendizado ativo e o cômputo de horas de extensão.

## Arquitetura do Frontend e Fluxo (UX/UI)

A interface da plataforma foi desenhada como uma *Single Page Application* (SPA). O roteamento de páginas é capturado e gerenciado diretamente pela hash da URL.

A navegação é dividida em três telas principais:

* **Tela Inicial (`#home`):** Apresenta o foco, o objetivo e o público-alvo do projeto para estudantes matriculados.

* **Tela de Acervo (`#acervo`):** Responsável por processar dinamicamente os grids de resolução. Permite aplicar filtros cruzados de curso, tipo (objetiva/discursiva), ano da prova e status atual (resolvido ou em aberto). A listagem possui recursos de paginação exibindo 12 itens por página. Questões já avaliadas e resolvidas exibem o player em *iframe* com a resolução no YouTube, e indicam o nome do autor do vídeo. Questões em aberto exibem a capa da questão borrada e um botão direcionando à etapa de gravação.

* **Tela de Instruções (`#instrucoes`):** Rota que apresenta o passo a passo para o estudante submeter um material ao acervo. Contém alertas sobre o funcionamento por ordem de chegada e dispõe do botão oficial que encaminha o usuário ao formulário de envio de dados.

## Backend e Banco de Dados Relacional (Google Sheets)

O sistema atua sem um backend clássico, utilizando o consumo estruturado de 3 URLs do formato CSV fornecidas pelo Google Sheets (`URL_PROVAS`, `URL_QUESTOES` e `URL_RESPOSTAS`).

A arquitetura oficial de tratamento e armazenamento opera através de 5 abas relacionais na planilha principal:

* **`Form_Responses`:** *Data Lake* primário com os dados brutos e carimbos de envio gerados pelo formulário de inscrições dos alunos.

* **`Gerenciamento_Respostas`:** Hub de curadoria técnica do projeto. Esta aba gera a *Chave Primária* da resposta automaticamente utilizando Regex, além de compor uma chave estrangeira padronizada para vincular o metadado do acervo ao aluno. Esta é a área para analisar se o envio foi rejeitado ou "Aprovado" e para fornecer o link oficial validado.

* **`Provas_Enade`:** Catálogo contendo as chaves primárias das avaliações e metadados, como link do Inep, área e ano de publicação.

* **`Questoes_Enade`:** Repositório relacionando o detalhamento técnico e a numeração das questões aos cadernos do repositório de provas.

* **`Respostas_Aprovadas`:** View gerada por meio da linguagem de Query nativa do Google (`QUERY SELECT`). Esta aba contém um filtro restritivo de publicidade, renderizando unicamente os 4 dados requeridos das submissões marcadas como 'Aprovadas', garantindo a segurança como a única aba extraída publicamente pela API.

> Para melhor detalhamento da estrutura do forms e da planilha, conferir em [docs/sheets-guidelines.md](docs/sheets-guidelines.md)

## Processamento e Componentes Dinâmicos

Durante o disparo inicial da aplicação, as fontes de CSV passam por rotinas utilitárias para preencher o sistema:

* **Leitor de PDF Inteligente:** Se constar na base o número da página no caderno para determinada questão, a ancoragem original em PDF concatenará automaticamente uma instrução de visualização do navegador para abrir diretamente na página requerida (parâmetro `#page=`).

* **URL YouTube Sanitizer:** Tratamento nativo por Regex das *URLs* enviadas na base de respostas. Links em padrão longo (com a variável de rotação `v=`) ou atalhos mobile (`youtu.be/` e `/shorts/`) são automaticamente formatados para links passivos de `embed/` para os modais em visualização na grade do site.

* **Tags e Distinções Visuais:** Os inputs são limpos em minúsculas e comparados a termos parciais de String. Discursivas ou Questionário de percepção ganham tags estéticas separadas dentro da classe CSS do Acervo.