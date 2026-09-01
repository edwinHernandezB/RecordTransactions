import { createContext, useContext, useState, useEffect } from "react";
import { normalizeCategories } from "../utils/Functions";

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("categories"));
      return normalizeCategories(saved);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categoriesList));
  }, [categoriesList]);

  const value = { categoriesList, setCategoriesList };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("CategoriesContext need to be used within a CategoriesProvider");
  }
  return ctx;
}