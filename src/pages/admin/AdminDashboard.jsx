import { useNavigate } from "react-router";
import { LogOut, Plus, Users } from "lucide-react";
import { PageHeader } from "../../components";
import { useRequireAuth } from "../../helpers/useRequireAuth";

export default function AdminDashboard({ loading, signOut }) {
    const navigate = useNavigate();
    if (!useRequireAuth(true, "/admin/login", loading))
        return null;

    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-5 pt-12 pb-8 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5"/>
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-red-200 text-sm">Painel</p>
            <h1 className="font-display text-2xl font-bold leading-tight">Administração</h1>
          </div>
          <button onClick={() => { signOut(); navigate("/"); }} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <LogOut size={18}/>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <button onClick={() => navigate("/admin/create-booth")} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all text-left w-full">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Plus size={24} className="text-blue-700"/>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg text-foreground">Criar Barraca</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Adicionar nova barraca ao sistema</p>
          </div>
        </button>

        <button onClick={() => navigate("/admin/create-cashier")} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all text-left w-full">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Plus size={24} className="text-green-700"/>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg text-foreground">Criar Caixa</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Adicionar novo operador de caixa</p>
          </div>
        </button>

        <button onClick={() => navigate("/admin/manage-users")} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all text-left w-full">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Users size={24} className="text-purple-700"/>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg text-foreground">Gerenciar Usuários</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Visualizar e editar usuários</p>
          </div>
        </button>
      </div>
    </div>);
}
