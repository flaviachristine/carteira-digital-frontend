import axios from "axios";
import { getToken, clearSession } from "./authStorage";

// URL base da API REST (Spring Boot). Em desenvolvimento o padrão é "/api",
// que o Vite redireciona para http://localhost:8080 (ver server.proxy no vite.config.js) —
// isso evita o bloqueio de CORS, já que o backend não expõe Access-Control-Allow-Origin.
// Em produção defina VITE_API_URL com a URL pública da API (ver .env.example).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Instância única do axios usada por todos os services.
// Centraliza baseURL, timeout, header padrão de JSON e a injeção do token JWT.
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

// Interceptor de requisição: anexa "Authorization: Bearer <jwt>" em toda chamada
// quando há uma sessão ativa. O SecurityFilter do backend lê exatamente esse header.
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Converte qualquer falha do axios em uma mensagem legível para a interface.
// O GlobalErrorHandler do backend responde com { "erro": "mensagem" }; os demais
// campos (message/error) ficam como fallback para respostas padrão do Spring.
function toFriendlyMessage(error) {
    if (error.response) {
        const { status, data } = error.response;
        const detail = (data && (data.erro || data.message || data.error)) || "";
        if (status === 401)
            return detail || "Sessão expirada ou credenciais inválidas. Entre novamente.";
        if (status === 403)
            return detail || "Seu perfil não tem permissão para esta operação.";
        if (status === 404)
            return detail || "Registro não encontrado.";
        // 400 = IllegalArgumentException (ex: "Token inválido", "CPF já cadastrado")
        // 422 = IllegalStateException  (ex: "Saldo insuficiente para a transação.")
        if (status === 400 || status === 422)
            return detail || "Não foi possível concluir a operação.";
        if (status >= 500)
            return detail || "Erro no servidor. Tente novamente.";
        return detail || `Falha na requisição (HTTP ${status}).`;
    }
    if (error.code === "ECONNABORTED")
        return "A requisição demorou demais. Verifique sua conexão.";
    return "Não foi possível conectar à API. Verifique se o servidor está no ar.";
}

// Interceptor global de resposta: anexa "friendlyMessage" ao erro para que as telas
// e o Context (appState.jsx) possam exibi-lo direto na UI.
// Um 401 fora da própria rota de login significa token expirado/adulterado — a sessão é descartada.
api.interceptors.response.use((response) => response, (error) => {
    const url = error.config?.url ?? "";
    if (error.response?.status === 401 && !url.includes("/auth/"))
        clearSession();
    error.friendlyMessage = toFriendlyMessage(error);
    return Promise.reject(error);
});

export default api;
