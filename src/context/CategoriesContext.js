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

  const updateCategoryLimit = (categoryName, limit) => {
    const numericLimit = Number(limit);
    if (!Number.isFinite(numericLimit) || numericLimit < 0) return;

    setCategoriesList((currentCategories) => {
      const normalized = normalizeCategories(currentCategories);
      const categoryExists = normalized.some(
        (category) =>
          category.category === categoryName && category.type === "spent",
      );

      if (!categoryExists) {
        return [
          ...normalized,
          { category: categoryName, type: "spent", limit: numericLimit },
        ];
      }

      return normalized.map((category) =>
        category.category === categoryName && category.type === "spent"
          ? { ...category, limit: numericLimit }
          : category,
      );
    });
  };

  const value = { categoriesList, setCategoriesList, updateCategoryLimit };

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