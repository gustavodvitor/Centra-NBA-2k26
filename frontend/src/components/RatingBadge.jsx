/**
 * Emblema circular de OVR, inspirado nos cards de atributos do NBA 2K.
 * A cor muda de acordo com a faixa da nota (igual ao jogo).
 */
function tierFor(overall) {
  if (overall >= 90) return "tier-galaxy";
  if (overall >= 80) return "tier-gold";
  if (overall >= 70) return "tier-silver";
  return "tier-bronze";
}

export default function RatingBadge({ overall, size = "md" }) {
  const tier = tierFor(overall);
  return (
    <div className={`ovr-badge ovr-badge--${size} ${tier}`}>
      <span className="ovr-badge__label">OVR</span>
      <span className="ovr-badge__value">{overall}</span>
    </div>
  );
}
