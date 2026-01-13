const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// User Model Import
const User = require('./models/User'); 

const app = express();
app.use(express.json());
app.use(cors());

// uploads folder ko public banayein
app.use('/uploads', express.static('uploads'));

// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://BabuLohar123:babulohar123@cluster0.codhw2z.mongodb.net/devvault?retryWrites=true&w=majority";
const JWT_SECRET = "MERA_SECRET_KEY_123"; // Ise aap baad mein .env mein daal sakte hain

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected! 💾"))
  .catch((err) => console.error("DB Error:", err));

// --- RESOURCE DATA MODEL ---
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, default: 'PDF' }, 
  desc: String,
  link: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // User ID track karne ke liye
});

const Resource = mongoose.model('Resource', resourceSchema);

// --- FILE UPLOAD CONFIG (MULTER) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- AUTH ROUTES (Signup & Login) ---

// 1. SIGNUP
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Account created! Please login." });
    } catch (err) {
        res.status(500).json({ error: "Signup failed" });
    }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials!" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// --- RESOURCE ROUTES ---

// 1. Get All Resources (Abhi ke liye sab dikhenge, baad mein owner wise filter karenge)
app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.find();
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: "Data fetch error" });
    }
});

// 2. Add New Resource (Link + File Support)
app.post('/api/add', upload.single('pdfFile'), async (req, res) => {
    try {
        const { title, type, desc, link, ownerId } = req.body;
        
        let finalPath = link; 
        if (req.file) {
            finalPath = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const newData = new Resource({
            title,
            type,
            desc,
            link: finalPath,
            owner: ownerId // Frontend se user ID bhejni hogi
        });

        await newData.save();
        res.status(201).json({ message: "Saved!", data: newData });
    } catch (err) {
        res.status(500).json({ error: "Save failed" });
    }
});

// 3. Delete Resource
app.delete('/api/delete/:id', async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});