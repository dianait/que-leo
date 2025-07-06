export interface Article {
  readonly id: number | string;
  readonly title: string;
  readonly url: string;
  readonly dateAdded: Date;
  readonly isRead: boolean;
  readonly readAt?: Date;
  readonly language?: string;
  readonly authors?: string[];
  readonly topics?: string[];
  readonly less_15?: boolean;
  readonly featuredImage?: string;
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
