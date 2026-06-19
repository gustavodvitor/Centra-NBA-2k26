import { useState } from "react";
import { Link } from "react-router-dom";
import RatingBadge from "./RatingBadge.jsx";
import { getPlayerPhoto } from "../data/playerPhotos.js";

/**
 * Card de jogador estilo "trading card" do 2K.
 * average: nota media calculada a partir das avaliacoes da comunidade (pode ser null)
 */
export default function PlayerCard({ player, average, isFavorite, onToggleFavorite }) {
  const teamAbbr = player.team?.abbreviation || "FA";
  const initials = `${player.first_name?.[0] || ""}${player.last_name?.[0] || ""}`;
  const photoUrl = getPlayerPhoto(player.id);
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = photoUrl && !photoFailed;

  return (
    <article className="player-card">
      <div className="player-card__top">
        {average !== null && average !== undefined ? (
          <RatingBadge overall={average} size="sm" />
        ) : (
          <span className="player-card__no-rating">Sem avaliações</span>
        )}
        <button
          type="button"
          className={`favorite-toggle ${isFavorite ? "is-active" : ""}`}
          onClick={() => onToggleFavorite(player)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          ★
        </button>
      </div>

      <div className="player-card__avatar" aria-hidden="true">
        {showPhoto ? (
          <img
            src={photoUrl}
            alt=""
            className="player-card__avatar-img"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          initials
        )}
      </div>

      <h3 className="player-card__name">
        {player.first_name} {player.last_name}
      </h3>
      <p className="player-card__meta">
        <span className="team-pill">{teamAbbr}</span>
        <span className="position-pill">{player.position || "—"}</span>
      </p>

      <Link to={`/jogadores/${player.id}`} className="player-card__link">
        Ver detalhes
      </Link>
    </article>
  );
}
