'use client';

import { useEffect, useState } from 'react';
import type { Item } from '@/types';
import { getOutfitSuggestions } from '@/app/actions';
import { useItems } from '@/context/ItemContext';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';

interface OutfitSuggestionsProps {
  item: Item;
}

export function OutfitSuggestions({ item }: OutfitSuggestionsProps) {
  const { items, getItemById } = useItems();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestedItems, setSuggestedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      
      const allOtherItems = items.filter(i => i.id !== item.id);
      const result = await getOutfitSuggestions(item, allOtherItems);
      
      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions);
        const foundItems = result.suggestions
            .map(name => items.find(i => i.name === name))
            .filter((i): i is Item => !!i);
        setSuggestedItems(foundItems);
      } else {
        setError(result.error || 'Failed to get suggestions.');
      }
      setLoading(false);
    };

    fetchSuggestions();
  }, [item, items, getItemById]);

  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">AI Outfit Suggestions</h3>
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && suggestions.length === 0 && (
         <Alert>
          <ThumbsUp className="h-4 w-4" />
          <AlertTitle>All Set!</AlertTitle>
          <AlertDescription>This item is unique! No specific pairs found, but it's ready to make a statement.</AlertDescription>
        </Alert>
      )}
      {!loading && !error && suggestedItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
            {suggestedItems.map(suggestedItem => (
                <Card key={suggestedItem.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                       <Image src={suggestedItem.coverImage} alt={suggestedItem.name} fill className="object-cover" />
                    </div>
                    <div className="p-2 text-center">
                        <p className="text-sm font-medium truncate">{suggestedItem.name}</p>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
