import App from "@/App.tsx";
import "@/index.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl="https://mazeton.github.io/tonconnect-manifest.json">
      <App />
    </TonConnectUIProvider>
  </StrictMode>
);
