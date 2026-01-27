const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getDashboardStats
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require admin access
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
