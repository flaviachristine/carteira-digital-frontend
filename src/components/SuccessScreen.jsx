import { Check } from "lucide-react";

// Tela de sucesso padrão exibida ao final de um fluxo (cobrança, crédito, reembolso, cadastro).
// "value" é opcional (ex: o valor da transação); "subtitle" opcional (ex: novo saldo).
// "onSecondary/secondaryLabel" só aparecem quando informados — nem todo fluxo tem ação secundária.
export default function SuccessScreen({ title, value, subtitle, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
    return (<div className="flex flex-col items-center text-center gap-6 py-8 px-6">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
        <Check size={44} className="text-green-600" strokeWidth={3}/>
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
        {value && <p className="text-4xl font-bold text-primary mt-3">{value}</p>}
        {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
      </div>
      <div className="w-full flex flex-col gap-3">
        <button onClick={onPrimary} className="btn-primary w-full">{primaryLabel}</button>
        {onSecondary && secondaryLabel && (<button onClick={onSecondary} className="btn-secondary w-full">{secondaryLabel}</button>)}
      </div>
    </div>);
}
