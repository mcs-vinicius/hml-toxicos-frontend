import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaUpload, FaEdit, FaSyncAlt } from "react-icons/fa";
import "../../styles/components/HonorRegisterPage.css";

const HonorRegisterPage = () => {
    const [members, setMembers] = useState([]);
    const [currentMember, setCurrentMember] = useState({ name: "", habby_id: "", fase_acesso: "Não", fase_ataque: "Não" });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState(null);

    const initialMemberListRef = useRef([]);

    useEffect(() => {
        const fetchCurrentHonorList = async () => {
            setPageLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/honor-members-management`);
                setMembers(response.data);
                initialMemberListRef.current = response.data.map(m => m.habby_id);
            } catch (error) {
                console.error("Erro ao carregar lista para gerenciamento:", error);
            } finally {
                setPageLoading(false);
            }
        };
        fetchCurrentHonorList();
    }, []);

    const sortHonorList = () => {
        if (!window.confirm("Isso irá reordenar a lista para a próxima temporada, movendo os 2 membros de honra atuais para o final da fila de elegíveis. Deseja continuar?")) {
            return;
        }

        const normalizeForSort = (value) => typeof value === 'string' && value.toLowerCase().startsWith('s');

        // AJUSTE: Mudou de 3 para 2
        const currentHonorMembers = members.slice(0, 2);
        const otherMembers = members.slice(2);

        const eligibleMembers = [];
        const newMembers = [];
        const ineligibleMembers = [];

        otherMembers.forEach(member => {
            const isEligible = normalizeForSort(member.fase_acesso) && normalizeForSort(member.fase_ataque);
            const isNew = !initialMemberListRef.current.includes(member.habby_id);

            if (isNew) {
                newMembers.push(member);
            } else if (isEligible) {
                eligibleMembers.push(member);
            } else {
                ineligibleMembers.push(member);
            }
        });

        const reorderedList = [
            ...eligibleMembers,
            ...currentHonorMembers,
            ...newMembers,
            ...ineligibleMembers
        ];

        setMembers(reorderedList);
        alert("Lista reordenada com sucesso!");
    };
    
    // As demais funções (handleAddOrUpdateMember, handleCsvUpload, etc.) permanecem como estão,
    // pois a lógica de salvar apenas ao finalizar está correta.

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentMember({ ...currentMember, [name]: value });
    };

    const handleRadioChange = (field, value) => {
        setCurrentMember({ ...currentMember, [field]: value });
    };

    const handleAddOrUpdateMember = () => {
        if (!currentMember.name || !currentMember.habby_id) {
            alert("Nome e Habby ID são obrigatórios.");
            return;
        }
        const habbyIdExists = members.some((m, index) => m.habby_id === currentMember.habby_id && index !== editingIndex);
        if (habbyIdExists) {
            alert("Este Habby ID já existe na lista. Para atualizar, edite o membro existente.");
            return;
        }
        let updatedMembers = [...members];
        if (editingIndex !== null) {
            updatedMembers[editingIndex] = currentMember;
        } else {
            updatedMembers.push(currentMember);
        }
        setMembers(updatedMembers);
        setEditingIndex(null);
        setCurrentMember({ name: "", habby_id: "", fase_acesso: "Não", fase_ataque: "Não" });
    };

    const handleEditMember = (index) => {
        setEditingIndex(index);
        setCurrentMember(members[index]);
    };

    const removeMember = (index) => {
        if (window.confirm("Tem certeza que deseja remover este membro da lista?")) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const handleCsvUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).slice(1);
                const membersMap = new Map(members.map(m => [m.habby_id, m]));
                lines.forEach(line => {
                    const [name, habby_id, fase_acesso, fase_ataque] = line.split(',').map(s => s ? s.trim() : '');
                    if (name && habby_id) {
                        membersMap.set(habby_id, {
                            name, habby_id,
                            fase_acesso: fase_acesso || "Não",
                            fase_ataque: fase_ataque || "Não",
                        });
                    }
                });
                setMembers(Array.from(membersMap.values()));
                alert(`Lista atualizada com ${lines.length} registros do CSV!`);
            };
            reader.readAsText(file);
        }
        event.target.value = null;
    };
    
    const finalizeSeason = async () => {
        if (members.length === 0 || !startDate || !endDate) {
            alert("É necessário ter membros na lista e definir as datas para criar uma nova temporada.");
            return;
        }
        if (!window.confirm("Isso criará um NOVO registro histórico com a lista e datas atuais. Deseja continuar?")) {
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/honor-seasons`, {
                startDate,
                endDate,
                participants: members,
            });
            alert(response.data.message);
            initialMemberListRef.current = members.map(m => m.habby_id);
            setStartDate("");
            setEndDate("");
        } catch (error) {
            alert(`Erro: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="honor-register-wrapper"><p>Carregando gerenciador de honra...</p></div>;
    }

    return (
        <div className="honor-register-wrapper">
            <div className="honor-register-container">
                <h1>Gerenciador da Lista de Honra</h1>
                <div className="honor-management-grid">
                    <div className="management-column">
                        <h2>{editingIndex !== null ? "Editando Membro" : "Adicionar / Importar"}</h2>
                        <div className="member-form">
                            <input name="name" value={currentMember.name} onChange={handleInputChange} placeholder="Nome do Membro" />
                            <input name="habby_id" value={currentMember.habby_id} onChange={handleInputChange} placeholder="Habby ID" />
                            <div className="radio-group">
                                <label>Fase Acesso:</label>
                                <div>
                                    <input type="radio" id="acessoSim" name="fase_acesso" checked={currentMember.fase_acesso === 'Sim'} onChange={() => handleRadioChange('fase_acesso', 'Sim')} />
                                    <label htmlFor="acessoSim">Sim</label>
                                    <input type="radio" id="acessoNao" name="fase_acesso" checked={currentMember.fase_acesso === 'Não'} onChange={() => handleRadioChange('fase_acesso', 'Não')} />
                                    <label htmlFor="acessoNao">Não</label>
                                </div>
                            </div>
                            <div className="radio-group">
                                <label>Fase Ataque:</label>
                                <div>
                                    <input type="radio" id="ataqueSim" name="fase_ataque" checked={currentMember.fase_ataque === 'Sim'} onChange={() => handleRadioChange('fase_ataque', 'Sim')} />
                                    <label htmlFor="ataqueSim">Sim</label>
                                    <input type="radio" id="ataqueNao" name="fase_ataque" checked={currentMember.fase_ataque === 'Não'} onChange={() => handleRadioChange('fase_ataque', 'Não')} />
                                    <label htmlFor="ataqueNao">Não</label>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={handleAddOrUpdateMember}>
                                {editingIndex !== null ? <><FaEdit /> Atualizar na Lista</> : <><FaPlus /> Adicionar à Lista</>}
                            </button>
                        </div>
                        <div className="csv-upload-section">
                            <p>Ou importe/atualize em massa via CSV</p>
                            <label htmlFor="csv-upload" className="btn btn-secondary">
                                <FaUpload /> Anexar CSV
                            </label>
                            <input id="csv-upload" type="file" accept=".csv" onChange={handleCsvUpload} />
                        </div>
                    </div>
                    <div className="management-column">
                        <div className="members-list-header">
                            <h2>Lista de Honra (Em Preparação)</h2>
                            <div className="header-buttons">
                                <button className="btn btn-secondary update-list-btn" onClick={sortHonorList} disabled={loading || members.length < 3}>
                                    <FaSyncAlt /> Reordenar
                                </button>
                            </div>
                        </div>
                        <div className="members-list">
                            {members.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Pos.</th>
                                            <th>Nome</th>
                                            <th>Acesso</th>
                                            <th>Ataque</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((p, index) => (
                                            // AJUSTE: Mudou de index < 3 para index < 2
                                            <tr key={p.habby_id || index} className={index < 2 ? 'current-honor-member' : ''}>
                                                <td data-label="Posição">{index + 1}º</td>
                                                <td data-label="Nome">{p.name}</td>
                                                <td data-label="Acesso">{p.fase_acesso}</td>
                                                <td data-label="Ataque">{p.fase_ataque}</td>
                                                <td className="action-buttons">
                                                    <button className="btn btn-edit" onClick={() => handleEditMember(index)}><FaEdit /></button>
                                                    <button className="btn btn-delete" onClick={() => removeMember(index)}><FaTrash /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="no-members-msg">Nenhum membro na lista. Adicione manualmente ou importe um arquivo CSV.</p>}
                        </div>
                    </div>
                </div>
                <div className="finalize-section">
                    <h2>Finalizar e Criar Nova Temporada</h2>
                    <p>Preencha as datas para criar um novo registro histórico com a lista atual. Use esta opção apenas ao final de um período.</p>
                    <div className="form-row">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary finalize-btn" onClick={finalizeSeason} disabled={loading || !startDate || !endDate || members.length === 0}>
                        {loading ? "Finalizando..." : "Finalizar Temporada"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HonorRegisterPage;