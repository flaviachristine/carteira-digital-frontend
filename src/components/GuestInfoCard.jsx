import { User } from "lucide-react";
import { R } from "../helpers/formatter";

// Classe de botão por variante de ação (ex: "danger" para reembolsar, "secondary" para cancelar).
// Sem variante especificada, cai no estilo primário.
const VARIANT_CLASS = { danger: "btn-danger w-full", secondary: "btn-secondary w-full" };

// Card com os dados do cliente identificado e uma lista opcional de botões de ação.
// O objeto vem de GET /usuarios/buscar: { name, cpfMasked, token, balance: null }.
// A API oculta o CPF e não devolve o saldo para barraca/caixa (privacidade do cliente),
// por isso o bloco de saldo só é renderizado quando "balance" existe de fato —
// hoje apenas na carteira do próprio convidado.
export default function GuestInfoCard({ guest, actions }) {
    return (<div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={22} className="text-primary"/>
        </div>
        <div>
          <p className="font-bold text-foreground">{guest.name}</p>
          {guest.token && (<p className="text-sm text-muted-foreground">
              Código: <span className="font-mono font-bold">{guest.token}</span>
            </p>)}
        </div>
      </div>
      {guest.balance != null && (<div className="bg-muted/60 rounded-xl p-3 text-center mb-3">
          <p className="text-xs text-muted-foreground mb-1">Saldo disponível</p>
          <p className="text-3xl font-bold text-foreground">{R(guest.balance)}</p>
        </div>)}
      {actions && (<div className="flex flex-col gap-2">
          {actions.map((a, i) => (<button key={i} onClick={a.onClick} className={VARIANT_CLASS[a.variant] || "btn-primary w-full"}>
              {a.label}
            </button>))}
        </div>)}
    </div>);
}
