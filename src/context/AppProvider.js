import { CategoriesProvider } from "./CategoriesContext";
import { DateIntervalProvider } from "./DateIntervalContext";
import { MovementsProvider } from "./MovementsContext";

// Add multiple providers here if needed
export function AppProviders({ children }) {
  return (
    <MovementsProvider>
      <CategoriesProvider>
        <DateIntervalProvider>{children}</DateIntervalProvider>
      </CategoriesProvider>
    </MovementsProvider>
  );
}
