# ⚙️ Processador de Propostas ECS

Este é um aplicativo web desenvolvido para padronizar e processar planilhas de propostas de diferentes sistemas financeiros, convertendo-as em um formato unificado pronto para importação.

## ✨ Visão Geral

O objetivo principal desta ferramenta é automatizar o trabalho manual de conversão de planilhas. Cada sistema financeiro (banco, correspondente, etc.) possui um layout de exportação diferente. O Processador de Propostas ECS lê o arquivo original de um sistema específico, aplica um conjunto de regras de negócio pré-definidas (mapeamento, formatação, filtros) e gera um novo arquivo Excel (`.xlsx`) em um formato padrão chamado "WORKBANK".

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes de UI:** [ShadCN/UI](https://ui.shadcn.com/)
- **Manipulação de Planilhas:** [SheetJS (XLSX)](https://sheetjs.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)

## 🏁 Como Começar

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- `npm` ou um gerenciador de pacotes compatível

### Instalação

1.  Clone o repositório para sua máquina local.
2.  Abra o terminal na pasta raiz do projeto.
3.  Instale as dependências necessárias:
    ```bash
    npm install
    ```

### Executando o Projeto

Após a instalação, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Por padrão, a aplicação estará disponível em `http://localhost:9002`.

## 📖 Guia de Uso

A interface é projetada para ser simples e direta.

1.  **Tela Inicial:** Na página principal, você verá uma lista de sistemas divididos entre "Ativos" e "Pendentes".
2.  **Seleção do Sistema:** Clique no botão correspondente ao sistema do qual você tem a planilha (ex: V8DIGITAL, UNNO, etc.).
3.  **Upload da Planilha:** Na página do sistema, arraste e solte o arquivo Excel (`.xls`, `.xlsx`) na área de upload ou clique para selecioná-lo.
4.  **Processamento:** O sistema processará o arquivo automaticamente. Uma barra de progresso será exibida.
5.  **Download:** Se o processamento for bem-sucedido, um botão de download aparecerá. Clique nele para baixar o arquivo `WORKBANK` padronizado. Em caso de erro, uma mensagem descritiva será exibida.
6.  **Dashboard:** Acesse o `Dashboard` pela página inicial para visualizar o histórico de todos os arquivos processados, com filtros por data e gráficos de utilização.

---

## 🛠️ Guia do Desenvolvedor

Esta seção detalha o status de implementação de cada sistema e como adicionar suporte para novos sistemas.

### Status dos Sistemas

A tabela abaixo mostra quais sistemas já possuem lógica de processamento implementada no arquivo `src/app/actions.ts`.

| Sistema         | Status          | Implementado? |
| ----------------- | --------------- | ------------- |
| **V8DIGITAL**     | ✅ Ativo         | Sim           |
| **UNNO**          | ✅ Ativo         | Sim           |
| **PAN**           | ✅ Ativo         | Sim           |
| **LEV**           | ✅ Ativo         | Sim           |
| **BRB-INCONTA**   | ✅ Ativo         | Sim           |
| **GLM-CREFISACP** | ✅ Ativo         | Sim           |
| **QUERO+**        | ✅ Ativo         | Sim           |
| **QUALIBANKING**  | ✅ Ativo         | Sim           |
| **NEOCREDITO**    | ✅ Ativo         | Sim           |
| FACTA             | ❌ Pendente      | Não           |
| TOTALCASH         | ❌ Pendente      | Não           |
| 2TECH             | ❌ Pendente      | Não           |

### Adicionando um Novo Sistema

Para adicionar a lógica de um novo sistema (ex: "FACTA"), siga os passos abaixo. O principal arquivo a ser modificado é o `src/app/actions.ts`.

1.  **Crie a Página do Sistema:**
    - Vá para a pasta `src/app/`.
    - Duplique um arquivo de página existente (ex: `src/app/facta/page.tsx`).
    - Renomeie o arquivo e ajuste o título e a `prop` `system` no componente `<EcsDataProcessor />`.

2.  **Defina os Campos de Entrada em `actions.ts`:**
    - No topo de `src/app/actions.ts`, declare um array com os nomes das colunas do arquivo de entrada do novo sistema.
    ```typescript
    const FACTA_INPUT_FIELDS = [
      "ColunaExemplo1",
      "ColunaExemplo2",
      // ...etc
    ];
    ```

3.  **Crie a Função de Processamento em `actions.ts`:**
    - Crie uma nova função `processFacta(data: any[]): any[]`. Use as funções existentes como referência.
    - Mapeie cada coluna da planilha de origem para a coluna correspondente do formato `WORKBANK`.
    - Aplique formatações (`formatDate`, `formatCurrency`) e regras de negócio necessárias.
    ```typescript
    function processFacta(data: any[]): any[] {
      return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};
        
        // Mapeamento e lógica aqui
        newRow['NUM_BANCO'] = 123;
        newRow['NOM_BANCO'] = 'FACTA';
        newRow['NUM_PROPOSTA'] = sourceRow['ColunaExemplo1'];
        newRow['VAL_BRUTO'] = formatCurrency(sourceRow['Valor Total']);
        // ...etc
        
        return newRow;
      });
    }
    ```

4.  **Integre no Processador Principal em `actions.ts`:**
    - Adicione um `case` para o novo sistema dentro da função `processExcelFile`.
    ```typescript
    // Dentro de processExcelFile, no switch(system)
    case 'FACTA':
        processedData = processFacta(filteredData);
        outputFields = V8DIGITAL_OUTPUT_FIELDS; // Ou um output específico se necessário
        break;
    ```

5.  **Ative o Sistema na Tela Inicial:**
    - No arquivo `src/app/page.tsx`, localize o sistema na lista `systems`.
    - Mude a propriedade `active` para `true`. Isso moverá o botão para a seção "Sistemas Ativos".

### Estrutura de Arquivos Relevantes

-   `src/app/actions.ts`: **Coração do projeto.** Contém toda a lógica de processamento e transformação de dados para cada sistema.
-   `src/app/[system]/page.tsx`: Páginas individuais para cada sistema, que renderizam o componente de processamento.
-   `src/app/page.tsx`: A página inicial de seleção de sistemas.
-   `src/app/dashboard/page.tsx`: A página que exibe o histórico de processamentos.
-   `src/components/ecs-data-processor.tsx`: O componente React reutilizável que lida com o estado da interface de upload (idle, processing, success, error).
-   `src/components/file-upload.tsx`: O componente que gerencia a área de arrastar e soltar (drag-and-drop).
-   `src/hooks/use-local-storage.ts`: Hook customizado para persistir o histórico do dashboard no navegador.
