import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        await axios.post(`${API_URL}/auth/register`, {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setSuccess("Registered successfully. Please login.");
        setIsRegister(false);
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("token", res.data.token);

        let welcomeName = "";
        try {
          const me = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${res.data.token}` },
          });
          welcomeName = me.data.name || "";
          localStorage.setItem("userName", welcomeName);
          localStorage.setItem(
            "favoriteIds",
            JSON.stringify((me.data.favorites || []).map(String))
          );
          window.dispatchEvent(new Event("favorites-updated"));
        } catch {
          localStorage.setItem("favoriteIds", JSON.stringify([]));
          window.dispatchEvent(new Event("favorites-updated"));
        }

        navigate("/products", {
          state: { welcome: welcomeName ? `Welcome, ${welcomeName}` : "" },
        });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to backend. Start backend on http://localhost:5000.");
      } else {
        setError("Request failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>{isRegister ? "Create account" : "Sign in"}</h1>

        {isRegister && (
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Your name"
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            placeholder="Enter password"
            required
          />
        </label>

        {success ? <p className="success-msg">{success}</p> : null}
        {error ? <p className="error-msg">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => setIsRegister((prev) => !prev)}
          >
            {isRegister ? "Sign in" : "Create account"}
          </button>
        </p>
      </form>
    </section>
  );
}
