import { Router } from "express";

const router = Router();
const BASE_URL = "https://api.balldontlie.io/v1";
const CACHE_TTL_MS = Number(process.env.NBA_PLAYERS_CACHE_TTL_MS || 10 * 60 * 1000);
const STALE_CACHE_TTL_MS = Number(
  process.env.NBA_PLAYERS_STALE_CACHE_TTL_MS || 24 * 60 * 60 * 1000,
);
const RETRY_AFTER_FALLBACK_SECONDS = 60;
const responseCache = new Map();

function apiKeyConfigured() {
  return Boolean(process.env.BALLDONTLIE_API_KEY);
}

function getCacheEntry(pathAndQuery) {
  const entry = responseCache.get(pathAndQuery);
  if (!entry) return null;

  const age = Date.now() - entry.createdAt;
  return {
    ...entry,
    age,
    fresh: age <= CACHE_TTL_MS,
    stale: age <= STALE_CACHE_TTL_MS,
  };
}

function setCacheEntry(pathAndQuery, data) {
  responseCache.set(pathAndQuery, {
    data,
    createdAt: Date.now(),
  });
}

function secondsUntilCacheRefresh(entry) {
  if (!entry) return RETRY_AFTER_FALLBACK_SECONDS;

  const seconds = Math.ceil((CACHE_TTL_MS - entry.age) / 1000);
  return Math.max(seconds, 1);
}

async function balldontlieFetch(pathAndQuery) {
  const cached = getCacheEntry(pathAndQuery);
  if (cached?.fresh) {
    return { data: cached.data, cacheStatus: "hit" };
  }

  const response = await fetch(`${BASE_URL}${pathAndQuery}`, {
    headers: {
      Authorization: process.env.BALLDONTLIE_API_KEY || "",
    },
  });
  const data = await response.json().catch(() => null);

  if (response.status === 429) {
    if (cached?.stale) {
      return { data: cached.data, cacheStatus: "stale" };
    }

    const error = new Error(
      "Limite de consultas da API da NBA atingido. Aguarde um pouco e tente novamente.",
    );
    error.status = 429;
    error.retryAfter = response.headers.get("retry-after") || RETRY_AFTER_FALLBACK_SECONDS;
    throw error;
  }

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Chave da API balldontlie ausente ou invalida.\nConfigure BALLDONTLIE_API_KEY no .env do backend."
        : data?.message || data?.error || `Erro ao consultar a API da NBA (status ${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  setCacheEntry(pathAndQuery, data);
  return { data, cacheStatus: "miss" };
}

function sendCachedResponse(res, result) {
  if (result.cacheStatus === "hit") {
    res.set("X-NBA-API-Cache", "HIT");
    res.set("Retry-After", String(secondsUntilCacheRefresh(getCacheEntry(res.locals.cacheKey))));
  } else if (result.cacheStatus === "stale") {
    res.set("X-NBA-API-Cache", "STALE");
    res.set("Warning", '110 - "Resposta em cache por limite da API externa"');
  } else {
    res.set("X-NBA-API-Cache", "MISS");
  }

  res.json(result.data);
}

// GET /api/players?search=lebron&page=1
router.get("/", async (req, res) => {
  if (!apiKeyConfigured()) {
    return res.status(503).json({
      error: "BALLDONTLIE_API_KEY nao configurada no servidor.\nVeja backend/.env.example.",
    });
  }

  try {
    const search = (req.query.search || "").trim();
    const cursor = req.query.cursor;
    const params = new URLSearchParams({ per_page: "20" });
    if (search) params.set("search", search);
    if (cursor) params.set("cursor", String(cursor));

    const cacheKey = `/players?${params.toString()}`;
    res.locals.cacheKey = cacheKey;
    const result = await balldontlieFetch(cacheKey);
    sendCachedResponse(res, result);
  } catch (err) {
    if (err.retryAfter) res.set("Retry-After", String(err.retryAfter));
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/players/:id
router.get("/:id", async (req, res) => {
  if (!apiKeyConfigured()) {
    return res.status(503).json({
      error: "BALLDONTLIE_API_KEY nao configurada no servidor.\nVeja backend/.env.example.",
    });
  }

  try {
    const cacheKey = `/players/${req.params.id}`;
    res.locals.cacheKey = cacheKey;
    const result = await balldontlieFetch(cacheKey);
    sendCachedResponse(res, result);
  } catch (err) {
    if (err.retryAfter) res.set("Retry-After", String(err.retryAfter));
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;