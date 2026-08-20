import { useState } from "react";
import { useNavigate } from "react-router";
import { Calculator, Eye, EyeOff, Loader2 } from "lucide-react";
import { PageHeader, ErrorBanner, SuccessScreen } from "../../components";
import { applyMask, onlyDigits } from "../../helpers/formatter";
import { createCashier } from "../../services/adminService";

export default function CreateCashier({ adminLoggedIn, loading: booting, signOut }) {
  const navigate = useNavigate();
  const [cashierId, setCashierId] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // TODO: Remove this bypass when backend API is available
  // For testing: authentication is bypassed

  const validateForm = () => {  
    setError("");
    if (!cashierId.trim())
      return setError("Digite o identificador do caixa.");
    const raw = onlyDigits(cpf);
    if (raw.length !== 11)
      return setError("CPF inválido. Digite todos os 11 dígitos.");
    if (!password)
      return setError("Digite a senha.");
    if (password !== confirmPassword)
      return setError("As senhas não coincidem.");
    if (password.length < 6)
      return setError("A senha deve ter no mínimo 6 caracteres.");
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const raw = onlyDigits(cpf);
      await createCashier(cashierId, raw, password);
      setSuccess(true);
    } catch (err) {
      setError(err.friendlyMessage || "Não foi possível criar o caixa. Tente novamente.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PageHeader title="Sucesso" onBack={() => navigate("/admin/dashboard")} />
        <div className="flex-1 flex items-center justify-center px-6">
          <SuccessScreen
            title="Caixa criado!"
            subtitle={`${cashierId} foi cadastrado com sucesso.`}
            primaryLabel="Voltar ao painel"
            onPrimary={() => navigate("/admin/dashboard")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Criar Caixa" onBack={() => navigate("/admin/dashboard")} />
      <div className="flex-1 p-6 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Calculator size={28} className="text-green-700" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Identificador do caixa</label>
            <input
              type="text"
              placeholder="Ex: CAIXA_01"
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">CPF do operador</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(applyMask(e.target.value))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Confirmar senha</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <ErrorBanner msg={error} />}

          <button onClick={handleCreate} disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Criando..." : "Criar caixa"}
          </button>
        </div>
      </div>
    </div>
  );
}
