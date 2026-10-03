import { createContext, useContext, useEffect, useState } from "react";
import { useMovements } from "./MovementsContext";

const SavingsContext = createContext();
const SAVINGS_STORAGE_KEY = "savingsAccounts";

function loadSavingsAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVINGS_STORAGE_KEY));
    if (!Array.isArray(saved)) return [];

    return saved
      .filter((account) => account && account.id != null && account.name)
      .map((account) => ({
        id: String(account.id),
        name: String(account.name),
        openingBalance: Math.max(
          Number(account.openingBalance ?? account.balance) || 0,
          0,
        ),
        goal: Math.max(Number(account.goal) || 0, 0),
      }));
  } catch {
    return [];
  }
}

export function SavingsProvider({ children }) {
  const { movements } = useMovements();
  const [storedAccounts, setStoredAccounts] = useState(loadSavingsAccounts);

  useEffect(() => {
    localStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(storedAccounts));
  }, [storedAccounts]);

  const savingsAccounts = storedAccounts.map((account) => {
    const transferredIn = movements.reduce((total, movement) => {
      if (
        String(movement.savingsAccountId) !== account.id ||
        Number(movement.importe) <= 0
      ) {
        return total;
      }

      const transfer = Number(movement.savingsTransferAmount);
      if (!Number.isFinite(transfer) || transfer <= 0) return total;
      return total + Math.min(transfer, Number(movement.importe));
    }, 0);

    return { ...account, balance: account.openingBalance + transferredIn };
  });

  const addSavingsAccount = (name, balance) => {
    const account = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      openingBalance: Number(balance),
      goal: 0,
    };

    if (
      !account.name ||
      !Number.isFinite(account.openingBalance) ||
      account.openingBalance < 0
    ) {
      return;
    }

    setStoredAccounts((current) => [...current, account]);
  };

  const updateSavingsAccount = (accountId, changes) => {
    const accountTransfers = movements.reduce((total, movement) => {
      if (
        String(movement.savingsAccountId) !== String(accountId) ||
        Number(movement.importe) <= 0
      ) {
        return total;
      }

      const transfer = Number(movement.savingsTransferAmount);
      return Number.isFinite(transfer) && transfer > 0
        ? total + Math.min(transfer, Number(movement.importe))
        : total;
    }, 0);

    setStoredAccounts((current) =>
      current.map((account) =>
        account.id === String(accountId)
          ? {
              ...account,
              ...(changes.name != null ? { name: changes.name.trim() } : {}),
              ...(changes.balance != null
                ? {
                    openingBalance: Math.max(
                      (Number(changes.balance) || 0) - accountTransfers,
                      0,
                    ),
                  }
                : {}),
              ...(changes.goal != null
                ? { goal: Math.max(Number(changes.goal) || 0, 0) }
                : {}),
            }
          : account,
      ),
    );
  };

  const value = { savingsAccounts, addSavingsAccount, updateSavingsAccount };

  return (
    <SavingsContext.Provider value={value}>{children}</SavingsContext.Provider>
  );
}

export function useSavings() {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error("useSavings must be used within a SavingsProvider");
  }
  return context;
}