declare const tokens: {
  colors: {
    primary: string;
    debt: string;
    accent: string;
    neutral100: string;
    neutral200: string;
    neutral500: string;
    neutral900: string;
    success: string;
    error: string;
    white: string;
    primaryBg: string;
    accentBg: string;
    debtBg: string;
  };
  fontFamily: { sans: 'Inter' };
  fontSize: { sm: number; base: number; lg: number; xl: number; h1: number };
  spacing: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, number>;
  radius: { sm: number; md: number; lg: number; full: number };
};

export default tokens;
