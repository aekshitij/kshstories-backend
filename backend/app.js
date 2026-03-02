/**
 * KSHstories - Advanced Frontend JavaScript
 * Handles API integration, reading features, language switching, and more
 */

const API_BASE_URL = 'http://localhost:5000/api';
let currentUser = null;
let currentLanguage = 'en';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    checkUserAuth();
    setupEventListeners();
    loadInitialContent();
}

// ============================================
// AUTHENTICATION
// ============================================

function checkUserAuth() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        fetchUserProfile(userId);
    }
}

async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        const user = await response.json();
        currentUser = user;
        currentLanguage = user.preferredLanguage || 'en';
        updateUIForAuthenticatedUser(user);
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
    }
}

function updateUIForAuthenticatedUser(user) {
    // Update UI elements to show user is logged in
    console.log('User logged in:', user.name);
    // Add personalized greeting or account menu
}

function logout() {
    localStorage.removeItem('userId');
    currentUser = null;
    location.reload();
}

// ============================================
// LANGUAGE SWITCHING
// ============================================

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');
        switchLanguage(lang);
    });
});

function switchLanguage(lang) {
    currentLanguage = lang;
    
    if (currentUser) {
        updateUserLanguage(currentUser._id, lang);
    }
    
    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Reload content in new language
    loadContentInLanguage(lang);
    console.log('Language switched to:', lang);
}

async function updateUserLanguage(userId, language) {
    try {
        await fetch(`${API_BASE_URL}/users/${userId}/language`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language })
        });
    } catch (error) {
        console.error('Failed to update language preference:', error);
    }
}

function loadContentInLanguage(lang) {
    // This function would dynamically load content in the selected language
    // For now, the content is already bilingual in the database
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
}

// ============================================
// CONTENT LOADING
// ============================================

async function loadInitialContent() {
    try {
        await loadBooks();
        await loadPoems();
        await loadQuotes();
        await loadBlogPosts();
    } catch (error) {
        console.error('Failed to load initial content:', error);
    }
}

async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Failed to load books:', error);
    }
}

function displayBooks(books) {
    // Update UI with books
    console.log('Books loaded:', books.length);
    // This would update the books section with actual data
}

async function loadPoems() {
    try {
        const response = await fetch(`${API_BASE_URL}/poems`);
        const poems = await response.json();
        displayPoems(poems);
    } catch (error) {
        console.error('Failed to load poems:', error);
    }
}

function displayPoems(poems) {
    console.log('Poems loaded:', poems.length);
}

async function loadQuotes() {
    try {
        const response = await fetch(`${API_BASE_URL}/quotes`);
        const quotes = await response.json();
        displayQuotes(quotes);
    } catch (error) {
        console.error('Failed to load quotes:', error);
    }
}

function displayQuotes(quotes) {
    console.log('Quotes loaded:', quotes.length);
}

async function loadBlogPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/blog`);
        const posts = await response.json();
        displayBlogPosts(posts);
    } catch (error) {
        console.error('Failed to load blog posts:', error);
    }
}

function displayBlogPosts(posts) {
    console.log('Blog posts loaded:', posts.length);
}

// ============================================
// READING FEATURES
// ============================================

async function updateReadingProgress(bookId, chapter, progress) {
    if (!currentUser) {
        console.log('User must be logged in to track progress');
        return;
    }

    try {
        await fetch(`${API_BASE_URL}/users/${currentUser._id}/progress/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapter, progress })
        });
        console.log('Reading progress updated');
    } catch (error) {
        console.error('Failed to update reading progress:', error);
    }
}

async function addBookmark(bookId, chapter, location) {
    if (!currentUser) {
        console.log('User must be logged in to create bookmarks');
        return;
    }

    try {
        await fetch(`${API_BASE_URL}/users/${currentUser._id}/bookmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId, chapter, location })
        });
        console.log('Bookmark added');
    } catch (error) {
        console.error('Failed to add bookmark:', error);
    }
}

// ============================================
// POEM INTERACTIONS
// ============================================

async function likePoemHandler(poemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/poems/${poemId}/like`, {
            method: 'PUT'
        });
        const poem = await response.json();
        console.log('Poem liked! Total likes:', poem.likes);
    } catch (error) {
        console.error('Failed to like poem:', error);
    }
}

async function viewPoemHandler(poemId) {
    try {
        await fetch(`${API_BASE_URL}/poems/${poemId}/view`, {
            method: 'PUT'
        });
    } catch (error) {
        console.error('Failed to track poem view:', error);
    }
}

// ============================================
// QUOTE SHARING
// ============================================

function shareQuote(quoteText, platform) {
    const encodedText = encodeURIComponent(quoteText + '\n\n- KSHstories');
    
    switch(platform) {
        case 'Instagram':
            // Copy to clipboard (Instagram has no direct share API)
            navigator.clipboard.writeText(quoteText).then(() => {
                alert('Quote copied! Paste it on Instagram.');
            });
            break;
        case 'Pinterest':
            window.open(`https://pinterest.com/pin/create/button/?description=${encodedText}`, '_blank');
            break;
        case 'Twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
            break;
        case 'Facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`, '_blank');
            break;
    }
    
    // Track share
    trackQuoteShare(quoteText);
}

async function trackQuoteShare(quoteText) {
    try {
        // Find quote ID from text and update shares
        const response = await fetch(`${API_BASE_URL}/quotes`);
        const quotes = await response.json();
        const quote = quotes.find(q => q.text === quoteText);
        
        if (quote) {
            await fetch(`${API_BASE_URL}/quotes/${quote._id}/share`, {
                method: 'PUT'
            });
        }
    } catch (error) {
        console.error('Failed to track quote share:', error);
    }
}

// ============================================
// NEWSLETTER
// ============================================

async function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Thank you for subscribing! Check your email for confirmation.');
            e.target.reset();
        } else {
            alert(data.message || 'Subscription failed. Please try again.');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        alert('An error occurred. Please try again.');
    }
}

// ============================================
// PURCHASE SYSTEM
// ============================================

async function initiateBookPurchase(bookId) {
    if (!currentUser) {
        alert('Please log in to purchase books');
        return;
    }

    try {
        // Create order
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser._id,
                bookId: bookId,
                amount: 299,
                currency: 'INR',
                paymentMethod: 'card',
                languageReceived: 'both' // Auto bilingual
            })
        });

        const order = await response.json();
        
        // Redirect to payment (Stripe integration)
        // In production, use Stripe SDK
        initializePayment(order.orderId);
    } catch (error) {
        console.error('Failed to initiate purchase:', error);
    }
}

function initializePayment(orderId) {
    // This would integrate with Stripe
    console.log('Initialize payment for order:', orderId);
    alert('Payment gateway would open here (Stripe integration needed)');
}

async function confirmPayment(orderId, transactionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId })
        });

        const order = await response.json();
        if (order.success) {
            alert('Purchase successful! You now have access to this book and its bilingual version.');
            // Reload user profile to update purchased books
            fetchUserProfile(currentUser._id);
        }
    } catch (error) {
        console.error('Failed to confirm payment:', error);
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

async function searchContent(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

function displaySearchResults(results) {
    console.log('Search results:', results);
    // Display results in modal or separate section
}

// ============================================
// BLOG FEATURES
// ============================================

async function loadBlogPost(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/blog/${postId}`);
        const post = await response.json();
        displayBlogPost(post);
    } catch (error) {
        console.error('Failed to load blog post:', error);
    }
}

function displayBlogPost(post) {
    const lang = currentLanguage;
    const title = lang === 'hi' ? post.titleHi : post.title;
    const content = lang === 'hi' ? post.contentHi : post.content;
    
    console.log('Blog post loaded:', title);
    // Display in modal or dedicated page
}

// ============================================
// ADMIN FUNCTIONALITY
// ============================================

async function getAdminStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`);
        const stats = await response.json();
        displayAdminStats(stats);
    } catch (error) {
        console.error('Failed to load admin stats:', error);
    }
}

function displayAdminStats(stats) {
    console.log('Admin Stats:', {
        users: stats.totalUsers,
        books: stats.totalBooks,
        orders: stats.totalOrders,
        revenue: stats.totalRevenue
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function setupEventListeners() {
    // Scroll to section links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// ADVANCED READING FEATURES
// ============================================

class ReadingSession {
    constructor(bookId) {
        this.bookId = bookId;
        this.startTime = Date.now();
        this.currentChapter = 1;
        this.progress = 0;
        this.highlights = [];
        this.bookmarks = [];
    }

    startReadingSession() {
        console.log('Reading session started for book:', this.bookId);
    }

    endReadingSession() {
        const sessionDuration = (Date.now() - this.startTime) / 1000 / 60; // minutes
        console.log(`Reading session ended. Duration: ${sessionDuration.toFixed(2)} minutes`);
        this.saveProgress();
    }

    highlightText(location) {
        this.highlights.push({
            location,
            timestamp: new Date()
        });
        console.log('Text highlighted at:', location);
    }

    addBookmark(chapter) {
        this.bookmarks.push({
            chapter,
            timestamp: new Date()
        });
        console.log('Bookmark added at chapter:', chapter);
    }

    saveProgress() {
        if (currentUser) {
            updateReadingProgress(this.bookId, this.currentChapter, this.progress);
        }
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#7a9b7f' : '#c17060'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 2px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// EXPORT FOR USE IN HTML
// ============================================

window.API = {
    openModal,
    closeModal,
    scrollToSection,
    handleNewsletter,
    shareQuote,
    initiateBookPurchase,
    updateReadingProgress,
    addBookmark,
    searchContent,
    switchLanguage,
    logout
};
