// Importing necessary modules and packages
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('Loading .env from:', path.resolve(__dirname, '.env'));
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URL:', process.env.MONGODB_URL);

const express = require("express");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const morgan = require('morgan');

// Initialize express app
const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://skill24.in',
  'https://www.skill24.in',
  'https://courseselling-2.onrender.com',
  'http://localhost:4000',
  'https://localhost:4000',
  'http://skill24.in',
  'http://www.skill24.in'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development or if origin checking is disabled, allow all origins
    if (process.env.NODE_ENV !== 'production' || !origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowedOrigins or is a subdomain of allowed origins
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin.replace('https://', 'http://')) ||
      origin.startsWith(allowedOrigin.replace('http://', 'https://')) ||
      origin.endsWith('skill24.in') ||
      origin.endsWith('courseselling-2.onrender.com')
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Not allowed by CORS:', origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-csrf-token',
    'x-access-token',
    'X-Skip-Interceptor',
    'withCredentials',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Length',
    'Content-Type',
    'set-cookie',
    'Set-Cookie',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle CORS headers for all requests
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.Origin;
  
  // Always set Vary header
  res.header('Vary', 'Origin');
  
  // Check if origin is allowed
  const isAllowed = !origin || allowedOrigins.some(allowedOrigin => {
    return (
      origin === allowedOrigin ||
      origin.startsWith(allowedOrigin.replace('https://', 'http://')) ||
      origin.startsWith(allowedOrigin.replace('http://', 'https://')) ||
      origin.endsWith('skill24.in') ||
      origin.endsWith('courseselling-2.onrender.com')
    );
  });
  
  // Set CORS headers if origin is allowed or in development
  if (isAllowed || process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-csrf-token',
      'x-access-token',
      'X-Skip-Interceptor',
      'withCredentials',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Headers',
      'Access-Control-Request-Method'
    ].join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Custom sanitization middleware to replace express-mongo-sanitize
const sanitize = (req, res, next) => {
  // Skip if no query or body
  if (!req.query && !req.body) return next();

  // Deep copy and sanitize query and body
  const sanitizeValue = (value) => {
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(key => {
        if (value[key] && typeof value[key] === 'object') {
          sanitizeValue(value[key]);
        } else if (typeof value[key] === 'string' && /^[\$]/.test(value[key])) {
          // Remove $ and . from potentially malicious MongoDB operators
          value[key] = value[key].replace(/[\$\.]/g, '');
        }
      });
    }
    return value;
  };

  // Apply sanitization
  if (req.query) req.query = JSON.parse(JSON.stringify(req.query));
  if (req.body) req.body = JSON.parse(JSON.stringify(req.body));
  
  sanitizeValue(req.query);
  sanitizeValue(req.body);
  
  next();
};
const fs = require("fs");
const os = require("os");

// CORS middleware is already configured at the top of the file

// Security headers
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Apply sanitization middleware
app.use(sanitize);

const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const courseRoutes = require("./routes/Course");
const subCategoryRoutes = require("./routes/SubCategory");
const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require("./routes/Contact");
const adminRoutes = require("./routes/admin");
const enrollmentRoutes = require("./routes/enrollment");
const enrollmentManagementRoutes = require("./routes/enrollmentManagement");
const admissionRoutes = require("./routes/admission");

const enquiryRoutes = require("./routes/enquiryRoutes");
const installmentRoutes = require("./routes/installments");
const videoRoutes = require("./routes/Video");
const cartRoutes = require("./routes/cart");
const googleRoutes = require("./routes/google");


const batchDepartmentRoutes = require("./routes/batchDepartment");


const courseCategoryRoutes = require("./routes/courseCategory");

const superAdminRoutes = require("./routes/superAdmin");


const cloudinaryRoutes = require("./routes/cloudinary");
const categoryRoutes = require("./routes/category");
const faqRoutes = require("./routes/faq.routes");


const blogRoutes = require('./routes/blogRoutes');
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

global.cloudinary = cloudinary;

// Body parsing middleware (for non-multipart requests)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security middleware - reordered and configured
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// Custom sanitization middleware
app.use(sanitize);

// XSS protection
app.use(xss());

// HTTP Parameter Pollution protection
app.use(hpp());

// Logging
app.use(morgan('dev'));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('Multipart form data detected');
  }
  next();
});

// Configure a cross-platform temporary directory for uploads
const uploadTmpDir = path.join(os.tmpdir(), "webmok-uploads");
try {
  if (!fs.existsSync(uploadTmpDir)) {
    fs.mkdirSync(uploadTmpDir, { recursive: true });
    console.log("Created temp upload directory:", uploadTmpDir);
  }
} catch (e) {
  console.error("Failed to create temp upload directory:", e);
}

// IMPORTANT: DO NOT use express-fileupload globally
// File upload middleware should be applied only to specific routes that need it

// Connecting to cloudinary
cloudinaryConnect();



// Mount the routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);


;

// Mount FinalData routes

console.log('Mounted final data routes at /api/v1/final-data');

app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reviews", profileRoutes);
app.use("/api/v1/contact", contactUsRoute);
app.use("/api/v1/razorpay", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/enrollment-management", enrollmentManagementRoutes);

app.use("/api/v1/sub-categories", subCategoryRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);
app.use("/api/v1/installments", installmentRoutes);
app.use("/api/v1/course", categoryRoutes);
app.use("/api/v1/faq", faqRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/google", googleRoutes);

app.use("/api/v1/batch-departments", batchDepartmentRoutes);


app.use("/api/v1/super-admin", superAdminRoutes);






app.use("/api/v1/cloudinary", cloudinaryRoutes);




// Direct binding for critical profile update route (temporary safeguard)
const { auth } = require("./middlewares/auth");
const { updateProfile } = require("./controllers/Profile");
app.put("/api/v1/profile/updateProfile", auth, updateProfile);


app.use('/api/v1/blog', blogRoutes);

// Other routes





// Testing the server
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});



// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 4000;

// Function to start the server
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${Number(port) + 1}...`);
      startServer(Number(port) + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

// Export the Express app for use in server.js
module.exports = app;

// Only start the server if this file is run directly (not required by another module)
if (require.main === module) {
  // Connect to database and start server
  database.connect()
    .then(() => {
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to database:', err);
      process.exit(1);
    });
}
