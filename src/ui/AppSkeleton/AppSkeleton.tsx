// import React from "react";
import "./AppSkeleton.css";

export const AppSkeleton: React.FC = () => {
  return (
    <div className="skeleton-wrapper">
      {/* Skeleton for the main content area */}
      <main className="skeleton-main-content">
        {/* Header Skeleton */}
        <header className="skeleton-header">
          <div className="skeleton-header-content-wrapper">
            <div className="skeleton-header-left">
              <div className="skeleton-line title" />
              <div className="skeleton-line subtitle" />
            </div>
            <div className="skeleton-avatar" />
          </div>
        </header>

        {/* Random Article Skeleton */}
        <div className="skeleton-random-article-card">
          <div className="skeleton-line card-title" />
          <div className="skeleton-line card-button" />
          <div className="skeleton-line card-date" />
        </div>
        <div className="skeleton-main-button" />
      </main>

      {/* Sidebar Skeleton */}
      <aside className="skeleton-sidebar">
        <div className="skeleton-sidebar-header">
          <div className="skeleton-line large-title" />
        </div>
        <ul className="skeleton-sidebar-list">
          {[...Array(8)].map((_, index) => (
            <li key={index} className="skeleton-sidebar-item">
              <div className="skeleton-line item-title" />
              <div className="skeleton-line item-subtitle" />
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};
