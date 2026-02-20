import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

export default function Product({
  product,
  isFavorite,
  onToggleFavorite,
  isToggling = false,
}) {
  return (
    <article className="product-card">
      <button
        type="button"
        className={`favorite-icon-btn ${isFavorite ? "active" : ""}`}
        onClick={() => onToggleFavorite(product._id)}
        disabled={isToggling}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        title={isFavorite ? "Unfavorite" : "Favorite"}
      >
        <FaHeart />
      </button>

      <img src={product.image} alt={product.title} className="product-image" />

      <div className="product-content">
        <h3>{product.title}</h3>
        <p className="product-price">${Number(product.price).toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
      </div>

      <div className="product-actions">
        <Link to={`/products/${product._id}`} className="secondary-btn">
          View details
        </Link>
      </div>
    </article>
  );
}
