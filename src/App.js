import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyOrders from './pages/MyOrders';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import OrderList from './pages/admin/OrderList';
import UserList from './pages/admin/UserList';
import CategoryList from './pages/admin/CategoryList';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Admin Login Route - separate from admin layout */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="users" element={<UserList />} />
              <Route path="categories" element={<CategoryList />} />
            </Route>

            {/* Public Routes */}
            <Route path="/*" element={
              <>
                <Header />
                <main style={{ minHeight: '60vh' }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
