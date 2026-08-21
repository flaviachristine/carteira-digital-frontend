import { Plus, RefreshCw, ShoppingBag } from "lucide-react";

// Formata um número para moeda brasileira (ex: 1234.5 -> "R$ 1.234,50").
export const R = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Formata um objeto Date para "HH:mm" no padrão brasileiro.
export const fmtTime = (d) => {
    if (!d) return "—";
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date) ? "—" : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

// Formata um objeto Date para "dd/mm".
export const fmtDate = (d) => {
    if (!d) return "—";
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date) ? "—" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

// Aceita "12,50" e "12.50"; devolve 0 para qualquer entrada inválida.
export const parseAmount = (value) => parseFloat(String(value).replace(",", ".")) || 0;

// Remove tudo que não for dígito de uma string (usado para CPF, código do convidado etc).
export const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

// Aplica a máscara de CPF (000.000.000-00) conforme o usuário digita.
// Trunca em 11 dígitos e vai inserindo pontos/traço de acordo com o tamanho já digitado.
export const applyMask = (value) => {
    const d = onlyDigits(value).slice(0, 11);
    if (d.length <= 3)
        return d;
    if (d.length <= 6)
        return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9)
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

// Formata valor monetário conforme o usuário digita (ex: "2000" -> "20,00", "200000" -> "2.000,00").
// Interpreta os dígitos como centavos e aplica separador de milhares e decimal.
export const formatMoneyInput = (value) => {
    const d = onlyDigits(value);
    if (!d) return "";
    const padded = d.padStart(3, "0"); 
    let intPart = padded.slice(0, -2); 
    const decPart = padded.slice(-2); 
    intPart = String(Number(intPart)); 
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
    return `${formatted},${decPart}`;
};

// Mostra só os 4 últimos dígitos do CPF, escondendo o resto com "•" (usado em telas de exibição, não de digitação).
export const partialMask = (cpf) => {
    const d = onlyDigits(cpf);
    return `•••.•••.${d.slice(6, 9)}-${d.slice(9, 11)}`;
};

// Metadados visuais de cada tipo de transação: rótulo, cor de texto, cor de fundo e ícone.
const TX = {
    compra: { label: "Compra", color: "text-red-600", bg: "bg-red-100", Icon: ShoppingBag },
    credito: { label: "Crédito", color: "text-green-600", bg: "bg-green-100", Icon: Plus },
    reembolso: { label: "Reembolso", color: "text-blue-600", bg: "bg-blue-100", Icon: RefreshCw },
};

// Nome legível do tipo de transação (ex: "credito" -> "Crédito").
export const txLabel = (t) => TX[t]?.label;

// Sinal a ser exibido antes do valor: "+" para crédito, "-" para os demais (compra/reembolso saem do saldo do caixa/convidado).
export const txSign = (t) => (t === "credito" ? "+" : "-");

// Cor de texto associada ao tipo de transação.
export const txColor = (t) => TX[t]?.color;

// Cor de fundo (badge) associada ao tipo de transação.
export const txBg = (t) => TX[t]?.bg;

// Ícone (componente lucide-react) do tipo de transação, já com a cor aplicada.
// Cai no ícone de "reembolso" como padrão se o tipo não for reconhecido.
export const txIcon = (t, size = 16) => {
    const { Icon, color } = TX[t] ?? TX.reembolso;
    return <Icon size={size} className={color}/>;
};
