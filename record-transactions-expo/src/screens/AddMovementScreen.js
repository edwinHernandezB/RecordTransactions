import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createMovement,
  createRecurringRule,
  getCategoriesForType,
  getTodayDate,
  isValidDate,
} from "../finance";
import CategoryIcon from "../components/CategoryIcon";

const COLORS = {
  background: "#f2f2f2",
  surface: "#ffffff",
  text: "#202020",
  muted: "#686868",
  border: "#d3d3d3",
  green: "#34764a",
  greenSoft: "#d4f8d4",
  red: "#c62828",
  redSoft: "#ffd6d6",
};

function Field({ label, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={styles.input}
        placeholderTextColor="#888"
      />
    </View>
  );
}

function ChoiceChip({ label, selected, onPress, tone = "neutral" }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        selected && tone === "income" && styles.incomeSelected,
        selected && tone === "spent" && styles.spentSelected,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
          selected && tone === "income" && { color: COLORS.green },
          selected && tone === "spent" && { color: COLORS.red },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AddMovementScreen({
  accounts,
  categories,
  onAddMovement,
  onAddCategory,
  onAddRecurring,
  onBack,
}) {
  const [type, setType] = useState("spent");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [amount, setAmount] = useState("");
  const [savingsAccountId, setSavingsAccountId] = useState("");
  const [savingsTransferAmount, setSavingsTransferAmount] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState("monthly");

  const activeCategories = getCategoriesForType(categories, type);
  const selectedAccount = accounts.find(
    (account) => String(account.id) === savingsAccountId,
  );
  const amountNumber = Number(amount);
  const transferNumber = Number(savingsTransferAmount);

  const submitMovement = () => {
    const movement = createMovement({
      name,
      category,
      date,
      amount,
      type,
      savingsAccountId,
      savingsTransferAmount,
    });
    if (!movement) {
      setError("Revisa el nombre, la categoría, la fecha y el importe.");
      return;
    }
    onAddMovement(movement);
    if (isRecurring) {
      const rule = createRecurringRule(movement, recurrenceFrequency);
      if (rule) onAddRecurring(rule);
    }
    onBack();
  };

  const saveCustomCategory = () => {
    const value = customCategory.trim();
    if (!value) return;
    onAddCategory(type, value);
    setCategory(value);
    setCustomCategory("");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onBack}>
          <Text style={styles.backButton}>‹ Volver</Text>
        </Pressable>
        <Text style={styles.title}>Nuevo movimiento</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.choiceRow}>
          <ChoiceChip
            label="Gasto"
            selected={type === "spent"}
            tone="spent"
            onPress={() => {
              setType("spent");
              setCategory("");
              setSavingsAccountId("");
              setSavingsTransferAmount("");
            }}
          />
          <ChoiceChip
            label="Ingreso"
            selected={type === "income"}
            tone="income"
            onPress={() => {
              setType("income");
              setCategory("");
            }}
          />
        </View>

        <Field
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Por ejemplo, compra semanal"
          returnKeyType="next"
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.choiceRow}>
          {activeCategories.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: category === item }}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryChip,
                category === item && styles.categoryChipSelected,
              ]}
            >
              <CategoryIcon category={item} type={type} />
              <Text style={styles.categoryChipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.inlineForm}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            value={customCategory}
            onChangeText={setCustomCategory}
            placeholder="Nueva categoría"
            placeholderTextColor="#888"
            maxLength={40}
          />
          <Pressable style={styles.secondaryButton} onPress={saveCustomCategory}>
            <Text style={styles.secondaryButtonText}>Añadir</Text>
          </Pressable>
        </View>

        <Field
          label="Fecha (AAAA-MM-DD)"
          value={date}
          onChangeText={setDate}
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Field
          label="Importe (€)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />

        {type === "income" && accounts.length > 0 ? (
          <View style={styles.accountTransfer}>
            <Text style={styles.label}>Destinar parte al ahorro (opcional)</Text>
            <View style={styles.choiceRow}>
              <ChoiceChip
                label="Sin cuenta"
                selected={!savingsAccountId}
                onPress={() => {
                  setSavingsAccountId("");
                  setSavingsTransferAmount("");
                }}
              />
              {accounts.map((account) => (
                <ChoiceChip
                  key={account.id}
                  label={account.name}
                  selected={savingsAccountId === String(account.id)}
                  onPress={() => setSavingsAccountId(String(account.id))}
                />
              ))}
            </View>
            {selectedAccount ? (
              <Field
                label="Importe a transferir (€)"
                value={savingsTransferAmount}
                onChangeText={setSavingsTransferAmount}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />
            ) : null}
            {selectedAccount &&
            transferNumber > amountNumber &&
            Number.isFinite(amountNumber) ? (
              <Text style={styles.errorText}>
                El ahorro no puede superar el importe del ingreso.
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.accountTransfer}>
          <ChoiceChip
            label={isRecurring ? "Repetición activada" : "Repetir automáticamente"}
            selected={isRecurring}
            onPress={() => setIsRecurring(!isRecurring)}
          />
          {isRecurring ? (
            <>
              <Text style={styles.label}>Frecuencia de repetición</Text>
              <View style={styles.choiceRow}>
                {[
                  ["weekly", "Cada semana"],
                  ["monthly", "Cada mes"],
                  ["yearly", "Cada año"],
                ].map(([value, label]) => (
                  <ChoiceChip
                    key={value}
                    label={label}
                    selected={recurrenceFrequency === value}
                    onPress={() => setRecurrenceFrequency(value)}
                  />
                ))}
              </View>
              <Text style={styles.emptyText}>
                El siguiente movimiento se creará automáticamente cuando llegue la fecha.
              </Text>
            </>
          ) : null}
        </View>

        {!isValidDate(date) ? (
          <Text style={styles.errorText}>Usa una fecha válida AAAA-MM-DD.</Text>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable
          style={[
            styles.primaryButton,
            type === "income" ? styles.incomeButton : styles.spentButton,
          ]}
          onPress={submitMovement}
        >
          <Text style={styles.primaryButtonText}>Guardar movimiento</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingTop: 28, paddingBottom: 44, gap: 14 },
  header: { gap: 8 },
  backButton: { color: COLORS.green, fontSize: 14, fontWeight: "600" },
  title: { color: COLORS.text, fontSize: 28, fontWeight: "700" },
  card: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  field: { gap: 6 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 15,
  },
  flexInput: { flex: 1 },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  categoryChip: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  categoryChipSelected: { borderColor: "#34764a", backgroundColor: "#eaf4ed" },
  categoryChipText: { color: "#202020", fontSize: 13 },
  chip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },
  chipSelected: { borderColor: "#777", backgroundColor: "#eeeeee" },
  incomeSelected: { borderColor: COLORS.green, backgroundColor: COLORS.greenSoft },
  spentSelected: { borderColor: COLORS.red, backgroundColor: COLORS.redSoft },
  chipText: { color: COLORS.text, fontSize: 13 },
  chipTextSelected: { fontWeight: "700" },
  inlineForm: { flexDirection: "row", alignItems: "center", gap: 8 },
  secondaryButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 7,
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  accountTransfer: {
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  primaryButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#111111",
  },
  incomeButton: { backgroundColor: COLORS.green },
  spentButton: { backgroundColor: "#111111" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  errorText: { color: COLORS.red, fontSize: 13 },
  emptyText: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
});
