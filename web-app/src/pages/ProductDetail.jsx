import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart } from "react-icons/fa";

const API_URL = "http://localhost:5000";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isToggling, setIsToggling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favoriteIds = JSON.parse(localStorage.getItem("favoriteIds") || "[]");
      return favoriteIds.includes(id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsFavorite(false);
      return;
    }

    const syncFavoriteState = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favoriteIds = (res.data.favorites || []).map(String);
        localStorage.setItem("favoriteIds", JSON.stringify(favoriteIds));
        window.dispatchEvent(new Event("favorites-updated"));
        setIsFavorite(favoriteIds.includes(id));
      } catch {
        setIsFavorite(false);
      }
    };

    syncFavoriteState();
  }, [id]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/products`, {
          params: {
            page: 1,
            limit: 100,
            search: "",
          },
        });
        const found = (res.data.products || []).find((p) => p._id === id);
        if (!found) {
          setError("Product not found");
        } else {
          setProduct(found);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }
    if (isToggling) return;

    setIsToggling(true);
    let previousFavorites = [];
    try {
      previousFavorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]");
    } catch {
      previousFavorites = [];
    }

    const nextLocalFavorites = isFavorite
      ? previousFavorites.filter((favoriteId) => String(favoriteId) !== String(id))
      : [...previousFavorites, String(id)];

    setIsFavorite(!isFavorite);
    localStorage.setItem("favoriteIds", JSON.stringify(nextLocalFavorites));
    window.dispatchEvent(new Event("favorites-updated"));

    try {
      const res = await axios.post(
        `${API_URL}/products/favorite/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nextFavorites = (res.data.favorites || []).map(String);
      localStorage.setItem("favoriteIds", JSON.stringify(nextFavorites));
      window.dispatchEvent(new Event("favorites-updated"));
      setIsFavorite(nextFavorites.includes(id));
    } catch (err) {
      localStorage.setItem("favoriteIds", JSON.stringify(previousFavorites));
      window.dispatchEvent(new Event("favorites-updated"));
      setIsFavorite(previousFavorites.includes(id));
      alert(err.response?.data?.message || "Favorite failed");
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p className="error-msg">{error}</p>;
  if (!product) return <p>No product data.</p>;

  return (
    <section className="detail-page">
      <img src={product.image} alt={product.title} className="detail-image" />

      <div className="detail-content">
        <h1>{product.title}</h1>
        <p className="product-price">${Number(product.price).toFixed(2)}</p>
        <p>{product.description}</p>
        <div className="detail-actions">
          <button
            type="button"
            className={`favorite-icon-btn detail-favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={handleFavorite}
            disabled={isToggling}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Unfavorite" : "Favorite"}
          >
            <FaHeart />
          </button>
          <Link to="/products" className="secondary-btn">
            Back to products
          </Link>
        </div>
      </div>
    </section>
  );
}
