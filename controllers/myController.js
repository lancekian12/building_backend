const AppError = require("../utils/appError"); // Assuming you have a custom error handling class
const catchAsync = require("../utils/catchAsync"); // Async error handler utility
const sendEmail = require("../utils/email"); // Assuming you have a utility to send emails
require("dotenv").config(); // To load environment variables

exports.getHome = (req, res) => {
  res.send("Welcome to the Home Page!");
};

exports.getAbout = (req, res) => {
  res.send("This is the About Page!");
};

exports.createContactMessage = catchAsync(async (req, res, next) => {
  const { fullName, email, address, message, type } = req.body;

  // Validate input data
  if (!fullName || !email || !address || !message || !type) {
    return next(
      new AppError("Please provide all required fields including type.", 400)
    );
  }

  // Construct messages based on the 'type'
  let adminMessageContent, userMessageContent;

  if (type === "contact") {
    adminMessageContent = {
      fullName,
      email,
      address,
      messageContent: `Hello Admin,\n\nA new contact message has been received from ${fullName} at ${address}.\n\nMessage: ${message}\n\nPlease take appropriate action.`,
    };

    userMessageContent = {
      fullName,
      address,
      messageContent: `Hello ${fullName},\n\nThank you for contacting us! We have received your message and will get back to you soon.\n\nYour Message: ${message}\n\nBest regards,\n${fullName}.`,
    };
  } else if (type === "feedback") {
    adminMessageContent = {
      fullName,
      email,
      address,
      messageContent: `Hello Admin,\n\nA new feedback message has been received from ${fullName} at ${address}.\n\nFeedback: ${message}\n\nPlease review it at your earliest convenience.`,
    };

    userMessageContent = {
      fullName,
      address,
      messageContent: `Hello ${fullName},\n\nThank you for your valuable feedback! We appreciate your input and will use it to improve our services.\n\nYour Feedback: ${message}\n\nBest regards,\nYour Team.`,
    };
  } else {
    return next(new AppError("Invalid message type provided.", 400));
  }

  // Abstracted function to send the email
  const sendUserAndAdminEmails = async () => {
    // Send email to admin
    await sendEmail({
      email: process.env.ADMIN_EMAIL, // Use environment variable for admin email
      subject: `New ${type === "contact" ? "Contact" : "Feedback"} Message`,
      message: adminMessageContent.messageContent,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .email-container { background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .email-header { font-size: 18px; font-weight: bold; color: #333; }
              .email-body { font-size: 16px; color: #555; margin-top: 10px; }
              .footer { font-size: 14px; color: #888; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">New ${
                type === "contact" ? "Contact" : "Feedback"
              } Message</div>
              <div class="email-body">
                <p><strong>Full Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Message:</strong> ${message}</p>
              </div>
              <div class="footer">
                <p>This message was sent to you from your website.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Send email to user
    await sendEmail({
      email: email, // Send to the user's email
      subject: `New ${type === "contact" ? "Contact" : "Feedback"} Message`,
      message: userMessageContent.messageContent,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .email-container { background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .email-header { font-size: 18px; font-weight: bold; color: #333; }
              .email-body { font-size: 16px; color: #555; margin-top: 10px; }
              .footer { font-size: 14px; color: #888; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">New ${
                type === "contact" ? "Contact" : "Feedback"
              } Message</div>
              <div class="email-body">
                <p><strong>Full Name:</strong> ${fullName}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Message:</strong> ${message}</p>
              </div>
              <div class="footer">
                <p>This message was sent to you from your website.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  };

  // Try to send the emails and handle errors
  try {
    await sendUserAndAdminEmails();
    res.status(200).json({
      status: "success",
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return next(
      new AppError(
        "There was an error sending your message. Please try again later.",
        500
      )
    );
  }
});
