// Persistência da sessão no navegador. Fica em um módulo separado de authService.js
// para que api.js possa ler o token sem criar dependência circular
// (authService importa api, api importa authStorage).

const TOKEN_KEY = "carteira.token";

// Lê o JWT salvo. Devolve null quando não há sessão (ou quando o storage está indisponível).
export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    }
    catch {
        return null;
    }
}

// Salva o JWT devolvido por POST /auth/login.
export function setToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    }
    catch {
        /* storage indisponível (modo privado): a sessão vale só enquanto a aba estiver aberta */
    }
}

// Descarta a sessão (logout, ou 401 detectado pelo interceptor em api.js).
export function clearSession() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    }
    catch {
        /* nada a fazer */
    }
}

// Lê o payload do JWT sem validar a assinatura — a validação real é do backend (TokenService).
// Aqui só precisamos dos claims para saber quem está logado e qual tela abrir.
export function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        // base64url -> base64, e decodifica preservando acentos (o nome pode ter "ã", "ç" etc).
        const json = decodeURIComponent(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
                .split("")
                .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
                .join(""),
        );
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}

// Monta o objeto de sessão a partir do JWT: sub = CPF, claim "role" = ROLE_CLIENTE/BARRACA/CAIXA,
// exp = expiração (12h, definida no TokenService). Devolve null se o token estiver ausente,
// ilegível ou já expirado — assim o app não tenta usar uma sessão morta.
export function readSession(token = getToken()) {
    if (!token)
        return null;
    const payload = decodeToken(token);
    if (!payload?.sub || !payload?.role)
        return null;
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
        clearSession();
        return null;
    }
    return { token, cpf: payload.sub, role: payload.role };
}
