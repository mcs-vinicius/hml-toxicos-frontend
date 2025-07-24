// mcs-vinicius/projecttoxicos/projectToxicos-main/Frontend/src/components/ranking/RegisterPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaUpload, FaEdit } from "react-icons/fa"; 
import "../../styles/RegisterPage.css";

const RegisterPage = () => {
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentParticipant, setCurrentParticipant] = useState({
    name: "",
    habby_id: null,
    fase: "",
    r1: "0", // Default to 0
    r2: "0",
    r3: "0",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // A rota /users retorna a lista de usuários para o dropdown
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
        setAllUsers(response.data);
      } catch (error) {
        console.error("Falha ao buscar usuários:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const selectedUser = allUsers.find(user => user.nick === value || user.username === value);
      setCurrentParticipant({
        ...currentParticipant,
        name: value,
        habby_id: selectedUser ? selectedUser.habby_id : null
      });
    } else {
      setCurrentParticipant({ ...currentParticipant, [name]: value });
    }
  };

  const handleAddOrUpdateParticipant = () => {
    // Validação
    if (!currentParticipant.name || !currentParticipant.fase || !currentParticipant.habby_id) {
        alert("Por favor, selecione um membro válido e preencha a fase de acesso.");
        return;
    }

    const newParticipant = {
        ...currentParticipant,
        fase: parseInt(currentParticipant.fase, 10),
        r1: parseInt(currentParticipant.r1 || "0", 10),
        r2: parseInt(currentParticipant.r2 || "0", 10),
        r3: parseInt(currentParticipant.r3 || "0", 10),
    };
    
    if (editingIndex !== null) {
      // Atualizar
      const updatedParticipants = [...participants];
      updatedParticipants[editingIndex] = newParticipant;
      setParticipants(updatedParticipants);
      setEditingIndex(null); 
    } else {
      // Adicionar
      setParticipants([...participants, newParticipant]);
    }
    // Limpar formulário
    setCurrentParticipant({ name: "", habby_id: null, fase: "", r1: "0", r2: "0", r3: "0" });
  };

  const removeParticipant = (index) => {
    if(window.confirm("Tem certeza que deseja remover este participante?")) {
        setParticipants(participants.filter((_, i) => i !== index));
    }
  };
  
  const handleEditParticipant = (index) => {
    setEditingIndex(index);
    setCurrentParticipant(participants[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setCurrentParticipant({ name: "", habby_id: null, fase: "", r1: "0", r2: "0", r3: "0" });
  };

  const finalizeSeason = async () => {
    if (participants.length === 0 || !startDate || !endDate) {
      alert("Adicione pelo menos um participante e defina as datas de início e fim.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/seasons`, {
        startDate,
        endDate,
        participants, // A estrutura dos participantes já está correta
      });
      alert(response.data.message);
      // Limpar estado após sucesso
      setParticipants([]);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Erro ao finalizar temporada:", error);
      alert(`Erro ao finalizar temporada: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para upload de CSV (lógica do cliente)
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).slice(1); // Ignora cabeçalho e lida com quebras de linha
        const newParticipants = lines.map(line => {
          const [name, habby_id, fase, r1, r2, r3] = line.split(',').map(s => s.trim());
          if (name && habby_id && fase) {
            return {
              name, habby_id,
              fase: parseInt(fase, 10),
              r1: parseInt(r1 || "0", 10),
              r2: parseInt(r2 || "0", 10),
              r3: parseInt(r3 || "0", 10),
            };
          }
          return null;
        }).filter(p => p !== null); 
        setParticipants(prev => [...prev, ...newParticipants]);
        alert(`${newParticipants.length} participantes adicionados do arquivo CSV!`);
      };
      reader.readAsText(file);
    }
    event.target.value = null; 
  };
  
  return (
    <div className="register-page-wrapper">
      <div className="register-container">
        <h1>Registrar Pontuação de Membros</h1>
        
        {/* --- SEÇÃO DE UPLOAD DE CSV --- */}
        <div className="csv-upload-section">
          <h2>Importar por CSV</h2>
          <p>Anexe um arquivo .csv com as colunas: <b> name, habby_id, fase, r1, r2, r3</b></p>
          <label htmlFor="csv-upload" className="btn btn-primary btttn">
            <FaUpload /> Anexar Arquivo CSV
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleCsvUpload}
          />
        </div>
        <hr/>
        {/* --- FIM DA SEÇÃO DE UPLOAD --- */}

        {/* O título muda dependendo se está editando ou adicionando */}
        <h2>{editingIndex !== null ? "Editando Participante" : "Registro Manual"}</h2>
        <div className="participant-form">
          <div className="form-row">
            {/* ... (campos do formulário permanecem os mesmos) ... */}
             <div className="form-group">
              <label>Nome do Membro</label>
              <input
                type="text"
                name="name"
                value={currentParticipant.name}
                onChange={handleInputChange}
                placeholder="Digite ou selecione um nome"
                list="user-suggestions"
              />
              <datalist id="user-suggestions">
                {allUsers.map(user => (
                  <option key={user.habby_id} value={user.nick || user.username} />
                ))}
              </datalist>
            </div>
            <div className="form-group">
              <label>Fase de Acesso</label>
              <input
                type="number"
                name="fase"
                value={currentParticipant.fase}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rodada 1</label>
              <input
                type="number"
                name="r1"
                value={currentParticipant.r1}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Rodada 2</label>
              <input
                type="number"
                name="r2"
                value={currentParticipant.r2}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Rodada 3</label>
              <input
                type="number"
                name="r3"
                value={currentParticipant.r3}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* Botão principal muda de acordo com o contexto (Adicionar ou Atualizar) */}
          <button className="btn-primary btn btttn" onClick={handleAddOrUpdateParticipant}>
            {editingIndex !== null ? <><FaEdit /> Atualizar Participante</> : <><FaPlus /> Adicionar à Lista</>}
          </button>
          {/* Botão para cancelar a edição (só aparece no modo de edição) */}
          {editingIndex !== null && (
            <button className="btn btn-secondary btttn" onClick={cancelEdit} style={{ marginLeft: '10px' }}>
              Cancelar
            </button>
          )}
        </div>

        <div className="participants-list">
          <h2>Lista para a Temporada</h2>
          {participants.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Acesso</th>
                  <th>1°Fase</th>
                  <th>2°Fase</th>
                  <th>3°Fase</th>
                  <th >Ação</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, index) => (
                  <tr key={index}>
                    <td data-label="Nome">{p.name}</td>
                    <td data-label="Fase de Acesso"><span  className="leftlabel">{p.fase}</span></td>
                    <td data-label="1° Rodada">{p.r1}</td>
                    <td data-label="2° Rodada">{p.r2}</td>
                    <td data-label="3° Rodada">{p.r3}</td>
                    <td className="action-buttons">
                      <button className="btn btn-edit buttonEditDel" onClick={() => handleEditParticipant(index)}>
                        <FaEdit />
                      </button>
                      <button className="btn btn-delete buttonEditDel" onClick={() => removeParticipant(index)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhum membro adicionado ainda.</p>
          )}
        </div>

        <div className="finalize-section">
          <h2>Finalizar Temporada</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Data Inícial</label>
              <input
                className="form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Data Final</label>
              <input
                className="form-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary btttn" onClick={finalizeSeason} disabled={participants.length === 0 || !startDate || !endDate}>
            {loading ? "Finalizando..." : "Finalizar e Salvar Ranking"}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default RegisterPage;










