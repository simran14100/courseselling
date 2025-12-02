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
      console.log('Not allowed by CORS:', origin);
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
  console.warn('⚠ React build directory not found. Tried paths:');
  possibleBuildPaths.forEach(p => console.warn('  -', p));
  console.warn('⚠ Make sure to run "npm run build" in the frontend directory');
  console.warn('⚠ Current working directory:', process.cwd());
  console.warn('⚠ __dirname:', __dirname);
  console.warn('⚠ Server will start but React app will not be served until build is created');
} else {
  // Only serve static files if build directory exists
  app.use(express.static(buildPath, {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
    lastModified: true
  }));
  console.log('✓ Static file serving enabled for:', buildPath);
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

// 404 handler for API routes only (must use a function, not `/api/*` pattern)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`404 - API route not found: ${req.method} ${req.originalUrl}`);
    return res.status(404).json({
      success: false,
      message: 'API route not found'
    });
  }
  next();
});

// Catch-all handler: serve React app for all non-API GET requests
// This allows React Router to handle client-side routing
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Only handle GET requests for non-API routes
  if (req.method !== 'GET') {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }
  
  // Log the request for debugging
  console.log(`[SPA Route] Serving index.html for: ${req.method} ${req.originalUrl}`);
  
  // Check if build path was found
  if (!buildPath || !indexPath) {
    console.error(`[SPA Route] ERROR: React build directory not found`);
    console.error(`[SPA Route] Tried paths:`, possibleBuildPaths);
    console.error(`[SPA Route] Current directory:`, process.cwd());
    console.error(`[SPA Route] __dirname:`, __dirname);
    
    // Return a helpful HTML page instead of JSON for browser requests
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.status(503).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Application Building...</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <h1>Application is Building</h1>
          <p>The React application build is not yet available.</p>
          <p>Please wait a few moments and refresh the page.</p>
          <p><small>If this persists, check the server logs for build errors.</small></p>
        </body>
        </html>
      `);
    }
    
    return res.status(503).json({
      success: false,
      message: 'React build not found. The application is still building. Please wait and try again.',
      error: process.env.NODE_ENV === 'development' ? `Tried paths: ${possibleBuildPaths.join(', ')}` : undefined
    });
  }
  
  // Check if index.html exists before sending
  if (!fs.existsSync(indexPath)) {
    console.error(`[SPA Route] ERROR: index.html not found at ${indexPath}`);
    console.error(`[SPA Route] Build path exists but index.html is missing`);
    
    // Return a helpful HTML page instead of JSON for browser requests
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.status(503).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Build Incomplete</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <h1>Build Incomplete</h1>
          <p>The React build directory exists but index.html is missing.</p>
          <p>Please check the build process and try again.</p>
        </body>
        </html>
      `);
    }
    
    return res.status(503).json({
      success: false,
      message: 'React build incomplete. index.html not found.',
      error: process.env.NODE_ENV === 'development' ? `Path: ${indexPath}` : undefined
    });
  }
  
  // Send index.html
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[SPA Route] Error sending index.html:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error serving application',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    } else {
      console.log(`[SPA Route] Successfully served index.html for: ${req.originalUrl}`);
    }
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
