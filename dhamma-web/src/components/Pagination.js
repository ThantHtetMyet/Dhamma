import React from "react";
import "./Pagination.css";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  pageSize,
  onPageSizeChange 
}) {
  if (totalItems === 0) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Logic to show only a subset of pages if there are many
  const renderPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage > delta + 2) {
      range.unshift("...");
    }
    if (currentPage < totalPages - delta - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range.map((p, idx) => (
      <button
        key={idx}
        className={`pagination-btn ${p === currentPage ? "active" : ""} ${p === "..." ? "dots" : ""}`}
        onClick={() => p !== "..." && onPageChange(p)}
        disabled={p === "..."}
      >
        {p}
      </button>
    ));
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</strong> to <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> entries
      </div>
      
      <div className="pagination-controls">
        <button 
          className="pagination-btn nav-btn" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        <div className="pagination-numbers">
          {renderPageNumbers()}
        </div>

        <button 
          className="pagination-btn nav-btn" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>

        {onPageSizeChange && (
          <select 
            className="pagination-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        )}
      </div>
    </div>
  );
}
