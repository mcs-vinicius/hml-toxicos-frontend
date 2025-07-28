// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import { FaBars, FaTimes } from 'react-icons/fa';
import UserSearch from "./components/search/UserSearch.jsx";
import SearchedUserProfile from "./components/search/SearchedUserProfile.jsx";

// Importe suas páginas e outros componentes
import HomePage from "./page/Home.jsx";
import LoginPage from "./components/auth/LoginPage.jsx";
import RegisterUserPage from "./components/auth/RegisterUserPage.jsx";
import RegisterMemberPage from "./components/ranking/RegisterPage.jsx";
import ResultsPage from "./components/ranking/ResultsPage.jsx";
import UserManagementPage from "./page/UserManagementPage.jsx";
import ProfilePage from "./page/ProfilePage.jsx";
import HonorPage from "./page/HonorPage.jsx";
import HonorRegisterPage from "./components/honor/HonorRegisterPage.jsx";
import AdminToolsPage from "./page/AdminToolsPage.jsx"; // <<< NOVO

import "./App.css";

axios.defaults.withCredentials = true;

const App = () => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  const [searchedHabbyId, setSearchedHabbyId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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

  const handleLogin = (userData) => setAuth({ isLoggedIn: true, user: userData, loading: false });
  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`);
      setAuth({ isLoggedIn: false, user: null, loading: false });
    } catch (error) {
      console.error("Falha ao fazer logout:", error);
    }
  };

  const handleUserSelect = (habbyId) => setSearchedHabbyId(habbyId);
  const handleCloseModal = () => setSearchedHabbyId(null);

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
          <Link to="/" className="nav-logo">Tóxicøs</Link>
        </div>

        <div className="nav-center-desktop">
          <NavLink to="/" className="btt-menu">Home</NavLink>
          <NavLink to="/results" className="btt-menu">Ranking</NavLink>
          <NavLink to="/honor" className="btt-menu">Honra</NavLink>
          {auth.isLoggedIn && (
            <NavLink to={`/profile/${auth.user.habby_id}`} className="btt-menu">Meu Perfil</NavLink>
          )}
          {auth.isLoggedIn && ['admin', 'leader'].includes(auth.user.role) && (
            <>
              <NavLink to="/register-member" className="btt-menu">Temporada</NavLink>
              <NavLink to="/register-honor" className="btt-menu">Gerenciar Honra</NavLink>
              <NavLink to="/user-management" className="btt-menu">Gerenciar Usuários</NavLink>
            </>
          )}
          {/* LINK PARA ADMINS */}
          {auth.isLoggedIn && auth.user.role === 'admin' && (
            <NavLink to="/admin-tools" className="btt-menu">Admin Tools</NavLink>
          )}
        </div>

        <div className="nav-right">
          <div className="desktop-only">
            {auth.isLoggedIn && <UserSearch onUserSelect={handleUserSelect} />}
          </div>
          <div className="desktop-only">
            {auth.isLoggedIn ? (
              <button onClick={handleLogout} className="btt-menu btt-logout">Sair</button>
            ) : (
              <Link to="/login" className="btt-menu">Login</Link>
            )}
          </div>
          
          <div className="hamburger-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {auth.isLoggedIn && (
            <div className="mobile-search-wrapper">
              <UserSearch onUserSelect={handleUserSelect} />
            </div>
          )}
          
          <NavLink to="/" className="btt-menu-mobile">Home</NavLink>
          <NavLink to="/results" className="btt-menu-mobile">Ranking</NavLink>
          <NavLink to="/honor" className="btt-menu-mobile">Honra</NavLink>
          {auth.isLoggedIn && (
            <NavLink to={`/profile/${auth.user.habby_id}`} className="btt-menu-mobile">Meu Perfil</NavLink>
          )}
          {auth.isLoggedIn && ['admin', 'leader'].includes(auth.user.role) && (
            <>
              <NavLink to="/register-member" className="btt-menu-mobile">Temporada</NavLink>
              <NavLink to="/register-honor" className="btt-menu-mobile">Gerenciar Honra</NavLink>
              <NavLink to="/user-management" className="btt-menu-mobile">Gerenciar Usuários</NavLink>
            </>
          )}
          {/* LINK PARA ADMINS (MÓVIL) */}
          {auth.isLoggedIn && auth.user.role === 'admin' && (
            <NavLink to="/admin-tools" className="btt-menu-mobile">Admin Tools</NavLink>
          )}

          <div className="mobile-auth-section">
            {auth.isLoggedIn ? (
              <button onClick={handleLogout} className="btt-menu-mobile btt-logout-mobile">Sair</button>
            ) : (
              <NavLink to="/login" className="btt-menu-mobile">Login</NavLink>
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
            
            {/* ROTA PROTEGIDA PARA ADMINS */}
            <Route path="/admin-tools" element={
                <ProtectedRoute roles={['admin']}><AdminToolsPage /></ProtectedRoute>
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