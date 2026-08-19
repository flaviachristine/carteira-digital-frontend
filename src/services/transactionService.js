import api from "./api";
import { onlyDigits } from "../helpers/formatter";

// O backend usa o enum TipoTransacao (DEPOSITO/DEBITO/REEMBOLSO); as telas e os helpers
// de formatação (txLabel, txColor, txIcon) usam os rótulos em minúsculo do front.
const TIPO_TO_TYPE = {
    DEPOSITO: "credito",
    DEBITO: "compra",
    REEMBOLSO: "reembolso",
};

// Converte o TransacaoResponse ({ idTransacao, valor, tipo, dataHora }) para o formato
// de transação usado pelo app. "dataHora" vem como texto ISO do LocalDateTime.
export function normalizeTransaction(data, extra = {}) {
    return {
        id: String(data?.idTransacao ?? ""),
        amount: Number(data?.valor ?? 0),
        type: TIPO_TO_TYPE[data?.tipo] ?? "compra",
        createdAt: data?.dataHora ? new Date(data.dataHora) : new Date(),
        // Campos que o backend não devolve (nome do cliente, barraca de origem) são
        // preenchidos por quem chamou, a partir do que já está na tela.
        ...extra,
    };
}

// POST /transacoes/debitar — { tokenAutorizacao, valor }. Perfis BARRACA e CAIXA.
// O saldo é validado no backend dentro de uma transação com lock pessimista:
// se não houver saldo, a resposta é 422 com { erro: "Saldo insuficiente para a transação." }.
export async function debitar(tokenAutorizacao, valor, extra) {
    const { data } = await api.post("/transacoes/debitar", { tokenAutorizacao, valor });
    return normalizeTransaction(data, extra);
}

// POST /transacoes/depositar — { cpfCliente, valor }. Exclusivo de ROLE_CAIXA.
// É a recarga presencial: só o caixa pode creditar saldo na carteira de um cliente.
export async function depositar(cpfCliente, valor, extra) {
    const { data } = await api.post("/transacoes/depositar", { cpfCliente: onlyDigits(cpfCliente), valor });
    return normalizeTransaction(data, extra);
}

// POST /transacoes/reembolsar — { cpfCliente }. Exclusivo de ROLE_CAIXA.
// O backend devolve SEMPRE o saldo integral e zera a carteira (não existe reembolso parcial);
// o valor efetivamente devolvido vem no campo "valor" da resposta.
export async function reembolsar(cpfCliente, extra) {
    const { data } = await api.post("/transacoes/reembolsar", { cpfCliente: onlyDigits(cpfCliente) });
    return normalizeTransaction(data, extra);
}
