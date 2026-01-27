const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();

        console.log('Data cleared...');

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@westside.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Admin user created: admin@westside.com / admin123');

        // Create sample user
        await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user'
        });

        console.log('Sample user created: john@example.com / password123');

        // Create categories
        const womenCategory = await Category.create({
            name: 'Women',
            description: 'Women\'s clothing and accessories',
            image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
        });

        const menCategory = await Category.create({
            name: 'Men',
            description: 'Men\'s clothing and accessories',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        });

        const kidsCategory = await Category.create({
            name: 'Kids',
            description: 'Kids clothing and accessories',
            image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400'
        });

        const accessoriesCategory = await Category.create({
            name: 'Accessories',
            description: 'Bags, jewelry, and more',
            image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400'
        });

        console.log('Categories created...');

        // Create sample products
        const products = [
            {
                name: 'Floral Print Maxi Dress',
                description: 'Beautiful floral print maxi dress perfect for summer occasions. Made with breathable cotton fabric.',
                price: 2999,
                salePrice: 2499,
                category: womenCategory._id,
                subCategory: 'Dresses',
                images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: [{ name: 'Blue', hex: '#3B82F6' }, { name: 'Pink', hex: '#EC4899' }],
                stock: 50,
                brand: 'Westside',
                gender: 'Women',
                isFeatured: true,
                isOnSale: true
            },
            {
                name: 'Cotton Kurta Set',
                description: 'Elegant cotton kurta set with matching dupatta. Perfect for festive occasions.',
                price: 3499,
                category: womenCategory._id,
                subCategory: 'Ethnic Wear',
                images: ['https://images.unsplash.com/photo-1594369566979-7b9a0c93f1e9?w=500'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: [{ name: 'Maroon', hex: '#991B1B' }, { name: 'Navy', hex: '#1E3A5F' }],
                stock: 35,
                brand: 'Westside',
                gender: 'Women',
                isFeatured: true
            },
            {
                name: 'Casual Denim Shirt',
                description: 'Classic casual denim shirt with button-down collar. Versatile and comfortable.',
                price: 1999,
                salePrice: 1599,
                category: menCategory._id,
                subCategory: 'Shirts',
                images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: [{ name: 'Blue', hex: '#2563EB' }, { name: 'Black', hex: '#000000' }],
                stock: 60,
                brand: 'Westside',
                gender: 'Men',
                isFeatured: true,
                isOnSale: true
            },
            {
                name: 'Slim Fit Chinos',
                description: 'Premium quality slim fit chinos. Perfect for both casual and formal occasions.',
                price: 2499,
                category: menCategory._id,
                subCategory: 'Trousers',
                images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'],
                sizes: ['30', '32', '34', '36', '38'],
                colors: [{ name: 'Khaki', hex: '#C4A35A' }, { name: 'Navy', hex: '#1E3A5F' }, { name: 'Olive', hex: '#556B2F' }],
                stock: 45,
                brand: 'Westside',
                gender: 'Men',
                isFeatured: true
            },
            {
                name: 'Kids Printed T-Shirt',
                description: 'Fun printed t-shirt for kids. Made with soft, breathable cotton.',
                price: 799,
                salePrice: 599,
                category: kidsCategory._id,
                subCategory: 'T-Shirts',
                images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500'],
                sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
                colors: [{ name: 'Red', hex: '#EF4444' }, { name: 'Yellow', hex: '#EAB308' }],
                stock: 80,
                brand: 'Westside',
                gender: 'Kids',
                isOnSale: true
            },
            {
                name: 'Girls Party Dress',
                description: 'Beautiful party dress for girls with sequin details and tulle skirt.',
                price: 1999,
                category: kidsCategory._id,
                subCategory: 'Dresses',
                images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500'],
                sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
                colors: [{ name: 'Pink', hex: '#F472B6' }, { name: 'Purple', hex: '#A855F7' }],
                stock: 40,
                brand: 'Westside',
                gender: 'Kids',
                isFeatured: true
            },
            {
                name: 'Leather Tote Bag',
                description: 'Elegant leather tote bag with multiple compartments. Perfect for work and travel.',
                price: 4999,
                salePrice: 3999,
                category: accessoriesCategory._id,
                subCategory: 'Bags',
                images: ['https://images.unsplash.com/photo-1548036328-c9fa89f128fa?w=500'],
                sizes: ['Free Size'],
                colors: [{ name: 'Brown', hex: '#92400E' }, { name: 'Black', hex: '#000000' }],
                stock: 25,
                brand: 'Westside',
                gender: 'Women',
                isFeatured: true,
                isOnSale: true
            },
            {
                name: 'Statement Earrings',
                description: 'Beautiful statement earrings with intricate design. Perfect for special occasions.',
                price: 999,
                category: accessoriesCategory._id,
                subCategory: 'Jewelry',
                images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'],
                sizes: ['Free Size'],
                colors: [{ name: 'Gold', hex: '#D4AF37' }, { name: 'Silver', hex: '#C0C0C0' }],
                stock: 100,
                brand: 'Westside',
                gender: 'Women'
            },
            {
                name: 'Embroidered Anarkali Suit',
                description: 'Stunning embroidered anarkali suit with heavy dupatta. Perfect for weddings and festivals.',
                price: 5999,
                salePrice: 4999,
                category: womenCategory._id,
                subCategory: 'Ethnic Wear',
                images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500'],
                sizes: ['S', 'M', 'L', 'XL'],
                colors: [{ name: 'Red', hex: '#DC2626' }, { name: 'Green', hex: '#16A34A' }],
                stock: 20,
                brand: 'Westside',
                gender: 'Women',
                isFeatured: true,
                isOnSale: true
            },
            {
                name: 'Formal Blazer',
                description: 'Premium formal blazer with modern slim fit. Perfect for office and formal events.',
                price: 6999,
                category: menCategory._id,
                subCategory: 'Blazers',
                images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: [{ name: 'Navy', hex: '#1E3A5F' }, { name: 'Charcoal', hex: '#36454F' }],
                stock: 30,
                brand: 'Westside',
                gender: 'Men',
                isFeatured: true
            }
        ];

        await Product.insertMany(products);
        console.log(`${products.length} products created...`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin: admin@westside.com / admin123');
        console.log('User: john@example.com / password123');

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
