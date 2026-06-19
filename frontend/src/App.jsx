import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Jogadores from "./pages/Jogadores.jsx";
import JogadorDetalhe from "./pages/JogadorDetalhe.jsx";
import MinhasAvaliacoes from "./pages/MinhasAvaliacoes.jsx";
import Favoritos from "./pages/Favoritos.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/jogadores" element={<Jogadores />} />
        <Route path="/jogadores/:id" element={<JogadorDetalhe />} />
        <Route
          path="/minhas-avaliacoes"
          element={
            <ProtectedRoute>
              <MinhasAvaliacoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favoritos"
          element={
            <ProtectedRoute>
              <Favoritos />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
