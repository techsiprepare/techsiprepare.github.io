# sheets-guidelines

## 1. Estrutura do Google Forms (Input de Dados)

> **Importante:** Para que o sistema funcione perfeitamente sem intervenção manual na entrada de dados, o formulário deve conter as seguintes perguntas, especificamente na ordem abaixo.

---

### Formulário 1: Submissão Principal (Google Forms)

| Campo | Tipo de Entrada | Regras / Opções Disponíveis |
| :--- | :--- | :--- |
| **Endereço de e-mail** | Coletado pelo Formulário | Deve ser ativado pelas configurações do form. |
| **Email Institucional** | Resposta curta | Validação de e-mail ativa. |
| **Nome Completo** | Resposta curta | Sem validações. |
| **Telefone (WhatsApp)** | Resposta curta | Sem validações. |
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
| **Autorização** | Upload de Arquivo | Validação: Apenas 1 arquivo PDF com no máximo 1MB de tamanho. |

---

### Formulário 2: Reenvio de Vídeo (Google Forms)

| Campo | Tipo de Entrada | Regras / Opções Disponíveis |
| --- | --- | --- |
| **Endereço de e-mail** | Coletado pelo Formulário | Ativado nas configurações. |
| **Email Institucional** | Resposta curta | Validação de e-mail ativa. |
| **Ticket** | Resposta curta | Código alfanumérico enviado ao aluno. Validado dinamicamente via Script. Permite apenas tickets cujo status na planilha esteja como "Devolvido para ajustes". |
| **URL Atualizada** | Resposta curta | Validação: URL válida do novo vídeo. |
| **Descrição** | Parágrafo | Motivo da alteração ou observações. |


### 2. Arquitetura do Google Planilhas

> O banco de dados relacional operará em 7 abas distintas. Algumas fórmulas apresentadas utilizam `ARRAYFORMULA`, o que significa que **você só precisa colar o código na linha 2** de cada coluna correspondente. A planilha calculará as linhas subsequentes automaticamente, à medida que novas respostas chegarem.

#### Aba 1: `Instruções`

Deve conter instruções de uso e referências de links importantes.

#### Aba 2: `Form_Responses` (Dados Brutos)

Esta aba é muito importante e servirá estritamente como *Data Lake*. Ela é gerada e alimentada automaticamente pelo Google Forms. Não renomeie as colunas, não adicione colunas manuais e não altere a ordem.

* **A:** Carimbo de data/hora
* **B:** Endereço de e-mail
* **C:** Email Institucional
* **D:** Nome Completo
* **E:** Telefone (WhatsApp)
* **F:** RA
* **G:** Período
* **H:** Curso da Prova
* **I:** Modalidade
* **J:** Ano da Prova
* **K:** Caderno da Prova
* **L:** Número da Questão
* **M:** Tipo de Questão
* **N:** Assunto Principal
* **O:** URL do Vídeo
* **P:** Autorização

---

#### Aba 3: `Reenvios` (Data Lake de Reenvios)

Alimentada automaticamente pelo Formulário de Reenvio.

* **A:** Carimbo de data/hora
* **B:** Endereço de e-mail
* **C:** Email institucional
* **D:** Ticket
* **E:** URL Atualizada
* **F:** Descrição

---

#### Aba 4: `Gerenciamento_Respostas` (Hub de Triagem e Curadoria)

> **Arquitetura:** O preenchimento das colunas de A até H é feito de forma automatizada e definitiva (hardcoded) através de **Google Apps Script**, garantindo total integridade das linhas. Algumas fórmulas apresentadas utilizam `ARRAYFORMULA` para evitar retrabalho.

Este é o seu painel de controle operacional. É aqui que você assiste aos vídeos, aprova o conteúdo e insere o link final para publicação.

* **A: `ID_Resposta` (Gerado via Script)**
Gera um ID único e imutável para a submissão, combinando o timestamp formatado com o RA do aluno (ex: `20210815_143000_1234567`).
* **B: `Ticket` (Gerado via Script)**
Gera um código opaco e seguro gerado via Hash (SHA-256 com chave secreta)
* **C: `ID_Prova` (Gerado via Script)**
Gera um ID único e imutável para a prova da questão, normalizando e combinando o `Ano da Prova` + `Curso da Prova` + `Modalidade` + `Caderno da Prova`.
* **D: `Questao_Num` (Trazido via Script)**
Número da questão preenchido no forms.
* **E: `Tipo` (Trazido via Script)**
Tipo da questão (Objetiva ou Discursiva).
* **F: `Nome Completo` (Trazido via Script)**
Nome do aluno submetido no forms.
* **G: `Assunto Principal` (Trazido via Script)**
Assunto base da questão informada.
* **H: `URL do Vídeo Original` (Trazido via Script)**
Link bruto fornecido no formulário.
* **I: `URL Atualizada` (ArrayFormula Manual)**
Link bruto trazido da aba Reenvios (mais recente por Ticket)

*Fórmula na célula I2:*
```excel
=ARRAYFORMULA(SE(B2:B=""; ""; PROCX(B2:B; Reenvios!D:D; Reenvios!E:E; ""; 0; -1)))
```

* **J: `URL do Vídeo Oficial` (Input Manual)**
Coluna vazia onde você irá colar o link do vídeo final (pós-edição/revisão/publicação). O script é programado para deixar essa célula limpa e pronta para sua inserção.
* **K: `Pré-Curadoria` (ArrayFormula Manual)**
Verificação automática de consistência de dados. O script compara a resposta submetida com as abas `Provas_Enade` e `Questoes_Enade` e retorna:
* `✅ Válido (Prova e Questão existem)`
* `❌ Prova não existe: [...]`
* `⚠️ Qst não existe: [...]`

*Fórmula na célula K2:*
```excel
=ARRAYFORMULA(SE(A2:A=""; ""; 
  SE(ÉERROS(CORRESP(ARRUMAR(C2:C); ARRUMAR(Provas_Enade!A:A); 0)); "❌ Prova não existe: [" & C2:C & "]";
    SE(CONT.SE(ARRUMAR(Questoes_Enade!A:A) & "_" & ARRUMAR(Questoes_Enade!B:B) & "_" & MAIÚSCULA(ARRUMAR(Questoes_Enade!C:C)); ARRUMAR(C2:C) & "_" & ARRUMAR(D2:D) & "_" & MAIÚSCULA(ARRUMAR(E2:E))) = 0; "⚠️ Qst não existe: [" & C2:C & "_" & D2:D & "_" & E2:E & "]"; "✅ Válido (Prova e Questão existem)")
  )
))
```

* **L: `Status` (Input Manual)**
Coluna vazia para se preencher com regras de validação de dados: "Aprovado", "Rejeitado" ou "Em Análise".
* **M: `Motivo` (Input Manual)**
Coluna vazia para se preencher com o motivo para justificar o status definido.
* **N: `Responsável` (Input Manual)**
Coluna vazia para se preencher com o nome do responsável pela análise da resposta.
* **O: `Ver_Questão_Site` (ArrayFormula Manual)**
Link da questão no site para visualizar.

*Fórmula na célula O2:*
```excel
=ARRAYFORMULA(SE(C2:C=""; ""; SE(K2:K="✅ Válido (Prova e Questão existem)"; HIPERLINK("https://techsiprepare.github.io/#visualizar?prova=" & C2:C & "&questao=" & D2:D & "-" & PRI.MAIÚSCULA(E2:E); "🌐 Ver questão"); "❌ Inexistente")))
```

---

#### 🚀 Implementação da Automação (Google Apps Script)

Para habilitar a automação completa de inserção, geração de tickets e reanálise, utilize o código [apps-scripts.md](apps-scripts.md) nas **Extensões > Apps Script**. O ecossistema depende das seguintes rotinas e acionadores:

1. **Configuração de Chave Secreta (`.env`):**
* Em **Configurações do projeto** (⚙️) > **Propriedades do script**, adicione a chave `TICKET_PEPPER_SECRET` com o valor secreto do seu projeto. Ela é usada pelo algoritmo SHA-256 para gerar os tickets dos alunos com segurança.

2. **Gatilho (Trigger) para Submissão Principal:**
* Crie um acionador para a função `processarNovaResposta(e)` com o evento **"Ao enviar formulário"** (vinculado ao formulário principal). Toda nova resposta será inserida na aba `Gerenciamento_Respostas` com seu ID único e seu Ticket já calculados.

3. **Gatilho (Trigger) para Formulário de Reenvio:**
* Crie um acionador para a função `aoEnviarReenvio(e)` com o evento **"Ao enviar formulário"** (vinculado ao formulário de reenvio). Ao receber um Ticket válido com status *"Devolvido para ajustes"*, a função altera o status na `Gerenciamento_Respostas` para **"Pronto p/ Reanálise"** e executa automaticamente `atualizarValidacaoFormularioReenvio()` para remover esse Ticket da lista de permitidos no Formulário 2.

4. **Sincronização Dinâmica do Formulário (`atualizarValidacaoFormularioReenvio`):**
* Função responsável por atualizar a regra de validação Regex do campo "Ticket" no Formulário 2.
* **Gatilho (Trigger):** Crie um acionador vinculado à planilha para o evento **"Ao alterar"** (*On change*). Isso garante que, quando um avaliador mudar manualmente o status de uma resposta para *"Devolvido para ajustes"*, o formulário de reenvio liberará a entrada daquele Ticket imediatamente.

5. **Rotinas Retroativas e de Manutenção:**
* **`preencherRetroativo()`:** Executada manualmente do editor para resgatar respostas antigas da `Form_Responses` que ainda não foram para a `Gerenciamento_Respostas` (possui proteção contra duplicidade).

---

#### Aba 5: `Provas_Enade` (Metadados Raiz)
Tabela mãe estruturada manualmente, mantida estática como catálogo das provas.

*   **A: (ArrayFormula Manual)** `ID_Prova` (`Ano da Prova` + `Curso da Prova` + `Modalidade` + `Caderno da Prova`)

*Fórmula na célula A2:*
```excel
=ARRAYFORMULA(SE(B2:B="";"";REGEXREPLACE(REGEXREPLACE(REGEXREPLACE(REGEXREPLACE(REGEXREPLACE(REGEXREPLACE(REGEXREPLACE(REGEXREPLACE(MAIÚSCULA(B2:B&"_"&C2:C&"_"&D2:D&"_"&SUBSTITUIR(MAIÚSCULA(E2:E);"CADERNO";""));"[ÁÀÂÃÄ]";"A");"[ÉÈÊË]";"E");"[ÍÌÎÏ]";"I");"[ÓÒÔÕÖ]";"O");"[ÚÙÛÜ]";"U");"[Ç]";"C");"[Ñ]";"N");"[^A-Z0-9_]";"")))
```

*   **B:** `Ano`
*   **C:** `Area_Prova`
*   **D:** `Modalidade`
*   **E:** `Numero_Caderno`
*   **F:** `Link_Prova`

---

#### Aba 6: `Questoes_Enade` (Repositório Relacional)
Esta aba detalha cada questão da prova. Ela deve ser completamente gerada pelo enade-searcher, garantindo o *match* perfeito com a aba de Gerenciamento.

* **A:** `ID_Prova` (`Ano da Prova` + `Curso da Prova` + `Modalidade` + `Caderno da Prova`)

* **B:** `Questao_Num`

* **C:** `Tipo`

* **D:** `Pagina_PDF`

* **E:** `Bloquear`

* **F:** `Total_Tentativas`

*Fórmula na célula F2:*
```excel
=ARRAYFORMULA(
  SE(A2:A=""; ""; 
    CONT.SES(
      Gerenciamento_Respostas!C:C; A2:A; 
      Gerenciamento_Respostas!D:D; B2:B; 
      Gerenciamento_Respostas!E:E; C2:C;
      Gerenciamento_Respostas!L:L; "<>Rejeitado"
    )
  )
)
```

---

#### Aba 7: `Respostas_Aprovadas`
Ninguém editará esta aba; ela se auto-constrói utilizando uma instrução do tipo SQL via Google Query Language. 

Ela espelha os dados do hub de gerenciamento, extraindo apenas as informações estritamente necessárias, e **somente** se a resposta passou pela curadoria e possui um link oficial inserido.

* **A1: O Motor de Busca (Query)**
Cole a fórmula abaixo **exclusivamente na célula A1**. Ela criará os cabeçalhos das colunas automaticamente e preencherá todas as linhas abaixo dela.

```excel
=QUERY(Gerenciamento_Respostas!C:L; "SELECT C, D, E, F, G, J WHERE L = 'Aprovado' AND J IS NOT NULL LABEL C 'ID_Prova', D 'Questao_Num', E 'Tipo', F 'Nome_Aluno', G 'Assunto', J 'URL_Video_Oficial'")
```

---

### **Resumo do Fluxo Lógico (Para Testes)**

Quando você testar o ecossistema, o comportamento esperado e as etapas do fluxo serão:

1. **Submissão Principal:**
* O aluno preenche o **Formulário 1** informando os dados da questão (ex: questão `15`, `Objetiva`, do caderno `Caderno Único` de `Ciência da Computação` em `2021`) e o link do vídeo original.
* O script processa a submissão, cria uma nova linha na aba `Gerenciamento_Respostas`, gera a chave `ID_Prova` (ex: `2021_CIENCIADACOMPUTACAO_UNICO`), preenche os dados da submissão e calcula um **Ticket** único e imutável para o aluno.

2. **Análise Inicial & Devolução para Ajustes:**
* O avaliador assiste ao vídeo na `Gerenciamento_Respostas` e identifica a necessidade de correções.
* O avaliador insere o status **"Devolvido para ajustes"** e adiciona o motivo na coluna `Motivo`.
* O evento *On Change* dispara a função `atualizarValidacaoFormularioReenvio()`, liberando aquele Ticket para digitação no Formulário 2.
* Envia-se um e-mail ao aluno contendo as considerações, o link do Formulário de Reenvio e o Ticket correspondente.

3. **Reenvio pelo Aluno:**
* O aluno acessa o **Formulário 2 (Reenvio)** e digita seu **Ticket**. Caso o ticket não esteja no status *"Devolvido para ajustes"*, o formulário impede o envio na hora.
* Ao enviar, a nova resposta entra na aba `Reenvios`. O gatilho do script `aoEnviarReenvio(e)` identifica a chegada do Ticket e:
* Atualiza a coluna `URL Atualizada` da aba `Gerenciamento_Respostas`.
* Altera o campo `Status` na `Gerenciamento_Respostas` de *"Devolvido para ajustes"* para **"Pronto p/ Reanálise"**.
* Executa a função `atualizarValidacaoFormularioReenvio()`, removendo imediatamente esse Ticket do formulário de reenvio para evitar submissões duplicadas.

4. **Reanálise & Publicação:**
* O avaliador revisa a nova URL trazida para a aba de gerenciamento.
* Se aprovado, altera o status para **"Aprovado"** e insere o link final na coluna `URL do Vídeo Oficial`.
* A aba `Respostas_Aprovadas` detecta imediatamente a aprovação e renderiza automaticamente apenas as informações consolidadas da resposta.