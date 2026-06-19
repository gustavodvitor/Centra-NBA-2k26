import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/reviews/mine -> avaliacoes do usuario logado
router.get("/mine", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

// GET /api/reviews/player/:playerId -> avaliacoes publicas de um jogador (com media)
router.get("/player/:playerId", (req, res) => {
  const playerId = Number(req.params.playerId);
  const rows = db
    .prepare(
      `SELECT reviews.*, users.name AS author_name
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE reviews.player_id = ?
       ORDER BY reviews.created_at DESC`
    )
    .all(playerId);

  const average = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.overall, 0) / rows.length)
    : null;

  res.json({ reviews: rows, average, count: rows.length });
});

// POST /api/reviews -> cria avaliacao
router.post("/", requireAuth, (req, res) => {
  const { player_id, player_name, team, position, overall, comment } = req.body;

  if (!player_id || !player_name || overall === undefined) {
    return res.status(400).json({ error: "Informe ao menos jogador e overall." });
  }
  const overallNum = Number(overall);
  if (Number.isNaN(overallNum) || overallNum < 0 || overallNum > 99) {
    return res.status(400).json({ error: "Overall deve ser um numero entre 0 e 99." });
  }

  const result = db
    .prepare(
      `INSERT INTO reviews (user_id, player_id, player_name, team, position, overall, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, player_id, player_name, team || null, position || null, overallNum, comment || null);

  const created = db.prepare("SELECT * FROM reviews WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/reviews/:id -> atualiza avaliacao (apenas do proprio autor)
router.put("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM reviews WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Avaliacao nao encontrada." });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: "Voce so pode editar suas proprias avaliacoes." });
  }

  const { overall, comment } = req.body;
  const overallNum = overall !== undefined ? Number(overall) : existing.overall;
  if (Number.isNaN(overallNum) || overallNum < 0 || overallNum > 99) {
    return res.status(400).json({ error: "Overall deve ser um numero entre 0 e 99." });
  }

  db.prepare(
    `UPDATE reviews SET overall = ?, comment = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(overallNum, comment !== undefined ? comment : existing.comment, req.params.id);

  const updated = db.prepare("SELECT * FROM reviews WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/reviews/:id -> remove avaliacao (apenas do proprio autor)
router.delete("/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM reviews WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Avaliacao nao encontrada." });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: "Voce so pode excluir suas proprias avaliacoes." });
  }

  db.prepare("DELETE FROM reviews WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
