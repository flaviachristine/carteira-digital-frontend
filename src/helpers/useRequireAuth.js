import { useEffect } from "react";
import { useNavigate } from "react-router";

// Hook de guarda de rota, usado no topo de cada página protegida.
// "session" é o que identifica a sessão daquele perfil: currentGuest, currentBooth ou cashierLoggedIn.
// Se não houver sessão, redireciona (via efeito, após o render) para a tela de login correspondente.
// "waiting" cobre o boot do app: enquanto o Provider ainda está restaurando o JWT salvo no
// navegador a sessão é null, e sem essa espera o usuário seria jogado no login a cada F5.
// Devolve true/false no MESMO render em que é chamado, para que a página possa fazer
// `if (!useRequireAuth(...)) return null;` e evitar acessar campos de uma sessão inexistente.
export function useRequireAuth(session, loginPath, waiting = false) {
    const navigate = useNavigate();
    useEffect(() => {
        if (!waiting && !session)
            navigate(loginPath);
    }, [session, loginPath, waiting, navigate]);
    return Boolean(session);
}
