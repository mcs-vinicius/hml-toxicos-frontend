import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/ResultsPage.css";
import { FaTrash } from "react-icons/fa"; // Importando o ícone

// Helper para construir o URL da imagem dinamicamente, compatível com o Vite
const getTierImageUrl = (emblem) => {
  return new URL(`../../assets/tier/${emblem}.png`, import.meta.url).href;
};

const ResultsPage = ({ currentUser }) => {
  const [seasons, setSeasons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchSeasons() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/seasons`
      );
      const data = response.data;
      setSeasons(data);

      if (data.length > 0) {
        setCurrentPage(data.length);
      }
    } catch (error) {
      console.error("Erro ao buscar temporadas:", error);
    }
  }

  useEffect(() => {
    fetchSeasons();
  }, []);

  // Lógica para deletar a temporada
  const handleDeleteSeason = async (seasonId) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a Temporada ${currentPage}? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/seasons/${seasonId}`
        );
        alert("Temporada excluída com sucesso!");
        // Re-busca os dados para atualizar a lista
        fetchSeasons();
      } catch (error) {
        console.error("Erro ao excluir temporada:", error);
        alert(
          error.response?.data?.error || "Não foi possível excluir a temporada."
        );
      }
    }
  };

  const totalPages = seasons.length;
  const season = seasons[currentPage - 1];

  const getRankingData = (participants) => {
    const sortedByFase = [...participants].sort((a, b) => b.fase - a.fase);
    const top30Fase = sortedByFase.slice(0, 30);
    const remainingFase = sortedByFase.slice(30);
    const sumFase = top30Fase.reduce((acc, p) => acc + p.fase, 0);

    const sortedByTotal = [...participants]
      .map((p) => ({ ...p, total: p.r1 + p.r2 + p.r3 }))
      .sort((a, b) => b.total - a.total);
    const top30Total = sortedByTotal.slice(0, 30);
    const remainingTotal = sortedByTotal.slice(30);
    const sumTotal = top30Total.reduce((acc, p) => acc + p.total, 0);

    return {
      top30Fase,
      remainingFase,
      sumFase,
      top30Total,
      remainingTotal,
      sumTotal,
    };
  };

  const rankingData = season ? getRankingData(season.participants) : null;

  const calculateEvolution = (participantName, currentSeasonIndex) => {
    if (currentSeasonIndex <= 0 || seasons.length <= 1) {
      return "-";
    }

    const currentSeason = seasons[currentSeasonIndex];
    const previousSeason = seasons[currentSeasonIndex - 1];

    if (!currentSeason || !previousSeason) return "-";

    const currentParticipant = currentSeason.participants.find(
      (p) => p.name === participantName
    );
    const previousParticipant = previousSeason.participants.find(
      (p) => p.name === participantName
    );

    if (currentParticipant && previousParticipant) {
      const evolution = currentParticipant.fase - previousParticipant.fase;
      return evolution;
    }
    return "-";
  };

  const formatDateBR = (dateString) => {
    if (!dateString) return "Data não definida";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const getTier = (fase) => {
    if (fase >= 0 && fase <= 300) return { name: "Coimbra", emblem: "1" };
    if (fase >= 301 && fase <= 340)
      return { name: "Digno de Pena", emblem: "2" };
    if (fase >= 341 && fase <= 350) return { name: "Descartavel", emblem: "3" };
    if (fase >= 351 && fase <= 360) return { name: "Inutil", emblem: "4" };
    if (fase >= 361 && fase <= 375)
      return { name: "Desqualificado", emblem: "5" };
    if (fase >= 376 && fase <= 390) return { name: "Fraco", emblem: "6" };
    if (fase >= 391 && fase <= 410) return { name: "Meia Boca", emblem: "7" };
    if (fase >= 411 && fase <= 435) return { name: "Mediocre", emblem: "8" };
    if (fase >= 436 && fase <= 450) return { name: "Razoavel", emblem: "9" };
    if (fase >= 451 && fase <= 475) return { name: "Bom", emblem: "10" };
    if (fase >= 476 && fase <= 499) return { name: "Ilustre", emblem: "11" };
    if (fase >= 499 && fase <= 520) return { name: "Elite", emblem: "12" };
    if (fase >= 521 && fase <= 540)
      return { name: "Aristocrata", emblem: "13" };
    if (fase >= 541 && fase <= 575) return { name: "Nobreza", emblem: "14" };
    if (fase >= 576) return { name: "Baleia", emblem: "15" };
    return { name: "", emblem: "1" }; // Retorna um emblema padrão caso não encontre
  };

  const renderEvolution = (participantName) => {
    const evolution = calculateEvolution(participantName, currentPage - 1);
    const isNumeric = typeof evolution === "number";

    let evolutionClass = "evolution-neutral";
    if (isNumeric) {
      if (evolution > 0) evolutionClass = "evolution-positive";
      if (evolution < 0) evolutionClass = "evolution-negative";
    }

    const evolutionText =
      isNumeric && evolution > 0 ? `+${evolution}` : evolution;

    return <td className={evolutionClass}>{evolutionText}</td>;
  };

  return (
    <div className="container">
      <h1 className="title">Expedição Lunar</h1>
      {season && rankingData ? (
        <>
          <div className="season-info-container">
            <div className="season-info">
              Temporada {currentPage} - {formatDateBR(season.start_date)} até{" "}
              {formatDateBR(season.end_date)}
            </div>
            {currentUser?.role === "admin" && (
              <button
                className="btn-delete-season"
                onClick={() => handleDeleteSeason(season.id)}
                title="Excluir esta Temporada"
              >
                <FaTrash /> Excluir Temporada
              </button>
            )}
          </div>

          <div className="tables-container">
            <div className="table-wrapper">
              <div className="table-title">Rank de Acesso</div>
              <table>
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Nome</th>
                    <th>Tier</th>
                    <th>Fase de Acesso</th>
                    <th>Evolução</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.top30Fase.map((p, i) => {
                    const tier = getTier(p.fase);
                    return (
                      <tr key={p.id || i}>
                        <td data-label="Posição">{i + 1}º</td>
                        <td data-label="Nome" className="leftlabel">
                          {p.name}
                        </td>
                        <td data-label="Tier" className="emblem-cell">
                          <img
                            src={getTierImageUrl(tier.emblem)}
                            alt={tier.name}
                            className="tier-emblem"
                          />
                          <span>{tier.name}</span>
                        </td>
                        <td data-label="Fase de Acesso">{p.fase}</td>
                        {renderEvolution(p.name)}
                      </tr>
                    );
                  })}
                  {rankingData.remainingFase.map((p, i) => {
                    const tier = getTier(p.fase);
                    return (
                      <tr key={p.id || i} className="inactive-participant">
                        <td data-label="Posição">{30 + i + 1}º</td>
                        <td className="leftlabel" data-label="Nome">
                          {p.name}
                        </td>
                        <td data-label="Tier" className="emblem-cell">
                          <img
                            src={getTierImageUrl(tier.emblem)}
                            alt={tier.name}
                            className="tier-emblem"
                          />
                          <span>{tier.name}</span>
                        </td>
                        <td data-label="Fase">{p.fase}</td>
                        {renderEvolution(p.name)}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="lvTotal">
                  <tr className="lvAA">
                    <td className="lvtt" colSpan="3">
                      Total (Top 30)
                    </td>
                    <td className="lvtt" colSpan="2">
                      <span className="txtcenter">
                        {rankingData.sumFase.toLocaleString("pt-BR")}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="table-wrapper">
              <div className="table-title">Expedição Lunar</div>
              <table>
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Nome</th>
                    <th>1ª Rodada</th>
                    <th>2ª Rodada</th>
                    <th>3ª Rodada</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Top 30 Ativos */}
                  {rankingData.top30Total.map((p, i) => (
                    <tr key={p.id || i}>
                      <td data-label="Posição">{i + 1}º</td>
                      <td data-label="Nome" className="leftlabel">
                        {p.name}
                      </td>
                      <td data-label="1ª Rodada">{p.r1}</td>
                      <td data-label="2ª Rodada">{p.r2}</td>
                      <td data-label="3ª Rodada">{p.r3}</td>
                      <td data-label="Total">{p.total}</td>
                    </tr>
                  ))}
                  {/* Restante Inativo (com pontuação) */}
                  {rankingData.remainingTotal.map((p, i) => (
                    <tr key={p.id || i} className="inactive-participant">
                      <td data-label="Posição">{30 + i + 1}º</td>
                      <td data-label="Nome" className="leftlabel">
                        {p.name}
                      </td>
                      <td data-label="1ª Rodada">{p.r1}</td>
                      <td data-label="2ª Rodada">{p.r2}</td>
                      <td data-label="3ª Rodada">{p.r3}</td>
                      <td data-label="Total">{p.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="lvTotal">
                  <tr className="lvAA">
                    <td className="lvtt" colSpan="5">
                      Total (Top 30)
                    </td>
                    <td className="lvtt">
                      {rankingData.sumTotal.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
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
        <p>Nenhuma temporada encontrada. Verificando dados...</p>
      )}
    </div>
  );
};

export default ResultsPage;