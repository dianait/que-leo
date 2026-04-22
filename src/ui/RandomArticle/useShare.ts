type ShareParams = { url: string; title: string; text?: string };

export function useShare() {
  function share({ url, title, text }: ShareParams) {
    if (navigator.share) {
      navigator.share({ title, url, text }).catch((err) => {
        if (err instanceof Error && err.name !== "AbortError") {
          window.open(url, "_blank");
        }
      });
    } else {
      window.open(url, "_blank");
    }
  }
  return share;
}
