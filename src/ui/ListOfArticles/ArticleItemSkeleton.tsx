// import React from "react";
import "./ArticleItemSkeleton.css";

export const ArticleItemSkeleton: React.FC = () => {
  return (
    <li className="skeleton-item">
      <div className="skeleton-line title-skeleton" />
      <div className="skeleton-line date-skeleton" />
    </li>
  );
};
