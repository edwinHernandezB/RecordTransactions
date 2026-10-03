import { useState } from "react";
import { FiEdit2, FiPlus } from "react-icons/fi";

export function SavingsSummary({ accounts, onAddAccount, onUpdateAccount }) {
  const [editingAccount, setEditingAccount] = useState(null);
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const saveAccount = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("accountName") || "").trim();
    const balance = Number(formData.get("accountBalance"));
    if (!name || !Number.isFinite(balance) || balance < 0) return;

    if (editingAccount?.id) {
      onUpdateAccount(editingAccount.id, { name, balance });
    } else {
      onAddAccount(name, balance);
    }
    setEditingAccount(null);
  };

  return (
    <section className="savings-summary" aria-labelledby="savings-summary-title">
      <div className="savings-summary-heading">
        <div>
          <h2 id="savings-summary-title">Ahorro acumulado</h2>
          <strong className="savings-total">{totalBalance.toFixed(2)}€</strong>
        </div>
        <button
          type="button"
          className="savings-add-button"
          onClick={() => setEditingAccount({ name: "", balance: "" })}
        >
          <FiPlus aria-hidden="true" /> Añadir cuenta
        </button>
      </div>
      {accounts.length > 0 ? (
        <ul className="savings-account-list">
          {accounts.map((account) => (
            <li key={account.id}>
              <span>{account.name}</span>
              <strong>{account.balance.toFixed(2)}€</strong>
              <button
                type="button"
                className="savings-icon-button"
                aria-label={`Editar cuenta ${account.name}`}
                onClick={() => setEditingAccount(account)}
              >
                <FiEdit2 aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="savings-empty">Aún no has añadido cuentas de ahorro.</p>
      )}
      {editingAccount && (
        <div className="budget-modal-backdrop" role="presentation">
          <form
            className="budget-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="savings-account-dialog-title"
            onSubmit={saveAccount}
          >
            <h2 id="savings-account-dialog-title">
              {editingAccount.id ? "Editar cuenta de ahorro" : "Añadir cuenta de ahorro"}
            </h2>
            <label htmlFor="savings-account-name">Nombre de la cuenta</label>
            <input
              id="savings-account-name"
              name="accountName"
              defaultValue={editingAccount.name}
              maxLength="50"
              required
              autoFocus
            />
            <label htmlFor="savings-account-balance">Ahorro actual (€)</label>
            <input
              id="savings-account-balance"
              name="accountBalance"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={editingAccount.balance}
              required
            />
            <div className="budget-modal-actions">
              <button
                type="button"
                className="movement-cancel-button"
                onClick={() => setEditingAccount(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="movement-save-button">
                Guardar cuenta
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export function SavingsGoals({ accounts, onUpdateAccount }) {
  const [editingAccount, setEditingAccount] = useState(null);

  const saveGoal = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const goal = Number(formData.get("savingsGoal"));
    if (!editingAccount || !Number.isFinite(goal) || goal <= 0) return;

    onUpdateAccount(editingAccount.id, { goal });
    setEditingAccount(null);
  };

  return (
    <section className="savings-goals" aria-labelledby="savings-goals-title">
      <h2 id="savings-goals-title">Cuentas de ahorro</h2>
      {accounts.length === 0 ? (
        <p className="savings-empty">Añade una cuenta de ahorro desde el resumen de inicio.</p>
      ) : (
        <ul className="savings-goal-list">
          {accounts.map((account) => {
            const progress = account.goal > 0
              ? Math.min((account.balance / account.goal) * 100, 100)
              : 0;

            return (
              <li key={account.id} className="savings-goal-item">
                <div className="savings-goal-heading">
                  <strong>{account.name}</strong>
                  <span>{account.balance.toFixed(2)}€</span>
                </div>
                {account.goal > 0 ? (
                  <>
                    <div
                      className="savings-goal-track"
                      role="progressbar"
                      aria-label={`Progreso del objetivo de ${account.name}`}
                      aria-valuenow={Math.round(progress)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div style={{ width: `${progress}%` }} />
                    </div>
                    <div className="savings-goal-caption">
                      <span>Objetivo {account.goal.toFixed(2)}€</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  </>
                ) : (
                  <span className="savings-empty">Sin objetivo establecido</span>
                )}
                <button
                  type="button"
                  className="savings-goal-action"
                  onClick={() => setEditingAccount(account)}
                >
                  {account.goal > 0 ? "Editar objetivo" : "Añadir objetivo"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {editingAccount && (
        <div className="budget-modal-backdrop" role="presentation">
          <form
            className="budget-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="savings-goal-dialog-title"
            onSubmit={saveGoal}
          >
            <h2 id="savings-goal-dialog-title">Objetivo de {editingAccount.name}</h2>
            <label htmlFor="savings-goal">Importe objetivo (€)</label>
            <input
              id="savings-goal"
              name="savingsGoal"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              defaultValue={editingAccount.goal || ""}
              required
              autoFocus
            />
            <div className="budget-modal-actions">
              <button
                type="button"
                className="movement-cancel-button"
                onClick={() => setEditingAccount(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="movement-save-button">
                Guardar objetivo
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}