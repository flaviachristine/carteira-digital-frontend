// Barrel file: reexporta todos os componentes reutilizáveis a partir de um único caminho,
// para que as páginas façam `import { PageHeader, TxItem } from "../../components"` em vez
// de um import por arquivo.
export { default as Bandeirinhas } from "./Bandeirinhas";
export { default as PageHeader } from "./PageHeader";
export { BoothBottomNav, CashierBottomNav } from "./BottomNav";
export { default as TxItem } from "./TxItem";
export { default as StatCard } from "./StatCard";
export { default as ErrorBanner } from "./ErrorBanner";
export { default as SuccessScreen } from "./SuccessScreen";
export { default as GuestInfoCard } from "./GuestInfoCard";
