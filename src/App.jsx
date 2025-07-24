import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import axios from "axios";

// Pages & Components
import HomePage from "./page/Home.jsx";
import LoginPage from "./components/auth/LoginPage.jsx";
import RegisterUserPage from "./components/auth/RegisterUserPage.jsx";
import RegisterMemberPage from "./components/ranking/RegisterPage.jsx";
import ResultsPage from "./components/ranking/ResultsPage.jsx";
import UserManagementPage from "./page/UserManagementPage.jsx";
import ProfilePage from "./page/ProfilePage.jsx";
// NOVAS PÁGINAS DE HONRA
import HonorPage from "./page/HonorPage.jsx";
import HonorRegisterPage from "./components/honor/HonorRegisterPage.jsx";

// CSS
import "./App.css";

axios.defaults.withCredentials = true;

const App = () => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  const location = useLocation();

  const checkSession = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/session`);
      if (response.data.isLoggedIn) {
        setAuth({ isLoggedIn: true, user: response.data.user, loading: false });
      } else {
        setAuth({ isLoggedIn: false, user: null, loading: false });
      }
    } catch (error) {
      console.error("Falha ao verificar sessão:", error);
      setAuth({ isLoggedIn: false, user: null, loading: false });
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setAuth({ isLoggedIn: true, user: userData, loading: false });
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`);
      setAuth({ isLoggedIn: false, user: null, loading: false });
    } catch (error) {
      console.error("Falha ao fazer logout:", error);
    }
  };

  const ProtectedRoute = ({ children, roles }) => {
    if (auth.loading) {
      return <div>Verificando acesso...</div>;
    }
    if (!auth.isLoggedIn) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (roles && !roles.includes(auth.user.role)) {
       return <Navigate to="/" replace />;
    }
    return children;
  };

  if (auth.loading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="navsup">
        <Link to="/" className="btt-menu" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/results" className="btt-menu" style={{ marginRight: "15px" }}>Ranking</Link>
        {/* NOVO LINK PARA HONRA */}
        <Link to="/honor" className="btt-menu" style={{ marginRight: "15px" }}>Honra</Link>
        
        {auth.isLoggedIn && (
          <Link to={`/profile/${auth.user.habby_id}`} className="btt-menu" style={{ marginRight: "15px" }}>
            Meu Perfil
          </Link>
        )}
        
        {auth.isLoggedIn && ['admin', 'leader'].includes(auth.user.role) && (
          <>
            <Link to="/register-member" className="btt-menu" style={{ marginRight: "15px" }}>
               Temporada
            </Link>
            {/* NOVO LINK PARA GERENCIAR HONRA */}
            <Link to="/register-honor" className="btt-menu" style={{ marginRight: "15px" }}>
               Gerenciar Honra
            </Link>
            <Link to="/user-management" className="btt-menu" style={{ marginRight: "15px" }}>
              Gerenciar Usuários
            </Link>
          </>
        )}

        <div style={{ marginLeft: "auto" }}>
          {auth.isLoggedIn ? (
            <button onClick={handleLogout} className="btt-menu btt-logout">Sair</button>
          ) : (
            <Link to="/login" className="btt-menu">Login</Link>
          )}
        </div>
      </div>
      
      <div className="content-area">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage userRole={auth.user?.role} />} />
          <Route path="/results" element={<ResultsPage currentUser={auth.user} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register-user" element={<RegisterUserPage />} />
          {/* NOVA ROTA PÚBLICA DE HONRA */}
          <Route path="/honor" element={<HonorPage />} />

          {/* Rotas Protegidas */}
          <Route path="/register-member" element={
            <ProtectedRoute roles={['admin', 'leader']}>
              <RegisterMemberPage />
            </ProtectedRoute>
          } />
          {/* NOVA ROTA PROTEGIDA DE HONRA */}
           <Route path="/register-honor" element={
            <ProtectedRoute roles={['admin', 'leader']}>
              <HonorRegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
             <ProtectedRoute roles={['admin', 'leader']}>
              <UserManagementPage currentUser={auth.user} />
            </ProtectedRoute>
          } />
           <Route path="/profile/:habby_id" element={
            <ProtectedRoute roles={['admin', 'leader', 'member']}>
              <ProfilePage currentUser={auth.user}/>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;