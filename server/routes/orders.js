const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderToPaid,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/', protect, admin, getOrders);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
