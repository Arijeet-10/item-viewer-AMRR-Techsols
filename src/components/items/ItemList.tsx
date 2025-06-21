
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
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Terminal } from 'lucide-react';

export function ItemList() {
  const { items, loading, error } = useItems();
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

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl py-20">
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Data</AlertTitle>
            <AlertDescription>
                {error}
                <div className="mt-4 text-xs text-left bg-muted p-4 rounded-md font-mono text-muted-foreground">
                    <b>Tip:</b> For development, you need to allow access to your database. Go to your Firebase project, then navigate to <b>Firestore Database &gt; Rules</b> and paste the following, then click <b>Publish</b>:
                    <pre className="mt-2 p-2 bg-background rounded-sm whitespace-pre-wrap">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                </div>
            </AlertDescription>
        </Alert>
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
