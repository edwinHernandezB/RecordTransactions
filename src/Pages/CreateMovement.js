import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../context/MovementsContext";
import { useCategories } from "../context/CategoriesContext";
import TopBar from "../components/Topbar";
import { getCategoriesList } from "../utils/Functions";

const today = new Date().toISOString().split("T")[0];

export default function CreateMovement() {
  const navigate = useNavigate();
  const { movements, setMovements } = useMovements();
  const { categoriesList, setCategoriesList } = useCategories();

  const [form, setForm] = useState({
    name: "",
    category: "",
    date: today,
    movImport: "",
    type: "spent",
  });
  const [newCategory, setNewCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  const addCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) return;

    setCategoriesList((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const alreadyExists = current.some(
        (category) =>
          category.type === form.type &&
          category.category.toLowerCase() === trimmedCategory.toLowerCase()
      );

      if (alreadyExists) {
        setForm((currentForm) => ({ ...currentForm, category: trimmedCategory }));
        setNewCategory("");
        setIsCategoryModalOpen(false);
        return prev;
      }

      const nextCategories = [
        ...current,
        { category: trimmedCategory, type: form.type },
      ];

      setForm((currentForm) => ({ ...currentForm, category: trimmedCategory }));
      setNewCategory("");
      setIsCategoryModalOpen(false);
      return nextCategories;
    });
  };

  const openNewCategoryModal = () => {
    setNewCategory("");
    setIsCategoryModalOpen(true);
  };

  const availableCategories = getCategoriesList(form.type, categoriesList);

  return (
    <div className="movement-screen">
      <TopBar title="Añadir Movimiento" showBackButton={false} />
      <div className="movement-content">
        <div className="type-selector">
          <button
            className={`type-button ${
              form.type === "income" ? "active-income" : ""
            }`}
            onClick={() => setForm({ ...form, type: "income", category: "" })}
          >
            Ingreso
          </button>

          <button
            className={`type-button ${
              form.type === "spent" ? "active-expense" : ""
            }`}
            onClick={() => setForm({ ...form, type: "spent", category: "" })}
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
          onChange={(e) => {
            const selectedCategory = e.target.value;

            if (selectedCategory === "__add_new__") {
              openNewCategoryModal();
              return;
            }

            setForm({ ...form, category: selectedCategory });
          }}
        >
          <option value="">Selecciona categoría</option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value="__add_new__">Añadir nueva categoría</option>
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

      {isCategoryModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Nueva categoría</h3>
            <input
              className="movement-input"
              placeholder={
                form.type === "income"
                  ? "Nombre de la categoría de ingreso"
                  : "Nombre de la categoría de gasto"
              }
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              autoFocus
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <button
                className="movement-cancel-button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategory("");
                }}
              >
                Cancelar
              </button>

              <button className="movement-save-button" onClick={addCategory}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
