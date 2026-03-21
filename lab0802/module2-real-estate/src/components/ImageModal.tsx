import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev 
}) => {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-6 right-6 text-white hover:bg-white/20 z-[110]"
        onClick={onClose}
      >
        <X className="h-8 w-8" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon"
        className="absolute left-4 md:left-10 text-white hover:bg-white/20 z-[110]"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <ChevronLeft className="h-10 w-10" />
      </Button>

      <div className="relative max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
        <img 
          src={images[currentIndex]} 
          alt={`Imagen ${currentIndex + 1}`} 
          className="max-w-full max-h-[85vh] object-contain select-none" 
        />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white font-medium">
          {currentIndex + 1} de {images.length}
        </div>
      </div>

      <button 
        className="absolute right-4 md:right-10 text-white p-2 hover:bg-white/20 rounded-full z-[110]"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <ChevronRight className="h-10 w-10" />
      </button>
    </div>
  );
};