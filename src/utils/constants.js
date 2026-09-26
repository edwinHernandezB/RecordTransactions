import {
  ForkKnife,
  HouseLine,
  AirplaneTilt,
  User,
  CreditCard,
  GraduationCap,
  Car,
  Heart,
  Wallet,
  GameController,
  Briefcase,
  ShoppingCart,
  Coins,
  ShoppingBag,
  ChartLineUp,
  Bank,
} from "phosphor-react";

export const SPENT_CATEGORIES = [
  "Comida",
  "Hogar",
  "Gastos personales",
  "Cuotas mensuales",
  "Transporte",
  "Ocio",
  "Salud",
  "Pagos",
  "Viajes",
  "Educación",
];

export const INCOME_CATEGORIES = [
  "Nomina",
  "Prestamo",
  "Pagos",
  "Ventas",
  "Devolución",
  "Acciones",
  "Fondos",
];

export const CATEGORY_ICONS = {
  Comida: ShoppingCart,
  Hogar: HouseLine,
  Viajes: AirplaneTilt,
  "Gastos personales": User,
  "Cuotas mensuales": CreditCard,
  Pagos: Wallet,
  Restaurante: ForkKnife,
  Transporte: Car,
  Ocio: GameController,
  Salud: Heart,
  Educación: GraduationCap,
  Nomina: Briefcase,
  Prestamo: Coins,
  Devolución: CreditCard,
  Ventas: ShoppingBag,
  Acciones:ChartLineUp,
  Fondos: Bank,
};

