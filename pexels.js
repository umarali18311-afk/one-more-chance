export default async function handler(req, res) {
  const { query = 'nature', page = 1 } = req.query;
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'PEXELS_API_KEY Missing in Vercel settings' });
  }

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=15`, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Pexels API failure' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Error', details: err.message });
  }
}