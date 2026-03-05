const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// ================== MIDDLEWARE ==================

// CORS Configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:5000',
        'https://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// ================== FILE UPLOAD SETUP ==================

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

app.use('/uploads', express.static('uploads'));

// ================== MONGODB CONNECTION ==================

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kshstories';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// ================== SCHEMAS ==================

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, sparse: true },
    password: String,
    role: { type: String, enum: ['reader', 'subscriber', 'admin'], default: 'reader' },
    purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    preferredLanguage: { type: String, default: 'en' },
    readingProgress: [
        {
            bookId: mongoose.Schema.Types.ObjectId,
            chapter: Number,
            progress: Number
        }
    ],
    bookmarks: [
        {
            bookId: mongoose.Schema.Types.ObjectId,
            chapter: Number,
            location: String
        }
    ],
    subscribedToNewsletter: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    titleHi: String,
    author: { type: String, required: true },
    description: String,
    descriptionHi: String,
    cover: String,
    category: String,
    status: { type: String, enum: ['free', 'ongoing', 'completed', 'upcoming'], default: 'completed' },
    price: { type: Number, default: 0 },
    priceCurrency: { type: String, default: 'INR' },
    language: { type: String, enum: ['en', 'hi', 'bilingual'], default: 'en' },
    chapters: [
        {
            number: Number,
            title: String,
            titleHi: String,
            content: String,
            contentHi: String,
            isFree: Boolean,
            publishedDate: Date,
            wordCount: Number
        }
    ],
    themes: [String],
    reviews: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            rating: Number,
            text: String,
            date: { type: Date, default: Date.now }
        }
    ],
    pdfUrl: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

// Poem Schema
const poemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    titleHi: String,
    content: { type: String, required: true },
    contentHi: String,
    category: { type: String, enum: ['love', 'longing', 'silence', 'healing', 'nostalgia'] },
    author: String,
    isFree: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Poem = mongoose.model('Poem', poemSchema);

// Quote Schema
const quoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    textHi: String,
    author: String,
    category: String,
    isFree: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);

// Blog Post Schema
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    titleHi: String,
    content: { type: String, required: true },
    contentHi: String,
    excerpt: String,
    excerptHi: String,
    author: String,
    category: String,
    tags: [String],
    views: { type: Number, default: 0 },
    publishedDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now }
});

const BlogPost = mongoose.model('BlogPost', blogSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    amount: Number,
    currency: String,
    paymentMethod: String,
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: String,
    languageReceived: String,
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Newsletter Subscriber Schema
const subscriberSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true, sparse: true },
    subscribedAt: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// ================== HEALTH CHECK ==================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'KSHstories Backend API ✨',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            books: '/api/books',
            poems: '/api/poems',
            quotes: '/api/quotes',
            blog: '/api/blog',
            users: '/api/users',
            orders: '/api/orders',
            newsletter: '/api/newsletter'
        }
    });
});

// ================== API ROUTES ==================

// 1. USER ROUTES

app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ success: true, message: 'User registered', userId: user._id });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
        res.json({ success: true, userId: user._id, email: user.email, role: user.role });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('purchasedBooks');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/users/:userId/language', async (req, res) => {
    try {
        const { language } = req.body;
        const user = await User.findByIdAndUpdate(req.params.userId, { preferredLanguage: language }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. BOOK ROUTES

app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/books/:bookId', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/books/:bookId/chapters', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book.chapters);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/books/:bookId/chapters/:chapterNumber', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        const chapter = book.chapters.find(c => c.number === parseInt(req.params.chapterNumber));
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        res.json(chapter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. POEM ROUTES

app.get('/api/poems', async (req, res) => {
    try {
        const poems = await Poem.find();
        res.json(poems);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/poems/category/:category', async (req, res) => {
    try {
        const poems = await Poem.find({ category: req.params.category });
        res.json(poems);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/poems/:poemId', async (req, res) => {
    try {
        const poem = await Poem.findByIdAndUpdate(req.params.poemId, { $inc: { views: 1 } }, { new: true });
        if (!poem) return res.status(404).json({ error: 'Poem not found' });
        res.json(poem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/poems', async (req, res) => {
    try {
        const poem = new Poem(req.body);
        await poem.save();
        res.status(201).json({ success: true, poemId: poem._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/poems/:poemId/like', async (req, res) => {
    try {
        const poem = await Poem.findByIdAndUpdate(req.params.poemId, { $inc: { likes: 1 } }, { new: true });
        res.json(poem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. QUOTES ROUTES

app.get('/api/quotes', async (req, res) => {
    try {
        const quotes = await Quote.find();
        res.json(quotes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/quotes/special/week', async (req, res) => {
    try {
        const quote = await Quote.findOne().sort({ createdAt: -1 });
        if (!quote) return res.status(404).json({ error: 'No quotes found' });
        res.json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/quotes', async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json({ success: true, quoteId: quote._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/quotes/:quoteId/share', async (req, res) => {
    try {
        const quote = await Quote.findByIdAndUpdate(req.params.quoteId, { $inc: { shares: 1 } }, { new: true });
        res.json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. BLOG ROUTES

app.get('/api/blog', async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ publishedDate: -1 });
        res.json(posts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/blog/:postId', async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndUpdate(
            req.params.postId,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!post) return res.status(404).json({ error: 'Blog post not found' });
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/blog', async (req, res) => {
    try {
        const post = new BlogPost(req.body);
        await post.save();
        res.status(201).json({ success: true, postId: post._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 6. PURCHASE/ORDER ROUTES

app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, orderId: order._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/orders/:orderId/confirm', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId, { paymentStatus: 'completed' }, { new: true });
        
        if (order.userId) {
            const user = await User.findById(order.userId);
            if (user && !user.purchasedBooks.includes(order.bookId)) {
                user.purchasedBooks.push(order.bookId);
                await user.save();
            }
        }
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/users/:userId/orders', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate('bookId');
        res.json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 7. NEWSLETTER ROUTES

app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }
        const subscriber = new Subscriber({ email });
        await subscriber.save();
        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already subscribed' });
        }
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/newsletter/subscribers', async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        res.json(subscribers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 8. BILINGUAL ROUTES

app.get('/api/books/:bookId/bilingual', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        
        const bilingualBook = {
            en: {
                title: book.title,
                description: book.description,
                chapters: book.chapters.map(ch => ({
                    number: ch.number,
                    title: ch.title,
                    content: ch.content
                }))
            },
            hi: {
                title: book.titleHi,
                description: book.descriptionHi,
                chapters: book.chapters.map(ch => ({
                    number: ch.number,
                    title: ch.titleHi,
                    content: ch.contentHi
                }))
            }
        };
        res.json(bilingualBook);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 9. FILE UPLOAD ROUTES

app.post('/api/upload/cover', upload.single('cover'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ success: true, filename: req.file.filename, url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/upload/pdf', upload.single('pdf'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ success: true, filename: req.file.filename, url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 10. ADMIN ANALYTICS

app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBooks = await Book.countDocuments();
        const totalPoems = await Poem.countDocuments();
        const totalQuotes = await Quote.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        res.json({
            totalUsers,
            totalBooks,
            totalPoems,
            totalQuotes,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ================== ERROR HANDLING ==================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        availableRoutes: [
            'GET /api/books',
            'GET /api/poems',
            'GET /api/quotes',
            'GET /api/blog',
            'POST /api/newsletter/subscribe'
        ]
    });
});

// ================== START SERVER ==================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 KSHstories server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Base: http://localhost:${PORT}/api`);
    console.log(`💾 Database: ${mongoose.connection.name}\n`);
});

module.exports = app;
