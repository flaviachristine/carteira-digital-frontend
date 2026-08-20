import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { PageHeader, ErrorBanner, SuccessScreen } from "../../components";
import { applyMask, onlyDigits } from "../../helpers/formatter";

// Tela de cadastro de carteira: POST /auth/cadastrar cria o usuário (ROLE_CLIENTE) já com
// carteira zerada e um token de autorização de 6 dígitos gerado pelo backend
// (é o código que o convidado mostra nas barracas). Em seguida o Provider faz login
// automático e busca o token em GET /carteira/saldo para exibi-lo aqui.
export default function GuestRegister({ signUp }) {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null); // { name, token } da carteira recém-criada

    // Devolve a primeira mensagem de erro do formulário, ou "" quando está válido.
    // A unicidade do CPF é verificada no backend, que responde 400 com { erro: "CPF já cadastrado..." }.
    const validate = (rawCpf) => {
        if (!name.trim())
            return "Digite seu nome completo.";
        if (rawCpf.length !== 11)
            return "CPF inválido.";
        if (password.length < 4)
            return "A senha deve ter pelo menos 4 caracteres.";
        if (password !== confirm)
            return "As senhas não coincidem.";
        return "";
    };

    const handleRegister = async () => {
        const rawCpf = onlyDigits(cpf);
        const message = validate(rawCpf);
        setError(message);
        if (message)
            return;
        setLoading(true);
        try {
            const { wallet } = await signUp(name.trim(), rawCpf, password);
            setCreated({ name: name.trim(), token: wallet?.token ?? "" });
        }
        catch (err) {
            setError(err.friendlyMessage || "Não foi possível criar a carteira.");
        }
        finally {
            setLoading(false);
        }
    };

    // Depois de cadastrar, mostra o token gerado pelo backend antes de liberar o acesso à carteira.
    if (created) {
        return (<div className="min-h-screen bg-background flex flex-col">
        <PageHeader title="Cadastro concluído" onBack={() => navigate("/")}/>
        <div className="flex-1 flex items-center justify-center">
          <SuccessScreen title="Carteira criada!" subtitle={`Bem-vindo(a), ${created.name.split(" ")[0]}!${created.token ? ` Seu código é ${created.token}.` : ""}`} primaryLabel="Acessar minha carteira" onPrimary={() => navigate("/guest/wallet")}/>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Criar minha carteira" onBack={() => navigate("/guest/login")}/>
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Nome completo</label>
          <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="input-field"/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">CPF</label>
          <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(applyMask(e.target.value))} className="input-field"/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Senha (mín. 4 caracteres)</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-12"/>
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
              {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Confirmar senha</label>
          <input type="password" placeholder="Repita a senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field"/>
        </div>

        {error && <ErrorBanner msg={error}/>}

        <button onClick={handleRegister} disabled={loading} className="btn-primary w-full mt-2">
          {loading && <Loader2 size={18} className="animate-spin"/>}
          {loading ? "Criando carteira..." : "Criar carteira"}
        </button>
      </div>
    </div>);
}
