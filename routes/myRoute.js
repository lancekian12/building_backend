const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit"); // Import rate limiting package
const myController = require("../controllers/myController"); // Import controller functions

// Rate limiter specifically for the /contact route
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message:
    "Too many contact form submissions from this IP. Please try again later.",
});

// Define routes and map them to controller functions
router.get("/", myController.getHome);
router.get("/about", myController.getAbout);

// Apply the rate limiter middleware only to the /contact route
router.post("/contact", contactFormLimiter, myController.createContactMessage);

module.exports = router;
