import { useState } from "react";
import BudgetBar from "../../components/BudgetBar";
import { SPENT_CATEGORIES } from "../../utils/constants";
import { getCategoriesList, normalizeCategories } from "../../utils/Functions";
import { FiPlus, FiX } from "react-icons/fi";

export function getCategoriesSummary(movements, categoriesList, startDate, endDate) {
	const totals = {};
	const persistedCategories = normalizeCategories(categoriesList)
		.filter((category) => category.type === "spent");
	const categoryLimits = new Map(
		persistedCategories.map(({ category, limit }) => [category, limit]),
	);
	const persistedCategoryNames = persistedCategories.map(
		(category) => category.category,
	);
	const allCategories = [...new Set([...SPENT_CATEGORIES, ...persistedCategoryNames])];

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
		.map((category) => [
			category,
			Number(totals[category] || 0),
			categoryLimits.get(category),
		])
		.filter(([, total, limit]) => total > 0 || Number(limit) > 0)
		.sort(([, totalA], [, totalB]) => totalB - totalA);
}

export function CategoryList({ categories, navigate }) {
  return (
    <div className="category-list-container">
      <Title />
      <CategoryItem categories={categories} navigate={navigate} />
    </div>
  );
}

export function AddCategoryBudget({ categoriesList, onSave }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [limit, setLimit] = useState("");
	const budgetedCategories = new Set(
		normalizeCategories(categoriesList)
			.filter((category) => category.type === "spent" && Number(category.limit) > 0)
			.map((category) => category.category),
	);
	const availableCategories = getCategoriesList("spent", categoriesList).filter(
		(category) => !budgetedCategories.has(category),
	);

	const saveBudget = (event) => {
		event.preventDefault();
		if (!selectedCategory || Number(limit) <= 0) return;

		onSave(selectedCategory, limit);
		setIsModalOpen(false);
		setSelectedCategory("");
		setLimit("");
	};

	return (
		<>
			<div className="categories-budget-action">
				<button
					type="button"
					className="categories-add-budget-button"
					onClick={() => setIsModalOpen(true)}
					disabled={availableCategories.length === 0}
				>
					<FiPlus aria-hidden="true" /> Añadir límite
				</button>
			</div>
			{isModalOpen && (
				<div className="budget-modal-backdrop" role="presentation">
					<form
						className="budget-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="new-budget-title"
						onSubmit={saveBudget}
					>
						<div className="new-budget-heading">
							<h2 id="new-budget-title">Añadir límite de categoría</h2>
							<button
								type="button"
								className="new-budget-close"
								aria-label="Cerrar"
								onClick={() => setIsModalOpen(false)}
							>
								<FiX aria-hidden="true" />
							</button>
						</div>
						{availableCategories.length > 0 ? (
							<>
								<label htmlFor="new-budget-category">Categoría</label>
								<select
									id="new-budget-category"
									className="movement-input"
									value={selectedCategory}
									onChange={(event) => setSelectedCategory(event.target.value)}
									required
								>
									<option value="">Selecciona categoría</option>
									{availableCategories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
								<label htmlFor="new-budget-limit">Límite mensual (€)</label>
								<input
									id="new-budget-limit"
									type="number"
									min="0.01"
									step="0.01"
									inputMode="decimal"
									value={limit}
									onChange={(event) => setLimit(event.target.value)}
									required
								/>
								<div className="budget-modal-actions">
									<button
										type="button"
										className="movement-cancel-button"
										onClick={() => setIsModalOpen(false)}
									>
										Cancelar
									</button>
									<button type="submit" className="movement-save-button">
										Guardar límite
									</button>
								</div>
							</>
						) : (
							<p>Ya hay límites para todas las categorías de gasto.</p>
						)}
					</form>
				</div>
			)}
		</>
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

  return categories.map(([category, total, limit]) => (
    <div
      key={category}
      onClick={() => navigate(`/categories/${category}`)}
    >
    <BudgetBar limit={limit} spent={total} title={category} />
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