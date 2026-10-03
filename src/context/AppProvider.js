import { CategoriesProvider } from "./CategoriesContext";
import { DateIntervalProvider } from "./DateIntervalContext";
import { MovementsProvider } from "./MovementsContext";
import { SavingsProvider } from "./SavingsContext";

// Add multiple providers here if needed
export function AppProviders({ children }) {
  return (
    <MovementsProvider>
      <CategoriesProvider>
        <SavingsProvider>
          <DateIntervalProvider>{children}</DateIntervalProvider>
        </SavingsProvider>
      </CategoriesProvider>
    </MovementsProvider>
  );
}
