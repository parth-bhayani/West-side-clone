const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    size: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: ''
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
