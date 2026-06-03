# sheets-guidelines

## 1. Estrutura do Google Forms (Input de Dados)

> **Importante:** Para que o sistema funcione perfeitamente sem intervenção manual na entrada de dados, o formulário deve conter as seguintes perguntas, especificamente na ordem abaixo.

---

### **Estrutura do Formulário (Google Forms)**

| Campo | Tipo de Entrada | Regras / Opções Disponíveis |
| :--- | :--- | :--- |
| **Email Institucional** | Resposta curta | Validação de e-mail ativa. |
| **Nome Completo** | Resposta curta | Sem validações. |
| **RA (Registro Acadêmico)** | Resposta curta | Validação: Apenas números. |
| **Período** | Resposta curta | Validação: Apenas números. |
| **Curso da Prova** | Lista suspensa | • Ciência da Computação<br>• Computação<br>• Tecnologia em Análise e Desenvolvimento de Sistemas<br>• Tecnologia em Redes de Computadores<br>• Engenharia de Computação<br>• Engenharia de Controle e Automação<br>• Sistemas de Informação<br>• Tecnologia em Gestão da TI |
| **Modalidade** | Múltipla escolha | Bacharelado, Licenciatura ou Tecnólogo. |
| **Ano da Prova** | Número | Ex: `2021` (Validação: Apenas números). |
| **Caderno da Prova** | Múltipla escolha | Caderno Único ou Outro (texto livre). |
| **Número da Questão** | Resposta curta | Validação: Apenas números. |
| **Tipo de Questão** | Múltipla escolha | Objetiva ou Discursiva. |
| **Assunto Principal** | Resposta curta | Texto livre (ex: *Programação Orientada a Objetos*). |
| **URL do Vídeo** | Resposta curta | Validação: Deve ser uma URL válida. |

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
=ARRAYFORMULA(SE(Form_Responses!A2:A=""; ""; Form_Responses!H2:H & "_" & SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(MAIÚSCULA(Form_Responses!F2:F); "Á"; "A"); "À"; "A"); "Ã"; "A"); "Â"; "A"); "É"; "E"); "Ê"; "E"); "Í"; "I"); "Ó"; "O"); "Ô"; "O"); "Ú"; "U"); "Ç"; "C"); " "; "") & "_" & SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(SUBSTITUIR(MAIÚSCULA(Form_Responses!G2:G); "Á"; "A"); "À"; "A"); "Ã"; "A"); "Â"; "A"); "É"; "E"); "Ê"; "E"); "Í"; "I"); "Ó"; "O"); "Ô"; "O"); "Ú"; "U"); "Ç"; "C"); " "; ""); "𝖢𝖧𝖤𝖢𝖪"; "") & "_" & SE(Form_Responses!I2:I="Caderno Único"; "UNICO"; MAIÚSCULA(Form_Responses!I2:I))))
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

* **H: `URL do Vídeo Oficial` (Input Manual)**
Coluna vazia onde você irá colar o link do vídeo final (pós-edição/revisão/publicação).

* **I: `Pré-Curadoria`**
Coluna com a única responsabilidade de conferir se a Prova e a Questão informadas pelo aluno existe na planilha. Serve também para a ajudar a identificar possíveis erros de digitação.

*Fórmula na célula J2:*
```excel
=ARRAYFORMULA(SE(A2:A=""; ""; 
  SE(ÉERROS(CORRESP(ARRUMAR(B2:B); ARRUMAR(Provas_Enade!A:A); 0)); "❌ Prova não existe: [" & B2:B & "]";
    SE(CONT.SE(ARRUMAR(Questoes_Enade!A:A) & "_" & ARRUMAR(Questoes_Enade!B:B) & "_" & MAIÚSCULA(ARRUMAR(Questoes_Enade!C:C)); ARRUMAR(B2:B) & "_" & ARRUMAR(C2:C) & "_" & MAIÚSCULA(ARRUMAR(D2:D))) = 0; "⚠️ Qst não existe: [" & B2:B & "_" & C2:C & "_" & D2:D & "]"; "✅ Válido (Prova e Questão existem)")
  )
))
```

* **J: `Status` (Input Manual)**
Coluna vazia para se preencher com regras de validação de dados: "Aprovado", "Rejeitado" ou "Em Análise".

* **K: `Responsável` (Input Manual)**
Coluna vazia para se preencher com o nome do responsável pela análise da resposta.


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

* **E:** `Bloquear`

--

#### Aba 5: `Respostas_Aprovadas`
Ninguém editará esta aba; ela se auto-constrói utilizando uma instrução do tipo SQL via Google Query Language. 

Ela espelha os dados do hub de gerenciamento, extraindo apenas as informações estritamente necessárias, e **somente** se a resposta passou pela curadoria e possui um link oficial inserido.

* **A1: O Motor de Busca (Query)**
Cole a fórmula abaixo **exclusivamente na célula A1**. Ela criará os cabeçalhos das colunas automaticamente e preencherá todas as linhas abaixo dela.

```excel
=QUERY(Gerenciamento_Respostas!B:J; "SELECT B, C, D, E, F, H WHERE J = 'Aprovado' AND H IS NOT NULL LABEL B 'ID_Prova', C 'Questao_Num', D 'Tipo', E 'Nome_Aluno', F 'Assunto', H 'URL_Video_Oficial'")
```

### Resumo do Fluxo Lógico (Para Testes)

Quando você testar, o comportamento esperado é:

1. O aluno preenche o form informando que fez a questão `15`, `Objetiva`, do caderno `Caderno Único` de `Ciência da Computação` em `2021`.
2. A `Gerenciamento_Respostas` gera a chave: `2021_CIENCIADACOMPUTACAO_UNICO` e preenche as outras colunas automaticamente.
3. Você insere o status **"Aprovado"** e cola o link do YouTube na coluna I.
4. A aba `Respostas_Aprovadas` detecta imediatamente a aprovação e renderiza apenas as informações necessárias da resposta. 