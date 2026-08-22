import { useState } from "react";
import { useNavigate } from "react-router";
import { Store, Eye, EyeOff, Loader2 } from "lucide-react";
import { PageHeader, ErrorBanner } from "../../components";
import { applyMask, onlyDigits } from "../../helpers/formatter";
import { ROLES } from "../../services/authService";

// Tela de login da barraca. A API tem um login único (POST /auth/login) para os três perfis:
// o operador entra com o CPF e a senha do usuário de barraca, e o JWT devolvido traz
// role = ROLE_BARRACA. Não existe cadastro/listagem de barracas na API — esses usuários
// são criados fora do app — por isso não há mais o select de barracas.
export default function BoothLogin({ signIn }) {
    const navigate = useNavigate();
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
      const formData = new FormData(e.currentTarget);
      const raw = onlyDigits(formData.get("cpf"));
      const passwordValue = formData.get("senha") || "";
        if (raw.length !== 11)
            return setError("CPF inválido. Digite todos os 11 dígitos.");
        if (!passwordValue)
            return setError("Digite a senha da barraca.");
        setLoading(true);
        try {
            await signIn(raw, passwordValue, ROLES.BARRACA);
            navigate("/booth/dashboard");
        }
        catch (err) {
            setError(err.friendlyMessage || "Não foi possível entrar. Tente novamente.");
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Acessar Barraca" onBack={() => navigate("/")}/>
      <div className="flex-1 p-6 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <Store size={28} className="text-blue-700"/>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">CPF do operador</label>
            <input type="text" id="cpf" name="cpf" autoComplete="username" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(applyMask(e.target.value))} className="input-field"/>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Senha da barraca</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} id="senha" name="senha" autoComplete="current-password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-12"/>
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          {error && <ErrorBanner msg={error}/>}

          <button type="submit" disabled={loading} className="btn-booth w-full disabled:opacity-50">
            {loading && <Loader2 size={18} className="animate-spin"/>}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>);
}
