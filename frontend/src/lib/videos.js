// Liens vidéo YouTube et Vimeo : la vidéo reste chez YouTube ou Vimeo,
// le site affiche seulement leur lecteur.

const YOUTUBE = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/;
const VIMEO = /^(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/;

export const isVideoUrl = (url) => YOUTUBE.test((url || '').trim()) || VIMEO.test((url || '').trim());

// Adresse du lecteur à mettre dans l'iframe
export const videoEmbedUrl = (url) => {
  const u = (url || '').trim();
  let m = u.match(YOUTUBE);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`;
  m = u.match(VIMEO);
  if (m) return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ''}`;
  return '';
};
