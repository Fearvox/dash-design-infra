/**
 * Do not edit directly, this file was auto-generated.
 */

export default tokens;

declare interface DesignToken {
  $value?: any;
  $type?: string;
  $description?: string;
  name?: string;
  themeable?: boolean;
  attributes?: Record<string, unknown>;
  [key: string]: any;
}

declare const tokens: {
  color: {
    paper: {
      base: DesignToken;
      grain: DesignToken;
      shadow: DesignToken;
      card: DesignToken;
      warm: DesignToken;
    };
    ink: {
      primary: DesignToken;
      secondary: DesignToken;
      muted: DesignToken;
    };
    accent: {
      palmShadow: DesignToken;
      palmLight: DesignToken;
      sunGold: DesignToken;
      dangerRed: DesignToken;
      hoverGlow: DesignToken;
    };
    botanical: {
      ink: DesignToken;
      deep: DesignToken;
      mid: DesignToken;
      leaf: DesignToken;
      neonGold: DesignToken;
    };
    badge: {
      minimax: DesignToken;
      opus: DesignToken;
      grok: DesignToken;
      gemini: DesignToken;
      gpt: DesignToken;
    };
    rule: {
      default: DesignToken;
      soft: DesignToken;
    };
  };
  font: {
    family: {
      sans: DesignToken;
      mono: DesignToken;
    };
    size: {
      display: DesignToken;
      deck: DesignToken;
      body: DesignToken;
      meta: DesignToken;
      micro: DesignToken;
    };
    lineHeight: {
      tight: DesignToken;
      base: DesignToken;
      loose: DesignToken;
      display: DesignToken;
    };
  };
  baseline: DesignToken;
  space: {
    "1": DesignToken;
    "2": DesignToken;
    "3": DesignToken;
    "4": DesignToken;
    "5": DesignToken;
    "6": DesignToken;
    "7": DesignToken;
    "8": DesignToken;
    "9": DesignToken;
    "10": DesignToken;
  };
  page: {
    width: DesignToken;
    height: DesignToken;
    padding: DesignToken;
    gap: DesignToken;
    gridColumns: DesignToken;
    gridGap: DesignToken;
  };
  radius: {
    sm: DesignToken;
    md: DesignToken;
    lg: DesignToken;
    pill: DesignToken;
  };
  motion: {
    ease: {
      entrance: DesignToken;
      bounce: DesignToken;
    };
    duration: {
      fast: DesignToken;
      base: DesignToken;
      reveal: DesignToken;
      max: DesignToken;
    };
  };
};
