"use server";

import * as XLSX from "xlsx";

// The fields we want to extract from the Excel file, in order.
const REQUIRED_FIELDS = [
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
  "PCR_PMT_PAGO_REF",
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
];

export async function processExcelFile(
  excelDataUri: string
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  try {
    // 1. Decode Data URI
    const base64Data = excelDataUri.split(",")[1];
    if (!base64Data) {
      throw new Error("Invalid Excel file data.");
    }
    const buffer = Buffer.from(base64Data, "base64");

    // 2. Read the workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("No worksheet found in the Excel file.");
    }
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // 3. Process headers and map columns
    const headers = jsonData[0] as string[];
    const headerMap: { [key: string]: number } = {};
    headers.forEach((header, index) => {
      // Normalize header to find a match in REQUIRED_FIELDS
      const normalizedHeader = String(header).trim();
      if (REQUIRED_FIELDS.includes(normalizedHeader)) {
        headerMap[normalizedHeader] = index;
      }
    });
    
    // Check if any required fields were found
    const foundFields = Object.keys(headerMap);
    if (foundFields.length === 0) {
        throw new Error("Could not find any of the required columns in the uploaded file. Please check the column headers.");
    }

    // 4. Extract data based on the mapped headers
    const extractedData: any[] = [];
    const dataRows = jsonData.slice(1); // All rows except the header row

    for (const row of dataRows) {
      const newRow: { [key: string]: any } = {};
      let rowHasData = false;
      for (const requiredField of REQUIRED_FIELDS) {
        if (headerMap.hasOwnProperty(requiredField)) {
          const colIndex = headerMap[requiredField];
          const cellValue = (row as any[])[colIndex];
           // Only add the field if it has a value
          if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
            newRow[requiredField] = cellValue;
            rowHasData = true;
          }
        }
      }
       // Only add the row if it contains at least one piece of data
      if (rowHasData) {
        extractedData.push(newRow);
      }
    }

    if (extractedData.length === 0) {
        throw new Error("No data was extracted. Please check if the data rows are empty or if the column headers are correct.");
    }

    return { success: true, data: JSON.stringify(extractedData) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}
