const express = require("express");
const router = express.Router();

let cachedToken = null;
let tokenExpiry = null;

// ✅ Helper to get/refresh token
const getToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const response = await fetch(
    "https://outpost.mappls.com/api/security/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${process.env.MMI_CLIENT_ID}&client_secret=${process.env.MMI_CLIENT_SECRET}`,
    },
  );
  const data = await response.json();
  if (!data.access_token) throw new Error("Token fetch failed");
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken;
};

// 1️⃣ Get Token
router.get("/mmi-token", async (req, res) => {
  try {
    const token = await getToken();
    res.json({ token });
  } catch (err) {
    console.error("🚨 MMI TOKEN FAILED:", err);
    if (cachedToken) return res.json({ token: cachedToken }); // serve stale
    res.status(500).json({ error: "Token failed" });
  }
});

// 2️⃣ Search Places
router.get("/mmi-search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const token = await getToken();

    const searchRes = await fetch(
      `https://atlas.mapmyindia.com/api/places/search/json?query=${encodeURIComponent(query)}&region=IND`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const data = await searchRes.json();
    res.json(data);
  } catch (err) {
    console.error("MMI search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// 3️⃣ Geocode — get coordinates from place name using Nominatim
router.get("/nominatim-search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`,
      { headers: { "User-Agent": "Educrit/1.0" } },
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Nominatim search error:", err);
    res.status(500).json({ error: "Nominatim search failed" });
  }
});

router.get("/mmi-geocode", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: "address is required" });

    const token = await getToken();

    const geoRes = await fetch(
      `https://atlas.mapmyindia.com/api/places/geocode?address=${encodeURIComponent(address)}&region=IND`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const data = await geoRes.json();
    res.json(data);
  } catch (err) {
    console.error("MMI geocode error:", err);
    res.status(500).json({ error: "Geocode failed" });
  }
});

module.exports = router;
