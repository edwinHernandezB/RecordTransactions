import { StyleSheet, Text, View } from "react-native";
import { getCategoryIcon } from "../finance";

export default function CategoryIcon({
  category,
  type = "spent",
  size = "small",
}) {
  const icon = getCategoryIcon(category, type);
  return (
    <View
      accessible
      accessibilityLabel={`Icono de ${category || "categoría"}`}
      style={[styles.container, size === "large" && styles.large]}
    >
      <Text style={[styles.icon, size === "large" && styles.largeIcon]}>
        {icon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#f2f2f2",
  },
  large: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#eaf4ed",
  },
  icon: { fontSize: 16 },
  largeIcon: { fontSize: 22 },
});
