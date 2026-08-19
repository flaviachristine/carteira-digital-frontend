import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Loader2 } from "lucide-react";
import { PageHeader, CashierBottomNav, GuestInfoCard, ErrorBanner } from "../../components";
import { onlyDigits } from "../../helpers/formatter";
import { useRequireAuth } from "../../helpers/useRequireAuth";

// Busca de clientes pelo caixa, via GET /usuarios/buscar?token=.
// A API não expõe listagem de clientes nem busca por CPF, então a consulta é sempre
// pelo código de 6 dígitos da carteira; a resposta traz o nome e o CPF mascarado.
export default function SearchGuest({ cashierLoggedIn, loading: booting, findCustomer }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [found, setFound] = useState(null);
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);
    if (!useRequireAuth(cashierLoggedIn, "/cashier/login", booting))
        return null;

    const handleSearch = async () => {
        setError("");
        setFound(null);
        if (query.length !== 6)
            return setError("Digite o código de 6 dígitos do cliente.");
        setSearching(true);
        try {
            setFound(await findCustomer(query));
        }
        catch (err) {
            setError(err.friendlyMessage || "Cliente não encontrado com este código.");
        }
        finally {
            setSearching(false);
        }
    };

    return (<div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader title="Buscar cliente" onBack={() => navigate("/cashier/dashboard")}/>
      <div className="p-4 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Código do cliente</label>
          <div className="flex gap-2">
            <input type="text" inputMode="numeric" placeholder="Ex: 482193" value={query} onChange={(e) => setQuery(onlyDigits(e.target.value).slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="input-field flex-1" autoFocus/>
            <button onClick={handleSearch} disabled={searching} className="btn-cashier px-5 flex-shrink-0 disabled:opacity-50">
              {searching ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            A consulta é feita pelo código de 6 dígitos exibido na carteira do cliente.
          </p>
        </div>

        {error && <ErrorBanner msg={error}/>}

        {/* Card do cliente encontrado, com atalhos para as próximas ações.
            Recarga e reembolso são feitos por CPF (POST /transacoes/depositar e /reembolsar),
            e a busca devolve o CPF mascarado, então as telas seguintes pedem o CPF completo. */}
        {found && (<GuestInfoCard guest={found} actions={[
                { label: "Adicionar créditos", onClick: () => navigate("/cashier/add-credits") },
                { label: "Reembolsar saldo", onClick: () => navigate("/cashier/refund"), variant: "secondary" },
            ]}/>)}
      </div>
      <CashierBottomNav />
    </div>);
}
