import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, X, Video } from 'lucide-react';
import { isVideoUrl } from '../lib/videos';
import VideoEmbed from './VideoEmbed';

// Admin : ajouter ou retirer des liens vidéo (YouTube ou Vimeo)
const VideoLinksEditor = ({ videos = [], onChange }) => {
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    const url = link.trim();
    if (!url) return;
    if (!isVideoUrl(url)) {
      setError('Ce lien ne vient pas de YouTube ou de Vimeo.');
      return;
    }
    onChange([...videos, url]);
    setLink('');
    setError('');
  };

  return (
    <div>
      <Label className="font-semibold flex items-center gap-2">
        <Video className="w-4 h-4" /> Vidéos (optionnel)
      </Label>
      <p className="text-xs text-gray-500 mt-1">
        Mettez la vidéo sur YouTube (elle peut être « non répertoriée »), puis collez son lien ici.
      </p>
      <div className="flex gap-2 mt-2">
        <Input
          value={link}
          onChange={(e) => { setLink(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="https://youtu.be/..."
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {videos.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((url, i) => (
            <div key={`${i}-${url}`} className="relative">
              <VideoEmbed url={url} title={`Vidéo ${i + 1}`} />
              <Button
                type="button" variant="destructive" size="icon"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={() => onChange(videos.filter((_, j) => j !== i))}
                aria-label="Retirer la vidéo"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoLinksEditor;
