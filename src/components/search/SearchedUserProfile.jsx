import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/SearchedUserProfile.css'; // Estilo para o modal

const SearchedUserProfile = ({ habbyId, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('status');

    useEffect(() => {
        if (!habbyId) return;

        setLoading(true);
        setActiveTab('status'); // Reseta para a aba status
        setHistory(null); // Limpa o histórico anterior

        const fetchProfile = async () => {
            try {
                const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${habbyId}`);
                setProfile(profileRes.data);
            } catch (error) {
                console.error("Erro ao buscar dados do perfil pesquisado:", error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [habbyId]);

    useEffect(() => {
        const fetchHistory = async () => {
            // Busca o histórico apenas quando a aba é clicada e os dados ainda não foram carregados
            if (activeTab === 'history' && habbyId && !history) {
                try {
                    const historyRes = await axios.get(`${import.meta.env.VITE_API_URL}/history/${habbyId}`);
                    setHistory(historyRes.data);
                } catch (error) {
                    console.error("Erro ao buscar histórico:", error);
                    setHistory(null);
                }
            }
        };
        fetchHistory();
    }, [activeTab, habbyId, history]);

    const renderField = (label, value) => (
        <div className="field-item">
            <span className="field-label">{label}:</span>
            <span className="field-value">{value || 'N/A'}</span>
        </div>
    );

    return (
        <div className="searched-profile-modal">
            <div className="modal-content">
                <button onClick={onClose} className="close-btn" title="Fechar">&times;</button>
                
                {loading && <p>Carregando perfil...</p>}
                
                {!loading && !profile && <p>Perfil não encontrado.</p>}

                {!loading && profile && (
                    <>
                        <div className="modal-profile-header">
                            <img src={profile.profile_pic_url || 'https://via.placeholder.com/100'} alt="Perfil" className="modal-profile-picture" />
                            <div className="modal-profile-titles">
                                <h1>{profile.nick || 'N/A'}</h1>
                                <p>ID Habby: {profile.habby_id}</p>
                            </div>
                        </div>

                        <div className="modal-profile-tabs">
                            <button onClick={() => setActiveTab('status')} className={activeTab === 'status' ? 'active' : ''}>Status</button>
                            <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>Histórico</button>
                        </div>

                        {activeTab === 'status' && (
                            <div className="modal-body status-tab">
                                {renderField('ATK Total', profile.atk)}
                                {renderField('HP Total', profile.hp)}
                                {renderField('ATQ Sobrevivente', profile.survivor_base_atk)}
                                {renderField('HP Sobrevivente', profile.survivor_base_hp)}
                                {renderField('ATQ Pet', profile.pet_base_atk)}
                                {renderField('HP Pet', profile.pet_base_hp)}
                            </div>
                        )}
                        
                        {activeTab === 'history' && (
                            <div className="modal-body history-tab">
                                {history ? (
                                    <>
                                        {renderField('Posição no Ranking', `${history.position}º`)}
                                        {renderField('Pontuação (Acesso)', history.fase_acesso)}
                                        {renderField('Evolução vs Temporada Anterior', history.evolution)}
                                    </>
                                ) : (
                                <p>Carregando histórico ou nenhum encontrado...</p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchedUserProfile;