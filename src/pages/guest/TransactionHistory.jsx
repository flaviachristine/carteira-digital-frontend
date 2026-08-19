import { Receipt } from "lucide-react";
import { useNavigate } from "react-router";
import { PageHeader } from "../../components";
import { R } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Extrato do convidado.
// A API ainda não tem endpoint de listagem de transações: o SecurityConfig reserva a rota
// GET /transacoes/minhas para ROLE_CLIENTE, mas o TransacaoController não a implementa
// (só existem /debitar, /depositar e /reembolsar). Enquanto ela não existir, esta tela
// mostra o saldo atual e explica onde o histórico aparecerá — em vez de inventar dados locais.
export default function TransactionHistory({ currentGuest, loading }) {
    const navigate = useNavigate();
    if (!useRequireAuth(currentGuest, "/guest/login", loading))
        return null;

    return (<div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Histórico" onBack={() => navigate("/guest/wallet")}/>
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-3 text-white text-center">
          <p className="text-orange-100 text-xs">Saldo atual</p>
          <p className="text-2xl font-bold">{R(currentGuest.balance)}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Receipt size={24} className="text-muted-foreground"/>
          </div>
          <p className="font-semibold text-foreground">Extrato indisponível no momento</p>
          <p className="text-sm text-muted-foreground">
            A API ainda não disponibiliza a consulta do histórico de transações
            (<span className="font-mono">GET /transacoes/minhas</span>). Assim que o endpoint
            existir, suas compras, créditos e reembolsos aparecerão aqui.
          </p>
        </div>

        <button onClick={() => navigate("/guest/wallet")} className="btn-secondary w-full">
          Voltar para minha carteira
        </button>
      </div>
    </div>);
}
