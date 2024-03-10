require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3300;
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo');
const passport = require('passport');





//database
const url = 'mongodb+srv://omrana2025:Omrana2004@cluster0.zqeck8h.mongodb.net/pizza?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(url);

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB connected...');
});

connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Session Store
const sessionStorage = MongoStore.create({
  mongoUrl:url,
  dbName: 'pizza',
  collectionName: 'sessions'
})

// Session Config 
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  store: sessionStorage,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },  // 24 hour
}));

// Passport Config
const initPassport = require('./app/config/passport');
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());


// Assets
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})
// Set Template engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
