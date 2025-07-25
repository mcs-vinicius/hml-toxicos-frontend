import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css'; // Certifique-se de que o CSS está importado

const ProfilePage = ({ currentUser }) => {
    const { habby_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHonorMember, setIsHonorMember] = useState(false); // Novo estado para o status de honra

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // Busca os dados do perfil
                const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`);
                setProfile(profileRes.data);

                // Em paralelo, verifica o status de honra do usuário
                const honorRes = await axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habby_id}`);
                setIsHonorMember(honorRes.data.is_honor_member);

            } catch (error) {
                console.error("Erro ao buscar dados do perfil:", error);
                // Tratar erro, talvez redirecionar ou mostrar mensagem
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [habby_id]);

    if (loading) {
        return <div className="profile-container"><p>Carregando perfil...</p></div>;
    }

    if (!profile) {
        return <div className="profile-container"><p>Perfil não encontrado.</p></div>;
    }

    // Adiciona a classe 'gloria-profile' condicionalmente
    const containerClassName = `profile-container ${isHonorMember ? 'gloria-profile' : ''}`;

    return (
        <div className={containerClassName}>
            <div className="profile-header">
                <div className="profile-pic-wrapper">
                    <img src={profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                    {/* A coroa será adicionada via CSS se for membro de honra */}
                </div>
                <div className="profile-info">
                    <h1>{profile.nick || 'Nome não definido'}</h1>
                    <p>Habby ID: {profile.habby_id}</p>
                    {/* Outras informações básicas podem vir aqui */}
                </div>
            </div>

            <div className="profile-stats-grid">
                <div className="stat-card">
                    <h3>Atributos Base</h3>
                    <ul>
                        <li>ATK Base (Sobrev.): <span>{profile.survivor_base_atk || 0}</span></li>
                        <li>HP Base (Sobrev.): <span>{profile.survivor_base_hp || 0}</span></li>
                        <li>ATK Base (Pet): <span>{profile.pet_base_atk || 0}</span></li>
                        <li>HP Base (Pet): <span>{profile.pet_base_hp || 0}</span></li>
                    </ul>
                </div>
                <div className="stat-card">
                    <h3>Bônus de Sobrevivente</h3>
                    <ul>
                        <li>Bônus ATK: <span>{profile.survivor_bonus_atk || 0}%</span></li>
                        <li>Bônus HP: <span>{profile.survivor_bonus_hp || 0}%</span></li>
                        <li>Taxa Crítica: <span>{profile.survivor_crit_rate || 0}%</span></li>
                        <li>Dano Crítico: <span>{profile.survivor_crit_damage || 0}%</span></li>
                    </ul>
                </div>
                <div className="stat-card">
                    <h3>Colecionáveis</h3>
                    <ul>
                        <li>ATK Final: <span>{profile.collect_final_atk || 0}</span></li>
                        <li>HP Final: <span>{profile.collect_final_hp || 0}</span></li>
                        <li>Taxa Crítica: <span>{profile.collect_crit_rate || 0}%</span></li>
                        <li>Dano Crítico: <span>{profile.collect_crit_damage || 0}%</span></li>
                    </ul>
                </div>
            </div>
            
            {/* Adicionar o botão de edição se o perfil for do próprio usuário */}
            {currentUser && currentUser.habby_id === habby_id && (
                <div className="profile-edit-cta">
                    <button onClick={() => alert('Lógica de edição a ser implementada')}>Editar Perfil</button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;