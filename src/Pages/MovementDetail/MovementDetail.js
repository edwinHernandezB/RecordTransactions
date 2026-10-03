import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiCalendar, FiTag, FiTrash2 } from "react-icons/fi";
import TopBar from "../../components/Topbar";
import { CategoryIcon } from "../Movements/UtilsMovements";
import { useMovements } from "../../context/MovementsContext";
import { useCategories } from "../../context/CategoriesContext";
import { getCategoriesList } from "../../utils/Functions";
import {
  applyMovementEdit,
  createMovementEditForm,
  formatMovementDate,
  isMovementEditFormValid,
} from "./UtilsMovementDetail";

export default function MovementDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { movementId } = useParams();
  const { movements, setMovements } = useMovements();
  const { categoriesList } = useCategories();
  const movement = movements.find(
    (item) => String(item.id) === movementId,
  ) || location.state?.movement;
  const movementType = Number(movement?.importe) < 0 ? "spent" : "income";
  const availableCategories = getCategoriesList(movementType, categoriesList);
  const movementCategoryOptions = availableCategories.includes(movement?.categoria)
    ? availableCategories
    : [...availableCategories, movement?.categoria].filter(Boolean);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [form, setForm] = useState(() =>
    movement ? createMovementEditForm(movement) : null,
  );

  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/movements", { replace: true });
    }
  };

  const saveChanges = (event) => {
    event.preventDefault();
    if (!movement || !isMovementEditFormValid(form)) return;

    const updatedMovement = applyMovementEdit(movement, form);
    setMovements((current) =>
      current.map((item) =>
        String(item.id) === movementId ? updatedMovement : item,
      ),
    );
    setIsEditing(false);
  };

  const deleteMovement = () => {
    setMovements((current) =>
      current.filter((item) => String(item.id) !== movementId),
    );
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/movements", { replace: true });
    }
  };

  return (
    <div className="movement-detail-screen">
      <TopBar title="Detalle" onBack={goBack} />
      {!movement ? (
        <main className="movement-detail-empty">
          <p>No se encontró este movimiento.</p>
          <button className="movement-cancel-button" onClick={goBack}>
            Volver
          </button>
        </main>
      ) : (
        <>
          <main className="movement-detail-content">
            <section className="movement-detail-heading">
              <CategoryIcon category={movement.categoria} />
              <div>
                <h1>{movement.categoria || "Sin categoría"}</h1>
                <p>{movement.nombre || "Movimiento"}</p>
              </div>
            </section>

            {isEditing ? (
              <form className="movement-edit-form" onSubmit={saveChanges}>
                <label htmlFor="movement-edit-name">Nombre</label>
                <input
                  id="movement-edit-name"
                  className="movement-input"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                />
                <label htmlFor="movement-edit-amount">Importe (€)</label>
                <input
                  id="movement-edit-amount"
                  className="movement-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  required
                />
                <label htmlFor="movement-edit-date">Fecha</label>
                <input
                  id="movement-edit-date"
                  className="movement-input"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  required
                />
                <label htmlFor="movement-edit-category">Categoría</label>
                <select
                  id="movement-edit-category"
                  className="movement-input"
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  required
                >
                  {movementCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="movement-detail-actions">
                  <button
                    type="button"
                    className="movement-cancel-button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="movement-save-button"
                    disabled={!isMovementEditFormValid(form)}
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            ) : (
              <>
                <section className="movement-detail-card" aria-label="Datos del movimiento">
                  <div className="movement-detail-row">
                    <span>Importe</span>
                    <strong
                      className={`movement-detail-amount ${Number(movement.importe) < 0 ? "expense" : "income"}`}
                    >
                      {Number(movement.importe) > 0 ? "+" : "−"}
                      {Math.abs(Number(movement.importe) || 0).toFixed(2)}€
                    </strong>
                  </div>
                  <div className="movement-detail-row">
                    <span><FiCalendar aria-hidden="true" /> Fecha</span>
                    <span>{formatMovementDate(movement.fecha)}</span>
                  </div>
                  <div className="movement-detail-row">
                    <span><FiTag aria-hidden="true" /> Categoría</span>
                    <span>{movement.categoria || "Sin categoría"}</span>
                  </div>
                </section>

                <div className="movement-detail-actions">
                  <button
                    className="movement-edit-action"
                    onClick={() => {
                      setForm(createMovementEditForm(movement));
                      setIsEditing(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="movement-delete-action"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    <FiTrash2 aria-hidden="true" /> Eliminar
                  </button>
                </div>
              </>
            )}
          </main>

          {isDeleteConfirmOpen && (
            <div className="movement-detail-backdrop" role="presentation">
              <section
                className="movement-delete-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="movement-delete-title"
              >
                <h2 id="movement-delete-title">Eliminar movimiento</h2>
                <p>Esta acción no se puede deshacer.</p>
                <div className="movement-detail-actions">
                  <button
                    className="movement-edit-action"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="movement-delete-action"
                    onClick={deleteMovement}
                  >
                    Eliminar
                  </button>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}