import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EditProfileModal from '../components/profile/EditProfileModal';
import '../styles/ProfilePage.css';

const ProfilePage = ({ currentUser }) => {
    const { habby_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHonorMember, setIsHonorMember] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const [profileRes, honorRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habby_id}`)
            ]);
            
            setProfile(profileRes.data);
            setIsHonorMember(honorRes.data.is_honor_member);

        } catch (error) {
            console.error("Erro ao buscar dados do perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (habby_id) {
            fetchProfileData();
        }
    }, [habby_id]);
    
    const handleOpenEditModal = () => setIsEditModalOpen(true);
    const handleCloseEditModal = () => setIsEditModalOpen(false);
    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        alert("Perfil atualizado com sucesso!");
    };

    const formatStat = (value) => parseInt(value, 10) || 0;
    const formatPercent = (value) => `${parseInt(value, 10) || 0}%`;

    if (loading) {
        return <div className="profile-container"><p>Carregando perfil...</p></div>;
    }

    if (!profile) {
        return <div className="profile-container"><p>Perfil não encontrado.</p></div>;
    }

    const containerClassName = `profile-container ${isHonorMember ? 'gloria-profile' : ''}`;

    return (
        <>
            <div className={containerClassName}>
                <div className="profile-main-info">
                    <div className="profile-pic-wrapper">
                        <img src={profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                    </div>
                    <div className="profile-details">
                        <h1>{profile.nick || 'Nome não definido'}</h1>
                        <p>Habby ID: {profile.habby_id}</p>
                        <div className="main-stats">
                            <div className="stat-item">ATK: <span>{formatStat(profile.atk)}</span></div>
                            <div className="stat-item">HP: <span>{formatStat(profile.hp)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="stats-section">
                    <div className="stats-group">
                        <h3>Atributos do Sobrevivente</h3>
                        <ul>
                            <li>ATK Base: <span>{formatStat(profile.survivor_base_atk)}</span></li>
                            <li>HP Base: <span>{formatStat(profile.survivor_base_hp)}</span></li>
                            <li>Bônus ATK: <span>{formatPercent(profile.survivor_bonus_atk)}</span></li>
                            <li>Bônus HP: <span>{formatPercent(profile.survivor_bonus_hp)}</span></li>
                            <li>ATK Final: <span>{formatStat(profile.survivor_final_atk)}</span></li>
                            <li>HP Final: <span>{formatStat(profile.survivor_final_hp)}</span></li>
                        </ul>
                    </div>
                    <div className="stats-group">
                        <h3>Bônus de Dano (Sobrevivente)</h3>
                         <ul>
                            <li>Taxa Crítica: <span>{formatPercent(profile.survivor_crit_rate)}</span></li>
                            <li>Dano Crítico: <span>{formatPercent(profile.survivor_crit_damage)}</span></li>
                            <li>Dano de Habilidade: <span>{formatPercent(profile.survivor_skill_damage)}</span></li>
                        </ul>
                    </div>
                     <div className="stats-group">
                        <h3>Bônus Especiais (Sobrevivente)</h3>
                         <ul>
                            <li>Reforço de Escudo: <span>{formatPercent(profile.survivor_shield_boost)}</span></li>
                            <li>Alvos Envenenados: <span>{formatPercent(profile.survivor_poison_targets)}</span></li>
                            <li>Alvos Enfraquecidos: <span>{formatPercent(profile.survivor_weak_targets)}</span></li>
                            <li>Alvos Congelados: <span>{formatPercent(profile.survivor_frozen_targets)}</span></li>
                        </ul>
                    </div>
                </div>

                 <div className="stats-section">
                    <div className="stats-group">
                        <h3>Atributos do Pet</h3>
                         <ul>
                            <li>ATK Base: <span>{formatStat(profile.pet_base_atk)}</span></li>
                            <li>HP Base: <span>{formatStat(profile.pet_base_hp)}</span></li>
                            <li>Dano Crítico: <span>{formatPercent(profile.pet_crit_damage)}</span></li>
                            <li>Dano de Habilidade: <span>{formatPercent(profile.pet_skill_damage)}</span></li>
                        </ul>
                    </div>
                </div>

                <div className="stats-section">
                    <div className="stats-group">
                        <h3>Atributos de Colecionáveis</h3>
                        <ul>
                            <li>ATK Final: <span>{formatStat(profile.collect_final_atk)}</span></li>
                            <li>HP Final: <span>{formatStat(profile.collect_final_hp)}</span></li>
                        </ul>
                    </div>
                    <div className="stats-group">
                        <h3>Bônus de Dano (Colecionáveis)</h3>
                         <ul>
                            <li>Taxa Crítica: <span>{formatPercent(profile.collect_crit_rate)}</span></li>
                            <li>Dano Crítico: <span>{formatPercent(profile.collect_crit_damage)}</span></li>
                            <li>Dano de Habilidade: <span>{formatPercent(profile.collect_skill_damage)}</span></li>
                        </ul>
                    </div>
                     <div className="stats-group">
                        <h3>Bônus Especiais (Colecionáveis)</h3>
                         <ul>
                            <li>Alvos Envenenados: <span>{formatPercent(profile.collect_poison_targets)}</span></li>
                            <li>Alvos Enfraquecidos: <span>{formatPercent(profile.collect_weak_targets)}</span></li>
                            <li>Alvos Congelados: <span>{formatPercent(profile.collect_frozen_targets)}</span></li>
                        </ul>
                    </div>
                </div>

                {currentUser && currentUser.habby_id === habby_id && (
                    <div className="profile-edit-cta">
                        <button onClick={handleOpenEditModal}>Editar Perfil</button>
                    </div>
                )}
            </div>
            
            <EditProfileModal
                profile={profile}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSave={handleProfileUpdate}
            />
        </>
    );
};

export default ProfilePage;