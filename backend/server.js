// ============================================================================
// KSHSTORIES - Complete Express Server
// WITH INLINE ADMIN PANEL HTML - NO FILE DEPENDENCY
// ============================================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// Try to serve static files if public folder exists
try {
    app.use(express.static(path.join(__dirname, 'public')));
} catch (err) {
    console.warn('⚠️ Public folder not found - using inline HTML');
}

// ============================================================================
// DATABASE
// ============================================================================

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority'
    })
    .then(() => console.log('✓ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB Error:', err.message));
}

// ============================================================================
// MODELS
// ============================================================================

let Book, Poetry, Quote, Blog;

try {
    Book = require('./models/Book');
    Poetry = require('./models/Poetry');
    Quote = require('./models/Quote');
    Blog = require('./models/Blog');
} catch (err) {
    console.warn('⚠️ Some models not found');
}

// ============================================================================
// ADMIN AUTH MIDDLEWARE
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

    next();
};

// ============================================================================
// ROUTES - ROOT & BASIC
// ============================================================================

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

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime() / 60)} minutes`,
        port: process.env.PORT,
        environment: process.env.NODE_ENV,
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// ============================================================================
// ADMIN PANEL - INLINE HTML (NO FILE DEPENDENCY!)
// ============================================================================

app.get('/admin', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - KSHSTORIES</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Lora', serif; background: #f5f5f5; color: #333; }
        .container { max-width: 900px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .message { padding: 15px; margin-bottom: 20px; border-radius: 4px; border-left: 4px solid; display: none; }
        .message.show { display: block; animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .message.success { background: #d4edda; color: #155724; border-color: #28a745; }
        .message.error { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab-btn { padding: 10px 20px; background: white; border: 2px solid #ddd; cursor: pointer; border-radius: 4px; transition: all 0.3s; font-weight: 500; }
        .tab-btn:hover { border-color: #1a1a1a; }
        .tab-btn.active { background: #1a1a1a; color: white; border-color: #1a1a1a; }
        .tab-content { display: none; background: white; padding: 30px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .tab-content.active { display: block; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a; }
        .form-group input, .form-group textarea, .form-group select { 
            width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; 
            font-family: inherit; font-size: 14px; transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { 
            outline: none; border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
        }
        .form-group textarea { min-height: 120px; resize: vertical; }
        .btn { 
            padding: 12px 24px; background: #1a1a1a; color: white; border: none; border-radius: 4px; 
            cursor: pointer; font-weight: 600; transition: all 0.3s; font-size: 14px;
        }
        .btn:hover { background: #333; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .btn-logout { background: #dc3545; }
        .btn-logout:hover { background: #c82333; }
        .info-box { background: #e7f3ff; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #0066cc; color: #004085; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🎭 KSHSTORIES Admin Panel</h1>
        <p>Manage Your Content Securely</p>
    </div>
    
    <div id="successMsg" class="message success"></div>
    <div id="errorMsg" class="message error"></div>
    
    <div class="tabs">
        <button class="tab-btn active" data-tab="login">🔐 Login</button>
        <button class="tab-btn" data-tab="books">📚 Add Book</button>
        <button class="tab-btn" data-tab="poetry">✍️ Add Poetry</button>
        <button class="tab-btn" data-tab="quotes">💭 Add Quote</button>
        <button class="tab-btn" data-tab="blog">📝 Add Blog</button>
        <button class="tab-btn btn-logout" onclick="logout()" style="border: none; padding: 10px 20px; margin-left: auto;">Logout</button>
    </div>

    <div class="tab-content active" id="login">
        <h2 style="margin-bottom: 20px;">Admin Login</h2>
        <div class="info-box">
            <strong>🔒 Secure Login Required</strong><br>
            Enter your admin key to access the panel
        </div>
        <div class="form-group">
            <label>Admin Key</label>
            <input type="password" id="adminKey" placeholder="Enter your admin key" autocomplete="off">
        </div>
        <button class="btn" onclick="adminLogin()">Login</button>
    </div>

    <div class="tab-content" id="books">
        <h2 style="margin-bottom: 20px;">📚 Add Book</h2>
        <div class="form-group">
            <label>Book Title <span style="color: red;">*</span></label>
            <input type="text" id="bookTitle" placeholder="Enter book title">
        </div>
        <div class="form-group">
            <label>Description <span style="color: red;">*</span></label>
            <textarea id="bookDescription" placeholder="Enter book description..."></textarea>
        </div>
        <div class="form-group">
            <label>Author</label>
            <input type="text" id="bookAuthor" value="Kshitij" placeholder="Author name">
        </div>
        <div class="form-group">
            <label>Price (₹)</label>
            <input type="number" id="bookPrice" value="199" min="0">
        </div>
        <div class="form-group">
            <label>Language</label>
            <select id="bookLanguage">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mix">Mixed</option>
            </select>
        </div>
        <button class="btn" onclick="addBook()">➕ Add Book</button>
    </div>

    <div class="tab-content" id="poetry">
        <h2 style="margin-bottom: 20px;">✍️ Add Poetry</h2>
        <div class="form-group">
            <label>Poem Title <span style="color: red;">*</span></label>
            <input type="text" id="poemTitle" placeholder="Enter poem title">
        </div>
        <div class="form-group">
            <label>Poem Content <span style="color: red;">*</span></label>
            <textarea id="poemContent" placeholder="Enter poem content..."></textarea>
        </div>
        <div class="form-group">
            <label>Category</label>
            <select id="poemCategory">
                <option>Love</option>
                <option>Longing</option>
                <option selected>Silence</option>
                <option>Healing</option>
                <option>Nature</option>
                <option>Other</option>
            </select>
        </div>
        <button class="btn" onclick="addPoem()">➕ Add Poem</button>
    </div>

    <div class="tab-content" id="quotes">
        <h2 style="margin-bottom: 20px;">💭 Add Quote</h2>
        <div class="form-group">
            <label>Quote Text <span style="color: red;">*</span></label>
            <textarea id="quoteText" placeholder="Enter quote..."></textarea>
        </div>
        <div class="form-group">
            <label>Author</label>
            <input type="text" id="quoteAuthor" value="Kshitij" placeholder="Quote author">
        </div>
        <button class="btn" onclick="addQuote()">➕ Add Quote</button>
    </div>

    <div class="tab-content" id="blog">
        <h2 style="margin-bottom: 20px;">📝 Add Blog</h2>
        <div class="form-group">
            <label>Blog Title <span style="color: red;">*</span></label>
            <input type="text" id="blogTitle" placeholder="Enter blog title">
        </div>
        <div class="form-group">
            <label>Blog Content <span style="color: red;">*</span></label>
            <textarea id="blogContent" placeholder="Enter blog content..."></textarea>
        </div>
        <div class="form-group">
            <label>Tags (comma-separated)</label>
            <input type="text" id="blogTags" placeholder="writing, silence, thoughts">
        </div>
        <button class="btn" onclick="addBlog()">📤 Publish</button>
    </div>
</div>

<script>
    const API_BASE = window.location.origin;
    let adminKey = '';
    let isLoggedIn = false;
    
    console.log('Admin Panel Ready');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            if (!isLoggedIn && tab !== 'login') {
                showError('❌ Please login first!');
                return;
            }
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            if (document.getElementById(tab)) {
                document.getElementById(tab).classList.add('active');
                e.target.classList.add('active');
            }
        });
    });
    
    function adminLogin() {
        const key = document.getElementById('adminKey').value.trim();
        if (!key) {
            showError('❌ Please enter admin key');
            return;
        }
        
        fetch(API_BASE + '/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: key })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                adminKey = key;
                isLoggedIn = true;
                showSuccess('✅ Login successful!');
                setTimeout(() => {
                    document.getElementById('login').classList.remove('active');
                    document.getElementById('books').classList.add('active');
                    document.querySelectorAll('[data-tab="books"]')[0].classList.add('active');
                }, 500);
            } else {
                showError('❌ Invalid admin key!');
            }
        })
        .catch(err => showError('❌ Error: ' + err.message));
    }
    
    function logout() {
        adminKey = '';
        isLoggedIn = false;
        document.getElementById('adminKey').value = '';
        showSuccess('👋 Logged out');
        setTimeout(() => {
            document.getElementById('login').classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('[data-tab="login"]')[0].classList.add('active');
        }, 500);
    }
    
    function showSuccess(msg) {
        const el = document.getElementById('successMsg');
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 4000);
    }
    
    function showError(msg) {
        const el = document.getElementById('errorMsg');
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 5000);
    }
    
    async function sendRequest(endpoint, data) {
        if (!adminKey) {
            showError('❌ Not logged in');
            return;
        }
        
        try {
            const response = await fetch(API_BASE + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Key': adminKey
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json().catch(() => ({ error: 'Invalid response' }));
            
            if (response.ok && result.success) {
                showSuccess('✅ Added successfully!');
                document.querySelectorAll('input:not([type="password"]), textarea').forEach(el => el.value = '');
            } else {
                showError('❌ Error: ' + (result.error || 'Failed'));
            }
        } catch (error) {
            showError('❌ Connection error');
            console.error(error);
        }
    }
    
    function addBook() {
        const title = document.getElementById('bookTitle').value.trim();
        const desc = document.getElementById('bookDescription').value.trim();
        if (!title || !desc) {
            showError('❌ Fill title & description');
            return;
        }
        sendRequest('/api/admin/books', {
            title, description: desc,
            author: document.getElementById('bookAuthor').value,
            price: parseInt(document.getElementById('bookPrice').value),
            language: document.getElementById('bookLanguage').value
        });
    }
    
    function addPoem() {
        const title = document.getElementById('poemTitle').value.trim();
        const content = document.getElementById('poemContent').value.trim();
        if (!title || !content) {
            showError('❌ Fill title & content');
            return;
        }
        sendRequest('/api/admin/poetry', {
            title, content,
            category: document.getElementById('poemCategory').value
        });
    }
    
    function addQuote() {
        const text = document.getElementById('quoteText').value.trim();
        if (!text) {
            showError('❌ Fill quote text');
            return;
        }
        sendRequest('/api/admin/quotes', {
            text,
            author: document.getElementById('quoteAuthor').value
        });
    }
    
    function addBlog() {
        const title = document.getElementById('blogTitle').value.trim();
        const content = document.getElementById('blogContent').value.trim();
        if (!title || !content) {
            showError('❌ Fill title & content');
            return;
        }
        const tags = document.getElementById('blogTags').value.split(',').map(t => t.trim()).filter(t => t);
        sendRequest('/api/admin/blog', {
            title, content,
            tags: tags.length > 0 ? tags : ['blog']
        });
    }
</script>
</body>
</html>`);
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.post('/api/admin/login', (req, res) => {
    try {
        const { key } = req.body;
        
        // Direct check
        console.log('Received key:', key);
        console.log('ENV ADMIN_KEY:', process.env.ADMIN_KEY);
        
        // Check directly with 'kshitij77'
        if (key === 'kshitij77' || key === process.env.ADMIN_KEY) {
            return res.json({ 
                success: true, 
                message: 'Login successful',
                token: `admin_${Date.now()}`
            });
        } else {
            return res.status(403).json({ 
                success: false, 
                error: 'Invalid admin key',
                received: key,
                expected: process.env.ADMIN_KEY
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
});
// ADD BOOK
app.post('/api/admin/books', adminAuth, async (req, res) => {
    try {
        if (!Book) {
            return res.status(500).json({ success: false, error: 'Book model not loaded' });
        }

        const { title, description, author, price, language } = req.body;

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
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newBook.save();

        res.status(201).json({ 
            success: true, 
            message: 'Book added successfully',
            book: newBook 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

        await newPoem.save();

        res.status(201).json({ 
            success: true, 
            message: 'Poem added successfully',
            poem: newPoem 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

        await newQuote.save();

        res.status(201).json({ 
            success: true, 
            message: 'Quote added successfully',
            quote: newQuote 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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

        await newBlog.save();

        res.status(201).json({ 
            success: true, 
            message: 'Blog published successfully',
            blog: newBlog 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// PUBLIC API ROUTES
// ============================================================================

app.get('/api/books', async (req, res) => {
    try {
        if (!Book) return res.json({ success: false, error: 'Service unavailable' });
        const books = await Book.find().limit(20);
        res.json({ success: true, count: books.length, books });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/poetry', async (req, res) => {
    try {
        if (!Poetry) return res.json({ success: false, error: 'Service unavailable' });
        const poems = await Poetry.find().limit(20);
        res.json({ success: true, count: poems.length, poems });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/quotes', async (req, res) => {
    try {
        if (!Quote) return res.json({ success: false, error: 'Service unavailable' });
        const quotes = await Quote.find().limit(50);
        res.json({ success: true, count: quotes.length, quotes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/blog', async (req, res) => {
    try {
        if (!Blog) return res.json({ success: false, error: 'Service unavailable' });
        const blogs = await Blog.find({ published: true }).limit(20);
        res.json({ success: true, count: blogs.length, blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('\n✅ KSHSTORIES Server Running');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📡 API Base: http://localhost:${PORT}/api\n`);
});

module.exports = app;
