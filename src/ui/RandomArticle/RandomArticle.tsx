import "./RandomArticle.css";
import { useAuth } from "../../domain/AuthContext";
import { RandomArticleSkeleton } from "../AppSkeleton/AppSkeleton";
import { useRandomArticle } from "./useRandomArticle";
import { ConfirmModal } from "../shared/ConfirmModal";
import { ShareModal } from "../shared/ShareModal";
import { ModalProvider, useModals } from "./randomArticleModals";
import { RandomArticleCard } from "./RandomArticleCard";
import { FavoriteModal } from "./FavoriteModal.tsx";

export function RandomArticle() {
  return (
    <ModalProvider>
      <RandomArticleInner />
    </ModalProvider>
  );
}

function RandomArticleInner() {
  const { state: modalState, actions: modalActions } = useModals();
  const { user } = useAuth();

  const {
    article,
    loading,
    loadingRead,
    loadingFavorite,
    pickRandom,
    toggleRead,
    toggleFavorite,
    deleteArticle,
  } = useRandomArticle();

  const handleDelete = async (articleId: number) => {
    modalActions.closeConfirm();
    await deleteArticle(articleId);
  };

  const handleToggleRead = async () => {
    await toggleRead();
  };

  const handleToggleFavorite = async () => {
    const markedAsFavorite = await toggleFavorite();
    if (markedAsFavorite) {
      modalActions.openFavorite();
    }
  };

  return (
    <div className="random-article-container">
      <div className="article-container">
        {loading ? (
          <RandomArticleSkeleton />
        ) : (
          <div
            className={`content-card random-article-card ${
              article ? "card-animated" : ""
            }`}
          >
            <RandomArticleCard
              article={article}
              user={user}
              loadingRead={loadingRead}
              loadingFavorite={loadingFavorite}
              onToggleRead={handleToggleRead}
              onToggleFavorite={handleToggleFavorite}
              onOpenShare={modalActions.openShare}
              onOpenConfirm={modalActions.openConfirm}
            />
          </div>
        )}
      </div>
      {article && (
        <button
          onClick={pickRandom}
          className="modern-button button-primary random-article-button"
        >
          Dame otro 🎲
        </button>
      )}

      <ConfirmModal
        open={modalState.confirm}
        onCancel={modalActions.closeConfirm}
        onConfirm={() => {
          if (modalState.articleToDelete !== null) {
            handleDelete(modalState.articleToDelete);
          }
          modalActions.closeConfirm();
        }}
        titleId="confirm-delete-title-random"
        descId="confirm-delete-desc-random"
      />
      <ShareModal
        open={modalState.share}
        article={article}
        onClose={modalActions.closeShare}
        networks={["twitter", "linkedin"]}
        titleId="share-modal-title-random"
      />
      <FavoriteModal
        show={modalState.favorite}
        article={article}
        onClose={modalActions.closeFavorite}
      />
    </div>
  );
}
