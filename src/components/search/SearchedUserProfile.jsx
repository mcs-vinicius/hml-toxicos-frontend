import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/SearchedUserProfile.css';

const SearchedUserProfile = ({ habbyId, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHonorMember, setIsHonorMember] = useState(false);

    useEffect(() => {
        if (!habbyId) return;

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const [profileRes, honorRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/profile/${habbyId}`),
                    axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habbyId}`)
                ]);
                
                setProfile(profileRes.data);
                setIsHonorMember(honorRes.data.is_honor_member);
            } catch (error) {
                console.error("Erro ao buscar perfil pesquisado:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [habbyId]);

    const formatStat = (value) => parseInt(value, 10) || 0;
    const formatPercent = (value) => `${parseInt(value, 10) || 0}%`;

    const modalClassName = `searched-user-profile-modal ${isHonorMember ? 'gloria-profile' : ''}`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={modalClassName} onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                {loading ? (
                    <p>Carregando perfil...</p>
                ) : profile ? (
                    <div className="modal-scroll-content">
                        <div className="profile-main-info">
                            <div className="profile-pic-wrapper">
                                <img src={profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                            </div>
                            <div className="profile-details">
                                <h1>{profile.nick || 'N/A'}</h1>
                                <p>Habby ID: {profile.habby_id}</p>
                                <div className="main-stats">
                                    <div className="stat-item">ATK: <span>{formatStat(profile.atk)}</span></div>
                                    <div className="stat-item">HP: <span>{formatStat(profile.hp)}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="stats-section">
                            <div className="stats-group">
                                <h3>Sobrevivente</h3>
                                <ul>
                                    <li>ATK Base: <span>{formatStat(profile.survivor_base_atk)}</span></li>
                                    <li>HP Base: <span>{formatStat(profile.survivor_base_hp)}</span></li>
                                    <li>Bônus ATK: <span>{formatPercent(profile.survivor_bonus_atk)}</span></li>
                                    <li>Bônus HP: <span>{formatPercent(profile.survivor_bonus_hp)}</span></li>
                                    <li>ATK Final: <span>{formatStat(profile.survivor_final_atk)}</span></li>
                                    <li>HP Final: <span>{formatStat(profile.survivor_final_hp)}</span></li>
                                    <li>Taxa Crítica: <span>{formatPercent(profile.survivor_crit_rate)}</span></li>
                                    <li>Dano Crítico: <span>{formatPercent(profile.survivor_crit_damage)}</span></li>
                                </ul>
                            </div>
                             <div className="stats-group">
                                <h3>Pet</h3>
                                 <ul>
                                    <li>ATK Base: <span>{formatStat(profile.pet_base_atk)}</span></li>
                                    <li>HP Base: <span>{formatStat(profile.pet_base_hp)}</span></li>
                                    <li>Dano Crítico: <span>{formatPercent(profile.pet_crit_damage)}</span></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="stats-section">
                           <div className="stats-group">
                                <h3>Colecionáveis</h3>
                                <ul>
                                    <li>ATK Final: <span>{formatStat(profile.collect_final_atk)}</span></li>
                                    <li>HP Final: <span>{formatStat(profile.collect_final_hp)}</span></li>
                                    <li>Taxa Crítica: <span>{formatPercent(profile.collect_crit_rate)}</span></li>
                                    <li>Dano Crítico: <span>{formatPercent(profile.collect_crit_damage)}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Não foi possível carregar o perfil.</p>
                )}
            </div>
        </div>
    );
};

export default SearchedUserProfile;