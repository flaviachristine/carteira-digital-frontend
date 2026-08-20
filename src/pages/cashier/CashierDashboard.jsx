import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LogOut, Search, Plus, RefreshCw, ShoppingBag, Receipt } from "lucide-react";
import { CashierBottomNav, StatCard } from "../../components";
import { R, partialMask, fmtTime } from "../../helpers/formatter";
import { sumByType } from "../../helpers/domain";
import { useRequireAuth } from "../../helpers/useRequireAuth";
import * as cashierHistoryService from "../../services/cashierHistoryService";

// Atalhos exibidos no topo do dashboard do caixa.
const QUICK_ACTIONS = [
    { icon: <Search size={22}/>, label: "Buscar cliente", path: "/cashier/search", bg: "bg-blue-100", color: "text-blue-700" },
    { icon: <Plus size={22}/>, label: "Adicionar créditos", path: "/cashier/add-credits", bg: "bg-green-100", color: "text-green-700" },
    { icon: <RefreshCw size={22}/>, label: "Reembolsar", path: "/cashier/refund", bg: "bg-amber-100", color: "text-amber-700" },
];

// Tela inicial do caixa: atalhos para as operações principais e o resumo com histórico completo.
export default function CashierDashboard({ cashierLoggedIn, session, loading: booting, signOut }) {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!useRequireAuth(cashierLoggedIn, "/cashier/login", booting))
        return null;

    useEffect(() => {
        async function loadTransactions() {
            setLoading(true);
            setError("");
            try {
                const items = await cashierHistoryService.listCashierTransactions();
                setTransactions(items);
            } catch (err) {
                setError(err.friendlyMessage || "Não foi possível carregar o histórico.");
            } finally {
                setLoading(false);
            }
        }
        loadTransactions();
    }, []);

    const totalCredits = sumByType(transactions, "credito");
    const totalSales = sumByType(transactions, "compra");
    const totalRefunds = sumByType(transactions, "reembolso");
    const recent = transactions.slice(0, 5);

    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] px-5 pt-12 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5"/>
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-green-200 text-sm">Operando como</p>
            <h1 className="font-display text-2xl font-bold">Caixa</h1>
            <p className="text-green-200 text-xs mt-0.5">CPF {partialMask(session?.cpf ?? "")}</p>
          </div>
          {/* Logout: descarta o JWT e volta pra Home */}
          <button onClick={() => { signOut(); navigate("/"); }} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 -mt-2">
        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((a) => (<button key={a.path} onClick={() => navigate(a.path)} className="bg-card rounded-2xl p-3 border border-border shadow-sm flex flex-col items-center gap-2 hover:bg-muted/50 active:scale-[0.97] transition-all">
              <div className={`w-11 h-11 rounded-xl ${a.bg} flex items-center justify-center ${a.color}`}>{a.icon}</div>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">{a.label}</span>
            </button>))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Créditos adicionados" value={R(totalCredits)} icon={<Plus size={16}/>} colorClass="bg-green-100 text-green-700"/>
          <StatCard label="Débitos" value={R(totalSales)} icon={<ShoppingBag size={16}/>} colorClass="bg-blue-100 text-blue-700"/>
          <StatCard label="Reembolsos" value={R(totalRefunds)} icon={<RefreshCw size={16}/>} colorClass="bg-amber-100 text-amber-700"/>
          <StatCard label="Operações" value={String(transactions.length)} icon={<Receipt size={16}/>} colorClass="bg-purple-100 text-purple-700"/>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div>
          <h2 className="font-display font-bold mb-3 text-foreground">Movimentações</h2>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground text-sm bg-card rounded-2xl border border-border">
              Carregando...
            </p>
          ) : recent.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground text-sm bg-card rounded-2xl border border-border">
              Nenhuma operação registrada
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((tx) => (
                <div key={tx.id} className="bg-card rounded-2xl p-3 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground break-words">{tx.guestName}</p>
                    <p className="text-xs text-muted-foreground">Por {tx.operatorName} • {fmtTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary">{R(tx.amount)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{tx.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CashierBottomNav />
    </div>);
}
