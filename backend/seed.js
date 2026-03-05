const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kshstories', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected for seeding'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// ================== SCHEMAS ==================

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

const subscriberSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true, sparse: true },
    subscribedAt: { type: Date, default: Date.now }
});

// ================== MODELS ==================

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Poem = mongoose.model('Poem', poemSchema);
const Quote = mongoose.model('Quote', quoteSchema);
const BlogPost = mongoose.model('BlogPost', blogSchema);
const Order = mongoose.model('Order', orderSchema);
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// ================== SAMPLE DATA ==================

const sampleBooks = [
    {
        title: "The Midnight Letter",
        titleHi: "मध्यरात्रि का पत्र",
        author: "Kshitij",
        description: "A beautiful collection of letters written at midnight, exploring themes of longing and connection.",
        descriptionHi: "मध्यरात्रि में लिखे गए पत्रों का एक सुंदर संग्रह, जो तरस और जुड़ाव के विषयों की खोज करता है।",
        category: "Romance",
        status: "completed",
        price: 0,
        language: "bilingual",
        chapters: [
            {
                number: 1,
                title: "First Letter",
                titleHi: "पहला पत्र",
                content: "The night was silent when I picked up my pen to write to you. The words flowed like a river, each one carrying a piece of my heart.",
                contentHi: "जब मैंने आपको लिखने के लिए कलम उठाई, तो रात सन्नाटेमय थी। शब्द एक नदी की तरह बहते थे, प्रत्येक शब्द मेरे दिल का एक टुकड़ा लेकर।",
                isFree: true,
                publishedDate: new Date('2024-01-01'),
                wordCount: 500
            },
            {
                number: 2,
                title: "The Distance",
                titleHi: "दूरी",
                content: "Miles separate our bodies, but our souls remain entwined through the threads of memory and hope.",
                contentHi: "मील हमारे शरीर को अलग करते हैं, लेकिन हमारी आत्माएं यादों और आशा के धागों से जुड़ी रहती हैं।",
                isFree: true,
                publishedDate: new Date('2024-01-15'),
                wordCount: 450
            }
        ],
        themes: ["love", "longing", "hope"]
    },
    {
        title: "Echoes of Silence",
        titleHi: "सन्नाटे की गूंज",
        author: "Kshitij",
        description: "A profound exploration of what lies beneath silence and the stories it holds.",
        descriptionHi: "सन्नाटे के नीचे क्या निहित है और वह किन कहानियों को संजोए रखता है, इसकी गहन खोज।",
        category: "Poetry",
        status: "completed",
        price: 0,
        language: "bilingual",
        chapters: [
            {
                number: 1,
                title: "Introduction",
                titleHi: "परिचय",
                content: "In the silence of the night, I found answers to questions I never asked myself.",
                contentHi: "रात की खामोशी में, मुझे सवालों के जवाब मिले जो मैंने अपने आप से कभी नहीं पूछे थे।",
                isFree: true,
                publishedDate: new Date('2024-02-01'),
                wordCount: 300
            }
        ],
        themes: ["silence", "introspection", "healing"]
    }
];

const samplePoems = [
    {
        title: "Moonlight and Memory",
        titleHi: "चाँदनी और यादें",
        content: "The moon remembers what we forget\nIn silver lines across the sky\nIt writes our stories in the stars\nAnd whispers them back to the night",
        contentHi: "चाँद हमारी भूली हुई बातों को याद रखता है\nआसमान भर में चाँदी के रेखाओं में\nयह हमारी कहानियों को तारों में लिखता है\nऔर उन्हें रात को फुसफुसाता है",
        category: "longing",
        author: "Kshitij",
        isFree: true,
        views: 150,
        likes: 45
    },
    {
        title: "Whispered Love",
        titleHi: "फुसफुसाई हुई प्रेम",
        content: "In your eyes I found a universe\nWhere every star is a promise\nAnd every constellation tells\nThe story of us",
        contentHi: "आपकी आंखों में मुझे एक ब्रह्मांड मिला\nजहाँ हर तारा एक वादा है\nऔर हर तारामंडल बताता है\nहमारी कहानी",
        category: "love",
        author: "Kshitij",
        isFree: true,
        views: 200,
        likes: 78
    },
    {
        title: "Healing Words",
        titleHi: "चिकित्सक शब्द",
        content: "They say time heals all wounds\nBut I found healing in your silence\nIn the gentle press of your hand\nIn the way you listened without judgment",
        contentHi: "कहते हैं समय सभी घावों को ठीक कर देता है\nलेकिन मुझे आपकी खामोशी में चिकित्सा मिली\nआपके हाथ के कोमल दबाव में\nजिस तरह आपने बिना फैसले के सुना",
        category: "healing",
        author: "Kshitij",
        isFree: true,
        views: 180,
        likes: 92
    }
];

const sampleQuotes = [
    {
        text: "The pages of a book are mirrors; they reflect what we seek in ourselves.",
        textHi: "किताब के पन्ने दर्पण हैं; वे हमें अपने आप में वह दिखाते हैं जो हम खोज रहे हैं।",
        author: "Kshitij",
        category: "wisdom",
        views: 300,
        shares: 50
    },
    {
        text: "In silence, we find our truest voice.",
        textHi: "सन्नाटे में, हमें अपनी सबसे सच्ची आवाज मिलती है।",
        author: "Kshitij",
        category: "inspiration",
        views: 250,
        shares: 40
    },
    {
        text: "Love is not measured in words, but in the spaces between them.",
        textHi: "प्रेम को शब्दों में नहीं, बल्कि उनके बीच की खामोशी में मापा जाता है।",
        author: "Kshitij",
        category: "love",
        views: 400,
        shares: 120
    }
];

const sampleBlogs = [
    {
        title: "The Art of Writing Poetry",
        titleHi: "कविता लिखने की कला",
        excerpt: "Discover the secrets behind crafting beautiful poetry that touches the soul.",
        excerptHi: "आत्मा को छूने वाली सुंदर कविता तैयार करने के पीछे के रहस्यों की खोज करें।",
        content: "Writing poetry is not just about arranging words in a pleasing manner. It's about capturing emotions, translating feelings into language that resonates with the reader's heart. Every poem is a journey of discovery, both for the writer and the reader.",
        contentHi: "कविता लिखना सिर्फ शब्दों को एक सुखद तरीके से व्यवस्थित करना नहीं है। यह भावनाओं को पकड़ना, भावनाओं को ऐसी भाषा में अनुवाद करना है जो पाठक के दिल के साथ गूंजे।",
        author: "Kshitij",
        category: "Writing",
        tags: ["poetry", "writing", "creativity"],
        views: 500,
        publishedDate: new Date('2024-01-15')
    },
    {
        title: "Finding Your Voice as a Writer",
        titleHi: "एक लेखक के रूप में अपनी आवाज खोजना",
        excerpt: "Every writer has a unique voice. Learn how to discover and develop yours.",
        excerptHi: "हर लेखक की एक अनोखी आवाज होती है। अपनी आवाज को खोजने और विकसित करने का तरीका जानें।",
        content: "Your voice as a writer is what sets you apart from others. It's the unique perspective, the particular way you see the world and translate it onto the page.",
        contentHi: "एक लेखक के रूप में आपकी आवाज वह है जो आपको दूसरों से अलग करती है।",
        author: "Kshitij",
        category: "Writing",
        tags: ["voice", "writing", "development"],
        views: 350,
        publishedDate: new Date('2024-02-01')
    }
];

// ================== SEED DATABASE ==================

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...\n');

        // Clear existing data
        await User.deleteMany({});
        await Book.deleteMany({});
        await Poem.deleteMany({});
        await Quote.deleteMany({});
        await BlogPost.deleteMany({});
        await Order.deleteMany({});
        await Subscriber.deleteMany({});
        console.log('✅ Cleared existing data');

        // Insert sample data
        const books = await Book.insertMany(sampleBooks);
        console.log(`✅ Inserted ${books.length} books`);

        const poems = await Poem.insertMany(samplePoems);
        console.log(`✅ Inserted ${poems.length} poems`);

        const quotes = await Quote.insertMany(sampleQuotes);
        console.log(`✅ Inserted ${quotes.length} quotes`);

        const blogs = await BlogPost.insertMany(sampleBlogs);
        console.log(`✅ Inserted ${blogs.length} blog posts`);

        // Create sample user
        const user = await User.create({
            name: "Demo User",
            email: "demo@kshstories.com",
            password: "demo123",
            role: "subscriber",
            purchasedBooks: [books[0]._id],
            preferredLanguage: "en",
            subscribedToNewsletter: true
        });
        console.log(`✅ Created demo user`);

        // Create sample subscriber
        await Subscriber.create({
            email: "subscriber@example.com"
        });
        console.log(`✅ Created sample subscriber`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`
📊 Seeded Data Summary:
  ├─ Books: ${books.length}
  ├─ Poems: ${poems.length}
  ├─ Quotes: ${quotes.length}
  ├─ Blog Posts: ${blogs.length}
  ├─ Users: 1 (demo user)
  └─ Subscribers: 1

🔐 Demo Account:
  Email: demo@kshstories.com
  Password: demo123
        `);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
}

// Run seeding
seedDatabase();
