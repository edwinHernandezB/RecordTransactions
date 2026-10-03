import { createContext, useContext, useState, useEffect } from "react";

const DateContext = createContext();
const DATE_INTERVAL_STORAGE_KEY = "dateInterval";
const DATE_INTERVAL_MONTH_STORAGE_KEY = "dateIntervalMonth";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getCurrentMonthInterval(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  };
}

export function DateIntervalProvider({ children }) {
  const [activeMonthKey, setActiveMonthKey] = useState(() =>
    getCurrentMonthKey(),
  );
  const [dateInterval, setDateInterval] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DATE_INTERVAL_STORAGE_KEY));
      const savedMonth = localStorage.getItem(DATE_INTERVAL_MONTH_STORAGE_KEY);
      const currentMonth = getCurrentMonthKey();

      return saved && typeof saved === "object" && savedMonth === currentMonth
        ? { startDate: saved.startDate || "", endDate: saved.endDate || "" }
        : getCurrentMonthInterval();
    } catch {
      return getCurrentMonthInterval();
    }
  });

  useEffect(() => {
    localStorage.setItem(DATE_INTERVAL_STORAGE_KEY, JSON.stringify(dateInterval));
    localStorage.setItem(DATE_INTERVAL_MONTH_STORAGE_KEY, activeMonthKey);
  }, [dateInterval, activeMonthKey]);

  useEffect(() => {
    const checkForNewMonth = () => {
      const nextMonthKey = getCurrentMonthKey();
      if (nextMonthKey === activeMonthKey) return;

      setActiveMonthKey(nextMonthKey);
      setDateInterval(getCurrentMonthInterval());
    };

    const intervalId = window.setInterval(checkForNewMonth, 60_000);
    window.addEventListener("focus", checkForNewMonth);
    document.addEventListener("visibilitychange", checkForNewMonth);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkForNewMonth);
      document.removeEventListener("visibilitychange", checkForNewMonth);
    };
  }, [activeMonthKey]);

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