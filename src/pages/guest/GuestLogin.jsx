import { useState } from "react";
import { useNavigate } from "react-router";
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react";
import { PageHeader, ErrorBanner } from "../../components";
import { applyMask, onlyDigits } from "../../helpers/formatter";
import { ROLES } from "../../services/authService";

// Tela de login do convidado: CPF + senha enviados para POST /auth/login.
// O backend devolve um JWT (12h) com o CPF no "sub" e a role no claim "role";
// só quem tem ROLE_CLIENTE entra por aqui.
export default function GuestLogin({ signIn }) {
    const navigate = useNavigate();
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        const raw = onlyDigits(cpf);

        if (raw.length !== 11)
            return setError("CPF inválido. Digite todos os 11 dígitos.");
        if (!password)
            return setError("Digite sua senha.");
        setLoading(true);
        try {
            await signIn(raw, password, ROLES.CLIENTE);
            navigate("/guest/wallet");
        }
        catch (err) {
            // O interceptor de api.js já traduziu o erro (401 = "CPF ou senha incorretos.").
            setError(err.friendlyMessage || "Não foi possível entrar. Tente novamente.");
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Entrar como Convidado" onBack={() => navigate("/")}/>
      <div className="flex-1 p-6 flex flex-col gap-5">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <Wallet size={28} className="text-amber-700"/>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">CPF</label>
            {/* applyMask formata "000.000.000-00" enquanto o usuário digita; a API recebe só os dígitos */}
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

          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full mt-1">
            {loading && <Loader2 size={18} className="animate-spin"/>}
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <button onClick={() => navigate("/guest/register")} className="btn-secondary w-full">
            Criar minha carteira
          </button>
        </div>
      </div>
    </div>);
}
