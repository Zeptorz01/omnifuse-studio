import React from 'react';
import { FileCategory } from '../types/merger';

interface BrandIconProps {
  className?: string;
}

/**
 * Custom geometric desktop studio icon representing multiple document & image layers
 * converging into one unified master sheet.
 */
export const BrandIcon: React.FC<BrandIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Tactile dark anodized squircle base */}
      <rect width="32" height="32" rx="7" fill="#18181B" />
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="6"
        stroke="#3F3F46"
        strokeWidth="1"
      />
      {/* Back sheet layer */}
      <path
        d="M8.5 19.5L16 23.5L23.5 19.5"
        stroke="#71717A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle image/doc layer */}
      <path
        d="M8.5 15.25L16 19.25L23.5 15.25"
        stroke="#D4D4D8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top master unified diamond sheet */}
      <path
        d="M8.5 11L16 7L23.5 11L16 15L8.5 11Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

export const FormatCategoryIcon: React.FC<{
  category: FileCategory;
  className?: string;
}> = ({ category, className = 'w-3.5 h-3.5' }) => {
  if (category === 'pdf') {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M3.5 2h6l3 3v9a.5.5 0 0 1-.5.5h-8.5a.5.5 0 0 1-.5-.5V2.5A.5.5 0 0 1 3.5 2Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M9 2v3.5h3.5M5.5 8.5h5M5.5 11h3.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (category === 'image') {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <rect
          x="2.25"
          y="2.75"
          width="11.5"
          height="10.5"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="5.75" cy="6.25" r="1.1" fill="currentColor" />
        <path
          d="M2.75 11.5l3.25-3 2.5 2.25 2-1.75 2.75 2.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="2.25"
        width="11"
        height="11.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M5 5.75h6M5 8.25h6M5 10.75h4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
};
