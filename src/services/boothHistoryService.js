import api from "./api";

const RESOURCE = "/transacoes/barraca";

// Normaliza dados de histórico de transações da barraca
export function normalizeBoothTransaction(item) {
    return {
        id: String(item.id ?? ""),
        type: String(item.type ?? "compra"),
        amount: Number(item.amount ?? 0),
        guestName: String(item.guestName ?? ""),
        boothName: String(item.boothName ?? ""),
        createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
    };
}

// GET /transacoes/barraca — lista histórico de transações da barraca logada
export async function listBoothTransactions(params) {
    try {
        const { data } = await api.get(RESOURCE, { params });
        return (data ?? []).map(normalizeBoothTransaction);
    } catch (error) {
        throw error;
    }
}
