const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session for authentication
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false
}));

// Define Schemas
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: String,
    password: String
}));

const Post = mongoose.model('Post', new mongoose.Schema({
    title: String,
    content: String,
    tags: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
}));

// Routes

// Home Page
app.get('/', async (req, res) => {
    const posts = await Post.find({});
    res.render('index', { posts: posts });
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user && user.password === req.body.password) {
        req.session.userId = user._id;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// Sign Up Page
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });
    await newUser.save();
    res.redirect('/login');
});

// Create Post Page
app.get('/create-post', (req, res) => {
    res.render('create-post');
});

app.post('/create-post', async (req, res) => {
    const newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
        author: req.session.userId
    });
    await newPost.save();
    res.redirect('/');
});

// Edit Post Page
app.get('/edit-post/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('edit-post', { post: post });
});

app.post('/edit-post/:id', async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags
    });
    res.redirect('/');
});

// Delete Post
app.post('/delete-post/:id', async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

// Start Server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
