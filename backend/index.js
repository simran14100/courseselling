// Importing necessary modules and packages
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

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
  'https://www.crmwale.com',
  'http://www.crmwale.com',
  'https://crmwale.com',
  'http://crmwale.com',
  'https://skill24.in',
  'http://skill24.in',
  'https://www.skill24.in',
  'http://www.skill24.in',
  'https://courseselling-2.onrender.com',
  'http://localhost:4000',
  'https://localhost:4000'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list or is a subdomain of allowed domains
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.endsWith(new URL(allowedOrigin).hostname.replace('www.', ''))
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-csrf-token',
    'x-access-token',
    'x-auth-token'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Total-Count'
  ],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS with the above configuration to all routes
app.use(cors(corsOptions));

// Handle preflight requests for all routes without using wildcard
app.options(/.*/, (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token, x-access-token, x-auth-token');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  res.status(403).end();
});

const fs = require("fs");
const os = require("os");

// Security headers
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // Trust first proxy for rate limiting and IP resolution

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply the rate limiter to all requests
app.use(limiter);

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

// CORS middleware is already configured at the top of the file


// Security headers are already configured above
// Remove duplicate middleware

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

// Configure a cross-platform temporary directory for uploads
const uploadTmpDir = path.join(os.tmpdir(), "webmok-uploads");
try {
  if (!fs.existsSync(uploadTmpDir)) {
    fs.mkdirSync(uploadTmpDir, { recursive: true });
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

// Serve static files from React build
// Try multiple possible paths for different deployment environments
const possibleBuildPaths = [
  path.join(__dirname, '../frontend/build'),  // Local development / standard
  path.join(__dirname, '../../frontend/build'), // Alternative structure
  path.join(process.cwd(), 'frontend/build'),  // Render.com / absolute
  path.join(process.cwd(), 'build'),           // If build is in root
];

let buildPath = null;
let indexPath = null;

// Find the first existing build path
for (const possiblePath of possibleBuildPaths) {
  const possibleIndexPath = path.join(possiblePath, 'index.html');
  if (fs.existsSync(possibleIndexPath)) {
    buildPath = possiblePath;
    indexPath = possibleIndexPath;
    console.log('✓ React build directory found at:', buildPath);
    console.log('✓ index.html found at:', indexPath);
    break;
  }
}

// If no build found, log warning but don't set invalid paths
if (!buildPath) {
} else {
  // Only serve static files if build directory exists
  // Serve static assets under the /LMSCourse path
  app.use('/LMSCourse', express.static(buildPath, {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
    lastModified: true
  }));
}

// Error handling middleware (must be before catch-all route)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Catch-all route for frontend (should be after all API routes and static serving)
// This middleware will be called for any requests that haven't been matched by other routes.
// It should always be the last middleware in the chain, after all other routes and static file serving.
app.use((req, res) => {
  // If no other route handled the request, and a build path exists, serve the React app's index.html
  if (buildPath && indexPath) {
    res.sendFile(indexPath);
  } else {
    // If no build found or in development, return a generic 404 for non-API routes
    res.status(404).json({
      success: false,
      message: 'Frontend build not available or resource not found.'
    });
  }
});


const PORT = process.env.PORT || 4000;

// Function to start the server
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please try another port or stop the process currently using it.`);
      process.exit(1);
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
      startServer(PORT);
    })
    .catch((err) => {
      console.error('Failed to connect to database:', err);
      process.exit(1);
    });
}