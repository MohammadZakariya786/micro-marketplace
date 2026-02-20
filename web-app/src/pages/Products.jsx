import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Product from "./Product";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PAGE_SIZE = 5;

export default function Products() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favoriteIds") || "[]");
    } catch {
      return [];
    }
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState(location.state?.welcome || "");
  const [togglingIds, setTogglingIds] = useState([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWelcome("");
      return;
    }

    if (!welcome) {
      const savedName = localStorage.getItem("userName");
      if (savedName) setWelcome(`Welcome, ${savedName}`);
    }
  }, [welcome]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchProducts = async (currentPage, currentSearch) => {
    const requestId = ++requestIdRef.current;
    const cacheKey = `products:${currentPage}:${currentSearch}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProducts(parsed.products || []);
        setTotal(parsed.total || 0);
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    } else {
      setProducts([]);
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/products`, {
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          search: currentSearch,
        },
      });

      if (requestId !== requestIdRef.current) return;

      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          products: res.data.products || [],
          total: res.data.total || 0,
        })
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts(page, search);
  }, [page, search]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavorites([]);
      return;
    }

    const syncFavorites = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const syncedFavorites = (res.data.favorites || []).map(String);
        setFavorites(syncedFavorites);
        if (res.data.name) {
          localStorage.setItem("userName", res.data.name);
        }
        localStorage.setItem("favoriteIds", JSON.stringify(syncedFavorites));
      } catch {
        setFavorites([]);
      }
    };

    syncFavorites();
  }, []);

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to favorite products.");
      return;
    }

    const normalizedId = String(productId);
    if (togglingIds.includes(normalizedId)) return;

    setTogglingIds((prev) => [...prev, normalizedId]);
    const previousFavorites = favorites;
    const nextLocalFavorites = favorites.includes(normalizedId)
      ? favorites.filter((id) => String(id) !== normalizedId)
      : [...favorites, normalizedId];

    setFavorites(nextLocalFavorites);
    localStorage.setItem("favoriteIds", JSON.stringify(nextLocalFavorites));
    window.dispatchEvent(new Event("favorites-updated"));

    try {
      const res = await axios.post(
        `${API_URL}/products/favorite/${normalizedId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const nextFavorites = (res.data.favorites || []).map(String);
      setFavorites(nextFavorites);
      localStorage.setItem("favoriteIds", JSON.stringify(nextFavorites));
      window.dispatchEvent(new Event("favorites-updated"));
    } catch (err) {
      setFavorites(previousFavorites);
      localStorage.setItem("favoriteIds", JSON.stringify(previousFavorites));
      window.dispatchEvent(new Event("favorites-updated"));
      alert(err.response?.data?.message || "Could not update favorites.");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== normalizedId));
    }
  };

  return (
    <section className="products-page">
      {welcome ? <p className="success-msg">{welcome}</p> : null}
      <div className="products-head">
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {loading ? <p>Loading products...</p> : null}

      <div className="product-grid">
        {products.map((product) => (
          <Product
            key={product._id}
            product={product}
            isFavorite={favorites.includes(String(product._id))}
            onToggleFavorite={toggleFavorite}
            isToggling={togglingIds.includes(String(product._id))}
          />
        ))}
      </div>

      <div className="pager">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages || loading}
        >
          Next
        </button>
      </div>
    </section>
  );
}
