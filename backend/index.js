const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const User = require('./models/User'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MIDDLEWARES ---
app.use(express.json());
// CORS setup: Isse frontend se headers aana allow ho jayega
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- 2. AUTH MIDDLEWARE (401 Error solve karne ke liye) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Token missing!" });

    jwt.verify(token, "MERA_SECRET_KEY_123", (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token!" });
        req.user = user;
        next();
    });
};

// --- 3. CLOUDINARY CONFIG ---
cloudinary.config({ 
    cloud_name: 'driligjum', 
    api_key: '376478439948935', 
    api_secret: 'b7XNHZNk0NLeKoIDkAOcYtgow2s' 
});

// --- 4. CLOUDINARY STORAGE ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'devvault_uploads',
        resource_type: 'auto', 
    },
});
const upload = multer({ storage: storage });

// --- 5. DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://BabuLohar123:babulohar123@cluster0.codhw2z.mongodb.net/devvault?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected! 💾"))
    .catch((err) => console.error("DB Error:", err));

// --- 6. RESOURCE MODEL ---
const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, default: 'PDF' }, 
    desc: String,
    link: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});
const Resource = mongoose.model('Resource', resourceSchema);

// --- 7. AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created!" });
    } catch (err) { res.status(500).json({ error: "Signup fail" }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, "MERA_SECRET_KEY_123", { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) { res.status(500).json({ error: "Login fail" }); }
});

// --- 8. RESOURCE ROUTES (Protected) ---

// Get All
app.get('/api/resources', authenticateToken, async (req, res) => {
    try {
        const resources = await Resource.find().populate('owner', 'email');
        res.json(resources);
    } catch (err) { res.status(500).json({ error: "Fetch error" }); }
});

// Add New
app.post('/api/add', authenticateToken, upload.single('pdfFile'), async (req, res) => {
    try {
        const { title, type, desc, link } = req.body;
        let finalLink = link;
        if (req.file) finalLink = req.file.path;

        const newData = new Resource({
            title, type, desc, link: finalLink, owner: req.user.userId 
        });
        await newData.save();
        res.status(201).json({ message: "Saved!", data: newData });
    } catch (err) { res.status(500).json({ error: "Save fail" }); }
});

// Delete
app.delete('/api/delete/:id', authenticateToken, async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: "Delete fail" }); }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));