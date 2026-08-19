import { AlertCircle } from "lucide-react";

// Faixa de erro padrão exibida em formulários e buscas quando algo falha (validação ou API).
export default function ErrorBanner({ msg }) {
    return (<div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2">
      <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5"/>
      <p className="text-sm text-red-700">{msg}</p>
    </div>);
}
