// src/page/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css';

const ProfilePage = ({ currentUser }) => {
    const { habby_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHonorMember, setIsHonorMember] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`);
                setProfile(profileRes.data);

                const honorRes = await axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habby_id}`);
                setIsHonorMember(honorRes.data.is_honor_member);

            } catch (error) {
                console.error("Erro ao buscar dados do perfil:", error);
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

    const containerClassName = `profile-container ${isHonorMember ? 'gloria-profile' : ''}`;

    const renderStatItem = (label, value) => (
        <li>{label}: <span>{value || 0}</span></li>
    );

    const renderStatItemPercentage = (label, value) => (
        <li>{label}: <span>{value || '0.00'}%</span></li>
    );

    return (
        <div className={containerClassName}>
            <div className="profile-header">
                <div className="profile-pic-wrapper">
                    <img src={profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                </div>
                <div className="profile-info">
                    <h1>{profile.nick || 'Nome não definido'}</h1>
                    <p>Habby ID: {profile.habby_id}</p>
                </div>
            </div>

            <div className="profile-stats-grid">
                {/* Card de Atributos Gerais */}
                <div className="stat-card">
                    <h3>Atributos Gerais</h3>
                    <ul>
                        {renderStatItem("ATK Total", profile.atk)}
                        {renderStatItem("HP Total", profile.hp)}
                    </ul>
                </div>

                {/* Card do Sobrevivente */}
                <div className="stat-card">
                    <h3>Atributos do Sobrevivente</h3>
                    <ul>
                        {renderStatItem("ATK Base", profile.survivor_base_atk)}
                        {renderStatItem("HP Base", profile.survivor_base_hp)}
                        {renderStatItemPercentage("Bônus ATK", profile.survivor_bonus_atk)}
                        {renderStatItemPercentage("Bônus HP", profile.survivor_bonus_hp)}
                        {renderStatItem("ATK Final", profile.survivor_final_atk)}
                        {renderStatItem("HP Final", profile.survivor_final_hp)}
                        {renderStatItemPercentage("Taxa Crítica", profile.survivor_crit_rate)}
                        {renderStatItemPercentage("Dano Crítico", profile.survivor_crit_damage)}
                        {renderStatItemPercentage("Dano de Habilidade", profile.survivor_skill_damage)}
                        {renderStatItemPercentage("Reforço de Escudo", profile.survivor_shield_boost)}
                        {renderStatItemPercentage("Alvos Envenenados", profile.survivor_poison_targets)}
                        {renderStatItemPercentage("Alvos Enfraquecidos", profile.survivor_weak_targets)}
                        {renderStatItemPercentage("Alvos Congelados", profile.survivor_frozen_targets)}
                    </ul>
                </div>
                
                {/* Card do Pet */}
                <div className="stat-card">
                    <h3>Atributos do Pet</h3>
                    <ul>
                        {renderStatItem("ATK Base", profile.pet_base_atk)}
                        {renderStatItem("HP Base", profile.pet_base_hp)}
                        {renderStatItemPercentage("Dano Crítico", profile.pet_crit_damage)}
                        {renderStatItemPercentage("Dano de Habilidade", profile.pet_skill_damage)}
                    </ul>
                </div>
                
                {/* Card de Colecionáveis */}
                <div className="stat-card">
                    <h3>Atributos de Colecionáveis</h3>
                    <ul>
                        {renderStatItem("ATK Final", profile.collect_final_atk)}
                        {renderStatItem("HP Final", profile.collect_final_hp)}
                        {renderStatItemPercentage("Taxa Crítica", profile.collect_crit_rate)}
                        {renderStatItemPercentage("Dano Crítico", profile.collect_crit_damage)}
                        {renderStatItemPercentage("Dano de Habilidade", profile.collect_skill_damage)}
                        {renderStatItemPercentage("Alvos Envenenados", profile.collect_poison_targets)}
                        {renderStatItemPercentage("Alvos Enfraquecidos", profile.collect_weak_targets)}
                        {renderStatItemPercentage("Alvos Congelados", profile.collect_frozen_targets)}
                    </ul>
                </div>
            </div>
            
            {currentUser && currentUser.habby_id === habby_id && (
                <div className="profile-edit-cta">
                    <button onClick={() => alert('Lógica de edição a ser implementada')}>Editar Perfil</button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;