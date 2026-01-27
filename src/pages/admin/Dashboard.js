import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiBox, FiShoppingCart, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get('/api/admin/dashboard');
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users"><FiUsers /></div>
                    <div className="stat-content">
                        <h3>{stats?.stats?.totalUsers || 0}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon products"><FiBox /></div>
                    <div className="stat-content">
                        <h3>{stats?.stats?.totalProducts || 0}</h3>
                        <p>Products</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orders"><FiShoppingCart /></div>
                    <div className="stat-content">
                        <h3>{stats?.stats?.totalOrders || 0}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon revenue"><FiDollarSign /></div>
                    <div className="stat-content">
                        <h3>₹{(stats?.stats?.totalRevenue || 0).toLocaleString()}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2><FiShoppingCart /> Recent Orders</h2>
                    <div className="orders-list">
                        {stats?.recentOrders?.length > 0 ? (
                            stats.recentOrders.map(order => (
                                <div key={order._id} className="order-item">
                                    <div className="order-info">
                                        <p className="order-id">#{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="order-user">{order.user?.name}</p>
                                    </div>
                                    <div className="order-amount">₹{order.totalPrice?.toLocaleString()}</div>
                                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No recent orders</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <h2><FiAlertCircle /> Low Stock Products</h2>
                    <div className="products-list">
                        {stats?.lowStockProducts?.length > 0 ? (
                            stats.lowStockProducts.map(product => (
                                <div key={product._id} className="product-item">
                                    <img src={product.images?.[0] || 'https://via.placeholder.com/50'} alt={product.name} />
                                    <div className="product-info">
                                        <p className="product-name">{product.name}</p>
                                        <p className="product-stock">{product.stock} in stock</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">All products are well stocked</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-card order-stats">
                    <h2><FiTrendingUp /> Order Status</h2>
                    <div className="status-list">
                        <div className="status-item"><span>Pending</span><strong>{stats?.stats?.pendingOrders || 0}</strong></div>
                        <div className="status-item"><span>Processing</span><strong>{stats?.stats?.processingOrders || 0}</strong></div>
                        <div className="status-item"><span>Shipped</span><strong>{stats?.stats?.shippedOrders || 0}</strong></div>
                        <div className="status-item"><span>Delivered</span><strong>{stats?.stats?.deliveredOrders || 0}</strong></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
