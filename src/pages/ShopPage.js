import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import './ShopPage.css';

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        gender: searchParams.get('gender') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
        page: Number(searchParams.get('page')) || 1,
        search: searchParams.get('search') || '',
        sale: searchParams.get('sale') || ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
        // Update URL params
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.gender) params.append('gender', filters.gender);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.page) params.append('page', filters.page);
            if (filters.search) params.append('search', filters.search);
            if (filters.sale) params.append('isOnSale', 'true');

            const { data } = await axios.get(`/api/products?${params.toString()}`);
            setProducts(data.products);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            gender: '',
            minPrice: '',
            maxPrice: '',
            sort: 'newest',
            page: 1,
            search: '',
            sale: ''
        });
    };

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating', label: 'Top Rated' }
    ];

    const genderOptions = ['Women', 'Men', 'Kids', 'Unisex'];

    const priceRanges = [
        { label: 'Under ₹500', min: 0, max: 500 },
        { label: '₹500 - ₹1000', min: 500, max: 1000 },
        { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
        { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
        { label: 'Above ₹5000', min: 5000, max: '' }
    ];

    const activeFiltersCount = [
        filters.category, filters.gender, filters.minPrice, filters.sale
    ].filter(Boolean).length;

    return (
        <div className="shop-page">
            {/* Page Header */}
            <div className="shop-header">
                <div className="container">
                    <h1>
                        {filters.search ? `Search: "${filters.search}"` :
                            filters.sale ? 'Sale Items' :
                                filters.gender || 'All Products'}
                    </h1>
                    <p>{products.length} products found</p>
                </div>
            </div>

            <div className="container">
                <div className="shop-content">
                    {/* Mobile Filter Toggle */}
                    <button
                        className="filter-toggle"
                        onClick={() => setFilterOpen(!filterOpen)}
                    >
                        <FiFilter />
                        Filters
                        {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
                    </button>

                    {/* Sidebar Filters */}
                    <aside className={`shop-sidebar ${filterOpen ? 'sidebar-open' : ''}`}>
                        <div className="sidebar-header">
                            <h3>Filters</h3>
                            <button className="sidebar-close" onClick={() => setFilterOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        {activeFiltersCount > 0 && (
                            <button className="clear-filters" onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        )}

                        {/* Categories */}
                        <div className="filter-group">
                            <h4 className="filter-title">
                                Categories
                                <FiChevronDown />
                            </h4>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={!filters.category}
                                        onChange={() => handleFilterChange('category', '')}
                                    />
                                    <span>All Categories</span>
                                </label>
                                {categories.map(cat => (
                                    <label key={cat._id} className="filter-option">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={filters.category === cat._id}
                                            onChange={() => handleFilterChange('category', cat._id)}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="filter-group">
                            <h4 className="filter-title">
                                Gender
                                <FiChevronDown />
                            </h4>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={!filters.gender}
                                        onChange={() => handleFilterChange('gender', '')}
                                    />
                                    <span>All</span>
                                </label>
                                {genderOptions.map(gender => (
                                    <label key={gender} className="filter-option">
                                        <input
                                            type="radio"
                                            name="gender"
                                            checked={filters.gender === gender}
                                            onChange={() => handleFilterChange('gender', gender)}
                                        />
                                        <span>{gender}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="filter-group">
                            <h4 className="filter-title">
                                Price Range
                                <FiChevronDown />
                            </h4>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input
                                        type="radio"
                                        name="price"
                                        checked={!filters.minPrice && !filters.maxPrice}
                                        onChange={() => {
                                            handleFilterChange('minPrice', '');
                                            handleFilterChange('maxPrice', '');
                                        }}
                                    />
                                    <span>All Prices</span>
                                </label>
                                {priceRanges.map((range, index) => (
                                    <label key={index} className="filter-option">
                                        <input
                                            type="radio"
                                            name="price"
                                            checked={filters.minPrice === String(range.min) && filters.maxPrice === String(range.max)}
                                            onChange={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    minPrice: String(range.min),
                                                    maxPrice: String(range.max),
                                                    page: 1
                                                }));
                                            }}
                                        />
                                        <span>{range.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sale Items */}
                        <div className="filter-group">
                            <label className="filter-option sale-filter">
                                <input
                                    type="checkbox"
                                    checked={!!filters.sale}
                                    onChange={(e) => handleFilterChange('sale', e.target.checked ? 'true' : '')}
                                />
                                <span>On Sale Only</span>
                            </label>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="shop-main">
                        {/* Sort Bar */}
                        <div className="sort-bar">
                            <span className="results-count">{products.length} Results</span>
                            <div className="sort-select">
                                <label>Sort by:</label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Products */}
                        {loading ? (
                            <div className="loader">
                                <div className="spinner"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="no-products">
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search terms</p>
                                <button className="btn btn-primary" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="products-grid">
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="pagination-btn"
                                            disabled={filters.page === 1}
                                            onClick={() => handleFilterChange('page', filters.page - 1)}
                                        >
                                            Previous
                                        </button>
                                        <span className="pagination-info">
                                            Page {filters.page} of {totalPages}
                                        </span>
                                        <button
                                            className="pagination-btn"
                                            disabled={filters.page === totalPages}
                                            onClick={() => handleFilterChange('page', filters.page + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
