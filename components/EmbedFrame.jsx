import React from 'react';

export default function EmbedFrame({ url }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '450px', marginTop: '20px', marginBottom: '20px' }}>
      <iframe
        src={url}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Embedded content"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
} 