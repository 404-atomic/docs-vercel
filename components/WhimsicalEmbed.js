import React, { useEffect, useRef } from 'react';

export default function WhimsicalEmbed({ src, width = 800, height = 450 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = width;
    iframe.height = height;
    iframe.style.border = 'none';
    
    // Clear the container and append the iframe
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(iframe);
  }, [src, width, height]);

  return <div ref={containerRef} style={{ marginTop: '20px', marginBottom: '20px' }} />;
} 