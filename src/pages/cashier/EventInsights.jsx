import { useNavigate } from "react-router";
import { Plus, ShoppingBag, RefreshCw, Receipt, Info } from "lucide-react";
import { PageHeader, CashierBottomNav, StatCard, TxItem } from "../../components";
import { R } from "../../helpers/formatter";
import { sumByType } from "../../helpers/domain";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Indicadores da operação do caixa.
// A API não tem endpoints de relatório (nem listagem de transações, de clientes ou de barracas),
// então não é possível montar os totais do evento inteiro nem o ranking de barracas.
// O que aparece aqui é o consolidado das operações feitas nesta sessão de caixa.
export default function EventInsights({ cashierLoggedIn, transactions, loading }) {
    const navigate = useNavigate();
    if (!useRequireAuth(cashierLoggedIn, "/cashier/login", loading))
        return null;
    const totalCredits = sumByType(transactions, "credito");
    const totalSales = sumByType(transactions, "compra");
    const totalRefunds = sumByType(transactions, "reembolso");
    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Insights da sessão" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info size={18} className="text-blue-700 flex-shrink-0 mt-0.5"/>
          <p className="text-sm text-blue-900">
            Os números abaixo somam apenas as operações feitas nesta sessão. A API ainda não
            oferece endpoints de relatório do evento (totais consolidados e ranking de barracas).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Créditos adicionados" value={R(totalCredits)} icon={<Plus size={16}/>} colorClass="bg-green-100 text-green-700"/>
          <StatCard label="Débitos" value={R(totalSales)} icon={<ShoppingBag size={16}/>} colorClass="bg-blue-100 text-blue-700"/>
          <StatCard label="Reembolsos" value={R(totalRefunds)} icon={<RefreshCw size={16}/>} colorClass="bg-amber-100 text-amber-700"/>
          <StatCard label="Operações" value={String(transactions.length)} icon={<Receipt size={16}/>} colorClass="bg-red-100 text-red-700"/>
        </div>

        <div>
          <h2 className="font-display font-bold text-foreground mb-3">Movimentações</h2>
          {transactions.length === 0 ? (<div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">
              Nenhuma operação registrada nesta sessão
            </div>) : (<div className="flex flex-col gap-2">
              {transactions.map((tx) => <TxItem key={tx.id} tx={tx}/>)}
            </div>)}
        </div>
      </div>
      <CashierBottomNav />
    </div>);
}
