import { calculateMonthlySummary } from "../Home/UtilsHome";
import { createMovement, isMovementFormValid } from "./UtilsCreateMovement";

test("saving part of an income excludes the transfer from available money", () => {
  const form = {
    name: "Nómina",
    category: "Nomina",
    date: "2026-10-03",
    movImport: "100",
    type: "income",
    savingsAccountId: "account-1",
    savingsTransferAmount: "40",
  };

  expect(isMovementFormValid(form)).toBe(true);

  const income = createMovement(form, []);
  expect(income).toMatchObject({
    importe: 100,
    savingsAccountId: "account-1",
    savingsTransferAmount: 40,
  });

  const summary = calculateMonthlySummary([
    income,
    { importe: -20, categoria: "Comida" },
  ]);

  expect(summary.monthAvailable).toBe(60);
  expect(summary.monthSpent).toBe(20);
});

test("saving transfer cannot exceed its income", () => {
  const form = {
    name: "Nómina",
    category: "Nomina",
    date: "2026-10-03",
    movImport: "100",
    type: "income",
    savingsAccountId: "account-1",
    savingsTransferAmount: "101",
  };

  expect(isMovementFormValid(form)).toBe(false);
});
