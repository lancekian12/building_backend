// main server file (e.g., app.js)
const express = require("express");
const cors = require("cors"); // Import cors package
const rateLimit = require("express-rate-limit"); // Import rate limiting package
const AppError = require("./utils/appError"); // Assuming you have a custom AppError class
const myRoutes = require("./routes/myRoute"); // Import your routes

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Rate limiter for the /contact endpoint
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 5 requests per window
  message:
    "Too many contact form submissions from this IP. Please try again later.",
});

// Use the routes defined in myRoutes
app.use("/api", myRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Apply rate limiter middleware specifically to /contact
app.post("/api/contact", contactFormLimiter, (req, res, next) => {
  res.send("Contact form submission handled!");
});
