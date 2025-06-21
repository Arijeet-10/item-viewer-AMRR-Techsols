'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useItems } from '@/context/ItemContext';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const formSchema = z.object({
  name: z.string().min(2, { message: 'Item name must be at least 2 characters.' }),
  type: z.enum(['Shirt', 'Pant', 'Shoes', 'Sports Gear', 'Accessory', 'Other']),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  coverImage: z
    .any()
    .refine(files => files?.length === 1, 'Cover image is required.')
    .refine(files => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(files => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), '.jpg, .jpeg, .png and .webp files are accepted.'),
  additionalImages: z
    .any()
    .optional()
    .refine(files => !files || Array.from(files).every((file: any) => file.size <= MAX_FILE_SIZE), `Max file size is 5MB per image.`)
    .refine(files => !files || Array.from(files).every((file: any) => ACCEPTED_IMAGE_TYPES.includes(file.type)), '.jpg, .jpeg, .png and .webp files are accepted.'),
});

export function AddItemForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useItems();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const coverImageUri = await fileToDataUri(values.coverImage[0]);
      
      let additionalImageUris: string[] = [];
      if (values.additionalImages && values.additionalImages.length > 0) {
        additionalImageUris = await Promise.all(
          Array.from(values.additionalImages).map(file => fileToDataUri(file as File))
        );
      }
      
      addItem({
        name: values.name,
        type: values.type,
        description: values.description,
        coverImage: coverImageUri,
        additionalImages: additionalImageUris,
      });

      toast({
        title: "Success!",
        description: "Item successfully added to your wardrobe.",
        variant: 'default',
      });

      router.push('/');
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Classic Blue Jeans" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Shirt">Shirt</SelectItem>
                      <SelectItem value="Pant">Pant</SelectItem>
                      <SelectItem value="Shoes">Shoes</SelectItem>
                      <SelectItem value="Sports Gear">Sports Gear</SelectItem>
                      <SelectItem value="Accessory">Accessory</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the item, its material, fit, etc." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => {
                        field.onChange(e.target.files);
                        if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (event) => setCoverPreview(event.target?.result as string);
                            reader.readAsDataURL(e.target.files[0]);
                        } else {
                            setCoverPreview(null);
                        }
                    }} />
                  </FormControl>
                  {coverPreview && <Image src={coverPreview} alt="Cover image preview" width={100} height={100} className="mt-2 rounded-md object-cover" />}
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="additionalImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Images</FormLabel>
                   <FormControl>
                    <Input type="file" accept="image/*" multiple onChange={(e) => {
                      field.onChange(e.target.files);
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files);
                        const previewUrls = filesArray.map(file => URL.createObjectURL(file));
                        setAdditionalPreviews(previewUrls);
                      } else {
                        setAdditionalPreviews([]);
                      }
                    }} />
                  </FormControl>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {additionalPreviews.map((src, index) => (
                      <Image key={index} src={src} alt={`Additional image preview ${index + 1}`} width={100} height={100} className="rounded-md object-cover" />
                    ))}
                  </div>
                  <FormDescription>You can upload multiple images.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
