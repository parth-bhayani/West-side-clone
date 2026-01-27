const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                size,
                color
            });
        }

        // Calculate totals
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

        // Need to populate to get prices
        await cart.save();
        cart = await Cart.findById(cart._id).populate('items.product');

        cart.totalPrice = cart.items.reduce((acc, item) => {
            const price = item.product.isOnSale && item.product.salePrice > 0
                ? item.product.salePrice
                : item.product.price;
            return acc + price * item.quantity;
        }, 0);

        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate totals
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

        await cart.save();
        cart = await Cart.findById(cart._id).populate('items.product');

        cart.totalPrice = cart.items.reduce((acc, item) => {
            const price = item.product.isOnSale && item.product.salePrice > 0
                ? item.product.salePrice
                : item.product.price;
            return acc + price * item.quantity;
        }, 0);

        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== req.params.itemId
        );

        // Recalculate totals
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

        await cart.save();
        cart = await Cart.findById(cart._id).populate('items.product');

        cart.totalPrice = cart.items.reduce((acc, item) => {
            const price = item.product.isOnSale && item.product.salePrice > 0
                ? item.product.salePrice
                : item.product.price;
            return acc + price * item.quantity;
        }, 0);

        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = [];
            cart.totalItems = 0;
            cart.totalPrice = 0;
            await cart.save();
        }

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
