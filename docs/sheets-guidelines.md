# sheets-guidelines

### 1. Estrutura do Google Forms (Input de Dados)

Para que o sistema funcione perfeitamente sem intervenção manual na entrada de dados, o formulário deve conter as seguintes perguntas, preferencialmente na ordem abaixo.

* **Email Institucional:** Resposta curta.
* **Nome Completo:** Resposta curta.
* **RA (Registro Acadêmico):** Resposta curta (com validação de dados para aceitar apenas números).
* **Período:** Resposta curta (com validação de dados para aceitar apenas números).
* **Curso da Prova:** Lista suspensa.
* **Ano da Prova:** Número (ex: 2021, com validação de dados para aceitar apenas números).
* **Caderno da Prova:** Opção "Caderno Único" ou "Outro: ".
* **Número da Questão:** Resposta curta (com validação de dados para aceitar apenas números).
* **Tipo de Questão:** Lista suspensa obrigatória contendo apenas as opções **Objetiva** e **Discursiva**.
* **Assunto Principal:** Resposta curta (ex: Programação Orientada a Objetos).
* **URL do Vídeo:** Resposta curta.
* **Termo de Consentimento:** Caixa de seleção (obrigatória).

---

### 2. Arquitetura do Google Planilhas

O banco de dados relacional operará em 5 abas distintas. As fórmulas apresentadas utilizam `ARRAYFORMULA`, o que significa que **você só precisa colar o código na linha 2** de cada coluna correspondente. A planilha calculará as linhas subsequentes automaticamente, à medida que novas respostas chegarem.

#### Aba 1: `Form_Responses` (Dados Brutos)

Esta aba é muito importante e servirá estritamente como *Data Lake*. Ela é gerada e alimentada automaticamente pelo Google Forms. Não renomeie as colunas, não adicione colunas manuais e não altere a ordem.

* **A:** Carimbo de data/hora
* **B:** Endereço de e-mail
* **C:** Nome Completo
* **D:** RA
* **E:** Período
* **F:** Curso da Prova
* **G:** Ano da Prova
* **H:** Caderno da Prova
* **I:** Número da Questão
* **J:** Tipo de Questão *(Objetiva ou Discursiva)*
* **K:** Assunto Principal
* **L:** URL do Vídeo (Original)
* **M:** Termo de Consentimento

---

#### Aba 2: `Gerenciamento_Respostas` (Hub de Triagem e Curadoria)

Este é o seu painel de controle operacional. É aqui que você assiste aos vídeos, aprova o conteúdo e insere o link final para publicação.

* **A: `ID_Resposta` (Chave Primária)**
Gera um ID único e imutável para a submissão, combinando o timestamp com o RA do aluno.

*Fórmula na célula A2:*

```excel
=ARRAYFORMULA(REGEXREPLACE(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SE(Form_Responses!A2:A = ""; ""; Form_Responses!G2:G & "_" & MAIÚSCULA(Form_Responses!F2:F) & "_" & SE(Form_Responses!H2:H="Caderno Único"; "UNICO"; "OUTROVALOR") & "_" & MAIÚSCULA(Form_Responses!J2:J) & "_Q" & Form_Responses!I2:I); "Ç"; "C"); "ç"; "c"); "Á"; "A"); "À"; "A"); "Â"; "A"); "Ã"; "A"); "É"; "E"); "Ê"; "E"); "Í"; "I"); "Ì"; "I"); "Î"; "I"); "Ó"; "O"); "Ò"; "O"); "Ô"; "O"); "Õ"; "O"); "Ú"; "U"); "Ù"; "U"); "Û"; "U"); "Ç"; "C"); "ç"; "c"); "á"; "a"); "[^A-Za-z0-9_]"; ""))
```


* **B: `ID_Questao` (Chave Estrangeira - Atualizada)**
Cria a chave de conexão com o banco de questões, agora incorporando o tipo da questão. O formato gerado será algo como `2021_SI_G1_OBJETIVA_Q15`.

*Fórmula na célula B2:*
```excel
=ARRAYFORMULA(REGEXREPLACE(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SE(Form_Responses!A2:A = ""; ""; Form_Responses!G2:G & "_" & SUBSTITUIR(MAIÚSCULA(Form_Responses!F2:F);" ";"_") & "_" & SE(Form_Responses!H2:H="Caderno Único"; "UNICO"; "OUTROVALOR") & "_" & MAIÚSCULA(Form_Responses!J2:J) & "_Q" & Form_Responses!I2:I); "Ç"; "C"); "ç"; "c"); "Á"; "A"); "À"; "A"); "Â"; "A"); "Ã"; "A"); "É"; "E"); "Ê"; "E"); "Í"; "I"); "Ì"; "I"); "Î"; "I"); "Ó"; "O"); "Ò"; "O"); "Ô"; "O"); "Õ"; "O"); "Ú"; "U"); "Ù"; "U"); "Û"; "U"); "Ç"; "C"); "ç"; "c"); "á"; "a"); "[^A-Za-z0-9_]"; ""))
```

* **C: `Nome Completo`**

*Fórmula na célula C2:*
```excel
=ARRAYFORMULA(Form_Responses!C2:C)

```



* **D: `Assunto Principal`**
*(Note que agora puxa da coluna K do Forms)*

*Fórmula na célula D2:*
```excel
=ARRAYFORMULA(Form_Responses!K2:K)
```

* **E: `URL do Vídeo Original`**

*Fórmula na célula E2:*
```excel
=ARRAYFORMULA(Form_Responses!L2:L)

```
* **F: `Status` (Input Manual)**
Coluna vazia para você preencher com regras de validação de dados: "Aprovado", "Rejeitado" ou "Em Análise".

* **G: `URL do Vídeo Oficial` (Input Manual)**
Coluna vazia onde você irá colar o link do vídeo final (pós-edição/revisão/publicação).

---

#### Aba 3: `Provas_Enade` (Metadados Raiz)
Tabela mãe estruturada manualmente, mantida estática como catálogo das provas.

*   **A:** `ID_Prova` (Chave Primária - ANO/CURSO/XXXX)
*   **B:** `Ano`
*   **C:** `Area_Prova`
*   **D:** `Numero_Caderno`
*   **E:** `Link_Prova` (PDF do Inep)

---

#### Aba 4: `Questoes_Enade` (Repositório Relacional)
Esta aba detalha cada questão da prova. Ela deve ser completamente gerada pelo enade-searcher, garantindo o *match* perfeito com a aba de Gerenciamento.

* **A:** `ID_Questao`

* **B:** `ID_Prova`

* **C:** `Questao_Num`

* **D:** `Tipo`

* **F:** `Pagina_PDF`

---

#### Aba 5: `Respostas_Aprovadas` (View / API de Consumo Público)
Esta é a aba final e exclusiva de consumo externo. Ninguém editará esta aba; ela se auto-constrói utilizando uma instrução do tipo SQL via Google Query Language. 

Ela espelha os dados do hub de gerenciamento, extraindo apenas as informações estritamente necessárias, e **somente** se a resposta passou pela curadoria e possui um link oficial inserido.

* **A1: O Motor de Busca (Query)**
Cole a fórmula abaixo **exclusivamente na célula A1**. Ela criará os cabeçalhos das colunas automaticamente e preencherá todas as linhas abaixo dela.

```excel
=QUERY(Gerenciamento_Respostas!B:G; "SELECT B, C, D, G WHERE F = 'Approved' AND G IS NOT NULL LABEL B 'ID_Questao', C 'Nome_Aluno', D 'Assunto', G 'URL_Video_Oficial'")

```

### Resumo do Fluxo Lógico (Para Testes)

Quando você testar, o comportamento esperado é:

1. O aluno preenche o form informando que fez a questão `15`, `Objetiva`, do caderno `G1` de `SI` em `2021`.
2. A `Gerenciamento_Respostas` gera a chave: `2021_SI_G1_OBJETIVA_Q15`.
3. Você insere o status **"Aprovado"** e cola o link do YouTube na coluna G.
4. A aba `Respostas_Aprovadas` detecta imediatamente a aprovação e renderiza o aluno, assunto e link oficial na lista limpa.