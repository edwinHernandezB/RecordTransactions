import { useNavigate } from "react-router-dom";
import { useMovements } from "../../context/MovementsContext";
import { useCategories } from "../../context/CategoriesContext";
import { useDateInterval } from "../../context/DateIntervalContext";
import TopBar from "../../components/Topbar";
import { getCategoriesSummary, CategoryList } from "./UtilsCategories";

export default function Categories() {
  const navigate = useNavigate();
  const { movements } = useMovements();
  const { categoriesList } = useCategories();
  const { startDate, endDate } = useDateInterval();

  const categories = getCategoriesSummary(
    movements,
    categoriesList,
    startDate,
    endDate,
  );

  return (
    <>
      <TopBar title="Categorías" onBack={() => navigate("/")} />
      <CategoryList categories={categories} navigate={navigate} />
    </>
  );
}

