const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        const updatedUser = await User.findById(req.user._id).populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.id;
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await user.save();

        const updatedUser = await User.findById(req.user._id).populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
