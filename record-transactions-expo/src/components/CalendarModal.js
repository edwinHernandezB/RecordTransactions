import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { getTodayDate, isValidDate } from "../finance";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_FORMAT = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});
const MONTH_ONLY_FORMAT = new Intl.DateTimeFormat("es-ES", {
  month: "long",
});

function toIsoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIsoDate(value) {
  if (!isValidDate(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function CalendarModal({
  visible,
  value,
  label = "fecha",
  onSelect,
  onClose,
}) {
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const initialDate = parseIsoDate(value) || parseIsoDate(getTodayDate());
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });

  useEffect(() => {
    if (!visible) return;
    const initialDate = parseIsoDate(value) || parseIsoDate(getTodayDate());
    setDisplayedMonth(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
  }, [value, visible]);

  const selectedDate = parseIsoDate(value);
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (displayedMonth.getDay() + 6) % 7;
  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const changeMonth = (offset) => {
    setDisplayedMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };
  const isSelectedDay = (day) =>
    selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === month &&
    selectedDate?.getFullYear() === year;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityLabel={`Calendario: ${label.toLocaleLowerCase("es")}`}
          style={styles.calendar}
        >
          <View style={styles.calendarHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              onPress={() => changeMonth(-1)}
              hitSlop={8}
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
              hitSlop={8}
              style={styles.monthButton}
            >
              <Text style={styles.monthArrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.daysGrid}>
            {WEEKDAYS.map((weekday, index) => (
              <Text
                accessibilityLabel={
                  [
                    "lunes",
                    "martes",
                    "miércoles",
                    "jueves",
                    "viernes",
                    "sábado",
                    "domingo",
                  ][index]
                }
                key={weekday}
                style={styles.weekday}
              >
                {weekday}
              </Text>
            ))}
            {calendarCells.map((day, index) =>
              day ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelectedDay(day) }}
                  accessibilityLabel={`${day} de ${MONTH_ONLY_FORMAT.format(displayedMonth)}`}
                  key={day}
                  onPress={() => onSelect(toIsoDate(year, month, day))}
                  style={[
                    styles.dayButton,
                    isSelectedDay(day) && styles.selectedDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelectedDay(day) && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              ) : (
                <View key={`empty-${index}`} style={styles.dayButton} />
              ),
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  calendar: {
    width: "100%",
    maxWidth: 360,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#fff",
    gap: 14,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: { minWidth: 40, alignItems: "center" },
  monthArrow: { color: "#202020", fontSize: 30, lineHeight: 34 },
  monthTitle: {
    color: "#202020",
    fontSize: 17,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: {
    width: "14.2857%",
    paddingVertical: 8,
    color: "#686868",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  dayButton: {
    width: "14.2857%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  selectedDay: { backgroundColor: "#34764a" },
  dayText: { color: "#202020", fontSize: 14 },
  selectedDayText: { color: "#fff", fontWeight: "700" },
  closeButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  closeText: { color: "#202020", fontSize: 14, fontWeight: "600" },
});
