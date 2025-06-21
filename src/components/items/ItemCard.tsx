import Image from 'next/image';
import type { Item } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden">
        <Image
          src={item.coverImage}
          alt={item.name}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          {...(item['data-ai-hint'] && { 'data-ai-hint': item['data-ai-hint'] })}
        />
      </div>
      <CardHeader>
        <CardTitle className="truncate text-lg">{item.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}
