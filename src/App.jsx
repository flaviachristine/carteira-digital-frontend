import { RouterProvider } from "react-router";
import { AppStateProvider } from "./provider/appState";
import { router } from "./provider/router";

// Componente raiz: envolve toda a aplicação com o Provider de estado global
// (sessão autenticada via JWT, carteira do convidado e transações) e com o roteador.
export default function App() {
    return (
        <AppStateProvider>
            <RouterProvider router={router} />
        </AppStateProvider>
    );
}
