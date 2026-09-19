import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORY_ASSETS } from "../utils/constants";
import TopBar from "../components/Topbar";
import EmptyState from "./EmptyState";
import { useMovements } from "../context/MovementsContext";
import FloatingButton from "../components/FloatingButton";
import { Spacer } from "../components/Spacer";
import { useCategories } from "../context/CategoriesContext";
import { useDateInterval } from "../context/DateIntervalContext";

export default function Home() {
  const navigate = useNavigate();
  const { movements, setMovements } = useMovements();
  const { categoriesList, setCategoriesList} = useCategories();
  const { startDate, endDate, setDateInterval } = useDateInterval();
  const [pendingInterval, setPendingInterval] = useState({
    startDate,
    endDate,
  });
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const filteredMovements = useMemo(() => {
    if (!startDate || !endDate) return movements;

    return movements.filter((movement) => {
      const movementDate = new Date(movement.fecha);
      const year = movementDate.getFullYear();
      const month = String(movementDate.getMonth() + 1).padStart(2, "0");
      const day = String(movementDate.getDate()).padStart(2, "0");
      const movementDateKey = `${year}-${month}-${day}`;

      return movementDateKey >= startDate && movementDateKey <= endDate;
    });
  }, [movements, startDate, endDate]);

  const { monthSpent, monthAvailable, categories } = useMemo(() => {
    let spent = 0;
    let available = 0;
    const categorySummary = {};

    filteredMovements.forEach((mov) => {
      const movImport = Number(mov.importe);
      if (!Number.isFinite(movImport)) return;

      if (movImport < 0) {
        const ammountSpent = Math.abs(movImport);
        spent += ammountSpent;

        const category = mov.categoria || "Sin categoría";
        categorySummary[category] =
          (categorySummary[category] || 0) + ammountSpent;
      } else {
        available += movImport;
      }
    });

    return {
      monthSpent: spent,
      monthAvailable: available,
      categories: categorySummary,
    };
  }, [filteredMovements, startDate, endDate]);

  const handleIntervalSubmit = (event) => {
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
  };

  const openDateModal = () => {
    setPendingInterval({ startDate, endDate });
    setIsDateModalOpen(true);
  };

  const handleIntervalReset = () => {
    const emptyInterval = { startDate: "", endDate: "" };
    setPendingInterval(emptyInterval);
    setDateInterval(emptyInterval);
  };

  return (
    <>
      <TopBar title="Mis finanzas" showBackButton={false} />
      <div className="home-container">
        <button
          type="button"
          className="date-interval-button"
          onClick={openDateModal}
        >
          {startDate && endDate
            ? `${startDate} - ${endDate}`
            : "Seleccionar fechas"}
        </button>

        {isDateModalOpen && (
          <div className="modal" role="dialog" aria-modal="true">
            <form className="modal-container date-interval" onSubmit={handleIntervalSubmit}>
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
        )}

        <MonthlySummary
          monthSpent={monthSpent}
          monthAvailable={monthAvailable}
        />

        <Categories categories={categories} navigate={navigate} />

        <Movements movements={filteredMovements} navigate={navigate} />

        <DataRecovery
          movements={movements}
          setMovements={setMovements}
          categoriesList={categoriesList}
          setCategoriesList={setCategoriesList}
        />

        <FloatingButton onClick={() => navigate("/movements/create")} />
      </div>
    </>
  );
}

// Gastado este mes
function MonthlySummary({ monthSpent, monthAvailable }) {
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

// Resumen por categorías
function Categories({ categories, navigate }) {
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

// Categories list summary
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
        .map(([cat, total]) => (
          <div key={cat} className="category-summary">
            <span>{cat}</span>
            <span className="category-total">-{total.toFixed(2)}€</span>
          </div>
        ))}
    </div>
  );
}

// Últimos movimientos
function Movements({ movements, navigate }) {
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

// Lista de movimientos
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

  return movements.slice(0, 3).map((m) => (
    <div key={m.id} className="movement-row">
      <img
        src={CATEGORY_ASSETS[m.categoria] || "/assets/transferir.png"}
        alt={m.categoria}
        className="movement-icon"
      />

      <div className="movement-details">
        <strong className="movement-name">{m.nombre}</strong>
        <div className="movement-category">{m.categoria}</div>
        <div className="movement-date">
          {new Date(m.fecha).toLocaleDateString()}{" "}
        </div>
      </div>

      <div
        className={`movement-amount ${m.importe < 0 ? "expense" : "income"}`}
      >
        {m.importe > 0 ? "+" : ""}
        {m.importe.toFixed(2)}€
      </div>
    </div>
  ));
}

// Importar datos
function DataRecovery({
  movements,
  setMovements,
  categoriesList,
  setCategoriesList,
}) {
  return (
    <>
    <div className="export-title">
      <span >Puedes guardar o importar datos</span>
      </div>
      <div className="data-saved-block">
        <ButtonExportData movements={movements} categoriesList={categoriesList} />
        <Spacer size={10} horizontal />
        <ButtonImportData setMovements={setMovements} setCategoriesList={setCategoriesList} />
      </div>
    </>
  );
}

// Exportar datos
function ButtonExportData({ movements, categoriesList }) {
  const navigate = useNavigate();

  return (
    <button
      className="btn-export-import"
      onClick={() => {
        try {
          const exportData = (Array.isArray(movements) ? movements : []).map((m) => ({
            id: m.id,
            nombre: m.nombre,
            categoria: m.categoria,
            fecha: m.fecha,
            importe: m.importe,
            tipo: m.importe < 0 ? "Gasto" : "Ingreso",
          }));

          const exportCategories = Array.isArray(categoriesList)
            ? categoriesList.map((m) => ({
                categoria: m.category ?? m.categoria,
                tipo: m.type ?? m.tipo,
              }))
            : [];

          const jsonData = {
            movimientos: exportData,
            listaCategorias: exportCategories,
          };

          const jsonText = JSON.stringify(jsonData, null, 2);
          sessionStorage.setItem("jsonToView", jsonText);
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

// Importar datos
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
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);

              if (data.movimientos && Array.isArray(data.movimientos)) {
                const importedCategories = Array.isArray(data.listaCategorias)
                  ? data.listaCategorias
                  : Array.isArray(data.categoria)
                    ? data.categoria
                    : [];

                setMovements(data.movimientos);
                setCategoriesList((prev) => {
                  const current = Array.isArray(prev) ? prev : [];
                  const merged = [...current, ...importedCategories];

                  const uniqueCategories = merged.filter(
                    (item, index, array) =>
                      index ===
                      array.findIndex(
                        (candidate) =>
                          JSON.stringify(candidate) === JSON.stringify(item)
                      )
                  );

                  return uniqueCategories;
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
