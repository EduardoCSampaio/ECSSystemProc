'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligently mapping fields from an uploaded Excel file to required data fields.
 *
 * - intelligentFieldMapping - A function that orchestrates the intelligent field mapping process.
 * - IntelligentFieldMappingInput - The input type for the intelligentFieldMapping function.
 * - IntelligentFieldMappingOutput - The return type for the intelligentFieldMapping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentFieldMappingInputSchema = z.object({
  excelData: z
    .string()
    .describe(
      'The Excel file data as a base64 encoded string.  The data URI must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
  requiredFields: z
    .array(z.string())
    .describe('An array of the required data fields.'),
});
export type IntelligentFieldMappingInput = z.infer<
  typeof IntelligentFieldMappingInputSchema
>;

const IntelligentFieldMappingOutputSchema = z.object({
  fieldMapping: z
    .record(z.string(), z.string())
    .describe(
      'A record (object) mapping the fields found in the Excel data to the required fields.'
    ),
});
export type IntelligentFieldMappingOutput = z.infer<
  typeof IntelligentFieldMappingOutputSchema
>;

export async function intelligentFieldMapping(
  input: IntelligentFieldMappingInput
): Promise<IntelligentFieldMappingOutput> {
  return intelligentFieldMappingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentFieldMappingPrompt',
  input: { schema: IntelligentFieldMappingInputSchema },
  output: {
    schema: IntelligentFieldMappingOutputSchema,
    format: 'json',
  },
  prompt: `You are an expert data analyst specializing in mapping fields from uploaded Excel files to required data fields.

You will analyze the provided Excel data and intelligently map the fields found in the Excel data to the following required fields:

Required fields: {{{requiredFields}}}

Here is the Excel data (base64 encoded): {{excelData}}

Return a JSON object where the keys are the required fields and the values are the corresponding fields found in the Excel data. If a required field cannot be found, set the value to an empty string.

Ensure that the output is a valid JSON object that conforms to the following schema:
${JSON.stringify(IntelligentFieldMappingOutputSchema.shape, null, 2)}`,
});

const intelligentFieldMappingFlow = ai.defineFlow(
  {
    name: 'intelligentFieldMappingFlow',
    inputSchema: IntelligentFieldMappingInputSchema,
    outputSchema: IntelligentFieldMappingOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
