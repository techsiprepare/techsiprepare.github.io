# sheets-guidelines

## 1. Estrutura do Google Forms (Input de Dados)

> **Importante:** Para que o sistema funcione perfeitamente sem intervenção manual na entrada de dados, o formulário deve conter as seguintes perguntas, especificamente na ordem abaixo.

---

### **Seção 1**

* **Email Institucional:** Resposta curta. (com validação de email)
* **Nome Completo:** Resposta curta.
* **RA (Registro Acadêmico):** Resposta curta (com validação de dados para aceitar apenas números).
* **Período:** Resposta curta (com validação de dados para aceitar apenas números).

---

### **Seção 2**

* **Curso da Prova:** Lista suspensa.

| Nome do Curso para a Lista Suspensa |
| --- |
| Ciência da Computação |
| Computação |
| Tecnologia em Analise e Desenvolvimento de Sistemas |
| Tecnologia em Redes de Computadores |
| Engenharia de Computação |
| Engenharia de Controle e Automação |
| Sistemas de Informação |
| Tecnologia em Gestão da Tecnologia da Informação |

* **Modalidade:** Multipla escolha:

| Opções para múltipla escolha |
| --- |
| Bacharelado |
| Licenciatura |
| Tecnólogo |

* **Ano da Prova:** Número (ex: 2021, com validação de dados para aceitar apenas números).
* **Caderno da Prova:** Múltipla escolha:

| Opções para múltipla escolha |
| --- |
| Caderno Único |
| Outro: (texto) |

* **Número da Questão:** Resposta curta (com validação de dados para aceitar apenas números).
* **Tipo de Questão:** Múltipla escolha:

| Opções para múltipla escolha |
| --- |
| Objetiva |
| Discursiva |

* **Assunto Principal:** Resposta curta (ex: Programação Orientada a Objetos).
* **URL do Vídeo:** Resposta curta (com validação para URL).
* **Termo de Consentimento:** Caixa de seleção (obrigatória).

---

### 2. Arquitetura do Google Planilhas

> O banco de dados relacional operará em 5 abas distintas. As fórmulas apresentadas utilizam `ARRAYFORMULA`, o que significa que **você só precisa colar o código na linha 2** de cada coluna correspondente. A planilha calculará as linhas subsequentes automaticamente, à medida que novas respostas chegarem.

#### Aba 1: `Form_Responses` (Dados Brutos)

Esta aba é muito importante e servirá estritamente como *Data Lake*. Ela é gerada e alimentada automaticamente pelo Google Forms. Não renomeie as colunas, não adicione colunas manuais e não altere a ordem.

* **A:** Carimbo de data/hora
* **B:** Email Institucional
* **C:** Nome Completo
* **D:** RA
* **E:** Período
* **F:** Curso da Prova
* **G:** Modalidade
* **H:** Ano da Prova
* **I:** Caderno da Prova
* **J:** Número da Questão
* **K:** Tipo de Questão
* **L:** Assunto Principal
* **M:** URL do Vídeo
* **N:** Termo de Consentimento

---

#### Aba 2: `Gerenciamento_Respostas` (Hub de Triagem e Curadoria)

Este é o seu painel de controle operacional. É aqui que você assiste aos vídeos, aprova o conteúdo e insere o link final para publicação.

* **A: `ID_Resposta`**
Gera um ID único e imutável para a submissão, combinando o timestamp com o RA do aluno.

*Fórmula na célula A2:*

```excel
=ARRAYFORMULA(SE(Form_Responses!A2:A=""; ""; TEXTO(Form_Responses!A2:A; "YYYYMMDD_HHMMSS") & "_" & Form_Responses!D2:D))
```

* **B: `ID_Prova`**
Gera um ID único e imutável para a prova da questão, combinando o `Ano da Prova` + `Curso da Prova` + `Modalidade` + `Caderno da Prova`.

*Fórmula na célula B2:*

```excel
=ARRAYFORMULA(SE(Form_Responses!A2:A=""; ""; Form_Responses!H2:H & "_" & SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(MAIÚSCULA(Form_Responses!F2:F); "Á"; "A"); "À"; "A"); "Ã"; "A"); "Â"; "A"); "É"; "E"); "Ê"; "E"); "Í"; "I"); "Ó"; "O"); "Ô"; "O"); "Ú"; "U"); "Ç"; "C"); " "; "") & "_" & SUBSTITUIR(MAIÚSCULA(Form_Responses!G2:G); " "; "_") & "_" & SE(Form_Responses!I2:I="Caderno Único"; "UNICO"; MAIÚSCULA(Form_Responses!I2:I))))
```

* **C: `Questao_Num`**

*Fórmula na célula C2:*
```excel
=ARRAYFORMULA(SE(Form_Responses!A2:A=""; ""; Form_Responses!J2:J))
```

* **D: `Tipo`**

*Fórmula na célula D2:*
```excel
=ARRAYFORMULA(SE(Form_Responses!A2:A=""; ""; Form_Responses!K2:K))
```

* **E: `Nome Completo`**

*Fórmula na célula E2:*
```excel
=ARRAYFORMULA(Form_Responses!C2:C)
```

* **F: `Assunto Principal`**

*Fórmula na célula D2:*
```excel
=ARRAYFORMULA(Form_Responses!L2:L)
```

* **G: `URL do Vídeo Original`**

*Fórmula na célula E2:*
```excel
=ARRAYFORMULA(Form_Responses!M2:M)
```

* **H: `Status` (Input Manual)**
Coluna vazia para você preencher com regras de validação de dados: "Aprovado", "Rejeitado" ou "Em Análise".

* **I: `URL do Vídeo Oficial` (Input Manual)**
Coluna vazia onde você irá colar o link do vídeo final (pós-edição/revisão/publicação).

---

#### Aba 3: `Provas_Enade` (Metadados Raiz)
Tabela mãe estruturada manualmente, mantida estática como catálogo das provas.

*   **A:** `ID_Prova` (`Ano da Prova` + `Curso da Prova` + `Modalidade` + `Caderno da Prova`)
*   **B:** `Ano`
*   **C:** `Area_Prova`
*   **D:** `Modalidade`
*   **E:** `Numero_Caderno`
*   **F:** `Link_Prova`

---

#### Aba 4: `Questoes_Enade` (Repositório Relacional)
Esta aba detalha cada questão da prova. Ela deve ser completamente gerada pelo enade-searcher, garantindo o *match* perfeito com a aba de Gerenciamento.

* **A:** `ID_Prova` (`Ano da Prova` + `Curso da Prova` + `Modalidade` + `Caderno da Prova`)

* **B:** `Questao_Num`

* **C:** `Tipo`

* **D:** `Pagina_PDF`

--

#### Aba 5: `Respostas_Aprovadas`
Ninguém editará esta aba; ela se auto-constrói utilizando uma instrução do tipo SQL via Google Query Language. 

Ela espelha os dados do hub de gerenciamento, extraindo apenas as informações estritamente necessárias, e **somente** se a resposta passou pela curadoria e possui um link oficial inserido.

* **A1: O Motor de Busca (Query)**
Cole a fórmula abaixo **exclusivamente na célula A1**. Ela criará os cabeçalhos das colunas automaticamente e preencherá todas as linhas abaixo dela.

```excel
=QUERY(Gerenciamento_Respostas!B:I; "SELECT B, C, D, E, F, I WHERE H = 'Aprovado' AND I IS NOT NULL LABEL B 'ID_Prova', C 'Questao_Num', D 'Tipo', E 'Nome_Aluno', F 'Assunto', I 'URL_Video_Oficial'")

```

### Resumo do Fluxo Lógico (Para Testes)

Quando você testar, o comportamento esperado é:

1. O aluno preenche o form informando que fez a questão `15`, `Objetiva`, do caderno `Caderno Único` de `Ciência da Computação` em `2021`.
2. A `Gerenciamento_Respostas` gera a chave: `2021_CIENCIADACOMPUTACAO_UNICO` e preenche as outras colunas automaticamente.
3. Você insere o status **"Aprovado"** e cola o link do YouTube na coluna I.
4. A aba `Respostas_Aprovadas` detecta imediatamente a aprovação e renderiza apenas as informações necessárias da resposta. 