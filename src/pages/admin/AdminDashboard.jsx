import { useNavigate } from "react-router";
import { LogOut, Store, Calculator } from "lucide-react";
import { PageHeader } from "../../components";

const ADMIN_ACTIONS = [
  {
    icon: <Store size={24} />,
    label: "Criar Barraca",
    description: "Adicione uma nova barraca",
    path: "/admin/create-stall",
    bg: "bg-blue-100",
    color: "text-blue-700",
  },
  {
    icon: <Calculator size={24} />,
    label: "Criar Caixa",
    description: "Adicione um novo operador de caixa",
    path: "/admin/create-cashier",
    bg: "bg-green-100",
    color: "text-green-700",
  },
];

export default function AdminDashboard({ adminLoggedIn, loading: booting, signOut }) {
  const navigate = useNavigate();
  // TODO: Remove this bypass when backend API is available
  // For testing: authentication is bypassed

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-5 pt-12 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-red-200 text-sm">Painel</p>
            <h1 className="font-display text-2xl font-bold leading-tight">Administração</h1>
          </div>
          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 -mt-2">
        {/* Main action buttons */}
        <div className="grid grid-cols-1 gap-3">
          {ADMIN_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all text-left group"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                <span className={action.color}>{action.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg text-foreground">{action.label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
