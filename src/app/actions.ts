"use server";

import * as XLSX from "xlsx";
import { format, subMonths, isAfter, parse } from "date-fns";

// =================================================================
// Sanitization and Normalization Helper
// =================================================================

/**
 * Normalizes a header string for consistent lookup.
 * Converts to uppercase, removes accents, and replaces non-alphanumeric characters (except spaces) with underscores.
 * e.g., "Data de Nascimento" -> "DATA_DE_NASCIMENTO"
 * @param str The string to normalize.
 * @returns The normalized string.
 */
const normalizeHeader = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove non-alphanumeric characters except space
    .replace(/\s+/g, '_'); // Replace one or more spaces with a single underscore
};

/**
 * Creates a map from normalized header names to their original names from the sheet.
 * @param actualHeaders The array of original header names from the worksheet.
 * @returns A record mapping normalized names to original names. e.g., { 'DATA_NASCIMENTO': 'Data Nascimento' }
 */
const createHeaderMap = (actualHeaders: string[]): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const header of actualHeaders) {
    const normalized = normalizeHeader(header);
    if (normalized) {
        map[normalized] = header;
    }
  }
  return map;
};

/**
 * Gets a value from a data row using the header map, providing robust lookup.
 * @param row The raw data row object.
 * @param headerMap The map created by createHeaderMap.
 * @param normalizedField The normalized field name to look for (e.g., 'NUM_PROPOSTA').
 * @returns The value from the row, or undefined if not found.
 */
const getRowValue = (row: any, headerMap: Record<string, string>, normalizedField: string): any => {
    const originalHeader = headerMap[normalizedField];
    return originalHeader ? row[originalHeader] : undefined;
}

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
].map(normalizeHeader);

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
    "COLUNA_VAZIA_PLACEHOLDER",
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
].map(normalizeHeader);

const UNNO_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;

// =================================================================
// PAN Configuration
// =================================================================
const PAN_INPUT_FIELDS = [
  "NUM_BAN",
  "NOM_BANCO",
  "NUM_PROPOSTA",
  "NUM_CONTRATO",
  "DSC_TIPO_PROPOSTA_EMPRESTIMO",
  "DSC_PRODUTO",
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
].map(normalizeHeader);

const PAN_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;

// =================================================================
// LEV Configuration
// =================================================================
const LEV_INPUT_FIELDS = PAN_INPUT_FIELDS; 
const LEV_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;

// =================================================================
// BRB-INCONTA Configuration
// =================================================================
const BRB_INCONTA_INPUT_FIELDS = [
  "ID",
  "TABELA",
  "PRODUTO",
  "STATUS",
  "CRIACAO AF",
  "AGENTE",
  "CPF",
  "NOME",
  "DATA DE NASCIMENTO",
  "PRAZO",
  "VALOR DE PARCELA",
  "VALOR PRINCIPAL",
  "VALOR LIQUIDO",
  "STATUS DATA",
  "TAXA MENSAL",
].map(normalizeHeader);

const BRB_INCONTA_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;


// =================================================================
// GLM-CREFISACP Configuration
// =================================================================
const GLM_CREFISACP_INPUT_FIELDS = [
    "PROPOSTA",
    "TABELA",
    "STATUS_CONTRATO",
    "DATA_CADASTRO",
    "USUARIO_BANCO",
    "CNPJ_CPF",
    "CLIENTE",
    "DATA DE NASCIMENTO",
    "PRAZO",
    "VALOR_PARCELA",
    "VALOR_BRUTO",
    "VALOR_LIQUIDO",
    "DATA_INTEGRACAO",
    "TAXA MENSAL"
].map(normalizeHeader);
const GLM_CREFISACP_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;


// =================================================================
// QUERO+ Configuration
// =================================================================
const QUEROMAIS_INPUT_FIELDS = [
    "NUM_PROPOSTA",
    "DSC_TIPO_PROPOSTA_EMPRESTIMO",
    "DSC_PRODUTO",
    "DSC_SITUACAO_EMPRESTIMO",
    "DAT_EMPRESTIMO",
    "NIC_CTR_USUARIO",
    "COD_CPF_CLIENTE",
    "NOM_CLIENTE",
    "QTD_PARCELA",
    "VAL_BRUTO",
    "VAL_LIQUIDO",
    "DAT_CREDITO"
].map(normalizeHeader);
const QUEROMAIS_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;

// =================================================================
// QUALIBANKING Configuration
// =================================================================
const QUALIBANKING_INPUT_FIELDS = [
    "Número do Contrato",
    "Nome do Produto",
    "Tipo de Operação",
    "Status",
    "Data da Proposta",
    "Login",
    "CPF",
    "Nome",
    "Prazo",
    "Valor da Parcela",
    "Valor do Empréstimo",
    "Valor Líquido ao Cliente",
    "Data do Crédito ao Cliente",
    "Nome da Tabela"
].map(normalizeHeader);
const QUALIBANKING_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;


// =================================================================
// NEOCREDITO Configuration
// =================================================================
const NEOCREDITO_INPUT_FIELDS = [
  "PROPOSTA",
  "TIPO OPERACAO",
  "CONVENIO",
  "TABELA",
  "STATUS",
  "DATA CADASTRO",
  "USUARIO",
  "CPF",
  "NOME",
  "PRAZO",
  "PMT",
  "VALOR OPERACAO",
  "VALOR TROCO",
  "DATA INTEGRADO",
].map(normalizeHeader);
const NEOCREDITO_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;


// =================================================================
// 2TECH Configuration
// =================================================================
const TECH2_INPUT_FIELDS = [
    "NUMERO_ADE",
    "TIPO CONTRATO",
    "SIT_BANCO",
    "SIT_PAGAMENTO_CLIENTE",
    "DATA_DIGIT_BANCO",
    "LOGIN_SUB_USUARIO",
    "CPF",
    "CLIENTE",
    "PRAZO",
    "VLR_PARC",
    "VALOR_BRUTO",
    "VALOR_LIQUIDO",
    "DATA_PAGAMENTO_CLIENTE",
    "CONVENIO",
    "TABELA"
].map(normalizeHeader);
const TECH2_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;


// =================================================================
// FACTA Configuration
// =================================================================
const FACTA_INPUT_FIELDS = [
    "COD",
    "TIPO PRODUTO",
    "PRODUTO",
    "STATUS",
    "DATA",
    "COD DIGITADOR NO BANCO",
    "CPF",
    "CLIENTE",
    "QTDE PARCELAS",
    "VALOR PARCELA",
    "VALOR BRUTO",
    "VALOR LIQUIDO",
    "DATA AVERBACAO",
].map(normalizeHeader);
const FACTA_OUTPUT_FIELDS = V8DIGITAL_OUTPUT_FIELDS;


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
 * It correctly handles both pt-BR format (e.g., "1.234,56") and US/generic format (e.g., "1,234.56").
 * @param value The value to format.
 * @returns A string in BRL currency format (e.g., "1.234,56") or the original value if parsing fails.
 */
function formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    let sValue = String(value).trim();
    
    // Check if the string contains a comma, which might be a decimal or thousand separator.
    const hasComma = sValue.includes(',');
    const hasDot = sValue.includes('.');

    // Handle "5,500.00" (US/UK) format vs "5.500,00" (BR) format
    if (hasComma && hasDot) {
        // If comma comes before dot, it's likely US/UK style ("5,500.00")
        if (sValue.lastIndexOf(',') < sValue.lastIndexOf('.')) {
            sValue = sValue.replace(/,/g, ''); // Remove thousand separators
        } else {
            // It's BR style ("5.500,00")
            sValue = sValue.replace(/\./g, '').replace(',', '.'); // Convert to "5500.00"
        }
    } else if (hasComma) {
        // Only has a comma, assume it's a BR decimal separator "5,50"
        sValue = sValue.replace(',', '.');
    }
    // If it only has a dot (or no separator), it's already in a valid format for parseFloat (e.g., "5500.00" or "5500")

    const num = parseFloat(sValue);
    
    if (isNaN(num)) {
        return String(value); // Return original string value if not a valid number
    }
    
    // Format to pt-BR standard, which uses ',' for decimal and '.' for thousands.
    return num.toLocaleString('pt-br', {
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
        let date: Date | undefined;

        // Try parsing DD/MM/YYYY or DD-MM-YYYY first
        if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(datePart)) {
            date = parse(datePart, 'dd/MM/yyyy', new Date());
            if (isNaN(date.getTime())) {
                 date = parse(datePart, 'dd-MM-yyyy', new Date());
            }
        }
        // Try parsing YYYY-MM-DD or YYYY/MM/DD
        else if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(datePart)) {
             date = parse(datePart, 'yyyy-MM-dd', new Date());
             if (isNaN(date.getTime())) {
                date = parse(datePart, 'yyyy/MM/dd', new Date());
             }
        }
        // Fallback for other formats Date can parse
        else {
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

/**
 * Extracts an interest rate (e.g., "1,85") from a string.
 * @param text The string to search within.
 * @returns The found interest rate without the '%' symbol, or an empty string.
 */
function extractInterestRate(text: string): string {
    if (!text) return '';
    const match = String(text).match(/\d{1,2},\d{1,2}/);
    return match ? match[0] : '';
}

// =================================================================
// V8DIGITAL Processing Logic
// =================================================================
function processV8Digital(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');
    
    return data
      .filter(sourceRow => getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA') && String(getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA')).trim() !== '')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};
        
        // Map and transform data based on V8Digital rules
        newRow['NUM_BANCO'] = 17;
        newRow['NOM_BANCO'] = 'V8DIGITAL';
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'NUM_CONTRATO');
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_TIPO_PROPOSTA_EMPRESTIMO') === 'Margem Livre (Novo)' ? 'NOVO' : getRowValue(sourceRow, headerMap, 'DSC_TIPO_PROPOSTA_EMPRESTIMO');
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'DSC_PRODUTO') || '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_SITUACAO_EMPRESTIMO') || '';
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DAT_EMPRESTIMO'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'NIC_CTR_USUARIO') || '';
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'COD_CPF_CLIENTE') || '';
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOM_CLIENTE') || '';
        let datNasc = formatDate(getRowValue(sourceRow, headerMap, 'DAT_NASCIMENTO'));
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'QTD_PARCELA') || '';
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_PRESTACAO'));
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_LIQUIDO'));
        newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DAT_CREDITO'));
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
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_TIPO_FORMULARIO_EMPRESTIMO') || '';
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
function processUnno(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data
      .filter(sourceRow => getRowValue(sourceRow, headerMap, 'CCB') && String(getRowValue(sourceRow, headerMap, 'CCB')).trim() !== '')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on UNNO rules
        newRow['NUM_BANCO'] = 9209;
        newRow['NOM_BANCO'] = 'UNNO';
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'CCB');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'CCB'); // Assuming contract number is the same as proposal for UNNO
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'TABELA') || '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'STATUS') || '';
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_DE_DIGITACAO'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'E_MAIL') || '';
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CPF_CNPJ') || '';
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOME') || '';
        let datNasc = formatDate(getRowValue(sourceRow, headerMap, 'DATA_NASCIMENTO'));
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'PARCELAS') || '';
        newRow['VAL_PRESTACAO'] = ''; // Empty as requested
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_LIQUIDO'));
        newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_DO_DESEMBOLSO'));
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
        newRow['COD_GRUPO_UNIDADE_EMPRESA'] = '';
        newRow['COD_TIPO_FUNCAO'] = '';
        newRow['COD_TIPO_PROPOSTA_EMPRESTIMO'] = '';
        newRow['COD_LOJA_DIGITACAO'] = '';
        newRow['VAL_SEGURO'] = '';
        return newRow;
    });
}

// =================================================================
// PAN Processing Logic
// =================================================================
function processPan(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data
      .filter(sourceRow => getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA') && String(getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA')).trim() !== '')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on PAN rules
        newRow['NUM_BANCO'] = 623;
        newRow['NOM_BANCO'] = getRowValue(sourceRow, headerMap, 'NOM_BANCO');
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'NUM_CONTRATO');
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_TIPO_PROPOSTA_EMPRESTIMO');
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'DSC_PRODUTO');
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_SITUACAO_EMPRESTIMO');
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DAT_EMPRESTIMO'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'NIC_CTR_USUARIO');
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'COD_CPF_CLIENTE');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOM_CLIENTE');
        let datNasc = formatDate(getRowValue(sourceRow, headerMap, 'DAT_NASCIMENTO'));
        if (!datNasc) {
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'QTD_PARCELA');
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_PRESTACAO'));
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_LIQUIDO'));
        newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DAT_CREDITO'));
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
        newRow['PCL_TAXA_EMPRESTIMO'] = '';
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// LEV Processing Logic
// =================================================================
function processLev(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');
    
    const requiredBanks = ["OLE", "DAYCOVAL", "CREFAZ", "MASTER"];

    return data
      .filter(sourceRow => {
            const nomBanco = String(getRowValue(sourceRow, headerMap, 'NOM_BANCO') || '').toUpperCase();
            return requiredBanks.some(bank => nomBanco.includes(bank));
      })
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        const nomBanco = String(getRowValue(sourceRow, headerMap, 'NOM_BANCO') || '').toUpperCase();
        
        newRow['NOM_BANCO'] = getRowValue(sourceRow, headerMap, 'NOM_BANCO');
        newRow['NUM_BANCO'] = getRowValue(sourceRow, headerMap, 'NUM_BANCO') || getRowValue(sourceRow, headerMap, 'NUM_BAN');

        if (nomBanco.includes('OLE')) {
            newRow['NOM_BANCO'] = 'OLÉ';
            newRow['NUM_BANCO'] = 169;
        } else if (nomBanco.includes('DAYCOVAL')) {
            newRow['NOM_BANCO'] = 'DAYCOVAL';
            newRow['NUM_BANCO'] = 707;
        } else if (nomBanco.includes('CREFAZ')) {
            newRow['NOM_BANCO'] = 'CREFAZ';
            newRow['NUM_BANCO'] = 1123;
        } else if (nomBanco.includes('MASTER')) {
            newRow['NOM_BANCO'] = 'MASTER';
            newRow['NUM_BANCO'] = 243;
        }
        
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA');
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_TIPO_PROPOSTA_EMPRESTIMO');
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'DSC_PRODUTO');
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_SITUACAO_EMPRESTIMO');
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DAT_EMPRESTIMO'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'NIC_CTR_USUARIO');
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'COD_CPF_CLIENTE');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOM_CLIENTE');
        let datNasc = formatDate(getRowValue(sourceRow, headerMap, 'DAT_NASCIMENTO'));
        if (!datNasc) {
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'QTD_PARCELA');
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_PRESTACAO'));
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_LIQUIDO'));
        newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DAT_CREDITO'));
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
        newRow['PCL_TAXA_EMPRESTIMO'] = '';
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// BRB-INCONTA Processing Logic
// =================================================================
function processBrbInconta(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data
      .filter(sourceRow => String(getRowValue(sourceRow, headerMap, 'AGENTE') || '').toUpperCase().trim() !== 'LV')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on BRB-INCONTA rules
        newRow['NUM_BANCO'] = 7056;
        newRow['NOM_BANCO'] = 'BRB - INCONTA';
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'ID');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'ID');
        
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'TABELA');

        if (String(getRowValue(sourceRow, headerMap, 'PRODUTO') || '').toUpperCase().trim() === 'CONTRATO NOVO') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'PRODUTO');
        }

        newRow['COD_PRODUTO'] = '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'STATUS');
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'CRIACAO_AF'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'AGENTE');
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CPF');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOME');
        let datNasc = formatDate(getRowValue(sourceRow, headerMap, 'DATA_DE_NASCIMENTO'));
        if (!datNasc) {
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'PRAZO');
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_DE_PARCELA'));
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_PRINCIPAL'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_LIQUIDO'));
        
        const isPago = String(getRowValue(sourceRow, headerMap, 'STATUS') || '').toUpperCase().trim() === 'PAGO';
        const statusDateValue = getRowValue(sourceRow, headerMap, 'STATUS_DATA');

        if (isPago) {
            newRow['DAT_CREDITO'] = formatDate(statusDateValue);
        } else {
            newRow['DAT_CREDITO'] = '';
        }

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
        newRow['PCL_TAXA_EMPRESTIMO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'TAXA_MENSAL'));
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// GLM-CREFISACP Processing Logic
// =================================================================
function processGlmCrefisacp(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on GLM rules
        newRow['NUM_BANCO'] = 789;
        newRow['NOM_BANCO'] = 'CREFISACP';
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'PROPOSTA');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'PROPOSTA');
        
        const tabelaUpper = String(getRowValue(sourceRow, headerMap, 'TABELA') || '').toUpperCase();
        if (tabelaUpper.includes('NOVO')) {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        } else if (tabelaUpper.includes('REFIN')) {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'REFIN';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'TABELA');
        }
        
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'TABELA');
        newRow['COD_PRODUTO'] = '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'STATUS_CONTRATO');
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_CADASTRO'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'USUARIO_BANCO');
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CNPJ_CPF');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CLIENTE');
        newRow['DAT_NASCIMENTO'] = '01/01/1990';
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'PRAZO');
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_PARCELA'));
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_LIQUIDO'));
        newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_INTEGRACAO'));
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
        newRow['PCL_TAXA_EMPRESTIMO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'TAXA_MENSAL'));
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// QUERO+ Processing Logic
// =================================================================
function processQueroMais(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on QUERO+ rules
        newRow['NUM_BANCO'] = 465;
        newRow['NOM_BANCO'] = 'QUERO+';
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'NUM_PROPOSTA');
        
        let tipoProposta = getRowValue(sourceRow, headerMap, 'DSC_TIPO_PROPOSTA_EMPRESTIMO');
        if (String(tipoProposta || '').toUpperCase().trim() === 'CARTÃO C/ SAQUE') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'CARTÃO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = tipoProposta;
        }

        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'DSC_PRODUTO');
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'DSC_SITUACAO_EMPRESTIMO');
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DAT_EMPRESTIMO'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'NIC_CTR_USUARIO');
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'COD_CPF_CLIENTE');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOM_CLIENTE');
        newRow['DAT_NASCIMENTO'] = '01/01/1990';
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'QTD_PARCELA');
        newRow['VAL_PRESTACAO'] = '';
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VAL_LIQUIDO'));

        let datCredito = formatDate(getRowValue(sourceRow, headerMap, 'DAT_CREDITO'));
        if (datCredito === '00/00/0000' || datCredito.endsWith('1899')) {
            newRow['DAT_CREDITO'] = '';
        } else {
            newRow['DAT_CREDITO'] = datCredito;
        }

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
        newRow['PCL_TAXA_EMPRESTIMO'] = '';
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// QUALIBANKING Processing Logic
// =================================================================
function processQualibanking(data: any[], headerMap: Record<string, string>): any[] {
    const today = new Date();
    const twoMonthsAgo = subMonths(today, 2);
    const todayFormatted = format(today, 'dd/MM/yyyy');

    return data
      .filter(sourceRow => {
            const proposalDateValue = getRowValue(sourceRow, headerMap, 'DATA_DA_PROPOSTA');
            if (!proposalDateValue) return false;

            let proposalDate: Date | undefined;

            if (proposalDateValue instanceof Date && !isNaN(proposalDateValue.getTime())) {
                proposalDate = proposalDateValue;
            } else if (typeof proposalDateValue === 'number') {
                const excelEpoch = new Date(1899, 11, 30);
                proposalDate = new Date(excelEpoch.getTime() + proposalDateValue * 24 * 60 * 60 * 1000);
            } else if (typeof proposalDateValue === 'string') {
                proposalDate = parse(proposalDateValue, 'dd/MM/yyyy', new Date());
                 if (isNaN(proposalDate.getTime())) {
                    proposalDate = new Date(proposalDateValue);
                 }
            }

            if (proposalDate && !isNaN(proposalDate.getTime())) {
                // Adjust for timezone before comparison
                const adjustedProposalDate = new Date(proposalDate.getTime() + (proposalDate.getTimezoneOffset() * 60000));
                return isAfter(adjustedProposalDate, twoMonthsAgo);
            }

            return false;
      })
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        newRow['NUM_BANCO'] = 22;
        newRow['NOM_BANCO'] = 'QUALIBANKING';
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'NUMERO_DO_CONTRATO');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'NUMERO_DO_CONTRATO');
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'NOME_DA_TABELA');
        newRow['COD_PRODUTO'] = '';
        
        const tipoOperacao = String(getRowValue(sourceRow, headerMap, 'TIPO_DE_OPERACAO') || '').trim().toUpperCase();
        if (tipoOperacao === 'REFIN DA PORTABILIDADE' || tipoOperacao === 'REFINANCIAMENTO DA PORTABILIDADE') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'PORTAB/REFIN';
        } else if (tipoOperacao.includes('PORTABILIDADE + REFIN')) {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'PORTABILIDADE';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = String(getRowValue(sourceRow, headerMap, 'TIPO_DE_OPERACAO') || '').trim();
        }

        newRow['DAT_CTR_INCLUSAO'] = todayFormatted;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'STATUS');
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_DA_PROPOSTA'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = getRowValue(sourceRow, headerMap, 'LOGIN');
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CPF');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOME');
        newRow['DAT_NASCIMENTO'] = '01/01/1990';
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'PRAZO');
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_DA_PARCELA'));

        if (newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] === 'PORTABILIDADE') {
            newRow['VAL_BRUTO'] = formatCurrency('0');
        } else {
            newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_DO_EMPRESTIMO'));
        }
        
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_LIQUIDO_AO_CLIENTE'));
        newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_DO_CREDITO_AO_CLIENTE'));
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
        newRow['PCL_TAXA_EMPRESTIMO'] = extractInterestRate(getRowValue(sourceRow, headerMap, 'NOME_DA_TABELA'));
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// NEOCREDITO Processing Logic
// =================================================================
function processNeocredito(data: any[], headerMap: Record<string, string>): any[] {
  const today = format(new Date(), 'dd/MM/yyyy');

  return data.map(sourceRow => {
    const newRow: { [key: string]: any } = {};

    newRow['NUM_BANCO'] = 410;
    newRow['NOM_BANCO'] = 'NEOCREDITO';
    newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'PROPOSTA');
    newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'PROPOSTA');

    const tipoOperacao = String(getRowValue(sourceRow, headerMap, 'TIPO_OPERACAO') || '').toUpperCase();
    if (tipoOperacao.includes('COMPRA')) {
      newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'RECOMPRA';
    } else if (tipoOperacao.includes('NOVO')) {
      newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'CARTÃO';
    } else if (tipoOperacao.includes('MARGEM LIVRE')) {
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
    } else {
      newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'TIPO_OPERACAO');
    }

    newRow['COD_PRODUTO'] = '';
    const convenio = getRowValue(sourceRow, headerMap, 'CONVENIO') || '';
    const tabela = getRowValue(sourceRow, headerMap, 'TABELA') || '';
    newRow['DSC_PRODUTO'] = `${convenio}-${tabela}`;

    newRow['DAT_CTR_INCLUSAO'] = today;
    newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'STATUS');
    newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_CADASTRO'));
    newRow['COD_EMPREGADOR'] = '';
    newRow['DSC_CONVENIO'] = '';
    newRow['COD_ORGAO'] = '';
    newRow['NOM_ORGAO'] = '';
    newRow['COD_PRODUTOR_VENDA'] = '';
    newRow['NOM_PRODUTOR_VENDA'] = '';
    
    let usuario = String(getRowValue(sourceRow, headerMap, 'USUARIO') || '');
    if (usuario.toUpperCase() === 'TAINA LUCIO DA LU') {
        newRow['NIC_CTR_USUARIO'] = 'TAINA LUCIO DA LUZ';
    } else {
        newRow['NIC_CTR_USUARIO'] = usuario;
    }

    newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CPF');
    newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'NOME');
    newRow['DAT_NASCIMENTO'] = '01/01/1990';
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
    newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'PRAZO');
    newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'PMT'));
    newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_OPERACAO'));
    newRow['VAL_SALDO_RECOMPRA'] = '';
    newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
    newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_TROCO'));
    newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_INTEGRADO'));
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
    newRow['PCL_TAXA_EMPRESTIMO'] = '';
    newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// 2TECH Processing Logic
// =================================================================
function process2Tech(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Helper to remove leading apostrophe
        const cleanString = (value: any): string => {
            let str = String(value || '').trim();
            if (str.startsWith("'")) {
                return str.substring(1);
            }
            return str;
        };

        newRow['NUM_BANCO'] = 789;
        newRow['NOM_BANCO'] = 'CREFISACP';
        newRow['NUM_PROPOSTA'] = cleanString(getRowValue(sourceRow, headerMap, 'NUMERO_ADE'));
        newRow['NUM_CONTRATO'] = cleanString(getRowValue(sourceRow, headerMap, 'NUMERO_ADE'));

        const tipoContrato = String(getRowValue(sourceRow, headerMap, 'TIPO_CONTRATO') || '').trim();
        if (tipoContrato === '001 - Novo Contrato') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        } else if (tipoContrato === '027 - Refinanciamento') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'REFINANCIAMENTO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = tipoContrato;
        }

        newRow['COD_PRODUTO'] = '';
        const convenio = getRowValue(sourceRow, headerMap, 'CONVENIO') || '';
        const tabela = getRowValue(sourceRow, headerMap, 'TABELA') || '';
        newRow['DSC_PRODUTO'] = `${convenio}-${tabela}`;

        newRow['DAT_CTR_INCLUSAO'] = today;
        
        if (String(getRowValue(sourceRow, headerMap, 'SIT_PAGAMENTO_CLIENTE') || '').toUpperCase().trim() === 'PAGO AO CLIENTE') {
            newRow['DSC_SITUACAO_EMPRESTIMO'] = 'PAGO AO CLIENTE';
        } else {
            newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'SIT_BANCO');
        }
        
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_DIGIT_BANCO'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = cleanString(getRowValue(sourceRow, headerMap, 'LOGIN_SUB_USUARIO'));
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CPF');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CLIENTE');
        newRow['DAT_NASCIMENTO'] = '01/01/1990';
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'PRAZO');
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VLR_PARC'));
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_LIQUIDO'));
        newRow['DAT_CREDITO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA_PAGAMENTO_CLIENTE'));
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
        newRow['PCL_TAXA_EMPRESTIMO'] = '';
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// FACTA Processing Logic
// =================================================================
function processFacta(data: any[], headerMap: Record<string, string>): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};
        
        newRow['NUM_BANCO'] = 897;
        newRow['NOM_BANCO'] = 'FACTA';
        newRow['NUM_PROPOSTA'] = getRowValue(sourceRow, headerMap, 'COD');
        newRow['NUM_CONTRATO'] = getRowValue(sourceRow, headerMap, 'COD');
        
        const tipoProduto = String(getRowValue(sourceRow, headerMap, 'TIPO_PRODUTO') || '').trim().toUpperCase();
        if (tipoProduto === 'REFIN / PORT') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'PORTAB/REFIN';
        } else if (tipoProduto === 'CARTÃO BENEFÍCIO') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'CARTÃO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = tipoProduto;
        }

        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = getRowValue(sourceRow, headerMap, 'PRODUTO');
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getRowValue(sourceRow, headerMap, 'STATUS');
        newRow['DAT_EMPRESTIMO'] = formatDate(getRowValue(sourceRow, headerMap, 'DATA'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        
        let digitador = String(getRowValue(sourceRow, headerMap, 'COD_DIGITADOR_NO_BANCO') || '');
        if (digitador.toUpperCase().startsWith('SUB ')) {
            newRow['NIC_CTR_USUARIO'] = digitador.substring(4);
        } else {
            newRow['NIC_CTR_USUARIO'] = digitador;
        }
        
        newRow['COD_CPF_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CPF');
        newRow['NOM_CLIENTE'] = getRowValue(sourceRow, headerMap, 'CLIENTE');
        newRow['DAT_NASCIMENTO'] = '01/01/1990';
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
        newRow['QTD_PARCELA'] = getRowValue(sourceRow, headerMap, 'QTDE_PARCELAS');
        newRow['VAL_PRESTACAO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_PARCELA'));
        newRow['VAL_BRUTO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getRowValue(sourceRow, headerMap, 'VALOR_LIQUIDO'));

        let dataAverbacao = formatDate(getRowValue(sourceRow, headerMap, 'DATA_AVERBACAO'));
        if (dataAverbacao === '00/00/0000') {
            newRow['DAT_CREDITO'] = '';
        } else {
            newRow['DAT_CREDITO'] = dataAverbacao;
        }
        
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
        newRow['PCL_TAXA_EMPRESTIMO'] = '';
        newRow['DSC_TIPO_FORMULARIO_EMPRESTIMO'] = 'DIGITAL';
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
// Placeholder Processing Logic for new systems
// =================================================================
function processGeneric(data: any[], system: string, headerMap: Record<string, string>): any[] {
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

    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("No worksheet found in the Excel file.");
    }
    
    // Get original headers from the sheet
    const originalHeaders: string[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, raw: true })[0];
    
    // Convert sheet to JSON array of objects, starting from the second row (data)
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' });

    if (jsonData.length === 0) {
        throw new Error("No data rows found in the Excel sheet.");
    }

    // Create a map from normalized headers to original headers for robust lookup
    const headerMap = createHeaderMap(originalHeaders);

    // Filter out rows that are completely empty
    const filteredData = jsonData.filter(row => 
        Object.values(row).some(cell => cell !== null && String(cell).trim() !== ''));

    if (filteredData.length === 0) {
        throw new Error("No data found in the Excel sheet. Please ensure it is not empty.");
    }

    let processedData: any[];
    let outputFields: string[];

    switch (system) {
        case 'V8DIGITAL':
            processedData = processV8Digital(filteredData, headerMap);
            outputFields = V8DIGITAL_OUTPUT_FIELDS;
            break;
        case 'UNNO':
            processedData = processUnno(filteredData, headerMap);
            outputFields = UNNO_OUTPUT_FIELDS;
            break;
        case 'PAN':
            processedData = processPan(filteredData, headerMap);
            outputFields = PAN_OUTPUT_FIELDS;
            break;
        case 'LEV':
            processedData = processLev(filteredData, headerMap);
            outputFields = LEV_OUTPUT_FIELDS;
            break;
        case 'BRB-INCONTA':
            processedData = processBrbInconta(filteredData, headerMap);
            outputFields = BRB_INCONTA_OUTPUT_FIELDS;
            break;
        case 'GLM-CREFISACP':
            processedData = processGlmCrefisacp(filteredData, headerMap);
            outputFields = GLM_CREFISACP_OUTPUT_FIELDS;
            break;
        case 'QUEROMAIS':
            processedData = processQueroMais(filteredData, headerMap);
            outputFields = QUEROMAIS_OUTPUT_FIELDS;
            break;
        case 'QUALIBANKING':
            processedData = processQualibanking(filteredData, headerMap);
            outputFields = QUALIBANKING_OUTPUT_FIELDS;
            break;
        case 'NEOCREDITO':
            processedData = processNeocredito(filteredData, headerMap);
            outputFields = NEOCREDITO_OUTPUT_FIELDS;
            break;
        case '2TECH':
            processedData = process2Tech(filteredData, headerMap);
            outputFields = TECH2_OUTPUT_FIELDS;
            break;
        case 'FACTA':
            processedData = processFacta(filteredData, headerMap);
            outputFields = FACTA_OUTPUT_FIELDS;
            break;
        case 'PRESENCABANK':
        case 'PRATA DIGITAL':
        case 'PHTECH':
        case 'TOTALCASH':
        case 'AMIGOZ':
        case 'BRB ESTEIRA':
        case 'BMG':
        case 'INTER':
        case 'DIGIO':
            processedData = processGeneric(filteredData, system, headerMap);
            outputFields = GENERIC_OUTPUT_FIELDS;
            break;
        default:
            throw new Error(`Unknown system: ${system}`);
    }

    if (processedData.length === 0) {
        throw new Error("No data was extracted. Please check if the data rows are empty, if the column headers are correct, or if they match the specified filters (e.g., date range).");
    }

    // Ensure final output has all columns in the correct order
    const finalData = processedData.map(row => {
        const orderedRow: any = {};
        for(const field of outputFields) {
            // Specifically handle our placeholder for the empty column
            if (field === 'COLUNA_VAZIA_PLACEHOLDER') {
                orderedRow[''] = ''; // Set an empty key for the column header
            } else {
                orderedRow[field] = row.hasOwnProperty(field) ? row[field] : '';
            }
        }
        // Then, remove the placeholder key so it doesn't appear in the final JSON if it was added
        delete orderedRow['COLUNA_VAZIA_PLACEHOLDER'];
        return orderedRow;
    });
    
    // Create a new worksheet, manually setting the header to handle the empty column
    const finalWorksheet = XLSX.utils.json_to_sheet(finalData, { 
        header: outputFields.map(field => field === 'COLUNA_VAZIA_PLACEHOLDER' ? '' : field) 
    });

    const finalJsonData = XLSX.utils.sheet_to_json(finalWorksheet);


    return { success: true, data: JSON.stringify(finalJsonData) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
    console.error("Processing Error:", errorMessage, error);
    return { success: false, error: errorMessage };
  }
}
