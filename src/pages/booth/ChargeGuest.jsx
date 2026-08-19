import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Loader2 } from "lucide-react";
import { PageHeader, BoothBottomNav, GuestInfoCard, ErrorBanner, SuccessScreen } from "../../components";
import { R, parseAmount, onlyDigits } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Mapeia cada etapa do fluxo para o índice usado na barra de progresso (find e amount avançam;
// confirm e success compartilham o último segmento, já que "success" não tem barra própria).
const STEP_INDEX = { find: 0, amount: 1, confirm: 2, success: 2 };

// Fluxo de cobrança da barraca, em 3 passos: identificar cliente -> valor -> confirmar.
// Etapa 1 usa GET /usuarios/buscar?token= (só confirma o nome; por privacidade a API não
// devolve o saldo do cliente para a barraca) e a confirmação usa POST /transacoes/debitar,
// que valida o saldo no servidor com lock pessimista e responde 422 se for insuficiente.
export default function ChargeGuest({ currentBooth, loading: booting, findCustomer, charge }) {
    const navigate = useNavigate();
    const tokenRef = useRef(null); // referência ao input de código, para focar automaticamente
    const [step, setStep] = useState("find");
    const [tokenInput, setTokenInput] = useState("");
    const [customer, setCustomer] = useState(null); // { name, cpfMasked, token } devolvido pela API
    const [amountStr, setAmountStr] = useState("");
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [charged, setCharged] = useState(null); // transação confirmada pelo backend
    const authorized = useRequireAuth(currentBooth, "/booth/login", booting);
    // Sempre que a etapa volta a ser "find" (início ou depois de reset), foca o input de código.
    useEffect(() => { if (step === "find")
        tokenRef.current?.focus(); }, [step]);
    if (!authorized)
        return null;

    // Etapa 1: identifica o cliente pelo token de 6 dígitos.
    // A busca por CPF não existe nesta rota da API — apenas o token de autorização.
    const handleFind = async () => {
        setErrorMsg("");
        if (tokenInput.length !== 6)
            return setErrorMsg("Digite o código de 6 dígitos do cliente.");
        setSearching(true);
        try {
            const found = await findCustomer(tokenInput);
            setCustomer(found);
            setStep("amount");
        }
        catch (err) {
            setErrorMsg(err.friendlyMessage || "Cliente não encontrado. Verifique o código.");
        }
        finally {
            setSearching(false);
        }
    };
    const amount = parseAmount(amountStr);

    // Etapa 2: valida o valor digitado antes de avançar para a confirmação.
    // Não há checagem local de saldo: a barraca não conhece o saldo do cliente,
    // quem decide é o backend na hora do débito.
    const goConfirm = () => {
        setErrorMsg("");
        if (amount <= 0)
            return setErrorMsg("Informe o valor da compra.");
        setStep("confirm");
    };

    // Etapa 3: efetiva a cobrança no backend.
    const handleCharge = async () => {
        if (!customer || amount <= 0)
            return;
        setErrorMsg("");
        setLoading(true);
        try {
            const tx = await charge(customer.token, amount, {
                guestName: customer.name,
                boothName: currentBooth.name,
            });
            setCharged(tx);
            setStep("success");
        }
        catch (err) {
            // 422 = "Saldo insuficiente para a transação."; 400 = token inválido.
            setErrorMsg(err.friendlyMessage || "Não foi possível concluir a cobrança.");
            setStep("amount");
        }
        finally {
            setLoading(false);
        }
    };

    // Limpa todo o fluxo e volta para a etapa inicial (usado em "Cancelar" e "Nova cobrança").
    const reset = () => {
        setTokenInput("");
        setAmountStr("");
        setCustomer(null);
        setCharged(null);
        setErrorMsg("");
        setStep("find");
    };
    const stepIdx = STEP_INDEX[step];
    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Nova cobrança" onBack={() => navigate("/booth/transactions")}/>

      {/* Barra de progresso das 3 etapas (escondida na tela de sucesso) */}
      {step !== "success" && (<div className="flex px-4 pt-4 gap-2">
          {["Identificar", "Valor", "Confirmar"].map((s, i) => (<div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-colors ${i <= stepIdx ? "bg-[#1E3A5F]" : "bg-muted"}`}/>
              <span className="text-xs text-muted-foreground">{s}</span>
            </div>))}
        </div>)}

      <div className="flex-1 p-4 flex flex-col gap-4">
        {step === "find" && (<>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Código do cliente</label>
              {/* Limita a digitação a 6 dígitos numéricos (tamanho do token de autorização) */}
              <input ref={tokenRef} type="text" inputMode="numeric" placeholder="Ex: 482193" value={tokenInput} onChange={(e) => setTokenInput(onlyDigits(e.target.value).slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && handleFind()} className="input-field text-3xl font-bold tracking-[0.3em] text-center"/>
              <p className="text-xs text-muted-foreground text-center mt-1.5">Código de 6 dígitos exibido na carteira do cliente</p>
            </div>
            {errorMsg && <ErrorBanner msg={errorMsg}/>}
            <button onClick={handleFind} disabled={searching} className="btn-booth w-full disabled:opacity-50">
              {searching ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>}
              {searching ? "Buscando..." : "Buscar cliente"}
            </button>
          </>)}

        {step === "amount" && customer && (<>
            <GuestInfoCard guest={customer}/>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Valor da compra</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xl">R$</span>
                <input type="number" inputMode="decimal" placeholder="0,00" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} className="input-field text-3xl font-bold pl-14" autoFocus/>
              </div>
            </div>
            {errorMsg && <ErrorBanner msg={errorMsg}/>}
            <button onClick={goConfirm} className="btn-booth w-full">
              {amount > 0 ? `Cobrar ${R(amount)}` : "Cobrar"}
            </button>
            <button onClick={reset} className="btn-secondary w-full">Cancelar</button>
          </>)}

        {step === "confirm" && customer && (<>
            <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4">
              <h2 className="font-display text-xl font-bold text-center text-foreground">Confirmar cobrança?</h2>
              {[["Cliente", customer.name], ["Código", customer.token], ["Barraca", currentBooth.name], ["Valor", R(amount)]].map(([label, value]) => (<div key={label} className={`flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0 ${label === "Valor" ? "mt-1" : ""}`}>
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-bold ${label === "Valor" ? "text-primary text-2xl" : "text-foreground"}`}>{value}</span>
                </div>))}
            </div>
            <button onClick={handleCharge} disabled={loading} className="btn-booth w-full">
              {loading && <Loader2 size={18} className="animate-spin"/>}
              {loading ? "Processando..." : "Confirmar cobrança"}
            </button>
            <button onClick={() => setStep("amount")} className="btn-secondary w-full">Cancelar</button>
          </>)}

        {step === "success" && customer && charged && (<SuccessScreen title="Cobrança realizada!" value={R(charged.amount)} subtitle={`Débito confirmado para ${customer.name.split(" ")[0]}.`} primaryLabel="Nova cobrança" onPrimary={reset} secondaryLabel="Ver transações" onSecondary={() => navigate("/booth/transactions")}/>)}
      </div>
      <BoothBottomNav />
    </div>);
}
