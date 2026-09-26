import { useNavigate } from "react-router-dom";
import { useMovements } from "../../context/MovementsContext";
import { useCategories } from "../../context/CategoriesContext";
import { useDateInterval } from "../../context/DateIntervalContext";
import TopBar from "../../components/Topbar";
import { getCategoriesSummary, CategoryList } from "./UtilsCategories";
import { normalizeCategories } from "../../utils/Functions";

export default function Categories() {
  const navigate = useNavigate();
  const { movements, totalSpent } = useMovements();
  const { categoriesList } = useCategories();
  const { startDate, endDate } = useDateInterval();
  const totalLimit = normalizeCategories(categoriesList).reduce(
    (total, category) =>
      category.type === "spent"
        ? total + Math.max(Number(category.limit) || 0, 0)
        : total,
    0,
  );

  const categories = getCategoriesSummary(
    movements,
    categoriesList,
    startDate,
    endDate,
  );

  return (
    <>
      <TopBar title="Categorías" onBack={() => navigate("/")} />
      {/* <SummaryHeader limit={totalLimit} spent={totalSpent} /> */}
      <CategoryList categories={categories} navigate={navigate} />
    </>
  );
}

function SummaryHeader({ limit, spent }) {
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - spent, 0);
  return (
    <div className="categories-summary-container">
      <div className="monthly-summary">
        <div className="summary-row">
          <span className="summary-label">
            Presupuesto: <span>{limit.toFixed(2)}€</span>
          </span>
          <span className="summary-label">
            Gastado: <span>{spent.toFixed(2)}€</span>
          </span>
          <span className="summary-label">
            Restante: <span>{remaining.toFixed(2)}€</span>
          </span>
        </div>
        <div className="summary-row">
          <div className="budget-bar">
            <div className="budget-fill" style={{ width: `${percent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
