import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomePage.css'; 
import Cta from '../components/cta/Cta';

const Home = ({ userRole }) => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [podiumSeasonDates, setPodiumSeasonDates] = useState({ start: '', end: '' });

  const [homeContent, setHomeContent] = useState({
    leader: '',
    focus: '',
    league: '',
    requirements: [],
    content_section: ''
  });
  const [honorInfo, setHonorInfo] = useState({ members: [], period: '' });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [seasonsRes, contentRes, honorRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/seasons`),
        axios.get(`${import.meta.env.VITE_API_URL}/home-content`),
        axios.get(`${import.meta.env.VITE_API_URL}/latest-honor-members`)
      ]);

      if (seasonsRes.data && seasonsRes.data.length > 0) {
        const latestSeason = seasonsRes.data[seasonsRes.data.length - 1];
        setTopPlayers([...latestSeason.participants].sort((a, b) => b.fase - a.fase).slice(0, 3));
        setMemberCount(latestSeason.participants.length);
        
        setPodiumSeasonDates({
          start: formatDate(latestSeason.start_date),
          end: formatDate(latestSeason.end_date)
        });
      }
      
      setHomeContent(contentRes.data);
      setHonorInfo(honorRes.data);

    } catch (error) {
      console.error("Erro ao buscar dados para a Home:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);
  
  const handleInputChange = (e) => setHomeContent(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleRequirementChange = (index, value) => {
    const newRequirements = [...homeContent.requirements];
    newRequirements[index] = value;
    setHomeContent(p => ({ ...p, requirements: newRequirements }));
  };
  const handleSaveChanges = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/home-content`, homeContent);
      alert("Conteúdo salvo com sucesso!");
      setIsEditing(false);
    } catch (error) {
      alert("Falha ao salvar o conteúdo.");
    }
  };

  return (
    <>
      <Cta/>
      <div className="home-container">
        
        {userRole === 'admin' && (
          <div className="admin-controls">
            {isEditing ? (
              <>
                <button onClick={handleSaveChanges} className="btn-save">Salvar</button>
                <button onClick={() => { setIsEditing(false); fetchHomeData(); }} className="btn-cancel">Cancelar</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-edit-mode">Editar Página</button>
            )}
          </div>
        )}

        <div className="section home-header">
            <h1>Tóxicøs</h1>
            <div className="header-content-wrapper">
                <div className="header-column">
                    <h3>Informações do Clã</h3>
                    {isEditing ? (
                        <div className="edit-fields">
                            <input type="text" name="leader" value={homeContent.leader} onChange={handleInputChange} placeholder="Líder" />
                            <input type="text" name="focus" value={homeContent.focus} onChange={handleInputChange} placeholder="Foco" />
                            <input type="text" name="league" value={homeContent.league} onChange={handleInputChange} placeholder="Liga" />
                        </div>
                    ) : (
                        <ul className="info-list">
                            <li>Líder: {homeContent.leader}</li>
                            <li>Membros: {memberCount} / 40</li>
                            <li>Foco: {homeContent.focus}</li>
                            <li>Liga Atual: {homeContent.league}</li>
                        </ul>
                    )}
                </div>
                <div className="header-column">
                    <h3>Requisitos de Alistamento</h3>
                    {isEditing ? (
                        <div className="edit-fields">
                            {homeContent.requirements.map((req, index) => (
                                <input key={index} type="text" value={req} onChange={(e) => handleRequirementChange(index, e.target.value)} />
                            ))}
                        </div>
                    ) : (
                        <ul className="requirements-list">
                            {homeContent.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>

        <div className="section">
          <h2 className="section-title">Pódio da Temporada</h2>
          {loading ? (
             <p style={{textAlign: 'center'}}>Carregando pódio...</p>
          ) : topPlayers.length > 0 ? (
            <>
              <div className="podium-container">
                {topPlayers.map((player, index) => (
                  <div key={player.habby_id || index} className={`podium-card rank-${index + 1}`}>
                    <div className="podium-rank">{index + 1}º</div>
                    <div className="podium-name">{player.name}</div>
                    <div className="podium-score">Fase: {player.fase}</div>
                  </div>
                ))}
              </div>
              <p className="season-period">
                Temporada de {podiumSeasonDates.start} até {podiumSeasonDates.end}
              </p>
            </>
          ) : (
            <p style={{textAlign: 'center'}}>O pódio da temporada ainda não foi definido.</p>
          )}
        </div>
     
        <div className="section honor-section">
            <h2 className="section-title">Membros de Honra</h2>
            {loading ? (
                <p style={{textAlign: 'center'}}>Buscando membros de honra...</p>
            ) : honorInfo.members && honorInfo.members.length > 0 ? (
                <>
                <div className="honor-members-grid">
                    {honorInfo.members.map(member => (
                    <div key={member.habby_id} className="honor-member-card gloria-profile">
                        <div className="profile-pic-wrapper">
                        <img src={member.profile_pic_url} alt={member.name} className="profile-pic" />
                        </div>
                        <p className="honor-member-name">{member.name}</p>
                    </div>
                    ))}
                </div>
                <p className="honor-period">{honorInfo.period}</p>
                </>
            ) : (
                <p style={{textAlign: 'center'}}>Os membros de honra da temporada atual ainda não foram definidos.</p>
            )}
        </div>

        <div className="section">
          <h2 className="section-title">Conteúdo</h2>
          {isEditing ? (
            <textarea name="content_section" value={homeContent.content_section} onChange={handleInputChange} className="edit-textarea"></textarea>
          ) : (
            <p style={{textAlign: 'center', lineHeight: '1.6'}}>{homeContent.content_section}</p>
          )}
        </div>

        <footer className="footer">
          <p>© 2025 Tóxicøs. Todos os direitos reservados. </p>
          <p>Desenvolvido por: <a href="https://mcs-vinicius.github.io/portifolio/">IzanagI</a></p>
        </footer>
      </div>
    </>
  );
};

export default Home;