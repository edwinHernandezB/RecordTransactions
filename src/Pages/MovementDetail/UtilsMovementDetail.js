export function formatMovementDate(dateValue) {
  if (!dateValue) return "Fecha no disponible";

  const datePart = String(dateValue).slice(0, 10);
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  const date = dateMatch
    ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))
    : new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function createMovementEditForm(movement) {
  return {
    name: movement.nombre || "",
    category: movement.categoria || "",
    date: String(movement.fecha || "").slice(0, 10),
    amount: String(Math.abs(Number(movement.importe) || 0)),
  };
}

export function isMovementEditFormValid(form) {
  return (
    form.name.trim() !== "" &&
    form.category.trim() !== "" &&
    form.date !== "" &&
    Number.isFinite(Number(form.amount)) &&
    Number(form.amount) > 0
  );
}

export function applyMovementEdit(movement, form) {
  const amount = Math.abs(Number(form.amount));

  return {
    ...movement,
    nombre: form.name.trim(),
    categoria: form.category.trim(),
    fecha: form.date,
    importe: Number(movement.importe) < 0 ? -amount : amount,
  };
}