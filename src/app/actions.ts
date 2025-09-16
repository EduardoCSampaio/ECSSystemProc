








"use server";

import * as XLSX from "xlsx";
import { format, subMonths, isAfter, parse } from "date-fns";

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
];

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
];

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
];

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
];
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
];
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
];
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
];
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
];
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
];
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

/**
 * Finds a key in a row object by a partial, case-insensitive match.
 * @param row The row object.
 * @param partialKey The partial key to search for.
 * @returns The first matching key, or undefined.
 */
function findKeyByPartial(row: object, partialKey: string): string | undefined {
    const lowerPartialKey = partialKey.toLowerCase();
    return Object.keys(row).find(key => key.toLowerCase().trim().includes(lowerPartialKey));
}

/**
 * Gets a value from a row object using a flexible key search.
 * @param row The row object.
 * @param key The key or partial key to look for.
 * @returns The value, or an empty string if not found.
 */
function getFlexibleValue(row: { [key: string]: any }, key: string): any {
    const foundKey = findKeyByPartial(row, key);
    return foundKey ? row[foundKey] : '';
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
        newRow['NUM_PROPOSTA'] = sourceRow['NUM_PROPOSTA'];
        newRow['NUM_CONTRATO'] = sourceRow['NUM_CONTRATO'];
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
        newRow['NUM_PROPOSTA'] = sourceRow['CCB'];
        newRow['NUM_CONTRATO'] = sourceRow['CCB']; // Assuming contract number is the same as proposal for UNNO
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
function processPan(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data
      .filter(sourceRow => sourceRow['NUM_PROPOSTA'] && String(sourceRow['NUM_PROPOSTA']).trim() !== '')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on PAN rules
        newRow['NUM_BANCO'] = 623;
        newRow['NOM_BANCO'] = sourceRow['NOM_BANCO'];
        newRow['NUM_PROPOSTA'] = sourceRow['NUM_PROPOSTA'];
        newRow['NUM_CONTRATO'] = sourceRow['NUM_CONTRATO'];
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = sourceRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'];
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = sourceRow['DSC_PRODUTO'];
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['DSC_SITUACAO_EMPRESTIMO'];
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['DAT_EMPRESTIMO']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['NIC_CTR_USUARIO'];
        newRow['COD_CPF_CLIENTE'] = sourceRow['COD_CPF_CLIENTE'];
        newRow['NOM_CLIENTE'] = sourceRow['NOM_CLIENTE'];
        let datNasc = formatDate(sourceRow['DAT_NASCIMENTO']);
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
        newRow['QTD_PARCELA'] = sourceRow['QTD_PARCELA'];
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
function processLev(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');
    
    const requiredBanks = ["OLE", "DAYCOVAL", "CREFAZ", "MASTER"];

    return data
      .filter(sourceRow => {
            const nomBanco = String(sourceRow['NOM_BANCO'] || '').toUpperCase();
            return requiredBanks.some(bank => nomBanco.includes(bank));
      })
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        const nomBanco = String(sourceRow['NOM_BANCO'] || '').toUpperCase();
        
        newRow['NOM_BANCO'] = sourceRow['NOM_BANCO'];
        newRow['NUM_BANCO'] = sourceRow['NUM_BANCO'] || sourceRow['NUM_BAN'];

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
        
        newRow['NUM_PROPOSTA'] = sourceRow['NUM_PROPOSTA'];
        newRow['NUM_CONTRATO'] = sourceRow['NUM_PROPOSTA'];
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = sourceRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'];
        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = sourceRow['DSC_PRODUTO'];
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['DSC_SITUACAO_EMPRESTIMO'];
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['DAT_EMPRESTIMO']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['NIC_CTR_USUARIO'];
        newRow['COD_CPF_CLIENTE'] = sourceRow['COD_CPF_CLIENTE'];
        newRow['NOM_CLIENTE'] = sourceRow['NOM_CLIENTE'];
        let datNasc = formatDate(sourceRow['DAT_NASCIMENTO']);
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
        newRow['QTD_PARCELA'] = sourceRow['QTD_PARCELA'];
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
function processBrbInconta(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data
      .filter(sourceRow => String(sourceRow['AGENTE'] || '').toUpperCase().trim() !== 'LV')
      .map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on BRB-INCONTA rules
        newRow['NUM_BANCO'] = 7056;
        newRow['NOM_BANCO'] = 'BRB - INCONTA';
        newRow['NUM_PROPOSTA'] = sourceRow['ID'];
        newRow['NUM_CONTRATO'] = sourceRow['ID'];
        
        newRow['DSC_PRODUTO'] = sourceRow['TABELA'];

        if (String(sourceRow['PRODUTO'] || '').toUpperCase().trim() === 'CONTRATO NOVO') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = sourceRow['PRODUTO'];
        }

        newRow['COD_PRODUTO'] = '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['STATUS'];
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['CRIACAO AF']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['AGENTE'];
        newRow['COD_CPF_CLIENTE'] = sourceRow['CPF'];
        newRow['NOM_CLIENTE'] = sourceRow['NOME'];
        let datNasc = formatDate(sourceRow['DATA DE NASCIMENTO']);
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
        newRow['QTD_PARCELA'] = sourceRow['PRAZO'];
        newRow['VAL_PRESTACAO'] = formatCurrency(sourceRow['VALOR DE PARCELA']);
        newRow['VAL_BRUTO'] = formatCurrency(sourceRow['VALOR PRINCIPAL']);
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['VALOR LIQUIDO']);
        
        const isPago = String(sourceRow['STATUS'] || '').toUpperCase().trim() === 'PAGO';
        const statusDateKey = Object.keys(sourceRow).find(key => key.toUpperCase().trim() === 'STATUS DATA');
        const statusDateValue = statusDateKey ? sourceRow[statusDateKey] : undefined;

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
        newRow['PCL_TAXA_EMPRESTIMO'] = formatCurrency(sourceRow['TAXA MENSAL']);
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
function processGlmCrefisacp(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on GLM rules
        newRow['NUM_BANCO'] = 789;
        newRow['NOM_BANCO'] = 'CREFISACP';
        newRow['NUM_PROPOSTA'] = sourceRow['PROPOSTA'];
        newRow['NUM_CONTRATO'] = sourceRow['PROPOSTA'];
        
        const tabelaUpper = String(sourceRow['TABELA'] || '').toUpperCase();
        if (tabelaUpper.includes('NOVO')) {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        } else if (tabelaUpper.includes('REFIN')) {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'REFIN';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = sourceRow['TABELA'];
        }
        
        newRow['DSC_PRODUTO'] = sourceRow['TABELA'];
        newRow['COD_PRODUTO'] = '';
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['STATUS_CONTRATO'];
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['DATA_CADASTRO']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['USUARIO_BANCO'];
        newRow['COD_CPF_CLIENTE'] = sourceRow['CNPJ_CPF'];
        newRow['NOM_CLIENTE'] = sourceRow['CLIENTE'];
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
        newRow['QTD_PARCELA'] = sourceRow['PRAZO'];
        newRow['VAL_PRESTACAO'] = formatCurrency(sourceRow['VALOR_PARCELA']);
        newRow['VAL_BRUTO'] = formatCurrency(sourceRow['VALOR_BRUTO']);
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['VALOR_LIQUIDO']);
        newRow['DAT_CREDITO'] = formatDate(sourceRow['DATA_INTEGRACAO']);
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
        newRow['PCL_TAXA_EMPRESTIMO'] = formatCurrency(sourceRow['TAXA MENSAL']);
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
function processQueroMais(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};

        // Map and transform data based on QUERO+ rules
        newRow['NUM_BANCO'] = 465;
        newRow['NOM_BANCO'] = 'QUERO+';
        newRow['NUM_PROPOSTA'] = sourceRow['NUM_PROPOSTA'];
        newRow['NUM_CONTRATO'] = sourceRow['NUM_PROPOSTA'];
        
        let tipoProposta = sourceRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'];
        if (String(tipoProposta || '').toUpperCase().trim() === 'CARTÃO C/ SAQUE') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'CARTÃO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = tipoProposta;
        }

        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = sourceRow['DSC_PRODUTO'];
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['DSC_SITUACAO_EMPRESTIMO'];
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['DAT_EMPRESTIMO']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['NIC_CTR_USUARIO'];
        newRow['COD_CPF_CLIENTE'] = sourceRow['COD_CPF_CLIENTE'];
        newRow['NOM_CLIENTE'] = sourceRow['NOM_CLIENTE'];
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
        newRow['QTD_PARCELA'] = sourceRow['QTD_PARCELA'];
        newRow['VAL_PRESTACAO'] = '';
        newRow['VAL_BRUTO'] = formatCurrency(sourceRow['VAL_BRUTO']);
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['VAL_LIQUIDO']);

        let datCredito = formatDate(sourceRow['DAT_CREDITO']);
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
function processQualibanking(data: any[]): any[] {
    const today = new Date();
    const twoMonthsAgo = subMonths(today, 2);
    const todayFormatted = format(today, 'dd/MM/yyyy');

    return data
      .filter(sourceRow => {
            const proposalDateValue = sourceRow['Data da Proposta'];
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
        newRow['NUM_PROPOSTA'] = sourceRow['Número do Contrato'];
        newRow['NUM_CONTRATO'] = sourceRow['Número do Contrato'];
        newRow['DSC_PRODUTO'] = sourceRow['Nome da Tabela'];
        newRow['COD_PRODUTO'] = '';
        
        const tipoOperacao = String(sourceRow['Tipo de Operação'] || '').trim().toUpperCase();
        if (tipoOperacao === 'REFIN DA PORTABILIDADE' || tipoOperacao === 'REFINANCIAMENTO DA PORTABILIDADE') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'PORTAB/REFIN';
        } else if (tipoOperacao.includes('PORTABILIDADE + REFIN')) {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'PORTABILIDADE';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = String(sourceRow['Tipo de Operação'] || '').trim();
        }

        newRow['DAT_CTR_INCLUSAO'] = todayFormatted;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['Status'];
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['Data da Proposta']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = sourceRow['Login'];
        newRow['COD_CPF_CLIENTE'] = sourceRow['CPF'];
        newRow['NOM_CLIENTE'] = sourceRow['Nome'];
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
        newRow['QTD_PARCELA'] = sourceRow['Prazo'];
        newRow['VAL_PRESTACAO'] = formatCurrency(sourceRow['Valor da Parcela']);

        if (newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] === 'PORTABILIDADE') {
            newRow['VAL_BRUTO'] = formatCurrency('0');
        } else {
            newRow['VAL_BRUTO'] = formatCurrency(sourceRow['Valor do Empréstimo']);
        }
        
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['Valor Líquido ao Cliente']);
        newRow['DAT_CREDITO'] = formatDate(sourceRow['Data do Crédito ao Cliente']);
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
        newRow['PCL_TAXA_EMPRESTIMO'] = extractInterestRate(sourceRow['Nome da Tabela']);
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
function processNeocredito(data: any[]): any[] {
  const today = format(new Date(), 'dd/MM/yyyy');

  return data.map(sourceRow => {
    const newRow: { [key: string]: any } = {};

    newRow['NUM_BANCO'] = 410;
    newRow['NOM_BANCO'] = 'NEOCREDITO';
    newRow['NUM_PROPOSTA'] = sourceRow['PROPOSTA'];
    newRow['NUM_CONTRATO'] = sourceRow['PROPOSTA'];

    const tipoOperacao = String(sourceRow['TIPO OPERACAO'] || '').toUpperCase();
    if (tipoOperacao.includes('COMPRA')) {
      newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'RECOMPRA';
    } else if (tipoOperacao.includes('NOVO')) {
      newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'CARTÃO';
    } else if (tipoOperacao.includes('MARGEM LIVRE')) {
        newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
    } else {
      newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = sourceRow['TIPO OPERACAO'];
    }

    newRow['COD_PRODUTO'] = '';
    newRow['DSC_PRODUTO'] = `${sourceRow['CONVENIO'] || ''}-${sourceRow['TABELA'] || ''}`;
    newRow['DAT_CTR_INCLUSAO'] = today;
    newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['STATUS'];
    newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['DATA CADASTRO']);
    newRow['COD_EMPREGADOR'] = '';
    newRow['DSC_CONVENIO'] = '';
    newRow['COD_ORGAO'] = '';
    newRow['NOM_ORGAO'] = '';
    newRow['COD_PRODUTOR_VENDA'] = '';
    newRow['NOM_PRODUTOR_VENDA'] = '';
    
    let usuario = String(sourceRow['USUARIO'] || '');
    if (usuario.toUpperCase() === 'TAINA LUCIO DA LU') {
        newRow['NIC_CTR_USUARIO'] = 'TAINA LUCIO DA LUZ';
    } else {
        newRow['NIC_CTR_USUARIO'] = usuario;
    }

    newRow['COD_CPF_CLIENTE'] = sourceRow['CPF'];
    newRow['NOM_CLIENTE'] = sourceRow['NOME'];
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
    newRow['QTD_PARCELA'] = sourceRow['PRAZO'];
    newRow['VAL_PRESTACAO'] = formatCurrency(sourceRow['PMT']);
    newRow['VAL_BRUTO'] = formatCurrency(sourceRow['VALOR OPERACAO']);
    newRow['VAL_SALDO_RECOMPRA'] = '';
    newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
    newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['VALOR TROCO']);
    newRow['DAT_CREDITO'] = formatDate(sourceRow['DATA INTEGRADO']);
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
function process2Tech(data: any[]): any[] {
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
        newRow['NUM_PROPOSTA'] = cleanString(sourceRow['NUMERO_ADE']);
        newRow['NUM_CONTRATO'] = cleanString(sourceRow['NUMERO_ADE']);

        const tipoContrato = String(sourceRow['TIPO CONTRATO'] || '').trim();
        if (tipoContrato === '001 - Novo Contrato') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'NOVO';
        } else if (tipoContrato === '027 - Refinanciamento') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'REFINANCIAMENTO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = tipoContrato;
        }

        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = `${sourceRow['CONVENIO'] || ''}-${sourceRow['TABELA'] || ''}`;
        newRow['DAT_CTR_INCLUSAO'] = today;
        
        if (String(sourceRow['SIT_PAGAMENTO_CLIENTE'] || '').toUpperCase().trim() === 'PAGO AO CLIENTE') {
            newRow['DSC_SITUACAO_EMPRESTIMO'] = 'PAGO AO CLIENTE';
        } else {
            newRow['DSC_SITUACAO_EMPRESTIMO'] = sourceRow['SIT_BANCO'];
        }
        
        newRow['DAT_EMPRESTIMO'] = formatDate(sourceRow['DATA_DIGIT_BANCO']);
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        newRow['NIC_CTR_USUARIO'] = cleanString(sourceRow['LOGIN_SUB_USUARIO']);
        newRow['COD_CPF_CLIENTE'] = sourceRow['CPF'];
        newRow['NOM_CLIENTE'] = sourceRow['CLIENTE'];
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
        newRow['QTD_PARCELA'] = sourceRow['PRAZO'];
        newRow['VAL_PRESTACAO'] = formatCurrency(sourceRow['VLR_PARC']);
        newRow['VAL_BRUTO'] = formatCurrency(sourceRow['VALOR_BRUTO']);
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(sourceRow['VALOR_LIQUIDO']);
        newRow['DAT_CREDITO'] = formatDate(sourceRow['DATA_PAGAMENTO_CLIENTE']);
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
function processFacta(data: any[]): any[] {
    const today = format(new Date(), 'dd/MM/yyyy');

    return data.map(sourceRow => {
        const newRow: { [key: string]: any } = {};
        
        newRow['NUM_BANCO'] = 897;
        newRow['NOM_BANCO'] = 'FACTA';
        newRow['NUM_PROPOSTA'] = getFlexibleValue(sourceRow, 'COD');
        newRow['NUM_CONTRATO'] = getFlexibleValue(sourceRow, 'COD');
        
        const tipoProduto = String(getFlexibleValue(sourceRow, 'TIPO PRODUTO')).trim().toUpperCase();
        if (tipoProduto === 'REFIN / PORT') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'PORTAB/REFIN';
        } else if (tipoProduto === 'CARTÃO BENEFÍCIO') {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = 'CARTÃO';
        } else {
            newRow['DSC_TIPO_PROPOSTA_EMPRESTIMO'] = tipoProduto;
        }

        newRow['COD_PRODUTO'] = '';
        newRow['DSC_PRODUTO'] = getFlexibleValue(sourceRow, 'PRODUTO');
        newRow['DAT_CTR_INCLUSAO'] = today;
        newRow['DSC_SITUACAO_EMPRESTIMO'] = getFlexibleValue(sourceRow, 'STATUS');
        newRow['DAT_EMPRESTIMO'] = formatDate(getFlexibleValue(sourceRow, 'DATA'));
        newRow['COD_EMPREGADOR'] = '';
        newRow['DSC_CONVENIO'] = '';
        newRow['COD_ORGAO'] = '';
        newRow['NOM_ORGAO'] = '';
        newRow['COD_PRODUTOR_VENDA'] = '';
        newRow['NOM_PRODUTOR_VENDA'] = '';
        
        let digitador = String(getFlexibleValue(sourceRow, 'COD DIGITADOR NO BANCO'));
        if (digitador.toUpperCase().startsWith('SUB ')) {
            newRow['NIC_CTR_USUARIO'] = digitador.substring(4);
        } else {
            newRow['NIC_CTR_USUARIO'] = digitador;
        }
        
        newRow['COD_CPF_CLIENTE'] = getFlexibleValue(sourceRow, 'CPF');
        newRow['NOM_CLIENTE'] = getFlexibleValue(sourceRow, 'CLIENTE');
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
        newRow['QTD_PARCELA'] = getFlexibleValue(sourceRow, 'QTDE PARCELAS');
        newRow['VAL_PRESTACAO'] = formatCurrency(getFlexibleValue(sourceRow, 'VALOR PARCELA'));
        newRow['VAL_BRUTO'] = formatCurrency(getFlexibleValue(sourceRow, 'VALOR BRUTO'));
        newRow['VAL_SALDO_RECOMPRA'] = '';
        newRow['VAL_SALDO_REFINANCIAMENTO'] = '';
        newRow['VAL_LIQUIDO'] = formatCurrency(getFlexibleValue(sourceRow, 'VALOR LIQUIDO'));

        let dataAverbacao = formatDate(getFlexibleValue(sourceRow, 'DATA AVERBACAO'));
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
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("No worksheet found in the Excel file.");
    }
    
    // Convert sheet to JSON, reading all values as is.
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' });

    // Sanitize headers: trim spaces from all keys in each row object
    const sanitizedJsonData = jsonData.map(row => {
        const newRow: {[key: string]: any} = {};
        for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
                newRow[key.trim()] = row[key];
            }
        }
        return newRow;
    });


    // Filter out rows that are completely empty
    const filteredData = sanitizedJsonData.filter(row => 
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
        case 'PAN':
            processedData = processPan(filteredData);
            outputFields = PAN_OUTPUT_FIELDS;
            break;
        case 'LEV':
            processedData = processLev(filteredData);
            outputFields = LEV_OUTPUT_FIELDS;
            break;
        case 'BRB-INCONTA':
            processedData = processBrbInconta(filteredData);
            outputFields = BRB_INCONTA_OUTPUT_FIELDS;
            break;
        case 'GLM-CREFISACP':
            processedData = processGlmCrefisacp(filteredData);
            outputFields = GLM_CREFISACP_OUTPUT_FIELDS;
            break;
        case 'QUEROMAIS':
            processedData = processQueroMais(filteredData);
            outputFields = QUEROMAIS_OUTPUT_FIELDS;
            break;
        case 'QUALIBANKING':
            processedData = processQualibanking(filteredData);
            outputFields = QUALIBANKING_OUTPUT_FIELDS;
            break;
        case 'NEOCREDITO':
            processedData = processNeocredito(filteredData);
            outputFields = NEOCREDITO_OUTPUT_FIELDS;
            break;
        case '2TECH':
            processedData = process2Tech(filteredData);
            outputFields = TECH2_OUTPUT_FIELDS;
            break;
        case 'FACTA':
            processedData = processFacta(filteredData);
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
            processedData = processGeneric(filteredData, system);
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







