import React, { useState } from "react";
import "../../styles/components/RankingForm.css";



const RankingForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    fase: "",
    r1: "",
    r2: "",
    r3: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["fase", "r1", "r2", "r3"].includes(name)) {
      if (value === "" || /^[0-9]*$/.test(value)) {
        setForm((f) => ({ ...f, [name]: value }));
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, fase, r1, r2, r3 } = form;

    if (!name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    if ([fase, r1, r2, r3].some((v) => v === "")) {
      alert("Preencha todos os campos numéricos");
      return;
    }

    const participant = {
      name: name.trim(),
      fase: parseInt(fase),
      r1: parseInt(r1),
      r2: parseInt(r2),
      r3: parseInt(r3),
      total: parseInt(r1) + parseInt(r2) + parseInt(r3),
    };

    onAdd(participant);
    setForm({ name: "", fase: "", r1: "", r2: "", r3: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="ranking-form">
      <input
        type="text"
        name="name"
        placeholder="Nome"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="fase"
        placeholder="Fase de Acesso"
        value={form.fase}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="r1"
        placeholder="1° Rodada"
        value={form.r1}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="r2"
        placeholder="2° Rodada"
        value={form.r2}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="r3"
        placeholder="3° Rodada"
        value={form.r3}
        onChange={handleChange}
        required
      />
      <button type="submit">Adicionar Participante</button>
    </form>
  );
};

export default RankingForm;
