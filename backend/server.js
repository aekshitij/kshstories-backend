// server.js - Main Express Server for KSHSTORIES
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kshstories', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ Connected to MongoDB');
}).catch(err => {
    console.error('✗ MongoDB connection error:', err);
});

// ==================== MODELS ====================

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: String,
    avatar: String,
    preferences: {
        language: { type: String, default: 'en' },
        theme: { type: String, default: 'light' }
    },
    purchasedBooks: [mongoose.Schema.Types.ObjectId],
    bookmarks: [{
        bookId: mongoose.Schema.Types.ObjectId,
        chapterId: mongoose.Schema.Types.ObjectId,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    readingHistory: [{
        bookId: mongoose.Schema.Types.ObjectId,
        chapterId: mongoose.Schema.Types.ObjectId,
        progress: Number,
        lastRead: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Book Schema
const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    coverImage: String,
    language: { type: String, default: 'en' },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    author: String,
    chapters: [mongoose.Schema.Types.ObjectId],
    pdfFile: String,
    rating: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Chapter Schema
const ChapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    chapterNumber: Number,
    bookId: mongoose.Schema.Types.ObjectId,
    isFree: { type: Boolean, default: false },
    wordCount: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Poetry Schema
const PoetrySchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    category: { type: String, enum: ['Love', 'Longing', 'Silence', 'Healing', 'Nostalgia'] },
    language: { type: String, default: 'en' },
    author: String,
    createdAt: { type: Date, default: Date.now }
});

// Quote Schema
const QuoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: String,
    category: String,
    language: { type: String, default: 'en' },
    createdAt: { type: Date, default: Date.now }
});

// Blog Schema
const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    tags: [String],
    author: String,
    publishDate: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Purchase Schema
const PurchaseSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    bookId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    currency: { type: String, default: 'INR' },
    paymentId: String,
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    purchaseDate: { type: Date, default: Date.now }
});

// Newsletter Schema
const NewsletterSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    subscribedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Book = mongoose.model('Book', BookSchema);
const Chapter = mongoose.model('Chapter', ChapterSchema);
const Poetry = mongoose.model('Poetry', PoetrySchema);
const Quote = mongoose.model('Quote', QuoteSchema);
const Blog = mongoose.model('Blog', BlogSchema);
const Purchase = mongoose.model('Purchase', PurchaseSchema);
const Newsletter = mongoose.model('Newsletter', NewsletterSchema);

// ==================== MIDDLEWARE ====================

// JWT Verification
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// ==================== AUTHENTICATION ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            name
        });
        
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '7d'
        });
        
        res.json({ token, user: { id: user._id, email, name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '7d'
        });
        
        res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Profile
app.get('/api/auth/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== BOOKS ROUTES ====================

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const { language = 'en', sort = '-createdAt' } = req.query;
        const books = await Book.find({ language })
            .sort(sort)
            .populate('chapters')
            .limit(50);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('chapters');
        if (!book) return res.status(404).json({ error: 'Book not found' });
        
        book.views += 1;
        await book.save();
        
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get chapters for a book
app.get('/api/books/:bookId/chapters', async (req, res) => {
    try {
        const chapters = await Chapter.find({ bookId: req.params.bookId });
        res.json(chapters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific chapter
app.get('/api/chapters/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        res.json(chapter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== POETRY ROUTES ====================

// Get all poetry
app.get('/api/poetry', async (req, res) => {
    try {
        const { category, language = 'en' } = req.query;
        let query = { language };
        if (category) query.category = category;
        
        const poetry = await Poetry.find(query).sort('-createdAt');
        res.json(poetry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get poetry by category
app.get('/api/poetry/:category', async (req, res) => {
    try {
        const poetry = await Poetry.find({ category: req.params.category });
        res.json(poetry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== QUOTES ROUTES ====================

// Get random quotes
app.get('/api/quotes', async (req, res) => {
    try {
        const { limit = 5, language = 'en' } = req.query;
        const quotes = await Quote.find({ language })
            .limit(parseInt(limit))
            .sort({ _id: -1 });
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all quotes
app.get('/api/quotes/all', async (req, res) => {
    try {
        const quotes = await Quote.find().sort('-createdAt');
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== BLOG ROUTES ====================

// Get all blog posts
app.get('/api/blog', async (req, res) => {
    try {
        const posts = await Blog.find().sort('-publishDate');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single blog post
app.get('/api/blog/:id', async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== PAYMENT ROUTES ====================

// Create payment order
app.post('/api/payment/create-order', verifyToken, async (req, res) => {
    try {
        const { bookId, amount } = req.body;
        
        const purchase = new Purchase({
            userId: req.userId,
            bookId,
            amount,
            status: 'pending'
        });
        
        await purchase.save();
        
        // In production, integrate with Razorpay API
        // This is a simplified example
        res.json({
            orderId: purchase._id,
            amount,
            currency: 'INR'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify payment
app.post('/api/payment/verify', verifyToken, async (req, res) => {
    try {
        const { orderId, paymentId } = req.body;
        
        const purchase = await Purchase.findByIdAndUpdate(
            orderId,
            { status: 'success', paymentId },
            { new: true }
        );
        
        if (purchase) {
            const user = await User.findById(req.userId);
            if (!user.purchasedBooks.includes(purchase.bookId)) {
                user.purchasedBooks.push(purchase.bookId);
                await user.save();
            }
        }
        
        res.json({ success: true, purchase });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== USER ROUTES ====================

// Add bookmark
app.post('/api/user/bookmarks', verifyToken, async (req, res) => {
    try {
        const { bookId, chapterId, text } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $push: { bookmarks: { bookId, chapterId, text } } },
            { new: true }
        );
        res.json(user.bookmarks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get bookmarks
app.get('/api/user/bookmarks', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user.bookmarks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update reading progress
app.post('/api/user/reading-progress', verifyToken, async (req, res) => {
    try {
        const { bookId, chapterId, progress } = req.body;
        const user = await User.findById(req.userId);
        
        const existingProgress = user.readingHistory.find(
            h => h.bookId.toString() === bookId && h.chapterId.toString() === chapterId
        );
        
        if (existingProgress) {
            existingProgress.progress = progress;
            existingProgress.lastRead = new Date();
        } else {
            user.readingHistory.push({ bookId, chapterId, progress });
        }
        
        await user.save();
        res.json(user.readingHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== NEWSLETTER ROUTES ====================

// Subscribe to newsletter
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        let subscriber = await Newsletter.findOne({ email });
        if (subscriber) {
            return res.status(400).json({ error: 'Already subscribed' });
        }
        
        subscriber = new Newsletter({ email });
        await subscriber.save();
        
        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== ADMIN ROUTES ====================

// Create book (Admin)
app.post('/api/admin/books', verifyToken, async (req, res) => {
    try {
        const { title, description, price, isFree, language } = req.body;
        const book = new Book({
            title,
            description,
            price,
            isFree,
            language,
            author: 'Kshitij'
        });
        
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add chapter (Admin)
app.post('/api/admin/chapters', verifyToken, async (req, res) => {
    try {
        const { title, content, chapterNumber, bookId, isFree } = req.body;
        const chapter = new Chapter({
            title,
            content,
            chapterNumber,
            bookId,
            isFree,
            wordCount: content.split(' ').length
        });
        
        await chapter.save();
        
        // Add chapter to book
        await Book.findByIdAndUpdate(
            bookId,
            { $push: { chapters: chapter._id } }
        );
        
        res.status(201).json(chapter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add poem (Admin)
app.post('/api/admin/poetry', verifyToken, async (req, res) => {
    try {
        const { title, content, category, language } = req.body;
        const poem = new Poetry({
            title,
            content,
            category,
            language,
            author: 'Kshitij'
        });
        
        await poem.save();
        res.status(201).json(poem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add quote (Admin)
app.post('/api/admin/quotes', verifyToken, async (req, res) => {
    try {
        const { text, category, language } = req.body;
        const quote = new Quote({
            text,
            category,
            language,
            author: 'Kshitij'
        });
        
        await quote.save();
        res.status(201).json(quote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add blog post (Admin)
app.post('/api/admin/blog', verifyToken, async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const post = new Blog({
            title,
            content,
            tags,
            author: 'Kshitij'
        });
        
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ KSHSTORIES Server running on http://localhost:${PORT}`);
    console.log(`✓ API endpoints ready`);
    console.log(`✓ Database connected`);
});
