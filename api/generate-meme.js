// api/generate-meme.js
// Vercel serverless function: receives payload from frontend, calls Google AI Studio, returns validated JSON.
// Replace the STUDIO_CALL section with the exact Google AI Studio request shape if/when you paste it.

import fetch from 'node-fetch';

const BANNED = ["nsfw","porn","nude","fuck","bitch","kill","suicide","doxx","terror"];

// helper to sanitize/trim fields
function safeString(s) {
  if (!s) return "";
  return String(s).trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const body = req.body || {};
    // read payload fields (use defaults if missing)
    const imageUrl = safeString(body.imageUrl || "");
    const labels = safeString(body.labels || "no_clear_labels");
    const text_context = safeString(body.text_context || "");
    const vibe = safeString(body.vibe || "funny");
    const length = safeString(body.length || "medium");
    const color_mode = safeString(body.color_mode || "auto");
    const primary_color = safeString(body.primary_color || "#FFFFFF");
    const secondary_color = safeString(body.secondary_color || "#000000");
    const shade_intensity = Number(body.shade_intensity || 0.6);
    const direct_generate = !!body.direct_generate;
    const regenerate_count = Number(body.regenerate_count || 0);

    // Basic server-side safety: block if user-supplied text contains banned words
    const lower = (text_context || "").toLowerCase();
    if (BANNED.some(w => lower.includes(w))) {
      return res.status(200).json({ safe_alternative: "Blocked: please remove NSFW/abusive words.", explain_hint: "User text triggered safety filter." });
    }

    // === BUILD the System/User prompts for your Studio model ===
    // Replace these with your final prompts from Google AI Studio if you want exact behavior.
    const systemPrompt = `You are CryptoMemeX — produce a short, viral, crypto-themed meme text (<=11 words). Follow safety rules: no NSFW, no hate, no threats. Output valid JSON.`;
    const userPrompt = `labels: ${labels}\ntext_context: ${text_context}\ndirect_generate: ${direct_generate}\nvibe: ${vibe}\nlength: ${length}\ncolor_mode: ${color_mode}\nprimary_color: ${primary_color}\nsecondary_color: ${secondary_color}\nshade_intensity: ${shade_intensity}\nregenerate_count: ${regenerate_count}\n\nReturn a JSON object exactly like: { "meme_text":"...", "explain_hint":"...", "overlay_style": { "position":"center","font":"Impact","shadow":true,"text_color":"#FFFFFF","stroke_width":6 } , "hashtags": ["#X","#Y","#Z"] }`;

    // === STUDIO CALL ===
    // Replace the endpoint/payload below with the exact Google AI Studio REST request you have.
    const studioEndpoint = process.env.GOOGLE_AI_STUDIO_ENDPOINT; // set this in Vercel env
    const apiKey = process.env.GOOGLE_AI_API_KEY;                 // set this in Vercel env
    if (!studioEndpoint || !apiKey) {
      // For now, return a helpful message so you can finish env setup.
      return res.status(500).json({ error: 'Missing GOOGLE_AI_STUDIO_ENDPOINT or GOOGLE_AI_API_KEY in server env.' });
    }

    // Example generic payload for a chat-style model. Replace if Studio expects different keys.
    const payload = {
      model: process.env.GOOGLE_AI_MODEL_ID || "your-studio-model-id",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    };

    // call Studio
    const r = await fetch(studioEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      console.error('Studio API error', r.status, t);
      return res.status(502).json({ error: 'AI provider error', details: t });
    }
    const aiResp = await r.json();

    // === PARSE AI RESPONSE ===
    // Many Studio responses embed text in different places. Try common fallbacks.
    let raw = aiResp?.choices?.[0]?.message?.content ?? aiResp?.output ?? JSON.stringify(aiResp);
    let generated = null;
    if (typeof raw === 'string') {
      // if the model returned a JSON string, try parse
      try {
        generated = JSON.parse(raw);
      } catch (e) {
        // fallback: wrap model text as meme_text
        generated = {
          meme_text: String(raw).slice(0, 200),
          explain_hint: "AI raw output",
          overlay_style: { position: "center", font: "Impact", shadow: true, text_color: "#FFFFFF", stroke_width: 6 }
        };
      }
    } else {
      generated = raw;
    }

    // server-side safety check on generated text
    const genText = (generated.meme_text || "").toLowerCase();
    if (BANNED.some(w => genText.includes(w))) {
      return res.status(200).json({ safe_alternative: "Generated content blocked for safety.", explain_hint: "Safety rule triggered by AI output." });
    }

    // ensure overlay_style exists
    generated.overlay_style = generated.overlay_style || {
      position: 'center',
      font: 'Impact',
      shadow: true,
      text_color: '#FFFFFF',
      stroke_width: Math.round(6 + shade_intensity * 8)
    };

    return res.status(200).json(generated);

  } catch (err) {
    console.error('generate-meme error', err);
    return res.status(500).json({ error: 'internal server error' });
  }
}
