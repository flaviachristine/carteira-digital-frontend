import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import { PageHeader, CashierBottomNav, ErrorBanner, SuccessScreen } from "../../components";
import { R, applyMask, onlyDigits } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Reembolso feito pelo caixa, via POST /transacoes/reembolsar (exclusivo de ROLE_CAIXA).
// O backend zera a carteira e devolve o saldo INTEGRAL — não existe reembolso parcial —,
// e identifica o cliente pelo CPF. Por isso a tela não pede valor: pede o CPF, confirma
// e mostra o valor devolvido que veio na resposta (campo "valor" do TransacaoResponse).
// Se o cliente já estiver com saldo zero, a API responde 422 com { erro: "O cliente já possui saldo zero." }.
export default function Refund({ cashierLoggedIn, loading: booting, refund }) {
    const navigate = useNavigate();
    const [cpf, setCpf] = useState("");
    const [step, setStep] = useState("select");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [receipt, setReceipt] = useState(null); // transação de reembolso confirmada pelo backend
    if (!useRequireAuth(cashierLoggedIn, "/cashier/login", booting))
        return null;
    const rawCpf = onlyDigits(cpf);

    const goConfirm = () => {
        if (rawCpf.length !== 11)
            return setError("Informe os 11 dígitos do CPF do cliente.");
        setError("");
        setStep("confirm");
    };

    const handleConfirm = async () => {
        setError("");
        setLoading(true);
        try {
            const tx = await refund(rawCpf, { cashier: "Caixa" });
            setReceipt(tx);
            setStep("success");
        }
        catch (err) {
            setError(err.friendlyMessage || "Não foi possível concluir o reembolso.");
            setStep("confirm");
        }
        finally {
            setLoading(false);
        }
    };

    // Tela final de sucesso: o valor devolvido é o que o backend informou.
    if (step === "success" && receipt)
        return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Reembolso realizado" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="flex-1 flex items-center justify-center">
        <SuccessScreen title="Reembolso realizado!" value={R(receipt.amount)} subtitle={`Carteira do CPF ${applyMask(rawCpf)} zerada.`} primaryLabel="Voltar ao início" onPrimary={() => navigate("/cashier/dashboard")}/>
      </div>
      <CashierBottomNav />
    </div>);

    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Reembolsar saldo" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="p-4 flex flex-col gap-4">
        {step === "select" && (<>
            <div>
              <label className="block text-sm font-semibold mb-1.5">CPF do cliente</label>
              <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(applyMask(e.target.value))} onKeyDown={(e) => e.key === "Enter" && goConfirm()} className="input-field" autoFocus/>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-700 flex-shrink-0 mt-0.5"/>
              <p className="text-sm text-amber-900">
                O reembolso devolve <strong>todo o saldo</strong> e zera a carteira do cliente.
              </p>
            </div>
            {error && <ErrorBanner msg={error}/>}
            <button onClick={goConfirm} className="btn-cashier w-full">Continuar</button>
          </>)}

        {step === "confirm" && (<div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
              <h2 className="font-display text-xl font-bold text-center">Confirmar reembolso?</h2>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-muted-foreground text-sm">CPF</span>
                <span className="font-bold text-foreground">{applyMask(rawCpf)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Valor</span>
                <span className="font-bold text-amber-700">Saldo integral da carteira</span>
              </div>
            </div>
            {error && <ErrorBanner msg={error}/>}
            <button onClick={handleConfirm} disabled={loading} className="btn-cashier w-full">
              {loading && <Loader2 size={18} className="animate-spin"/>}
              {loading ? "Processando..." : "Confirmar reembolso"}
            </button>
            <button onClick={() => setStep("select")} className="btn-secondary w-full">Cancelar</button>
          </div>)}
      </div>
      <CashierBottomNav />
    </div>);
}
