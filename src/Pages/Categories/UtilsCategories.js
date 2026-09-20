import { SPENT_CATEGORIES } from "../../utils/constants";
import { normalizeCategories } from "../../utils/Functions";
import { FiChevronRight } from "react-icons/fi";

export function getCategoriesSummary(movements, categoriesList, startDate, endDate) {
	const totals = {};
	const persistedCategories = normalizeCategories(categoriesList)
		.filter((category) => category.type === "spent")
		.map((category) => category.category);
	const allCategories = [...new Set([...SPENT_CATEGORIES, ...persistedCategories])];

	const filteredMovements = movements.filter((movement) => {
		if (!movement || !movement.fecha) return false;

		if (startDate && endDate) {
			const date = new Date(movement.fecha);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			const dateKey = `${year}-${month}-${day}`;

			return dateKey >= startDate && dateKey <= endDate;
		}

		return true;
	});

	filteredMovements.forEach((movement) => {
		const amount = Number(movement.importe);
		if (!Number.isFinite(amount) || amount >= 0) return;

		const category = movement.categoria || "Sin categoría";
		totals[category] = (totals[category] || 0) + Math.abs(amount);
	});

	return allCategories
		.map((category) => [category, Number(totals[category] || 0)])
		.filter(([, total]) => total > 0)
		.sort(([, totalA], [, totalB]) => totalB - totalA);
}

export function CategoryList({ categories, navigate }) {
  return (
    <div className="home-container">
      <Title />
      <CategoryItem categories={categories} navigate={navigate} />
    </div>
  );
}

export function CategoryItem({ categories, navigate }) {
  if (!categories || categories.length === 0) {
    return (
      <span className="empty-state-text">
        Registra gastos para ver el resumen por categorías
      </span>
    );
  }

  return categories.map(([category, total]) => (
    <div
      key={category}
      className="category-summary-total"
      onClick={() => navigate(`/categories/${category}`)}
    >
      <span>{category}</span>
      <span className="category-total">-{total.toFixed(2)}€</span>
      <FiChevronRight />
    </div>
  ));
}

export function Title() {
  return (
    <div className="categories-header">
      <h3>Gastos por categoría</h3>
    </div>
  );
}