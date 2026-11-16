import React from "react";
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Hotel pages">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1}>Previous</button>
      {pages.map((number) => (
        <button
          type="button"
          key={number}
          className={number === page ? "page-active" : ""}
          onClick={() => onChange(number)}
          aria-current={number === page ? "page" : undefined}
        >
          {number}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next</button>
    </nav>
  );
}
