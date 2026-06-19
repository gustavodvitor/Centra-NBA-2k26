import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="section not-found">
      <h1>404</h1>
      <p>Essa página não existe.</p>
      <Link to="/" className="btn btn--primary">
        Voltar para a home
      </Link>
    </main>
  );
}
