import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiBox, FiShoppingCart, FiDollarSign, FiTrendingUp, FiAlertCircle, FiPieChart } from 'react-icons/fi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
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

    // Format monthly sales data for the chart
    const chartData = stats?.monthlySales?.map(item => {
        const [year, month] = item._id.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'short' });
        return {
            name: monthName,
            sales: item.sales,
            orders: item.orders
        };
    }) || [];

    // Format order status data for pie chart
    const statusData = [
        { name: 'Pending', value: stats?.stats?.pendingOrders || 0, color: '#ffc107' },
        { name: 'Processing', value: stats?.stats?.processingOrders || 0, color: '#007bff' },
        { name: 'Shipped', value: stats?.stats?.shippedOrders || 0, color: '#17a2b8' },
        { name: 'Delivered', value: stats?.stats?.deliveredOrders || 0, color: '#28a745' }
    ].filter(item => item.value > 0);

    const COLORS = statusData.map(item => item.color);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p className="subtitle">Real-time business analytics and store performance</p>
            </div>

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

            <div className="charts-grid">
                <div className="dashboard-card chart-container sales-chart">
                    <h2><FiTrendingUp /> Sales & Orders Trend</h2>
                    <div className="chart-wrapper">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value, name) => [name === 'sales' ? `₹${value.toLocaleString()}` : value, name === 'sales' ? 'Revenue' : 'Orders']}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#d4a574"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#d4a574', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                        name="Revenue"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="#1a1a1a"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        name="Orders"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-chart-data">
                                <p>No sales data available for the last 6 months</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-card chart-container status-chart">
                    <h2><FiPieChart /> Order Distribution</h2>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card recent-orders">
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

                <div className="dashboard-card low-stock">
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
            </div>
        </div>
    );
};

export default Dashboard;

