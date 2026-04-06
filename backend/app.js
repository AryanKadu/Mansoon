var express=require('express');
var path=require('path');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var session =require('express-session');
var app=express();
var passport=require('passport');
const cors = require('cors');
require('dotenv').config();


const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
var cookieParser = require('cookie-parser')

// Security headers
app.use(helmet());

// Compress responses
app.use(compression());

// Prevent brute-force attacks on auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Configure CORS
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// (Removed EJS view engine setup)

const dbUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose.connect(dbUrl, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


//set public folder 
app.use(express.static(path.join(__dirname,'public')));

// (Removed app.locals and initial data fetching for EJS)

//cookie-parser
app.use(cookieParser())

//body parser 
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//express session 
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false, // Don't create sessions for unauthenticated users
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true for https
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  }));

// (Removed flash and express-messages)

//passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// (Removed res.locals logic for EJS)

const { VisitorDay, VisitorTotal } = require('./models/visitor');
const moment = require('moment');

// Visitor tracking middleware (keeping for background stats)
app.use(async (req, res, next) => {
  try {
    if (!req.session.hasVisitedToday) {
      const today = moment().format('YYYY-MM-DD');
      await VisitorDay.findOneAndUpdate({ date: today }, { $inc: { count: 1 } }, { upsert: true });
      await VisitorTotal.findOneAndUpdate({ key: 'total' }, { $inc: { count: 1 } }, { upsert: true });
      req.session.hasVisitedToday = true;
    }
  } catch (err) {}
  next();
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Redirect legacy EJS routes to Frontend SPA
app.get('/coming-soon', (req, res) => res.redirect(`${FRONTEND_URL}/coming-soon`));

//set routes
var pages=require('./routes/pages.js');
var products=require('./routes/products.js');

const home = require('./routes/home.js');


var cart=require('./routes/cart.js');
var users=require('./routes/users.js');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./routes/api');


app.use('/admin', adminRoutes);
app.use('/products',products);

app.use('/home',home);

app.use('/cart',cart);
app.use('/users',users);
app.use('/',pages);

// app.use('/', generalRoutes);

var paymentRoutes = require("./routes/payments");
app.use("/payment", paymentRoutes);

app.use('/api', apiRoutes);




// Production static file serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public/frontend'), { maxAge: '1y' }));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/frontend', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

//giving the port number 
const port = process.env.PORT || 8000;
app.listen(port, function(){
    console.log('server listening on ' + port);
});