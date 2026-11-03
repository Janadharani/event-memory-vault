
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";

import { AuthProvider, useAuth } from "react-oidc-context";
import cognitoAuthConfig from "./authConfig";

const cognitoDomain =
  "https://ap-southeast-2a0rzmwlan.auth.ap-southeast-2.amazoncognito.com";

const clientId = "25tv9fopn1j00jb11hsf73oiha";
const logoutUri = "http://localhost:5173/";

// Check whether the current URL is a public shared event.
function isSharedEventPage() {
  return /^\/shared\/[^/]+\/?$/.test(window.location.pathname);
}

function AuthenticatedApp() {
  const auth = useAuth();

  // PUBLIC PAGE: Shared events do not require sign-in.
  if (isSharedEventPage()) {
    return <App />;
  }

  if (auth.isLoading) {
    return <p>Loading your account...</p>;
  }

  if (auth.error) {
    return <p>Sign-in error: {auth.error.message}</p>;
  }

  // PRIVATE PAGES: Require authentication.
  if (!auth.isAuthenticated) {
    return (
      <main className="signin-page">
        <div className="signin-card">
          <div className="signin-brand">
            <div className="brand-icon">M</div>
            <span>MemoryVault</span>
          </div>
          <h1 className="signin-title">Event Memory Vault</h1>
          <p className="signin-subtitle">Sign in to access your event memories.</p>
          <button className="primary-button signin-btn" onClick={() => auth.signinRedirect()}>
            Sign in / Sign up
          </button>
        </div>
      </main>
    );
  }

  const email = auth.user?.profile?.email;

  return (
    <>
      <header className="auth-topbar">
        <span className="auth-email">{email || "Signed in"}</span>

        <button
          className="signout-button"
          onClick={() => {
            auth.removeUser();

            window.location.href =
              `${cognitoDomain}/logout?client_id=${clientId}` +
              `&logout_uri=${encodeURIComponent(logoutUri)}`;
          }}
        >
          Sign out
        </button>
      </header>

      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <AuthenticatedApp />
    </AuthProvider>
  </React.StrictMode>
);
