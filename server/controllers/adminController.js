const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 20;
        const page = Number(req.query.page) || 1;

        const count = await User.countDocuments({});
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            users,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }
            await User.deleteOne({ _id: req.params.id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalProducts = await Product.countDocuments({});
        const totalOrders = await Order.countDocuments({});

        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippedOrders = await Order.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get recent orders
        const recentOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get low stock products
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
            .sort({ stock: 1 })
            .limit(10);

        // Monthly sales data (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, isPaid: true } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    sales: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders
            },
            recentOrders,
            lowStockProducts,
            monthlySales
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getDashboardStats
};
