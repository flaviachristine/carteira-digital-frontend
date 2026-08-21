import api from "./api";

const RESOURCE = "/transacoes/caixa";

const MAPA_TIPOS = {
    DEBITO: "compra",
    DEPOSITO: "credito",
    REEMBOLSO: "reembolso"
};

export function normalizeCashierTransaction(item) {
    return {
        id: String(item.idTransacao ?? ""),
        type: MAPA_TIPOS[item.tipo] || "credito",
        amount: Number(item.valor ?? 0),
        description: String(item.nomeCliente ?? ""),
        operatorName: String(item.nomeOperador ?? "Operador"),
        guestName: String(item.nomeCliente ?? "Cliente"),
        createdAt: item.dataHora ? new Date(item.dataHora) : new Date(),
    };
}

// GET /transacoes/caixa — lista histórico de transações do caixa (créditos, reembolsos, etc)
export async function listCashierTransactions(params) {
    const { data } = await api.get(RESOURCE, { params });
    return (data ?? []).map(normalizeCashierTransaction);
}
