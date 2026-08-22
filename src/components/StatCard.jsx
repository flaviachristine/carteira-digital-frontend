// Card pequeno usado em grids de estatísticas nos dashboards (ex: "Total vendido", "Nº de vendas").
// colorClass define a cor do ícone/fundo do círculo; tem um valor padrão neutro (primary).
export default function StatCard({ label, value, icon, colorClass = "bg-primary/10 text-primary" }) {
    return (<div className="bg-card rounded-2xl w-full p-4 flex items-center gap-3 border border-border shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground leading-tight truncate">{label}</p>
        <p className="font-bold text-foreground text-sm leading-tight mt-0.5 truncate">{value}</p>
      </div>
    </div>);
}
