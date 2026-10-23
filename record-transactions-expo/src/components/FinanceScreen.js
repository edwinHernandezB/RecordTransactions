import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  calculateCategorySummary,
  calculateAccountBalance,
  calculateSummary,
  createSavingsAccount,
  createSavingsWithdrawal,
  formatMovementDate,
  filterMovements,
  getBudgetAlerts,
  getTodayDate,
} from "../finance";
import DateRangeFields from "./DateRangeFields";
import BudgetAlerts from "./BudgetAlerts";
import CategoryIcon from "./CategoryIcon";

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
  amber: "#a57913",
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

function SectionTitle({ children, detail }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export default function FinanceScreen({
  movements,
  accounts,
  categories,
  onAddAccount,
  onWithdraw,
  onUpdateAccount,
  onSelectMovement,
  dateInterval,
  onChangeDateInterval,
  onNavigate,
}) {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [withdrawalAccountId, setWithdrawalAccountId] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalDate, setWithdrawalDate] = useState(getTodayDate());
  const [accountError, setAccountError] = useState("");
  const [goalEditorId, setGoalEditorId] = useState("");
  const [goalInput, setGoalInput] = useState("");

  const filteredMovements = useMemo(
    () => filterMovements(movements, dateInterval),
    [dateInterval, movements],
  );
  const summary = useMemo(
    () => calculateSummary(filteredMovements),
    [filteredMovements],
  );
  const spentCategories = useMemo(
    () =>
      calculateCategorySummary(
        movements,
        categories,
        dateInterval.startDate,
        dateInterval.endDate,
        "spent",
      ),
    [categories, dateInterval.endDate, dateInterval.startDate, movements],
  );
  const categoryAlerts = useMemo(
    () => getBudgetAlerts(spentCategories),
    [spentCategories],
  );
  const submitAccount = () => {
    const account = createSavingsAccount(accountName, accountBalance);
    if (!account) {
      setAccountError("Indica un nombre y un saldo válido.");
      return;
    }
    if (editingAccountId) {
      const existing = accounts.find(
        (item) => String(item.id) === editingAccountId,
      );
      if (!existing) {
        setAccountError("No se encontró la cuenta seleccionada.");
        return;
      }
      const currentBalance = calculateAccountBalance(existing, movements);
      const activity = currentBalance - Number(existing.openingBalance || 0);
      const updatedOpeningBalance = account.openingBalance - activity;
      if (updatedOpeningBalance < 0) {
        setAccountError(
          "El saldo indicado no puede ser inferior al saldo neto de los movimientos de la cuenta.",
        );
        return;
      }
      onUpdateAccount(editingAccountId, {
        name: account.name,
        openingBalance: updatedOpeningBalance,
      });
    } else {
      onAddAccount(account);
    }
    setAccountName("");
    setAccountBalance("");
    setAccountError("");
    setEditingAccountId("");
    setShowAddAccount(false);
  };

  const submitWithdrawal = (account) => {
    const movement = createSavingsWithdrawal(
      account,
      withdrawalAmount,
      withdrawalDate,
      movements,
    );
    if (!movement) {
      setAccountError("El importe debe ser positivo y no superar el saldo.");
      return;
    }
    onWithdraw(movement);
    setAccountError("");
    setWithdrawalAmount("");
    setWithdrawalAccountId("");
  };

  const saveGoal = (account) => {
    const goal = Number(String(goalInput).replace(",", "."));
    if (!Number.isFinite(goal) || goal <= 0) {
      setAccountError("El objetivo debe ser mayor que cero.");
      return;
    }
    onUpdateAccount(account.id, { goal });
    setGoalEditorId("");
    setGoalInput("");
    setAccountError("");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>FINANZAS PERSONALES</Text>
      <Text style={styles.title}>Mis finanzas</Text>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Disponible</Text>
          <Text style={styles.availableValue}>
            {(summary.available - summary.spent).toFixed(2)}€
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Gastado</Text>
          <Text style={styles.spentValue}>{summary.spent.toFixed(2)}€</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Cuentas de ahorro</Text>
            <Text style={styles.accountTotal}>
              {accounts
                .reduce(
                  (total, account) =>
                    total + calculateAccountBalance(account, movements),
                  0,
                )
                .toFixed(2)}
              €
            </Text>
          </View>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setEditingAccountId("");
              setShowAddAccount(!showAddAccount);
              setAccountError("");
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {showAddAccount ? "Cerrar" : "Añadir"}
            </Text>
          </Pressable>
        </View>

        {showAddAccount ? (
          <View style={styles.accountTransfer}>
            <Field
              label="Nombre de la cuenta"
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Por ejemplo, Fondo"
              maxLength={50}
            />
            <Field
              label={editingAccountId ? "Saldo actual (€)" : "Saldo inicial (€)"}
              value={accountBalance}
              onChangeText={setAccountBalance}
              placeholder="0,00"
              keyboardType="decimal-pad"
            />
            <Pressable style={styles.primaryButton} onPress={submitAccount}>
              <Text style={styles.primaryButtonText}>
                {editingAccountId ? "Guardar cambios" : "Guardar cuenta"}
              </Text>
            </Pressable>
            {editingAccountId ? (
              <Pressable
                style={styles.cancelAccountEdit}
                onPress={() => {
                  setEditingAccountId("");
                  setAccountName("");
                  setAccountBalance("");
                }}
              >
                <Text style={styles.cancelAccountEditText}>Cancelar</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {accounts.length === 0 ? (
          <Text style={styles.emptyText}>Aún no hay cuentas de ahorro.</Text>
        ) : (
          accounts.map((account) => {
            const balance = calculateAccountBalance(account, movements);
            const isWithdrawing =
              withdrawalAccountId === String(account.id);
            return (
              <View key={account.id} style={styles.accountRow}>
                <View style={styles.accountRowHeader}>
                  <View>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountBalance}>
                      {balance.toFixed(2)}€
                    </Text>
                    {Number(account.goal) > 0 ? (
                      <View style={styles.goalInfo}>
                        <View style={styles.goalTrack}>
                          <View
                            style={[
                              styles.goalFill,
                              {
                                width: `${Math.min(
                                  (balance / Number(account.goal)) * 100,
                                  100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.emptyText}>
                          Objetivo: {Number(account.goal).toFixed(2)}€ ·{" "}
                          {Math.floor(
                            Math.min(
                              (balance / Number(account.goal)) * 100,
                              100,
                            ),
                          )}
                          %
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.accountButtons}>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => {
                        setEditingAccountId(String(account.id));
                        setAccountName(account.name);
                        setAccountBalance(balance.toFixed(2));
                        setShowAddAccount(true);
                        setAccountError("");
                      }}
                    >
                      <Text style={styles.secondaryButtonText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => {
                        setWithdrawalAccountId(
                          isWithdrawing ? "" : String(account.id),
                        );
                        setAccountError("");
                      }}
                      disabled={balance <= 0}
                    >
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          balance <= 0 && styles.disabledText,
                        ]}
                      >
                        {isWithdrawing ? "Cancelar" : "Retirar"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => {
                        setGoalEditorId(
                          goalEditorId === String(account.id)
                            ? ""
                            : String(account.id),
                        );
                        setGoalInput(String(account.goal || ""));
                        setAccountError("");
                      }}
                    >
                      <Text style={styles.secondaryButtonText}>Objetivo</Text>
                    </Pressable>
                  </View>
                </View>
                {goalEditorId === String(account.id) ? (
                  <View style={styles.accountTransfer}>
                    <Field
                      label="Objetivo de ahorro (€)"
                      value={goalInput}
                      onChangeText={setGoalInput}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                    />
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => saveGoal(account)}
                    >
                      <Text style={styles.primaryButtonText}>Guardar objetivo</Text>
                    </Pressable>
                  </View>
                ) : null}
                {isWithdrawing ? (
                  <View style={styles.accountTransfer}>
                    <Field
                      label={`Importe a retirar (máx. ${balance.toFixed(2)}€)`}
                      value={withdrawalAmount}
                      onChangeText={setWithdrawalAmount}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                    />
                    <Field
                      label="Fecha (AAAA-MM-DD)"
                      value={withdrawalDate}
                      onChangeText={setWithdrawalDate}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => submitWithdrawal(account)}
                    >
                      <Text style={styles.primaryButtonText}>Registrar retiro</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
        {accountError ? <Text style={styles.errorText}>{accountError}</Text> : null}
      </View>

      <View style={styles.card}>
        <DateRangeFields
          startDate={dateInterval.startDate}
          endDate={dateInterval.endDate}
          onChange={onChangeDateInterval}
        />
      </View>
      <BudgetAlerts categories={spentCategories} />

      <View style={styles.card}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Principales gastos</Text>
          <Pressable onPress={() => onNavigate("categories")}>
            <Text style={styles.link}>Ver categorías</Text>
          </Pressable>
        </View>
        {spentCategories.length === 0 ? (
          <Text style={styles.emptyText}>No hay gastos en este periodo.</Text>
        ) : (
          spentCategories
            .filter(([, total]) => total > 0)
            .slice(0, 3)
            .map(([item, total]) => (
              <View key={item} style={styles.accountRowHeader}>
                <View style={styles.categorySummaryName}>
                  <CategoryIcon category={item} type="spent" />
                  <Text style={styles.accountName}>{item}</Text>
                </View>
                <Text style={styles.movementAmount}>
                  −{total.toFixed(2)}€
                </Text>
              </View>
            ))
        )}
        {categoryAlerts.length > 0 ? (
          <Text style={styles.emptyText}>
            {categoryAlerts.length} categoría(s) necesitan atención.
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Añadir un nuevo movimiento"
        onPress={() => onNavigate("addMovement")}
        style={styles.addMovementButton}
      >
        <View style={styles.addMovementIcon}>
          <Text style={styles.addMovementIconText}>＋</Text>
        </View>
        <View style={styles.addMovementCopy}>
          <Text style={styles.addMovementButtonText}>Nuevo movimiento</Text>
          <Text style={styles.addMovementDetail}>
            Registra un gasto o un ingreso
          </Text>
        </View>
        <Text style={styles.addMovementArrow}>›</Text>
      </Pressable>

      <View style={styles.card}>
        <SectionTitle detail={`${filteredMovements.length} en el periodo`}>
          Movimientos recientes
        </SectionTitle>
        {filteredMovements.length === 0 ? (
          <Text style={styles.emptyText}>
            {movements.length === 0
              ? "Registra tu primer movimiento para empezar."
              : "No hay movimientos en este periodo."}
          </Text>
        ) : (
          filteredMovements.slice(0, 5).map((movement) => {
            const isExpense =
              Number(movement.importe) < 0 ||
              movement.tipo === "savings-withdrawal";
            return (
              <Pressable
                key={movement.id}
                style={styles.movementRow}
                onPress={() => onSelectMovement?.(movement)}
              >
                <CategoryIcon
                  category={movement.categoria}
                  type={Number(movement.importe) > 0 ? "income" : "spent"}
                />
                <View style={styles.movementDescription}>
                  <Text style={styles.movementName}>{movement.nombre}</Text>
                  <Text style={styles.movementMeta}>
                    {movement.categoria} · {formatMovementDate(movement.fecha)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.movementAmount,
                    isExpense ? styles.spentText : styles.availableValue,
                  ]}
                >
                  {isExpense ? "−" : "+"}
                  {Math.abs(Number(movement.importe)).toFixed(2)}€
                </Text>
              </Pressable>
            );
          })
        )}
        {filteredMovements.length > 5 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate("movements")}
            style={styles.viewMovementsButton}
          >
            <Text style={styles.viewMovementsText}>
              Ver todos los movimientos
            </Text>
            <Text style={styles.viewMovementsArrow}>›</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.quickLinks}>
        <Pressable style={styles.secondaryButton} onPress={() => onNavigate("recurring")}>
          <Text style={styles.secondaryButtonText}>Recurrentes</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => onNavigate("backup")}>
          <Text style={styles.secondaryButtonText}>Copias</Text>
        </Pressable>
      </View>
      <Text style={styles.footerNote}>
        Los datos se guardan localmente en este dispositivo.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingTop: 28, paddingBottom: 44, gap: 14 },
  eyebrow: { color: COLORS.muted, fontSize: 11, letterSpacing: 1.5 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: "700" },
  addMovementButton: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#c6dfcc",
    borderRadius: 14,
    backgroundColor: "#eaf4ed",
  },
  addMovementIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: COLORS.green,
  },
  addMovementIconText: { color: "#fff", fontSize: 25, lineHeight: 29 },
  addMovementCopy: { flex: 1, gap: 3 },
  addMovementButtonText: { color: "#244b30", fontSize: 16, fontWeight: "700" },
  addMovementDetail: { color: "#55715c", fontSize: 12 },
  addMovementArrow: { color: COLORS.green, fontSize: 27 },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 18,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
  },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  availableValue: { color: COLORS.green, fontSize: 22, fontWeight: "700" },
  spentValue: { color: COLORS.red, fontSize: 22, fontWeight: "700" },
  spentText: { color: COLORS.red },
  summaryDivider: { height: 42, width: 1, backgroundColor: COLORS.border },
  card: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "700" },
  sectionDetail: { color: COLORS.muted, fontSize: 12 },
  link: { color: COLORS.green, fontSize: 12, fontWeight: "700" },
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
  accountTotal: { marginTop: 3, color: COLORS.green, fontSize: 20, fontWeight: "700" },
  accountRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e5e5", gap: 10 },
  accountRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  categorySummaryName: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  accountButtons: { flexDirection: "row", alignItems: "center", gap: 6 },
  accountName: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  accountBalance: { marginTop: 3, color: COLORS.green, fontSize: 15, fontWeight: "700" },
  goalInfo: { width: 180, maxWidth: "100%", gap: 4, marginTop: 5 },
  goalTrack: { height: 6, overflow: "hidden", borderRadius: 4, backgroundColor: "#e6e6e6" },
  goalFill: { height: "100%", borderRadius: 4, backgroundColor: "#77a98b" },
  quickLinks: { flexDirection: "row", justifyContent: "center", gap: 8 },
  disabledText: { opacity: 0.45 },
  cancelAccountEdit: { alignItems: "center", padding: 7 },
  cancelAccountEditText: { color: COLORS.muted, fontSize: 13 },
  emptyText: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  movementDescription: { flex: 1, gap: 3 },
  movementName: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  movementMeta: { color: COLORS.muted, fontSize: 12 },
  movementAmount: { fontSize: 14, fontWeight: "700" },
  viewMovementsButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 2,
    borderRadius: 8,
    backgroundColor: "#eaf4ed",
  },
  viewMovementsText: { color: COLORS.green, fontSize: 13, fontWeight: "700" },
  viewMovementsArrow: { color: COLORS.green, fontSize: 20, lineHeight: 22 },
  footerNote: { color: COLORS.muted, fontSize: 12, textAlign: "center" },
});
