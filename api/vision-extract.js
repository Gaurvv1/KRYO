export default async function handler(req, res){
  const { imageUrl } = req.body || {};
  // quick placeholder: return no_clear_labels
  return res.status(200).json({ labels: "no_clear_labels" });
}
