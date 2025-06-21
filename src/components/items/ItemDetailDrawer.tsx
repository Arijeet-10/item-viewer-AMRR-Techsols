'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import type { Item } from '@/types';
import { ImageCarousel } from './ImageCarousel';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { OutfitSuggestions } from './OutfitSuggestions';
import { handleEnquiry } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useItems } from '@/context/ItemContext';

interface ItemDetailDrawerProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailDrawer({ item, isOpen, onClose }: ItemDetailDrawerProps) {
  const [isEnquiring, setIsEnquiring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { deleteItem } = useItems();

  if (!item) {
    return null;
  }

  const onEnquireClick = async () => {
    if (!item) return;

    setIsEnquiring(true);
    try {
        const result = await handleEnquiry(item);
    
        if (result.success) {
          toast({
            title: 'Success!',
            description: result.message,
            variant: 'default',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message,
          });
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred.',
          });
    } finally {
        setIsEnquiring(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setIsDeleting(true);
    try {
      const result = await deleteItem(item.id);
      if (result.success) {
        toast({
          title: 'Deleted!',
          description: 'The item has been removed from your wardrobe.',
        });
        onClose();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not delete the item. Please try again.',
        });
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while deleting the item.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const allImages = [item.coverImage, ...item.additionalImages];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <Badge variant="secondary" className="w-fit mb-2">{item.type}</Badge>
          <SheetTitle className="text-2xl font-bold">{item.name}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <ImageCarousel images={allImages} alt={item.name} />
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
          <Separator />
          <OutfitSuggestions item={item} />
        </div>
        <SheetFooter className="p-6 bg-background border-t sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete "{item.name}"
                  from your wardrobe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="button" onClick={onEnquireClick} disabled={isEnquiring}>
            {isEnquiring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enquire
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
