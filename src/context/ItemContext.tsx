'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { Item } from '@/types';
import { initialItems } from '@/lib/initial-data';

type ItemContextType = {
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => void;
  getItemById: (id: string) => Item | undefined;
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function ItemProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(initialItems);

  const addItem = (newItemData: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...newItemData,
      id: new Date().toISOString() + Math.random(),
    };
    setItems(prevItems => [newItem, ...prevItems]);
  };
  
  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  return (
    <ItemContext.Provider value={{ items, addItem, getItemById }}>
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
