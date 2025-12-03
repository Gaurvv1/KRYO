export enum Vibe {
  Funny = "funny",
  Savage = "savage",
  Chaotic = "chaotic",
  Wholesome = "wholesome"
}

export enum MemeLength {
  Short = "short",
  Medium = "medium",
  Long = "long"
}

export enum ColorMode {
  Single = "single",
  Dual = "dual",
  Auto = "auto"
}

export interface BackgroundGradient {
  from: string;
  to: string;
  angle: number;
}

export interface OverlayStyle {
  position: "top" | "center" | "bottom";
  font: string;
  shadow: boolean;
  text_color: string;
  background_gradient: BackgroundGradient | null;
  stroke_width: number;
  color_hint?: string;
  contrast_override?: boolean;
}

export interface MemeResponse {
  meme_text?: string;
  explain_hint: string;
  overlay_style?: OverlayStyle;
  hashtags?: string[];
  safe_alternative?: string;
}

export interface VisionLabels {
  labels: string; // Comma separated string
}
