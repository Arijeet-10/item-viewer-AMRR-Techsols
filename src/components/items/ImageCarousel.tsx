'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  }

  if (!images || images.length === 0) {
    return (
       <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center">
         <p className="text-muted-foreground">No image available</p>
       </div>
    );
  }

  return (
    <div className="relative w-full aspect-square group">
      <div className="w-full h-full rounded-lg overflow-hidden">
        {images.map((image, index) => (
           <div
            key={index}
            className={cn(
              "w-full h-full absolute transition-opacity duration-500 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0"
            )}
          >
            <Image
              src={image}
              alt={`${alt} - image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
            <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
            onClick={goToPrevious}
            >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous image</span>
            </Button>
            <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
            onClick={goToNext}
            >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next image</span>
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {images.map((_, slideIndex) => (
                    <button 
                        key={slideIndex} 
                        onClick={() => goToSlide(slideIndex)}
                        className={cn(
                            "h-2 w-2 rounded-full transition-colors",
                            currentIndex === slideIndex ? 'bg-primary' : 'bg-primary/50'
                        )}
                        aria-label={`Go to image ${slideIndex + 1}`}
                    />
                ))}
            </div>
        </>
      )}
    </div>
  );
}
