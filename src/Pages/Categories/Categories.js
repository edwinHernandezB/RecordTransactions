import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../../context/MovementsContext";
import { useCategories } from "../../context/CategoriesContext";
import { useDateInterval } from "../../context/DateIntervalContext";
import TopBar from "../../components/Topbar";
import ExpenseDonutChart from "../../components/ExpenseDonutChart";
import { SavingsGoals } from "../../components/SavingsSummary";
import { useSavings } from "../../context/SavingsContext";
import {
  AddCategoryBudget,
  getCategoriesSummary,
  CategoryList,
} from "./UtilsCategories";

export default function Categories() {
  const [activeType, setActiveType] = useState("spent");
  const navigate = useNavigate();
  const { movements } = useMovements();
  const { savingsAccounts, updateSavingsAccount } = useSavings();
  const { categoriesList, updateCategoryLimit } = useCategories();
  const { startDate, endDate } = useDateInterval();

  const categories = getCategoriesSummary(
    movements,
    categoriesList,
    startDate,
    endDate,
    activeType,
  );
  const amountLabel = activeType === "income" ? "Ingresado" : "Gastado";

  return (
    <>
      <TopBar title="Categorías" onBack={() => navigate("/")} />
      <div className="categories-tabs" role="tablist" aria-label="Tipo de categoría">
        <button
          id="spent-categories-tab"
          type="button"
          role="tab"
          aria-selected={activeType === "spent"}
          aria-controls="category-panel"
          className={activeType === "spent" ? "categories-tab active" : "categories-tab"}
          onClick={() => setActiveType("spent")}
        >
          Gastos
        </button>
        <button
          id="income-categories-tab"
          type="button"
          role="tab"
          aria-selected={activeType === "income"}
          aria-controls="category-panel"
          className={activeType === "income" ? "categories-tab active" : "categories-tab"}
          onClick={() => setActiveType("income")}
        >
          Ingresos
        </button>
      </div>
      <div
        id="category-panel"
        role="tabpanel"
        aria-labelledby={activeType === "income" ? "income-categories-tab" : "spent-categories-tab"}
      >
        <ExpenseDonutChart
          categories={categories}
          type={activeType}
          amountLabel={amountLabel}
        />
        <CategoryList
          categories={categories}
          navigate={navigate}
          categoryType={activeType}
          amountLabel={amountLabel}
        />
        {activeType === "income" && (
          <SavingsGoals
            accounts={savingsAccounts}
            onUpdateAccount={updateSavingsAccount}
          />
        )}
      </div>
      <AddCategoryBudget
        categoriesList={categoriesList}
        onSave={updateCategoryLimit}
        categoryType={activeType}
      />
    </>
  );
}
