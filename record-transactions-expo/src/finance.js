export const DEFAULT_CATEGORIES = {
  spent: [
    "Comida",
    "Hogar",
    "Gastos personales",
    "Cuotas mensuales",
    "Transporte",
    "Ocio",
    "Salud",
    "Pagos",
    "Viajes",
    "Educación",
  ],
  income: ["Nomina", "Prestamo", "Pagos", "Ventas", "Devolución", "Acciones", "Fondos"],
};

const CATEGORY_ICONS = [
  [/comida|restaurante|restauración|supermercado/i, "🍽️"],
  [/hogar|casa|alquiler/i, "🏠"],
  [/personal|ropa|compras/i, "🛍️"],
  [/cuotas|suscrip|mensual/i, "💳"],
  [/transporte|gasolina|coche/i, "🚗"],
  [/ocio|juego|entretenimiento/i, "🎮"],
  [/salud|farmacia|médic/i, "❤️"],
  [/pago|factura/i, "💸"],
  [/viaje|viajes|vacacion/i, "✈️"],
  [/educación|estudio|libro/i, "📚"],
  [/ahorro/i, "🐷"],
  [/nómina|nomina|salario/i, "💼"],
  [/préstamo|prestamo/i, "🏦"],
  [/venta/i, "🛒"],
  [/devolución|devolucion|reembolso/i, "↩️"],
  [/acción|accion|inversión|inversion/i, "📈"],
  [/fondo/i, "🪙"],
  [/gato|mascota/i, "🐾"],
  [/regalo/i, "🎁"],
  [/ajuste/i, "🔧"],
  [/retiro/i, "💰"],
];

export function getCategoryIcon(category, type = "spent") {
  const name = String(category || "").trim();
  const match = CATEGORY_ICONS.find(([pattern]) => pattern.test(name));
  if (match) return match[1];
  return name ? "🏷️" : type === "income" ? "💰" : "🧾";
}

export const BUDGET_WARNING_THRESHOLD = 80;

export function normalizeCategories(value) {
  const normalized = Object.entries(DEFAULT_CATEGORIES).flatMap(([type, names]) =>
    names.map((category) => ({
      category,
      type,
      limit: 0,
      icon: getCategoryIcon(category, type),
    })),
  );
  const incoming = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.entries(value).flatMap(([type, values]) =>
          Array.isArray(values)
            ? values.map((item) =>
                typeof item === "string"
                  ? { category: item, type, limit: 0 }
                  : { ...item, type: item.type || type },
              )
            : [],
        )
      : [];

  incoming.forEach((item) => {
    const category = String(
      typeof item === "string"
        ? item
        : item?.category ?? item?.categoria ?? item?.name ?? "",
    ).trim();
    if (!category) return;
    const rawType =
      typeof item === "string" ? "spent" : item?.type ?? item?.tipo ?? "spent";
    const type =
      rawType === "income" || rawType === "Ingreso" ? "income" : "spent";
    const limit = Math.max(
      Number(typeof item === "string" ? 0 : item?.limit ?? item?.presupuesto) ||
        0,
      0,
    );
    const icon =
      typeof item === "string" || typeof item?.icon !== "string" || !item.icon
        ? getCategoryIcon(category, type)
        : item.icon;
    const existing = normalized.find(
      (candidate) =>
        candidate.type === type &&
        candidate.category.toLocaleLowerCase("es") ===
          category.toLocaleLowerCase("es"),
    );
    if (existing) {
      if (limit > 0) existing.limit = limit;
      if (typeof item !== "string" && item?.icon) existing.icon = icon;
      return;
    }
    normalized.push({ category, type, limit, icon });
  });
  return normalized;
}

export function getCategoriesForType(categories, type) {
  const defaults = DEFAULT_CATEGORIES[type] || [];
  const custom = normalizeCategories(categories)
    .filter((item) => item.type === type)
    .map((item) => item.category);
  return [...new Set([...defaults, ...custom])];
}

export function filterMovements(movements, { startDate, endDate, type, query } = {}) {
  const normalizedQuery = String(query || "").trim().toLocaleLowerCase("es");
  return movements
    .filter((movement) => {
      if (startDate && movement.fecha < startDate) return false;
      if (endDate && movement.fecha > endDate) return false;
      if (
        type === "savings-withdrawal" &&
        movement.tipo !== "savings-withdrawal"
      ) {
        return false;
      }
      if (type === "spent" && Number(movement.importe) >= 0) return false;
      if (
        type === "income" &&
        (Number(movement.importe) <= 0 ||
          movement.tipo === "savings-withdrawal")
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      return `${movement.nombre || ""} ${movement.categoria || ""}`
        .toLocaleLowerCase("es")
        .includes(normalizedQuery);
    })
    .slice()
    .sort((first, second) => second.fecha.localeCompare(first.fecha));
}

export function getTodayDate() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getCurrentMonthInterval(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function parseAmount(value) {
  return Number(String(value).trim().replace(",", "."));
}

export function calculateSummary(movements) {
  return movements.reduce(
    (summary, movement) => {
      const amount = Number(movement.importe);
      if (!Number.isFinite(amount)) return summary;

      if (movement.tipo === "savings-withdrawal") {
        summary.available += amount;
      } else if (amount < 0) {
        summary.spent += Math.abs(amount);
      } else {
        summary.available +=
          amount - Math.min(Number(movement.savingsTransferAmount) || 0, amount);
      }
      return summary;
    },
    { spent: 0, available: 0 },
  );
}

export function calculateCategorySummary(
  movements,
  categories,
  startDate,
  endDate,
  type = "spent",
) {
  const totals = new Map();
  for (const movement of movements) {
    if (!movement.fecha || movement.tipo === "savings-withdrawal") continue;
    if (startDate && movement.fecha < startDate) continue;
    if (endDate && movement.fecha > endDate) continue;
    const amount = Number(movement.importe);
    if (!Number.isFinite(amount) || (type === "spent" ? amount >= 0 : amount <= 0)) {
      continue;
    }
    const category = movement.categoria || "Sin categoría";
    totals.set(category, (totals.get(category) || 0) + Math.abs(amount));
  }

  const categoryItems = normalizeCategories(categories);
  const names = getCategoriesForType(categoryItems, type);
  return names
    .map((name) => {
      const saved = categoryItems.find(
        (item) => item.type === type && item.category === name,
      );
      return [name, totals.get(name) || 0, saved?.limit || 0];
    })
    .filter(([, total, limit]) => total > 0 || limit > 0)
    .sort((first, second) => second[1] - first[1]);
}

export function getBudgetAlerts(summary) {
  return summary
    .filter(
      ([, amount, limit]) =>
        Number(limit) > 0 &&
        amount / Number(limit) >= BUDGET_WARNING_THRESHOLD / 100,
    )
    .map(([category, amount, limit]) => ({
      category,
      amount,
      limit: Number(limit),
      percent: (amount / Number(limit)) * 100,
      exceeded: Math.max(amount - Number(limit), 0),
    }))
    .sort(
      (first, second) =>
        Number(second.exceeded > 0) - Number(first.exceeded > 0) ||
        second.percent - first.percent,
    );
}

export function calculateAccountBalance(account, movements) {
  return movements.reduce((balance, movement) => {
    if (String(movement.savingsAccountId) !== String(account.id)) {
      return balance;
    }
    if (movement.tipo === "savings-withdrawal") {
      return balance - Math.abs(Number(movement.importe) || 0);
    }
    return (
      balance +
      Math.min(
        Math.max(Number(movement.savingsTransferAmount) || 0, 0),
        Math.max(Number(movement.importe) || 0, 0),
      )
    );
  }, Math.max(Number(account.openingBalance) || 0, 0));
}

export function createMovement(form) {
  const amount = parseAmount(form.amount);
  if (
    !form.name.trim() ||
    !form.category ||
    !isValidDate(form.date) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }

  const isIncome = form.type === "income";
  const savingsTransferAmount = isIncome
    ? parseAmount(form.savingsTransferAmount) || 0
    : 0;
  if (
    !Number.isFinite(savingsTransferAmount) ||
    savingsTransferAmount < 0 ||
    savingsTransferAmount > amount ||
    (form.savingsAccountId && savingsTransferAmount <= 0)
  ) {
    return null;
  }

  return {
    id: `movement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nombre: form.name.trim(),
    categoria: form.category,
    fecha: form.date,
    importe: isIncome ? amount : -amount,
    tipo: form.type,
    savingsAccountId: form.savingsAccountId || "",
    savingsTransferAmount,
  };
}

export function createSavingsAccount(name, openingBalance) {
  const balance = parseAmount(openingBalance);
  if (!name.trim() || !Number.isFinite(balance) || balance < 0) return null;
  return {
    id: `account-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    openingBalance: balance,
  };
}

export function createSavingsWithdrawal(account, amount, date, movements) {
  const balance = calculateAccountBalance(account, movements);
  const withdrawal = parseAmount(amount);
  if (
    !Number.isFinite(withdrawal) ||
    withdrawal <= 0 ||
    withdrawal > balance ||
    !isValidDate(date)
  ) {
    return null;
  }
  return {
    id: `withdrawal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nombre: `Retiro · ${account.name}`,
    categoria: "Retiro de ahorro",
    fecha: date,
    importe: withdrawal,
    tipo: "savings-withdrawal",
    savingsAccountId: String(account.id),
    savingsTransferAmount: 0,
  };
}

const RECURRENCE_FREQUENCIES = ["weekly", "monthly", "yearly"];

export function advanceRecurrenceDate(date, frequency, day, month) {
  if (!isValidDate(date) || !RECURRENCE_FREQUENCIES.includes(frequency)) {
    return "";
  }
  const [yearValue, monthValue, dayValue] = date.split("-").map(Number);
  const current = new Date(Date.UTC(yearValue, monthValue - 1, dayValue));
  if (frequency === "weekly") {
    current.setUTCDate(current.getUTCDate() + 7);
  } else {
    const nextYear = yearValue + (frequency === "yearly" ? 1 : 0);
    const nextMonth =
      frequency === "yearly" ? Number(month) : monthValue;
    const year = nextYear + Math.floor(nextMonth / 12);
    const monthIndex = nextMonth % 12;
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    return [
      year,
      String(monthIndex + 1).padStart(2, "0"),
      String(Math.min(Number(day), lastDay)).padStart(2, "0"),
    ].join("-");
  }
  return [
    current.getUTCFullYear(),
    String(current.getUTCMonth() + 1).padStart(2, "0"),
    String(current.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function createRecurringRule(movement, frequency) {
  if (!RECURRENCE_FREQUENCIES.includes(frequency) || !isValidDate(movement.fecha)) {
    return null;
  }
  const [, month, day] = movement.fecha.split("-").map(Number);
  const rule = {
    id: `recurring-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nombre: movement.nombre,
    categoria: movement.categoria,
    importe: Number(movement.importe),
    tipo: movement.tipo,
    savingsAccountId: movement.savingsAccountId || "",
    savingsTransferAmount: Number(movement.savingsTransferAmount) || 0,
    frequency,
    dayOfMonth: day,
    monthOfYear: month - 1,
    nextDate: advanceRecurrenceDate(
      movement.fecha,
      frequency,
      day,
      month - 1,
    ),
  };
  return rule.nextDate ? rule : null;
}

export function generateDueMovements(rules, movements, today) {
  const known = new Set(movements.map((movement) => String(movement.id)));
  const generated = [];
  const updatedRules = rules.map((rule) => {
    let nextDate = rule.nextDate;
    let attempts = 0;
    while (isValidDate(nextDate) && nextDate <= today && attempts < 500) {
      const id = `recurring-${rule.id}-${nextDate}`;
      if (!known.has(id)) {
        generated.push({
          id,
          nombre: rule.nombre,
          categoria: rule.categoria,
          fecha: nextDate,
          importe: Number(rule.importe),
          tipo: rule.tipo,
          savingsAccountId: rule.savingsAccountId || "",
          savingsTransferAmount: Number(rule.savingsTransferAmount) || 0,
          savingsWithdrawalAmount: 0,
          recurringRuleId: rule.id,
        });
        known.add(id);
      }
      nextDate = advanceRecurrenceDate(
        nextDate,
        rule.frequency,
        rule.dayOfMonth,
        rule.monthOfYear,
      );
      attempts += 1;
    }
    return { ...rule, nextDate };
  });
  return { rules: updatedRules, movements: generated };
}

export function createEditedMovement(movement, form) {
  const amount = parseAmount(form.amount);
  if (
    !form.name.trim() ||
    !form.category.trim() ||
    !isValidDate(form.date) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }
  if (movement.tipo === "savings-withdrawal") {
    return {
      ...movement,
      nombre: form.name.trim(),
      categoria: form.category.trim(),
      fecha: form.date,
      importe: amount,
      savingsWithdrawalAmount: amount,
    };
  }
  const income = Number(movement.importe) > 0;
  return {
    ...movement,
    nombre: form.name.trim(),
    categoria: form.category.trim(),
    fecha: form.date,
    importe: income ? amount : -amount,
    savingsTransferAmount: income
      ? Math.min(Number(movement.savingsTransferAmount) || 0, amount)
      : 0,
  };
}

export function formatMovementDate(value) {
  if (!isValidDate(value)) return value || "Fecha no disponible";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
