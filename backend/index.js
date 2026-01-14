const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const User = require('./models/User'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARES ---
app.use(express.json());
app.use(cors({ origin: "*" })); // Sabhi origins ko allow karne ke liye

// --- CLOUDINARY CONFIG ---
// ⚠️ Yahan apni details Cloudinary Dashboard se dekh kar bhariye
// Configuration
    cloudinary.config({ 
        cloud_name: 'driligjum', 
        api_key: '376478439948935', 
        api_secret: 'b7XNHZNk0NLeKoIDkAOcYtgow2s' // Click 'View API Keys' above to copy your API secret
    });
    

// --- CLOUDINARY STORAGE SETUP ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devvault_uploads',
    resource_type: 'auto', // ✅ Yeh 'auto' hona bahut zaroori hai
    format: async (req, file) => 'pdf', // Force format to PDF
  },
});

const upload = multer({ storage: storage });

// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://BabuLohar123:babulohar123@cluster0.codhw2z.mongodb.net/devvault?retryWrites=true&w=majority";
const JWT_SECRET = "MERA_SECRET_KEY_123"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected! 💾"))
  .catch((err) => console.error("DB Error:", err));

// --- RESOURCE DATA MODEL ---
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, default: 'PDF' }, 
  desc: String,
  link: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});
const Resource = mongoose.model('Resource', resourceSchema);

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists!" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Account created!" });
    } catch (err) { res.status(500).json({ error: "Signup failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found!" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials!" });
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

// --- RESOURCE ROUTES ---
// Is line mein koi extra middleware nahi hona chahiye
app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.find().populate('owner', 'email');
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: "Data fetch error" });
    }
});

// 🚀 ADD NEW RESOURCE (Cloudinary Support)
app.post('/api/add', upload.single('pdfFile'), async (req, res) => {
    try {
        const { title, type, desc, link, ownerId } = req.body;
        
        // Agar file upload hui hai toh Cloudinary ka URL use hoga, warna manual link
        let finalLink = link;
        if (req.file) {
            finalLink = req.file.path; // Cloudinary automatically https link deta hai
        }

        const newData = new Resource({
            title,
            type,
            desc,
            link: finalLink,
            owner: ownerId 
        });

        await newData.save();
        res.status(201).json({ message: "Saved to Cloudinary!", data: newData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Save failed" });
    }
});

app.delete('/api/delete/:id', async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});