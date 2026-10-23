import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateRangeFields from "../components/DateRangeFields";
import CategoryIcon from "../components/CategoryIcon";
import {
  filterMovements,
  formatMovementDate,
} from "../finance";

const colors = {
  text: "#202020",
  muted: "#686868",
  border: "#d3d3d3",
  red: "#c62828",
  green: "#34764a",
  surface: "#ffffff",
};

export default function MovementsScreen({
  movements,
  onSelectMovement,
  dateInterval,
  onChangeDateInterval,
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const filtered = useMemo(
    () =>
      filterMovements(movements, {
        startDate: dateInterval.startDate,
        endDate: dateInterval.endDate,
        type: type === "all" ? undefined : type,
        query,
      }),
    [dateInterval.endDate, dateInterval.startDate, movements, query, type],
  );

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Movimientos</Text>
      <DateRangeFields
        startDate={dateInterval.startDate}
        endDate={dateInterval.endDate}
        onChange={onChangeDateInterval}
      />
      <TextInput
        accessibilityLabel="Buscar movimiento"
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar nombre o categoría"
        placeholderTextColor="#888"
        style={styles.search}
      />
      <View style={styles.filters}>
        {[
          ["all", "Todos"],
          ["spent", "Gastos"],
          ["income", "Ingresos"],
          ["savings-withdrawal", "Retiros"],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setType(value)}
            style={[styles.filter, type === value && styles.filterSelected]}
          >
            <Text style={[styles.filterText, type === value && styles.filterTextSelected]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.count}>{filtered.length} movimientos</Text>
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No hay movimientos para estos filtros.</Text>
      ) : (
        filtered.map((movement) => {
          const amount = Number(movement.importe) || 0;
          const isWithdrawal = movement.tipo === "savings-withdrawal";
          return (
            <Pressable
              key={movement.id}
              style={styles.row}
              onPress={() => onSelectMovement(movement)}
            >
              <CategoryIcon
                category={movement.categoria}
                type={amount > 0 && !isWithdrawal ? "income" : "spent"}
              />
              <View style={styles.details}>
                <Text style={styles.name}>{movement.nombre || "Movimiento"}</Text>
                <Text style={styles.meta}>
                  {movement.categoria || "Sin categoría"} ·{" "}
                  {formatMovementDate(movement.fecha)}
                </Text>
              </View>
              <Text style={[styles.amount, amount < 0 || isWithdrawal ? styles.expense : styles.income]}>
                {amount > 0 && !isWithdrawal ? "+" : "−"}
                {Math.abs(amount).toFixed(2)}€
              </Text>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40, gap: 14 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" },
  search: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  filters: { flexDirection: "row", gap: 8 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  filterSelected: { borderColor: colors.text, backgroundColor: "#eeeeee" },
  filterText: { color: colors.text, fontSize: 13 },
  filterTextSelected: { fontWeight: "700" },
  count: { color: colors.muted, fontSize: 12 },
  empty: { padding: 14, color: colors.muted, fontSize: 14 },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    backgroundColor: colors.surface,
  },
  details: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 14, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12 },
  amount: { fontSize: 14, fontWeight: "700" },
  expense: { color: colors.red },
  income: { color: colors.green },
});
