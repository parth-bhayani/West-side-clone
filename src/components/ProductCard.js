import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (user && user.wishlist) {
            const inWishlist = user.wishlist.some(item =>
                (typeof item === 'string' ? item : item._id) === product._id
            );
            setIsWishlisted(inWishlist);
        }
    }, [user, product._id]);

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigating to product page
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            if (isWishlisted) {
                await axios.delete(`/api/wishlist/${product._id}`);
                setIsWishlisted(false);
            } else {
                await axios.post('/api/wishlist', { productId: product._id });
                setIsWishlisted(true);
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1, product.sizes?.[0] || '', product.colors?.[0]?.name || '');
    };

    const price = product.isOnSale && product.salePrice > 0 ? product.salePrice : product.price;
    const originalPrice = product.isOnSale && product.salePrice > 0 ? product.price : null;
    const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

    return (
        <Link to={`/product/${product._id}`} className="product-card">
            <div className="product-image">
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
                    alt={product.name}
                />

                {/* Badges */}
                <div className="product-badges">
                    {product.isOnSale && <span className="badge badge-sale">{discount}% OFF</span>}
                    {product.isFeatured && !product.isOnSale && <span className="badge badge-featured">Featured</span>}
                </div>

                {/* Quick Actions */}
                <div className="product-actions">
                    <button
                        className={`action-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={handleWishlist}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <FiHeart fill={isWishlisted ? "currentColor" : "none"} style={{ color: isWishlisted ? '#ef4444' : 'inherit' }} />
                    </button>
                    <button className="action-btn cart-btn" onClick={handleAddToCart} title="Add to Cart">
                        <FiShoppingBag />
                    </button>
                </div>
            </div>

            <div className="product-info">
                <p className="product-brand">{product.brand}</p>
                <h3 className="product-name">{product.name}</h3>

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="product-rating">
                        <FiStar className="star-icon" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="rating-count">({product.numReviews})</span>
                    </div>
                )}

                {/* Price */}
                <div className="product-price">
                    <span className={`price ${product.isOnSale ? 'price-sale' : ''}`}>
                        ₹{price.toLocaleString()}
                    </span>
                    {originalPrice && (
                        <span className="price-old">₹{originalPrice.toLocaleString()}</span>
                    )}
                </div>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <div className="product-colors">
                        {product.colors.slice(0, 4).map((color, index) => (
                            <span
                                key={index}
                                className="color-dot"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                        {product.colors.length > 4 && (
                            <span className="color-more">+{product.colors.length - 4}</span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
