import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home/Home';
import Movements from './Pages/Movements/Movements';
import CreateMovement from './Pages/CreateMovement/CreateMovement';
import Categories from './Pages/Categories/Categories';
import { AppProviders } from './context/AppProvider';
import JsonViewer from "./Pages/JsonViewer";

function App() {
  return (
    <BrowserRouter>
    <AppProviders>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movements" element={<Movements />} />
          <Route path="/movements/create" element={<CreateMovement />} />
          <Route path="/categories/:category" element={<Movements />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/json-viewer" element={<JsonViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;


// adb install -r android\app\build\outputs\apk\debug\app-debug.apk

/*
Desde la raíz del proyecto:

npm --prefix record-transactions run build
npx cap sync android
.\android\gradlew.bat -p android assembleDebug

El APK actualizado quedará en:



android\app\build\outputs\apk\debug\app-debug.apk


Para instalarlo sobre la versión anterior:
$javaHome = 'C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot'; $env:JAVA_HOME = $javaHome; $env:Path = "$javaHome\bin;$env:Path"; java -version; .\android\gradlew.bat -p android assembleDebug

$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

adb install -r android\app\build\outputs\apk\debug\app-debug.apk

También puedes combinarlo todo en una línea de PowerShell:


npm --prefix record-transactions run build; npx cap sync android; .\android\gradlew.bat -p android assembleDebug; adb install -r android\app\build\outputs\apk\debug\app-debug.apk

*/