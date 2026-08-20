import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, Receipt } from "lucide-react";
import { PageHeader, BoothBottomNav, StatCard } from "../../components";
import { R, fmtDate, fmtTime } from "../../helpers/formatter";
import { sumAmount } from "../../helpers/domain";
import { useRequireAuth } from "../../helpers/useRequireAuth";
import * as boothHistoryService from "../../services/boothHistoryService";

export default function BoothTransactions({ currentBooth, loading: booting }) {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [txs, setTxs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!useRequireAuth(currentBooth, "/booth/login", booting))
        return null;

    useEffect(() => {
        async function loadTransactions() {
            setLoading(true);
            setError("");
            try {
                const items = await boothHistoryService.listBoothTransactions();
                setTxs(items.filter((t) => t.type === "compra"));
            } catch (err) {
                setError(err.friendlyMessage || "Não foi possível carregar o histórico.");
            } finally {
                setLoading(false);
            }
        }
        loadTransactions();
    }, []);

    const total = sumAmount(txs);

    // Tela de detalhe de uma venda específica.
    if (selected)
        return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Detalhes da venda" onBack={() => setSelected(null)}/>
      <div className="p-4 flex flex-col gap-4">
        <p className="text-center text-4xl font-bold text-primary">{R(selected.amount)}</p>
        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col divide-y divide-border">
          {[["ID", selected.id], ["Cliente", selected.guestName || "—"], ["Data", fmtDate(selected.createdAt)], ["Hora", fmtTime(selected.createdAt)], ["Barraca", selected.boothName || currentBooth.name], ["Status", "✅ Aprovado"]].map(([label, value]) => (<div key={label} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-semibold text-foreground break-all text-right ml-4">{value}</span>
            </div>))}
        </div>
      </div>
      <BoothBottomNav />
    </div>);

    // Tela de lista (padrão).
    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Transações" onBack={() => navigate("/booth/dashboard")}/>
      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total vendido" value={R(total)} icon={<TrendingUp size={16}/>} colorClass="bg-blue-100 text-blue-700"/>
          <StatCard label="Nº de vendas" value={String(txs.length)} icon={<Receipt size={16}/>} colorClass="bg-green-100 text-green-700"/>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">
            Carregando transações...
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {txs.length === 0 ? (<div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">Nenhuma transação</div>) : (txs.map((tx) => (<button key={tx.id} onClick={() => setSelected(tx)} className="w-full bg-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between text-left hover:bg-muted/50 transition-colors gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground break-words">{tx.guestName || "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">{fmtTime(tx.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-primary">{R(tx.amount)}</p>
                  <p className="text-xs text-green-600 font-medium">Aprovado</p>
                </div>
              </button>)))}
          </div>
        )}
      </div>
      <BoothBottomNav />
    </div>);
}
