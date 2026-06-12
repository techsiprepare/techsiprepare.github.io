# sheets-guidelines

## 1. Estrutura do Google Forms (Input de Dados)

> **Importante:** Para que o sistema funcione perfeitamente sem intervenção manual na entrada de dados, o formulário deve conter as seguintes perguntas, especificamente na ordem abaixo.

---

### **Estrutura do Formulário (Google Forms)**

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

### 2. Arquitetura do Google Planilhas

> O banco de dados relacional operará em 5 abas distintas. As fórmulas apresentadas utilizam `ARRAYFORMULA`, o que significa que **você só precisa colar o código na linha 2** de cada coluna correspondente. A planilha calculará as linhas subsequentes automaticamente, à medida que novas respostas chegarem.

#### Aba 1: `Form_Responses` (Dados Brutos)

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

#### Aba 2: `Gerenciamento_Respostas` (Hub de Triagem e Curadoria)

> **Atualização de Arquitetura:** Para evitar o desalinhamento entre os dados importados e as entradas manuais (Status, Responsável, Link Oficial), esta aba **não utiliza mais fórmulas (`ARRAYFORMULA`)**. O preenchimento das colunas de A até I é feito de forma automatizada e definitiva (hardcoded) através de **Google Apps Script**, garantindo total integridade das linhas.

Este é o seu painel de controle operacional. É aqui que você assiste aos vídeos, aprova o conteúdo e insere o link final para publicação.

* **A: `ID_Resposta` (Gerado via Script)**
Gera um ID único e imutável para a submissão, combinando o timestamp formatado com o RA do aluno (ex: `20210815_143000_123456`).
* **B: `ID_Prova` (Gerado via Script)**
Gera um ID único e imutável para a prova da questão, normalizando e combinando o `Ano da Prova` + `Curso da Prova` + `Modalidade` + `Caderno da Prova`.
* **C: `Questao_Num` (Trazido via Script)**
Número da questão preenchido no forms.
* **D: `Tipo` (Trazido via Script)**
Tipo da questão (Objetiva ou Discursiva).
* **E: `Nome Completo` (Trazido via Script)**
Nome do aluno submetido no forms.
* **F: `Assunto Principal` (Trazido via Script)**
Assunto base da questão informada.
* **G: `URL do Vídeo Original` (Trazido via Script)**
Link bruto fornecido no formulário.
* **H: `URL do Vídeo Oficial` (Input Manual)**
Coluna vazia onde você irá colar o link do vídeo final (pós-edição/revisão/publicação). O script é programado para deixar essa célula limpa e pronta para sua inserção.
* **I: `Pré-Curadoria` (Gerado via Script)**
Verificação automática de consistência de dados. O script compara a resposta submetida com as abas `Provas_Enade` e `Questoes_Enade` e retorna:
* `✅ Válido (Prova e Questão existem)`
* `❌ Prova não existe: [...]`
* `⚠️ Qst não existe: [...]`


* **J: `Status` (Input Manual)**
Coluna vazia para se preencher com regras de validação de dados: "Aprovado", "Rejeitado" ou "Em Análise".
* **K: `Responsável` (Input Manual)**
Coluna vazia para se preencher com o nome do responsável pela análise da resposta.

---

#### 🚀 Implementação da Automação (Google Apps Script)

Para habilitar essa automação de inserção de dados, utilize o script [gerenciamento-respostas.md](gerenciamento-respostas.md) em **Extensões > Apps Script**. O fluxo depende de dois métodos de uso:

1. **Gatilho (Trigger) em Tempo Real:** Configure um acionador no Apps Script para a função `processarNovaResposta(e)` com o evento **"Ao enviar formulário"**. Isso fará com que toda nova resposta caia processada na aba de gerenciamento na mesma hora.
2. **Carga Retroativa:** Execute manualmente a função `preencherRetroativo()` diretamente do editor sempre que precisar resgatar respostas antigas da `Form_Responses`. O script possui proteção integrada e **não gera registros duplicados**.

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

* **F:** `Total_Tentativas`

*Fórmula na célula F2:*
```excel
=ARRAYFORMULA(
  SE(A2:A=""; ""; 
    CONT.SES(
      Gerenciamento_Respostas!B:B; A2:A; 
      Gerenciamento_Respostas!C:C; B2:B; 
      Gerenciamento_Respostas!D:D; C2:C
    )
  )
)
```

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