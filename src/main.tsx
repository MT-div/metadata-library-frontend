import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// TODO: ضع الـ Client ID الحقيقي الخاص بك من Google Cloud Console هنا
const GOOGLE_CLIENT_ID =
  "989147125991-mplq5qgqtt7ln0am6867lqpi6vrn8u28.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
