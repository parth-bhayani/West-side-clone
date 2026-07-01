const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Category = require('../models/Category');

const SYSTEM_PROMPT = `You are "West Side Shopping Assistant", a friendly and helpful AI assistant for the West Side fashion e-commerce store.

About West Side:
- Premium fashion brand offering trendy clothing for Men, Women, and Kids
- Categories include: Dresses, Tops, Jeans, Shirts, T-Shirts, Ethnic Wear, Western Wear, Footwear, Accessories
- Located in India, prices are in INR (₹)
- Free delivery on orders above ₹999
- Easy 15-day return policy for unused items with tags
- Size exchange available within 7 days
- Payment options: Credit/Debit Cards, UPI, Net Banking, Cash on Delivery

Size Guide (General):
- XS: Chest 32-34", Waist 26-28"
- S: Chest 34-36", Waist 28-30"
- M: Chest 38-40", Waist 30-32"
- L: Chest 40-42", Waist 32-34"
- XL: Chest 42-44", Waist 34-36"
- XXL: Chest 44-46", Waist 36-38"

Guidelines:
- Be warm, concise, and helpful
- Use emojis sparingly for a friendly tone
- When the user asks about their orders, cart, wishlist, or products, use the REAL DATA provided below to give accurate answers
- Format order/product info neatly with bullet points
- For prices, always use ₹ symbol
- Keep responses under 200 words
- If real data is provided, USE IT to answer - don't make up data
- If you don't know something, say so honestly`;

// Detect what data the user is asking about
function detectIntent(message) {
    const msg = message.toLowerCase();
    const intents = [];

    if (msg.includes('order') || msg.includes('track') || msg.includes('delivery') ||
        msg.includes('shipping') || msg.includes('status') || msg.includes('mera order') ||
        msg.includes('my order') || msg.includes('kahan') || msg.includes('where is')) {
        intents.push('orders');
    }

    if (msg.includes('cart') || msg.includes('bag') || msg.includes('mera cart') ||
        msg.includes('my cart') || msg.includes('shopping bag')) {
        intents.push('cart');
    }

    if (msg.includes('wishlist') || msg.includes('saved') || msg.includes('favourite') ||
        msg.includes('favorite') || msg.includes('meri wishlist') || msg.includes('my wishlist')) {
        intents.push('wishlist');
    }

    if (msg.includes('product') || msg.includes('recommend') || msg.includes('suggest') ||
        msg.includes('trending') || msg.includes('new arrival') || msg.includes('best') ||
        msg.includes('popular') || msg.includes('show me') || msg.includes('dikhao') ||
        msg.includes('sale') || msg.includes('offer') || msg.includes('discount')) {
        intents.push('products');
    }

    if (msg.includes('category') || msg.includes('categories') || msg.includes('collection')) {
        intents.push('categories');
    }

    if (msg.includes('profile') || msg.includes('account') || msg.includes('mera account') ||
        msg.includes('my account')) {
        intents.push('profile');
    }

    return intents;
}

// Fetch real data based on detected intents
async function fetchContextData(intents, userId) {
    const contextParts = [];

    try {
        if (intents.includes('orders') && userId) {
            const orders = await Order.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('orderItems.product', 'name');

            if (orders.length > 0) {
                let orderData = '\n📦 USER\'S RECENT ORDERS:\n';
                orders.forEach((order, i) => {
                    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                    const items = order.orderItems.map(item =>
                        `${item.name} (Qty: ${item.quantity}, ₹${item.price})`
                    ).join(', ');
                    orderData += `\nOrder ${i + 1}:`;
                    orderData += `\n- Order ID: ${order._id}`;
                    orderData += `\n- Date: ${date}`;
                    orderData += `\n- Items: ${items}`;
                    orderData += `\n- Total: ₹${order.totalPrice}`;
                    orderData += `\n- Status: ${order.status.toUpperCase()}`;
                    orderData += `\n- Payment: ${order.paymentMethod}`;
                    if (order.trackingNumber) {
                        orderData += `\n- Tracking: ${order.trackingNumber}`;
                    }
                    orderData += `\n- Delivered: ${order.isDelivered ? 'Yes ✅' : 'Not yet'}`;
                });
                contextParts.push(orderData);
            } else {
                contextParts.push('\n📦 USER\'S ORDERS: No orders found. The user has not placed any orders yet.');
            }
        }

        if (intents.includes('cart') && userId) {
            const cart = await Cart.findOne({ user: userId })
                .populate('items.product', 'name price salePrice images');

            if (cart && cart.items.length > 0) {
                let cartData = '\n🛒 USER\'S CART:';
                cart.items.forEach((item, i) => {
                    const productName = item.product?.name || 'Unknown Product';
                    const price = item.product?.salePrice || item.product?.price || 0;
                    cartData += `\n- ${productName} | Qty: ${item.quantity} | Size: ${item.size || 'N/A'} | ₹${price}`;
                });
                cartData += `\n- Total Items: ${cart.totalItems}`;
                cartData += `\n- Cart Total: ₹${cart.totalPrice}`;
                contextParts.push(cartData);
            } else {
                contextParts.push('\n🛒 USER\'S CART: Cart is empty.');
            }
        }

        if (intents.includes('wishlist') && userId) {
            const user = await User.findById(userId).populate('wishlist', 'name price salePrice isOnSale');

            if (user?.wishlist?.length > 0) {
                let wishData = '\n❤️ USER\'S WISHLIST:';
                user.wishlist.forEach((product) => {
                    const displayPrice = product.isOnSale && product.salePrice
                        ? `₹${product.salePrice} (was ₹${product.price})`
                        : `₹${product.price}`;
                    wishData += `\n- ${product.name} | ${displayPrice}`;
                });
                contextParts.push(wishData);
            } else {
                contextParts.push('\n❤️ USER\'S WISHLIST: No items in wishlist.');
            }
        }

        if (intents.includes('products')) {
            // Fetch trending/featured/sale products
            const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
                .limit(5)
                .select('name price salePrice isOnSale rating gender');

            const saleProducts = await Product.find({ isOnSale: true, isActive: true })
                .limit(5)
                .select('name price salePrice rating gender');

            let productData = '\n🛍️ STORE PRODUCTS:';
            if (featuredProducts.length > 0) {
                productData += '\n\nFeatured Products:';
                featuredProducts.forEach((p) => {
                    const displayPrice = p.isOnSale && p.salePrice
                        ? `₹${p.salePrice} (was ₹${p.price})`
                        : `₹${p.price}`;
                    productData += `\n- ${p.name} | ${displayPrice} | ${p.gender} | Rating: ${p.rating}/5`;
                });
            }
            if (saleProducts.length > 0) {
                productData += '\n\nOn Sale Now 🔥:';
                saleProducts.forEach((p) => {
                    const discount = Math.round(((p.price - p.salePrice) / p.price) * 100);
                    productData += `\n- ${p.name} | ₹${p.salePrice} (${discount}% OFF, was ₹${p.price})`;
                });
            }
            if (featuredProducts.length === 0 && saleProducts.length === 0) {
                const latestProducts = await Product.find({ isActive: true })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('name price gender rating');
                productData += '\n\nLatest Arrivals:';
                latestProducts.forEach((p) => {
                    productData += `\n- ${p.name} | ₹${p.price} | ${p.gender}`;
                });
            }
            contextParts.push(productData);
        }

        if (intents.includes('categories')) {
            const categories = await Category.find({ isActive: true }).select('name description');
            if (categories.length > 0) {
                let catData = '\n📂 AVAILABLE CATEGORIES:';
                categories.forEach((cat) => {
                    catData += `\n- ${cat.name}${cat.description ? ': ' + cat.description : ''}`;
                });
                contextParts.push(catData);
            }
        }

        if (intents.includes('profile') && userId) {
            const user = await User.findById(userId).select('name email phone');
            if (user) {
                let profileData = '\n👤 USER PROFILE:';
                profileData += `\n- Name: ${user.name}`;
                profileData += `\n- Email: ${user.email}`;
                profileData += `\n- Phone: ${user.phone || 'Not set'}`;
                contextParts.push(profileData);
            }
        }
    } catch (error) {
        console.error('Error fetching context data:', error.message);
    }

    return contextParts.join('\n');
}

// Build fallback response with real data
function buildFallbackWithData(message, contextData) {
    const msg = message.toLowerCase();

    // If we have context data, format it nicely
    if (contextData && contextData.trim()) {
        if (msg.includes('order') || msg.includes('track') || msg.includes('status') ||
            msg.includes('mera order') || msg.includes('delivery')) {
            if (contextData.includes('No orders found')) {
                return 'You haven\'t placed any orders yet! 📦\n\nBrowse our amazing collection on the Shop page and place your first order. We offer free delivery on orders above ₹999! 🛍️';
            }
            // Extract and format order data
            return `Here are your recent orders! 📦\n\n${contextData.replace(/📦 USER'S RECENT ORDERS:\n?/, '').trim()}\n\nNeed help with a specific order? Just share the Order ID! 😊`;
        }

        if (msg.includes('cart') || msg.includes('bag')) {
            if (contextData.includes('Cart is empty')) {
                return 'Your cart is empty right now! 🛒\n\nCheck out our trending products on the Shop page and add something you love! 🛍️';
            }
            return `Here\'s what\'s in your cart! 🛒\n\n${contextData.replace(/🛒 USER'S CART:\n?/, '').trim()}\n\nReady to checkout? Head to your cart page! 😊`;
        }

        if (msg.includes('wishlist') || msg.includes('saved') || msg.includes('favourite')) {
            if (contextData.includes('No items in wishlist')) {
                return 'Your wishlist is empty! ❤️\n\nBrowse our collection and tap the heart icon on products you love to save them for later! 🛍️';
            }
            return `Here are your wishlisted items! ❤️\n\n${contextData.replace(/❤️ USER'S WISHLIST:\n?/, '').trim()}\n\nWant to add any of these to your cart? 🛒`;
        }

        if (msg.includes('product') || msg.includes('recommend') || msg.includes('trending') ||
            msg.includes('sale') || msg.includes('offer') || msg.includes('show me') || msg.includes('dikhao')) {
            return `Here\'s what we have for you! 🛍️\n\n${contextData.replace(/🛍️ STORE PRODUCTS:\n?/, '').trim()}\n\nVisit the Shop page to explore more! 😊`;
        }

        if (msg.includes('category') || msg.includes('collection')) {
            return `Here are our collections! 📂\n\n${contextData.replace(/📂 AVAILABLE CATEGORIES:\n?/, '').trim()}\n\nBrowse the Shop page and filter by category! 🛍️`;
        }

        if (msg.includes('profile') || msg.includes('account')) {
            return `Here\'s your profile info! 👤\n\n${contextData.replace(/👤 USER PROFILE:\n?/, '').trim()}\n\nYou can update your profile from the Profile page! ✏️`;
        }
    }

    // Default fallback responses (as before)
    return getBasicFallbackResponse(message);
}

// Basic fallback responses when no data context needed
function getBasicFallbackResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('size') || msg.includes('fit')) {
        return 'Our general size guide:\n• XS: Chest 32-34"\n• S: Chest 34-36"\n• M: Chest 38-40"\n• L: Chest 40-42"\n• XL: Chest 42-44"\n\nFor the best fit, check the size chart on each product page! 📏';
    }
    if (msg.includes('return') || msg.includes('refund')) {
        return 'We offer a hassle-free 15-day return policy! Items must be unused with original tags. Refunds are processed within 5-7 business days. Size exchanges are available within 7 days. 🔄';
    }
    if (msg.includes('delivery') || msg.includes('shipping')) {
        return 'We offer free delivery on orders above ₹999! Standard delivery takes 3-5 business days. Express delivery is available for select locations. 🚚';
    }
    if (msg.includes('payment') || msg.includes('pay')) {
        return 'We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery. All online payments are 100% secure! 💳';
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('hii')) {
        return 'Hello! Welcome to West Side! 👋 How can I help you today? I can show you:\n\n• 📦 Your orders\n• 🛒 Your cart\n• ❤️ Your wishlist\n• 🛍️ Trending products\n• 📏 Size guides\n• 🔄 Return policy\n\nJust ask away!';
    }

    return 'I can help you with:\n\n• 📦 Order tracking – \"Show my orders\"\n• 🛒 Cart items – \"What\'s in my cart?\"\n• ❤️ Wishlist – \"Show my wishlist\"\n• 🛍️ Products – \"Show trending products\"\n• 📏 Size guides\n• 🔄 Returns & exchanges\n• 🚚 Delivery info\n\nWhat would you like to know?';
}

exports.sendMessage = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get user ID from auth token (optional - chatbot works for guests too)
        const userId = req.user?._id || null;

        // Detect what data the user is asking about
        const intents = detectIntent(message);

        // Fetch real data from the database
        let contextData = '';
        if (intents.length > 0) {
            contextData = await fetchContextData(intents, userId);
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            // Fallback response with real data
            return res.json({
                reply: buildFallbackWithData(message, contextData),
            });
        }

        // Build the Gemini API request with real data context
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        let systemWithData = SYSTEM_PROMPT;
        if (contextData) {
            systemWithData += `\n\n--- REAL DATA FROM DATABASE (Use this to answer accurately) ---\n${contextData}\n--- END OF REAL DATA ---`;
        }
        if (!userId) {
            systemWithData += '\n\nNote: The user is NOT logged in. If they ask about orders, cart, or wishlist, politely ask them to log in first.';
        }

        const contents = [
            {
                role: 'user',
                parts: [{ text: systemWithData }],
            },
            {
                role: 'model',
                parts: [{ text: 'Understood! I\'m the West Side Shopping Assistant with access to real store data. I\'ll use the actual data provided to give accurate answers. How can I help you today? 😊' }],
            },
            ...(history || []),
            {
                role: 'user',
                parts: [{ text: message }],
            },
        ];

        const response = await axios.post(geminiUrl, {
            contents,
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 500,
            },
        });

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text
            || 'Sorry, I couldn\'t generate a response. Please try again!';

        res.json({ reply });
    } catch (error) {
        console.error('Chat API Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to get AI response',
            reply: 'I\'m having a little trouble right now. Please try again in a moment! 🙏',
        });
    }
};
