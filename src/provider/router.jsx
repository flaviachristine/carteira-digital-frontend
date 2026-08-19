import { createBrowserRouter } from "react-router";
import { Connected } from "./appState";

import Home from "../pages/Home";

import GuestLogin from "../pages/guest/GuestLogin";
import GuestRegister from "../pages/guest/GuestRegister";
import GuestWallet from "../pages/guest/GuestWallet";
import TransactionHistory from "../pages/guest/TransactionHistory";
import AddBalance from "../pages/guest/AddBalance";

import BoothLogin from "../pages/booth/BoothLogin";
import BoothDashboard from "../pages/booth/BoothDashboard";
import ChargeGuest from "../pages/booth/ChargeGuest";
import BoothTransactions from "../pages/booth/BoothTransactions";

import CashierLogin from "../pages/cashier/CashierLogin";
import CashierDashboard from "../pages/cashier/CashierDashboard";
import SearchGuest from "../pages/cashier/SearchGuest";
import AddCredits from "../pages/cashier/AddCredits";
import Refund from "../pages/cashier/Refund";
import EventInsights from "../pages/cashier/EventInsights";

// Mapa central de rotas: caminho -> componente de página.
// Manter tudo num objeto único facilita ver de relance todas as telas do app,
// agrupadas por perfil (convidado / barraca / caixa).
const routes = {
  "/": Home,

  // Guest
  "/guest/login": GuestLogin,
  "/guest/register": GuestRegister,
  "/guest/wallet": GuestWallet,
  "/guest/history": TransactionHistory,
  "/guest/add-balance": AddBalance,

  // Booth
  "/booth/login": BoothLogin,
  "/booth/dashboard": BoothDashboard,
  "/booth/charge": ChargeGuest,
  "/booth/transactions": BoothTransactions,

  // Cashier
  "/cashier/login": CashierLogin,
  "/cashier/dashboard": CashierDashboard,
  "/cashier/search": SearchGuest,
  "/cashier/add-credits": AddCredits,
  "/cashier/refund": Refund,
  "/cashier/insights": EventInsights,
};

// Gera as rotas do react-router a partir do mapa acima.
// Cada página é envolvida por <Connected/>, que injeta o estado global (session, signIn, charge etc)
// como props — assim nenhuma página precisa importar o Context diretamente.
export const router = createBrowserRouter(
  Object.entries(routes).map(([path, component]) => ({
    path,
    element: <Connected component={component} />,
  })),
);
