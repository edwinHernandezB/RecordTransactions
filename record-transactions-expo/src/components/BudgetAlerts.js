import { StyleSheet, Text, View } from "react-native";
import CategoryIcon from "./CategoryIcon";
import { getBudgetAlerts } from "../finance";

export default function BudgetAlerts({ categories }) {
  const alerts = getBudgetAlerts(categories);
  if (alerts.length === 0) return null;

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Text style={styles.title}>Avisos de presupuesto</Text>
      <Text style={styles.caption}>Aviso al alcanzar el 80 % del límite.</Text>
      {alerts.map((alert) => (
        <View
          key={alert.category}
          style={[
            styles.alert,
            alert.exceeded > 0 && styles.exceeded,
          ]}
        >
          <View style={styles.heading}>
            <CategoryIcon category={alert.category} type="spent" />
            <Text style={styles.name}>{alert.category}</Text>
          </View>
          <Text style={styles.detail}>
            {alert.exceeded > 0
              ? `Superado por ${alert.exceeded.toFixed(2)}€`
              : `Utilizado el ${Math.floor(alert.percent)} %`}
            {` · ${alert.amount.toFixed(2)}€ de ${alert.limit.toFixed(2)}€`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 7,
    borderWidth: 1,
    borderColor: "#e2c57a",
    borderRadius: 10,
    backgroundColor: "#fff9e8",
  },
  title: { color: "#4a3a16", fontSize: 14, fontWeight: "700" },
  caption: { color: "#686868", fontSize: 11 },
  alert: {
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#e0b84e",
    backgroundColor: "#fff",
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 7 },
  exceeded: { borderLeftColor: "#c62828", backgroundColor: "#fff2f0" },
  name: { color: "#202020", fontSize: 12, fontWeight: "700" },
  detail: { marginTop: 2, color: "#514a3b", fontSize: 11 },
});
