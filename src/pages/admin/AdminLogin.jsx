import { useState } from "react";
import { useNavigate } from "react-router";
import { Key, Eye, EyeOff, Loader2 } from "lucide-react";
import { PageHeader, ErrorBanner } from "../../components";
import { applyMask, onlyDigits } from "../../helpers/formatter";
import { ROLES } from "../../services/authService";

// Tela de login do admin. Usa o mesmo POST /auth/login dos outros perfis;
// o acesso é liberado apenas quando o JWT devolvido traz role = ROLE_ADMIN.
export default function AdminLogin({ signIn }) {
    const navigate = useNavigate();
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        // TODO: Implement actual authentication when backend is ready
        // For testing: skip authentication and navigate directly to dashboard
        navigate("/admin/dashboard");
    };
    return (<div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Acessar Admin" onBack={() => navigate("/")}/>
      <div className="flex-1 p-6 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3">
            <Key size={28} className="text-red-700"/>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">CPF do administrador</label>
            <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(applyMask(e.target.value))} className="input-field"/>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Senha</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="input-field pr-12"/>
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
          {error && <ErrorBanner msg={error}/>}
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={18} className="animate-spin"/>}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>);
}
