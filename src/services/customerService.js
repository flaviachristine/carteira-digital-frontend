import api from "./api";

// GET /usuarios/buscar?token=482193 — liberado para ROLE_BARRACA e ROLE_CAIXA.
// Resposta: { nome, cpf, saldoOculto }. Por privacidade o backend devolve o CPF
// mascarado ("***.***.***-**") e saldoOculto sempre null: a barraca só precisa
// confirmar o nome antes de debitar, não conhecer o saldo do cliente.
export async function findCustomerByToken(token) {
    const { data } = await api.get("/usuarios/buscar", { params: { token } });
    return {
        name: data?.nome ?? "",
        cpfMasked: data?.cpf ?? "",
        token: String(token),
        // Mantido explicitamente como null: nenhuma tela deve exibir saldo aqui.
        balance: null,
    };
}
