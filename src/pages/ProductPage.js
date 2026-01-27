import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiShare2, FiTruck, FiRefreshCw, FiShield, FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductPage.css';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/products/${id}`);
            setProduct(data);
            setSelectedSize(data.sizes?.[0] || '');
            setSelectedColor(data.colors?.[0]?.name || '');

            // Fetch related products
            const { data: relatedData } = await axios.get(`/api/products?category=${data.category._id}&limit=4`);
            setRelatedProducts(relatedData.products.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        const result = await addToCart(product, quantity, selectedSize, selectedColor);
        if (result.success) {
            // Show success message or navigate to cart
        }
    };

    const handleBuyNow = async () => {
        await addToCart(product, quantity, selectedSize, selectedColor);
        navigate('/cart');
    };

    if (loading) {
        return <div className="loader"><div className="spinner"></div></div>;
    }

    if (!product) {
        return <div className="container"><h2>Product not found</h2></div>;
    }

    const price = product.isOnSale && product.salePrice > 0 ? product.salePrice : product.price;
    const originalPrice = product.isOnSale && product.salePrice > 0 ? product.price : null;
    const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

    return (
        <div className="product-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <a href="/">Home</a>
                    <span>/</span>
                    <a href="/shop">Shop</a>
                    <span>/</span>
                    <a href={`/shop?category=${product.category._id}`}>{product.category.name}</a>
                    <span>/</span>
                    <span>{product.name}</span>
                </nav>

                <div className="product-main">
                    {/* Product Images */}
                    <div className="product-gallery">
                        <div className="gallery-main">
                            <img
                                src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x800'}
                                alt={product.name}
                            />
                            {product.isOnSale && (
                                <span className="badge badge-sale">{discount}% OFF</span>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="gallery-thumbs">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`thumb ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={img} alt={`${product.name} ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        <p className="product-brand">{product.brand}</p>
                        <h1 className="product-title">{product.name}</h1>

                        {/* Rating */}
                        {product.rating > 0 && (
                            <div className="product-rating">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            className={i < Math.floor(product.rating) ? 'star filled' : 'star'}
                                        />
                                    ))}
                                </div>
                                <span>{product.rating.toFixed(1)}</span>
                                <span className="rating-count">({product.numReviews} reviews)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="product-price-section">
                            <span className="current-price">₹{price.toLocaleString()}</span>
                            {originalPrice && (
                                <>
                                    <span className="original-price">₹{originalPrice.toLocaleString()}</span>
                                    <span className="discount-tag">{discount}% OFF</span>
                                </>
                            )}
                        </div>

                        <p className="tax-info">Inclusive of all taxes</p>

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="option-group">
                                <h4>Color: <span>{selectedColor}</span></h4>
                                <div className="color-options">
                                    {product.colors.map((color, index) => (
                                        <button
                                            key={index}
                                            className={`color-btn ${selectedColor === color.name ? 'active' : ''}`}
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => setSelectedColor(color.name)}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="option-group">
                                <h4>Size: <span>{selectedSize}</span></h4>
                                <div className="size-options">
                                    {product.sizes.map((size, index) => (
                                        <button
                                            key={index}
                                            className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="option-group">
                            <h4>Quantity</h4>
                            <div className="quantity-selector">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <FiMinus />
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            {product.stock < 10 && product.stock > 0 && (
                                <p className="stock-warning">Only {product.stock} left in stock!</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Wishlist & Share */}
                        <div className="secondary-actions">
                            <button className="icon-action">
                                <FiHeart /> Add to Wishlist
                            </button>
                            <button className="icon-action">
                                <FiShare2 /> Share
                            </button>
                        </div>

                        {/* Features */}
                        <div className="product-features">
                            <div className="feature">
                                <FiTruck />
                                <div>
                                    <strong>Free Delivery</strong>
                                    <span>For orders above ₹999</span>
                                </div>
                            </div>
                            <div className="feature">
                                <FiRefreshCw />
                                <div>
                                    <strong>Easy Returns</strong>
                                    <span>30 days return policy</span>
                                </div>
                            </div>
                            <div className="feature">
                                <FiShield />
                                <div>
                                    <strong>Secure Payment</strong>
                                    <span>100% secure checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Tabs */}
                <div className="product-tabs">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({product.numReviews})
                        </button>
                    </div>
                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="tab-pane">
                                <p>{product.description}</p>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="tab-pane">
                                {product.reviews && product.reviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {product.reviews.map((review, index) => (
                                            <div key={index} className="review-item">
                                                <div className="review-header">
                                                    <strong>{review.name}</strong>
                                                    <div className="review-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FiStar key={i} className={i < review.rating ? 'star filled' : 'star'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p>{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="related-products section">
                        <h2 className="section-title">You May Also Like</h2>
                        <div className="products-grid grid-4">
                            {relatedProducts.slice(0, 4).map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
