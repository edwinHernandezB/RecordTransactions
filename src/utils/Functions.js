import { INCOME_CATEGORIES, SPENT_CATEGORIES } from "./constants";

export const getCategoriesList = type => {
    if (!type) {
        return ['Error'];
    }
    return type === 'income' ? INCOME_CATEGORIES : SPENT_CATEGORIES
}