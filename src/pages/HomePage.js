import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiCreditCard } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [saleProducts, setSaleProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featuredRes, saleRes, categoriesRes] = await Promise.all([
                    axios.get('/api/products/featured'),
                    axios.get('/api/products/sale'),
                    axios.get('/api/categories')
                ]);
                setFeaturedProducts(featuredRes.data);
                setSaleProducts(saleRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const heroSlides = [
        {
            title: 'New Season Arrivals',
            subtitle: 'Discover the latest trends',
            cta: 'Shop Now',
            link: '/shop',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600'
        }
    ];

    const features = [
        { icon: <FiTruck />, title: 'Free Shipping', desc: 'On orders above ₹999' },
        { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '30 days return policy' },
        { icon: <FiShield />, title: 'Secure Payment', desc: '100% secure checkout' },
        { icon: <FiCreditCard />, title: 'COD Available', desc: 'Cash on delivery' }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-slide" style={{ backgroundImage: `url(${heroSlides[0].image})` }}>
                    <div className="hero-overlay"></div>
                    <div className="container">
                        <div className="hero-content">
                            <h1 className="hero-title">{heroSlides[0].title}</h1>
                            <p className="hero-subtitle">{heroSlides[0].subtitle}</p>
                            <Link to={heroSlides[0].link} className="btn btn-secondary btn-lg">
                                {heroSlides[0].cta}
                                <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item">
                                <div className="feature-icon">{feature.icon}</div>
                                <div className="feature-text">
                                    <h4>{feature.title}</h4>
                                    <p>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section categories-section">
                <div className="container">
                    <h2 className="section-title">Shop by Category</h2>
                    <div className="categories-grid">
                        {categories.slice(0, 4).map((category) => (
                            <Link
                                key={category._id}
                                to={`/shop?category=${category._id}`}
                                className="category-card"
                            >
                                <div className="category-image">
                                    <img src={category.image || 'https://via.placeholder.com/400x500'} alt={category.name} />
                                    <div className="category-overlay"></div>
                                </div>
                                <div className="category-content">
                                    <h3>{category.name}</h3>
                                    <span className="category-link">Shop Now <FiArrowRight /></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="section products-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Featured Collection</h2>
                            <Link to="/shop?featured=true" className="section-link">
                                View All <FiArrowRight />
                            </Link>
                        </div>
                        <div className="products-grid">
                            {featuredProducts.slice(0, 4).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Sale Banner */}
            <section className="sale-banner">
                <div className="container">
                    <div className="sale-content">
                        <span className="sale-tag">Limited Time Offer</span>
                        <h2>End of Season Sale</h2>
                        <p>Up to 50% off on selected items</p>
                        <Link to="/shop?sale=true" className="btn btn-primary btn-lg">
                            Shop Sale
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sale Products */}
            {saleProducts.length > 0 && (
                <section className="section products-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">On Sale Now</h2>
                            <Link to="/shop?sale=true" className="section-link">
                                View All <FiArrowRight />
                            </Link>
                        </div>
                        <div className="products-grid">
                            {saleProducts.slice(0, 4).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Gender Shop */}
            <section className="section gender-section">
                <div className="container">
                    <div className="gender-grid">
                        <Link to="/shop?gender=Women" className="gender-card">
                            <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800" alt="Women" />
                            <div className="gender-overlay"></div>
                            <div className="gender-content">
                                <h3>Women</h3>
                                <span>Shop Collection <FiArrowRight /></span>
                            </div>
                        </Link>
                        <Link to="/shop?gender=Men" className="gender-card">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" alt="Men" />
                            <div className="gender-overlay"></div>
                            <div className="gender-content">
                                <h3>Men</h3>
                                <span>Shop Collection <FiArrowRight /></span>
                            </div>
                        </Link>
                        <Link to="/shop?gender=Kids" className="gender-card">
                            <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800" alt="Kids" />
                            <div className="gender-overlay"></div>
                            <div className="gender-content">
                                <h3>Kids</h3>
                                <span>Shop Collection <FiArrowRight /></span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
