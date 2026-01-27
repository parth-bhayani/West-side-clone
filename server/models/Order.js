const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    name: { type: String, required: true },
    image: { type: String, default: 'https://via.placeholder.com/150' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: '' },
    color: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'COD'
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
