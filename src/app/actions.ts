"use server";

import { intelligentFieldMapping } from "@/ai/flows/intelligent-field-mapping";
import { extractDataWithContext } from "@/ai/flows/data-extraction-with-context";

// The fields we want to extract from the Excel file.
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
    // Step 1: Intelligently map fields
    const mappingResult = await intelligentFieldMapping({
      excelData: excelDataUri,
      requiredFields: REQUIRED_FIELDS,
    });
    
    if (!mappingResult || !mappingResult.fieldMapping) {
      throw new Error("AI failed to map the fields from the Excel file.");
    }

    const { fieldMapping } = mappingResult;

    // Step 2: Construct extraction instructions based on the mapping
    const instructions = `
      From the uploaded Excel file, extract the data based on the following column mappings and return it as a JSON array of objects.
      Each object in the array should represent a row from the original file.
      ${REQUIRED_FIELDS.map(
        (field) =>
          `- Map the column "${
            fieldMapping[field] || ""
          }" to "${field}".`
      ).join("\n")}
      
      If a source column for a mapping is empty or not found, do not include that field in the output objects.
      Ensure the output is only the JSON data, with no additional text or explanations.
    `;

    // Step 3: Extract data using the constructed instructions
    const extractionResult = await extractDataWithContext({
      excelDataUri: excelDataUri,
      extractionInstructions: instructions,
    });
    
    if (!extractionResult || !extractionResult.extractedData) {
      throw new Error("AI failed to extract data from the Excel file.");
    }

    return { success: true, data: extractionResult.extractedData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
    return { success: false, error: errorMessage };
  }
}
