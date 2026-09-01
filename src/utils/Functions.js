import { INCOME_CATEGORIES, SPENT_CATEGORIES } from "./constants";

export const normalizeCategories = (categories = []) => {
  if (!Array.isArray(categories)) return [];

  return categories
    .map((item) => {
      if (typeof item === "string") {
        return { category: item.trim(), type: "spent" };
      }

      const category = item?.category ?? item?.categoria ?? item?.name ?? "";
      const type = item?.type ?? item?.tipo ?? "spent";

      return {
        category: String(category).trim(),
        type: type === "income" ? "income" : "spent",
      };
    })
    .filter((item) => item.category);
};

export const getCategoriesList = (type, categoriesList = []) => {
  if (!type) {
    return ["Error"];
  }

  const defaults = type === "income" ? INCOME_CATEGORIES : SPENT_CATEGORIES;
  const custom = normalizeCategories(categoriesList)
    .filter((category) => category.type === type)
    .map((category) => category.category);

  return [...new Set([...defaults, ...custom])];
};