import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className = '',
}) => {
  /**
   * Build the array of page numbers and ellipsis markers to render.
   * Always shows first page, last page, current page, and `siblingCount`
   * pages on each side of the current page. Gaps are filled with '…'.
   */
  const getPageNumbers = () => {
    // If total pages fit comfortably, show them all
    const totalSlots = siblingCount * 2 + 5; // siblings + current + 2 boundaries + 2 possible ellipses
    if (totalPages <= totalSlots) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    const pages = [];

    // Always include first page
    pages.push(1);

    if (showLeftEllipsis) {
      pages.push('left-ellipsis');
    } else {
      // Fill pages between 1 and leftSibling
      for (let i = 2; i < leftSibling; i++) {
        pages.push(i);
      }
    }

    // Sibling range around current page
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (showRightEllipsis) {
      pages.push('right-ellipsis');
    } else {
      for (let i = rightSibling + 1; i < totalPages; i++) {
        pages.push(i);
      }
    }

    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pages = getPageNumbers();

  const baseButton =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer select-none';
  const sizeStyles = 'w-9 h-9';
  const activeStyles =
    'bg-[var(--color-brand-blue)] text-white shadow-lg shadow-blue-500/10';
  const inactiveStyles =
    'text-[var(--color-brand-text-secondary)] hover:bg-[var(--color-brand-light-blue)] hover:text-[var(--color-brand-blue)]';
  const disabledStyles =
    'opacity-40 pointer-events-none';

  return (
    <nav
      className={`flex items-center justify-center gap-1.5 ${className}`}
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseButton} ${sizeStyles} ${currentPage === 1 ? disabledStyles : inactiveStyles}`}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((page) => {
        if (typeof page === 'string') {
          // Render ellipsis
          return (
            <span
              key={page}
              className={`${baseButton} ${sizeStyles} text-[var(--color-brand-text-secondary)] pointer-events-none`}
              aria-hidden="true"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${baseButton} ${sizeStyles} ${isActive ? activeStyles : inactiveStyles}`}
            aria-label={`Go to page ${page}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseButton} ${sizeStyles} ${currentPage === totalPages ? disabledStyles : inactiveStyles}`}
        aria-label="Go to next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
