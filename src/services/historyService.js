import api from "./api";

const RESOURCE = "/transacoes/convidado";

const MAPA_TIPOS = {
    DEBITO: "compra",
    DEPOSITO: "credito",
    REEMBOLSO: "reembolso"
};

export function normalizeHistoryItem(item) {
    return {
        id: String(item.idTransacao ?? ""),
        type: MAPA_TIPOS[item.tipo] || "compra",
        amount: Number(item.valor ?? 0),
        description: String(item.nomeOperador ?? "Caixa/Barraca"),
        createdAt: item.dataHora ? new Date(item.dataHora) : new Date(),
    };
}

// GET /transacoes/convidado — lista histórico de transações do cliente logado (permanente)
export async function listMyTransactions(params) {
    const { data } = await api.get(RESOURCE, { params });
    return (data ?? []).map(normalizeHistoryItem);
}
