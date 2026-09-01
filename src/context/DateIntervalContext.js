import { createContext, useContext, useState, useEffect } from "react";

const DateContext = createContext();

export function DateIntervalProvider({ children }) {
  const [dateInterval, setDateInterval] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("dateInterval"));
      return saved && typeof saved === "object"
        ? { startDate: saved.startDate || "", endDate: saved.endDate || "" }
        : { startDate: "", endDate: "" };
    } catch {
      return { startDate: "", endDate: "" };
    }
  });

  useEffect(() => {
    localStorage.setItem("dateInterval", JSON.stringify(dateInterval));
  }, [dateInterval]);

  const value = {
    startDate: dateInterval.startDate,
    endDate: dateInterval.endDate,
    setDateInterval,
  };

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
}

export function useDateInterval() {
  const ctx = useContext(DateContext);
  if (!ctx) {
    throw new Error("useMovements need to be used within a MovementsProvider");
  }
  return ctx;
}