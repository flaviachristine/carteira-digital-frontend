import { useNavigate } from "react-router";
import { Banknote, QrCode } from "lucide-react";
import { PageHeader } from "../../components";
import { R } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Recarga de saldo pelo convidado.
// A API não expõe recarga self-service: o único endpoint de crédito é
// POST /transacoes/depositar, restrito a ROLE_CAIXA no SecurityConfig — ou seja, quem credita
// é sempre um operador de caixa, informando o CPF do cliente. Não existe integração de pagamento
// (PIX/cartão) no backend. Por isso esta tela orienta o convidado a procurar o caixa,
// em vez de oferecer um fluxo que a API recusaria com 403.
export default function AddBalance({ currentGuest, loading }) {
  const navigate = useNavigate();
  if (!useRequireAuth(currentGuest, "/guest/login", loading))
    return null;

  return (<div className="min-h-screen bg-background flex flex-col">
    <PageHeader title="Adicionar saldo" onBack={() => navigate("/guest/wallet")} />
    <div className="flex-1 p-6 flex flex-col gap-5">
      <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-4 text-white text-center">
        <p className="text-orange-100 text-sm">Saldo atual</p>
        <p className="text-3xl font-bold">{R(currentGuest.balance)}</p>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Banknote size={20} className="text-green-700"/>
          </div>
          <div>
            <p className="font-semibold text-foreground">A recarga é feita no caixa</p>
            <p className="text-sm text-muted-foreground mt-1">
              Procure um operador do caixa da festa, informe seu CPF e o valor desejado.
              O crédito aparece na sua carteira assim que a operação for confirmada.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <QrCode size={20} className="text-amber-700"/>
          </div>
          <div>
            <p className="font-semibold text-foreground">Seu código</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use <span className="font-mono font-bold text-foreground">{currentGuest.token || "······"}</span> para
              se identificar nas barracas na hora de comprar.
            </p>
          </div>
        </div>
      </div>

      <button onClick={() => navigate("/guest/wallet")} className="btn-primary w-full">
        Voltar para minha carteira
      </button>
    </div>
  </div>);
}
