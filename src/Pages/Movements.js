import FloatingButton from "../components/FloatingButton";
import { CATEGORY_ASSETS } from "../utils/constants";
import TopBar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../context/MovementsContext";
import { useDateInterval } from "../context/DateIntervalContext";
import { useParams } from "react-router-dom";

export default function Movements() {
  const navigate = useNavigate();
  const { category } = useParams();
  // Cargar desde localStorage al iniciar
  const { movements } = useMovements();
  const { startDate, endDate } = useDateInterval();
  const hasDateInterval = Boolean(startDate && endDate);

  const filteredMovements = movements
    .filter((movement) => !category || movement.categoria === category)
    .filter((movement) => {
      if (!hasDateInterval) return true;

        const movementDate = new Date(movement.fecha);
        const year = movementDate.getFullYear();
        const month = String(movementDate.getMonth() + 1).padStart(2, "0");
        const day = String(movementDate.getDate()).padStart(2, "0");
        const movementDateKey = `${year}-${month}-${day}`;

        return movementDateKey >= startDate && movementDateKey <= endDate;
    });

  let totalMonthSpent = 0.0;
  if (filteredMovements && filteredMovements.length > 0) {
    totalMonthSpent = filteredMovements
      .filter((movement) => {
        const amount = Number(movement.importe);
        return Number.isFinite(amount) && amount < 0;
      })
      .reduce((total, movement) => total + Math.abs(Number(movement.importe)), 0);
  }

  return (
    <>
      <TopBar title="Movimientos" onBack={() => navigate(-1)} />

      <div className="movements">
        <h1 className="movements-title">
          {hasDateInterval ? "Gastado"  : "Gastado este mes"}
        </h1>
        <div className="movements-total">{totalMonthSpent.toFixed(2)}€</div>

        {filteredMovements.map((m) => (
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
              {m.importe > 0 ? "+" : ""}{m.importe.toFixed(2)}€
            </div>
          </div>
        ))}

        <FloatingButton onClick={() => navigate("/movements/create")} />
      </div>
    </>
  );
}
