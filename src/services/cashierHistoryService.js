import api from "./api";

const RESOURCE = "/transacoes/caixa";

// Normaliza dados de histórico de transações do caixa
export function normalizeCashierTransaction(item) {
    return {
        id: String(item.id ?? ""),
        type: String(item.type ?? "credito"),
        amount: Number(item.amount ?? 0),
        description: String(item.description ?? ""),
        operatorName: String(item.operatorName ?? "Operador"),
        guestName: String(item.guestName ?? "Cliente"),
        createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
    };
}

// GET /transacoes/caixa — lista histórico de transações do caixa (créditos, reembolsos, etc)
export async function listCashierTransactions(params) {
    const { data } = await api.get(RESOURCE, { params });
    return (data ?? []).map(normalizeCashierTransaction);
}
