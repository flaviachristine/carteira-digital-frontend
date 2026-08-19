import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ponto de entrada da aplicação: monta o componente raiz <App/> na div#root do index.html.
createRoot(document.getElementById("root")).render(<App />);
