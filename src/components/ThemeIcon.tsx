import React from 'react';
import { StudioThemeId } from '../types/merger';

export type ThemeIconRole =
  | 'brand'
  | 'merge'
  | 'queue'
  | 'composer'
  | 'presets'
  | 'history'
  | 'settings'
  | 'upload'
  | 'note'
  | 'batch'
  | 'preview'
  | 'parameters'
  | 'guide';

interface ThemePaletteSpec {
  bg: string;
  border: string;
  primary: string;
  secondary: string;
  core: string;
  shape:
    | 'classic'
    | 'squircle'
    | 'octagon'
    | 'crystal'
    | 'circle'
    | 'leaf'
    | 'jewel'
    | 'shield'
    | 'porthole'
    | 'medallion'
    | 'blossom';
}

export const THEME_ICON_PALETTES: Record<StudioThemeId, ThemePaletteSpec> = {
  'classic-layers': {
    bg: '#18181B',
    border: '#10B981',
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    core: '#10B981',
    shape: 'classic',
  },
  'swiss-zinc': {
    bg: '#18181B',
    border: '#52525B',
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    core: '#34D399',
    shape: 'squircle',
  },
  'midnight-carbon': {
    bg: '#09090B',
    border: '#10B981',
    primary: '#34D399',
    secondary: '#059669',
    core: '#ECFDF5',
    shape: 'octagon',
  },
  'nordic-frost': {
    bg: '#0C4A6E',
    border: '#38BDF8',
    primary: '#E0F2FE',
    secondary: '#38BDF8',
    core: '#FFFFFF',
    shape: 'crystal',
  },
  'amber-darkroom': {
    bg: '#27170A',
    border: '#F59E0B',
    primary: '#FDE68A',
    secondary: '#F59E0B',
    core: '#FFFBEB',
    shape: 'circle',
  },
  'emerald-terminal': {
    bg: '#064E3B',
    border: '#10B981',
    primary: '#A7F3D0',
    secondary: '#34D399',
    core: '#ECFDF5',
    shape: 'leaf',
  },
  'amethyst-pro': {
    bg: '#2E1065',
    border: '#A855F7',
    primary: '#F3E8FF',
    secondary: '#C084FC',
    core: '#FFFFFF',
    shape: 'jewel',
  },
  'crimson-velvet': {
    bg: '#450A0A',
    border: '#EF4444',
    primary: '#FECACA',
    secondary: '#F87171',
    core: '#FFF1F2',
    shape: 'shield',
  },
  'ocean-abyss': {
    bg: '#083344',
    border: '#06B6D4',
    primary: '#CFFAFE',
    secondary: '#22D3EE',
    core: '#FFFFFF',
    shape: 'porthole',
  },
  'cyber-gold': {
    bg: '#1C1917',
    border: '#EAB308',
    primary: '#FEF08A',
    secondary: '#FACC15',
    core: '#FFFFFF',
    shape: 'medallion',
  },
  'sakura-neon': {
    bg: '#4A044E',
    border: '#EC4899',
    primary: '#FBCFE8',
    secondary: '#F472B6',
    core: '#FFF1F2',
    shape: 'blossom',
  },
};

function renderThemeBadgeFrame(spec: ThemePaletteSpec) {
  switch (spec.shape) {
    case 'classic':
      return (
        <>
          <rect
            x="1.2"
            y="1.2"
            width="21.6"
            height="21.6"
            rx="5.5"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <circle cx="19" cy="5" r="1.4" fill={spec.core} />
        </>
      );
    case 'octagon':
      return (
        <>
          <polygon
            points="7,1 17,1 23,7 23,17 17,23 7,23 1,17 1,7"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <circle cx="4.5" cy="4.5" r="0.8" fill={spec.secondary} />
          <circle cx="19.5" cy="4.5" r="0.8" fill={spec.secondary} />
          <circle cx="4.5" cy="19.5" r="0.8" fill={spec.secondary} />
          <circle cx="19.5" cy="19.5" r="0.8" fill={spec.secondary} />
        </>
      );
    case 'crystal':
      return (
        <>
          <polygon
            points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <polygon
            points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"
            stroke={spec.secondary}
            strokeWidth="0.6"
            strokeDasharray="2 2"
            fill="none"
          />
        </>
      );
    case 'circle':
      return (
        <>
          <circle
            cx="12"
            cy="12"
            r="10.8"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="12"
            r="8.8"
            stroke={spec.secondary}
            strokeWidth="0.7"
            strokeDasharray="1.5 2"
            fill="none"
          />
        </>
      );
    case 'leaf':
      return (
        <>
          <path
            d="M4 12C4 5.5 9.5 1.5 19.5 2.5C21.5 11.5 18 19.5 12 21.5C6.5 23 4 17.5 4 12Z"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="6.5"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <path
            d="M4 20L7 17M20 4L17 7"
            stroke={spec.secondary}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </>
      );
    case 'jewel':
      return (
        <>
          <polygon
            points="6,1.5 18,1.5 22.5,8 12,22.5 1.5,8"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="5.5"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <path
            d="M5 4.5H19L21 8.5L12 20.5L3 8.5L5 4.5Z"
            stroke={spec.secondary}
            strokeWidth="0.65"
            fill="none"
          />
        </>
      );
    case 'shield':
      return (
        <>
          <path
            d="M3 4.5L12 1.8L21 4.5V12.5C21 17.8 17 21.2 12 22.5C7 21.2 3 17.8 3 12.5V4.5Z"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </>
      );
    case 'porthole':
      return (
        <>
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="8"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.5"
          />
          <circle cx="12" cy="3.4" r="0.8" fill={spec.secondary} />
          <circle cx="12" cy="20.6" r="0.8" fill={spec.secondary} />
          <circle cx="3.4" cy="12" r="0.8" fill={spec.secondary} />
          <circle cx="20.6" cy="12" r="0.8" fill={spec.secondary} />
        </>
      );
    case 'medallion':
      return (
        <>
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="5"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.5"
          />
          <rect
            x="3.3"
            y="3.3"
            width="17.4"
            height="17.4"
            rx="3.2"
            stroke={spec.secondary}
            strokeWidth="0.7"
            fill="none"
          />
        </>
      );
    case 'blossom':
      return (
        <>
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="7.5"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.5"
          />
          <circle cx="5" cy="5" r="1" fill={spec.secondary} />
          <circle cx="19" cy="19" r="1" fill={spec.secondary} />
        </>
      );
    case 'squircle':
    default:
      return (
        <>
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="4.5"
            fill={spec.bg}
            stroke={spec.border}
            strokeWidth="1.4"
          />
          <path
            d="M4 6.5V4H6.5M17.5 4H20V6.5M20 17.5V20H17.5M6.5 20H4V17.5"
            stroke={spec.secondary}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </>
      );
  }
}

/**
 * Renders the theme's signature Merge Files icon inside the badge.
 * Each of the 10 themes has a unique Merge Files icon geometry!
 */
function renderThemeMergeGlyph(themeId: StudioThemeId, spec: ThemePaletteSpec) {
  switch (themeId) {
    case 'classic-layers':
      // Original OmniFuse dual document stack with emerald fusion badge
      return (
        <>
          <rect
            x="5.5"
            y="5"
            width="8.5"
            height="10.5"
            rx="1.5"
            fill={spec.secondary}
          />
          <rect
            x="8.2"
            y="7.2"
            width="9.2"
            height="11.2"
            rx="1.5"
            fill={spec.primary}
            stroke={spec.bg}
            strokeWidth="1"
          />
          <circle cx="16.8" cy="16.8" r="2.8" fill={spec.core} />
          <path
            d="M15.6 16.8H18M16.8 15.6V18"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      );

    case 'swiss-zinc':
      // Architectural isometric sheets converging into a unified master sheet
      return (
        <>
          <path
            d="M6.5 9L12 6L17.5 9L12 12L6.5 9Z"
            fill={spec.primary}
          />
          <path
            d="M6.5 12.8L12 15.8L17.5 12.8"
            stroke={spec.secondary}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 16L12 19L17.5 16"
            stroke={spec.core}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );

    case 'midnight-carbon':
      // Cyber circuit traces converging into a central glowing fusion core
      return (
        <>
          <path
            d="M6 7.5H9.5L12 10.5L14.5 7.5H18"
            stroke={spec.primary}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 16.5H9.5L12 13.5L14.5 16.5H18"
            stroke={spec.secondary}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="9.5"
            y="9.5"
            width="5"
            height="5"
            rx="1"
            fill={spec.core}
            stroke={spec.border}
            strokeWidth="1.2"
          />
        </>
      );

    case 'nordic-frost':
      // Crystalline snowflake twin prisms locking into a central diamond
      return (
        <>
          <path
            d="M12 5L15.5 9.5L12 14L8.5 9.5L12 5Z"
            fill={spec.secondary}
          />
          <path
            d="M12 10L16.5 14.5L12 19L7.5 14.5L12 10Z"
            fill={spec.primary}
          />
          <path
            d="M7 12H17"
            stroke={spec.core}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      );

    case 'amber-darkroom':
      // Camera aperture shutter blades converging onto a central golden sheet
      return (
        <>
          <circle
            cx="12"
            cy="12"
            r="5.2"
            stroke={spec.primary}
            strokeWidth="1.5"
          />
          <path
            d="M12 6.8L14.5 11.2M17.2 12L12.8 14.5M12 17.2L9.5 12.8M6.8 12L11.2 9.5"
            stroke={spec.secondary}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.1" fill={spec.core} />
        </>
      );

    case 'emerald-terminal':
      // Twin botanical origami leaves folding into one unified stem
      return (
        <>
          <path
            d="M6.5 8C6.5 8 10.5 7.5 12 11.5C13.5 7.5 17.5 8 17.5 8C17.5 12.5 14.5 15.5 12 17.5C9.5 15.5 6.5 12.5 6.5 8Z"
            fill={spec.secondary}
            stroke={spec.primary}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M12 7V18.5"
            stroke={spec.core}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      );

    case 'amethyst-pro':
      // Royal faceted crown prism converging into a gem apex
      return (
        <>
          <polygon
            points="7.5,7.5 16.5,7.5 19,11 12,18.5 5,11"
            fill={spec.secondary}
            stroke={spec.primary}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 11H18.5M9.5 7.5L12 18M14.5 7.5L12 18"
            stroke={spec.core}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </>
      );

    case 'crimson-velvet':
      // Forge flame & twin chevrons striking a unified keystone
      return (
        <>
          <path
            d="M7.5 7.5L12 11.5L16.5 7.5"
            stroke={spec.primary}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 11.5L12 15.5L16.5 11.5"
            stroke={spec.secondary}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="12,14.5 15,18.5 9,18.5" fill={spec.core} />
        </>
      );

    case 'ocean-abyss':
      // Compass rose & twin wave currents converging
      return (
        <>
          <path
            d="M6.5 10C8.2 8.2 10 8.2 12 10C14 11.8 15.8 11.8 17.5 10"
            stroke={spec.primary}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6.5 14C8.2 12.2 10 12.2 12 14C14 15.8 15.8 15.8 17.5 14"
            stroke={spec.secondary}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <polygon points="12,6 13.6,12 12,18 10.4,12" fill={spec.core} />
        </>
      );

    case 'cyber-gold':
      // 24K celestial astrolabe star & converging orbits
      return (
        <>
          <path
            d="M12 5.2L13.7 10.3L18.8 12L13.7 13.7L12 18.8L10.3 13.7L5.2 12L10.3 10.3L12 5.2Z"
            fill={spec.primary}
          />
          <circle cx="12" cy="12" r="2" fill={spec.bg} />
          <circle cx="12" cy="12" r="1.1" fill={spec.core} />
        </>
      );

    case 'sakura-neon':
    default:
      // Blossom petals spiraling into a unified neon core
      return (
        <>
          <path
            d="M12 5.8C13.8 7.5 14.2 9.8 12 11.6C9.8 9.8 10.2 7.5 12 5.8Z"
            fill={spec.primary}
          />
          <path
            d="M18.2 12C16.5 13.8 14.2 14.2 12.4 12C14.2 9.8 16.5 10.2 18.2 12Z"
            fill={spec.secondary}
          />
          <path
            d="M12 18.2C10.2 16.5 9.8 14.2 12 12.4C14.2 14.2 13.8 16.5 12 18.2Z"
            fill={spec.primary}
          />
          <path
            d="M5.8 12C7.5 10.2 9.8 9.8 11.6 12C9.8 14.2 7.5 13.8 5.8 12Z"
            fill={spec.secondary}
          />
          <circle cx="12" cy="12" r="1.8" fill={spec.core} />
        </>
      );
  }
}

/**
 * Renders role-specific inner glyphs styled with the active theme's palette & geometry.
 */
function renderRoleGlyph(
  role: ThemeIconRole,
  themeId: StudioThemeId,
  spec: ThemePaletteSpec
) {
  if (role === 'merge' || role === 'brand') {
    return renderThemeMergeGlyph(themeId, spec);
  }

  switch (role) {
    case 'queue':
      return (
        <>
          <rect
            x="6.5"
            y="6.2"
            width="11"
            height="3.2"
            rx="1"
            fill={spec.primary}
          />
          <rect
            x="6.5"
            y="10.6"
            width="11"
            height="3.2"
            rx="1"
            fill={spec.secondary}
          />
          <rect
            x="6.5"
            y="15"
            width="7.5"
            height="2.8"
            rx="1"
            fill={spec.core}
          />
        </>
      );

    case 'composer':
      return (
        <>
          <rect
            x="6.2"
            y="6.2"
            width="5"
            height="5"
            rx="1"
            fill={spec.primary}
          />
          <rect
            x="12.8"
            y="6.2"
            width="5"
            height="5"
            rx="1"
            fill={spec.secondary}
          />
          <rect
            x="6.2"
            y="12.8"
            width="5"
            height="5"
            rx="1"
            fill={spec.secondary}
          />
          <rect
            x="12.8"
            y="12.8"
            width="5"
            height="5"
            rx="1"
            fill={spec.core}
          />
        </>
      );

    case 'presets':
      return (
        <>
          <path
            d="M6.5 8.5H17.5M6.5 12H17.5M6.5 15.5H17.5"
            stroke={spec.secondary}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="9.5" cy="8.5" r="1.8" fill={spec.primary} />
          <circle cx="14.5" cy="12" r="1.8" fill={spec.core} />
          <circle cx="11" cy="15.5" r="1.8" fill={spec.primary} />
        </>
      );

    case 'history':
      return (
        <>
          <circle
            cx="12"
            cy="12"
            r="5.5"
            stroke={spec.primary}
            strokeWidth="1.5"
          />
          <path
            d="M12 9V12.2L14.4 13.6"
            stroke={spec.core}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );

    case 'settings':
      return (
        <>
          <circle
            cx="12"
            cy="12"
            r="3.2"
            stroke={spec.primary}
            strokeWidth="1.6"
          />
          <path
            d="M12 5.8V7.4M12 16.6V18.2M5.8 12H7.4M16.6 12H18.2M7.6 7.6L8.8 8.8M15.2 15.2L16.4 16.4M16.4 7.6L15.2 8.8M8.8 15.2L7.6 16.4"
            stroke={spec.secondary}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="1.2" fill={spec.core} />
        </>
      );

    case 'upload':
      return (
        <>
          <path
            d="M12 15.5V7.5M12 7.5L8.8 10.7M12 7.5L15.2 10.7"
            stroke={spec.primary}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 17.2H16.5"
            stroke={spec.core}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      );

    case 'note':
      return (
        <>
          <rect
            x="7"
            y="6"
            width="10"
            height="12"
            rx="1.5"
            stroke={spec.primary}
            strokeWidth="1.5"
          />
          <path
            d="M9.5 10H14.5M9.5 12.8H14.5M9.5 15.2H12.5"
            stroke={spec.core}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      );

    case 'batch':
      return (
        <>
          <path
            d="M6.5 8.5L9.5 6.8H14.5L17.5 8.5V16.2C17.5 16.8 17 17.2 16.5 17.2H7.5C7 17.2 6.5 16.8 6.5 16.2V8.5Z"
            stroke={spec.primary}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 12H14.5M12 9.5V14.5"
            stroke={spec.core}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      );

    case 'preview':
      return (
        <>
          <path
            d="M5.8 12C7.3 9.2 9.5 7.8 12 7.8C14.5 7.8 16.7 9.2 18.2 12C16.7 14.8 14.5 16.2 12 16.2C9.5 16.2 7.3 14.8 5.8 12Z"
            stroke={spec.primary}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.1" fill={spec.core} />
        </>
      );

    case 'parameters':
      return (
        <>
          <path
            d="M7 9H17M7 15H17"
            stroke={spec.secondary}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="10" cy="9" r="2" fill={spec.primary} />
          <circle cx="14" cy="15" r="2" fill={spec.core} />
        </>
      );

    case 'guide':
    default:
      return (
        <>
          <path
            d="M7 7.2C8.8 6.5 10.6 6.8 12 8V17.2C10.6 16.2 8.8 16 7 16.6V7.2ZM17 7.2C15.2 6.5 13.4 6.8 12 8V17.2C13.4 16.2 15.2 16 17 16.6V7.2Z"
            stroke={spec.primary}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </>
      );
  }
}

interface ThemeIconProps {
  themeId: StudioThemeId;
  role?: ThemeIconRole;
  className?: string;
}

/**
 * Renders a bespoke custom SVG icon that dynamically adapts its outer badge silhouette,
 * color palette, and inner glyph geometry to the active StudioThemeId and role.
 */
export const ThemeIcon: React.FC<ThemeIconProps> = ({
  themeId,
  role = 'merge',
  className = 'w-5 h-5',
}) => {
  const spec = THEME_ICON_PALETTES[themeId] || THEME_ICON_PALETTES['swiss-zinc'];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {renderThemeBadgeFrame(spec)}
      {renderRoleGlyph(role, themeId, spec)}
    </svg>
  );
};

/**
 * Renders a compact 4-icon strip previewing how a theme transforms key section icons
 * (Merge Files, Queue, Page Composer, Settings) inside the Settings modal theme cards.
 */
export const ThemeIconPackStrip: React.FC<{
  themeId: StudioThemeId;
}> = ({ themeId }) => {
  const previewRoles: { role: ThemeIconRole; label: string }[] = [
    { role: 'merge', label: 'Merge' },
    { role: 'queue', label: 'Queue' },
    { role: 'composer', label: 'Composer' },
    { role: 'settings', label: 'Settings' },
  ];

  return (
    <div
      className="flex items-center gap-1"
      title="Theme Icon Pack: Merge Files, Queue, Page Composer & Settings icons"
    >
      {previewRoles.map((item) => (
        <ThemeIcon
          key={item.role}
          themeId={themeId}
          role={item.role}
          className="w-4 h-4 shrink-0"
        />
      ))}
    </div>
  );
};
