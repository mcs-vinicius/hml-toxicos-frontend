import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomePage.css'; 
import Cta from '../components/cta/Cta';

const Home = ({ userRole }) => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [homeContent, setHomeContent] = useState({
    leader: '',
    focus: '',
    league: '',
    requirements: [],
    about_us: '',
    content_section: ''
  });

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [seasonsRes, contentRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/seasons`),
        axios.get(`${import.meta.env.VITE_API_URL}/home-content`)
      ]);

      const seasons = seasonsRes.data;
      if (seasons.length > 0) {
        const latestSeason = seasons[seasons.length - 1];
        const sortedPlayers = [...latestSeason.participants].sort((a, b) => b.fase - a.fase);
        setTopPlayers(sortedPlayers.slice(0, 3));
        setMemberCount(latestSeason.participants.length);
      }
      
      setHomeContent(contentRes.data);

    } catch (error) {
      console.error("Erro ao buscar dados para a Home:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHomeContent(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...homeContent.requirements];
    newRequirements[index] = value;
    setHomeContent(prev => ({ ...prev, requirements: newRequirements }));
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/home-content`, homeContent);
      alert("Conteúdo salvo com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar conteúdo:", error);
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
                <button onClick={handleSaveChanges} className="btn-save">Salvar Alterações</button>
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
                  <input type="text" name="leader" value={homeContent.leader} onChange={handleInputChange} />
                  <input type="text" name="focus" value={homeContent.focus} onChange={handleInputChange} />
                  <input type="text" name="league" value={homeContent.league} onChange={handleInputChange} />
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
            <p style={{textAlign: 'center'}}>Analisando dados...</p>
          ) : (
            <div className="mini-ranking">
              {[1, 0, 2].map((index, podiumPos) => {
                const player = topPlayers[index];
                if (!player) return <div key={podiumPos} className={`rank-podium rank-${podiumPos + 1}`}></div>;
                return (
                  <div key={player.name} className={`rank-podium rank-${index === 0 ? 1 : (index === 1 ? 2 : 3)}`}>
                    <div className="podium-bar"></div>
                    <p className="player-name">{player.name}</p>
                    <p className="player-score">{player.fase.toLocaleString('pt-BR')} ATK</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
     
        <div className="section">
          <h2 className="section-title">Sobre Nós</h2>
          {isEditing ? (
            <textarea name="about_us" value={homeContent.about_us} onChange={handleInputChange} className="edit-textarea"></textarea>
          ) : (
            <p style={{textAlign: 'center', lineHeight: '1.6'}}>{homeContent.about_us}</p>
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










