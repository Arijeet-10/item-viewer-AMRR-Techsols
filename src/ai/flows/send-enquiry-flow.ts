'use server';
/**
 * @fileOverview An AI agent for handling user enquiries about wardrobe items.
 *
 * - sendEnquiry - A function that generates and "sends" an enquiry email.
 * - SendEnquiryInput - The input type for the sendEnquiry function.
 * - SendEnquiryOutput - The return type for the sendEnquiry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendEnquiryInputSchema = z.object({
  itemName: z.string().describe('The name of the item.'),
  itemType: z.string().describe('The type of the item (e.g., Shirt, Pants, Shoes).'),
  itemDescription: z.string().describe('A detailed description of the item.'),
});
export type SendEnquiryInput = z.infer<typeof SendEnquiryInputSchema>;

const SendEnquiryOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendEnquiryOutput = z.infer<typeof SendEnquiryOutputSchema>;

export async function sendEnquiry(input: SendEnquiryInput): Promise<SendEnquiryOutput> {
  return sendEnquiryFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'sendEnquiryPrompt',
  input: {schema: SendEnquiryInputSchema},
  prompt: `You are an administrative assistant for an online wardrobe management app called "Item Viewer".
A user has just clicked "Enquire" on one of their items.
Generate a professional and friendly email body for an internal enquiry.

The email should be addressed to the support team at 'enquiries@wardrobewizard.com'.
The subject line should be "New Item Enquiry: {{{itemName}}}".
The body should clearly state the item's details and that a user has shown interest.

Item Details:
- Name: {{{itemName}}}
- Type: {{{itemType}}}
- Description: {{{itemDescription}}}

Generate only the body of the email.
`,
});

const sendEnquiryFlow = ai.defineFlow(
  {
    name: 'sendEnquiryFlow',
    inputSchema: SendEnquiryInputSchema,
    outputSchema: SendEnquiryOutputSchema,
  },
  async input => {
    const {text: emailBody} = await emailPrompt(input);
    const to = 'enquiries@wardrobewizard.com';
    const subject = `New Item Enquiry: ${input.itemName}`;

    // In a real application, you would integrate with an email service like SendGrid or Mailgun here.
    // For this demo, we will simulate sending the email by logging it to the console.
    console.log('--- SIMULATING EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('---');
    console.log(emailBody);
    console.log('--- EMAIL SIMULATION END ---');

    return {
      success: true,
      message: 'Your enquiry has been sent successfully!',
    };
  }
);
