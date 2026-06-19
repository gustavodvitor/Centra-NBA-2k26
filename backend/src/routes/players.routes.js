import { Router } from "express";

const router = Router();

const BASE_URL = "https://api.balldontlie.io/v1";

function apiKeyConfigured() {
  return Boolean(process.env.BALLDONTLIE_API_KEY);
}

async function balldontlieFetch(pathAndQuery) {
  const response = await fetch(`${BASE_URL}${pathAndQuery}`, {
    headers: {
      Authorization: process.env.BALLDONTLIE_API_KEY || "",
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Chave da API balldontlie ausente ou invalida. Configure BALLDONTLIE_API_KEY no .env do backend."
        : data?.message || data?.error || `Erro ao consultar a API da NBA (status ${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// GET /api/players?search=lebron&page=1
router.get("/", async (req, res) => {
  if (!apiKeyConfigured()) {
    return res.status(503).json({
      error:
        "BALLDONTLIE_API_KEY nao configurada no servidor. Veja backend/.env.example.",
    });
  }

  try {
    const search = (req.query.search || "").trim();
    const cursor = req.query.cursor;
    const params = new URLSearchParams({ per_page: "20" });
    if (search) params.set("search", search);
    if (cursor) params.set("cursor", String(cursor));

    const data = await balldontlieFetch(`/players?${params.toString()}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/players/:id
router.get("/:id", async (req, res) => {
  if (!apiKeyConfigured()) {
    return res.status(503).json({
      error:
        "BALLDONTLIE_API_KEY nao configurada no servidor. Veja backend/.env.example.",
    });
  }

  try {
    const data = await balldontlieFetch(`/players/${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
