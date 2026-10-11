import React from 'react';
import { videoEmbedUrl } from '../lib/videos';

// Lecteur vidéo YouTube ou Vimeo, au format 16:9
const VideoEmbed = ({ url, title = 'Vidéo' }) => {
  const src = videoEmbedUrl(url);
  if (!src) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
};

export default VideoEmbed;
