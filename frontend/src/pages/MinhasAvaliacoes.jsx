import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import RatingBadge from "../components/RatingBadge.jsx";

export default function MinhasAvaliacoes() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editOverall, setEditOverall] = useState(80);
  const [editComment, setEditComment] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/reviews/mine");
      setReviews(data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao carregar suas avaliações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(review) {
    setEditingId(review.id);
    setEditOverall(review.overall);
    setEditComment(review.comment || "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    try {
      await api.put(`/reviews/${id}`, { overall: editOverall, comment: editComment });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar avaliação.");
    }
  }

  async function remove(id) {
    if (!confirm("Excluir esta avaliação?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao excluir avaliação.");
    }
  }

  return (
    <main className="section">
      <h1>Minhas avaliações</h1>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : reviews.length === 0 ? (
        <p className="muted">
          Você ainda não criou nenhuma avaliação. <Link to="/jogadores">Encontre um jogador</Link> para começar.
        </p>
      ) : (
        <ul className="review-list review-list--editable">
          {reviews.map((r) => (
            <li key={r.id} className="review-list__item">
              {editingId === r.id ? (
                <div className="review-edit">
                  <label className="field">
                    <span>Overall ({editOverall})</span>
                    <input
                      type="range"
                      min="0"
                      max="99"
                      value={editOverall}
                      onChange={(e) => setEditOverall(Number(e.target.value))}
                    />
                  </label>
                  <label className="field">
                    <span>Comentário</span>
                    <textarea
                      rows={2}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                    />
                  </label>
                  <div className="review-form-card__actions">
                    <button className="btn btn--primary" onClick={() => saveEdit(r.id)}>
                      Salvar
                    </button>
                    <button className="btn btn--ghost" onClick={cancelEdit}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <RatingBadge overall={r.overall} size="sm" />
                  <div className="review-list__body">
                    <p className="review-list__author">
                      <Link to={`/jogadores/${r.player_id}`}>{r.player_name}</Link>
                      {r.team && <span className="muted"> · {r.team}</span>}
                    </p>
                    {r.comment && <p className="review-list__comment">{r.comment}</p>}
                  </div>
                  <div className="review-list__actions">
                    <button className="btn btn--ghost" onClick={() => startEdit(r)}>
                      Editar
                    </button>
                    <button className="btn btn--danger" onClick={() => remove(r.id)}>
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
