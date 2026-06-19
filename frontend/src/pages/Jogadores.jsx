import { useEffect, useState } from "react";
import api from "../services/api.js";
import PlayerCard from "../components/PlayerCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Jogadores() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPlayers(term) {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/players", { params: { search: term } });
      setPlayers(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao buscar jogadores.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const { data } = await api.get("/favorites");
      setFavoriteIds(new Set(data.map((f) => f.player_id)));
    } catch {
      setFavoriteIds(new Set());
    }
  }

  useEffect(() => {
    loadPlayers("");
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleSubmit(e) {
    e.preventDefault();
    loadPlayers(search);
  }

  async function toggleFavorite(player) {
    if (!user) {
      setError("Faça login para favoritar jogadores.");
      return;
    }
    const isFav = favoriteIds.has(player.id);
    try {
      if (isFav) {
        await api.delete(`/favorites/${player.id}`);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(player.id);
          return next;
        });
      } else {
        await api.post("/favorites", {
          player_id: player.id,
          player_name: `${player.first_name} ${player.last_name}`,
          team: player.team?.full_name,
          position: player.position,
        });
        setFavoriteIds((prev) => new Set(prev).add(player.id));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar favoritos.");
    }
  }

  return (
    <main className="section">
      <h1>Jogadores</h1>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Buscar por nome (ex: LeBron, Curry, Doncic)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn--primary">
          Buscar
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="muted">Carregando jogadores...</p>
      ) : players.length === 0 ? (
        <p className="muted">Nenhum jogador encontrado.</p>
      ) : (
        <div className="players-grid">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              average={null}
              isFavorite={favoriteIds.has(player.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </main>
  );
}
