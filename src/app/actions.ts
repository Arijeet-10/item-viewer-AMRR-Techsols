'use server';

import { suggestComplementaryItems, type SuggestComplementaryItemsInput } from '@/ai/flows/suggest-complementary-items';
import { sendEnquiry } from '@/ai/flows/send-enquiry-flow';
import type { Item } from '@/types';

async function imageUrlToDataUri(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const dataURI = `data:${blob.type};base64,${buffer.toString('base64')}`;
    return dataURI;
  } catch (error) {
    console.error("Error converting image URL to data URI:", error);
    // Return a placeholder or handle the error as appropriate
    return "";
  }
}

export async function getOutfitSuggestions(currentItem: Item, existingItems: Item[]) {
  try {
    const itemCoverImage = currentItem.coverImage.startsWith('data:image')
      ? currentItem.coverImage
      : await imageUrlToDataUri(currentItem.coverImage);

    const additionalImages = await Promise.all(
       (currentItem.additionalImages || []).map(img =>
         img.startsWith('data:image') ? img : imageUrlToDataUri(img)
       )
    );

    const input: SuggestComplementaryItemsInput = {
      itemName: currentItem.name,
      itemType: currentItem.type,
      itemDescription: currentItem.description,
      itemCoverImage,
      additionalImages,
      existingItems: existingItems
        .filter(item => item.id !== currentItem.id)
        .map(item => ({
          itemName: item.name,
          itemType: item.type,
          itemDescription: item.description,
        })),
    };

    const result = await suggestComplementaryItems(input);
    return { success: true, suggestions: result.suggestions };
  } catch (error) {
    console.error('Error getting outfit suggestions:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function handleEnquiry(item: Item) {
  try {
    const result = await sendEnquiry({
      itemName: item.name,
      itemType: item.type,
      itemDescription: item.description,
    });
    return { success: result.success, message: result.message || 'Enquiry sent.' };
  } catch (error) {
    console.error('Error handling enquiry:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to send enquiry: ${errorMessage}` };
  }
}
