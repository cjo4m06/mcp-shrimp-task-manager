import React, { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

function ImageLightbox({ isOpen, onClose, images, currentIndex = 0 }) {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  // Format images for lightbox
  const slides = images.map((img) => ({
    src: typeof img === 'string' ? img : img.src,
    title: typeof img === 'string' ? '' : img.title || '',
    description: typeof img === 'string' ? '' : img.description || ''
  }));

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Captions]}
      on={{
        view: ({ index }) => setIndex(index)
      }}
      captions={{
        descriptionTextAlign: 'center',
        descriptionMaxLines: 3
      }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
        captionsDescriptionContainer: { 
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#ffffff'
        }
      }}
    />
  );
}

// Hook to manage lightbox state
export function useLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);

  const openLightbox = (imageList, index = 0) => {
    setImages(imageList);
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    currentIndex,
    images,
    openLightbox,
    closeLightbox
  };
}

export default ImageLightbox;