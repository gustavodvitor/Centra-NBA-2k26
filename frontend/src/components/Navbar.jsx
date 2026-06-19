import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        Central <strong>NBA 2K26</strong>
      </Link>

      <nav className="navbar__links">
        <NavLink to="/jogadores" className="navbar__link">
          Jogadores
        </NavLink>
        {user && (
          <>
            <NavLink to="/minhas-avaliacoes" className="navbar__link">
              Minhas avaliações
            </NavLink>
            <NavLink to="/favoritos" className="navbar__link">
              Favoritos
            </NavLink>
          </>
        )}
      </nav>

      <div className="navbar__auth">
        {user ? (
          <>
            <span className="navbar__user">Olá, {user.name.split(" ")[0]}</span>
            <button type="button" className="btn btn--ghost" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn--ghost">
              Entrar
            </Link>
            <Link to="/cadastro" className="btn btn--primary">
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
