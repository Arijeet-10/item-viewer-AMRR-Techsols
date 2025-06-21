'use client';
import { ItemList } from '@/components/items/ItemList';

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ItemList />
    </div>
  );
}
