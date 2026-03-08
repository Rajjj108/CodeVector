import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TypewriterProvider } from "./components/layout/TypewriterContext.jsx";
import { ThemeProvider } from "./components/layout/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="830853151060-okv4i9gotus1ful19ie81aref5gjvn2u.apps.googleusercontent.com">
      <BrowserRouter>
        <ThemeProvider>
          <TypewriterProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </TypewriterProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);