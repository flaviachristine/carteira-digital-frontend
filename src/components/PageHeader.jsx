import { ArrowLeft } from "lucide-react";

// Cabeçalho padrão de página interna: título + botão opcional de voltar + slot de ação à direita.
// "onBack" só aparece quando informado (Home e telas de sucesso, por exemplo, não têm voltar).
// "action" é um elemento livre (ex: um botão extra) renderizado à direita do título.
export default function PageHeader({ title, onBack, action }) {
    return (<header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      {onBack && (<button onClick={onBack} className="p-2 -ml-2 rounded-xl text-foreground/60 hover:bg-muted transition-colors">
          <ArrowLeft size={20}/>
        </button>)}
      <h1 className="flex-1 font-display text-lg font-bold text-foreground leading-tight">{title}</h1>
      {action}
    </header>);
}
