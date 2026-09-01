import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../context/MovementsContext";
import { useCategories } from "../context/CategoriesContext";
import { useDateInterval } from "../context/DateIntervalContext";
import TopBar from "../components/Topbar";
import { FiChevronRight } from "react-icons/fi";
import { SPENT_CATEGORIES } from "../utils/constants";
import { normalizeCategories } from "../utils/Functions";

export default function Categories() {
	const navigate = useNavigate();
	const { movements } = useMovements();
	const { categoriesList } = useCategories();
	const { startDate, endDate } = useDateInterval();

	const categories = useMemo(() => {
		const totals = {};
		const persistedCategories = normalizeCategories(categoriesList)
			.filter((category) => category.type === "spent")
			.map((category) => category.category);
		const allCategories = [...new Set([...SPENT_CATEGORIES, ...persistedCategories])];

		const filteredMovements = movements.filter((movement) => {
			if (!movement || !movement.fecha) return false;

			const date = new Date(movement.fecha);
			const dateKey = date.toISOString().split("T")[0];

			if (startDate && endDate) {
				return dateKey >= startDate && dateKey <= endDate;
			}

			const now = new Date();
			return (
				date.getMonth() === now.getMonth() &&
				date.getFullYear() === now.getFullYear()
			);
		});

		filteredMovements.forEach((movement) => {
			if (movement.importe === 0 || movement.importe > 0) return;

			const category = movement.categoria || "Sin categoría";
			totals[category] = (totals[category] || 0) + Math.abs(Number(movement.importe));
		});

		return allCategories
			.map((category) => [category, Number(totals[category] || 0)])
			.filter(([, total]) => total > 0)
			.sort(([, totalA], [, totalB]) => totalB - totalA);
	}, [categoriesList, endDate, movements, startDate]);

	return (
		<>
			<TopBar title="Categorías" onBack={() => navigate("/")} />
			<div className="home-container">
				<div className="categories-header">
					<h3>Gastos por categoría</h3>
				</div>

				{categories.length === 0 ? (
					<span className="empty-state-text">
						Registra gastos para ver el resumen por categorías
					</span>
				) : (
					<div>
						{categories.map(([category, total]) => (
							<div key={category} className="category-summary-total" onClick={() => navigate(`/categories/${category}`)}>
								<span>{category}</span>
								<span className="category-total">-{total.toFixed(2)}€</span>
								<FiChevronRight />
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
}
