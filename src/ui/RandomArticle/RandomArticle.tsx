import "./RandomArticle.css";
import { useAuth } from "../../domain/AuthContext";
import { RandomArticleSkeleton } from "../AppSkeleton/AppSkeleton";
import { useRandomArticle } from "./useRandomArticle";
import { ConfirmModal } from "../shared/ConfirmModal";
import { ShareModal } from "../shared/ShareModal";
import { ModalProvider, useModals } from "./randomArticleModals";
import { RandomArticleCard } from "./RandomArticleCard";
import { FavoriteModal } from "./FavoriteModal.tsx";
import { AiSearch } from "../AiSearch/AiSearch";
import { useReadPrompt } from "./useReadPrompt";

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
    showSearchResults,
    toggleRead,
    toggleFavorite,
    deleteArticle,
  } = useRandomArticle();

  const readPrompt = useReadPrompt(article);

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
      {article && <AiSearch onShowResults={showSearchResults} />}
      <div className="article-container">
        {loading ? (
          <RandomArticleSkeleton />
        ) : (
          <div
            // A new key per article replays the entrance animation.
            key={article?.id ?? "empty"}
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
              onOpenArticle={readPrompt.notifyOpened}
            />
            {readPrompt.visible && (
              <div className="read-prompt" role="status">
                <span>¿Lo has leído? 📖</span>
                <div className="read-prompt-actions">
                  <button
                    type="button"
                    className="read-prompt-yes"
                    disabled={loadingRead}
                    onClick={async () => {
                      if (await toggleRead()) readPrompt.dismiss();
                    }}
                  >
                    ✅ Sí, marcar leído
                  </button>
                  <button
                    type="button"
                    className="read-prompt-no"
                    onClick={readPrompt.dismiss}
                  >
                    Todavía no
                  </button>
                </div>
              </div>
            )}
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
