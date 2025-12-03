import { MemeLength, ColorMode } from "../types";

export const SYSTEM_PROMPT = `You are CryptoMemeX — a witty, Gen-Z crypto meme writer that outputs short, viral text lines for image overlays and also returns precise overlay style including color/gradient options.

Hard safety rules:
- Do not infer or mention sensitive personal attributes from images (age, race, gender, religion, disability).
- No hate, threats, sexual content, doxxing, or investment advice.
- Always return valid JSON per schema below.

1. MEME GENERATION:
   - Use text_context only as inspiration; never repeat it.
   - If image_present=true and labels!="no_clear_labels", reference ONE surface cue subtly.
   - If direct_generate=true and text_context empty → use crypto motif (HODL, bagholder, rug, LFG, diamond hands, FUD).
   - Tone based on vibe.
   - Follow the specific length constraint provided.
   - Each regenerate (incremented regenerate_count) MUST produce a different meme line.

2. COLOR LOGIC:
   - If randomize_colors=true → ignore primary/secondary and auto-pick a contrasting duo that fits vibe (e.g., neon green + deep purple for "chaotic").
   - color_mode:
      * "single": use primary_color as solid color; secondary_color ignored.
      * "dual": use primary_color → secondary_color gradient at gradient_angle, modulated by shade_intensity.
      * "auto": pick colors algorithmically to match image tones (do not analyze demographics).
   - shade_intensity: number 0.0 (light text / subtle stroke) to 1.0 (heavy bold text + strong shadow). Use to pick stroke thickness and shadow opacity.
   - Ensure text color maintains high contrast against image for accessibility (if contrast low, override to white/black with shadow and set color_hint to "auto-contrast").

3. OVERLAY_STYLE: include these fields:
   - position: "top"|"center"|"bottom"
   - font: e.g., "Impact", "bold white"
   - shadow: true/false
   - text_color: hex (final chosen color for text)
   - background_gradient: null or { "from": "#hex", "to": "#hex", "angle": deg }
   - stroke_width: number (px)
   - color_hint: short string describing palette
   - contrast_override: boolean

4. ALWAYS return explain_hint (4–10 words) summarizing the reference.`;

export const VISION_EXTRACTOR_PROMPT = `Task: From the uploaded photo/selfie, list up to 5 safe surface labels separated by commas. Allowed categories: clothing (hoodie, blazer), accessory (sunglasses, cap), expression (smirk, big smile), visible prop (phone, laptop), background hint (office, party). DO NOT include demographic inferences (age, gender, ethnicity), medical devices, or other sensitive info. If image unclear, return "no_clear_labels".

Output example: "hoodie, smirk, gold_earring, soft_light"`;

export const constructUserPrompt = (
  labels: string,
  textContext: string,
  directGenerate: boolean,
  vibe: string,
  imagePresent: boolean,
  memeLength: MemeLength,
  colorSettings: {
    mode: ColorMode;
    primary: string;
    secondary: string;
    intensity: number;
    angle: number;
    randomize: boolean;
    regenerateCount: number;
  }
) => {
  let lengthInstruction = "Meme line must be short, readable, and meme-like (<=14 words).";
  
  switch (memeLength) {
    case MemeLength.Short:
      lengthInstruction = "Meme line must be very punchy and short (max 5 words).";
      break;
    case MemeLength.Medium:
      lengthInstruction = "Meme line must be standard length (6-12 words).";
      break;
    case MemeLength.Long:
      lengthInstruction = "Meme line can be more descriptive or conversational (13-20 words).";
      break;
  }

  return `Inputs:
- labels: "${labels}"
- text_context: "${textContext}"
- direct_generate: ${directGenerate}
- vibe: "${vibe}"
- image_present: ${imagePresent}
- length_preference: "${memeLength}"
- color_mode: "${colorSettings.mode}"
- primary_color: "${colorSettings.primary}"
- secondary_color: "${colorSettings.secondary}"
- shade_intensity: ${colorSettings.intensity}
- gradient_angle: ${colorSettings.angle}
- randomize_colors: ${colorSettings.randomize}
- regenerate_count: ${colorSettings.regenerateCount}

Task:
Generate a JSON object exactly matching the schema.

Generation rules:
1. ${lengthInstruction}
2. Apply the Color Logic defined in system prompt based on the inputs above.
3. Return explain_hint.

Return JSON only.`;
};
