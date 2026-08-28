import { MovementsProvider } from "./MovementsContext";

// Add multiple providers here if needed
export function AppProviders({ children }) {
  return (
      <MovementsProvider>
            {children}
      </MovementsProvider>
  );
}