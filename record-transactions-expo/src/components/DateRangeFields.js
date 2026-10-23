import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CalendarModal from "./CalendarModal";

function DateField({ label, value, onPress }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.fieldRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Elegir fecha ${label.toLocaleLowerCase("es")}`}
          onPress={onPress}
          style={styles.dateButton}
        >
          <Text style={[styles.dateText, !value && styles.placeholder]}>
            {value || "AAAA-MM-DD"}
          </Text>
          <Text style={styles.calendarIcon}>▦</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DateRangeFields({ startDate, endDate, onChange }) {
  const [activeField, setActiveField] = useState("");
  const activeDate =
    activeField === "startDate"
      ? startDate
      : activeField === "endDate"
        ? endDate
        : "";

  const selectDate = (value) => {
    onChange({
      startDate: activeField === "startDate" ? value : startDate,
      endDate: activeField === "endDate" ? value : endDate,
    });
    setActiveField("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>Periodo</Text>
        {startDate || endDate ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onChange({ startDate: "", endDate: "" })}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Limpiar fechas</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.row}>
        <DateField
          label="Desde"
          value={startDate}
          onPress={() => setActiveField("startDate")}
        />
        <DateField
          label="Hasta"
          value={endDate}
          onPress={() => setActiveField("endDate")}
        />
      </View>
      <Text style={styles.hint}>Deja ambas fechas vacías para ver todo.</Text>

      <CalendarModal
        visible={Boolean(activeField)}
        value={activeDate}
        label={activeField === "startDate" ? "fecha desde" : "fecha hasta"}
        onSelect={selectDate}
        onClose={() => setActiveField("")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { color: "#202020", fontSize: 14, fontWeight: "700" },
  row: { flexDirection: "row", gap: 8 },
  field: { flex: 1, gap: 4 },
  label: { color: "#686868", fontSize: 12 },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateButton: {
    minHeight: 42,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 7,
    backgroundColor: "#fff",
  },
  dateText: { color: "#202020", fontSize: 13 },
  placeholder: { color: "#888" },
  calendarIcon: { color: "#686868", fontSize: 16 },
  clearButton: { minHeight: 32, justifyContent: "center", paddingHorizontal: 4 },
  clearText: { color: "#34764a", fontSize: 12, fontWeight: "700" },
  hint: { color: "#686868", fontSize: 11 },
});
