
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useItems } from '@/context/ItemContext';
import { ItemCard } from './ItemCard';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import type { Item } from '@/types';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader } from '../ui/card';

export function ItemList() {
  const { items, loading } = useItems();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    // Delay clearing selected item to allow drawer to animate out
    setTimeout(() => {
      setSelectedItem(null);
    }, 300);
  };

  if (loading) {
    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <div className="aspect-square">
              <Skeleton className="w-full h-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-7 w-3/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-foreground">Your wardrobe is empty!</h2>
        <p className="mt-2 text-muted-foreground">Add your first item to get started.</p>
        <Button asChild className="mt-6">
          <Link href="/add-item">Add Item</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <ItemCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
        ))}
      </div>
      <ItemDetailDrawer
        item={selectedItem}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
      />
    </>
  );
}
