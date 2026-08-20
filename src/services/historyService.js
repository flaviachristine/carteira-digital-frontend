import api from "./api";

const RESOURCE = "/transacoes/convidado";

// Normaliza dados de histórico vindos da API
export function normalizeHistoryItem(item) {
    return {
        id: String(item.id ?? ""),
        type: String(item.type ?? "compra"),
        amount: Number(item.amount ?? 0),
        description: String(item.description ?? ""),
        createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
    };
}

// GET /transacoes/convidado — lista histórico de transações do cliente logado (permanente)
export async function listMyTransactions(params) {
    const { data } = await api.get(RESOURCE, { params });
    return (data ?? []).map(normalizeHistoryItem);
}
