import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CategoryIcon from "../components/CategoryIcon";
import { formatMovementDate } from "../finance";

const FREQUENCIES = {
  weekly: "Cada semana",
  monthly: "Cada mes",
  yearly: "Cada año",
};

export default function RecurringScreen({ rules, onRemove, onBack }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>Movimientos recurrentes</Text>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>
      <Text style={styles.description}>
        Se crean automáticamente al abrir la app en su fecha programada. Si la
        app estuvo cerrada, se recuperan las ocurrencias pendientes.
      </Text>
      {rules.length === 0 ? (
        <Text style={styles.empty}>
          No hay reglas todavía. Activa «Repetir automáticamente» al registrar
          un movimiento.
        </Text>
      ) : (
        rules.map((rule) => (
          <View style={styles.row} key={rule.id}>
            <CategoryIcon
              category={rule.categoria}
              type={Number(rule.importe) > 0 ? "income" : "spent"}
            />
            <View style={styles.details}>
              <Text style={styles.name}>{rule.nombre}</Text>
              <Text style={styles.meta}>
                {rule.categoria} · {FREQUENCIES[rule.frequency] || "Recurrente"}
              </Text>
              <Text style={styles.meta}>
                Próximo {formatMovementDate(rule.nextDate)}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                Number(rule.importe) < 0 ? styles.expense : styles.income,
              ]}
            >
              {Number(rule.importe) < 0 ? "−" : "+"}
              {Math.abs(Number(rule.importe)).toFixed(2)}€
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar recurrencia de ${rule.nombre}`}
              onPress={() => onRemove(rule.id)}
              style={styles.remove}
            >
              <Text style={styles.removeText}>Eliminar</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40, gap: 12 },
  title: { color: "#202020", fontSize: 26, fontWeight: "700" },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  backButton: { padding: 8 },
  backText: { color: "#34764a", fontSize: 13, fontWeight: "700" },
  description: { color: "#686868", fontSize: 13, lineHeight: 19 },
  empty: { padding: 14, color: "#686868", fontSize: 13, lineHeight: 19 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  details: { flex: 1, gap: 3 },
  name: { color: "#202020", fontSize: 14, fontWeight: "700" },
  meta: { color: "#686868", fontSize: 12 },
  amount: { fontSize: 13, fontWeight: "700" },
  expense: { color: "#c62828" },
  income: { color: "#34764a" },
  remove: { padding: 7 },
  removeText: { color: "#a61f1f", fontSize: 12, fontWeight: "600" },
});
