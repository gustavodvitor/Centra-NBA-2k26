import Banner from "../components/Banner.jsx";

export default function Home() {
  return (
    <main>
      <Banner />

      <section className="section">
        <h2>Como funciona</h2>
        <div className="how-it-works">
          <div className="how-card">
            <span className="how-card__step">Passo 1</span>
            <h3>Pesquise um jogador</h3>
            <p>Busque por nome na nossa base de jogadores da NBA, com time e posição atualizados.</p>
          </div>
          <div className="how-card">
            <span className="how-card__step">Passo 2</span>
            <h3>Dê sua nota</h3>
            <p>Crie uma avaliação com overall de 0 a 99 e um comentário, do seu jeito.</p>
          </div>
          <div className="how-card">
            <span className="how-card__step">Passo 3</span>
            <h3>Monte seus favoritos</h3>
            <p>Salve os jogadores que você mais acompanha e volte quando quiser.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
