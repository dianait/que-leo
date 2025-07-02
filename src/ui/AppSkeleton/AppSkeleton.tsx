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
    </div>
  );
};

export const ArticleTableSkeleton: React.FC = () => {
  return (
    <div className="skeleton-articles-table-container">
      <div className="skeleton-table-responsive">
        <table className="skeleton-articles-table">
          <thead>
            <tr>
              <th>
                <div
                  className="skeleton-line skeleton-th"
                  style={{ width: "60%" }}
                />
              </th>
              <th>
                <div
                  className="skeleton-line skeleton-th"
                  style={{ width: "40%" }}
                />
              </th>
              <th>
                <div
                  className="skeleton-line skeleton-th"
                  style={{ width: "50%" }}
                />
              </th>
              <th>
                <div
                  className="skeleton-line skeleton-th"
                  style={{ width: "30%" }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(15)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div
                    className="skeleton-line skeleton-td"
                    style={{ width: "90%" }}
                  />
                </td>
                <td>
                  <div
                    className="skeleton-line skeleton-td"
                    style={{ width: "60%" }}
                  />
                </td>
                <td>
                  <div
                    className="skeleton-line skeleton-td"
                    style={{ width: "80%" }}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div
                      className="skeleton-line skeleton-btn"
                      style={{ width: 60, height: 28, borderRadius: 8 }}
                    />
                    <div
                      className="skeleton-line skeleton-btn"
                      style={{ width: 60, height: 28, borderRadius: 8 }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const RandomArticleSkeleton: React.FC = () => {
  return (
    <div className="skeleton-random-article-card">
      <div className="skeleton-line card-title" />
      <div className="skeleton-line card-button" />
      <div className="skeleton-line card-date" />
    </div>
  );
};
