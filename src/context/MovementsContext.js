import { createContext, useContext, useState, useEffect } from "react";

const MovementsContext = createContext();

export function MovementsProvider({ children }) {
  const [movements, setMovements] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("movements"));
      return Array.isArray(saved)
        ? saved.map((movement) => ({
            ...movement,
            importe: movement.importe ?? movement.formImport,
          }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("movements", JSON.stringify(movements));
  }, [movements]);

  const totalSpent = movements.reduce((total, movement) => {
    const amount = Number(movement.importe);
    return Number.isFinite(amount) && amount < 0
      ? total + Math.abs(amount)
      : total;
  }, 0);

  const value = { movements, setMovements, totalSpent };

  return (
    <MovementsContext.Provider value={value}>
      {children}
    </MovementsContext.Provider>
  );
}

export function useMovements() {
  const ctx = useContext(MovementsContext);
  if (!ctx) {
    throw new Error("useMovements need to be used within a MovementsProvider");
  }
  return ctx;
}