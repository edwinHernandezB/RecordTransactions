import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORY_ASSETS } from "../utils/constants";
import TopBar from "../components/Topbar";
import EmptyState from "./EmptyState";
import { useMovements } from "../context/MovementsContext";
import FloatingButton from "../components/FloatingButton";

export default function Home() {
  const navigate = useNavigate();
  const { movements, setMovements } = useMovements();

  const { monthSpent, monthAvailable, categories } = useMemo(() => {
    const ahora = new Date();
    const currentMonth = ahora.getMonth();
    const currentYear = ahora.getFullYear();

    let spent = 0;
    let available = 0;
    const categorySummary = {};

    movements.forEach((mov) => {
      const date = new Date(mov.fecha);
      const isCurrentMonth =
        date.getMonth() === currentMonth && date.getFullYear() === currentYear;

      if (!isCurrentMonth) return;

      const movImport = mov.importe;

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
  }, [movements]);

  return (
    <>
      <TopBar title="Balance mensual" showBackButton={false} />
      <div className="home-container">
        <MonthlySummary
          monthSpent={monthSpent}
          monthAvailable={monthAvailable}
        />

        <Categories categories={categories} navigate={navigate} />

        <Movements movements={movements} navigate={navigate} />
        
        <div className="data-saved">
        <ButtonExportData movements={movements} categories={categories} />
        <ButtonImportData setMovements={setMovements} />
</div>
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
        <button className="btn-showAll" onClick={() => navigate("/movements")}>
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

function ButtonExportData({
  movements,
  incomeCategories,
  spentCategories,
  categories,
}) {
  return (
    <button
      className="btn-export"
      onClick={() => {
        const exportData = movements.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          categoria: m.categoria,
          fecha: m.fecha,
          importe: m.importe,
          tipo: m.importe < 0 ? "Gasto" : "Ingreso",
        }));

        // const spentCategoriesList =  Object.keys(spentCategories);
        //const incomeCategoriesList = Object.keys(incomeCategories);
        const spentCategoriesList = Object.keys(categories);
        const incomeCategoriesList = Object.keys(categories);

        const jsonData = JSON.stringify(
          {
            movimientos: exportData,
            gastosCategorias: spentCategoriesList,
            ingresosCategorias: incomeCategoriesList,
          },
          null,
          2,
        );

        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "datos_movimientos.json";
        link.click();
        URL.revokeObjectURL(url);
      }}
    >
      Exportar datos
    </button>
  );
}

function ButtonImportData({ setMovements }) {
  return (
    <>
      <button
        className="btn-import"
        onClick={() => document.getElementById("import-json-input").click()}
      >
        Importar datos
      </button>

      <input
        id="import-json-input"
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);

              if (data.movimientos && Array.isArray(data.movimientos)) {
                // 🔥 Aquí es donde REALMENTE se guardan
                setMovements(data.movimientos);

                // Si quieres guardar categorías también:
                // setCategories(data.categorias);

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
