import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./src/routes/auth.routes.js";
import playerRoutes from "./src/routes/players.routes.js";
import reviewRoutes from "./src/routes/reviews.routes.js";
import favoriteRoutes from "./src/routes/favorites.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "central-nba-2k26-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);

// Handler generico de erro (garante respostas JSON consistentes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota nao encontrada." });
});

app.listen(PORT, () => {
  console.log(`Central NBA 2K26 API rodando em http://localhost:${PORT}`);
});
