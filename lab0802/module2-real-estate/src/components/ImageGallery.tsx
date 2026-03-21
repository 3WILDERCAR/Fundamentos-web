import React, { useState } from 'react';
import { ImageModal } from './ImageModal';

interface ImageGalleryProps {
  images: string[];
  propertyTitle: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, propertyTitle }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openModal = (index: number) => setSelectedIndex(index);
  const closeModal = () => setSelectedIndex(null);
  
  const showNext = () => setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
  const showPrev = () => setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Imagen Principal clickable */}
      <div 
        className="relative rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => openModal(0)}
      >
        <img
          src={images[0]}
          alt={propertyTitle}
          className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Grid de thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(1).map((img, index) => (
            <div 
              key={index} 
              className="relative h-24 cursor-pointer overflow-hidden rounded-lg group"
              onClick={() => openModal(index + 1)}
            >
              <img
                src={img}
                alt={`${propertyTitle} - ${index + 2}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      )}

      {selectedIndex !== null && (
        <ImageModal 
          images={images}
          currentIndex={selectedIndex}
          onClose={closeModal}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </div>
  );
};