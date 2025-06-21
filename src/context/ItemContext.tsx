
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Item } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, type QueryDocumentSnapshot, type DocumentData, FirestoreError, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initialItems } from '@/lib/initial-data';

type ItemContextType = {
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => Promise<{ success: boolean; error?: unknown }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: unknown }>;
  getItemById: (id: string) => Item | undefined;
  loading: boolean;
  error: string | null;
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function ItemProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn("Firebase project ID is not configured. Skipping Firestore connection. Using initial data.");
      setItems(initialItems);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData: Item[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        itemsData.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          description: data.description,
          coverImage: data.coverImage,
          additionalImages: data.additionalImages,
          'data-ai-hint': data['data-ai-hint'],
        });
      });
      
      // Combine database items with static items, avoiding duplicates based on item name.
      const dbItemNames = new Set(itemsData.map(item => item.name));
      const uniqueInitialItems = initialItems.filter(item => !dbItemNames.has(item.name));
      
      // Items from the database are sorted by creation date. Show them first,
      // followed by the unique static items.
      setItems([...itemsData, ...uniqueInitialItems]);
      
      setError(null);
      setLoading(false);
    }, (err) => {
        console.error("Error fetching items from Firestore:", err);
        if (err instanceof FirestoreError && err.code === 'permission-denied') {
            setItems(initialItems); // Fallback to initial data
            toast({
                variant: 'destructive',
                title: 'Permission Denied',
                description: 'Your Firestore security rules do not allow reading. Displaying sample data instead.',
            });
            setError(null); // Don't block UI with an error screen
        } else {
            setError("Could not fetch items from the database.");
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const addItem = async (newItemData: Omit<Item, 'id'>): Promise<{ success: boolean; error?: unknown }> => {
     if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn("Firebase not configured. Adding item locally for demo purposes.");
      const newItem = { ...newItemData, id: new Date().toISOString() };
      setItems(prevItems => [newItem, ...prevItems]);
      toast({
        title: "Sample Mode",
        description: "Item added to local view. It will not be saved to a database.",
      });
      return { success: true };
    }
    try {
      await addDoc(collection(db, "items"), {
        ...newItemData,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.error("Error adding document to Firestore: ", err);
      if (err instanceof FirestoreError && err.code === 'permission-denied') {
         toast({
            variant: 'destructive',
            title: 'Permission Denied',
            description: (
              <div className="text-xs text-left">
                <p className="mb-2">Your security rules are blocking you from adding items. To fix this, go to your Firebase project, then <b>Firestore Database &gt; Rules</b> and paste the following, then click <b>Publish</b>:</p>
                <pre className="mt-2 p-2 bg-destructive-foreground/10 rounded-sm whitespace-pre-wrap font-mono">
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
            ),
         });
      }
      return { success: false, error: err };
    }
  };

  const deleteItem = async (id: string): Promise<{ success: boolean; error?: unknown }> => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn("Firebase not configured. Deleting item locally for demo purposes.");
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      toast({
        title: "Sample Mode",
        description: "Item deleted from local view.",
      });
      return { success: true };
    }

    try {
      await deleteDoc(doc(db, "items", id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting document from Firestore: ", err);
      if (err instanceof FirestoreError && err.code === 'permission-denied') {
         toast({
            variant: 'destructive',
            title: 'Permission Denied',
            description: "Your security rules are blocking you from deleting items."
         });
      }
      return { success: false, error: err };
    }
  };
  
  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  return (
    <ItemContext.Provider value={{ items, addItem, deleteItem, getItemById, loading, error }}>
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
}
