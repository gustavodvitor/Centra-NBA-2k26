import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Favoritos() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/favorites");
      setFavorites(data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao carregar favoritos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(playerId) {
    try {
      await api.delete(`/favorites/${playerId}`);
      setFavorites((prev) => prev.filter((f) => f.player_id !== playerId));
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao remover favorito.");
    }
  }

  return (
    <main className="section">
      <h1>Favoritos</h1>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : favorites.length === 0 ? (
        <p className="muted">
          Você ainda não favoritou nenhum jogador. <Link to="/jogadores">Explore os jogadores</Link>.
        </p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((f) => (
            <li key={f.id} className="favorites-list__item">
              <div>
                <p className="review-list__author">
                  <Link to={`/jogadores/${f.player_id}`}>{f.player_name}</Link>
                </p>
                <p className="muted">
                  {f.team} {f.position && `· ${f.position}`}
                </p>
              </div>
              <button className="btn btn--danger" onClick={() => remove(f.player_id)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
