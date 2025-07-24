import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/LoginPage.css'; // Reutilizando o mesmo estilo da página de login

const RegisterUserPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [habby_id, setHabbyId] = useState(''); // Novo estado para o ID Habby
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !password || !habby_id) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        try {
            // Enviando o habby_id junto com os outros dados
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/register-user`, {
                username, 
                password, 
                habby_id 
            });
            setSuccess(response.data.message + ' Você será redirecionado para o login.');
            setTimeout(() => {navigate('/login');}, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao registrar. Tente novamente.');
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Crie sua Conta</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Nome de Usuário</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="habby_id">ID Habby</label>
                        <input
                            type="text"
                            id="habby_id"
                            value={habby_id}
                            onChange={(e) => setHabbyId(e.target.value)}
                            placeholder="Seu ID do jogo"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <button type="submit" className="btn-login">Registrar</button>
                </form>
                <div className="auth-switch">
                    <p>Já tem uma conta? <Link to="/login">Faça Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterUserPage;