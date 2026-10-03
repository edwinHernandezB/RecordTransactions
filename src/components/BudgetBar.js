import { useState } from "react";
import { FiChevronRight, FiEdit2 } from "react-icons/fi";
import { useCategories } from "../context/CategoriesContext";

export default function BudgetBar({
  limit,
  spent,
  title,
  categoryType = "spent",
  amountLabel = categoryType === "income" ? "Ingresado" : "Gastado",
}) {
  const { updateCategoryLimit } = useCategories();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingLimit, setPendingLimit] = useState(limit ? String(limit) : "");
  const hasLimit = Number(limit) > 0;
  const percent = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
  const fillColorClass =
    percent > 80
      ? "budget-fill--danger"
      : percent > 50
        ? "budget-fill--warning"
        : "";
  const remaining = Math.max(Number(limit) - spent, 0);
  const limitLabel = categoryType === "income" ? "Objetivo" : "Presupuesto";
  const remainingLabel = categoryType === "income" ? "Pendiente" : "Restante";

  const openEditor = (event) => {
    event.stopPropagation();
    setPendingLimit(hasLimit ? String(limit) : "");
    setIsEditorOpen(true);
  };

  const saveLimit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (pendingLimit === "" || !Number.isFinite(Number(pendingLimit))) return;

    updateCategoryLimit(title, pendingLimit, categoryType);
    setIsEditorOpen(false);
  };

  return (
    <>
      <div className="budget-summary">
        <div className="budget-content">
          <div className="budget-row">
            <h3>{title}</h3>
            <div className="budget-unset">
              {hasLimit ? (
                <button
                  type="button"
                  className="budget-edit-button"
                  aria-label={`${hasLimit ? "Editar" : "Establecer"} presupuesto de ${title}`}
                  onClick={openEditor}
                >
                  <FiEdit2 aria-hidden="true" />
                  {hasLimit ? "Editar límite" : "Establecer límite"}
                </button>
              ) : (
                <span>Sin límite establecido</span>
              )}
            </div>
          </div>
          {hasLimit ? (
            <>
              <div className="budget-stats">
                <div className="budget-stat">
                  <span>{limitLabel}</span>
                  <strong>{Number(limit).toFixed(2)}€</strong>
                </div>
                <div className="budget-stat">
                  <span>{amountLabel}</span>
                  <strong>{Number(spent).toFixed(2)}€</strong>
                </div>
                <div className="budget-stat">
                  <span>{remainingLabel}</span>
                  <strong>{Number(remaining).toFixed(2)}€</strong>
                </div>
              </div>
              <div className="budget-bar">
                <div
                  className={`budget-fill ${fillColorClass}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </>
          ) : (
            <div className="budget-unset">
              <strong>{amountLabel}: {Number(spent).toFixed(2)}€</strong>
              <button
                type="button"
                className="budget-edit-button"
                aria-label={`${hasLimit ? "Editar" : "Establecer"} presupuesto de ${title}`}
                onClick={openEditor}
              >
                <FiEdit2 aria-hidden="true" />
                {hasLimit ? "Editar límite" : "Establecer límite"}
              </button>
            </div>
          )}
        </div>
        <FiChevronRight className="budget-chevron" aria-hidden="true" />
      </div>

      {isEditorOpen && (
        <div
          className="budget-modal-backdrop"
          role="presentation"
          onClick={(event) => event.stopPropagation()}
        >
          <form
            className="budget-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-modal-title"
            onSubmit={saveLimit}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="budget-modal-title">
              {categoryType === "income" ? "Objetivo" : "Presupuesto"} de {title}
            </h2>
            <label htmlFor="category-budget-limit">
              {categoryType === "income" ? "Objetivo mensual (€)" : "Límite mensual (€)"}
            </label>
            <input
              id="category-budget-limit"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={pendingLimit}
              onChange={(event) => setPendingLimit(event.target.value)}
              required
              autoFocus
            />
            <div className="budget-modal-actions">
              {hasLimit && (
                <button
                  type="button"
                  className="budget-remove-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    updateCategoryLimit(title, 0, categoryType);
                    setIsEditorOpen(false);
                  }}
                >
                  Quitar límite
                </button>
              )}
              <button
                type="button"
                className="movement-cancel-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditorOpen(false);
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="movement-save-button">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
