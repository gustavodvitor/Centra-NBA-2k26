import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Cadastro() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Informe seu nome.";
    if (!EMAIL_REGEX.test(form.email)) return "Informe um e-mail válido.";
    if (form.password.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    if (form.password !== form.confirmPassword) return "As senhas não coincidem.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/jogadores", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Não foi possível criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>
        <p className="auth-card__subtitle">Cadastre-se para criar avaliações e favoritar jogadores.</p>

        {error && <p className="form-error">{error}</p>}

        <label className="field">
          <span>Nome</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            autoComplete="name"
          />
        </label>

        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <label className="field">
          <span>Confirmar senha</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="auth-card__footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  );
}
