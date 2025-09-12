
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

const UNNO_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;

// =================================================================
// GLM-CREFISACP Configuration
// =================================================================
const GLM_CREFISACP_INPUT_FIELDS = []; // TODO: Define input fields
const GLM_CREFISACP_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;

// =================================================================
// Generic Configurations
// =================================================================
const GENERIC_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;


// =================================================================
// Generic Helper Functions
// =================================================================

type System = "V8DIGITAL" | "UNNO" | "GLM-CREFISACP" | "QUEROMAIS" | "LEV" | "FACTA" | "PRESENCABANK" | "QUALIBANKING" | "PAN" | "BRB-INCONTA" | "NEOCREDITO" | "PRATA DIGITAL" | "PHTECH" | "TOTALCASH" | "AMIGOZ" | "BRB ESTEIRA" | "BMG" | "INTER" | "DIGIO" | "2TECH";

/**
 * Formats a value into a Brazilian currency string (BRL).
 * It correctly handles numbers and strings with pt-BR formatting (e.g., "1.234,56").
 * @param value The value to format.
 * @returns A string in BRL currency format (e.g., "1.234,56") or the original value if parsing fails.
 */
function formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    let sValue = String(value).trim();

    // Clean the string for parseFloat: remove thousand separators (.) and replace decimal comma (,) with a dot (.)
    sValue = sValue.replace(/\./g, '').replace(',', '.');
    
    const num = parseFloat(sValue);
    
    if (isNaN(num)) {
        return String(value); // Return original string value if not a valid number
    }
    
    // Format to pt-BR standard, which uses ',' for decimal and '.' for thousands.
    return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}


/**
 * Parses and formats a date value into 'dd/MM/yyyy' format.
 * It handles JS Date objects, Excel's numeric date format, and common string formats.
 * @param value The date value to format.
 * @returns A formatted date string or the original value if parsing fails.
 */
function formatDate(value: any): string {
    if (!value) return '';

    // If it's already a valid Date object
    if (value instanceof Date && !isNaN(value.getTime())) {
        // Adjust for timezone offset before formatting
        const adjustedDate = new Date(value.getTime() + (value.getTimezoneOffset() * 60000));
        return format(adjustedDate, 'dd/MM/yyyy');
    }

    // If it's an Excel serial number
    if (typeof value === 'number') {
        if (value <= 0) return ''; // Invalid Excel date number
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        if (!isNaN(date.getTime())) {
            const adjustedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
            return format(adjustedDate, 'dd/MM/yyyy');
        }
    }
    
    if (typeof value === 'string') {
        // Normalize string: remove time part, replace separators
        const datePart = value.split(' ')[0];
        const parts = datePart.split(/[/-]/);
        let date: Date | undefined;

        if (parts.length === 3) {
            const [p1, p2, p3] = parts;
            // YYYY-MM-DD or YYYY/MM/DD
            if (p1.length === 4) {
                date = new Date(Number(p1), Number(p2) - 1, Number(p3));
            } 
            // DD/MM/YYYY or DD-MM-YYYY
            else if (p3.length === 4) {
                 date = new Date(Number(p3), Number(p2) - 1, Number(p1));
            }
             // MM/DD/YYYY or MM-DD-YYYY (heuristic)
            else if (Number(p1) <= 12 && Number(p2) <= 31) { // Check if first part is a valid month
                 date = new Date(new Date().getFullYear().toString().substr(0, 2) + p3, Number(p1) - 1, Number(p2)); // Handles MM/DD/YY
            } else {
                 date = new Date(new Date().getFullYear().toString().substr(0, 2) + p3, Number(p2) - 1, Number(p1)); // Fallback to DD/MM/YY
            }
        } else {
             // Fallback for other formats Date can parse
             date = new Date(value);
        }

        if (date && !isNaN(date.getTime())) {
            const adjustedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
            return format(adjustedDate, 'dd/MM/yyyy');
        }
    }
    
    // Return the original value if all parsing attempts fail
    return String(value);
}


// =================================================================
// V8DIGITAL Processing Logic
// =================================================================
function processV8Digital(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');
    
    return data
      .filter(sourceRow => sourceRow['NUM_PROPOSTA'] && String(sourceRow['NUM_PROPOSTA']).trim() !== '')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};
        
        // Map and transform data based on V8Digital rules
        newRow['NUM_BANCO'] = 17;
        newRow['NOM_BANCO'] = 'V8DIGITAL';
        newRow['NUM_PROPOSTA'] = sourceRow['NUM_PROPOSTA'] || '';
        newRow['NUM_CONTRATO'] = sourceRow['NUM_CONTRATO'] || '';
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = sourceRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] === 'Margem Livre (Novo)' ? 'NOVO' : sourceRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'];
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = sourceRow['DSC_PRODUTO'] || '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['DSC_SITUACAO_EMPRESTIMO'] || '';
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['DAT_EMPRESTIMO']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['NIC_CTR_USUARIO'] || '';
        newRow['COD_CPF_CLIENTE'] = sourceRow['COD_CPF_CLIENTE'] || '';
        newRow['NOM_CLIENTE'] = sourceRow['NOM_CLIENTE'] || '';
        let datNasc = formatDate(sourceRow['DAT_NASCIMENTO']);
        if (!datNasc || datNasc === '00/00/0000' || datNasc.endsWith('1899')) {
            datNasc = '01/01/1990';
        }
        newRow['DAT_NASCIMENTO'] = datNasc;
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
        newRow['VAL_PRESTACAO'] = formatCurrency(sourceRow['VAL_PRESTACAO']);
        newRow['VAL_BRUTO'] = formatCurrency(sourceRow['VAL_BRUTO']);
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['VAL_LIQUIDO']);
        newRow['DAT_CREDITO'] = formatDate(sourceRow['DAT_CREDITO']);
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
        return newRow;
    });
}

// =================================================================
// UNNO Processing Logic
// =================================================================
function processUnno(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data
      .filter(sourceRow => sourceRow['CCB'] && String(sourceRow['CCB']).trim() !== '')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on UNNO rules
        newRow['NUM_BANCO'] = 9209;
        newRow['NOM_BANCO'] = 'UNNO';
        newRow['NUM_PROPOSTA'] = sourceRow['CCB'] || '';
        newRow['NUM_CONTRATO'] = sourceRow['CCB'] || '';
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = sourceRow['Tabela'] || '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['Status'] || '';
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['Data de Digitação']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['E-mail'] || '';
        newRow['COD_CPF_CLIENTE'] = sourceRow['CPF/CNPJ'] || '';
        newRow['NOM_CLIENTE'] = sourceRow['Nome'] || '';
        let datNasc = formatDate(sourceRow['Data Nascimento']);
        if (!datNasc || datNasc === '00/00/0000' || datNasc.endsWith('1899')) {
            datNasc = '01/01/1990';
        }
        newRow['DAT_NASCIMENTO'] = datNasc;
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
        newRow['QTD_PARCELA'] = sourceRow['Parcelas'] || '';
        newRow['VAL_PRESTACAO'] = ''; // Empty as requested
        newRow['VAL_BRUTO'] = formatCurrency(sourceRow['Valor Bruto']);
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['Valor Líquido']);
        newRow['DAT_CREDITO'] = formatDate(sourceRow['Data do Desembolso']);
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
        newRow['PCL_TAXA_EMPRESTIMO'] = '1,79';
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
        newRow['DSC_TIPO_CREDITO_EMPRESTIMO'] = '';
        newRow['NOM_GRUPO_UNIDADE_EMPRESA'] = '';
        newRow['COD_PROPOSTA_EMPRESTIMO'] = '';
        newRow['COD_GRUPO_UNidade_EMPRESA'] = '';
        newRow['COD_TIPO_FUNCAO'] = '';
        newRow['COD_TIPO_PROPOSTA_EMPRESTimo'] = '';
        newRow['COD_LOJA_DIGITACAO'] = '';
        newRow['VAL_SEGURO'] = '';
        return newRow;
    });
}

// =================================================================
// Placeholder Processing Logic for new systems
// =================================================================
function processGeneric(data: any[], system: string): any[] {
    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};
        // Placeholder logic - just returns an empty object for each field
        GENERIC_OUTPUT_FIELDS.forEach(field => newRow[field] = '');
        newRow['NOM_BANCO'] = system;
        return newRow;
    });
}

// =================================================================
// Main Processing Function
// =================================================================
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

    // Read workbook with raw values to prevent XLSX from auto-parsing dates and numbers
    const workbook = XLSX.read(buffer, { type: "buffer", raw: true, cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("No worksheet found in the Excel file.");
    }
    
    // Convert sheet to JSON, reading all values as is.
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' });

    // Filter out rows that are completely empty
    const filteredData = jsonData.filter(row => 
        Object.values(row).some(cell => cell !== null && cell !== ''));

    if (filteredData.length === 0) {
        throw new Error("No data found in the Excel sheet. Please ensure it is not empty.");
    }

    let processedData: any[];
    let outputFields: string[];

    switch (system) {
        case 'V8DIGITAL':
            processedData = processV8Digital(filteredData);
            outputFields = V8DIGITAL_OUTPUT_FIELDS;
            break;
        case 'UNNO':
            processedData = processUnno(filteredData);
            outputFields = UNNO_OUTPUT_FIELDS;
            break;
        case 'GLM-CREFISACP':
        case 'QUEROMAIS':
        case 'LEV':
        case 'FACTA':
        case 'PRESENCABANK':
        case 'QUALIBANKING':
        case 'PAN':
        case 'BRB-INCONTA':
        case 'NEOCREDITO':
        case 'PRATA DIGITAL':
        case 'PHTECH':
        case 'TOTALCASH':
        case 'AMIGOZ':
        case 'BRB ESTEIRA':
        case 'BMG':
        case 'INTER':
        case 'DIGIO':
        case '2TECH':
            processedData = processGeneric(filteredData, system);
            outputFields = GENERIC_OUTPUT_FIELDS;
            break;
        default:
            throw new Error(`Unknown system: ${system}`);
    }

    if (processedData.length === 0) {
        throw new Error("No data was extracted. Please check if the data rows are empty or if the column headers are correct.");
    }

    // Ensure final output has all columns in the correct order
    const finalData = processedData.map(row => {
        const orderedRow: any = {};
        for(const field of outputFields) {
            orderedRow[field] = row.hasOwnProperty(field) ? row[field] : '';
        }
        return orderedRow;
    });

    return { success: true, data: JSON.stringify(finalData) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
    console.error("Processing Error:", errorMessage, error);
    return { success: false, error: errorMessage };
  }
}

    