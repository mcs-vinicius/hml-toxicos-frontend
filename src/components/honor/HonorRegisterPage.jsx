import React, { useState } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaUpload, FaEdit, FaSyncAlt } from "react-icons/fa";
import "../../styles/components/HonorRegisterPage.css";

const HonorRegisterPage = () => {
    const [members, setMembers] = useState([]);
    const [currentMember, setCurrentMember] = useState({ name: "", habby_id: "", fase_acesso: "Não", fase_ataque: "Não" });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentMember({ ...currentMember, [name]: value });
    };

    const handleRadioChange = (field) => {
        setCurrentMember({ ...currentMember, [field]: currentMember[field] === "Sim" ? "Não" : "Sim" });
    };

    const handleAddOrUpdateMember = () => {
        if (!currentMember.name || !currentMember.habby_id) {
            alert("Nome e Habby ID são obrigatórios.");
            return;
        }

        const newMember = { ...currentMember };

        if (editingIndex !== null) {
            const updatedMembers = [...members];
            updatedMembers[editingIndex] = newMember;
            setMembers(updatedMembers);
            setEditingIndex(null);
        } else {
            setMembers([...members, newMember]);
        }
        setCurrentMember({ name: "", habby_id: "", fase_acesso: "Não", fase_ataque: "Não" });
    };

    const removeMember = (index) => {
        if (window.confirm("Tem certeza que deseja remover este membro?")) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const handleEditMember = (index) => {
        setEditingIndex(index);
        setCurrentMember(members[index]);
    };
    
    const sortHonorList = () => {
        const previousHonorMembers = members.slice(0, 3);
        const remainingMembers = members.slice(3);

        const eligible = remainingMembers.filter(m => m.fase_acesso.toLowerCase() === 'sim' && m.fase_ataque.toLowerCase() === 'sim');
        const ineligible = remainingMembers.filter(m => m.fase_acesso.toLowerCase() !== 'sim' || m.fase_ataque.toLowerCase() !== 'sim');
        
        // A ordem é: elegíveis, depois os ex-membros de honra, depois os não elegíveis.
        const sortedList = [...eligible, ...previousHonorMembers, ...ineligible];
        setMembers(sortedList);
        alert("Lista de Honra atualizada e reordenada!");
    };

    const finalizeSeason = async () => {
        if (members.length === 0 || !startDate || !endDate) {
            alert("Adicione membros e defina as datas de início e fim.");
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
            setMembers([]);
            setStartDate("");
            setEndDate("");
        } catch (error) {
            alert(`Erro: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCsvUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).slice(1);
                const newMembers = lines.map(line => {
                    const [name, habby_id, fase_acesso, fase_ataque] = line.split(',').map(s => s.trim());
                    if (name && habby_id) {
                        return {
                            name, habby_id,
                            fase_acesso: fase_acesso || "Não",
                            fase_ataque: fase_ataque || "Não",
                        };
                    }
                    return null;
                }).filter(m => m);
                setMembers(prev => [...prev, ...newMembers]);
                alert(`${newMembers.length} membros adicionados do CSV!`);
            };
            reader.readAsText(file);
        }
        event.target.value = null;
    };

    return (
        <div className="honor-register-wrapper">
            <div className="honor-register-container">
                <h1>Gerenciar Lista de Honra</h1>

                <div className="csv-upload-section">
                    <h2>Importar por CSV</h2>
                    <p>Anexe um .csv com as colunas: <b>name, habby_id, fase_acesso, fase_ataque</b></p>
                    <label htmlFor="csv-upload" className="btn btn-primary">
                        <FaUpload /> Anexar CSV
                    </label>
                    <input id="csv-upload" type="file" accept=".csv" onChange={handleCsvUpload} />
                </div>
                <hr />

                <h2>{editingIndex !== null ? "Editando Membro" : "Registro Manual"}</h2>
                <div className="member-form">
                    <div className="form-row">
                        <input name="name" value={currentMember.name} onChange={handleInputChange} placeholder="Nome do Membro" />
                        <input name="habby_id" value={currentMember.habby_id} onChange={handleInputChange} placeholder="Habby ID" />
                    </div>
                    <div className="form-row radio-group">
                        <label>Ataque na Fase de Acesso?</label>
                        <div>
                            <input type="radio" id="acessoSim" name="fase_acesso" checked={currentMember.fase_acesso === 'Sim'} onChange={() => handleRadioChange('fase_acesso')} />
                            <label htmlFor="acessoSim">Sim</label>
                            <input type="radio" id="acessoNao" name="fase_acesso" checked={currentMember.fase_acesso === 'Não'} onChange={() => handleRadioChange('fase_acesso')} />
                            <label htmlFor="acessoNao">Não</label>
                        </div>
                    </div>
                     <div className="form-row radio-group">
                        <label>Ataque na Fase de Ataque?</label>
                        <div>
                            <input type="radio" id="ataqueSim" name="fase_ataque" checked={currentMember.fase_ataque === 'Sim'} onChange={() => handleRadioChange('fase_ataque')} />
                            <label htmlFor="ataqueSim">Sim</label>
                            <input type="radio" id="ataqueNao" name="fase_ataque" checked={currentMember.fase_ataque === 'Não'} onChange={() => handleRadioChange('fase_ataque')} />
                            <label htmlFor="ataqueNao">Não</label>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddOrUpdateMember}>
                        {editingIndex !== null ? <><FaEdit /> Atualizar</> : <><FaPlus /> Adicionar</>}
                    </button>
                </div>

                <div className="members-list">
                    <h2>Lista para a Temporada de Honra</h2>
                    <button className="btn btn-secondary update-list-btn" onClick={sortHonorList} disabled={members.length <= 3}>
                        <FaSyncAlt /> Atualizar Lista de Honra
                    </button>
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
                                    <tr key={index} className={index < 3 ? 'current-honor-member' : ''}>
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
                    ) : <p>Nenhum membro adicionado.</p>}
                </div>

                <div className="finalize-section">
                    <h2>Finalizar Temporada</h2>
                    <div className="form-row">
                        <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={finalizeSeason} disabled={!startDate || !endDate || members.length === 0}>
                        {loading ? "Finalizando..." : "Finalizar e Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HonorRegisterPage;