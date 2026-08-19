import { useNavigate, useLocation } from "react-router";
import { Search, DollarSign, Receipt, BarChart2, Home as HomeIcon } from "lucide-react";

// Itens do menu inferior de navegação de cada perfil.
const BOOTH_ITEMS = [
    { path: "/booth/dashboard", icon: <HomeIcon size={20}/>, label: "Início" },
    { path: "/booth/charge", icon: <DollarSign size={20}/>, label: "Cobrar" },
    { path: "/booth/transactions", icon: <Receipt size={20}/>, label: "Transações" },
];

const CASHIER_ITEMS = [
    { path: "/cashier/dashboard", icon: <HomeIcon size={20}/>, label: "Início" },
    { path: "/cashier/search", icon: <Search size={20}/>, label: "Buscar" },
    { path: "/cashier/insights", icon: <BarChart2 size={20}/>, label: "Insights" },
];

// Componente genérico de navegação inferior fixa. Recebe a lista de itens e a classe de cor
// do item ativo, e destaca o botão cujo path bate com a rota atual (useLocation).
function BottomNav({ items, activeClass }) {
    const navigate = useNavigate();
    const loc = useLocation();
    return (<nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border flex">
      {items.map((item) => {
            const active = loc.pathname === item.path;
            return (<button key={item.path} onClick={() => navigate(item.path)} className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${active ? activeClass : "text-muted-foreground"}`}>
            {item.icon}
            {item.label}
          </button>);
        })}
    </nav>);
}

// Navegação inferior usada nas telas de barraca (azul).
export function BoothBottomNav() {
    return <BottomNav items={BOOTH_ITEMS} activeClass="text-[#1E3A5F]"/>;
}

// Navegação inferior usada nas telas de caixa (verde).
export function CashierBottomNav() {
    return <BottomNav items={CASHIER_ITEMS} activeClass="text-[#2D6A4F]"/>;
}
