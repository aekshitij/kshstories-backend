const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kshstories', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Schemas inline
const bookSchema = new mongoose.Schema({
    title: String,
    titleHi: String,
    author: String,
    description: String,
    descriptionHi: String,
    cover: String,
    category: String,
    status: String,
    price: Number,
    priceCurrency: String,
    language: String,
    chapters: Array,
    themes: [String],
    reviews: Array,
    pdfUrl: String,
    createdAt: Date,
    updatedAt: Date
});

const poemSchema = new mongoose.Schema({
    title: String,
    titleHi: String,
    content: String,
    contentHi: String,
    category: String,
    author: String,
    isFree: Boolean,
    views: Number,
    likes: Number,
    createdAt: Date
});

const quoteSchema = new mongoose.Schema({
    text: String,
    textHi: String,
    author: String,
    category: String,
    isFree: Boolean,
    views: Number,
    shares: Number,
    createdAt: Date
});

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
    views: Number,
    publishedDate: Date,
    updatedDate: Date
});

const Book = mongoose.model('Book', bookSchema);
const Poem = mongoose.model('Poem', poemSchema);
const Quote = mongoose.model('Quote', quoteSchema);
const BlogPost = mongoose.model('BlogPost', blogSchema);

async function seedDatabase() {
    try {
        // Clear existing data
        await Book.deleteMany({});
        await Poem.deleteMany({});
        await Quote.deleteMany({});
        await BlogPost.deleteMany({});

        console.log('Cleared existing data...');

        // Seed Books
        const books = [
            {
                title: "Whispers of Forever",
                titleHi: "हमेशा की फुसफुसाहट",
                author: "KSH",
                description: "A contemporary romance exploring love, loss, and second chances. When two fractured souls meet in the quiet moments between goodbye and hello, they discover that the greatest love stories often begin where we least expect them.",
                descriptionHi: "प्रेम, हानि और दूसरे मौके का अन्वेषण करने वाला एक समकालीन रोमांच। जब दो टूटी हुई आत्माएं विदाई और नमस्ते के बीच शांत क्षणों में मिलती हैं, तो वे पाती हैं कि सबसे बड़ी प्रेम कहानियां अक्सर वहां शुरू होती हैं जहां हम उनकी सबसे कम उम्मीद करते हैं।",
                cover: "whispers-of-forever.jpg",
                category: "Romance",
                status: "completed",
                price: 299,
                priceCurrency: "INR",
                language: "bilingual",
                themes: ["love", "heartbreak", "redemption", "second chances"],
                chapters: [
                    {
                        number: 1,
                        title: "Beginnings",
                        titleHi: "शुरुआत",
                        content: "The rain fell like whispered secrets against the café window, each droplet carrying a story she would never know. Aria sat in the corner booth, her fingers wrapped around a cold coffee, watching people rush past outside without really seeing them...",
                        contentHi: "बारिश कैफे की खिड़की के खिलाफ फुसफुसाती हुई गुप्त बातों की तरह गिर रही थी, प्रत्येक बूंद एक ऐसी कहानी ले जा रही थी जो वह कभी नहीं जान पाएगी। आरिया कोने के बूथ में बैठी थी, उसकी उंगलियां ठंडी कॉफी के चारों ओर लपेटी हुई थीं, बाहर दौड़ते हुए लोगों को देख रही थी बिना वास्तव में उन्हें देखे...",
                        isFree: true,
                        publishedDate: new Date(),
                        wordCount: 2500
                    },
                    {
                        number: 2,
                        title: "Echoes of the Past",
                        titleHi: "अतीत की गूंजें",
                        content: "Memories have a way of haunting us when we least expect them. For Aria, remembering was both a blessing and a curse...",
                        contentHi: "यादें हमें तब परेशान करने का तरीका है जब हम उनकी सबसे कम उम्मीद करते हैं। आरिया के लिए, याद रखना एक वरदान और एक अभिशाप दोनों था...",
                        isFree: false,
                        publishedDate: new Date(),
                        wordCount: 3000
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Midnight Conversations",
                titleHi: "आधी रात की बातचीत",
                author: "KSH",
                description: "An ongoing serialized novel about two people who meet by chance and discover that some conversations can change everything.",
                descriptionHi: "दो लोगों के बारे में एक चल रहा सीरीकृत उपन्यास जो संयोग से मिलते हैं और पाते हैं कि कुछ बातचीत सब कुछ बदल सकती है।",
                cover: "midnight-conversations.jpg",
                category: "Romance",
                status: "ongoing",
                price: 199,
                priceCurrency: "INR",
                language: "bilingual",
                themes: ["connection", "fate", "conversations"],
                chapters: [
                    {
                        number: 1,
                        title: "The First Night",
                        titleHi: "पहली रात",
                        content: "Their first conversation started at 11:47 PM on a Thursday night...",
                        contentHi: "उनकी पहली बातचीत गुरुवार की रात 11:47 बजे शुरू हुई...",
                        isFree: true,
                        publishedDate: new Date(),
                        wordCount: 2200
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Letters Never Sent",
                titleHi: "कभी नहीं भेजे गए पत्र",
                author: "KSH",
                description: "Coming soon - A haunting collection of unsent letters that reveal the truth about love, regret, and the words we wish we had said.",
                descriptionHi: "जल्द आ रहा है - अनुपलब्ध पत्रों का एक रहस्यमय संग्रह जो प्रेम, पश्चाताप और उन शब्दों की सच्चाई को प्रकट करता है जो हम कहना चाहते थे।",
                cover: "letters-never-sent.jpg",
                category: "Romance",
                status: "upcoming",
                price: 299,
                priceCurrency: "INR",
                language: "bilingual",
                themes: ["regret", "unsaid words", "love"],
                chapters: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await Book.insertMany(books);
        console.log('Books seeded successfully!');

        // Seed Poems
        const poems = [
            {
                title: "Unspoken Words",
                titleHi: "अकथित शब्द",
                content: "You were always there in my silence,\nThe one word I never dared to speak.\nIn the spaces between heartbeats,\nI loved you in a language only you could understand.\nBut some words are too heavy to carry,\nSo they stay trapped in the chambers of my heart,\nWaiting for a courage that never came.",
                contentHi: "आप हमेशा मेरी चुप्पी में वहां थे,\nवह एक शब्द जो मैंने कभी कहने का साहस नहीं किया।\nदिल की धड़कन के बीच की जगहों में,\nमैंने आपको एक ऐसी भाषा में प्यार किया जो केवल आप समझ सकते थे।\nलेकिन कुछ शब्द ले जाने के लिए बहुत भारी होते हैं,\nइसलिए वे मेरे दिल की कोठरियों में फंसे रहते हैं,\nएक साहस की प्रतीक्षा कर रहे हैं जो कभी नहीं आया।",
                category: "love",
                author: "KSH",
                isFree: true,
                views: 0,
                likes: 0,
                createdAt: new Date()
            },
            {
                title: "Autumn's Goodbye",
                titleHi: "शरद का विदाई",
                content: "The leaves remember what we choose to forget:\nThat endings are just another beginning.\nWe watched the colors change,\nGold into rust, rust into dust.\nAnd in that silent falling,\nI understood that some things are meant to leave,\nSo others can find us.",
                contentHi: "पत्तियां वह याद रखती हैं जो हम भूलना चुनते हैं:\nकि अंत सिर्फ एक और शुरुआत है।\nहमने रंगों को बदलते देखा,\nसोना जंग में, जंग धूल में।\nऔर उस शांत गिरावट में,\nमैंने समझा कि कुछ चीजें जाने के लिए हैं,\nताकि दूसरे हमें खोज सकें।",
                category: "nostalgia",
                author: "KSH",
                isFree: true,
                views: 0,
                likes: 0,
                createdAt: new Date()
            },
            {
                title: "Between Us",
                titleHi: "हमारे बीच",
                content: "There was always so much space between\nWhat we felt and what we said.\nMountains of unspoken emotion,\nOceans of things we couldn't cross.\nYou loved me in silence,\nI ached for words.\nAnd somewhere in that distance,\nWe lost each other.",
                contentHi: "हमेशा इतनी जगह थी\nजो हमने महसूस किया और जो हमने कहा उसके बीच।\nअकथित भावनाओं के पहाड़,\nचीजों के महासागर जो हम पार नहीं कर सके।\nआपने मुझसे चुप्पी में प्यार किया,\nमैं शब्दों के लिए तड़पा।\nऔर उस दूरी में कहीं,\nहमने एक दूसरे को खो दिया।",
                category: "longing",
                author: "KSH",
                isFree: true,
                views: 0,
                likes: 0,
                createdAt: new Date()
            },
            {
                title: "Healing",
                titleHi: "उपचार",
                content: "And suddenly, the scars became stories,\nAnd the pain became poetry.\nEach tear I shed watered the garden\nWhere new flowers learn to bloom.\nI stopped asking why it had to hurt,\nAnd started celebrating that I survived.\nMy wounds are now my wisdom,\nMy breaking was just my becoming.",
                contentHi: "और अचानक, निशान कहानियां बन गईं,\nऔर दर्द कविता बन गया।\nप्रत्येक आंसू जो मैंने बहाया\nउसी बगीचे को पानी देता है\nजहां नए फूल खिलना सीखते हैं।\nमैंने यह पूछना बंद कर दिया कि इसे दर्द करना पड़ा,\nऔर यह मनाने लगा कि मैं बच गया।\nमेरे घाव अब मेरी बुद्धि हैं,\nमेरा टूटना सिर्फ मेरी बनना था।",
                category: "healing",
                author: "KSH",
                isFree: true,
                views: 0,
                likes: 0,
                createdAt: new Date()
            }
        ];

        await Poem.insertMany(poems);
        console.log('Poems seeded successfully!');

        // Seed Quotes
        const quotes = [
            {
                text: "We loved like we were running out of time, not knowing that time was our only luxury.",
                textHi: "हमने ऐसे प्यार किया जैसे हमारे पास समय खत्म हो रहा है, यह न जानते हुए कि समय हमारा एकमात्र विलास था।",
                author: "KSH",
                category: "love",
                isFree: true,
                views: 0,
                shares: 0,
                createdAt: new Date()
            },
            {
                text: "Some people are not meant to stay. They're meant to teach you how to love better the next time.",
                textHi: "कुछ लोग रहने के लिए नहीं हैं। वे आपको अगली बार बेहतर तरीके से प्यार करना सिखाने के लिए हैं।",
                author: "KSH",
                category: "growth",
                isFree: true,
                views: 0,
                shares: 0,
                createdAt: new Date()
            },
            {
                text: "The saddest part isn't losing you. It's knowing you never understood why I had to let go.",
                textHi: "सबसे दुखद हिस्सा आपको खोना नहीं है। यह जानना है कि आपने कभी नहीं समझा कि मुझे जाने देना क्यों पड़ा।",
                author: "KSH",
                category: "heartbreak",
                isFree: true,
                views: 0,
                shares: 0,
                createdAt: new Date()
            },
            {
                text: "I loved you in silence, spoke to you in dreams, and held you in memories.",
                textHi: "मैंने आपसे चुप्पी में प्यार किया, सपनों में आपसे बात की, और यादों में आपको पकड़ा।",
                author: "KSH",
                category: "love",
                isFree: true,
                views: 0,
                shares: 0,
                createdAt: new Date()
            },
            {
                text: "Healing isn't about forgetting. It's about remembering without the pain.",
                textHi: "उपचार भूलने के बारे में नहीं है। यह दर्द के बिना याद रखने के बारे में है।",
                author: "KSH",
                category: "healing",
                isFree: true,
                views: 0,
                shares: 0,
                createdAt: new Date()
            }
        ];

        await Quote.insertMany(quotes);
        console.log('Quotes seeded successfully!');

        // Seed Blog Posts
        const blogPosts = [
            {
                title: "The Art of Writing Silence",
                titleHi: "चुप्पी लिखने की कला",
                content: "How do you capture what's left unsaid? How do you transform the void into something beautiful and meaningful? In storytelling, silence is often more powerful than words...",
                contentHi: "आप जो अकथित है उसे कैसे पकड़ते हैं? आप शून्य को कुछ सुंदर और सार्थक में कैसे रूपांतरित करते हैं? कहानी सुनाने में, चुप्पी अक्सर शब्दों से अधिक शक्तिशाली होती है...",
                excerpt: "A deep dive into the power of what's unsaid in storytelling.",
                excerptHi: "कहानी सुनाने में अकथित की शक्ति में एक गहरा गोता।",
                author: "KSH",
                category: "Writing",
                tags: ["writing", "craft", "silence"],
                views: 0,
                publishedDate: new Date(),
                updatedDate: new Date()
            },
            {
                title: "Character Diary: Meet Aria",
                titleHi: "चरित्र डायरी: आरिया से मिलो",
                content: "Aria is not just a character in my novel. She's a part of me, my dreams, my fears. Through her journey, I explore what it means to heal, to love, and to become...",
                contentHi: "आरिया मेरे उपन्यास में सिर्फ एक चरित्र नहीं है। वह मेरा एक हिस्सा है, मेरे सपने, मेरे डर। उसके माध्यम से, मैं यह पता लगाता हूं कि ठीक होना, प्यार करना, और बनना क्या मायने रखता है...",
                excerpt: "A personal introduction to Aria and her world.",
                excerptHi: "आरिया और उसकी दुनिया का एक व्यक्तिगत परिचय।",
                author: "KSH",
                category: "Characters",
                tags: ["character", "development", "storytelling"],
                views: 0,
                publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                updatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                title: "Why I Write About Love and Heartbreak",
                titleHi: "मैं प्यार और दिल के टूटने के बारे में क्यों लिखता हूं",
                content: "Love and heartbreak are not just emotions—they are human experiences that define us, shape us, and teach us. I write about them because they matter...",
                contentHi: "प्यार और दिल का टूटना सिर्फ भावनाएं नहीं हैं—वे मानव अनुभव हैं जो हमें परिभाषित करते हैं, आकार देते हैं, और सिखाते हैं। मैं उनके बारे में लिखता हूं क्योंकि वे महत्वपूर्ण हैं...",
                excerpt: "A reflection on why authenticity matters in storytelling.",
                excerptHi: "कहानी सुनाने में प्रामाणिकता क्यों मायने रखती है इसका एक प्रतिबिंब।",
                author: "KSH",
                category: "Personal",
                tags: ["love", "heartbreak", "authenticity"],
                views: 0,
                publishedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                updatedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            }
        ];

        await BlogPost.insertMany(blogPosts);
        console.log('Blog posts seeded successfully!');

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
