'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting data from Excel files with AI context understanding.
 *
 * The flow takes an Excel file (as a data URI) and extraction instructions as input, and returns the extracted data.
 *
 * @exports {DataExtractionInput} The input type for the data extraction flow.
 * @exports {DataExtractionOutput} The output type for the data extraction flow.
 * @exports {extractDataWithContext} The function to trigger the data extraction flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the data extraction flow
const DataExtractionInputSchema = z.object({
  excelDataUri: z
    .string()
    .describe(
      'The Excel file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  extractionInstructions: z
    .string()
    .describe(
      'Instructions on what data to extract from the Excel file. Be as specific as possible.'
    ),
});
export type DataExtractionInput = z.infer<typeof DataExtractionInputSchema>;

// Output schema for the data extraction flow
const DataExtractionOutputSchema = z.object({
  extractedData: z
    .string()
    .describe('The extracted data from the Excel file, in JSON format.'),
});
export type DataExtractionOutput = z.infer<typeof DataExtractionOutputSchema>;

// Flow definition
export async function extractDataWithContext(input: DataExtractionInput): Promise<DataExtractionOutput> {
  return dataExtractionWithContextFlow(input);
}

const dataExtractionPrompt = ai.definePrompt({
  name: 'dataExtractionPrompt',
  input: {schema: DataExtractionInputSchema},
  output: {schema: DataExtractionOutputSchema},
  prompt: `You are an expert data extraction specialist.

You will be provided with an Excel file in the form of a base64 encoded data URI, and instructions on what data to extract.

Your goal is to extract the data from the Excel file, understand the context of the data, and return the extracted data in JSON format.

Here are the instructions: {{{extractionInstructions}}}

Here is the Excel file: {{media url=excelDataUri}}

Ensure that the extracted data is accurate and complete. Respond only with the JSON. Do not include any other text.`,
});

const dataExtractionWithContextFlow = ai.defineFlow(
  {
    name: 'dataExtractionWithContextFlow',
    inputSchema: DataExtractionInputSchema,
    outputSchema: DataExtractionOutputSchema,
  },
  async input => {
    const {output} = await dataExtractionPrompt(input);
    return output!;
  }
);
