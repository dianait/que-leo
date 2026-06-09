export type ArticleListFilters = {
  searchTerm?: string;
  readFilter?: "all" | "unread" | "read";
  favoriteFilter?: "all" | "favorites";
};
