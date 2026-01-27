import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
    const [loading, setLoading] = useState(false);

    // Load cart from localStorage for guests, or from API for authenticated users
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            const storedCart = localStorage.getItem('guestCart');
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/cart');
            setCart(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1, size = '', color = '') => {
        if (isAuthenticated) {
            try {
                setLoading(true);
                const { data } = await axios.post('/api/cart', {
                    productId: product._id,
                    quantity,
                    size,
                    color
                });
                setCart(data);
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    message: error.response?.data?.message || 'Failed to add to cart'
                };
            } finally {
                setLoading(false);
            }
        } else {
            // Guest cart logic
            const newCart = { ...cart };
            const existingIndex = newCart.items.findIndex(
                item => item.product._id === product._id && item.size === size && item.color === color
            );

            if (existingIndex > -1) {
                newCart.items[existingIndex].quantity += quantity;
            } else {
                newCart.items.push({ product, quantity, size, color, _id: Date.now().toString() });
            }

            newCart.totalItems = newCart.items.reduce((acc, item) => acc + item.quantity, 0);
            newCart.totalPrice = newCart.items.reduce((acc, item) => {
                const price = item.product.isOnSale && item.product.salePrice > 0
                    ? item.product.salePrice
                    : item.product.price;
                return acc + price * item.quantity;
            }, 0);

            setCart(newCart);
            localStorage.setItem('guestCart', JSON.stringify(newCart));
            return { success: true };
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (isAuthenticated) {
            try {
                setLoading(true);
                const { data } = await axios.put(`/api/cart/${itemId}`, { quantity });
                setCart(data);
            } catch (error) {
                console.error('Error updating cart:', error);
            } finally {
                setLoading(false);
            }
        } else {
            const newCart = { ...cart };
            const itemIndex = newCart.items.findIndex(item => item._id === itemId);

            if (itemIndex > -1) {
                if (quantity <= 0) {
                    newCart.items.splice(itemIndex, 1);
                } else {
                    newCart.items[itemIndex].quantity = quantity;
                }
            }

            newCart.totalItems = newCart.items.reduce((acc, item) => acc + item.quantity, 0);
            newCart.totalPrice = newCart.items.reduce((acc, item) => {
                const price = item.product.isOnSale && item.product.salePrice > 0
                    ? item.product.salePrice
                    : item.product.price;
                return acc + price * item.quantity;
            }, 0);

            setCart(newCart);
            localStorage.setItem('guestCart', JSON.stringify(newCart));
        }
    };

    const removeFromCart = async (itemId) => {
        if (isAuthenticated) {
            try {
                setLoading(true);
                const { data } = await axios.delete(`/api/cart/${itemId}`);
                setCart(data);
            } catch (error) {
                console.error('Error removing from cart:', error);
            } finally {
                setLoading(false);
            }
        } else {
            const newCart = { ...cart };
            newCart.items = newCart.items.filter(item => item._id !== itemId);

            newCart.totalItems = newCart.items.reduce((acc, item) => acc + item.quantity, 0);
            newCart.totalPrice = newCart.items.reduce((acc, item) => {
                const price = item.product.isOnSale && item.product.salePrice > 0
                    ? item.product.salePrice
                    : item.product.price;
                return acc + price * item.quantity;
            }, 0);

            setCart(newCart);
            localStorage.setItem('guestCart', JSON.stringify(newCart));
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await axios.delete('/api/cart');
                setCart({ items: [], totalItems: 0, totalPrice: 0 });
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        } else {
            setCart({ items: [], totalItems: 0, totalPrice: 0 });
            localStorage.removeItem('guestCart');
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
