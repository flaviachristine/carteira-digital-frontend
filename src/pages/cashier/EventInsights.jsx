import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, ShoppingBag, RefreshCw, Receipt } from "lucide-react";
import { PageHeader, CashierBottomNav, StatCard, TxItem } from "../../components";
import { R, fmtTime } from "../../helpers/formatter";
import { sumByType } from "../../helpers/domain";
import { useRequireAuth } from "../../helpers/useRequireAuth";
import * as cashierHistoryService from "../../services/cashierHistoryService";

// Indicadores da operação do caixa com histórico completo de movimentações.
export default function EventInsights({ cashierLoggedIn, loading: booting }) {
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

    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Insights da sessão" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Créditos adicionados" value={R(totalCredits)} icon={<Plus size={16}/>} colorClass="bg-green-100 text-green-700"/>
          <StatCard label="Débitos" value={R(totalSales)} icon={<ShoppingBag size={16}/>} colorClass="bg-blue-100 text-blue-700"/>
          <StatCard label="Reembolsos" value={R(totalRefunds)} icon={<RefreshCw size={16}/>} colorClass="bg-amber-100 text-amber-700"/>
          <StatCard label="Operações" value={String(transactions.length)} icon={<Receipt size={16}/>} colorClass="bg-red-100 text-red-700"/>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div>
          <h2 className="font-display font-bold text-foreground mb-3">Movimentações</h2>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">
              Carregando movimentações...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">
              Nenhuma operação registrada
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
