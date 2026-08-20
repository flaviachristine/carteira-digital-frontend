import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "../../components";
import { R, fmtDate, fmtTime, txIcon, txLabel } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";
import * as historyService from "../../services/historyService";

export default function TransactionHistory({ currentGuest, loading: booting, error }) {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    if (!useRequireAuth(currentGuest, "/guest/login", booting))
        return null;

    useEffect(() => {
        async function loadHistory() {
            setLoading(true);
            setLoadError("");
            try {
                const items = await historyService.listMyTransactions();
                setHistory(items);
            } catch (err) {
                setLoadError(err.friendlyMessage || "Não foi possível carregar o histórico.");
            } finally {
                setLoading(false);
            }
        }
        loadHistory();
    }, []);

    return (<div className="min-h-screen bg-background flex flex-col pb-6">
      <PageHeader title="Histórico" onBack={() => navigate("/guest/wallet")}/>
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-3 text-white text-center">
          <p className="text-orange-100 text-xs">Saldo atual</p>
          <p className="text-2xl font-bold">{R(currentGuest.balance)}</p>
        </div>

        {loading ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center text-muted-foreground">
            Carregando histórico...
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm">
            {loadError}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center text-muted-foreground text-sm">
            Nenhuma transação registrada
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {txIcon(item.type, 18)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{txLabel(item.type)}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(item.createdAt)} às {fmtTime(item.createdAt)}</p>
                  </div>
                </div>
                <p className="font-bold text-right">{R(item.amount)}</p>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate("/guest/wallet")} className="btn-secondary w-full">
          Voltar para minha carteira
        </button>
      </div>
    </div>);
}
