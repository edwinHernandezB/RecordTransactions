import FloatingButton from "../../components/FloatingButton";
import TopBar from "../../components/Topbar";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../../context/MovementsContext";
import { useDateInterval } from "../../context/DateIntervalContext";
import { useParams } from "react-router-dom";
import {
  MovementsList,
  Title,
  getMovementsFilterdedByCategoryAndDate,
  calculateTotalMonthSpent,
} from "./UtilsMovements";

export default function Movements() {
  const navigate = useNavigate();
  const { category } = useParams();
  // Cargar desde localStorage al iniciar
  const { movements } = useMovements();
  const { startDate, endDate } = useDateInterval();
  const hasDateInterval = Boolean(startDate && endDate);

  const filteredMovements = getMovementsFilterdedByCategoryAndDate(
    movements,
    hasDateInterval,
    category,
    startDate,
    endDate,
  );

  let totalMonthSpent = calculateTotalMonthSpent(filteredMovements);

  return (
    <>
      <TopBar title="Movimientos" onBack={() => navigate(-1)} />

      <div className="movements">
        <Title totalMonthSpent={totalMonthSpent} />
        <MovementsList movements={filteredMovements} />
        <FloatingButton onClick={() => navigate("/movements/create")} />
      </div>
    </>
  );
}
