const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        default: 0
    },
    salePrice: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategory: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    sizes: [{
        type: String
    }],
    colors: [{
        name: String,
        hex: String
    }],
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    brand: {
        type: String,
        default: 'Westside'
    },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Kids', 'Unisex'],
        default: 'Unisex'
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate average rating
productSchema.methods.calculateRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        this.rating = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length;
        this.numReviews = this.reviews.length;
    }
};

module.exports = mongoose.model('Product', productSchema);
