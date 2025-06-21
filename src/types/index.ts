export type Item = {
  id: string;
  name: string;
  type: 'Shirt' | 'Pant' | 'Shoes' | 'Sports Gear' | 'Accessory' | 'Other';
  description: string;
  coverImage: string; // Can be a URL or a data URI
  additionalImages: string[]; // Can be URLs or data URIs
  'data-ai-hint'?: string;
};
