import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { PageHeader, CashierBottomNav, ErrorBanner, SuccessScreen } from "../../components";
import { R, applyMask, onlyDigits, parseAmount } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Valores rápidos de crédito oferecidos como atalho.
const PRESETS = [20, 50, 100, 200];

// Recarga presencial feita pelo caixa, via POST /transacoes/depositar (exclusivo de ROLE_CAIXA).
// O endpoint identifica o cliente pelo CPF — e não pelo código de 6 dígitos, que a API
// só aceita para débito —, por isso o primeiro passo pede o CPF completo.
// Passos: "select" (CPF) -> "amount" (valor + forma de pagamento) -> "confirm" -> "success".
export default function AddCredits({ cashierLoggedIn, loading: booting, deposit }) {
    const navigate = useNavigate();
    const [cpf, setCpf] = useState("");
    const [amountStr, setAmountStr] = useState("");
    const [custom, setCustom] = useState(false);
    const [step, setStep] = useState("select");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [receipt, setReceipt] = useState(null); // transação confirmada pelo backend

    if (!useRequireAuth(cashierLoggedIn, "/cashier/login", booting))
        return null;
    const val = parseAmount(amountStr);
    const rawCpf = onlyDigits(cpf);

    // Etapa 1: valida o formato do CPF. A existência do cliente é conferida pelo backend
    // no momento do depósito (400 com { erro: "Cliente não encontrado." }).
    const goAmount = () => {
        if (rawCpf.length !== 11)
            return setError("Informe os 11 dígitos do CPF do cliente.");
        setError("");
        setStep("amount");
    };

    // Etapa final: efetiva o crédito no backend.
    const handleConfirm = async () => {
        if (val <= 0)
            return;
        setError("");
        setLoading(true);
        try {
            const tx = await deposit(rawCpf, val, { cashier: "Caixa" });
            setReceipt(tx);
            setStep("success");
        }
        catch (err) {
            setError(err.friendlyMessage || "Não foi possível adicionar os créditos.");
            setStep("amount");
        }
        finally {
            setLoading(false);
        }
    };

    // Volta pra etapa de busca, limpando cliente e valor (usado em "Trocar cliente" e no pós-sucesso).
    const backToSelect = () => {
        setStep("select");
        setCpf("");
        setAmountStr("");
        setCustom(false);
        setReceipt(null);
        setError("");
    };

    // Tela final de sucesso.
    if (step === "success" && receipt)
        return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Créditos adicionados" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="flex-1 flex items-center justify-center">
        <SuccessScreen title="Créditos adicionados!" value={R(receipt.amount)} subtitle={`Crédito confirmado para o CPF ${applyMask(rawCpf)}.`} primaryLabel="Próximo cliente" onPrimary={backToSelect} secondaryLabel="Voltar ao início" onSecondary={() => navigate("/cashier/dashboard")}/>
      </div>
      <CashierBottomNav />
    </div>);
    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Adicionar créditos" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="p-4 flex flex-col gap-4">
        {step === "select" && (<>
            <div>
              <label className="block text-sm font-semibold mb-1.5">CPF do cliente</label>
              <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(applyMask(e.target.value))} onKeyDown={(e) => e.key === "Enter" && goAmount()} className="input-field" autoFocus/>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                A recarga é registrada pelo CPF do cliente.
              </p>
            </div>
            {error && <ErrorBanner msg={error}/>}
            <button onClick={goAmount} className="btn-cashier w-full">Continuar</button>
          </>)}

        {step === "amount" && (<>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-bold text-foreground text-lg">{applyMask(rawCpf)}</p>
            </div>
            <div>
              <p className="font-semibold mb-3">Valor da recarga</p>
              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((s) => (<button key={s} onClick={() => { setAmountStr(String(s)); setCustom(false); }} className={`py-5 rounded-2xl border-2 font-bold text-xl transition-all ${amountStr === String(s) && !custom ? "border-[#2D6A4F] bg-green-50 text-green-800" : "border-border bg-card text-foreground"}`}>
                    {R(s)}
                  </button>))}
              </div>
              <button onClick={() => { setCustom(true); setAmountStr(""); }} className={`w-full mt-3 py-4 rounded-2xl border-2 font-semibold transition-all ${custom ? "border-[#2D6A4F] bg-green-50 text-green-800" : "border-border bg-card text-foreground"}`}>
                Outro valor
              </button>
              {custom && (<input type="number" inputMode="decimal" placeholder="Ex: 75" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} className="input-field mt-3 text-2xl font-bold" autoFocus/>)}
            </div>
            {error && <ErrorBanner msg={error}/>}
            <button onClick={() => val > 0 && setStep("confirm")} disabled={val <= 0} className="btn-cashier w-full disabled:opacity-50">
              Adicionar {val > 0 ? R(val) : "créditos"}
            </button>
            <button onClick={backToSelect} className="btn-secondary w-full">Trocar cliente</button>
          </>)}

        {step === "confirm" && (<div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
              <h2 className="font-display text-xl font-bold text-center">Confirmar crédito</h2>
              {[["CPF", applyMask(rawCpf)], ["Crédito", R(val)]].map(([label, value]) => (<div key={label} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <span className={`font-bold ${label === "Crédito" ? "text-green-700 text-xl" : "text-foreground"}`}>{value}</span>
                </div>))}
            </div>
            <button onClick={handleConfirm} disabled={loading} className="btn-cashier w-full">
              {loading && <Loader2 size={18} className="animate-spin"/>}
              {loading ? "Processando..." : "Confirmar crédito"}
            </button>
            <button onClick={() => setStep("amount")} className="btn-secondary w-full">Voltar</button>
          </div>)}
      </div>
      <CashierBottomNav />
    </div>);
}
