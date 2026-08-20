import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { ROLES } from "../services/authService";
import * as walletService from "../services/walletService";
import * as customerService from "../services/customerService";
import * as transactionService from "../services/transactionService";

// Nome de exibição do usuário logado. A API não tem endpoint que devolva o nome
// de quem está autenticado (o JWT carrega apenas CPF e role), então guardamos o nome
// informado no cadastro para conseguir cumprimentar o convidado na carteira.
const NAME_KEY = "carteira.nome";

const readStoredName = () => {
    try {
        return localStorage.getItem(NAME_KEY) || "";
    }
    catch {
        return "";
    }
};

const writeStoredName = (name) => {
    try {
        if (name)
            localStorage.setItem(NAME_KEY, name);
        else
            localStorage.removeItem(NAME_KEY);
    }
    catch {
        /* storage indisponível: seguimos sem o nome */
    }
};

// Context único do app: a sessão autenticada (JWT), a carteira do convidado logado
// e o registro das transações feitas nesta sessão.
const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
    // Sessão vinda do JWT: { token, cpf, role }. null = ninguém logado.
    const [session, setSession] = useState(null);
    // Carteira do convidado logado (GET /carteira/saldo): { balance, token }.
    const [wallet, setWallet] = useState(null);
    // Nome de exibição (ver NAME_KEY acima).
    const [profileName, setProfileName] = useState("");
    // Transações realizadas nesta sessão. A API não expõe listagem de histórico
    // (não há GET /transacoes), então as telas de extrato mostram apenas o que
    // foi feito desde que o operador entrou — e avisam disso na interface.
    const [transactions, setTransactions] = useState([]);
    // Boot inicial (restauração da sessão salva) e último erro de API.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Registra a falha da API e mostra a mensagem amigável na interface.
    const report = useCallback((err, context, fallback) => {
        setError(err.friendlyMessage || fallback);
        console.error(`[API] ${context}:`, err);
    }, []);

    // Recarrega saldo e token de 6 dígitos do convidado logado.
    // Só faz sentido para ROLE_CLIENTE — os demais perfis não têm carteira.
    const refreshWallet = useCallback(async (active) => {
        const target = active ?? session;
        if (target?.role !== ROLES.CLIENTE)
            return null;
        try {
            const data = await walletService.getMyWallet();
            setWallet(data);
            return data;
        }
        catch (err) {
            report(err, "GET /carteira/saldo falhou", "Não foi possível carregar seu saldo.");
            throw err;
        }
    }, [session, report]);

    // No boot, tenta restaurar a sessão salva no navegador (JWT de 12h).
    // Se for um convidado, já busca o saldo para a carteira abrir preenchida.
    useEffect(() => {
        const restored = authService.restoreSession();
        setSession(restored);
        setProfileName(restored ? readStoredName() : "");
        if (restored?.role === ROLES.CLIENTE) {
            walletService.getMyWallet()
                .then(setWallet)
                .catch(() => { /* token expirado/inválido: a tela protegida redireciona pro login */ })
                .finally(() => setLoading(false));
            return;
        }
        setLoading(false);
    }, []);

    // POST /auth/login. "expectedRole" é o perfil da tela usada (convidado/barraca/caixa):
    // como o backend tem um login único para os três, barramos aqui quem entrou pela porta errada.
    const signIn = useCallback(async (cpf, senha, expectedRole) => {
        setError("");
        const active = await authService.login(cpf, senha);
        if (!active) {
            authService.logout();
            const err = new Error("Sessão inválida.");
            err.friendlyMessage = "Não foi possível ler a sessão retornada pela API.";
            throw err;
        }
        if (expectedRole && active.role !== expectedRole) {
            authService.logout();
            const err = new Error("Perfil incorreto.");
            err.friendlyMessage = "Este CPF não tem acesso a este perfil. Use a tela correta na página inicial.";
            throw err;
        }
        setSession(active);
        setTransactions([]);
        setProfileName(readStoredName());
        if (active.role === ROLES.CLIENTE)
            await refreshWallet(active);
        return active;
    }, [refreshWallet]);

    // POST /auth/cadastrar + login automático. O backend só cadastra clientes
    // (barraca e caixa são criados fora do app), então o perfil resultante é sempre ROLE_CLIENTE.
    const signUp = useCallback(async (nome, cpf, senha) => {
        setError("");
        const active = await authService.register(nome, cpf, senha);
        setSession(active);
        setTransactions([]);
        writeStoredName(nome);
        setProfileName(nome);
        const created = await refreshWallet(active);
        return { session: active, wallet: created };
    }, [refreshWallet]);

    // Logout: o backend é stateless, então basta descartar o JWT e limpar o estado local.
    const signOut = useCallback(() => {
        authService.logout();
        writeStoredName("");
        setSession(null);
        setWallet(null);
        setProfileName("");
        setTransactions([]);
        setError("");
    }, []);

    // Guarda a transação recém-confirmada no topo da lista da sessão.
    const recordTransaction = useCallback((tx) => {
        setTransactions((prev) => [tx, ...prev]);
    }, []);

    // GET /usuarios/buscar?token= — identifica o cliente pelo código de 6 dígitos (barraca).
    const findCustomer = useCallback(async (token) => {
        setError("");
        return customerService.findCustomerByToken(token);
    }, []);

    // GET /usuarios/buscar?cpf= — identifica o cliente pelo CPF (caixa).
    const findCustomerByCpf = useCallback(async (cpf) => {
        setError("");
        return customerService.findCustomerByCpf(cpf);
    }, []);

    // POST /transacoes/debitar — cobrança na barraca.
    const charge = useCallback(async (token, amount, meta) => {
        setError("");
        const tx = await transactionService.debitar(token, amount, meta);
        recordTransaction(tx);
        return tx;
    }, [recordTransaction]);

    // POST /transacoes/depositar — recarga presencial feita pelo caixa.
    const deposit = useCallback(async (cpf, amount, meta) => {
        setError("");
        const tx = await transactionService.depositar(cpf, amount, meta);
        recordTransaction(tx);
        return tx;
    }, [recordTransaction]);

    // POST /transacoes/reembolsar — devolve o saldo integral e zera a carteira.
    const refund = useCallback(async (cpf, meta) => {
        setError("");
        const tx = await transactionService.reembolsar(cpf, meta);
        recordTransaction(tx);
        return tx;
    }, [recordTransaction]);

    // Sessões derivadas, no formato que cada grupo de telas espera.
    // currentGuest só existe para ROLE_CLIENTE (é quem tem carteira);
    // currentBooth/cashierLoggedIn identificam o operador logado.
    const currentGuest = useMemo(() => {
        if (session?.role !== ROLES.CLIENTE)
            return null;
        return {
            cpf: session.cpf,
            name: profileName,
            balance: wallet?.balance ?? 0,
            token: wallet?.token ?? "",
        };
    }, [session, wallet, profileName]);

    const currentBooth = useMemo(() => {
        if (session?.role !== ROLES.BARRACA)
            return null;
        return { cpf: session.cpf, name: profileName || "Barraca" };
    }, [session, profileName]);

    const cashierLoggedIn = session?.role === ROLES.CAIXA;
    const adminLoggedIn = session?.role === ROLES.ADMIN;

    const value = useMemo(() => ({
        session,
        currentGuest,
        currentBooth,
        cashierLoggedIn,
        adminLoggedIn,
        transactions,
        loading,
        error,
        setError,
        signIn,
        signUp,
        signOut,
        refreshWallet,
        findCustomer,
        findCustomerByCpf,
        charge,
        deposit,
        refund,
    }), [session, currentGuest, currentBooth, cashierLoggedIn, adminLoggedIn, transactions, loading, error, signIn, signUp, signOut, refreshWallet, findCustomer, findCustomerByCpf, charge, deposit, refund]);

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// Hook de acesso ao estado global. Lança erro se usado fora do Provider (ajuda a pegar bug de composição cedo).
export function useAppState() {
    const ctx = useContext(AppStateContext);
    if (!ctx)
        throw new Error("useAppState deve ser usado dentro de <AppStateProvider>.");
    return ctx;
}

// Entrega o estado compartilhado como props para as páginas,
// que continuam recebendo tudo via props. É o que o router.jsx usa em cada rota.
export function Connected({ component: Component }) {
    const state = useAppState();
    return <Component {...state} />;
}
