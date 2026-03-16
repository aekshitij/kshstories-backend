// ============================================================================
// KSHSTORIES - Complete Express Server with Admin Panel Support
// PRODUCTION READY FOR ONRENDER
// ============================================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express App
const app = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS Configuration
const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5001')
            .split(',')
            .map(url => url.trim());
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'X-Admin-Key', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length'],
    maxAge: 86400
};

app.use(cors(corsOptions));

// Static Files - Serve public assets
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority'
    })
    .then(() => {
        console.log('✓ MongoDB connected successfully');
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });
} else {
    console.warn('⚠️ MONGODB_URI not set - database features disabled');
}

// ============================================================================
// MODELS IMPORT
// ============================================================================

let Book, Poetry, Quote, Blog;

try {
    Book = require('./models/Book');
    Poetry = require('./models/Poetry');
    Quote = require('./models/Quote');
    Blog = require('./models/Blog');
} catch (err) {
    console.warn('⚠️ Some models not found - using fallback');
}

// ============================================================================
// MIDDLEWARE - ADMIN AUTHENTICATION
// ============================================================================

const adminAuth = (req, res, next) => {
    const adminKey = 
        req.headers['x-admin-key'] || 
        req.headers['authorization']?.replace('Bearer ', '') ||
        req.body?.adminKey;

    if (!adminKey) {
        return res.status(401).json({ 
            success: false, 
            error: 'No admin key provided'
        });
    }

    const ADMIN_KEY = process.env.ADMIN_KEY || 'admin_kshitij77_change_this_value';
    
    if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ 
            success: false, 
            error: 'Invalid admin key'
        });
    }

    req.isAdmin = true;
    next();
};

// ============================================================================
// ROUTES - ROOT & BASIC
// ============================================================================

// Root route - IMPORTANT FOR ONRENDER!
app.get('/', (req, res) => {
    res.json({ 
        name: 'KSHSTORIES API',
        version: '1.0.0',
        status: 'Server is running',
        endpoints: {
            health: '/health',
            admin_panel: '/admin',
            api: '/api'
        },
        message: 'Welcome to KSHSTORIES Backend'
    });
});

// Health Check
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)} minutes`,
        port: process.env.PORT,
        environment: process.env.NODE_ENV,
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Admin Panel Page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-panel.html'));
});

// ============================================================================
// ROUTES - ADMIN AUTHENTICATION
// ============================================================================

// Admin Login
app.post('/api/admin/login', (req, res) => {
    try {
        const { key } = req.body;
        const ADMIN_KEY = process.env.ADMIN_KEY || 'admin_kshitij77_change_this_value';

        if (!key) {
            return res.status(400).json({ 
                success: false, 
                error: 'Admin key is required' 
            });
        }

        if (key === ADMIN_KEY) {
            return res.json({ 
                success: true, 
                message: 'Login successful',
                token: `admin_session_${Date.now()}`,
                expiresIn: 3600
            });
        } else {
            return res.status(403).json({ 
                success: false, 
                error: 'Invalid admin key' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================================================
// ROUTES - ADMIN CONTENT MANAGEMENT
// ============================================================================

// ADD BOOK
app.post('/api/admin/books', adminAuth, async (req, res) => {
    try {
        if (!Book) {
            return res.status(500).json({ success: false, error: 'Book model not loaded' });
        }

        const { title, description, author, price, language, isFree, totalChapters } = req.body;

        if (!title || !description) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and description are required' 
            });
        }

        const newBook = new Book({
            title: title.trim(),
            description: description.trim(),
            author: author || 'Kshitij',
            price: price || 199,
            language: language || 'en',
            isFree: isFree || false,
            totalChapters: totalChapters || 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedBook = await newBook.save();

        res.status(201).json({ 
            success: true, 
            message: 'Book added successfully',
            book: savedBook 
        });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to add book' 
        });
    }
});

// ADD POETRY
app.post('/api/admin/poetry', adminAuth, async (req, res) => {
    try {
        if (!Poetry) {
            return res.status(500).json({ success: false, error: 'Poetry model not loaded' });
        }

        const { title, content, category, language } = req.body;

        if (!title || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and content are required' 
            });
        }

        const newPoem = new Poetry({
            title: title.trim(),
            content: content.trim(),
            category: category || 'Other',
            language: language || 'en',
            views: 0,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedPoem = await newPoem.save();

        res.status(201).json({ 
            success: true, 
            message: 'Poem added successfully',
            poem: savedPoem 
        });
    } catch (error) {
        console.error('Error adding poem:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to add poem' 
        });
    }
});

// ADD QUOTE
app.post('/api/admin/quotes', adminAuth, async (req, res) => {
    try {
        if (!Quote) {
            return res.status(500).json({ success: false, error: 'Quote model not loaded' });
        }

        const { text, author, category, language } = req.body;

        if (!text) {
            return res.status(400).json({ 
                success: false, 
                error: 'Quote text is required' 
            });
        }

        const newQuote = new Quote({
            text: text.trim(),
            author: author || 'Kshitij',
            category: category || 'Life',
            language: language || 'en',
            views: 0,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedQuote = await newQuote.save();

        res.status(201).json({ 
            success: true, 
            message: 'Quote added successfully',
            quote: savedQuote 
        });
    } catch (error) {
        console.error('Error adding quote:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to add quote' 
        });
    }
});

// ADD BLOG
app.post('/api/admin/blog', adminAuth, async (req, res) => {
    try {
        if (!Blog) {
            return res.status(500).json({ success: false, error: 'Blog model not loaded' });
        }

        const { title, content, tags, featured, excerpt } = req.body;

        if (!title || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and content are required' 
            });
        }

        const newBlog = new Blog({
            title: title.trim(),
            content: content.trim(),
            excerpt: excerpt || content.substring(0, 150) + '...',
            tags: tags || ['blog'],
            featured: featured || false,
            views: 0,
            comments: [],
            published: true,
            publishedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedBlog = await newBlog.save();

        res.status(201).json({ 
            success: true, 
            message: 'Blog published successfully',
            blog: savedBlog 
        });
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to add blog' 
        });
    }
});

// ============================================================================
// ROUTES - PUBLIC API (Examples)
// ============================================================================

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        if (!Book) {
            return res.json({ success: false, error: 'Service not available' });
        }
        const books = await Book.find().limit(20);
        res.json({ success: true, count: books.length, books });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all poetry
app.get('/api/poetry', async (req, res) => {
    try {
        if (!Poetry) {
            return res.json({ success: false, error: 'Service not available' });
        }
        const poems = await Poetry.find().limit(20);
        res.json({ success: true, count: poems.length, poems });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all quotes
app.get('/api/quotes', async (req, res) => {
    try {
        if (!Quote) {
            return res.json({ success: false, error: 'Service not available' });
        }
        const quotes = await Quote.find().limit(50);
        res.json({ success: true, count: quotes.length, quotes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all blogs
app.get('/api/blog', async (req, res) => {
    try {
        if (!Blog) {
            return res.json({ success: false, error: 'Service not available' });
        }
        const blogs = await Blog.find({ published: true }).limit(20);
        res.json({ success: true, count: blogs.length, blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
    try {
        if (!Book) {
            return res.json({ success: false, error: 'Service not available' });
        }
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.json({ success: true, book });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single poem
app.get('/api/poetry/:id', async (req, res) => {
    try {
        if (!Poetry) {
            return res.json({ success: false, error: 'Service not available' });
        }
        const poem = await Poetry.findById(req.params.id);
        if (!poem) {
            return res.status(404).json({ success: false, error: 'Poem not found' });
        }
        res.json({ success: true, poem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single blog
app.get('/api/blog/:id', async (req, res) => {
    try {
        if (!Blog) {
            return res.json({ success: false, error: 'Service not available' });
        }
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        res.json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method,
        availableEndpoints: {
            root: 'GET /',
            health: 'GET /health',
            admin: 'GET /admin',
            login: 'POST /api/admin/login',
            books: 'GET /api/books, POST /api/admin/books',
            poetry: 'GET /api/poetry, POST /api/admin/poetry',
            quotes: 'GET /api/quotes, POST /api/admin/quotes',
            blog: 'GET /api/blog, POST /api/admin/blog'
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({ 
        success: false, 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     🎭 KSHSTORIES Server Started      ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`✓ Health Check: http://localhost:${PORT}/health`);
    console.log(`✓ API Base: http://localhost:${PORT}/api`);
    console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    console.log(`✓ CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}\n`);
    
    if (mongoose.connection.readyState === 1) {
        console.log('✓ MongoDB: Connected\n');
    } else {
        console.log('⚠️ MongoDB: Connecting...\n');
    }
});

process.on('SIGINT', () => {
    console.log('\n\nShutting down gracefully...');
    mongoose.connection.close();
    process.exit(0);
});

module.exports = app;
