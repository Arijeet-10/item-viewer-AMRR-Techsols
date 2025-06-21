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

interface ItemDetailDrawerProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailDrawer({ item, isOpen, onClose }: ItemDetailDrawerProps) {
  if (!item) {
    return null;
  }

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
        <SheetFooter className="p-6 bg-background border-t">
          <Button type="button" className="w-full">Enquire</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
