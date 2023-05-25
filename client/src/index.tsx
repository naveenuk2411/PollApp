import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthenticatorProvider } from "./customHooks/useAuth";
import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <AuthenticatorProvider>
        <App />
      </AuthenticatorProvider>
    </Router>
  </React.StrictMode>
);
