import { useNavigate } from "react-router-dom";
import { CATEGORY_ASSETS } from "../../utils/constants";
import EmptyState from "../EmptyState";
import { Spacer } from "../../components/Spacer";

export function calculateFilteredMovements(movements, startDate, endDate) {
  if (!startDate || !endDate) return movements;

  return movements.filter((movement) => {
    const movementDate = new Date(movement.fecha);
    const year = movementDate.getFullYear();
    const month = String(movementDate.getMonth() + 1).padStart(2, "0");
    const day = String(movementDate.getDate()).padStart(2, "0");
    const movementDateKey = `${year}-${month}-${day}`;

    return movementDateKey >= startDate && movementDateKey <= endDate;
  });
}

export function calculateMonthlySummary(filteredMovements) {
  let spent = 0;
  let available = 0;
  const categorySummary = {};

  filteredMovements.forEach((movement) => {
    const movementAmount = Number(movement.importe);
    if (!Number.isFinite(movementAmount)) return;

    if (movementAmount < 0) {
      const amountSpent = Math.abs(movementAmount);
      spent += amountSpent;

      const category = movement.categoria || "Sin categoría";
      categorySummary[category] =
        (categorySummary[category] || 0) + amountSpent;
    } else {
      available += movementAmount;
    }
  });

  return {
    monthSpent: spent,
    monthAvailable: available,
    categories: categorySummary,
  };
}

export function handleIntervalSubmit(
  event,
  pendingInterval,
  setDateInterval,
  setIsDateModalOpen,
) {
  event.preventDefault();

  if (
    pendingInterval.startDate &&
    pendingInterval.endDate &&
    pendingInterval.startDate > pendingInterval.endDate
  ) {
    return;
  }

  setDateInterval(pendingInterval);
  setIsDateModalOpen(false);
}

export function openDateModal(
  startDate,
  endDate,
  setPendingInterval,
  setIsDateModalOpen,
) {
  setPendingInterval({ startDate, endDate });
  setIsDateModalOpen(true);
}

export function handleIntervalReset(setPendingInterval, setDateInterval) {
  const emptyInterval = { startDate: "", endDate: "" };
  setPendingInterval(emptyInterval);
  setDateInterval(emptyInterval);
}

export function DateIntervalButton({ startDate, endDate, openDateModal }) {
  return (
    <button
      type="button"
      className="date-interval-button"
      onClick={openDateModal}
    >
      {startDate && endDate
        ? `${startDate} - ${endDate}`
        : "Seleccionar fechas"}
    </button>
  );
}

export function MonthlySummary({ monthSpent, monthAvailable }) {
  const available = Math.max(0, monthAvailable - monthSpent);

  return (
    <div className="monthly-summary">
      <div className="summary-row">
        <span className="summary-label">Disponible</span>
        <span className="summary-value positive">{available.toFixed(2)}€</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Gastado este mes</span>
        <span className="summary-value negative">
          {monthSpent ? monthSpent.toFixed(2) : "0.00"}€
        </span>
      </div>
    </div>
  );
}

export function Categories({ categories, navigate }) {
  return (
    <>
      <div className="movements-header">
        <h3>Categorías</h3>
        <button className="btn-showAll" onClick={() => navigate("/Categories")}>
          <h3>Ver todos</h3>
        </button>
      </div>
      <CategoriesList categories={categories} />
    </>
  );
}

function CategoriesList({ categories }) {
  if (Object.keys(categories).length === 0) {
    return (
      <span className="empty-state-text">
        Registra movimientos para ver el resumen por categorías
      </span>
    );
  }

  return (
    <div>
      {Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, total]) => (
          <div key={category} className="category-summary">
            <span>{category}</span>
            <span className="category-total">-{total.toFixed(2)}€</span>
          </div>
        ))}
    </div>
  );
}

export function Movements({ movements, navigate }) {
  return (
    <>
      <div className="movements-header">
        <h3>Últimos movimientos</h3>
        <button className="btn-showAll" onClick={() => navigate("/movements")}>
          <h3>Ver todos</h3>
        </button>
      </div>
      <MovementList movements={movements} />
    </>
  );
}

function MovementList({ movements }) {
  if (!movements || movements.length === 0) {
    return (
      <EmptyState
        title="No hay movimientos"
        description="Agrega tu primer movimiento para empezar a registrar tus gastos e ingresos."
        image="/assets/empty_movements.png"
      />
    );
  }

  return movements.slice(0, 3).map((movement) => (
    <div key={movement.id} className="movement-row">
      <img
        src={CATEGORY_ASSETS[movement.categoria] || "/assets/transferir.png"}
        alt={movement.categoria}
        className="movement-icon"
      />
      <div className="movement-details">
        <strong className="movement-name">{movement.nombre}</strong>
        <div className="movement-category">{movement.categoria}</div>
        <div className="movement-date">
          {new Date(movement.fecha).toLocaleDateString()} {" "}
        </div>
      </div>
      <div
        className={`movement-amount ${movement.importe < 0 ? "expense" : "income"}`}
      >
        {movement.importe > 0 ? "+" : ""}
        {movement.importe.toFixed(2)}€
      </div>
    </div>
  ));
}

export function DataRecovery({
  movements,
  setMovements,
  categoriesList,
  setCategoriesList,
}) {
  return (
    <>
      <div className="export-title">
        <span>Puedes guardar o importar datos</span>
      </div>
      <div className="data-saved-block">
        <ButtonExportData movements={movements} categoriesList={categoriesList} />
        <Spacer size={10} horizontal />
        <ButtonImportData
          setMovements={setMovements}
          setCategoriesList={setCategoriesList}
        />
      </div>
    </>
  );
}

function ButtonExportData({ movements, categoriesList }) {
  const navigate = useNavigate();

  return (
    <button
      className="btn-export-import"
      onClick={() => {
        try {
          const exportData = (Array.isArray(movements) ? movements : []).map(
            (movement) => ({
              id: movement.id,
              nombre: movement.nombre,
              categoria: movement.categoria,
              fecha: movement.fecha,
              importe: movement.importe,
              tipo: movement.importe < 0 ? "Gasto" : "Ingreso",
            }),
          );
          const exportCategories = Array.isArray(categoriesList)
            ? categoriesList.map((category) => ({
                categoria: category.category ?? category.categoria,
                tipo: category.type ?? category.tipo,
              }))
            : [];
          sessionStorage.setItem(
            "jsonToView",
            JSON.stringify(
              { movimientos: exportData, listaCategorias: exportCategories },
              null,
              2,
            ),
          );
          navigate("/json-viewer");
        } catch (error) {
          alert("No se pudo preparar la exportación del JSON");
        }
      }}
    >
      Exportar datos
    </button>
  );
}

function ButtonImportData({ setMovements, setCategoriesList }) {
  return (
    <>
      <label htmlFor="import-json-input" className="btn-export-import">
        Importar datos
      </label>
      <input
        id="import-json-input"
        type="file"
        accept="application/json"
        className="btn-export-input"
        onChange={(event) => {
          const file = event.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            try {
              const data = JSON.parse(loadEvent.target.result);
              if (data.movimientos && Array.isArray(data.movimientos)) {
                const importedCategories = Array.isArray(data.listaCategorias)
                  ? data.listaCategorias
                  : Array.isArray(data.categoria)
                    ? data.categoria
                    : [];
                setMovements(data.movimientos);
                setCategoriesList((previous) => {
                  const current = Array.isArray(previous) ? previous : [];
                  const merged = [...current, ...importedCategories];
                  return merged.filter(
                    (item, index, array) =>
                      index ===
                      array.findIndex(
                        (candidate) =>
                          JSON.stringify(candidate) === JSON.stringify(item),
                      ),
                  );
                });
                alert("Datos importados correctamente");
              } else {
                alert("Formato de archivo no válido");
              }
            } catch (error) {
              alert("Error al leer el archivo JSON");
            }
          };
          reader.readAsText(file);
        }}
      />
    </>
  );
}

export function DateIntervalModal({
  isDateModalOpen,
  handleIntervalSubmit,
  pendingInterval,
  setPendingInterval,
  setIsDateModalOpen,
  handleIntervalReset,
}) {
  if (!isDateModalOpen) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <form
        className="modal-container date-interval"
        onSubmit={handleIntervalSubmit}
      >
        <h2>Consultar movimientos</h2>
        <label>
          Fecha inicio
          <input
            type="date"
            value={pendingInterval.startDate}
            onChange={(event) =>
              setPendingInterval({
                ...pendingInterval,
                startDate: event.target.value,
              })
            }
          />
        </label>
        <label>
          Fecha final
          <input
            type="date"
            value={pendingInterval.endDate}
            onChange={(event) =>
              setPendingInterval({
                ...pendingInterval,
                endDate: event.target.value,
              })
            }
          />
        </label>
        {pendingInterval.startDate &&
          pendingInterval.endDate &&
          pendingInterval.startDate > pendingInterval.endDate && (
            <span className="date-interval-error">
              La fecha inicio debe ser anterior a la fecha final.
            </span>
          )}
        <div className="date-interval-actions">
          <button
            type="button"
            className="date-interval-cancel"
            onClick={() => setIsDateModalOpen(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="date-interval-cancel"
            onClick={() => {
              setIsDateModalOpen(false);
              handleIntervalReset();
            }}
          >
            Restablecer
          </button>
          <button type="submit" className="date-interval-submit">
            Consultar
          </button>
        </div>
      </form>
    </div>
  );
}
