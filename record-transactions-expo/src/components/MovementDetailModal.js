import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import CategoryIcon from "./CategoryIcon";
import CalendarModal from "./CalendarModal";
import { createEditedMovement, formatMovementDate } from "../finance";

export default function MovementDetailModal({
  movement,
  categories,
  onClose,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(movement?.nombre || "");
  const [category, setCategory] = useState(movement?.categoria || "");
  const [date, setDate] = useState(String(movement?.fecha || "").slice(0, 10));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [amount, setAmount] = useState(
    String(Math.abs(Number(movement?.importe) || 0)),
  );

  useEffect(() => {
    setEditing(false);
    setName(movement?.nombre || "");
    setCategory(movement?.categoria || "");
    setDate(String(movement?.fecha || "").slice(0, 10));
    setCalendarVisible(false);
    setAmount(String(Math.abs(Number(movement?.importe) || 0)));
  }, [movement]);

  if (!movement) return null;
  const isWithdrawal = movement.tipo === "savings-withdrawal";
  const isIncome =
    Number(movement.importe) > 0 && movement.tipo !== "savings-withdrawal";
  const options = categories[isIncome ? "income" : "spent"] || [];
  const amountNumber = Number(String(amount).replace(",", "."));

  const save = () => {
    const updated = createEditedMovement(movement, {
      name,
      category,
      date,
      amount,
    });
    if (!updated) {
      Alert.alert("Datos no válidos", "Revisa el nombre, la categoría, la fecha y el importe.");
      return;
    }
    onSave(updated);
    setEditing(false);
  };

  const confirmDelete = () => {
    Alert.alert("Eliminar movimiento", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => onDelete(movement.id),
      },
    ]);
  };

  return (
    <>
      <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.sheet}>
            <View style={styles.heading}>
              {!editing ? (
                <CategoryIcon
                  category={movement.categoria}
                  type={isIncome ? "income" : "spent"}
                />
              ) : null}
              <Text style={styles.title}>
                {editing ? "Editar movimiento" : movement.nombre}
              </Text>
              <Pressable onPress={onClose} style={styles.close}>
                <Text style={styles.closeText}>Cerrar</Text>
              </Pressable>
            </View>
            {editing ? (
              <>
                <Field label="Nombre" value={name} onChangeText={setName} />
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.chips}>
                  {options.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setCategory(item)}
                      style={[styles.chip, category === item && styles.chipSelected]}
                    >
                      <CategoryIcon category={item} type={isIncome ? "income" : "spent"} />
                      <Text style={styles.chipText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
                <Field
                  label="Fecha (AAAA-MM-DD)"
                  value={date}
                  onChangeText={setDate}
                  maxLength={10}
                  onCalendarPress={() => setCalendarVisible(true)}
                />
                <Field
                  label="Importe (€)"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                {isWithdrawal && (
                  <Text style={styles.note}>
                    Retiro asociado a la cuenta {movement.savingsAccountId}.
                  </Text>
                )}
                <Pressable style={styles.primary} onPress={save}>
                  <Text style={styles.primaryText}>Guardar cambios</Text>
                </Pressable>
                <Pressable style={styles.cancel} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelText}>Cancelar edición</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
                  {isIncome ? "+" : "−"}
                  {Math.abs(Number(movement.importe)).toFixed(2)}€
                </Text>
                <Text style={styles.note}>
                  {movement.categoria || "Sin categoría"} ·{" "}
                  {formatMovementDate(movement.fecha)}
                </Text>
                {Number(movement.savingsTransferAmount) > 0 && (
                  <Text style={styles.note}>
                    Transferido al ahorro:{" "}
                    {Number(movement.savingsTransferAmount).toFixed(2)}€
                  </Text>
                )}
                {isWithdrawal && (
                  <Text style={styles.note}>
                    Retirado de la cuenta {movement.savingsAccountId}.
                  </Text>
                )}
                <Pressable style={styles.primary} onPress={() => setEditing(true)}>
                  <Text style={styles.primaryText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.delete} onPress={confirmDelete}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </View>
      </Modal>
      <CalendarModal
        visible={calendarVisible}
        value={date}
        label="fecha del movimiento"
        onSelect={(value) => {
          setDate(value);
          setCalendarVisible(false);
        }}
        onClose={() => setCalendarVisible(false)}
      />
    </>
  );
}

function Field({ label, onCalendarPress, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {onCalendarPress ? (
        <View style={styles.dateInputRow}>
          <TextInput
            {...props}
            style={[styles.input, styles.dateInput]}
            placeholderTextColor="#888"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Elegir fecha del movimiento"
            onPress={onCalendarPress}
            style={styles.calendarButton}
          >
            <Text style={styles.calendarIcon}>▦</Text>
          </Pressable>
        </View>
      ) : (
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor="#888"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  scroll: { flexGrow: 1, justifyContent: "flex-end" },
  sheet: { padding: 20, gap: 13, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: "#f2f2f2" },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { flex: 1, color: "#202020", fontSize: 20, fontWeight: "700" },
  close: { padding: 8 },
  closeText: { color: "#686868", fontSize: 13 },
  amount: { fontSize: 24, fontWeight: "700" },
  income: { color: "#34764a" },
  expense: { color: "#c62828" },
  note: { color: "#686868", fontSize: 13, lineHeight: 18 },
  field: { gap: 5 },
  label: { color: "#202020", fontSize: 13, fontWeight: "600" },
  dateInputRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateInput: { flex: 1 },
  calendarButton: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  calendarIcon: { color: "#686868", fontSize: 18 },
  input: { minHeight: 44, paddingHorizontal: 11, borderWidth: 1, borderColor: "#d3d3d3", borderRadius: 8, backgroundColor: "#fff", color: "#202020" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: "#d3d3d3", borderRadius: 18, backgroundColor: "#fff" },
  chipSelected: { borderColor: "#34764a", backgroundColor: "#eaf4ed" },
  chipText: { color: "#202020", fontSize: 12 },
  primary: { minHeight: 45, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#111" },
  primaryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  cancel: { alignItems: "center", padding: 8 },
  cancelText: { color: "#555", fontSize: 13 },
  delete: { alignItems: "center", padding: 10 },
  deleteText: { color: "#a61f1f", fontSize: 14, fontWeight: "700" },
});
