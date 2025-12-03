export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { text_context = "" } = req.body || {};

  // Dummy response to test
  return res.status(200).json({
    ok: true,
    message: "Kryo API is working on Vercel 🚀",
    echo_text: text_context
  });
}
