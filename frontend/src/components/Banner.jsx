import { Link } from "react-router-dom";
import RatingBadge from "./RatingBadge.jsx";

export default function Banner() {
  return (
    <section className="hero">
      <div className="hero__showcase" aria-hidden="true">
        <div className="hero-card">
          <div className="hero-card__corner">
            <RatingBadge overall={97} size="lg" />
          </div>
          <div className="hero-card__avatar">LJ</div>
          <p className="hero-card__name">Lendário do Perímetro</p>
          <p className="hero-card__meta">
            <span className="team-pill">LAL</span>
            <span className="position-pill">F</span>
          </p>
          <div className="hero-card__woodgrain" />
        </div>
      </div>

      <div className="hero__copy">
        <span className="eyebrow">Avalie como um scout</span>
        <h1>
          Suas notas, no <span className="text-accent">seu</span> ranking.
        </h1>
        <p>
          Pesquise jogadores reais da NBA, monte sua própria nota de overall
          inspirada no NBA 2K26 e guarde quem você considera os melhores da
          liga.
        </p>
        <div className="hero__actions">
          <Link to="/jogadores" className="btn btn--primary btn--lg">
            Ver jogadores
          </Link>
          <Link to="/cadastro" className="btn btn--ghost btn--lg">
            Criar conta gratuita
          </Link>
        </div>
      </div>
    </section>
  );
}
