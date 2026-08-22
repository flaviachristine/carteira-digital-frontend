import { useNavigate } from "react-router";
import { LogOut, DollarSign, TrendingUp, Receipt, Star } from "lucide-react";
import { BoothBottomNav, StatCard } from "../../components";
import { R, fmtTime, partialMask } from "../../helpers/formatter";
import { sumAmount } from "../../helpers/domain";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Tela inicial da barraca: atalho para nova cobrança, estatísticas e as últimas vendas.
export default function BoothDashboard({ currentBooth, transactions, loading, signOut }) {
    const navigate = useNavigate();
    if (!useRequireAuth(currentBooth, "/booth/login", loading))
        return null;
    const boothTxs = transactions.filter((t) => t.type === "compra");
    const totalSales = sumAmount(boothTxs);
    const avgTicket = boothTxs.length > 0 ? totalSales / boothTxs.length : 0;
    const recent = boothTxs.slice(0, 5);
    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] px-5 pt-12 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5"/>
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-sm">Operando com:</p>
            <h1 className="font-display text-2xl font-bold leading-tight">{currentBooth?.name || "Barraca"}</h1>
            <p className="text-blue-200 text-xs mt-0.5">CPF {partialMask(currentBooth?.cpf || "")}</p>
          </div>
          {/* Logout: descarta o JWT e volta pra Home */}
          <button onClick={() => { signOut(); navigate("/"); }} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 -mt-2">
        {/* Botão principal: leva pro fluxo de cobrança (ChargeGuest) */}
        <button onClick={() => navigate("/booth/charge")} className="bg-primary text-white rounded-2xl py-6 text-center shadow-lg hover:bg-orange-700 active:scale-[0.98] transition-all w-full">
          <DollarSign size={32} className="mx-auto mb-2"/>
          <p className="font-display text-2xl font-extrabold">Nova cobrança</p>
          <p className="text-orange-100 text-sm mt-1">Toque para cobrar</p>
        </button>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Vendido na sessão" value={R(totalSales)} icon={<TrendingUp size={16}/>} colorClass="bg-blue-100 text-blue-700"/>
          <StatCard label="Vendas" value={String(boothTxs.length)} icon={<Receipt size={16}/>} colorClass="bg-green-100 text-green-700"/>
          <StatCard label="Ticket médio" value={R(avgTicket)} icon={<Star size={16}/>} colorClass="bg-amber-100 text-amber-700"/>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display font-bold text-foreground">Últimas vendas</h2>
            <button onClick={() => navigate("/booth/transactions")} className="text-xs text-[#1E3A5F] font-bold">Ver tudo</button>
          </div>
          {recent.length === 0 ? (<p className="text-center py-6 text-muted-foreground text-sm bg-card rounded-2xl border border-border">Nenhuma venda registrada</p>) : (<div className="flex flex-col gap-2">
              {recent.map((tx) => (<div key={tx.id} className="bg-card rounded-xl p-3 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground break-words">{tx.guestName || "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">{fmtTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary">{R(tx.amount)}</p>
                    <p className="text-xs text-green-600 font-medium">Aprovado</p>
                  </div>
                </div>))}
            </div>)}
        </div>
      </div>
      <BoothBottomNav />
    </div>);
}
