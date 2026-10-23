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
  calculateCategorySummary,
  getBudgetAlerts,
  getCategoriesForType,
} from "../finance";

const COLORS = {
  text: "#202020",
  muted: "#686868",
  border: "#d3d3d3",
  surface: "#ffffff",
  green: "#34764a",
  warning: "#f4d77a",
  danger: "#e57373",
  red: "#a61f1f",
};

export default function CategoriesScreen({
  movements,
  categories,
  onSaveLimit,
  dateInterval,
  onChangeDateInterval,
}) {
  const [type, setType] = useState("spent");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [limitValue, setLimitValue] = useState("");
  const rows = useMemo(
    () =>
      calculateCategorySummary(
        movements,
        categories,
        dateInterval.startDate,
        dateInterval.endDate,
        type,
      ),
    [categories, dateInterval.endDate, dateInterval.startDate, movements, type],
  );
  const alerts = type === "spent" ? getBudgetAlerts(rows) : [];
  const names = getCategoriesForType(categories, type);

  const saveLimit = () => {
    const value = Number(String(limitValue).replace(",", "."));
    if (!selectedCategory || !Number.isFinite(value) || value <= 0) return;
    onSaveLimit(selectedCategory, value, type);
    setSelectedCategory("");
    setLimitValue("");
  };
  const removeLimit = () => {
    if (!selectedCategory) return;
    onSaveLimit(selectedCategory, 0, type);
    setSelectedCategory("");
    setLimitValue("");
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Categorías</Text>
      <View style={styles.switchRow}>
        {[
          ["spent", "Gastos"],
          ["income", "Ingresos"],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setType(value)}
            style={[styles.switch, type === value && styles.switchSelected]}
          >
            <Text style={[styles.switchText, type === value && styles.switchTextSelected]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <DateRangeFields
        startDate={dateInterval.startDate}
        endDate={dateInterval.endDate}
        onChange={onChangeDateInterval}
      />

      {alerts.length > 0 ? (
        <View style={styles.alerts}>
          <Text style={styles.alertsTitle}>Avisos de presupuesto</Text>
          <Text style={styles.alertHint}>Aviso al llegar al 80 % del límite.</Text>
          {alerts.map((alert) => (
            <View
              key={alert.category}
              style={[
                styles.alert,
                alert.exceeded > 0 && styles.alertExceeded,
              ]}
            >
              <View style={styles.categoryLabel}>
                <CategoryIcon category={alert.category} type="spent" />
                <Text style={styles.alertName}>{alert.category}</Text>
              </View>
              <Text style={styles.alertText}>
                {alert.exceeded > 0
                  ? `Superado por ${alert.exceeded.toFixed(2)}€`
                  : `Utilizado el ${Math.floor(alert.percent)} %`}
                {` · ${alert.amount.toFixed(2)}€ de ${alert.limit.toFixed(2)}€`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {type === "spent" ? "Gasto por categoría" : "Ingresos por categoría"}
        </Text>
        {rows.length === 0 ? (
          <Text style={styles.empty}>No hay datos para este periodo.</Text>
        ) : (
          rows.map(([category, total, limit]) => {
            const hasLimit = Number(limit) > 0;
            const percentage = hasLimit ? (total / Number(limit)) * 100 : 0;
            return (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryHeading}>
                  <View style={styles.categoryLabel}>
                    <CategoryIcon category={category} type={type} />
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                  <Text style={styles.total}>{total.toFixed(2)}€</Text>
                </View>
                {hasLimit ? (
                  <>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor:
                              type === "spent" && percentage > 100
                                ? COLORS.danger
                                : type === "spent" && percentage >= 80
                                  ? COLORS.warning
                                  : COLORS.green,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.limitText}>
                      {type === "spent" ? "Presupuesto" : "Objetivo"}{" "}
                      {Number(limit).toFixed(2)}€ ·{" "}
                      {percentage > 100 && type === "spent"
                        ? `Excedido ${(total - Number(limit)).toFixed(2)}€`
                        : `${Math.max(Number(limit) - total, 0).toFixed(2)}€ restante`}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.limitText}>Sin límite establecido</Text>
                )}
                <Pressable
                  style={styles.editLimit}
                  onPress={() => {
                    setSelectedCategory(category);
                    setLimitValue(hasLimit ? String(limit) : "");
                  }}
                >
                  <Text style={styles.editLimitText}>
                    {hasLimit ? "Editar límite" : "Establecer límite"}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {type === "spent" ? "Añadir presupuesto" : "Añadir objetivo"}
        </Text>
        <View style={styles.chipRow}>
          {names
            .filter(
              (name) =>
                !categories.some(
                  (item) =>
                    item.category === name &&
                    item.type === type &&
                    Number(item.limit) > 0,
                ),
            )
            .map((name) => (
              <Pressable
                key={name}
                style={[
                  styles.categoryChip,
                  selectedCategory === name && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(name)}
              >
                <View style={styles.categoryChipLabel}>
                  <CategoryIcon category={name} type={type} />
                  <Text style={styles.categoryChipText}>{name}</Text>
                </View>
              </Pressable>
            ))}
        </View>
        {selectedCategory ? (
          <View style={styles.editor}>
            <View style={styles.categoryLabel}>
              <CategoryIcon category={selectedCategory} type={type} />
              <Text style={styles.selectedName}>{selectedCategory}</Text>
            </View>
            <TextInput
              accessibilityLabel="Importe del límite"
              value={limitValue}
              onChangeText={setLimitValue}
              keyboardType="decimal-pad"
              placeholder="Importe mensual (€)"
              placeholderTextColor="#888"
              style={styles.input}
            />
            <View style={styles.editorButtons}>
              {categories.some(
                (item) =>
                  item.category === selectedCategory &&
                  item.type === type &&
                  Number(item.limit) > 0,
              ) ? (
                <Pressable
                  style={styles.removeButton}
                  onPress={removeLimit}
                >
                  <Text style={styles.removeText}>Quitar límite</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedCategory("");
                  setLimitValue("");
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveLimit}>
                <Text style={styles.saveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40, gap: 14 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "700" },
  switchRow: { flexDirection: "row", padding: 3, borderRadius: 9, backgroundColor: "#e7e7e7" },
  switch: { flex: 1, alignItems: "center", padding: 10, borderRadius: 7 },
  switchSelected: { backgroundColor: COLORS.surface },
  switchText: { color: COLORS.muted, fontSize: 14 },
  switchTextSelected: { color: COLORS.text, fontWeight: "700" },
  alerts: { padding: 12, gap: 8, borderWidth: 1, borderColor: "#e2c57a", borderRadius: 9, backgroundColor: "#fff9e8" },
  alertsTitle: { color: "#4a3a16", fontSize: 15, fontWeight: "700" },
  alertHint: { color: COLORS.muted, fontSize: 11 },
  alert: { padding: 9, borderLeftWidth: 3, borderLeftColor: "#e0b84e", backgroundColor: "#fff" },
  alertExceeded: { borderLeftColor: COLORS.red, backgroundColor: "#fff2f0" },
  alertName: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  alertText: { marginTop: 2, color: "#514a3b", fontSize: 12 },
  card: { padding: 15, gap: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.surface },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  empty: { color: COLORS.muted, fontSize: 13 },
  categoryRow: { paddingTop: 11, gap: 7, borderTopWidth: 1, borderTopColor: "#e5e5e5" },
  categoryHeading: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  categoryLabel: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  categoryName: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  total: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  progressTrack: { height: 9, overflow: "hidden", borderRadius: 5, backgroundColor: "#e6e6e6" },
  progressFill: { height: "100%", borderRadius: 5 },
  limitText: { color: COLORS.muted, fontSize: 12 },
  editLimit: { alignSelf: "flex-start" },
  editLimitText: { color: COLORS.green, fontSize: 12, fontWeight: "700" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  categoryChip: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20 },
  categoryChipSelected: { borderColor: COLORS.green, backgroundColor: "#eaf4ed" },
  categoryChipLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryChipText: { color: COLORS.text, fontSize: 12 },
  editor: { gap: 8, padding: 10, borderRadius: 8, backgroundColor: "#f2f2f2" },
  selectedName: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  input: { minHeight: 42, paddingHorizontal: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: 7, backgroundColor: COLORS.surface, color: COLORS.text },
  editorButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  cancelButton: { padding: 10 },
  cancelText: { color: COLORS.muted, fontWeight: "600" },
  removeButton: { padding: 10 },
  removeText: { color: COLORS.red, fontWeight: "600" },
  saveButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 7, backgroundColor: "#111" },
  saveText: { color: "#fff", fontWeight: "700" },
});
