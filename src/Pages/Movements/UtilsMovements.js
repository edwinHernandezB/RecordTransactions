import { CATEGORY_ASSETS } from "../../utils/constants";

export function calculateTotalMonthSpent(filteredMovements) {
  if (!filteredMovements || filteredMovements.length == 0) {
    return 0.0;
  }
  return filteredMovements
    .filter((movement) => {
      const amount = Number(movement.importe);
      return Number.isFinite(amount) && amount < 0;
    })
    .reduce((total, movement) => total + Math.abs(Number(movement.importe)), 0);
}

export function getMovementsFilterdedByCategoryAndDate(
  movements,
  hasDateInterval,
  category,
  startDate,
  endDate,
) {
  return movements
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
}

export function Title({ totalMonthSpent }) {
  return (
    <>
      <h1 className="movements-title">Gastado</h1>
      <div className="movements-total">{totalMonthSpent.toFixed(2)}€</div>
    </>
  );
}

export function MovementsList({ movements }) {
  return movements.map((m) => (
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
