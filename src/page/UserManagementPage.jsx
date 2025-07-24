// src/page/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/UserManagementPage.css'; // Criar este arquivo de estilo

const UserManagementPage = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
                setUsers(response.data);
            } catch (err) {
                setError('Falha ao carregar usuários. Você tem permissão para ver esta página?');
                console.error(err);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Deseja alterar o nível deste usuário para ${newRole}?`)) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao alterar nível.');
        }
    };

    const handleDelete = async (userId, username) => {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário ${username}? Esta ação é irreversível.`)) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao excluir usuário.');
        }
    };
    
    const canDelete = (userToDelete) => {
        if (currentUser.role === 'admin' && currentUser.id !== userToDelete.id) {
            return true;
        }
        if (currentUser.role === 'leader' && userToDelete.role === 'member') {
            return true;
        }
        return false;
    };

    return (
        <div className="user-management-container">
            <h1>Gerenciamento de Usuários</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="user-list-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Nick</th>
                            <th>ID Habby</th>
                            <th>Nível</th>
                            <th className='action-space' >Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <img 
                                      src={user.profile_pic_url || `https://via.placeholder.com/40?text=${user.username.charAt(0)}`} 
                                      alt="Perfil" 
                                      className="profile-thumbnail"
                                    />
                                </td>
                                <td data-label="Nick">{user.nick || user.username}</td>
                                <td data-label="ID Habby">{user.habby_id}</td>
                                <td data-label="Nível">{user.role}</td>
                                <td data-label="Ações" className="action-buttons action-space"> 
                                    <div></div>
                                    <button onClick={() => navigate(`/profile/${user.habby_id}`)} className="btn btn-view">
                                        Perfil
                                    </button>
                                    {currentUser.role === 'admin' && currentUser.id !== user.id && user.role !== 'admin' && (
                                        <>
                                            {user.role === 'member' && (
                                                <button onClick={() => handleRoleChange(user.id, 'leader')} className="btn btn-promote">
                                                    Promover
                                                </button>
                                            )}
                                            {user.role === 'leader' && (
                                                <button onClick={() => handleRoleChange(user.id, 'member')} className="btn btn-demote">
                                                    Rebaixar
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {canDelete(user) && (
                                        <button onClick={() => handleDelete(user.id, user.username)} className="btn btn-delete">
                                            Excluir
                                        </button>
                                    )}
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