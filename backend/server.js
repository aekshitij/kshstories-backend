const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
app.use(express.static('public'));

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kshstories', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ================== SCHEMAS ==================

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String, // In production, use bcrypt
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
    title: String,
    titleHi: String, // Hindi title
    author: String,
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
    title: String,
    titleHi: String,
    content: String,
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
    text: String,
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
    title: String,
    titleHi: String,
    content: String,
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

// Purchase/Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    amount: Number,
    currency: String,
    paymentMethod: String,
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: String,
    languageReceived: String, // 'en', 'hi', or 'both'
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Newsletter Subscriber Schema
const subscriberSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    subscribedAt: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// ================== API ROUTES ==================

// 1. USER ROUTES

// Register User
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ success: true, message: 'User registered', userId: user._id });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Login User
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
        res.json({ success: true, userId: user._id, email: user.email });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get User Profile
app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('purchasedBooks');
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update User Preferred Language
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

// Get All Books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Single Book
app.get('/api/books/:bookId', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        res.json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Book Chapters
app.get('/api/books/:bookId/chapters', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        res.json(book.chapters);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Specific Chapter
app.get('/api/books/:bookId/chapters/:chapterNumber', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        const chapter = book.chapters.find(c => c.number === parseInt(req.params.chapterNumber));
        if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
        res.json(chapter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create Book (Admin)
app.post('/api/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json({ success: true, bookId: book._id });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Add Chapter to Book
app.post('/api/books/:bookId/chapters', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        book.chapters.push(req.body);
        await book.save();
        res.json({ success: true, chapter: req.body });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Reading Progress
app.put('/api/users/:userId/progress/:bookId', async (req, res) => {
    try {
        const { chapter, progress } = req.body;
        const user = await User.findById(req.params.userId);
        const existingProgress = user.readingProgress.find(p => p.bookId.toString() === req.params.bookId);
        
        if (existingProgress) {
            existingProgress.chapter = chapter;
            existingProgress.progress = progress;
        } else {
            user.readingProgress.push({ bookId: req.params.bookId, chapter, progress });
        }
        
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add Bookmark
app.post('/api/users/:userId/bookmarks', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        user.bookmarks.push(req.body);
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. POETRY ROUTES

// Get All Poems
app.get('/api/poems', async (req, res) => {
    try {
        const poems = await Poem.find();
        res.json(poems);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Poems by Category
app.get('/api/poems/category/:category', async (req, res) => {
    try {
        const poems = await Poem.find({ category: req.params.category });
        res.json(poems);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create Poem (Admin)
app.post('/api/poems', async (req, res) => {
    try {
        const poem = new Poem(req.body);
        await poem.save();
        res.status(201).json({ success: true, poemId: poem._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Increment Poem Views
app.put('/api/poems/:poemId/view', async (req, res) => {
    try {
        const poem = await Poem.findByIdAndUpdate(req.params.poemId, { $inc: { views: 1 } }, { new: true });
        res.json(poem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like Poem
app.put('/api/poems/:poemId/like', async (req, res) => {
    try {
        const poem = await Poem.findByIdAndUpdate(req.params.poemId, { $inc: { likes: 1 } }, { new: true });
        res.json(poem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. QUOTES ROUTES

// Get All Quotes
app.get('/api/quotes', async (req, res) => {
    try {
        const quotes = await Quote.find();
        res.json(quotes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Quote of the Week
app.get('/api/quotes/special/week', async (req, res) => {
    try {
        const quote = await Quote.findOne().sort({ createdAt: -1 });
        res.json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create Quote (Admin)
app.post('/api/quotes', async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json({ success: true, quoteId: quote._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Share Quote
app.put('/api/quotes/:quoteId/share', async (req, res) => {
    try {
        const quote = await Quote.findByIdAndUpdate(req.params.quoteId, { $inc: { shares: 1 } }, { new: true });
        res.json(quote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. BLOG ROUTES

// Get All Blog Posts
app.get('/api/blog', async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ publishedDate: -1 });
        res.json(posts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Single Blog Post
app.get('/api/blog/:postId', async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndUpdate(
            req.params.postId,
            { $inc: { views: 1 } },
            { new: true }
        );
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create Blog Post (Admin)
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

// Create Order
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, orderId: order._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Confirm Payment
app.put('/api/orders/:orderId/confirm', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.orderId, { paymentStatus: 'completed' }, { new: true });
        
        // Add book to user's purchased books
        const user = await User.findById(order.userId);
        if (!user.purchasedBooks.includes(order.bookId)) {
            user.purchasedBooks.push(order.bookId);
            await user.save();
        }
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get User Orders
app.get('/api/users/:userId/orders', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate('bookId');
        res.json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 7. NEWSLETTER ROUTES

// Subscribe to Newsletter
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
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

// Get Subscribers (Admin)
app.get('/api/newsletter/subscribers', async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        res.json(subscribers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 8. LANGUAGE/BILINGUAL ROUTES

// Get Bilingual Book (EN + HI)
app.get('/api/books/:bookId/bilingual', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
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

// ================== FILE UPLOAD ROUTE ==================

// Upload Book Cover
app.post('/api/upload/cover', upload.single('cover'), (req, res) => {
    try {
        res.json({ success: true, filename: req.file.filename, url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Upload PDF
app.post('/api/upload/pdf', upload.single('pdf'), (req, res) => {
    try {
        res.json({ success: true, filename: req.file.filename, url: `/uploads/${req.file.filename}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ================== SEARCH ROUTE ==================

// Search Books, Poems, Quotes, Blog Posts
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        const books = await Book.find({ $text: { $search: query } });
        const poems = await Poem.find({ $text: { $search: query } });
        const quotes = await Quote.find({ $text: { $search: query } });
        const posts = await BlogPost.find({ $text: { $search: query } });
        
        res.json({ books, poems, quotes, posts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ================== ADMIN ANALYTICS ==================

// Get Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBooks = await Book.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        res.json({
            totalUsers,
            totalBooks,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ================== ERROR HANDLING ==================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong' });
});

// ================== START SERVER ==================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`KSHstories server running on port ${PORT}`);
});

module.exports = app;
