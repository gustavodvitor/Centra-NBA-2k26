import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/favorites -> lista os favoritos do usuario logado
router.get("/", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

// POST /api/favorites -> adiciona um jogador aos favoritos
router.post("/", requireAuth, (req, res) => {
  const { player_id, player_name, team, position } = req.body;
  if (!player_id || !player_name) {
    return res.status(400).json({ error: "Informe ao menos o jogador." });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO favorites (user_id, player_id, player_name, team, position)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(req.user.id, player_id, player_name, team || null, position || null);

    const created = db.prepare("SELECT * FROM favorites WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Esse jogador ja esta nos seus favoritos." });
    }
    res.status(500).json({ error: "Erro ao favoritar jogador." });
  }
});

// DELETE /api/favorites/:playerId -> remove um jogador dos favoritos
router.delete("/:playerId", requireAuth, (req, res) => {
  const result = db
    .prepare("DELETE FROM favorites WHERE user_id = ? AND player_id = ?")
    .run(req.user.id, req.params.playerId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Favorito nao encontrado." });
  }
  res.status(204).end();
});

export default router;
