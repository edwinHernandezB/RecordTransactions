import FloatingButton from "../components/FloatingButton";
import { CATEGORY_ASSETS } from "../utils/constants";
import TopBar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../context/MovementsContext";

export default function Movements() {
  const navigate = useNavigate();
  // Cargar desde localStorage al iniciar
  const { movements} = useMovements()

  const ahora = new Date();
  let totalMonthSpent = 0.0;
  if (movements && movements.length > 0) {
    totalMonthSpent = movements
      .filter((movement) => {
        const fecha = new Date(movement.fecha);
        return (
          movement.importe < 0 &&
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      })
      .reduce((total, movement) => total + Math.abs(movement.importe), 0);
  }

  return (
    <>
      <TopBar title="Movimientos" onBack={() => navigate("/")} />

      <div className="movements">
        <h1 className="movements-title">Gastado este mes</h1>
        <div className="movements-total">{totalMonthSpent.toFixed(2)}€</div>

        {movements.map((m) => ( 
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
