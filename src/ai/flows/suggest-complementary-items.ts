// use server'

/**
 * @fileOverview Outfit Suggestion AI agent.
 *
 * - suggestComplementaryItems - A function that handles the outfit suggestion process.
 * - SuggestComplementaryItemsInput - The input type for the suggestComplementaryItems function.
 * - SuggestComplementaryItemsOutput - The return type for the suggestComplementaryItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestComplementaryItemsInputSchema = z.object({
  itemName: z.string().describe('The name of the item.'),
  itemType: z.string().describe('The type of the item (e.g., Shirt, Pants, Shoes).'),
  itemDescription: z.string().describe('A detailed description of the item.'),
  itemCoverImage: z
    .string()
    .describe(
      "The cover image of the item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  additionalImages: z
    .array(z.string())
    .describe(
      "Additional images of the item, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  existingItems: z
    .array(z.object({itemName: z.string(), itemType: z.string(), itemDescription: z.string()}))
    .describe('The list of existing items in the wardrobe.'),
});
export type SuggestComplementaryItemsInput = z.infer<typeof SuggestComplementaryItemsInputSchema>;

const SuggestComplementaryItemsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested items from the existing wardrobe that complement the given item.'),
});
export type SuggestComplementaryItemsOutput = z.infer<typeof SuggestComplementaryItemsOutputSchema>;

export async function suggestComplementaryItems(
  input: SuggestComplementaryItemsInput
): Promise<SuggestComplementaryItemsOutput> {
  return suggestComplementaryItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestComplementaryItemsPrompt',
  input: {schema: SuggestComplementaryItemsInputSchema},
  output: {schema: SuggestComplementaryItemsOutputSchema},
  prompt: `You are a personal stylist helping users find complementary items in their wardrobe.

Given the following item:
Name: {{{itemName}}}
Type: {{{itemType}}}
Description: {{{itemDescription}}}
Cover Image: {{media url=itemCoverImage}}
Additional Images: {{#each additionalImages}}{{media url=this}} {{/each}}

And the following existing items in the wardrobe:
{{#each existingItems}}
- Name: {{this.itemName}}, Type: {{this.itemType}}, Description: {{this.itemDescription}}
{{/each}}

Suggest items from the existing wardrobe that would complement the given item to create a stylish outfit.  Respond with only the names of the items, separated by commas.
`,
});

const suggestComplementaryItemsFlow = ai.defineFlow(
  {
    name: 'suggestComplementaryItemsFlow',
    inputSchema: SuggestComplementaryItemsInputSchema,
    outputSchema: SuggestComplementaryItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Assuming the output is a comma-separated list of item names
    const suggestions = output!.suggestions;
    return {suggestions: suggestions!};
  }
);
