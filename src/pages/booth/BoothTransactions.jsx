import { useState } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, Receipt } from "lucide-react";
import { PageHeader, BoothBottomNav, StatCard } from "../../components";
import { R, fmtDate, fmtTime } from "../../helpers/formatter";
import { sumAmount } from "../../helpers/domain";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Vendas da barraca logada, com totais e uma tela de detalhe por transação
// (renderizada condicionalmente, sem rota própria).
// A lista contém apenas as cobranças feitas nesta sessão: a API não expõe listagem
// de transações, então nada é recuperado ao entrar de novo.
export default function BoothTransactions({ currentBooth, transactions, loading }) {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    if (!useRequireAuth(currentBooth, "/booth/login", loading))
        return null;
    const txs = transactions.filter((t) => t.type === "compra");
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
          <StatCard label="Vendido na sessão" value={R(total)} icon={<TrendingUp size={16}/>} colorClass="bg-blue-100 text-blue-700"/>
          <StatCard label="Nº de vendas" value={String(txs.length)} icon={<Receipt size={16}/>} colorClass="bg-green-100 text-green-700"/>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Mostrando apenas as cobranças feitas nesta sessão — a API ainda não oferece consulta ao histórico.
        </p>
        <div className="flex flex-col gap-2">
          {txs.length === 0 ? (<div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">Nenhuma transação</div>) : (txs.map((tx) => (<button key={tx.id} onClick={() => setSelected(tx)} className="w-full bg-card rounded-2xl p-4 border border-border flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm text-foreground">{tx.guestName || "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">{fmtTime(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{R(tx.amount)}</p>
                  <p className="text-xs text-green-600 font-medium">Aprovado</p>
                </div>
              </button>)))}
        </div>
      </div>
      <BoothBottomNav />
    </div>);
}
