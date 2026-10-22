import React from 'react';
import { FileCategory, StudioAppIconId, StudioThemeId } from '../types/merger';
import { THEME_ICON_PALETTES, ThemeIcon } from './ThemeIcon';

interface BrandIconProps {
  appIconId?: StudioAppIconId;
  className?: string;
}

/**
 * Custom desktop studio brand logo / app icon.
 * Remains strictly fixed to `appIconId` (defaulting to the classic signature
 * OmniFuse isometric stack) when switching color themes, and only changes when
 * the user explicitly picks a new App Icon inside the Theme Menu.
 */
export const BrandIcon: React.FC<BrandIconProps> = ({
  appIconId = 'classic-layers',
  className = 'w-6 h-6',
}) => {
  if (appIconId !== 'classic-layers') {
    return <ThemeIcon themeId={appIconId} role="brand" className={className} />;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Classic OmniFuse Signature Squircle Housing */}
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="5.5"
        fill="#18181B"
        stroke="#3F3F46"
        strokeWidth="1.25"
      />
      {/* Back Document Sheet */}
      <rect
        x="5"
        y="4.5"
        width="9.5"
        height="12"
        rx="1.6"
        fill="#52525B"
        stroke="#A1A1AA"
        strokeWidth="1"
      />
      {/* Front Document Sheet */}
      <rect
        x="8"
        y="7"
        width="10"
        height="12.5"
        rx="1.6"
        fill="#FAFAFA"
        stroke="#18181B"
        strokeWidth="1"
      />
      {/* Precision Content Lines */}
      <path
        d="M10.5 10.5H15.5M10.5 13H15.5M10.5 15.5H13.5"
        stroke="#18181B"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      {/* Emerald Fusion Corner Emblem */}
      <circle
        cx="17.5"
        cy="17.5"
        r="3.6"
        fill="#10B981"
        stroke="#18181B"
        strokeWidth="1.2"
      />
      <path
        d="M16.1 17.5H18.9M17.5 16.1V18.9"
        stroke="#FFFFFF"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
};


export const FormatCategoryIcon: React.FC<{
  category: FileCategory;
  themeId?: StudioThemeId;
  className?: string;
}> = ({ category, themeId = 'swiss-zinc', className = 'w-3.5 h-3.5' }) => {
  const spec = THEME_ICON_PALETTES[themeId] || THEME_ICON_PALETTES['swiss-zinc'];

  if (category === 'pdf') {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          rx={spec.shape === 'circle' ? '6.5' : spec.shape === 'squircle' ? '2.5' : '3.5'}
          fill={spec.bg}
          stroke={spec.border}
          strokeWidth="1.2"
        />
        <path
          d="M5 4.5H9L11 6.5V11.5H5V4.5Z"
          stroke={spec.primary}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 8.5H9.5M6.5 10.2H8.5"
          stroke={spec.core}
          strokeWidth="1.2"
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
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          rx={spec.shape === 'circle' ? '6.5' : spec.shape === 'squircle' ? '2.5' : '3.5'}
          fill={spec.bg}
          stroke={spec.border}
          strokeWidth="1.2"
        />
        <circle cx="6" cy="6" r="1.2" fill={spec.core} />
        <path
          d="M3.8 11.5L6.8 8.5L9 10.5L10.8 8.8L12.5 11.5"
          stroke={spec.primary}
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
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx={spec.shape === 'circle' ? '6.5' : spec.shape === 'squircle' ? '2.5' : '3.5'}
        fill={spec.bg}
        stroke={spec.border}
        strokeWidth="1.2"
      />
      <path
        d="M5 5.8H11M5 8.2H11M5 10.6H8.8"
        stroke={spec.primary}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
};
