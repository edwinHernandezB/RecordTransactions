import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import FinanceScreen from "./src/components/FinanceScreen";
import MovementDetailModal from "./src/components/MovementDetailModal";
import AddMovementScreen from "./src/screens/AddMovementScreen";
import BackupScreen from "./src/screens/BackupScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import MovementsScreen from "./src/screens/MovementsScreen";
import RecurringScreen from "./src/screens/RecurringScreen";
import {
  calculateAccountBalance,
  DEFAULT_CATEGORIES,
  generateDueMovements,
  getCategoryIcon,
  getCurrentMonthInterval,
  getTodayDate,
  normalizeCategories,
} from "./src/finance";

const STORAGE_KEYS = {
  movements: "movements",
  accounts: "savingsAccounts",
  categories: "categories",
  recurring: "recurringMovements",
};

const MAIN_TABS = [
  ["home", "Inicio"],
  ["movements", "Movimientos"],
  ["categories", "Categorías"],
  ["more", "Más"],
];

function parseStoredValue(value, fallback, key) {
  if (value == null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`No se pudieron leer los datos guardados (${key}).`);
  }
}

function normalizeAccounts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((account) => account && account.id != null && account.name)
    .map((account) => ({
      id: String(account.id),
      name: String(account.name).trim(),
      openingBalance: Math.max(
        Number(account.openingBalance ?? account.balance) || 0,
        0,
      ),
      goal: Math.max(Number(account.goal) || 0, 0),
    }))
    .filter((account) => account.name);
}

function normalizeRecurringMovements(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (rule) =>
        rule &&
        rule.id != null &&
        rule.nombre &&
        rule.categoria &&
        ["weekly", "monthly", "yearly"].includes(rule.frequency),
    )
    .map((rule) => ({
      ...rule,
      id: String(rule.id),
      nombre: String(rule.nombre).trim(),
      categoria: String(rule.categoria).trim(),
      importe: Number(rule.importe),
      savingsTransferAmount: Number(rule.savingsTransferAmount) || 0,
      dayOfMonth: Number(rule.dayOfMonth) || 1,
      monthOfYear: Number(rule.monthOfYear) || 0,
      nextDate: String(rule.nextDate || ""),
    }))
    .filter(
      (rule) =>
        rule.nombre &&
        rule.categoria &&
        Number.isFinite(rule.importe) &&
        rule.importe !== 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(rule.nextDate),
    );
}

function normalizeMovements(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((movement) => movement && Number.isFinite(Number(movement.importe)))
    .map((movement) => ({
      ...movement,
      importe: Number(movement.importe),
      id: movement.id ?? `movement-${Date.now()}-${Math.random()}`,
      savingsAccountId: movement.savingsAccountId
        ? String(movement.savingsAccountId)
        : "",
      savingsTransferAmount: Number(movement.savingsTransferAmount) || 0,
      savingsWithdrawalAmount: Number(movement.savingsWithdrawalAmount) || 0,
    }));
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [movements, setMovements] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState(() =>
    normalizeCategories(DEFAULT_CATEGORIES),
  );
  const [recurringMovements, setRecurringMovements] = useState([]);
  const [dateInterval, setDateInterval] = useState(getCurrentMonthInterval);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [screen, setScreen] = useState("home");
  const [selectedMovement, setSelectedMovement] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const storedEntries = await AsyncStorage.multiGet(
          Object.values(STORAGE_KEYS),
        );
        const values = Object.fromEntries(storedEntries);
        const loadedMovements = parseStoredValue(
          values[STORAGE_KEYS.movements],
          [],
          STORAGE_KEYS.movements,
        );
        const loadedAccounts = parseStoredValue(
          values[STORAGE_KEYS.accounts],
          [],
          STORAGE_KEYS.accounts,
        );
        const loadedCategories = parseStoredValue(
          values[STORAGE_KEYS.categories],
          DEFAULT_CATEGORIES,
          STORAGE_KEYS.categories,
        );
        const loadedRecurring = parseStoredValue(
          values[STORAGE_KEYS.recurring],
          [],
          STORAGE_KEYS.recurring,
        );
        if (!Array.isArray(loadedMovements) || !Array.isArray(loadedAccounts)) {
          throw new Error("El formato de los datos guardados no es válido.");
        }

        if (isMounted) {
          setMovements(normalizeMovements(loadedMovements));
          setAccounts(normalizeAccounts(loadedAccounts));
          setCategories(normalizeCategories(loadedCategories));
          setRecurringMovements(normalizeRecurringMovements(loadedRecurring));
          setDateInterval(getCurrentMonthInterval());
          setCanPersist(true);
        }
      } catch (error) {
        if (isMounted) {
          setStorageError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los datos de este dispositivo.",
          );
        }
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const generateScheduledMovements = useCallback(() => {
    const due = generateDueMovements(
      recurringMovements,
      movements,
      getTodayDate(),
    );
    const rulesChanged = due.rules.some(
      (rule, index) => rule.nextDate !== recurringMovements[index]?.nextDate,
    );
    if (due.movements.length > 0) {
      setMovements((current) => {
        const existing = new Set(current.map((movement) => String(movement.id)));
        return [
          ...due.movements.filter(
            (movement) => !existing.has(String(movement.id)),
          ),
          ...current,
        ];
      });
    }
    if (rulesChanged) setRecurringMovements(due.rules);
  }, [movements, recurringMovements]);

  useEffect(() => {
    if (!isLoaded || !canPersist) return undefined;
    generateScheduledMovements();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") generateScheduledMovements();
    });
    const timer = setInterval(generateScheduledMovements, 60_000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [canPersist, generateScheduledMovements, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !canPersist) return;

    AsyncStorage.multiSet([
      [STORAGE_KEYS.movements, JSON.stringify(movements)],
      [STORAGE_KEYS.accounts, JSON.stringify(accounts)],
      [STORAGE_KEYS.categories, JSON.stringify(categories)],
      [STORAGE_KEYS.recurring, JSON.stringify(recurringMovements)],
    ])
      .then(() => setStorageError(""))
      .catch((error) => {
        setStorageError(
          error instanceof Error
            ? `No se pudieron guardar los cambios: ${error.message}`
            : "No se pudieron guardar los cambios en este dispositivo.",
        );
      });
  }, [
    accounts,
    canPersist,
    categories,
    isLoaded,
    movements,
    recurringMovements,
  ]);

  const updateCategoryLimit = (category, limit, type) => {
    setCategories((current) => {
      const existing = current.some(
        (item) => item.category === category && item.type === type,
      );
      return existing
        ? current.map((item) =>
            item.category === category && item.type === type
              ? { ...item, limit }
              : item,
          )
        : [...current, { category, type, limit }];
    });
  };

  const importBackup = (data) => {
    const incomingAccounts = data.cuentasAhorro ?? data.savingsAccounts;
    const incomingRecurring =
      data.movimientosRecurrentes ?? data.recurringMovements;
    const incomingCategories =
      data.listaCategorias ?? data.categoria ?? categories;
    setMovements(normalizeMovements(data.movimientos));
    if (Array.isArray(incomingAccounts)) {
      setAccounts(normalizeAccounts(incomingAccounts));
    }
    setCategories((current) =>
      normalizeCategories([...current, ...incomingCategories]),
    );
    if (Array.isArray(incomingRecurring)) {
      setRecurringMovements(normalizeRecurringMovements(incomingRecurring));
    }
  };

  const openMovement = (movement) => setSelectedMovement(movement);
  const saveMovement = (updatedMovement) => {
    if (selectedMovement?.tipo === "savings-withdrawal") {
      const account = accounts.find(
        (item) =>
          String(item.id) === String(selectedMovement.savingsAccountId),
      );
      const available =
        account == null
          ? 0
          : calculateAccountBalance(account, movements) +
            Math.abs(Number(selectedMovement.importe) || 0);
      if (Number(updatedMovement.importe) > available) {
        Alert.alert(
          "Saldo insuficiente",
          `El importe no puede superar ${available.toFixed(2)}€.`,
        );
        return;
      }
    }
    setMovements((current) =>
      current.map((movement) =>
        String(movement.id) === String(updatedMovement.id)
          ? updatedMovement
          : movement,
      ),
    );
    setSelectedMovement(updatedMovement);
  };
  const deleteMovement = (movementId) => {
    setMovements((current) =>
      current.filter((movement) => String(movement.id) !== String(movementId)),
    );
    setSelectedMovement(null);
  };

  const renderScreen = () => {
    if (screen === "home") {
      return (
        <FinanceScreen
          movements={movements}
          accounts={accounts}
          categories={categories}
          onAddAccount={(account) =>
            setAccounts((current) => [...current, account])
          }
          onWithdraw={(movement) =>
            setMovements((current) => [movement, ...current])
          }
          onUpdateAccount={(accountId, changes) =>
            setAccounts((current) =>
              current.map((account) =>
                String(account.id) === String(accountId)
                  ? { ...account, ...changes }
                  : account,
              ),
            )
          }
          onSelectMovement={openMovement}
          dateInterval={dateInterval}
          onChangeDateInterval={setDateInterval}
          onNavigate={setScreen}
        />
      );
    }
    if (screen === "addMovement") {
      return (
        <AddMovementScreen
          accounts={accounts}
          categories={categories}
          onAddMovement={(movement) =>
            setMovements((current) => [movement, ...current])
          }
          onAddCategory={(type, category) =>
            setCategories((current) =>
              current.some(
                (item) =>
                  item.type === type &&
                  item.category.toLocaleLowerCase("es") ===
                    category.toLocaleLowerCase("es"),
              )
                ? current
                : [
                    ...current,
                    {
                      category,
                      type,
                      limit: 0,
                      icon: getCategoryIcon(category, type),
                    },
                  ],
            )
          }
          onAddRecurring={(rule) =>
            setRecurringMovements((current) => [...current, rule])
          }
          onBack={() => setScreen("home")}
        />
      );
    }
    if (screen === "movements") {
      return (
        <MovementsScreen
          movements={movements}
          onSelectMovement={openMovement}
          dateInterval={dateInterval}
          onChangeDateInterval={setDateInterval}
        />
      );
    }
    if (screen === "categories") {
      return (
        <CategoriesScreen
          movements={movements}
          categories={categories}
          onSaveLimit={updateCategoryLimit}
          dateInterval={dateInterval}
          onChangeDateInterval={setDateInterval}
        />
      );
    }
    if (screen === "recurring") {
      return (
        <RecurringScreen
          rules={recurringMovements}
          onBack={() => setScreen("more")}
          onRemove={(ruleId) =>
            setRecurringMovements((current) =>
              current.filter((rule) => rule.id !== String(ruleId)),
            )
          }
        />
      );
    }
    if (screen === "backup") {
      return (
        <BackupScreen
          movements={movements}
          categories={categories}
          accounts={accounts}
          recurringMovements={recurringMovements}
          onImport={importBackup}
          onBack={() => setScreen("more")}
        />
      );
    }
    return (
      <View style={styles.moreScreen}>
        <Text style={styles.moreTitle}>Más opciones</Text>
        <Pressable
          onPress={() => setScreen("recurring")}
          style={styles.moreButton}
        >
          <Text style={styles.moreButtonTitle}>Movimientos recurrentes</Text>
          <Text style={styles.moreButtonDetail}>
            {recurringMovements.length} reglas activas
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setScreen("backup")}
          style={styles.moreButton}
        >
          <Text style={styles.moreButtonTitle}>Copias de seguridad</Text>
          <Text style={styles.moreButtonDetail}>
            Importar o exportar todos tus datos
          </Text>
        </Pressable>
        <Text style={styles.moreHint}>
          Los datos se guardan localmente. Importa aquí un JSON exportado desde
          la aplicación web para trasladar tus datos.
        </Text>
      </View>
    );
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loading} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#34764a" />
        <Text style={styles.loadingText}>Cargando tus finanzas…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      {storageError ? (
        <View accessibilityRole="alert" style={styles.storageError}>
          <Text style={styles.storageErrorText}>{storageError}</Text>
        </View>
      ) : null}
      <View style={styles.screen}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {MAIN_TABS.map(([route, title]) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              selected:
                screen === route ||
                (route === "more" &&
                  ["more", "recurring", "backup"].includes(screen)),
            }}
            key={route}
            onPress={() => setScreen(route)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                (screen === route ||
                  (route === "more" &&
                    ["more", "recurring", "backup"].includes(screen))) &&
                  styles.tabTextActive,
              ]}
            >
              {title}
            </Text>
          </Pressable>
        ))}
      </View>
      <MovementDetailModal
        movement={selectedMovement}
        categories={{
          spent: categories
            .filter((item) => item.type === "spent")
            .map((item) => item.category),
          income: categories
            .filter((item) => item.type === "income")
            .map((item) => item.category),
        }}
        onClose={() => setSelectedMovement(null)}
        onSave={saveMovement}
        onDelete={deleteMovement}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#f2f2f2" },
  screen: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#f2f2f2",
  },
  loadingText: { color: "#555", fontSize: 14 },
  storageError: {
    padding: 10,
    backgroundColor: "#fff2f0",
    borderBottomWidth: 1,
    borderBottomColor: "#c62828",
  },
  storageErrorText: { color: "#a61f1f", fontSize: 13 },
  tabBar: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: "#d3d3d3",
    backgroundColor: "#fff",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
  tabText: { color: "#686868", fontSize: 11 },
  tabTextActive: { color: "#202020", fontWeight: "700" },
  moreScreen: { flex: 1, padding: 18, gap: 12 },
  moreTitle: { color: "#202020", fontSize: 26, fontWeight: "700" },
  moreButton: {
    gap: 4,
    padding: 15,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  moreButtonTitle: { color: "#202020", fontSize: 15, fontWeight: "700" },
  moreButtonDetail: { color: "#686868", fontSize: 12 },
  moreHint: { marginTop: 4, color: "#686868", fontSize: 12, lineHeight: 18 },
});
