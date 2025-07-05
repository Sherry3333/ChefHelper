import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../services/authService'; 

export default function LoginPage() {
  const { login, googleLogin, error, loading, isLoggedIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      if (isLogin) {
        const { token } = await loginApi(email, password);
        login(token);
        navigate('/');
      } else {
        await registerApi(email, password);
        setMsg("Register Success, please login");
        setIsLogin(true);
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message || "An error occurred");
    }
  }

  return (
    <main>
      <section style={{ padding: "40px 0", textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            autoFocus
          />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
          />
          <button type="submit" disabled={loading} style={{ padding: 8 }}>
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button onClick={() => setIsLogin(l => !l)} style={{ margin: 12 }}>
          {isLogin ? "No account? Register" : "Have account? Login"}
        </button>
        <div style={{ margin: "16px 0" }}>
          <GoogleLoginButton
            onSuccess={async idToken => {
              setMsg("");
              const ok = await googleLogin(idToken);
              if (ok) setMsg("Google Login Success!");
            }}
            onError={err => setMsg(err)}
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {msg && <div style={{ color: "green" }}>{msg}</div>}
        {isLoggedIn && <div style={{ color: "green" }}>Logged in</div>}
      </section>
    </main>
  );
}
