import { useNavigate } from "react-router";
import { Wallet, Store, Calculator } from "lucide-react";
import { Bandeirinhas } from "../components";

// Os 3 perfis de acesso do app, cada um levando à sua própria tela de login.
const profiles = [
    { key: "convidado", title: "Convidado", description: "Acesse sua carteira, consulte seu saldo e acompanhe suas compras.", icon: <Wallet size={26}/>, path: "/guest/login", iconBg: "bg-amber-100", iconColor: "text-amber-700", tag: "🎟️" },
    { key: "barraca", title: "Barraca", description: "Realize cobranças e acompanhe as vendas da sua barraca.", icon: <Store size={26}/>, path: "/booth/login", iconBg: "bg-blue-100", iconColor: "text-blue-700", tag: "🏪" },
    { key: "caixa", title: "Caixa", description: "Adicione créditos, realize reembolsos e acompanhe a operação.", icon: <Calculator size={26}/>, path: "/cashier/login", iconBg: "bg-green-100", iconColor: "text-green-800", tag: "💵" },
];

// Tela inicial (rota "/"): apresenta o app e direciona para o login de cada perfil.
export default function Home() {
    const navigate = useNavigate();
    return (<div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary via-orange-600 to-amber-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <Bandeirinhas />
        </div>
        <div className="pt-14 pb-10 px-6 text-center">
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-none">Carteira Digital</h1>
          <p className="text-orange-100 text-xl font-bold mt-1">Festa 2026</p>
        </div>
      </div>

      {/* Cards de seleção de perfil */}
      <div className="flex-1 px-4 py-5 flex flex-col gap-3">
        {profiles.map((p) => (<button key={p.key} onClick={() => navigate(p.path)} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all text-left w-full group">
            <div className={`w-14 h-14 rounded-2xl ${p.iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
              <span className={p.iconColor}>{p.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.tag}</span>
                <h3 className="font-display font-bold text-lg text-foreground">{p.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{p.description}</p>
            </div>
          </button>))}

        <p className="text-center text-xs text-muted-foreground mt-4 pb-4">
          Produzido Por Kauan Luna e Flávia Christine
        </p>
      </div>
    </div>);
}
