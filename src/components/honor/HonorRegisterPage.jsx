import React, { useState, useEffect } from "react";
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

    // Busca a lista de membros da última temporada ao carregar a página
    useEffect(() => {
        const fetchCurrentHonorList = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/honor-members-management`);
                setMembers(response.data);
            } catch (error) {
                console.error("Erro ao buscar lista de gerenciamento de honra:", error);
                alert("Não foi possível carregar a lista de membros. Tente recarregar a página.");
            } finally {
                setPageLoading(false);
            }
        };
        fetchCurrentHonorList();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentMember({ ...currentMember, [name]: value });
    };

    const handleRadioChange = (field, value) => {
        setCurrentMember({ ...currentMember, [field]: value });
    };
    
    // Lógica unificada para adicionar ou atualizar membros
    const handleAddOrUpdateMember = () => {
        if (!currentMember.name || !currentMember.habby_id) {
            alert("Nome e Habby ID são obrigatórios.");
            return;
        }

        const habbyIdExists = members.some((m, index) => m.habby_id === currentMember.habby_id && index !== editingIndex);
        if (habbyIdExists) {
            alert("Este Habby ID já existe na lista.");
            return;
        }

        let updatedMembers = [...members];

        if (editingIndex !== null) {
            // Atualiza membro existente
            updatedMembers[editingIndex] = currentMember;
        } else {
            // Adiciona novo membro
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

    // Lógica de ordenação ajustada para ser flexível
    const sortHonorList = () => {
        const sorted = [...members].sort((a, b) => {
            const isAEligible = a.fase_acesso.toLowerCase().startsWith('s') && a.fase_ataque.toLowerCase().startsWith('s');
            const isBEligible = b.fase_acesso.toLowerCase().startsWith('s') && b.fase_ataque.toLowerCase().startsWith('s');
            if (isAEligible && !isBEligible) return -1;
            if (!isAEligible && isBEligible) return 1;
            return 0;
        });
        setMembers(sorted);
        alert("Lista de Honra reordenada! Elegíveis foram movidos para o topo.");
    };
    
    // Lógica de importação via CSV com atualização inteligente
    const handleCsvUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).slice(1); // Ignora o cabeçalho
                
                // Usa um Map para garantir a unicidade pelo habby_id e facilitar a atualização
                const membersMap = new Map(members.map(m => [m.habby_id, m]));

                lines.forEach(line => {
                    const [name, habby_id, fase_acesso, fase_ataque] = line.split(',').map(s => s.trim());
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
        event.target.value = null; // Permite o re-upload do mesmo arquivo
    };

    const finalizeSeason = async () => {
        if (members.length === 0 || !startDate || !endDate) {
            alert("É necessário ter ao menos um membro na lista e definir as datas de início e fim.");
            return;
        }
        if (!window.confirm("Tem certeza que deseja finalizar e salvar esta temporada? Esta ação criará um novo registro histórico.")) {
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
            // Mantém a lista atual para a próxima gestão, limpando apenas as datas
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
                    {/* Coluna de Registro e Importação */}
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
                                {editingIndex !== null ? <><FaEdit /> Atualizar Membro</> : <><FaPlus /> Adicionar Membro</>}
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
                    
                    {/* Coluna da Lista de Membros */}
                    <div className="management-column">
                        <div className="members-list-header">
                            <h2>Lista de Honra Atual</h2>
                            <button className="btn btn-secondary update-list-btn" onClick={sortHonorList} disabled={members.length === 0}>
                                <FaSyncAlt /> Reordenar por Elegibilidade
                            </button>
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
                                            <tr key={p.habby_id || index} className={index < 3 ? 'current-honor-member' : ''}>
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
                    <h2>Finalizar e Salvar Temporada</h2>
                    <p>Preencha as datas e clique para salvar a lista atual como um novo registro histórico de temporada de honra.</p>
                    <div className="form-row">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary finalize-btn" onClick={finalizeSeason} disabled={!startDate || !endDate || members.length === 0}>
                        {loading ? "Salvando..." : "Salvar Temporada de Honra"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HonorRegisterPage;