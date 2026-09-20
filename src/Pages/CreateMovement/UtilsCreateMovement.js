import { getCategoriesList } from "../../utils/Functions";

export const today = new Date().toISOString().split("T")[0];

export function isMovementFormValid(form) {
  return (
    form.name.trim() !== "" &&
    form.category.trim() !== "" &&
    form.date !== "" &&
    form.movImport.trim() !== "" &&
    Number.isFinite(Number(form.movImport))
  );
}

export function getMissingMovementFields(form) {
  return [
    !form.name.trim() && "nombre",
    !form.category.trim() && "categoría",
    !form.date && "fecha",
    (!form.movImport.trim() || !Number.isFinite(Number(form.movImport))) &&
      "importe",
  ].filter(Boolean);
}

export function createMovement(form, movements) {
  const formImport = Number(form.movImport);
  const finalImport =
    form.type === "spent" ? -Math.abs(formImport) : Math.abs(formImport);

  return {
    id: movements.length + 1,
    nombre: form.name,
    categoria: form.category,
    fecha: form.date,
    importe: finalImport,
    tipo: form.type,
  };
}

export function addCategory(categoriesList, categoryName, type) {
  const trimmedCategory = categoryName.trim();
  if (!trimmedCategory) return null;

  const current = Array.isArray(categoriesList) ? categoriesList : [];
  const alreadyExists = current.some(
    (category) =>
      category.type === type &&
      category.category.toLowerCase() === trimmedCategory.toLowerCase(),
  );

  return {
    category: trimmedCategory,
    categories: alreadyExists
      ? current
      : [...current, { category: trimmedCategory, type }],
  };
}

export function getAvailableCategories(type, categoriesList) {
  return getCategoriesList(type, categoriesList);
}

export function MovementForm({
  form,
  setForm,
  availableCategories,
  openNewCategoryModal,
}) {
  return (
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
        required
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
      />

      <select
        className="movement-input"
        required
        value={form.category}
        onChange={(event) => {
          const selectedCategory = event.target.value;

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
        required
        value={form.date}
        onChange={(event) => setForm({ ...form, date: event.target.value })}
      />

      <input
        className="movement-input"
        type="number"
        placeholder="Importe"
        required
        value={form.movImport}
        onChange={(event) =>
          setForm({ ...form, movImport: event.target.value })
        }
      />
    </div>
  );
}

export function FooterButtons({
  isFormValid,
  missingFields,
  handleAdd,
  navigate,
}) {
  return (
    <div className="movement-footer">
      {!isFormValid && (
        <p className="movement-validation-message" role="alert">
          Rellena los campos: {missingFields.join(", ")}.
        </p>
      )}
      <button
        className="movement-save-button"
        onClick={handleAdd}
        disabled={!isFormValid}
      >
        Guardar
      </button>
      <button className="movement-cancel-button" onClick={() => navigate(-1)}>
        Cancelar
      </button>
    </div>
  );
}

export function CategoryModalOpen({
  isCategoryModalOpen,
  form,
  newCategory,
  setNewCategory,
  setIsCategoryModalOpen,
  handleAddCategory,
}) {
  if (!isCategoryModalOpen) return null;

  return (
    <div className="category-modal" role="dialog" aria-modal="true">
      <div className="category-modal-content">
        <h3 className="category-modal-title">Nueva categoría</h3>
        <input
          className="movement-input"
          placeholder={
            form.type === "income"
              ? "Nombre de la categoría de ingreso"
              : "Nombre de la categoría de gasto"
          }
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          autoFocus
        />

        <div className="category-modal-actions">
          <button
            className="movement-cancel-button"
            onClick={() => {
              setIsCategoryModalOpen(false);
              setNewCategory("");
            }}
          >
            Cancelar
          </button>
          <button className="movement-save-button" onClick={handleAddCategory}>
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
