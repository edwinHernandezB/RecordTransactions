import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CalendarModal from "./CalendarModal";
import { getCurrentMonthInterval, getTodayDate } from "../finance";

const MONTH_FORMAT = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});
const RANGE_DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return RANGE_DATE_FORMAT.format(new Date(year, month - 1, day));
}

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
  const [isExpanded, setIsExpanded] = useState(false);
  const monthAnchor = startDate || endDate || getTodayDate();
  const [anchorYear, anchorMonth] = monthAnchor.split("-").map(Number);
  const displayedMonth = new Date(anchorYear, anchorMonth - 1, 1);
  const displayedMonthInterval = getCurrentMonthInterval(displayedMonth);
  const isWholeMonth =
    startDate === displayedMonthInterval.startDate &&
    endDate === displayedMonthInterval.endDate;
  const periodSummary = isWholeMonth
    ? MONTH_FORMAT.format(displayedMonth)
    : startDate || endDate
      ? `${startDate ? formatDate(startDate) : "Inicio"} – ${endDate ? formatDate(endDate) : "Fin"}`
      : MONTH_FORMAT.format(displayedMonth);
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

  const changeMonth = (offset) => {
    const target = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() + offset,
      1,
    );
    onChange(getCurrentMonthInterval(target));
  };
  const selectCurrentMonth = () =>
    onChange(getCurrentMonthInterval(new Date()));

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`Periodo: ${periodSummary}. ${isExpanded ? "Contraer" : "Desplegar"} filtros`}
        onPress={() => setIsExpanded((expanded) => !expanded)}
        style={styles.heading}
      >
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Periodo</Text>
          <Text style={styles.periodSummary}>{periodSummary}</Text>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? "⌃" : "⌄"}</Text>
      </Pressable>
      {isExpanded ? (
        <View style={styles.expandedContent}>
          <View style={styles.expandedHeading}>
            <Text style={styles.expandedTitle}>Filtrar por periodo</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mostrar el mes actual"
              onPress={selectCurrentMonth}
              style={styles.currentMonthButton}
            >
              <Text style={styles.currentMonthText}>Mes actual</Text>
            </Pressable>
          </View>
          <View style={styles.monthNavigation}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              onPress={() => changeMonth(-1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthArrow}>‹</Text>
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTH_FORMAT.format(displayedMonth)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              onPress={() => changeMonth(1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthArrow}>›</Text>
            </Pressable>
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
          <Text style={styles.hint}>
            Elige las fechas para definir un rango personalizado.
          </Text>
        </View>
      ) : null}

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
  container: { gap: 10 },
  heading: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    gap: 12,
  },
  headingCopy: { flex: 1, gap: 2 },
  title: { color: "#202020", fontSize: 14, fontWeight: "700" },
  periodSummary: {
    color: "#686868",
    fontSize: 12,
    textTransform: "capitalize",
  },
  expandIcon: {
    width: 30,
    color: "#34764a",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  expandedContent: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  expandedHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  expandedTitle: { color: "#686868", fontSize: 12, fontWeight: "600" },
  currentMonthButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  currentMonthText: { color: "#34764a", fontSize: 12, fontWeight: "700" },
  monthNavigation: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  monthButton: {
    width: 38,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  monthArrow: { color: "#34764a", fontSize: 28, lineHeight: 32 },
  monthTitle: {
    minWidth: 140,
    color: "#202020",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "capitalize",
  },
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
  hint: { color: "#686868", fontSize: 11 },
});
