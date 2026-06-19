import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api.js";
import RatingBadge from "../components/RatingBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPlayerPhoto } from "../data/playerPhotos.js";

export default function JogadorDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const [photoFailed, setPhotoFailed] = useState(false);

  const [player, setPlayer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [overall, setOverall] = useState(80);
  const [comment, setComment] = useState("");
  const [myReview, setMyReview] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [{ data: playerData }, { data: reviewData }] = await Promise.all([
        api.get(`/players/${id}`),
        api.get(`/reviews/player/${id}`),
      ]);

      setPlayer(playerData.data);
      setReviews(reviewData.reviews);
      setAverage(reviewData.average);

      if (user) {
        const mine = reviewData.reviews.find((r) => r.user_id === user.id);
        if (mine) {
          setMyReview(mine);
          setOverall(mine.overall);
          setComment(mine.comment || "");
        }

        const { data: favorites } = await api.get("/favorites");
        setIsFavorite(favorites.some((f) => f.player_id === Number(id)));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao carregar jogador.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function handleToggleFavorite() {
    if (!user || !player) return;
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${player.id}`);
        setIsFavorite(false);
      } else {
        await api.post("/favorites", {
          player_id: player.id,
          player_name: `${player.first_name} ${player.last_name}`,
          team: player.team?.full_name,
          position: player.position,
        });
        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar favoritos.");
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!player) return;
    setSaving(true);
    setError("");
    try {
      if (myReview) {
        const { data } = await api.put(`/reviews/${myReview.id}`, { overall, comment });
        setMyReview(data);
      } else {
        const { data } = await api.post("/reviews", {
          player_id: player.id,
          player_name: `${player.first_name} ${player.last_name}`,
          team: player.team?.full_name,
          position: player.position,
          overall,
          comment,
        });
        setMyReview(data);
      }
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao salvar avaliação.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReview() {
    if (!myReview) return;
    if (!confirm("Excluir sua avaliação deste jogador?")) return;
    try {
      await api.delete(`/reviews/${myReview.id}`);
      setMyReview(null);
      setOverall(80);
      setComment("");
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao excluir avaliação.");
    }
  }

  if (loading) return <main className="section"><p className="muted">Carregando...</p></main>;
  if (error && !player) return <main className="section"><p className="form-error">{error}</p></main>;
  if (!player) return null;

  return (
    <main className="section player-detail">
      <Link to="/jogadores" className="back-link">← Voltar para jogadores</Link>

      <div className="player-detail__header">
        <div className="player-detail__identity">
          <div className="player-detail__avatar" aria-hidden="true">
            {getPlayerPhoto(player.id) && !photoFailed ? (
              <img
                src={getPlayerPhoto(player.id)}
                alt=""
                className="player-card__avatar-img"
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              `${player.first_name?.[0] || ""}${player.last_name?.[0] || ""}`
            )}
          </div>
          <div>
            <h1>{player.first_name} {player.last_name}</h1>
            <p className="player-detail__meta">
              <span className="team-pill">{player.team?.abbreviation || "FA"}</span>
              <span className="position-pill">{player.position || "—"}</span>
              {player.team?.full_name && <span className="muted">{player.team.full_name}</span>}
            </p>
          </div>
        </div>
        <div className="player-detail__rating">
          {average !== null ? <RatingBadge overall={average} size="lg" /> : <span className="muted">Sem avaliações ainda</span>}
          <button
            type="button"
            className={`favorite-toggle ${isFavorite ? "is-active" : ""}`}
            onClick={handleToggleFavorite}
            disabled={!user}
            title={user ? "Favoritar jogador" : "Faça login para favoritar"}
          >
            ★ {isFavorite ? "Favoritado" : "Favoritar"}
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <section className="review-form-card">
        <h2>{myReview ? "Sua avaliação" : "Criar avaliação"}</h2>
        {user ? (
          <form onSubmit={handleSubmitReview}>
            <label className="field">
              <span>Overall ({overall})</span>
              <input
                type="range"
                min="0"
                max="99"
                value={overall}
                onChange={(e) => setOverall(Number(e.target.value))}
              />
            </label>
            <label className="field">
              <span>Comentário</span>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="O que você pensa sobre esse jogador?"
              />
            </label>
            <div className="review-form-card__actions">
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? "Salvando..." : myReview ? "Atualizar avaliação" : "Salvar avaliação"}
              </button>
              {myReview && (
                <button type="button" className="btn btn--danger" onClick={handleDeleteReview}>
                  Excluir
                </button>
              )}
            </div>
          </form>
        ) : (
          <p className="muted">
            <Link to="/login">Faça login</Link> para avaliar este jogador.
          </p>
        )}
      </section>

      <section>
        <h2>Avaliações da comunidade ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="muted">Ainda não há avaliações para este jogador.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r.id} className="review-list__item">
                <RatingBadge overall={r.overall} size="sm" />
                <div>
                  <p className="review-list__author">{r.author_name}</p>
                  {r.comment && <p className="review-list__comment">{r.comment}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
