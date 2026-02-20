import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Product from "./Product";

const API_URL = "http://localhost:5000";

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setFavoriteIds([]);
      return;
    }

    const syncFavorites = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = (res.data.favorites || []).map(String);
        setFavoriteIds(ids);
        if (res.data.name) {
          localStorage.setItem("userName", res.data.name);
        }
        localStorage.setItem("favoriteIds", JSON.stringify(ids));
        window.dispatchEvent(new Event("favorites-updated"));
      } catch {
        setFavoriteIds([]);
        localStorage.setItem("favoriteIds", JSON.stringify([]));
        window.dispatchEvent(new Event("favorites-updated"));
      }
    };

    syncFavorites();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/products`, {
          params: { page: 1, limit: 100, search: "" },
        });
        setProducts(res.data.products || []);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const favorites = useMemo(
    () => products.filter((p) => favoriteIds.includes(String(p._id))),
    [products, favoriteIds]
  );

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to manage favorites.");
      return;
    }

    const normalizedId = String(productId);
    if (togglingIds.includes(normalizedId)) return;

    setTogglingIds((prev) => [...prev, normalizedId]);
    const previousFavorites = favoriteIds;
    const nextLocalFavorites = favoriteIds.filter(
      (id) => String(id) !== normalizedId
    );
    setFavoriteIds(nextLocalFavorites);
    localStorage.setItem("favoriteIds", JSON.stringify(nextLocalFavorites));
    window.dispatchEvent(new Event("favorites-updated"));

    try {
      const res = await axios.post(
        `${API_URL}/products/favorite/${normalizedId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nextFavorites = (res.data.favorites || []).map(String);
      setFavoriteIds(nextFavorites);
      localStorage.setItem("favoriteIds", JSON.stringify(nextFavorites));
      window.dispatchEvent(new Event("favorites-updated"));
    } catch (err) {
      setFavoriteIds(previousFavorites);
      localStorage.setItem("favoriteIds", JSON.stringify(previousFavorites));
      window.dispatchEvent(new Event("favorites-updated"));
      alert(err.response?.data?.message || "Could not update favorites.");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== normalizedId));
    }
  };

  return (
    <section className="favorites-page">
      <h1>Favorite Products</h1>

      {loading ? <p>Loading favorites...</p> : null}
      {!loading && favorites.length === 0 ? (
        <p>No favorite products yet.</p>
      ) : null}

      <div className="product-grid">
        {favorites.map((product) => (
          <Product
            key={product._id}
            product={product}
            isFavorite={favoriteIds.includes(String(product._id))}
            onToggleFavorite={toggleFavorite}
            isToggling={togglingIds.includes(String(product._id))}
          />
        ))}
      </div>
    </section>
  );
}
