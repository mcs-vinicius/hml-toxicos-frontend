import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/HonorPage.css"; // Estilos específicos para esta página

const HonorPage = () => {
  const [honorSeasons, setHonorSeasons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHonorSeasons = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/honor-seasons`);
        const data = response.data;
        setHonorSeasons(data);
        if (data.length > 0) {
          setCurrentPage(data.length);
        }
      } catch (error) {
        console.error("Erro ao buscar temporadas de honra:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHonorSeasons();
  }, []);

  const totalPages = honorSeasons.length;
  const season = honorSeasons[currentPage - 1];

  const formatDateBR = (dateString) => {
    if (!dateString) return 'Data não definida';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return <div className="honor-container"><p>Carregando dados de honra...</p></div>;
  }

  return (
    <div className="honor-container">
      <h1 className="honor-title">Membros de Honra</h1>
      {season ? (
        <>
          <div className="honor-season-info">
            Temporada {currentPage} - {formatDateBR(season.start_date)} até {formatDateBR(season.end_date)}
          </div>

          <div className="honor-list-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Nome</th>
                  <th>ID Habby</th>
                  <th>Acesso</th>
                  <th>Ataque</th>
                </tr>
              </thead>
              <tbody>
                {season.participants.map((p, index) => (
                  <tr key={p.id || index} className={index < 3 ? 'honor-member' : ''}>
                    <td data-label="Posição">{index + 1}º</td>
                    <td data-label="Nome">{p.name}</td>
                    <td data-label="ID Habby">{p.habby_id}</td>
                    <td data-label="Acesso">{p.fase_acesso}</td>
                    <td data-label="Ataque">{p.fase_ataque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt; Anterior
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próximo &gt;
            </button>
          </div>
        </>
      ) : (
        <p>Nenhuma temporada de honra encontrada.</p>
      )}
    </div>
  );
};

export default HonorPage;