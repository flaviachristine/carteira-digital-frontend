// Soma o campo "amount" de todas as transações de um tipo específico (ex: total de créditos, total de compras).
// Os tipos são os rótulos do front ("credito"/"compra"/"reembolso"), já traduzidos
// do enum TipoTransacao do backend em services/transactionService.js.
export const sumByType = (transactions, type) => transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);

// Soma o campo "amount" de uma lista de transações, sem filtrar por tipo.
export const sumAmount = (transactions) => transactions.reduce((sum, t) => sum + t.amount, 0);
