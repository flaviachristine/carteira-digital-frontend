import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Loader2 } from "lucide-react";
import { PageHeader, CashierBottomNav, GuestInfoCard, ErrorBanner } from "../../components";
import { applyMask, onlyDigits } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Busca de clientes pelo caixa via CPF (000.000.000-00).
// O caixa identifica o cliente pelo CPF para adicionar créditos ou fazer reembolso.
export default function SearchGuest({ cashierLoggedIn, loading: booting, findCustomerByCpf }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [found, setFound] = useState(null);
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);
    if (!useRequireAuth(cashierLoggedIn, "/cashier/login", booting))
        return null;

    const rawCpf = onlyDigits(query);

    const handleSearch = async () => {
        setError("");
        setFound(null);
        if (rawCpf.length !== 11)
            return setError("Digite os 11 dígitos do CPF do cliente.");
        setSearching(true);
        try {
            setFound(await findCustomerByCpf(rawCpf));
        }
        catch (err) {
            setError(err.friendlyMessage || "Cliente não encontrado com este CPF.");
        }
        finally {
            setSearching(false);
        }
    };

    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Buscar cliente" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="p-4 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">CPF do cliente</label>
          <div className="flex gap-2">
            <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={query} onChange={(e) => setQuery(applyMask(e.target.value))} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="input-field flex-1" autoFocus/>
            <button onClick={handleSearch} disabled={searching} className="btn-cashier px-5 flex-shrink-0 disabled:opacity-50">
              {searching ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Informe o CPF do cliente (000.000.000-00).
          </p>
        </div>

        {error && <ErrorBanner msg={error}/>}

        {found && (<GuestInfoCard guest={found} actions={[
                { label: "Adicionar créditos", onClick: () => navigate("/cashier/add-credits") },
                { label: "Reembolsar saldo", onClick: () => navigate("/cashier/refund"), variant: "secondary" },
            ]}/>)}
      </div>
      <CashierBottomNav />
    </div>);
}
