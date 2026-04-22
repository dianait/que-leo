// Hook para compartir usando Web Share API o fallback
type ShareParams = { url: string; title: string; text?: string };

export function useShare() {
  function share({ url, title, text }: ShareParams) {
    if (navigator.share) {
      navigator.share({ title, url, text });
    } else {
      window.open(url, "_blank");
    }
  }
  return share;
}
