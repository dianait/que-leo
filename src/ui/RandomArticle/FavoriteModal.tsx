import type { Article } from "../../domain/Article";
import { ShareModal } from "../shared/ShareModal";

export function FavoriteModal({
  article,
  show,
  onClose,
}: {
  article: Article | null;
  show: boolean;
  onClose: () => void;
}) {
  return (
    <ShareModal
      open={show}
      article={article}
      onClose={onClose}
      title="¡Genial! ⭐"
      description={
        <>
          Has guardado este artículo como favorito.
          <br />
          Compartir es vivir ✨
        </>
      }
      shareText={(item) => `¡He guardado como favorito: ${item.title}!`}
      networks={["twitter", "linkedin"]}
      titleId="favorite-modal-title"
    />
  );
}
