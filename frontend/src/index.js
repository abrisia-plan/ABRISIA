import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Retire l'écran d'accueil (logo) une fois le site prêt : au moins 0,8 s pour qu'on voie le logo.
const splash = document.getElementById("splash");
if (splash && document.documentElement.classList.contains("avec-splash")) {
  setTimeout(() => {
    splash.classList.add("cache");
    setTimeout(() => {
      splash.remove();
      document.documentElement.classList.remove("avec-splash");
    }, 500);
  }, 800);
} else if (splash) {
  splash.remove();
}
