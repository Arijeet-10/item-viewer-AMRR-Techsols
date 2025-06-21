
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Item } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';

type ItemContextType = {
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  getItemById: (id: string) => Item | undefined;
  loading: boolean;
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function ItemProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn("Firebase project ID is not configured. Skipping Firestore connection. Using initial data.");
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
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching items from Firestore:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addItem = async (newItemData: Omit<Item, 'id'>) => {
     if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error("Firebase is not configured. Cannot add item.");
    }
    try {
      await addDoc(collection(db, "items"), {
        ...newItemData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
      throw error;
    }
  };
  
  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  return (
    <ItemContext.Provider value={{ items, addItem, getItemById, loading }}>
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
