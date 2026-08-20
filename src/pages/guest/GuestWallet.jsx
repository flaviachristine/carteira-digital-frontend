import { useState } from "react";
import { useNavigate } from "react-router";
import { History, LogOut, RefreshCw } from "lucide-react";
import { R } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Atalhos exibidos abaixo do token.
const QUICK_ACTIONS = [
    { icon: <History size={20}/>, label: "Histórico", path: "/guest/history", bg: "bg-blue-100", color: "text-blue-700" },
];

// Tela principal do convidado (home da carteira). Saldo e código de 6 dígitos vêm de
// GET /carteira/saldo — o único endpoint que a API expõe para o perfil ROLE_CLIENTE.
export default function GuestWallet({ currentGuest, loading, refreshWallet, signOut }) {
    const navigate = useNavigate();
    const [refreshing, setRefreshing] = useState(false);
    if (!useRequireAuth(currentGuest, "/guest/login", loading))
        return null;

    // O saldo muda por ação de terceiros (barraca debita, caixa recarrega), então o
    // convidado precisa de um jeito de reconsultar a API sem sair da tela.
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshWallet();
        }
        catch {
            /* a mensagem de erro já foi publicada no estado global pelo Provider */
        }
        finally {
            setRefreshing(false);
        }
    };

    const firstName = currentGuest.name ? currentGuest.name.split(" ")[0] : "";
    return (<div className="min-h-screen bg-background flex flex-col pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-orange-600 to-amber-500 px-5 pt-12 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5"/>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5"/>
        <div className="relative">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-orange-100 text-sm font-medium">Olá,</p>
              <h1 className="font-display text-3xl font-extrabold leading-tight">{firstName ? `${firstName} 👋` : "👋"}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-60" title="Atualizar saldo">
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""}/>
              </button>
              {/* Logout: descarta o JWT e volta pra Home */}
              <button onClick={() => { signOut(); navigate("/"); }} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <LogOut size={18}/>
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Saldo disponível</p>
            <p className="font-display text-5xl font-extrabold mt-2 tracking-tight">{R(currentGuest.balance)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Token: código que o operador da barraca usa em ChargeGuest para identificar o convidado */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Código para compras</p>
          <div className="bg-foreground rounded-xl py-5 flex items-center justify-center">
            <span className="text-background font-display text-5xl font-extrabold tracking-[0.35em] select-all">
              {currentGuest.token || "······"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Mostre este código ao operador da barraca
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          {QUICK_ACTIONS.map((a, i) => (<button key={i} onClick={() => a.path && navigate(a.path)} className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3 hover:bg-muted/50 active:scale-[0.98] transition-all">
              <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0 ${a.color}`}>{a.icon}</div>
              <span className="font-semibold text-foreground">{a.label}</span>
            </button>))}
        </div>

      </div>
    </div>);
}
