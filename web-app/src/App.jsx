import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const getValidFavoriteIds = () => {
      try {
        const ids = JSON.parse(localStorage.getItem("favoriteIds") || "[]");
        if (!Array.isArray(ids)) return [];
        return ids
          .map((id) => String(id).trim())
          .filter((id) => id.length > 0);
      } catch {
        return [];
      }
    };

    const updateCount = () => {
      const ids = getValidFavoriteIds();
      setFavoriteCount(ids.length);
      localStorage.setItem("favoriteIds", JSON.stringify(ids));
    };

    updateCount();
    window.addEventListener("favorites-updated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("favorites-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Micro Marketplace
        </Link>
        <nav className="topbar-nav">
          {token ? (
            <Link to="/favorites" className="nav-icon-link" title="Favorites">
              <span className="nav-heart-wrap">
                <FaHeart />
                {favoriteCount > 0 ? (
                  <span className="nav-heart-badge">{favoriteCount}</span>
                ) : null}
              </span>
            </Link>
          ) : null}
          <Link to="/products">Products</Link>
          {token ? (
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("favoriteIds");
                localStorage.removeItem("userName");
                window.dispatchEvent(new Event("favorites-updated"));
                navigate("/login");
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={token ? "/products" : "/login"} replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/favorites"
            element={token ? <Favorites /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
