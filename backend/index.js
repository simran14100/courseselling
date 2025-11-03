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


const app = express();

// CORS configuration - more permissive for development
app.use((req, res, next) => {
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Allow all headers that might be sent
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-csrf-token, x-access-token, Cache-Control, Pragma, headers');
  
  // Allow all methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

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






// Middlewares
app.use(express.json());
app.use(cookieParser());

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

// Connect to database and start server
database.connect()
  .then(() => {
    startServer(PORT);
  })
  .catch(() => {
    console.error("Server not started due to DB connection failure");
  });

