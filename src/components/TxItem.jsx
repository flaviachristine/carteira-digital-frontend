import { R, fmtDate, fmtTime, txBg, txIcon, txColor, txSign } from "../helpers/formatter";

// Linha de uma transação em uma lista (extrato do convidado, vendas da barraca, movimentações do caixa).
// "onClick" é opcional: quando informado, a linha vira clicável (ex: para abrir o detalhe da transação).
export default function TxItem({ tx, onClick }) {
    return (<button onClick={onClick} className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl border border-border hover:bg-muted/60 transition-colors text-left">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${txBg(tx.type)}`}>
        {txIcon(tx.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{tx.boothName || tx.cashier || "Caixa"}</p>
        <p className="text-xs text-muted-foreground">{fmtDate(tx.createdAt)} · {fmtTime(tx.createdAt)}</p>
      </div>
      <span className={`font-bold text-sm flex-shrink-0 ${txColor(tx.type)}`}>
        {txSign(tx.type)}{R(tx.amount)}
      </span>
    </button>);
}
