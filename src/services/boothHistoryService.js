import api from "./api";

const RESOURCE = "/transacoes/barraca";

// Normaliza dados de histórico de transações da barraca
const MAPA_TIPOS = {
    DEBITO: "compra",
    DEPOSITO: "credito",
    REEMBOLSO: "reembolso"
};

export function normalizeBoothTransaction(item) {
    return {
        id: String(item.idTransacao ?? ""),
        type: MAPA_TIPOS[item.tipo] || "compra",
        amount: Number(item.valor ?? 0),
        guestName: String(item.nomeCliente ?? ""),
        boothName: String(item.nomeOperador ?? ""),
        createdAt: item.dataHora ? new Date(item.dataHora) : new Date(),
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
