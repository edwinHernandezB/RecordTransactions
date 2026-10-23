import { useState } from "react";
import { File as ExpoFile } from "expo-file-system";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

const BACKUP_DIRECTORY_KEY = "backupDirectoryUri";

function createBackup(movements, categories, accounts, recurringMovements) {
  return {
    movimientos: movements,
    listaCategorias: categories.map((item) => ({
      categoria: item.category,
      tipo: item.type === "income" ? "income" : "spent",
      limit: Number(item.limit) || 0,
      icon: item.icon,
    })),
    cuentasAhorro: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      openingBalance: Number(account.openingBalance) || 0,
      goal: Number(account.goal) || 0,
    })),
    movimientosRecurrentes: recurringMovements,
  };
}

function isValidBackup(data) {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.movimientos) &&
    (data.listaCategorias === undefined ||
      Array.isArray(data.listaCategorias) ||
      Array.isArray(data.categoria)) &&
    (data.cuentasAhorro === undefined ||
      Array.isArray(data.cuentasAhorro) ||
      Array.isArray(data.savingsAccounts)) &&
    (data.movimientosRecurrentes === undefined ||
      Array.isArray(data.movimientosRecurrentes) ||
      Array.isArray(data.recurringMovements))
  );
}

function downloadBackup(content) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `record-transactions-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showMessage(title, message) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

async function readBackupFile(file) {
  if (Platform.OS === "web") {
    if (file.file && typeof file.file.text === "function") {
      return file.file.text();
    }
    if (!file.uri) {
      throw new Error("No se pudo acceder al archivo seleccionado.");
    }
    const response = await fetch(file.uri);
    if (!response.ok) {
      throw new Error("No se pudo leer el archivo seleccionado.");
    }
    return response.text();
  }
  return file.text();
}

async function saveBackup(content) {
  const fileName = `record-transactions-backup-${Date.now()}`;
  if (Platform.OS === "android") {
    let directoryUri = await AsyncStorage.getItem(BACKUP_DIRECTORY_KEY);
    if (!directoryUri) {
      const initialUri =
        FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("Download");
      const permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
          initialUri,
        );
      if (!permission.granted) return false;
      directoryUri = permission.directoryUri;
      await AsyncStorage.setItem(BACKUP_DIRECTORY_KEY, directoryUri);
    }
    const uri = await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName,
      "application/json",
    );
    await FileSystem.StorageAccessFramework.writeAsStringAsync(uri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return true;
  }

  const directory = FileSystem.documentDirectory;
  if (!directory) {
    throw new Error("No hay un directorio disponible para guardar la copia.");
  }
  await FileSystem.writeAsStringAsync(
    `${directory}${fileName}.json`,
    content,
    { encoding: FileSystem.EncodingType.UTF8 },
  );
  return true;
}

export default function BackupScreen({
  movements,
  categories,
  accounts,
  recurringMovements,
  onImport,
  onBack,
}) {
  const [busy, setBusy] = useState(false);

  const exportBackup = async () => {
    setBusy(true);
    try {
      const backup = createBackup(
        movements,
        categories,
        accounts,
        recurringMovements,
      );
      const content = JSON.stringify(backup, null, 2);
      if (Platform.OS === "web") {
        downloadBackup(content);
        return;
      }
      const saved = await saveBackup(content);
      if (saved) {
        showMessage(
          "Copia guardada",
          Platform.OS === "android"
            ? "La copia JSON se guardó en la carpeta elegida."
            : "La copia JSON se guardó en los documentos de la aplicación.",
        );
      }
    } catch (error) {
      showMessage(
        "No se pudo exportar",
        error instanceof Error ? error.message : "Error desconocido.",
      );
    } finally {
      setBusy(false);
    }
  };

  const importBackup = async () => {
    setBusy(true);
    try {
      let file;
      if (Platform.OS === "web") {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["application/json", "text/json"],
          multiple: false,
        });
        if (result.canceled) return;
        file = result.assets?.[0];
        if (!file?.uri) {
          throw new Error("No se pudo acceder al archivo seleccionado.");
        }
      } else {
        const result = await ExpoFile.pickFileAsync({
          mimeTypes: ["application/json", "text/json"],
        });
        if (result.canceled) return;
        file = result.result;
      }
      const content = await readBackupFile(file);
      const data = JSON.parse(content);
      if (!isValidBackup(data)) {
        throw new Error("El archivo no tiene el formato de una copia válida.");
      }
      const confirmation =
        "Se reemplazarán los movimientos y las cuentas guardados. ¿Quieres continuar?";
      const restore = () => {
        onImport(data);
        showMessage("Copia restaurada", "Se importaron los datos seleccionados.");
      };
      if (Platform.OS === "web") {
        if (window.confirm(confirmation)) restore();
      } else {
        Alert.alert("Restaurar copia", confirmation, [
          { text: "Cancelar", style: "cancel" },
          { text: "Restaurar", style: "destructive", onPress: restore },
        ]);
      }
    } catch (error) {
      showMessage(
        "No se pudo importar",
        error instanceof Error
          ? error.message
          : "No se pudo leer el archivo de copia de seguridad.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>Copias de seguridad</Text>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>
      <Text style={styles.description}>
        Guarda o restaura movimientos, categorías, límites, cuentas de ahorro y
        reglas recurrentes. La importación reemplaza movimientos y cuentas, y
        combina las categorías.
      </Text>
      <View style={styles.card}>
        <Text style={styles.count}>{movements.length} movimientos</Text>
        <Text style={styles.count}>{categories.length} categorías</Text>
        <Text style={styles.count}>{accounts.length} cuentas de ahorro</Text>
        <Text style={styles.count}>
          {recurringMovements.length} reglas recurrentes
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={exportBackup}
        style={[styles.button, busy && styles.disabled]}
      >
        <Text style={styles.buttonText}>
          {busy ? "Procesando…" : "Exportar copia JSON"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={importBackup}
        style={[styles.secondary, busy && styles.disabled]}
      >
        <Text style={styles.secondaryText}>Importar copia JSON</Text>
      </Pressable>
      <Text style={styles.note}>
        También puedes seleccionar una copia JSON exportada desde la versión web.
        Los datos de localStorage no se trasladan solos: exporta la copia web y
        después impórtala aquí. En Android, la primera vez elige una carpeta
        para guardar las copias; las siguientes se guardan allí directamente.
      </Text>
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
  card: {
    padding: 14,
    gap: 7,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  count: { color: "#202020", fontSize: 13 },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#111",
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  secondary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  secondaryText: { color: "#202020", fontSize: 14, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  note: { color: "#686868", fontSize: 12, lineHeight: 18 },
});
