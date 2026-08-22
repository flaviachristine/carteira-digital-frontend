import api from "./api";
import { onlyDigits } from "../helpers/formatter";

// GET /usuarios/buscar?token=482193 — liberado para ROLE_BARRACA e ROLE_CAIXA.
// Resposta: { nome, cpf, saldoOculto }. Por privacidade o backend devolve o CPF
// mascarado ("***.***.***-**") e saldoOculto sempre null: a barraca só precisa
// confirmar o nome antes de debitar, não conhecer o saldo do cliente.
export async function findCustomerByToken(token) {
    const { data } = await api.get("/usuarios/buscar/token", { params: { token } });
    return {
        name: data?.nome ?? "",
        cpfMasked: data?.cpf ?? "",
        token: String(token),
        // Mantido explicitamente como null: nenhuma tela deve exibir saldo aqui.
        balance: null,
    };
}

// GET /usuarios/buscar?cpf=54195453810 — busca por CPF (usado pelo caixa).
// Resposta: { nome, cpf }. O caixa precisa do CPF completo para fazer reembolso/crédito.
export async function findCustomerByCpf(cpf) {
    const { data } = await api.get("/usuarios/buscar/cpf", { params: { cpf } });
    return {
        name: data?.nome ?? "",
        cpf: String(cpf),
        cpfMasked: data?.cpf ?? "",
        balance: null,
    };
}

// GET /carteira/saldo/reembolso/{cpf} — obtém o saldo de um cliente para reembolso.
export async function getCustomerBalance(cpfReembolso) {
    try {
        const { data } = await api.get("/carteira/saldo/reembolso", { params: { cpfReembolso: onlyDigits(cpfReembolso) } });
        return Number(data?.saldo ?? 0);
    } catch (error) {
        // 403 (acesso negado), 404 (não encontrado), ou qualquer outro erro
        // Retorna null silenciosamente — a tela mostrará "Saldo integral da carteira"
        return null;
    }
}
