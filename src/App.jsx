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
import HonorPage from "./page/HonorPage.jsx";
import HonorRegisterPage from "./components/honor/HonorRegisterPage.jsx";
import UserSearch from "./components/search/UserSearch.jsx";
import SearchedUserProfile from "./components/search/SearchedUserProfile.jsx";

// CSS
import "./App.css";

axios.defaults.withCredentials = true;

const App = () => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  const [searchedHabbyId, setSearchedHabbyId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/session`);
        setAuth({
          isLoggedIn: response.data.isLoggedIn,
          user: response.data.user || null,
          loading: false
        });
      } catch (error) {
        console.error("Falha ao verificar sessão:", error);
        setAuth({ isLoggedIn: false, user: null, loading: false });
      }
    };
    checkSession();
  }, []);

  const handleUserSelect = (habbyId) => setSearchedHabbyId(habbyId);
  const handleCloseModal = () => setSearchedHabbyId(null);

  const handleLogin = (userData) => setAuth({ isLoggedIn: true, user: userData, loading: false });
  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`);
      setAuth({ isLoggedIn: false, user: null, loading: false });
    } catch (error) {
      console.error("Falha ao fazer logout:", error);
    }
  };

  const ProtectedRoute = ({ children, roles }) => {
    if (auth.loading) return <div>Verificando acesso...</div>;
    if (!auth.isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
    if (roles && !roles.includes(auth.user.role)) return <Navigate to="/" replace />;
    return children;
  };

  if (auth.loading) return <div>Carregando...</div>;

  return (
    <>
      <div className="navsup">
        <div className="nav-left">
          <Link to="/" className="btt-menu">Home</Link>
          <Link to="/results" className="btt-menu">Ranking</Link>
          <Link to="/honor" className="btt-menu">Honra</Link>
          {auth.isLoggedIn && (
            <Link to={`/profile/${auth.user.habby_id}`} className="btt-menu">Meu Perfil</Link>
          )}
          {auth.isLoggedIn && ['admin', 'leader'].includes(auth.user.role) && (
            <>
              <Link to="/register-member" className="btt-menu">Temporada</Link>
              <Link to="/register-honor" className="btt-menu">Gerenciar Honra</Link>
              <Link to="/user-management" className="btt-menu">Gerenciar Usuários</Link>
            </>
          )}
        </div>

        <div className="nav-right">
            {auth.isLoggedIn && <UserSearch onUserSelect={handleUserSelect} />}
            {auth.isLoggedIn ? (
                <button onClick={handleLogout} className="btt-menu btt-logout">Sair</button>
            ) : (
                <Link to="/login" className="btt-menu">Login</Link>
            )}
        </div>
      </div>
      
      <div className="content-area">
        <Routes>
            <Route path="/" element={<HomePage userRole={auth.user?.role} />} />
            <Route path="/results" element={<ResultsPage currentUser={auth.user} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register-user" element={<RegisterUserPage />} />
            <Route path="/honor" element={<HonorPage currentUser={auth.user} />} />
            <Route path="/register-member" element={
                <ProtectedRoute roles={['admin', 'leader']}><RegisterMemberPage /></ProtectedRoute>
            } />
            <Route path="/register-honor" element={
                <ProtectedRoute roles={['admin', 'leader']}><HonorRegisterPage /></ProtectedRoute>
            } />
            <Route path="/user-management" element={
                <ProtectedRoute roles={['admin', 'leader']}><UserManagementPage currentUser={auth.user} /></ProtectedRoute>
            } />
            <Route path="/profile/:habby_id" element={
                <ProtectedRoute roles={['admin', 'leader', 'member']}><ProfilePage currentUser={auth.user}/></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {searchedHabbyId && (
        <SearchedUserProfile habbyId={searchedHabbyId} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default App;