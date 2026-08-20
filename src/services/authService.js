import api from "./api";
import { clearSession, readSession, setToken } from "./authStorage";
import { onlyDigits } from "../helpers/formatter";

// Perfis devolvidos no claim "role" do JWT (enum Role do backend).
export const ROLES = {
    CLIENTE: "ROLE_CLIENTE",
    BARRACA: "ROLE_BARRACA",
    CAIXA: "ROLE_CAIXA",
    ADMIN: "ROLE_ADMIN",
};

// POST /auth/login — { cpf, senha } -> { token }.
// O backend usa o CPF como username, então mandamos só os dígitos (sem máscara).
// Devolve a sessão já decodificada ({ token, cpf, role }) e persiste o JWT.
export async function login(cpf, senha) {
    const { data } = await api.post("/auth/login", { cpf: onlyDigits(cpf), senha });
    setToken(data.token);
    return readSession(data.token);
}

// POST /auth/cadastrar — { nome, cpf, senha } -> 201 sem corpo.
// Sempre cria um usuário com ROLE_CLIENTE e já gera a carteira com token de 6 dígitos.
// Como não vem token na resposta, fazemos o login logo em seguida para abrir a sessão.
export async function register(nome, cpf, senha) {
    const cpfDigits = onlyDigits(cpf);
    await api.post("/auth/cadastrar", { nome, cpf: cpfDigits, senha });
    return login(cpfDigits, senha);
}

// Encerra a sessão local. O backend é stateless (JWT), então não há chamada de logout.
export function logout() {
    clearSession();
}

// Recupera a sessão salva no navegador, usada no boot do app para manter o usuário logado
// entre recarregamentos da página. Devolve null se não houver token válido.
export { readSession as restoreSession };
