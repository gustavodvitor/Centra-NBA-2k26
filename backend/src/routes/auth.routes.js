import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "E-mail invalido." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "As senhas nao coincidem." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Ja existe uma conta com esse e-mail." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name.trim(), email.toLowerCase(), passwordHash);

  const user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() };
  const token = signToken(user);

  res.status(201).json({ token, user });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Informe e-mail e senha." });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!row) {
    return res.status(401).json({ error: "E-mail ou senha invalidos." });
  }

  const valid = bcrypt.compareSync(password, row.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "E-mail ou senha invalidos." });
  }

  const user = { id: row.id, name: row.name, email: row.email };
  const token = signToken(user);

  res.json({ token, user });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
