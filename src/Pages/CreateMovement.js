import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../context/MovementsContext";
import TopBar from "../components/Topbar";
import { getCategoriesList } from "../utils/Functions";

const today = new Date().toISOString().split("T")[0];

export default function CreateMovement() {
  const navigate = useNavigate();
  const { movements, setMovements } = useMovements();

  const [form, setForm] = useState({
    name: "",
    category: "",
    date: today,
    movImport: "",
    type: "spent", // por defecto gasto
  });

  const handleAdd = () => {
    const formImport = Number(form.movImport);
    const finalImport =
      form.type === "spent" ? -Math.abs(formImport) : Math.abs(formImport);

    const newMovement = {
      id: movements.length + 1,
      nombre: form.name,
      categoria: form.category,
      fecha: form.date,
      importe: finalImport,
      tipo: form.type,
    };

    setMovements([newMovement, ...movements]);
    navigate(-1);
  };

  return (
    <div className="movement-screen">
       <TopBar
        title="Añadir Movimiento"
        showBackButton={false}
      />
      <div className="movement-content">

        {/* Botones ingreso / gasto */}
        <div className="type-selector">
          <button
            className={`type-button ${
              form.type === "income" ? "active-income" : ""
            }`}
            onClick={() => setForm({ ...form, type: "income" })}
          >
            Ingreso
          </button>

          <button
            className={`type-button ${
              form.type === "spent" ? "active-expense" : ""
            }`}
            onClick={() => setForm({ ...form, type: "spent" })}
          >
            Gasto
          </button>
        </div>

        <input
          className="movement-input"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="movement-input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Selecciona categoría</option>
          {getCategoriesList(form.type).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          className="movement-input"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <input
          className="movement-input"
          type="number"
          placeholder="Importe"
          value={form.movImport}
          onChange={(e) => setForm({ ...form, movImport: e.target.value })}
        />
      </div>

      <div className="movement-footer">
        <button className="movement-save-button" onClick={handleAdd}>
          Guardar
        </button>
        <button className="movement-cancel-button" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
