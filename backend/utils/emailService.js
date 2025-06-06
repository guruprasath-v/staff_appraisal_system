const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Create OAuth2 client
const createTransporter = async () => {
  try {
    // Verify required environment variables
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
      throw new Error('Missing required Gmail OAuth2 credentials');
    }

    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error('Error getting access token:', err);
          reject(new Error(`Failed to create access token: ${err.message}`));
        }
        resolve(token);
      });
    });

    if (!accessToken) {
      throw new Error('No access token received');
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        accessToken,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      },
      // Add timeout configuration
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      socketTimeout: 10000, // 10 seconds
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      debug: process.env.NODE_ENV === 'development' // Enable debug logs in development
    });

    // Verify transporter configuration with timeout
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transporter verification timeout')), 10000)
      )
    ]);
    
    console.log('Email transporter configured successfully');
    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  taskAssigned: (taskName, dueDate) => ({
    subject: 'New Task Assignment',
    html: `
      <h2>New Task Assignment</h2>
      <p>You have been assigned a new task:</p>
      <ul>
        <li><strong>Task Name:</strong> ${taskName}</li>
        <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Please log in to the Staff Appraisal System to view the complete details.</p>
      <p>Best regards,<br>Staff Appraisal System</p>
    `
  }),
  
  subtaskAssigned: (subtaskName, taskName, dueDate) => ({
    subject: 'New Subtask Assignment',
    html: `
      <h2>New Subtask Assignment</h2>
      <p>You have been assigned a new subtask:</p>
      <ul>
        <li><strong>Subtask Name:</strong> ${subtaskName}</li>
        <li><strong>Parent Task:</strong> ${taskName}</li>
        <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Please log in to the Staff Appraisal System to view the complete details.</p>
      <p>Best regards,<br>Staff Appraisal System</p>
    `
  }),

  testEmail: () => ({
    subject: 'Test Email from Staff Appraisal System',
    html: `
      <h2>Test Email</h2>
      <p>This is a test email to verify that the Gmail API integration is working correctly.</p>
      <p>If you're receiving this email, the setup was successful!</p>
      <p>Best regards,<br>Staff Appraisal System</p>
    `
  })
};

// Send email function with retry logic
const sendEmail = async (to, template, data = [], retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { subject, html } = emailTemplates[template](...data);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      // Create new transporter for each email
      const transporter = await createTransporter();
      
      // Send email with timeout
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email sending timeout')), 15000)
        )
      ]);
      
      console.log(`Email sent successfully to ${to}`, info.messageId);
      return true;
    } catch (error) {
      console.error(`Error sending email (attempt ${attempt}/${retries}):`, error);
      if (attempt === retries) {
        return false;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return false;
};

// Test function to verify email service
const testEmailService = async (to) => {
  try {
    const result = await sendEmail(to, 'testEmail');
    if (result) {
      console.log('Test email sent successfully!');
    } else {
      console.log('Failed to send test email.');
    }
    return result;
  } catch (error) {
    console.error('Error in test email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  testEmailService
}; 