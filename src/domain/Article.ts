export interface Article {
  readonly id: number | string;
  readonly title: string;
  readonly url: string;
  readonly dateAdded: Date;
  readonly isRead: boolean;
  readonly readAt?: Date;
  readonly isFavorite?: boolean;
  readonly language?: string;
  readonly authors?: string[];
  readonly topics?: string[];
  readonly less_15?: boolean;
  readonly featuredImage?: string;
  readonly aiRating?: number;
  readonly aiRatingReason?: string;
}

export const markArticleAsRead = (article: Article): Article => {
  return {
    ...article,
    isRead: true,
    readAt: new Date(),
  };
};

export const markArticleAsUnread = (article: Article): Article => {
  return {
    ...article,
    isRead: false,
    readAt: undefined,
  };
};

export const markArticleAsFavorite = (article: Article): Article => {
  return {
    ...article,
    isFavorite: true,
  };
};

export const markArticleAsUnfavorite = (article: Article): Article => {
  return {
    ...article,
    isFavorite: false,
  };
};

export const compareArticlesByAiRating = (
  a: Article,
  b: Article,
  secondaryByReadAt = false
): number => {
  const aRating = a.aiRating ?? -1;
  const bRating = b.aiRating ?? -1;
  if (bRating !== aRating) return bRating - aRating;

  const aTime = secondaryByReadAt
    ? a.readAt
      ? new Date(a.readAt).getTime()
      : 0
    : new Date(a.dateAdded).getTime();
  const bTime = secondaryByReadAt
    ? b.readAt
      ? new Date(b.readAt).getTime()
      : 0
    : new Date(b.dateAdded).getTime();

  return bTime - aTime;
};

export const sortArticlesByAiRating = (
  articles: Article[],
  secondaryByReadAt = false
): Article[] =>
  [...articles].sort((a, b) =>
    compareArticlesByAiRating(a, b, secondaryByReadAt)
  );
