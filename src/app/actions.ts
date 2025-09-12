"use server";

import { intelligentFieldMapping } from "@/ai/flows/intelligent-field-mapping";
import { extractDataWithContext } from "@/ai/flows/data-extraction-with-context";

// The fields we want to extract from the Excel file.
const REQUIRED_FIELDS = [
  "Full Name",
  "Email Address",
  "Phone Number",
  "Company Name",
  "Job Title",
  "Address",
  "City",
  "State",
  "Zip Code",
  "Country",
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
      - Map the column "${fieldMapping["Full Name"] || ""}" to "Full Name".
      - Map the column "${fieldMapping["Email Address"] || ""}" to "Email Address".
      - Map the column "${fieldMapping["Phone Number"] || ""}" to "Phone Number".
      - Map the column "${fieldMapping["Company Name"] || ""}" to "Company Name".
      - Map the column "${fieldMapping["Job Title"] || ""}" to "Job Title".
      - Map the column "${fieldMapping["Address"] || ""}" to "Address".
      - Map the column "${fieldMapping["City"] || ""}" to "City".
      - Map the column "${fieldMapping["State"] || ""}" to "State".
      - Map the column "${fieldMapping["Zip Code"] || ""}" to "Zip Code".
      - Map the column "${fieldMapping["Country"] || ""}" to "Country".
      
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
