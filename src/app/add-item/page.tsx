import { AddItemForm } from '@/components/items/AddItemForm';

export default function AddItemPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Add a New Item</h1>
            <p className="mt-2 text-lg text-muted-foreground">Fill out the form below to add a new piece to your digital wardrobe.</p>
        </div>
        <AddItemForm />
      </div>
    </div>
  );
}
