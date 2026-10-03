const CATEGORY_COLORS = [
  "#8FB8A8",
  "#E8B978",
  "#8FA9C4",
  "#D9948C",
  "#B1A0C7",
  "#C4B86A",
  "#78AAA9",
  "#D49EBA",
  "#A5B57C",
  "#D08A62",
];

export default function ExpenseDonutChart({ categories }) {
  const expenses = categories
    .map(([name, amount], index) => ({
      name,
      amount: Number(amount) || 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .filter(({ amount }) => amount > 0);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (total === 0) {
    return (
      <section className="expense-chart-section" aria-label="Distribución de gastos">
        <h2>Distribución de gastos</h2>
        <p className="expense-chart-empty">No hay gastos en este intervalo.</p>
      </section>
    );
  }

  let currentAngle = 0;
  const gradientStops = expenses.map(({ amount, color }) => {
    const startAngle = currentAngle;
    currentAngle += (amount / total) * 360;
    return `${color} ${startAngle}deg ${currentAngle}deg`;
  });
  const chartStyle = {
    "--expense-chart-gradient": `conic-gradient(${gradientStops.join(", ")})`,
  };

  return (
    <section className="expense-chart-section" aria-label="Distribución de gastos">
      <h2>Distribución de gastos</h2>
      <div className="expense-chart-layout">
        <div
          className="expense-donut"
          style={chartStyle}
          role="img"
          aria-label={`Gráfico circular del gasto total de ${total.toFixed(2)} euros`}
        >
          <div className="expense-donut-center">
            <span>Total gastado</span>
            <strong>{total.toFixed(2)}€</strong>
          </div>
        </div>
        <ul className="expense-chart-legend">
          {expenses.map(({ name, amount, color }) => (
            <li key={name}>
              <span className="expense-legend-name">
                <span
                  className="expense-legend-swatch"
                  style={{ "--expense-category-color": color }}
                  aria-hidden="true"
                />
                <span>{name}</span>
              </span>
              <span className="expense-legend-value">
                <strong>{((amount / total) * 100).toFixed(1)}%</strong>
                <span>{amount.toFixed(2)}€</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}