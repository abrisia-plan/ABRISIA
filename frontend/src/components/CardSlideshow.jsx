import React, { useEffect, useRef, useState } from 'react';

// Image de carte qui fait défiler les autres images :
// - ordinateur (souris) : défile quand la souris passe sur la carte, revient à la 1re image ensuite ;
// - téléphone ou tablette (tactile) : change d'image toutes les 10 secondes.
const HOVER_DELAY = 1200;   // ms entre deux images au passage de la souris
const TOUCH_DELAY = 10000;  // ms entre deux images au téléphone

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches;

const CardSlideshow = ({ images = [], alt = '', className = '', imgClassName = '', onError }) => {
  const list = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const hoverMode = useRef(canHover());

  useEffect(() => {
    if (list.length < 2) return undefined;
    if (hoverMode.current && !hovering) return undefined;
    const delay = hoverMode.current ? HOVER_DELAY : TOUCH_DELAY;
    const timer = setInterval(() => setIndex((i) => (i + 1) % list.length), delay);
    return () => clearInterval(timer);
  }, [hovering, list.length]);

  if (list.length === 0) return null;

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => { if (hoverMode.current) { setHovering(true); if (list.length > 1) setIndex(1); } }}
      onMouseLeave={() => { if (hoverMode.current) { setHovering(false); setIndex(0); } }}
    >
      {list.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={i === 0 ? alt : ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          onError={onError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      ))}
      {list.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
          {list.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardSlideshow;
