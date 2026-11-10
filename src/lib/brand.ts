/**
 * Which logo concept is live (1–4, see brand/ and logo-options.png).
 * To swap: change LOGO_OPTION and run `cp public/brand/logo-N-mark.svg src/app/icon.svg`.
 */
export const LOGO_OPTION = 1 as 1 | 2 | 3 | 4;
export const LOGO_MARK = `/brand/logo-${LOGO_OPTION}-mark.svg`;
export const LOGO_LOCKUP = `/brand/logo-${LOGO_OPTION}.svg`;
