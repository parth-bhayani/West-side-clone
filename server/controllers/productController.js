const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.page) || 1;

        // Build filter object
        const filter = { isActive: true };

        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.gender) {
            filter.gender = req.query.gender;
        }
        if (req.query.brand) {
            filter.brand = req.query.brand;
        }
        if (req.query.isOnSale === 'true') {
            filter.isOnSale = true;
        }
        if (req.query.isFeatured === 'true') {
            filter.isFeatured = true;
        }
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // Sorting
        let sort = { createdAt: -1 };
        if (req.query.sort === 'price_asc') sort = { price: 1 };
        if (req.query.sort === 'price_desc') sort = { price: -1 };
        if (req.query.sort === 'rating') sort = { rating: -1 };
        if (req.query.sort === 'newest') sort = { createdAt: -1 };

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            salePrice: req.body.salePrice || 0,
            category: req.body.category,
            subCategory: req.body.subCategory || '',
            images: req.body.images || [],
            sizes: req.body.sizes || [],
            colors: req.body.colors || [],
            stock: req.body.stock || 0,
            brand: req.body.brand || 'Westside',
            gender: req.body.gender || 'Unisex',
            isFeatured: req.body.isFeatured || false,
            isOnSale: req.body.isOnSale || false
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.price = req.body.price || product.price;
            product.salePrice = req.body.salePrice !== undefined ? req.body.salePrice : product.salePrice;
            product.category = req.body.category || product.category;
            product.subCategory = req.body.subCategory || product.subCategory;
            product.images = req.body.images || product.images;
            product.sizes = req.body.sizes || product.sizes;
            product.colors = req.body.colors || product.colors;
            product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
            product.brand = req.body.brand || product.brand;
            product.gender = req.body.gender || product.gender;
            product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;
            product.isOnSale = req.body.isOnSale !== undefined ? req.body.isOnSale : product.isOnSale;
            product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: req.params.id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id
            };

            product.reviews.push(review);
            product.calculateRating();
            await product.save();

            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .populate('category', 'name slug')
            .limit(8);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sale products
// @route   GET /api/products/sale
// @access  Public
const getSaleProducts = async (req, res) => {
    try {
        const products = await Product.find({ isOnSale: true, isActive: true })
            .populate('category', 'name slug')
            .limit(8);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getFeaturedProducts,
    getSaleProducts
};
