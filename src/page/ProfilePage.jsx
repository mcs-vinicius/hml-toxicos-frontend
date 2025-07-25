import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css';

const ProfilePage = ({ currentUser }) => {
    const { habby_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isHonorMember, setIsHonorMember] = useState(false);
    const [history, setHistory] = useState(null);

    const fetchProfileData = async () => {
        if (!habby_id) return;
        setLoading(true);
        try {
            const [profileRes, honorRes, historyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/profile/${habby_id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/honor-status/${habby_id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/history/${habby_id}`)
            ]);
            
            setProfile(profileRes.data);
            setFormData(profileRes.data);
            setIsHonorMember(honorRes.data.is_honor_member);
            setHistory(historyRes.data);

        } catch (error) {
            console.error("Erro ao buscar dados do perfil:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProfileData();
    }, [habby_id]);

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setIsEditing(false);
        setFormData(profile);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSave = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/profile`, formData);
            setProfile(formData);
            setIsEditing(false);
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            alert(`Erro ao salvar: ${error.response?.data?.error || 'Tente novamente.'}`);
        }
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
    
    // Helper para renderizar campos (visualização ou edição)
    // Ajustado para renderizar campos de texto também
    const renderField = (label, name, formatter = formatStat, type = 'number') => (
        <li>
            {label}:
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                />
            ) : (
                <span>{formatter(profile[name])}</span>
            )}
        </li>
    );

    return (
        <div className={containerClassName}>
            <div className="profile-main-info">
                <div className="profile-pic-wrapper">
                    <img src={isEditing ? formData.profile_pic_url : profile.profile_pic_url} alt={`Foto de ${profile.nick}`} className="profile-pic" />
                </div>
                <div className="profile-details">
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                name="nick"
                                className="nick-edit-input"
                                value={formData.nick || ''}
                                onChange={handleChange}
                            />
                            {/* CAMPO PARA EDITAR A FOTO - AGORA CONDICIONAL */}
                            <input
                                type="text"
                                name="profile_pic_url"
                                className="pic-url-edit-input"
                                value={formData.profile_pic_url || ''}
                                onChange={handleChange}
                                placeholder="URL da nova imagem de perfil"
                            />
                        </>
                    ) : (
                        <>
                            <h1>{profile.nick || 'Nome não definido'}</h1>
                        </>
                    )}
                    <p>Habby ID: {profile.habby_id}</p>
                    <div className="main-stats">
                        <div className="stat-item">ATK: <span>{formatStat(isEditing ? formData.atk : profile.atk)}</span></div>
                        <div className="stat-item">HP: <span>{formatStat(isEditing ? formData.hp : profile.hp)}</span></div>
                    </div>

                    {history && history.position != null ? (
                        <div className="profile-history">
                            <div className="history-item">
                                <h4>Última Posição</h4>
                                <p>{history.position}º</p>
                            </div>
                            <div className="history-item">
                                <h4>Última Fase</h4>
                                <p>{history.fase_acesso}</p>
                            </div>
                            <div className="history-item">
                                <h4>Evolução</h4>
                                <p className={history.evolution > 0 ? 'positive' : history.evolution < 0 ? 'negative' : ''}>
                                    {history.evolution > 0 ? `+${history.evolution}` : (history.evolution === 0 ? '–' : history.evolution)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-history-empty">
                            <p>Sem dados de histórico de ranking para exibir.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-section">
                <div className="stats-group">
                    <h3>Atributos do Sobrevivente</h3>
                    <ul>
                        {renderField("ATK Base", "survivor_base_atk")}
                        {renderField("HP Base", "survivor_base_hp")}
                        {renderField("Bônus ATK", "survivor_bonus_atk", formatPercent)}
                        {renderField("Bônus HP", "survivor_bonus_hp", formatPercent)}
                        {renderField("ATK Final", "survivor_final_atk")}
                        {renderField("HP Final", "survivor_final_hp")}
                    </ul>
                </div>
                <div className="stats-group">
                    <h3>Bônus de Dano (Sobrevivente)</h3>
                     <ul>
                        {renderField("Taxa Crítica", "survivor_crit_rate", formatPercent)}
                        {renderField("Dano Crítico", "survivor_crit_damage", formatPercent)}
                        {renderField("Dano de Habilidade", "survivor_skill_damage", formatPercent)}
                    </ul>
                </div>
                 <div className="stats-group">
                    <h3>Bônus Especiais (Sobrevivente)</h3>
                     <ul>
                        {renderField("Reforço de Escudo", "survivor_shield_boost", formatPercent)}
                        {renderField("Alvos Envenenados", "survivor_poison_targets", formatPercent)}
                        {renderField("Alvos Enfraquecidos", "survivor_weak_targets", formatPercent)}
                        {renderField("Alvos Congelados", "survivor_frozen_targets", formatPercent)}
                    </ul>
                </div>
            </div>
            
            <div className="stats-section">
                <div className="stats-group">
                    <h3>Atributos do Pet</h3>
                    <ul>
                        {renderField("ATK Base", "pet_base_atk")}
                        {renderField("HP Base", "pet_base_hp")}
                        {renderField("Dano Crítico", "pet_crit_damage", formatPercent)}
                        {renderField("Dano de Habilidade", "pet_skill_damage", formatPercent)}
                    </ul>
                </div>
            </div>

            <div className="stats-section">
                <div className="stats-group">
                    <h3>Atributos de Colecionáveis</h3>
                    <ul>
                        {renderField("ATK Final", "collect_final_atk")}
                        {renderField("HP Final", "collect_final_hp")}
                    </ul>
                </div>
                <div className="stats-group">
                    <h3>Bônus de Dano (Colecionáveis)</h3>
                    <ul>
                        {renderField("Taxa Crítica", "collect_crit_rate", formatPercent)}
                        {renderField("Dano Crítico", "collect_crit_damage", formatPercent)}
                        {renderField("Dano de Habilidade", "collect_skill_damage", formatPercent)}
                    </ul>
                </div>
                <div className="stats-group">
                    <h3>Bônus Especiais (Colecionáveis)</h3>
                    <ul>
                        {renderField("Alvos Envenenados", "collect_poison_targets", formatPercent)}
                        {renderField("Alvos Enfraquecidos", "collect_weak_targets", formatPercent)}
                        {renderField("Alvos Congelados", "collect_frozen_targets", formatPercent)}
                    </ul>
                </div>
            </div>

            {currentUser && currentUser.habby_id === habby_id && (
                <div className="profile-edit-cta">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
                            <button onClick={handleSave} className="btn-save">Salvar</button>
                        </>
                    ) : (
                        <button onClick={handleEdit}>Editar Perfil</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;