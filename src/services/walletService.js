import api from "./api";

// GET /carteira/saldo — exclusivo de ROLE_CLIENTE.
// Resposta: { saldo: BigDecimal, tokenAutorizacao: "482193" }.
// Traduz para o formato que as telas do convidado já usam (balance/token numéricos).
export async function getMyWallet() {
    const { data } = await api.get("/carteira/saldo");
    return {
        balance: Number(data?.saldo ?? 0),
        token: String(data?.tokenAutorizacao ?? ""),
    };
}
