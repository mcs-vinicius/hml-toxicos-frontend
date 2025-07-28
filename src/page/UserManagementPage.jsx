// src/page/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UserManagementPage.css';
import { FaCrown, FaUserShield, FaUser, FaTrash, FaKey } from 'react-icons/fa';

const UserManagementPage = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_URL}/users`, { withCredentials: true });
                setUsers(response.data);
            } catch (err) {
                setError('Falha ao carregar usuários. Você pode não ter permissão.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [API_URL]);
    
    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await axios.put(`${API_URL}/users/${userId}/role`, { role: newRole }, { withCredentials: true });
            setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
            setSuccessMessage(response.data.message);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao alterar o nível de acesso.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${username}? Esta ação não pode ser desfeita.`)) {
            try {
                const response = await axios.delete(`${API_URL}/users/${userId}`, { withCredentials: true });
                setUsers(users.filter(u => u.id !== userId));
                setSuccessMessage(response.data.message);
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                setError(err.response?.data?.error || 'Erro ao excluir o usuário.');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleResetPassword = async (userId, username) => {
        const confirmation = `Você está prestes a redefinir a senha do usuário ${username}. Uma nova senha temporária será gerada. Deseja continuar?`;
        if (window.confirm(confirmation)) {
            try {
                const response = await axios.post(`${API_URL}/users/${userId}/reset-password`, {}, { withCredentials: true });
                const tempPassword = response.data.temporary_password;
                
                alert(`Senha redefinida com sucesso!\n\nUsuário: ${username}\nNova Senha Temporária: ${tempPassword}\n\nPor favor, envie esta senha para o usuário.`);
                setSuccessMessage(response.data.message);
                setTimeout(() => setSuccessMessage(''), 4000);

            } catch (err) {
                setError(err.response?.data?.error || 'Erro ao redefinir a senha.');
                setTimeout(() => setError(''), 4000);
            }
        }
    };

    const getRoleIcon = (role) => {
        if (role === 'admin') return <FaCrown title="Administrador" className="role-icon admin" />;
        if (role === 'leader') return <FaUserShield title="Líder" className="role-icon leader" />;
        return <FaUser title="Membro" className="role-icon member" />;
    };

    if (isLoading) return <p>Carregando usuários...</p>;
    
    return (
        <div className="user-management-container">
            <h1>Gerenciar Usuários</h1>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <div className="user-list-table-wrapper">
                <table className="user-list-table">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Habby ID</th>
                            <th>Nível</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <img src={user.profile_pic_url} alt={user.nick || user.username} className="user-avatar" />
                                        <span>{user.nick || user.username}</span>
                                    </div>
                                </td>
                                <td>{user.habby_id}</td>
                                <td>
                                    <div className="role-cell">
                                        {getRoleIcon(user.role)}
                                        <span className="role-text">{user.role}</span>
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    {/* Container para alinhar os botões e o select */}
                                    <div className="action-buttons-container">
                                        {currentUser?.role === 'admin' && currentUser?.id !== user.id && user.role !== 'admin' && (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="role-select"
                                                title="Alterar nível de acesso"
                                            >
                                                <option value="member">Membro</option>
                                                <option value="leader">Líder</option>
                                            </select>
                                        )}

                                        {currentUser?.role === 'admin' && currentUser?.id !== user.id && (
                                             <button 
                                                className="action-button reset-password" 
                                                title="Redefinir Senha"
                                                onClick={() => handleResetPassword(user.id, user.username)}
                                            >
                                                <FaKey />
                                            </button>
                                        )}

                                        {currentUser?.id !== user.id && (user.role === 'member' || currentUser.role === 'admin') && user.role !== 'admin' && (
                                            <button 
                                                className="action-button delete" 
                                                title="Excluir Usuário"
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPage;