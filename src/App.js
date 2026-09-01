import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Movements from './Pages/Movements';
import CreateMovement from './Pages/CreateMovement';
import Categories from './Pages/Categories';
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
