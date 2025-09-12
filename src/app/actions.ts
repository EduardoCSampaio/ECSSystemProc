
"use server";

import * as XLSX from "xlsx";
import { format } from "date-fns";

// =================================================================
// V8DIGITAL Configuration
// =================================================================
const V8DIGITAL_INPUT_FIELDS = [
  "NUM_PROPOSTA",
  "NUM_CONTRATO",
  "DSC_TIPO_PROPOSTA_EMPRESTIMO",
  "DSC_PRODUTO",
  "DAT_CTR_INCLUSAO",
  "DSC_SITUACAO_EMPRESTIMO",
  "DAT_EMPRESTIMO",
  "NIC_CTR_USUARIO",
  "COD_CPF_CLIENTE",
  "NOM_CLIENTE",
  "DAT_NASCIMENTO",
  "QTD_PARCELA",
  "VAL_PRESTACAO",
  "VAL_BRUTO",
  "VAL_LIQUIDO",
  "DAT_CREDITO",
  "DSC_TIPO_FORMULARIO_EMPRESTIMO",
];

const V8DIGITAL_OUTPUT_FIELDS = [
    "NUM_BANCO",
    "NOM_BANCO",
    "NUM_PROPOSTA",
    "NUM_CONTRATO",
    "DSC_TIPO_PROPOSTA_EMPRESTIMO",
    "COD_PRODUTO",
    "DSC_PRODUTO",
    "DAT_CTR_INCLUSAO",
    "DSC_SITUACAO_EMPRESTIMO",
    "DAT_EMPRESTIMO",
    "COD_EMPREGADOR",
    "DSC_CONVENIO",
    "COD_ORGAO",
    "NOM_ORGAO",
    "COD_PRODUTOR_VENDA",
    "NOM_PRODUTOR_VENDA",
    "NIC_CTR_USUARIO",
    "COD_CPF_CLIENTE",
    "NOM_CLIENTE",
    "DAT_NASCIMENTO",
    "NUM_IDENTIDADE",
    "NOM_LOGRADOURO",
    "NUM_PREDIO",
    "DSC_CMPLMNT_ENDRC",
    "NOM_BAIRRO",
    "NOM_LOCALIDADE",
    "SIG_UNIDADE_FEDERACAO",
    "COD_ENDRCMNT_PSTL",
    "NUM_TELEFONE",
    "NUM_TELEFONE_CELULAR",
    "NOM_MAE",
    "NOM_PAI",
    "NUM_BENEFICIO",
    "QTD_PARCELA",
    "VAL_PRESTACAO",
    "VAL_BRUTO",
    "VAL_SALDO_RECOMPRA",
    "VAL_SALDO_REFINANCIAMENTO",
    "VAL_LIQUIDO",
    "DAT_CREDITO",
    "DAT_CONFIRMACAO",
    "VAL_REPASSE",
    "PCL_COMISSAO",
    "VAL_COMISSAO",
    "COD_UNIDADE_EMPRESA",
    "COD_SITUACAO_EMPRESTIMO",
    "DAT_ESTORNO",
    "DSC_OBSERVACAO",
    "NUM_CPF_AGENTE",
    "NUM_OBJETO_ECT",
    "PCL_TAXA_EMPRESTIMO",
    "DSC_TIPO_FORMULARIO_EMPRESTIMO",
    "DSC_TIPO_CREDITO_EMPRESTIMO",
    "NOM_GRUPO_UNIDADE_EMPRESA",
    "COD_PROPOSTA_EMPRESTIMO",
    "COD_GRUPO_UNIDADE_EMPRESA",
    "COD_TIPO_FUNCAO",
    "COD_TIPO_PROPOSTA_EMPRESTIMO",
    "COD_LOJA_DIGITACAO",
    "VAL_SEGURO"
];


// =================================================================
// UNNO Configuration
// =================================================================
const UNNO_INPUT_FIELDS = [
  "CCB",
  "Data de Digitação",
  "Data do Desembolso",
  "CPF/CNPJ",
  "Nome",
  "Tabela",
  "Parcelas",
  "Valor Bruto",
  "Valor Líquido",
  "E-mail",
  "Status",
  "Data Nascimento",
];

// Placeholder for UNNO output fields. The user will provide the final structure later.
const UNNO_OUTPUT_FIELDS = UNNO_INPUT_FIELDS;


// =================================================================
// Generic Processing Functions
// =================================================================

type System = "V8DIGITAL" | "UNNO";

function formatCurrency(value: any): string | any {
    if (value === null || value === undefined || value === '') return '';

    let sValue = String(value).trim();
    
    // If it's already a valid number string with a comma decimal, just format it.
    if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(sValue)) {
        return sValue;
    }

    // Replace Brazilian thousand separator, then replace comma with dot for parsing
    sValue = sValue.replace(/\./g, '').replace(',', '.');

    const num = parseFloat(sValue);
    
    if (isNaN(num)) {
        return value; // Return original value if it's not a number
    }

    return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(value: any): string | any {
    if (!value) return null;

    // Handle cases where date includes time e.g., "DD/MM/YYYY HH:mm:ss"
    if (typeof value === 'string') {
        const parts = value.split(' ');
        if (parts.length > 0 && /^\d{2}\/\d{2}\/\d{4}$/.test(parts[0])) {
            return parts[0];
        }
    }
    
    if (value instanceof Date && !isNaN(value.getTime())) {
        const formattedDate = format(value, 'dd/MM/yyyy');
        if (formattedDate === '30/11/1899') return null;
        return formattedDate;
    }
    if (typeof value === 'number' && value > 0) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        if (!isNaN(date.getTime())) {
             const formattedDate = format(date, 'dd/MM/yyyy');
             if (formattedDate === '30/11/1899') return null;
             return formattedDate;
        }
    }
    return value;
}


export async function processExcelFile(
  excelDataUri: string,
  system: System
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  try {
    const base64Data = excelDataUri.split(",")[1];
    if (!base64Data) {
      throw new Error("Invalid Excel file data.");
    }
    const buffer = Buffer.from(base64Data, "base64");

    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: false });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("No worksheet found in the Excel file.");
    }
    
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    // Determine configuration based on the system
    const INPUT_FIELDS = system === 'V8DIGITAL' ? V8DIGITAL_INPUT_FIELDS : UNNO_INPUT_FIELDS;
    const OUTPUT_FIELDS = system === 'V8DIGITAL' ? V8DIGITAL_OUTPUT_FIELDS : UNNO_OUTPUT_FIELDS;

    const headers = jsonData[0] as string[];
    const headerMap: { [key: string]: number } = {};
    headers.forEach((header, index) => {
      const normalizedHeader = String(header).trim();
      if (INPUT_FIELDS.includes(normalizedHeader)) {
        headerMap[normalizedHeader] = index;
      }
    });
    
    const foundFields = Object.keys(headerMap);
    if (foundFields.length === 0) {
        throw new Error("Could not find any of the required columns in the uploaded file. Please check the column headers.");
    }

    const processedData: any[] = [];
    const dataRows = jsonData.slice(1);
    const today = format(new Date(), 'dd/MM/yyyy');

    for (const row of dataRows) {
        let rowHasData = false;
        const sourceRow: { [key: string]: any } = {};

        for (const inputField of INPUT_FIELDS) {
            if (headerMap.hasOwnProperty(inputField)) {
                const colIndex = headerMap[inputField];
                let cellValue = (row as any[])[colIndex];
                if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
                    // Specific formatting based on field name conventions
                    if ( (system === 'V8DIGITAL' && (inputField.toLowerCase().includes('valor') || inputField.startsWith('VAL_'))) || 
                         (system === 'UNNO' && (inputField.includes('Valor Bruto') || inputField.includes('Valor Líquido'))) ) 
                    {
                        sourceRow[inputField] = formatCurrency(cellValue);
                    } else if ( (system === 'V8DIGITAL' && (inputField.toLowerCase().includes('data') || inputField.startsWith('DAT_'))) || 
                                (system === 'UNNO' && (inputField.includes('Data'))) ) 
                    {
                        sourceRow[inputField] = formatDate(cellValue);
                    } else {
                        sourceRow[inputField] = cellValue;
                    }
                    rowHasData = true;
                }
            }
        }

      if (rowHasData) {
        if (system === 'V8DIGITAL') {
            const newRow: { [key: string]: any } = {};
            newRow['NUM_BANCO'] = 17;
            newRow['NOM_BANCO'] = 'V8DIGITAL';
            newRow['NUM_PROPOSTA'] = sourceRow['NUM_PROPOSTA'] || '';
            newRow['NUM_CONTRATO'] = sourceRow['NUM_CONTRATO'] || '';
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = sourceRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] === 'Margem Livre (Novo)' ? 'NOVO' : sourceRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'];
            newRow['COD_PRODUTO'] = '';
            newRow['DSC_PRODUTO'] = sourceRow['DSC_PRODUTO'] || '';
            newRow['DAT_CTR_INCLUSAO'] = today;
            newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['DSC_SITUACAO_EMPRESTIMO'] || '';
            newRow['DAT_EMPRESTIMO'] = sourceRow['DAT_EMPRESTIMO'] || '';
            newRow['COD_EMPREGADOR'] = '';
            newRow['DSC_CONVENIO'] = '';
            newRow['COD_ORGAO'] = '';
            newRow['NOM_ORGAO'] = '';
            newRow['COD_PRODUTOR_VENDA'] = '';
            newRow['NOM_PRODUTOR_VENDA'] = '';
            newRow['NIC_CTR_USUARIO'] = sourceRow['NIC_CTR_USUARIO'] || '';
            newRow['COD_CPF_CLIENTE'] = sourceRow['COD_CPF_CLIENTE'] || '';
            newRow['NOM_CLIENTE'] = sourceRow['NOM_CLIENTE'] || '';
            const datNasc = sourceRow['DAT_NASCIMENTO'];
            newRow['DAT_NASCIMENTO'] = (!datNasc || datNasc === '00/00/0000') ? '25/01/1990' : datNasc;
            newRow['NUM_IDENTIDADE'] = '';
            newRow['NOM_LOGRADOURO'] = '';
            newRow['NUM_PREDIO'] = '';
            newRow['DSC_CMPLMNT_ENDRC'] = '';
            newRow['NOM_BAIRRO'] = '';
            newRow['NOM_LOCALIDADE'] = '';
            newRow['SIG_UNIDADE_FEDERACAO'] = '';
            newRow['COD_ENDRCMNT_PSTL'] = '';
            newRow['NUM_TELEFONE'] = '';
            newRow['NUM_TELEFONE_CELULAR'] = '';
            newRow['NOM_MAE'] = '';
            newRow['NOM_PAI'] = '';
            newRow['NUM_BENEFICIO'] = '';
            newRow['QTD_PARCELA'] = sourceRow['QTD_PARCELA'] || '';
            newRow['VAL_PRESTACAO'] = sourceRow['VAL_PRESTACAO'] || '';
            newRow['VAL_BRUTO'] = sourceRow['VAL_BRUTO'] || '';
            newRow['VAL_SALDO_RECOMPRA'] = '';
            newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
            newRow['VAL_LIQUIDO'] = sourceRow['VAL_LIQUIDO'] || '';
            newRow['DAT_CREDITO'] = sourceRow['DAT_CREDITO'] || '';
            newRow['DAT_CONFIRMACAO'] = '';
            newRow['VAL_REPASSE'] = '';
            newRow['PCL_COMISSAO'] = '';
            newRow['VAL_COMISSAO'] = '';
            newRow['COD_UNIDADE_EMPRESA'] = '';
            newRow['COD_SITUACAO_EMPRESTIMO'] = '';
            newRow['DAT_ESTORNO'] = '';
            newRow['DSC_OBSERVACAO'] = '';
            newRow['NUM_CPF_AGENTE'] = '';
            newRow['NUM_OBJETO_ECT'] = '';
            newRow['PCL_TAXA_EMPRESTIMO'] = '1,80';
            newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = sourceRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] || '';
            newRow['DSC_TIPO_CREDITO_EMPRESTIMO'] = '';
            newRow['NOM_GRUPO_UNIDADE_EMPRESA'] = '';
            newRow['COD_PROPOSTA_EMPRESTIMO'] = '';
            newRow['COD_GRUPO_UNIDADE_EMPRESA'] = '';
            newRow['COD_TIPO_FUNCAO'] = '';
            newRow['COD_TIPO_PROPOSTA_EMPRESTIMO'] = '';
            newRow['COD_LOJA_DIGITACAO'] = '';
            newRow['VAL_SEGURO'] = '';
            processedData.push(newRow);
        } else if (system === 'UNNO') {
            // For now, UNNO just outputs what it reads. This will be updated later.
            const newRow: { [key: string]: any } = {};
             for (const field of UNNO_OUTPUT_FIELDS) {
                 newRow[field] = sourceRow[field] || '';
             }
            processedData.push(newRow);
        }
      }
    }

    if (processedData.length === 0) {
        throw new Error("No data was extracted. Please check if the data rows are empty or if the column headers are correct.");
    }

    const finalData = processedData.map(row => {
        const orderedRow: any = {};
        for(const field of OUTPUT_FIELDS) {
            orderedRow[field] = row.hasOwnProperty(field) ? row[field] : '';
        }
        return orderedRow;
    });

    return { success: true, data: JSON.stringify(finalData) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}
