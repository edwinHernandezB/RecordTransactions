import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Movements from './Pages/Movements';
import CreateMovement from './Pages/CreateMovement';
import Categories from './Pages/Categories';
import { AppProviders } from './context/AppProvider';

function App() {
  return (
    <BrowserRouter>
    <AppProviders>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movements" element={<Movements />} />
          <Route path="/movements/create" element={<CreateMovement />} />
          <Route path="/movements/categories" element={<Categories />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
