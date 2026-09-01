import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Spacer } from './components/Spacer';
import Categories from './Pages/Categories';
import { AppProviders } from './context/AppProvider';

beforeEach(() => {
  localStorage.clear();
});

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('Spacer creates horizontal separation when requested', () => {
  const { container } = render(<Spacer size={10} horizontal />);
  expect(container.firstChild).toHaveStyle({ width: '10px', height: '0px' });
});

test('Categories page shows saved categories even without a current-month movement', () => {
  const today = new Date();
  const currentMonthDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    5,
    12,
    0,
    0,
    0,
  ).toISOString();

  localStorage.setItem(
    'categories',
    JSON.stringify([
      { category: 'Supermercado', type: 'spent' },
      { category: 'Alquiler', type: 'spent' },
    ]),
  );

  localStorage.setItem(
    'movements',
    JSON.stringify([
      {
        id: 1,
        nombre: 'Compra',
        categoria: 'Supermercado',
        fecha: currentMonthDate,
        importe: -42.5,
      },
    ]),
  );

  render(
    <BrowserRouter>
      <AppProviders>
        <Categories />
      </AppProviders>
    </BrowserRouter>,
  );

  expect(screen.getByText('Supermercado')).toBeInTheDocument();
  expect(screen.getByText('Alquiler')).toBeInTheDocument();
});
