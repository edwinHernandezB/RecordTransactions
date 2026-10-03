import { createContext, useContext, useEffect, useState } from "react";

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
        balance: Math.max(Number(account.balance) || 0, 0),
        goal: Math.max(Number(account.goal) || 0, 0),
      }));
  } catch {
    return [];
  }
}

export function SavingsProvider({ children }) {
  const [savingsAccounts, setSavingsAccounts] = useState(loadSavingsAccounts);

  useEffect(() => {
    localStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(savingsAccounts));
  }, [savingsAccounts]);

  const addSavingsAccount = (name, balance) => {
    const account = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      balance: Number(balance),
      goal: 0,
    };

    if (!account.name || !Number.isFinite(account.balance) || account.balance < 0) {
      return;
    }

    setSavingsAccounts((current) => [...current, account]);
  };

  const updateSavingsAccount = (accountId, changes) => {
    setSavingsAccounts((current) =>
      current.map((account) =>
        account.id === String(accountId)
          ? {
              ...account,
              ...(changes.name != null ? { name: changes.name.trim() } : {}),
              ...(changes.balance != null
                ? { balance: Math.max(Number(changes.balance) || 0, 0) }
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