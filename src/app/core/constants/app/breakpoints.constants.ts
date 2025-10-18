export const BREAKPOINTS = {
  HANDSET: '(max-width: 599.98px)',
  TABLET: '(min-width: 600px) and (max-width: 959.98px)',
  WEB: '(min-width: 960px)',

  HANDSET_PORTRAIT: '(max-width: 599.98px) and (orientation: portrait)',
  HANDSET_LANDSCAPE: '(max-width: 959.98px) and (orientation: landscape)',
  TABLET_PORTRAIT: '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait)',
  TABLET_LANDSCAPE: '(min-width: 900px) and (max-width: 1279.98px) and (orientation: landscape)',

  PX: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE: 1280,
    XLARGE: 1920,
  },
} as const;
